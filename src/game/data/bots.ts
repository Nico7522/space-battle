/** Inclusive range, in milliseconds, from which a random duration is drawn. */
export type DurationRange = readonly [min: number, max: number];

/**
 * Behavior settings of an AI opponent, independent of its combat stats
 * (health, speed, ammunition live in CharacterConfig).
 */
export interface BotConfig {
    /** Delay between two decisions: the higher, the slower the bot reacts. */
    reactionMs: number;
    /** Maximum random horizontal error, in pixels, added to its aim. */
    aimError: number;
    /** 0 = aims at the current player position, 1 = fully leads its movement. */
    anticipation: number;
    /** Fires when within this many pixels of its aim point. */
    fireAlignment: number;
    /**
     * While its next shot is not ready, the bot keeps this horizontal distance
     * from its aim point instead of hovering in the line of fire of the player.
     * It moves in only when the shot is about to be ready, then backs off again
     * after firing. 0 = always stays lined up with the player.
     */
    standoffDistance: number;
    /** Wait before the first shot of the fight, so the player has time to settle in. */
    firstShotDelayMs: DurationRange;
    /** Extra random wait between two shots, added to the weapon fire rate. */
    fireHesitationMs: DurationRange;
    /** Probability (0 to 1) of reacting to a projectile coming at it. */
    dodgeChance: number;
    /** Vertical distance, in pixels, at which incoming projectiles are noticed. */
    dodgeDetectionRange: number;
    /** Safety distance, in pixels, kept from the path of a dodged projectile. */
    dodgeMargin: number;
    /** How long a dodge-or-ignore decision holds before being rolled again. */
    dodgeCommitMs: number;
    /**
     * Probability (0 to 1) that, when its shot is ready, the bot waits for a
     * gap in the fire of the player instead of moving into incoming shots.
     */
    caution: number;
    /** Duration of offensive phases (tracking the player). */
    attackPhaseMs: DurationRange;
    /** Duration of defensive phases (wandering). */
    patrolPhaseMs: DurationRange;
    /** How long a patrol waypoint is kept before picking a new one. */
    waypointMs: DurationRange;
}

/** Baseline behavior of Sorcerer Space. Campaign levels will tune these values. */
export const SORCERER_SPACE_BOT: BotConfig = {
    reactionMs: 220,
    aimError: 40,
    anticipation: 0.3,
    fireAlignment: 30,
    standoffDistance: 80,
    firstShotDelayMs: [1500, 2500],
    fireHesitationMs: [200, 900],
    dodgeChance: 0.5,
    dodgeDetectionRange: 300,
    dodgeMargin: 14,
    dodgeCommitMs: 300,
    caution: 0.5,
    attackPhaseMs: [2500, 4500],
    patrolPhaseMs: [1500, 3000],
    waypointMs: [700, 1600]
};
