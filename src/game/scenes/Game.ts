import { BlendModes, Scene, Scenes } from 'phaser';
import { BotController } from '../ai/BotController';
import { ARENA, GAME_HEIGHT, GAME_WIDTH, TEXTURES } from '../config/constants';
import { Enemy } from '../entities/Enemy';
import type { Fighter } from '../entities/Fighter';
import { Player } from '../entities/Player';
import { getActiveMode } from '../modes/activeMode';
import type { FightSetup } from '../modes/GameMode';
import { AMMUNITION_EVENTS } from '../systems/Ammunition';
import { audioManager } from '../systems/AudioManager';
import { COMBAT_EVENTS, CombatSystem } from '../systems/CombatSystem';
import { skinManager } from '../systems/SkinManager';
import type { DuelOutcome, DuelResult } from '../types/duel';
import { createSpaceBackdrop } from '../ui/Background';
import { createExplosionEmitter, spawnExplosion, spawnFloatingText } from '../ui/effects';
import { FighterAura } from '../ui/FighterAura';
import { ProjectileTrail } from '../ui/ProjectileTrail';
import { Hud } from '../ui/Hud';
import { saveManager } from '../systems/SaveManager';
import type { DialogueData, DialogueLineView, DialogueResumeData } from './Dialogue';
import type { Dialogue, DialogueLine } from '../data/dialogues';

const HIT_FLASH_MS = 90;
const KO_EXPLOSION_PARTICLES = 30;

/**
 * Duel scene: it builds the arena and wires the systems together (input,
 * combat, UI, effects). The combat rules live in CombatSystem.
 */
export class Game extends Scene {

    private player!: Player;
    private enemy!: Enemy;
    private combat!: CombatSystem;
    private bot!: BotController;
    private hud!: Hud;
    private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private fight!: FightSetup;
    private selectedSkinId = '';
    private durationMs = 0;
    private isOver = false;
    /** Dialogue being played over the paused fight, and what to do once it ends. */
    private pendingDialogue?: { dialogue: Dialogue; onComplete: () => void };

    constructor ()
    {
        super('Game');
    }

    create (): void
    {
        this.durationMs = 0;
        this.isOver = false;

        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

        createSpaceBackdrop(this, {
            imageAlpha: 0.42,
            overlayAlpha: 0.16,
            nebulaAlpha: 0.55
        });

        const skin = skinManager.selectedSkin;
        const fight = getActiveMode().getFightSetup();

        this.fight = fight;
        this.selectedSkinId = skin.id;
        this.player = new Player(this, GAME_WIDTH / 2, ARENA.playerY, fight.player, skin);
        this.enemy = new Enemy(this, GAME_WIDTH / 2, ARENA.enemyY, fight.opponent, fight.opponentVisual);

        if (fight.opponentAura)
        {
            new FighterAura(this, this.enemy, fight.opponentAura);
        }

        this.combat = new CombatSystem(this, this.player, this.enemy);
        this.bot = new BotController(this.enemy, this.player, this.combat, fight.bot);

        if (fight.opponentAura?.projectileTrail)
        {
            new ProjectileTrail(this, this.combat, this.enemy.side, fight.opponentAura.projectileTrail);
        }

        this.hud = new Hud(this, this.player, this.enemy, `${fight.label}  •  ${fight.detail.toUpperCase()}`);
        this.explosionEmitter = createExplosionEmitter(this);
        //  Shown from the start, so the timer is not blank during an intro dialogue
        this.hud.setTimeLeft(fight.timeLimitMs);

        this.combat.on(COMBAT_EVENTS.fired, this.handleFired, this);
        this.combat.on(COMBAT_EVENTS.hit, this.handleHit, this);
        this.player.ammunition.on(AMMUNITION_EVENTS.changed, this.handlePlayerAmmunition, this);

        this.input.keyboard?.on('keydown-ESC', this.openPause, this);
        this.input.keyboard?.on('keydown-P', this.openPause, this);
        this.events.on(Scenes.Events.RESUME, this.handleResume, this);
        this.events.once(Scenes.Events.SHUTDOWN, this.handleShutdown, this);

        this.playDialogue(this.fight.introDialogue, () => this.startFight());
    }

    /**
     * Plays a story dialogue over the paused arena, the first time it is
     * reached only, then runs `onComplete`. Without a dialogue to play,
     * `onComplete` runs right away.
     */
    private playDialogue (dialogue: Dialogue | undefined, onComplete: () => void): void
    {
        if (!dialogue || saveManager.hasSeenDialogue(dialogue.id))
        {
            onComplete();

            return;
        }

        const data: DialogueData = {
            lines: dialogue.lines.map((line) => this.toLineView(line)),
            returnTo: this.scene.key
        };

        this.pendingDialogue = { dialogue, onComplete };
        this.scene.launch('Dialogue', data);
        this.scene.pause();
    }

    /**
     * Resolves a speaker to what the dialogue box shows: a name and a portrait.
     * Portraits use the idle pose, so a fighter caught in its fire pose (or
     * hidden after a KO) still shows up properly.
     */
    private toLineView (line: DialogueLine): DialogueLineView
    {
        switch (line.speaker)
        {
            case 'player':
                return { ...line, name: 'You', portraitKey: skinManager.selectedSkin.textureKey };
            case 'opponent':
                return { ...line, name: this.enemy.character.name, portraitKey: this.fight.opponentVisual.textureKey };
            default:
                return { ...line };
        }
    }

