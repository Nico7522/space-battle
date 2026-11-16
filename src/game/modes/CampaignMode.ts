import { PLAYER_CHARACTER } from '../data/characters';
import { CAMPAIGN_STAGES, CAMPAIGN_TIME_LIMIT_MS, withOverrides } from '../data/levels';
import type { CampaignLevel, CampaignStage } from '../data/levels';
import { saveManager } from '../systems/SaveManager';
import type { DuelResult } from '../types/duel';
import type { FightOutcome, FightSetup, GameMode } from './GameMode';

/** A level of the campaign, identified by its stage and its number in that stage (both 1-based). */
export interface CampaignPosition {
    stageNumber: number;
    levelNumber: number;
}

/**
 * Campaign: stages played in order, each one a series of levels against the
 * same opponent. Winning every level of a stage unlocks the next stage. Each
 * fight starts with full health and ammunition (GAME_SPEC §7.4).
 */
export class CampaignMode implements GameMode {

    readonly id = 'campaign';
    readonly name = 'Campaign';

    private stageIndex = 0;
    private levelIndex = 0;

    get stage (): CampaignStage
    {
        return CAMPAIGN_STAGES[this.stageIndex];
    }

    get level (): CampaignLevel
    {
        return this.stage.levels[this.levelIndex];
    }

    get stages (): readonly CampaignStage[]
    {
        return CAMPAIGN_STAGES;
    }

    private get isLastLevelOfStage (): boolean
    {
        return this.levelIndex >= this.stage.levels.length - 1;
    }

    private get isLastStage (): boolean
    {
        return this.stageIndex >= CAMPAIGN_STAGES.length - 1;
    }

    /** Levels won in a stage, within its existing levels. */
    getCompletedLevelCount (stage: CampaignStage): number
    {
        return Math.min(saveManager.getCampaignStageProgress(stage.id), stage.levels.length);
    }

    isStageCompleted (stage: CampaignStage): boolean
    {
        return this.getCompletedLevelCount(stage) >= stage.levels.length;
    }

    /** The first stage is always open; the others open once the previous one is completed. */
    isStageUnlocked (stage: CampaignStage): boolean
    {
        const index = CAMPAIGN_STAGES.indexOf(stage);

        return index <= 0 || this.isStageCompleted(CAMPAIGN_STAGES[index - 1]);
    }

    isLevelCompleted (stage: CampaignStage, levelNumber: number): boolean
    {
        return levelNumber <= this.getCompletedLevelCount(stage);
    }

    /** A level can be played once its stage is open and every level before it is won. */
    isLevelUnlocked (stage: CampaignStage, levelNumber: number): boolean
    {
        return this.isStageUnlocked(stage) && levelNumber <= this.getCompletedLevelCount(stage) + 1;
    }

    /** True once at least one level has been won, so there is progress to resume. */
    get hasProgress (): boolean
    {
        return CAMPAIGN_STAGES.some((stage) => this.getCompletedLevelCount(stage) > 0);
    }

    /**
     * Where to resume: the next level to win in the first stage not yet
     * completed, or the last level of the last stage once everything is won.
     */
    get savedPosition (): CampaignPosition
    {
        const stage = CAMPAIGN_STAGES.find((candidate) => !this.isStageCompleted(candidate));

        if (stage)
        {
            return { stageNumber: stage.number, levelNumber: this.getCompletedLevelCount(stage) + 1 };
        }

        const lastStage = CAMPAIGN_STAGES[CAMPAIGN_STAGES.length - 1];

        return { stageNumber: lastStage.number, levelNumber: lastStage.levels.length };
    }

    start (): void
    {
        this.startAt({ stageNumber: 1, levelNumber: 1 });
    }

    startAt (position: CampaignPosition): void
    {
        const stageIndex = CAMPAIGN_STAGES.findIndex((stage) => stage.number === position.stageNumber);

        this.stageIndex = Math.max(0, stageIndex);
        this.levelIndex = Math.max(0, Math.min(this.stage.levels.length, position.levelNumber) - 1);
    }

    getFightSetup (): FightSetup
    {
        const { stage, level } = this;

        return {
            label: `STAGE ${stage.number} - LEVEL ${level.number}`,
            detail: level.difficulty,
            player: withOverrides(PLAYER_CHARACTER, level.player),
            opponent: level.opponent.character,
            opponentVisual: level.opponent.visual,
            bot: level.opponent.bot,
            timeLimitMs: level.timeLimitMs ?? CAMPAIGN_TIME_LIMIT_MS
        };
    }

    completeFight (result: DuelResult): FightOutcome
    {
        if (result.winner !== 'player')
        {
            return { resolution: 'lost' };
        }

        //  Saved as soon as the fight is won, so quitting from the victory
        //  screen does not lose the progress
        saveManager.recordCampaignLevelWon(this.stage.id, this.level.number);

        if (!this.isLastLevelOfStage)
        {
            return { resolution: 'won', nextFightLabel: 'NEXT LEVEL' };
        }

        if (this.isLastStage)
        {
            return { resolution: 'completed' };
        }

        return {
            resolution: 'won',
            milestoneTitle: `STAGE ${this.stage.number} COMPLETE`,
            nextFightLabel: 'NEXT STAGE'
        };
    }

    advance (): void
    {
        if (!this.isLastLevelOfStage)
        {
            this.levelIndex += 1;

            return;
        }

        if (!this.isLastStage)
        {
            this.stageIndex += 1;
            this.levelIndex = 0;
        }
    }

}

export const campaignMode = new CampaignMode();
