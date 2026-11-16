/**
 * - `attack`: tracks the player and fires when lined up.
 * - `patrol`: defensive wandering between random waypoints, firing only on
 *   opportunity.
 * - `evade`: stepping out of the path of an incoming projectile.
 */
export type BotState = 'attack' | 'patrol' | 'evade';

/** A projectile heading toward the bot. */
export interface BotThreat {
    x: number;
    /** Vertical distance left before it reaches the bot. */
    distance: number;
}

/**
 * Snapshot of the fight as seen by the bot. Plain numbers only, so the
 * decision logic stays independent of Phaser objects.
 */
export interface BotPerception {
    time: number;
    selfX: number;
    selfHalfWidth: number;
    playerX: number;
    /** Player horizontal velocity in pixels per second. */
    playerVelocityX: number;
    /** Time a bot projectile needs to reach the player line. */
    projectileTravelMs: number;
    /** Horizontal speed of the bot, in pixels per second. */
    selfSpeed: number;
    /** Minimum delay between two shots of its weapon. */
    fireIntervalMs: number;
    /** False once its ammunition is spent: it then only avoids the player. */
    hasAmmunition: boolean;
    /** Every projectile coming at the bot, within its detection range. */
    threats: readonly BotThreat[];
    minX: number;
    maxX: number;
}

/** What the bot wants to do until its next decision. */
export interface BotIntent {
    /** Horizontal position to move toward. */
    targetX: number;
    fire: boolean;
}
