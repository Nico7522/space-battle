import type { BotConfig } from '../data/bots';
import type { CharacterConfig } from '../data/characters';
import type { SpriteVisual } from '../data/skins';
import type { DuelResult } from '../types/duel';

/** Everything the Game scene needs to set up one fight. */
export interface FightSetup {
    /** Short label of the fight, e.g. "LEVEL 1". */
    label: string;
    /** Extra information shown with the label, e.g. the difficulty. */
    detail: string;
    player: CharacterConfig;
    opponent: CharacterConfig;
    opponentVisual: SpriteVisual;
    bot: BotConfig;
    /** Fight duration; when it runs out, the fighter with the fewer HP loses. */
    timeLimitMs: number;
}

/**
 * - `won`: fight won, another fight follows.
 * - `lost`: fight lost, it can be retried.
 * - `completed`: the last fight of the mode is won.
 */
export type FightResolution = 'won' | 'lost' | 'completed';

/** What the mode decides after a fight, and how to present it. */
export interface FightOutcome {
    resolution: FightResolution;
    /**
     * Title replacing the plain "VICTORY" when a fight closes a part of the
     * mode, e.g. the last level of a campaign stage.
     */
    milestoneTitle?: string;
    /** Label of the button leading to the next fight, e.g. "NEXT LEVEL". */
    nextFightLabel?: string;
}

/**
 * Contract shared by every game mode. A mode owns its own rules and
 * progression; the combat itself is handled by the shared systems.
 */
export interface GameMode {
    readonly id: string;
    readonly name: string;
    /** Starts the mode from its first fight. */
    start (): void;
    /** Setup of the current fight. */
    getFightSetup (): FightSetup;
    /** Records the result of the current fight and tells what comes next. */
    completeFight (result: DuelResult): FightOutcome;
    /** Moves on to the next fight, after a `won` resolution. */
    advance (): void;
}
