import type { Physics } from 'phaser';
import { GAME_WIDTH } from '../config/constants';
import type { BotConfig } from '../data/bots';
import type { Fighter } from '../entities/Fighter';
import type { CombatSystem } from '../systems/CombatSystem';
import { BotBehavior } from './BotBehavior';
import type { BotPerception } from './BotState';

//  Within this distance of its target the bot stops, instead of jittering around it
const ARRIVAL_DISTANCE = 4;

/**
 * Links a bot to the fight: it observes the game, asks the behavior for a
 * decision at the reaction rate of the bot, and makes the fighter carry it
 * out. Decisions are not taken every frame, which keeps the AI cheap and
 * gives the bot a human-like reaction time.
 */
export class BotController {

    private readonly bot: Fighter;
    private readonly opponent: Fighter;
    private readonly combat: CombatSystem;
    private readonly config: BotConfig;
    private readonly behavior: BotBehavior;

    private nextDecisionAt = 0;
    private targetX: number;

    constructor (bot: Fighter, opponent: Fighter, combat: CombatSystem, config: BotConfig)
    {
        this.bot = bot;
        this.opponent = opponent;
        this.combat = combat;
        this.config = config;
        this.behavior = new BotBehavior(config);
        this.targetX = bot.x;
    }

    /** `time` must be the scene clock, so the bot freezes while the scene is paused. */
    update (time: number): void
    {
        if (time >= this.nextDecisionAt)
        {
            this.nextDecisionAt = time + this.config.reactionMs;

            const intent = this.behavior.decide(this.perceive(time));

            this.targetX = intent.targetX;

            if (intent.fire)
            {
                this.combat.fire(this.bot);
            }
        }

        this.steer();
    }

    private perceive (time: number): BotPerception
    {
        const halfWidth = this.bot.displayWidth / 2;
        const opponentBody = this.opponent.body as Physics.Arcade.Body;
        const incoming = this.combat.findIncomingProjectiles(this.bot, this.config.dodgeDetectionRange);
        const projectileSpeed = this.bot.character.projectile.speed;

        return {
            time,
            selfX: this.bot.x,
            selfHalfWidth: this.bot.character.hitbox.width / 2,
            playerX: this.opponent.x,
            playerVelocityX: opponentBody.velocity.x,
            projectileTravelMs: (Math.abs(this.opponent.y - this.bot.y) / projectileSpeed) * 1000,
            selfSpeed: this.bot.character.speed,
            fireIntervalMs: this.bot.character.fireIntervalMs,
            hasAmmunition: !this.bot.ammunition.isEmpty,
            threats: incoming.map((projectile) => ({
                x: projectile.x,
                distance: Math.abs(projectile.y - this.bot.y)
            })),
            minX: halfWidth,
            maxX: GAME_WIDTH - halfWidth
        };
    }

    private steer (): void
    {
        const offset = this.targetX - this.bot.x;

        if (Math.abs(offset) <= ARRIVAL_DISTANCE)
        {
            this.bot.move(0);

            return;
        }

        this.bot.move(offset < 0 ? -1 : 1);
    }

}
