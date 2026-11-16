import {
    SORCERER_SPACE_AURA_LEVEL_2,
    SORCERER_SPACE_AURA_LEVEL_3,
    SORCERER_SPACE_AURA_LEVEL_4,
    SORCERER_SPACE_AURA_LEVEL_5
} from './auras';
import type { AuraConfig } from './auras';
import { SORCERER_SPACE_BOT } from './bots';
import type { BotConfig } from './bots';
import { SORCERER_SPACE, SORCERER_SPACE_MAX_POWER_VISUAL, SORCERER_SPACE_VISUAL } from './characters';
import type { CharacterConfig } from './characters';
import { STAGE_1_INTRO, STAGE_1_OUTRO } from './dialogues';
import type { Dialogue } from './dialogues';
import type { SpriteVisual } from './skins';

/** Combat stats a level may change for a fighter, without touching the base character. */
export interface FighterOverrides {
    speed?: number;
    ammunition?: number;
    fireIntervalMs?: number;
    /** Damage dealt by each of its projectiles. */
    damage?: number;
    /** Speed of its projectiles, in pixels per second. */
    projectileSpeed?: number;
}

export interface LevelOpponent {
    character: CharacterConfig;
    visual: SpriteVisual;
    bot: BotConfig;
    /** Visual effect showing how strong the opponent is in this level. */
    aura?: AuraConfig;
}

export interface CampaignLevel {
    number: number;
    /** Difficulty label shown to the player. */
    difficulty: string;
    opponent: LevelOpponent;
    /** Optional adjustments of the player stats for this level. */
    player?: FighterOverrides;
    /** Fight duration for this level, if different from the campaign default. */
    timeLimitMs?: number;
    /** Story dialogue shown before the fight, each time the level is played. */
    introDialogue?: Dialogue;
    /** Story dialogue shown each time the fight is won, before the result screen. */
    outroDialogue?: Dialogue;
}

/**
 * A campaign stage: one opponent faced over a series of levels of increasing
 * difficulty. Stages are played in order, each one unlocking the next.
 */
export interface CampaignStage {
    /** Stable identifier used by the save; never reuse or rename it. */
    id: string;
    number: number;
    /** Opponent of the stage, shown in the menus. */
    opponentName: string;
    levels: readonly CampaignLevel[];
}

/** Default duration of a campaign fight. */
export const CAMPAIGN_TIME_LIMIT_MS = 60_000;

/** Applies level overrides to a base character, returning a new configuration. */
export const withOverrides = (character: CharacterConfig, overrides: FighterOverrides = {}): CharacterConfig => {
    const { damage, projectileSpeed, ...stats } = overrides;

    return {
        ...character,
        ...stats,
        projectile: {
            ...character.projectile,
            damage: damage ?? character.projectile.damage,
            speed: projectileSpeed ?? character.projectile.speed
        }
    };
};

