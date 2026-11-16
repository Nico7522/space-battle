import { Physics } from 'phaser';
import type { Scene } from 'phaser';
import type { CharacterConfig } from '../data/characters';
import type { ProjectileConfig } from '../data/projectiles';
import type { SpriteVisual } from '../data/skins';
import { Ammunition } from '../systems/Ammunition';
import { Health } from '../systems/Health';
import type { FighterSide } from '../types/duel';
import { showIdlePose } from '../ui/spriteVisual';

const FIGHTER_DEPTH = 10;

/**
 * Arena fighter: rendering, horizontal movement and fire requests.
 * It decides nothing: its actions come from the keyboard (Player) or the AI
 * (Enemy), and the combat rules are enforced by the CombatSystem.
 */
export class Fighter extends Physics.Arcade.Sprite {

    readonly side: FighterSide;
    readonly character: CharacterConfig;
    readonly health: Health;
    readonly ammunition: Ammunition;

    private visual: SpriteVisual;
    private firePoseTimer: Phaser.Time.TimerEvent | null = null;
    private nextFireTime = 0;

    constructor (
        scene: Scene,
        x: number,
        y: number,
        side: FighterSide,
        character: CharacterConfig,
        visual: SpriteVisual
    )
    {
        super(scene, x, y, visual.textureKey);

        this.side = side;
        this.character = character;
        this.visual = visual;
        this.health = new Health(character.maxHealth);
        this.ammunition = new Ammunition(character.ammunition);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(FIGHTER_DEPTH);
        this.setCollideWorldBounds(true);

        const body = this.body as Physics.Arcade.Body;

        body.setAllowGravity(false);
        body.setSize(character.hitbox.width, character.hitbox.height, true);

        showIdlePose(this, visual);
    }

    /**
     * Projectile it fires: the stats (damage, speed, hitbox) always come from
     * the character, while the look may come from its visual (e.g. a skin).
     */
    get projectile (): ProjectileConfig
    {
        return { ...this.character.projectile, ...this.visual.projectileAppearance };
    }

    /** The player fires upward (-1), the opponent downward (+1). */
    get fireDirection (): -1 | 1
    {
        return this.side === 'player' ? -1 : 1;
    }

    /** Where projectiles spawn: the edge of the sprite facing the other fighter. */
    get muzzleY (): number
    {
        return this.y + (this.fireDirection * this.displayHeight) / 2;
    }

    setVisual (visual: SpriteVisual): void
    {
        this.visual = visual;
        this.clearFirePose();
        showIdlePose(this, visual);
    }

    /** direction: -1 left, 1 right, 0 stopped. */
    move (direction: -1 | 0 | 1): void
    {
        const body = this.body as Physics.Arcade.Body;

        body.setVelocity(direction * this.character.speed, 0);
    }

    /**
     * Attempts a shot: refused if the fighter is out of the fight, if the fire
     * rate is not respected or if the reserve is empty. Consumes one round.
     */
    tryFire (): boolean
    {
        const now = this.scene.time.now;

        if (this.health.isDepleted || now < this.nextFireTime || !this.ammunition.consume())
        {
            return false;
        }

        this.nextFireTime = now + this.character.fireIntervalMs;
        this.playFirePose();

        return true;
    }

    private playFirePose (): void
    {
        const pose = this.visual.firePose;

        if (!pose)
        {
            return;
        }

        this.anims.stop();
        this.setTexture(pose.textureKey);
        this.firePoseTimer?.remove(false);

        this.firePoseTimer = this.scene.time.delayedCall(pose.durationMs, () => {
            this.firePoseTimer = null;
            showIdlePose(this, this.visual);
        });
    }

    private clearFirePose (): void
    {
        this.firePoseTimer?.remove(false);
        this.firePoseTimer = null;
    }

}
