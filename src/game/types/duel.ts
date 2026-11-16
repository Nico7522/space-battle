export type FighterSide = 'player' | 'enemy';

/**
 * `ko`: a fighter is at 0 HP. `ammunition`: nobody can fire anymore.
 * `time`: the time limit of the fight is over.
 */
export type DuelEndReason = 'ko' | 'ammunition' | 'time';

export interface DuelOutcome {
    winner: FighterSide;
    reason: DuelEndReason;
}

export interface DuelResult extends DuelOutcome {
    /** Label of the fight in its game mode, e.g. "LEVEL 1". */
    fightLabel: string;
    enemyName: string;
    playerHealth: number;
    playerMaxHealth: number;
    enemyHealth: number;
    enemyMaxHealth: number;
    durationMs: number;
}
