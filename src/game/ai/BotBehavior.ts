import type { BotConfig, DurationRange } from '../data/bots';
import type { BotIntent, BotPerception, BotState } from './BotState';

type Phase = 'attack' | 'patrol';

const WAYPOINT_REACHED_DISTANCE = 8;
//  Extra distance beyond the danger zone, so a dodge clearly leaves it
const DODGE_OVERSHOOT = 8;

/**
 * Decision logic of a hybrid bot: it alternates offensive and defensive
 * phases, and a dodge can interrupt either one. It only reads a BotPerception
 * and returns a BotIntent, so it has no dependency on Phaser.
 */
export class BotBehavior {

    private readonly config: BotConfig;
    private readonly random: () => number;

    private phase: Phase = 'attack';
    private phaseEndsAt = 0;
    private state: BotState = 'attack';
    private aimOffset = 0;
    private nextFireAt = 0;
    /** Signed gap between the bot and its aim point at the previous decision. */
    private previousAimGap: number | null = null;
    /** Side (-1 left, 1 right) of the aim point the bot waits on between shots. */
    private standoffSide: -1 | 1 = 1;
    /** Shot the caution roll was made for, so it is rolled once per shot. */
    private cautionRolledFor = -1;
    private isCautious = false;
    private waypointX: number | null = null;
    private waypointEndsAt = 0;
    private isDodging = false;
    private dodgeDecisionEndsAt = 0;

    constructor (config: BotConfig, random: () => number = Math.random)
    {
        this.config = config;
        this.random = random;
    }

    get currentState (): BotState
    {
        return this.state;
    }

    decide (perception: BotPerception): BotIntent
    {
        const aimX = this.getAimX(perception);
        const evadeX = this.getEvadeTarget(perception);

        if (evadeX !== null)
        {
            this.state = 'evade';

            //  Still takes its shot if it is lined up, so dodging never wastes a
            //  firing chance it has already moved in for
            return { targetX: evadeX, fire: this.shouldFire(perception, aimX) };
        }

        this.updatePhase(perception.time);
        this.state = this.phase;

        const targetX = this.phase === 'attack'
            ? this.getAttackTarget(perception, aimX)
            : this.getPatrolTarget(perception);

        return { targetX, fire: this.shouldFire(perception, aimX) };
    }

    private updatePhase (time: number): void
    {
        if (this.phaseEndsAt === 0)
        {
            //  First decision of the fight: open with an offensive phase, but
            //  hold fire for a moment instead of shooting the instant it starts
            this.phaseEndsAt = time + this.pick(this.config.attackPhaseMs);
            this.nextFireAt = time + this.pick(this.config.firstShotDelayMs);

            return;
        }

        if (time < this.phaseEndsAt)
        {
            return;
        }

        this.phase = this.phase === 'attack' ? 'patrol' : 'attack';
        this.phaseEndsAt = time + this.pick(
            this.phase === 'attack' ? this.config.attackPhaseMs : this.config.patrolPhaseMs
        );
        this.waypointX = null;
    }

    /** Horizontal distance under which a projectile would hit the bot. */
    private getDangerDistance (perception: BotPerception): number
    {
        return perception.selfHalfWidth + this.config.dodgeMargin;
    }

    /** True if a position is in the path of one of the incoming projectiles. */
    private isInLineOfFire (perception: BotPerception, x: number): boolean
    {
        const dangerDistance = this.getDangerDistance(perception);

        return perception.threats.some((threat) => Math.abs(threat.x - x) <= dangerDistance);
    }

    /** Where to stand to get out of the way of the incoming projectiles, if it reacts. */
    private getEvadeTarget (perception: BotPerception): number | null
    {
        const { threats, selfX, minX, maxX, time } = perception;

        if (!this.isInLineOfFire(perception, selfX))
        {
            return null;
        }

        //  One roll per commit window, not per decision: otherwise a bot with a
        //  low dodge chance would still end up dodging almost every projectile.
        if (time >= this.dodgeDecisionEndsAt)
        {
            this.isDodging = this.random() < this.config.dodgeChance;
            this.dodgeDecisionEndsAt = time + this.config.dodgeCommitMs;
        }

        if (!this.isDodging)
        {
            return null;
        }

        //  Candidate spots just outside the path of each projectile; keep the
        //  closest one that is in bounds and clear of every other projectile
        const escapeDistance = this.getDangerDistance(perception) + DODGE_OVERSHOOT;
        const candidates = threats
            .flatMap((threat) => [threat.x - escapeDistance, threat.x + escapeDistance])
            .filter((x) => x >= minX && x <= maxX && !this.isInLineOfFire(perception, x))
            .sort((a, b) => Math.abs(a - selfX) - Math.abs(b - selfX));

        return candidates[0] ?? null;
    }

