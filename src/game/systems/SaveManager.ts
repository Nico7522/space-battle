import { SAVE } from '../config/constants';
import { CAMPAIGN_STAGES } from '../data/levels';
import { DEFAULT_SKIN_ID, SKIN_IDS } from '../data/skins';

/** Progression of the Campaign mode, kept apart from the other modes. */
export interface CampaignProgress {
    /**
     * Levels won in each stage, in order, keyed by stage id: { 'stage-1': 2 }
     * means levels 1 and 2 of stage 1 are won and level 3 is next. Keying by id
     * (rather than by position) keeps the save right when stages are added.
     */
    stages: Record<string, number>;
}

//  Saves older than v5 only knew the levels of what is now stage 1
const LEGACY_STAGE_ID = 'stage-1';

export interface SaveData {
    version: number;
    selectedSkinId: string;
    /** Score of the former survival gameplay, kept so old saves lose nothing. */
    bestScore: number;
    soundEnabled: boolean;
    musicEnabled: boolean;
    campaign: CampaignProgress;
}

const createDefaultCampaign = (): CampaignProgress => ({
    stages: {}
});

const isLevelCount = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
};

const createDefaultData = (): SaveData => ({
    version: SAVE.version,
    selectedSkinId: DEFAULT_SKIN_ID,
    bestScore: 0,
    soundEnabled: true,
    musicEnabled: false,
    campaign: createDefaultCampaign()
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const sanitizeBestScore = (value: unknown): number => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    {
        return 0;
    }

    return Math.floor(value);
};

const sanitizeBoolean = (value: unknown, fallback: boolean): boolean => {
    return typeof value === 'boolean' ? value : fallback;
};

const sanitizeCampaign = (value: unknown): CampaignProgress => {
    const fallback = createDefaultCampaign();

    //  Saves older than v3 have no campaign field: start from level 1
    if (!isRecord(value))
    {
        return fallback;
    }

    if (isRecord(value.stages))
    {
        const stages: Record<string, number> = {};

        //  Only known stages are kept, so an edited save cannot pile up
        //  arbitrary keys that would be written back on every save
        for (const stage of CAMPAIGN_STAGES)
        {
            const count = value.stages[stage.id];

            if (Object.hasOwn(value.stages, stage.id) && isLevelCount(count))
            {
                stages[stage.id] = count;
            }
        }

        return { stages };
    }

    //  v4 counted the levels won across the single list of levels
    if (isLevelCount(value.completedLevels))
    {
        return { stages: { [LEGACY_STAGE_ID]: value.completedLevels } };
    }

    //  v3 stored the highest unlocked level and a "completed" flag
    if (isLevelCount(value.highestLevel) && value.highestLevel >= 1)
    {
        const won = value.completed === true ? value.highestLevel : value.highestLevel - 1;

        return { stages: { [LEGACY_STAGE_ID]: won } };
    }

    return fallback;
};

const sanitizeData = (value: unknown): SaveData => {
    const fallback = createDefaultData();

    if (!isRecord(value))
    {
        return fallback;
    }

    const selectedSkinId = typeof value.selectedSkinId === 'string'
        && SKIN_IDS.includes(value.selectedSkinId)
        ? value.selectedSkinId
        : DEFAULT_SKIN_ID;

    return {
        version: SAVE.version,
        selectedSkinId,
        bestScore: sanitizeBestScore(value.bestScore),
        soundEnabled: sanitizeBoolean(value.soundEnabled, fallback.soundEnabled),
        musicEnabled: sanitizeBoolean(value.musicEnabled, fallback.musicEnabled),
        campaign: sanitizeCampaign(value.campaign)
    };
};

export class SaveManager {

    private data: SaveData;

    constructor ()
    {
        this.data = this.load();
    }

    get selectedSkinId (): string
    {
        return this.data.selectedSkinId;
    }

    get bestScore (): number
    {
        return this.data.bestScore;
    }

    get soundEnabled (): boolean
    {
        return this.data.soundEnabled;
    }

    get musicEnabled (): boolean
    {
        return this.data.musicEnabled;
    }

    get campaign (): Readonly<CampaignProgress>
    {
        return this.data.campaign;
    }

    /** Levels won in a campaign stage. */
    getCampaignStageProgress (stageId: string): number
    {
        return this.data.campaign.stages[stageId] ?? 0;
    }

    /** Records a won level of a campaign stage. Progress never goes backward. */
    recordCampaignLevelWon (stageId: string, levelNumber: number): void
    {
        if (levelNumber <= this.getCampaignStageProgress(stageId))
        {
            return;
        }

        this.data.campaign.stages[stageId] = levelNumber;
        this.save();
    }

    selectSkin (skinId: string): boolean
    {
        if (!SKIN_IDS.includes(skinId) || this.data.selectedSkinId === skinId)
        {
            return false;
        }

        this.data.selectedSkinId = skinId;
        this.save();

        return true;
    }

    setSoundEnabled (enabled: boolean): boolean
    {
        if (this.data.soundEnabled === enabled)
        {
            return false;
        }

        this.data.soundEnabled = enabled;
        this.save();

        return true;
    }

    setMusicEnabled (enabled: boolean): boolean
    {
        if (this.data.musicEnabled === enabled)
        {
            return false;
        }

        this.data.musicEnabled = enabled;
        this.save();

        return true;
    }

    private load (): SaveData
    {
        try
        {
            const raw = window.localStorage.getItem(SAVE.storageKey);

            if (!raw)
            {
                return createDefaultData();
            }

            return sanitizeData(JSON.parse(raw));
        }
        catch
        {
            return createDefaultData();
        }
    }

    private save (): void
    {
        try
        {
            window.localStorage.setItem(SAVE.storageKey, JSON.stringify(this.data));
        }
        catch
        {
            //  Storage may be unavailable (private browsing, quota).
        }
    }

}

export const saveManager = new SaveManager();