    private startFight (): void
    {
        this.hud.showBanner(this.fight.label, `Face ${this.enemy.character.name}  •  ${this.fight.detail}`);
    }

    update (_time: number, delta: number): void
    {
        if (this.isOver)
        {
            return;
        }

        this.durationMs += delta;
        this.hud.setTimeLeft(this.fight.timeLimitMs - this.durationMs);

        if (this.player.handleInput())
        {
            this.combat.fire(this.player);
        }

        this.bot.update(this.time.now);

        const outcome = this.combat.getOutcome()
            ?? (this.durationMs >= this.fight.timeLimitMs ? this.combat.decideOnHealth('time') : null);

        if (outcome)
        {
            this.finishDuel(outcome);
        }
    }

    private handleFired (shooter: Fighter): void
    {
        const flash = this.add.image(shooter.x, shooter.muzzleY, TEXTURES.glow)
            .setTint(shooter.projectile.color)
            .setBlendMode(BlendModes.ADD)
            .setAlpha(0.95)
            .setScale(0.3)
            .setDepth(6);

        this.tweens.add({
            targets: flash,
            scale: 0.95,
            alpha: 0,
            duration: 150,
            onComplete: () => flash.destroy()
        });

        audioManager.playShoot();
    }

    private handleHit (target: Fighter, damage: number, x: number, y: number): void
    {
        spawnExplosion(this, this.explosionEmitter, x, y, 0xffa94d, 12);
        spawnFloatingText(this, target.x, target.y - (target.displayHeight / 2), `-${damage}`, '#fca5a5');
        audioManager.playExplosion();
        this.cameras.main.shake(70, 0.0025);

        target.setTintFill(0xffffff);
        this.time.delayedCall(HIT_FLASH_MS, () => target.clearTint());
    }

    private handlePlayerAmmunition (current: number): void
    {
        if (current === 0 && !this.isOver)
        {
            this.hud.showBanner('OUT OF AMMO', 'You can no longer fire', 0xf87171);
        }
    }

    private finishDuel (outcome: DuelOutcome): void
    {
        this.isOver = true;
        this.player.move(0);
        this.enemy.move(0);
        this.combat.clearProjectiles();

        const playerWon = outcome.winner === 'player';
        const loser = playerWon ? this.enemy : this.player;

        if (outcome.reason === 'ko')
        {
            spawnExplosion(this, this.explosionEmitter, loser.x, loser.y, 0xff6b6b, KO_EXPLOSION_PARTICLES);
            loser.disableBody(true, true);
            this.cameras.main.shake(260, 0.01);
        }

        this.cameras.main.flash(200, playerWon ? 56 : 255, playerWon ? 189 : 60, playerWon ? 248 : 60);

        const result: DuelResult = {
            ...outcome,
            fightLabel: this.fight.label,
            enemyName: this.enemy.character.name,
            playerHealth: this.player.health.current,
            playerMaxHealth: this.player.health.max,
            enemyHealth: this.enemy.health.current,
            enemyMaxHealth: this.enemy.health.max,
            durationMs: Math.min(this.durationMs, this.fight.timeLimitMs)
        };

        const fightOutcome = getActiveMode().completeFight(result);

        this.time.delayedCall(ARENA.endDelayMs, () => {
            if (fightOutcome.resolution === 'lost')
            {
                this.scene.start('GameOver', result);

                return;
            }

            //  A won fight may close a chapter of the story before its result screen
            this.playDialogue(this.fight.outroDialogue, () => {
                this.scene.start('Victory', { result, outcome: fightOutcome });
            });
        });
    }

    private openPause (): void
    {
        if (this.isOver || this.scene.isActive('Pause') || this.scene.isActive('SkinSelect')
            || this.scene.isActive('Dialogue'))
        {
            return;
        }

        this.scene.launch('Pause');
        this.scene.pause();
    }

    /**
     * Resumed after a dialogue: starts the fight. Resumed after a pause:
     * applies the skin if it was changed meanwhile.
     */
    private handleResume (_systems: Scenes.Systems, data?: Partial<DialogueResumeData>): void
    {
        if (data?.dialogueComplete)
        {
            const pending = this.pendingDialogue;

            this.pendingDialogue = undefined;

            //  Keys pressed to read the dialogue must not leak into the fight
            this.input.keyboard?.resetKeys();

            if (pending)
            {
                saveManager.markDialogueSeen(pending.dialogue.id);
                pending.onComplete();
            }

            return;
        }

        const skin = skinManager.selectedSkin;

        if (skin.id === this.selectedSkinId)
        {
            return;
        }

        this.selectedSkinId = skin.id;
        this.player.setVisual(skin);
        this.hud.showBanner('SKIN EQUIPPED', skin.name, 0xfbbf24);
    }

    private handleShutdown (): void
    {
        this.events.off(Scenes.Events.RESUME, this.handleResume, this);
        this.combat.removeAllListeners();
        this.player.health.removeAllListeners();
        this.player.ammunition.removeAllListeners();
        this.enemy.health.removeAllListeners();
        this.enemy.ammunition.removeAllListeners();
    }

}