/** Stage 1: five fights against Sorcerer Space. */
const SORCERER_SPACE_LEVELS: readonly CampaignLevel[] = [
    {
        //  Level 1 still teaches the basics, but no longer lets the player win
        //  by simply strafing: it starts to anticipate, waits beside the line of
        //  fire between its shots and its orbs travel faster
        number: 1,
        difficulty: 'Easy',
        introDialogue: STAGE_1_INTRO,
        opponent: {
            character: withOverrides(SORCERER_SPACE, {
                speed: 195,
                ammunition: 34,
                fireIntervalMs: 1000,
                damage: 10,
                projectileSpeed: 460
            }),
            visual: SORCERER_SPACE_VISUAL,
            bot: {
                ...SORCERER_SPACE_BOT,
                reactionMs: 280,
                aimError: 55,
                anticipation: 0.15,
                standoffDistance: 40,
                caution: 0.2,
                firstShotDelayMs: [1800, 2800],
                fireHesitationMs: [450, 1100],
                dodgeChance: 0.3,
                dodgeDetectionRange: 250,
                attackPhaseMs: [2200, 3800],
                patrolPhaseMs: [1800, 3200]
            }
        }
    },
    {
        //  Level 2 leads its shots clearly and fires more often: staying in one
        //  place is now punished
        number: 2,
        difficulty: 'Easy to Medium',
        opponent: {
            aura: SORCERER_SPACE_AURA_LEVEL_2,
            character: withOverrides(SORCERER_SPACE, {
                speed: 220,
                ammunition: 38,
                fireIntervalMs: 800,
                damage: 10,
                projectileSpeed: 520
            }),
            visual: SORCERER_SPACE_VISUAL,
            bot: {
                ...SORCERER_SPACE_BOT,
                reactionMs: 250,
                aimError: 45,
                anticipation: 0.35,
                standoffDistance: 80,
                caution: 0.45,
                firstShotDelayMs: [1600, 2600],
                fireHesitationMs: [250, 800],
                dodgeChance: 0.42,
                dodgeDetectionRange: 280,
                attackPhaseMs: [2400, 4000],
                patrolPhaseMs: [1600, 3000]
            }
        }
    },
    {
        //  Level 3 hits harder (a KO in 10 hits with less margin), reacts quickly
        //  and dodges more than every other projectile
        number: 3,
        difficulty: 'Medium',
        opponent: {
            aura: SORCERER_SPACE_AURA_LEVEL_3,
            character: withOverrides(SORCERER_SPACE, {
                speed: 245,
                ammunition: 42,
                fireIntervalMs: 680,
                damage: 11,
                projectileSpeed: 580
            }),
            visual: SORCERER_SPACE_VISUAL,
            bot: {
                ...SORCERER_SPACE_BOT,
                reactionMs: 215,
                aimError: 36,
                anticipation: 0.55,
                standoffDistance: 120,
                caution: 0.65,
                firstShotDelayMs: [1300, 2200],
                fireHesitationMs: [150, 600],
                dodgeChance: 0.55,
                dodgeDetectionRange: 320,
                attackPhaseMs: [2800, 4500],
                patrolPhaseMs: [1300, 2500]
            }
        }
    },
    {
        //  Level 4: fast orbs, strong anticipation and a KO in 9 hits; it waits
        //  for gaps in the fire of the player most of the time
        number: 4,
        difficulty: 'Hard',
        opponent: {
            aura: SORCERER_SPACE_AURA_LEVEL_4,
            character: withOverrides(SORCERER_SPACE, {
                speed: 270,
                ammunition: 46,
                fireIntervalMs: 580,
                damage: 12,
                projectileSpeed: 640
            }),
            visual: SORCERER_SPACE_VISUAL,
            bot: {
                ...SORCERER_SPACE_BOT,
                reactionMs: 185,
                aimError: 28,
                anticipation: 0.7,
                standoffDistance: 150,
                caution: 0.8,
                firstShotDelayMs: [1100, 1800],
                fireHesitationMs: [100, 450],
                dodgeChance: 0.65,
                dodgeDetectionRange: 360,
                attackPhaseMs: [3000, 5000],
                patrolPhaseMs: [1000, 2000]
            }
        }
    },
    {
        //  Level 5 is the final challenge: a KO in 8 hits, orbs almost as fast as
        //  the laser of the player, and it stays on the attack. Its aim error and
        //  dodge chance stay below perfect, so it can still be beaten.
        number: 5,
        difficulty: 'Very Hard',
        outroDialogue: STAGE_1_OUTRO,
        opponent: {
            aura: SORCERER_SPACE_AURA_LEVEL_5,
            character: withOverrides(SORCERER_SPACE, {
                speed: 300,
                ammunition: 50,
                fireIntervalMs: 500,
                damage: 13,
                projectileSpeed: 700
            }),
            visual: SORCERER_SPACE_MAX_POWER_VISUAL,
            bot: {
                ...SORCERER_SPACE_BOT,
                reactionMs: 160,
                aimError: 22,
                anticipation: 0.85,
                standoffDistance: 180,
                caution: 0.9,
                firstShotDelayMs: [900, 1500],
                fireHesitationMs: [80, 320],
                dodgeChance: 0.72,
                dodgeDetectionRange: 400,
                attackPhaseMs: [3200, 5500],
                patrolPhaseMs: [800, 1600]
            }
        }
    }
];

/** Campaign stages, in order. Stage 2 and the following ones are still to be designed. */
export const CAMPAIGN_STAGES: readonly CampaignStage[] = [
    {
        id: 'stage-1',
        number: 1,
        opponentName: SORCERER_SPACE.name,
        levels: SORCERER_SPACE_LEVELS
    }
];