    /** Aim point: the player, partly led according to its movement, plus an error. */
    private getAimX (perception: BotPerception): number
    {
        const lead = perception.playerVelocityX
            * (perception.projectileTravelMs / 1000)
            * this.config.anticipation;
        const aimX = perception.playerX + lead + this.aimOffset;

        return Math.max(perception.minX, Math.min(perception.maxX, aimX));
    }

    /**
     * Offensive positioning: the bot waits beside the line of fire of the player
     * and only lines up when its next shot is about to be ready, leaving itself
     * just enough time to get there. Firing pushes the next shot back, so it
     * breaks away again right after shooting.
     */
    private getAttackTarget (perception: BotPerception, aimX: number): number
    {
        const { standoffDistance } = this.config;
        const timeToClose = (standoffDistance / perception.selfSpeed) * 1000;
        const shotIsComing = perception.hasAmmunition && perception.time >= this.nextFireAt - timeToClose;

        if (standoffDistance <= 0)
        {
            return aimX;
        }

        if (shotIsComing && !this.shouldWaitForOpening(perception, aimX))
        {
            return aimX;
        }

        //  Stay on the side it is already on, so it does not cross the line of fire
        const gap = perception.selfX - aimX;

        if (Math.abs(gap) > this.config.fireAlignment)
        {
            this.standoffSide = gap < 0 ? -1 : 1;
        }

        const preferredX = aimX + (this.standoffSide * standoffDistance);

        //  Against a wall, wait on the other side instead
        if (preferredX < perception.minX || preferredX > perception.maxX)
        {
            this.standoffSide = this.standoffSide === 1 ? -1 : 1;

            return aimX + (this.standoffSide * standoffDistance);
        }

        return preferredX;
    }

    /**
     * A cautious bot does not move into a firing spot that shots are about to
     * cross: it waits beside it for a gap. There is no time limit: ammunition
     * and the fight timer are limited, so a player firing nonstop only wastes
     * shots.
     */
    private shouldWaitForOpening (perception: BotPerception, aimX: number): boolean
    {
        if (this.cautionRolledFor !== this.nextFireAt)
        {
            this.cautionRolledFor = this.nextFireAt;
            this.isCautious = this.random() < this.config.caution;
        }

        return this.isCautious && this.isInLineOfFire(perception, aimX);
    }

    private getPatrolTarget (perception: BotPerception): number
    {
        const { time, selfX, minX, maxX } = perception;
        const needsWaypoint = this.waypointX === null
            || time >= this.waypointEndsAt
            || Math.abs(selfX - this.waypointX) <= WAYPOINT_REACHED_DISTANCE;

        if (needsWaypoint)
        {
            this.waypointX = minX + (this.random() * (maxX - minX));
            this.waypointEndsAt = time + this.pick(this.config.waypointMs);
        }

        return this.waypointX ?? selfX;
    }

    private shouldFire (perception: BotPerception, aimX: number): boolean
    {
        const aimGap = perception.selfX - aimX;
        const previousGap = this.previousAimGap;

        this.previousAimGap = aimGap;

        //  Against a strafing player the aim point moves fast and can sweep past
        //  the bot between two decisions: crossing it counts as lined up, or a
        //  bot that anticipates a lot would almost never get a chance to fire.
        const swept = previousGap !== null && Math.sign(previousGap) !== Math.sign(aimGap);
        const isAligned = Math.abs(aimGap) <= this.config.fireAlignment || swept;

        if (!isAligned || !perception.hasAmmunition || perception.time < this.nextFireAt)
        {
            return false;
        }

        //  The next shot waits for the weapon cooldown plus a human-like hesitation
        this.nextFireAt = perception.time + perception.fireIntervalMs + this.pick(this.config.fireHesitationMs);
        //  A new aiming error for the next shot, so misses are not all alike
        this.aimOffset = ((this.random() * 2) - 1) * this.config.aimError;

        return true;
    }

    private pick (range: DurationRange): number
    {
        return range[0] + (this.random() * (range[1] - range[0]));
    }

}
