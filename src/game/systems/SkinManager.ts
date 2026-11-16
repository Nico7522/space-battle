import {
    DEFAULT_SKIN_ID,
    SKINS,
    getSkinById
} from '../data/skins';
import type { SkinConfig } from '../data/skins';
import { saveManager } from './SaveManager';

export class SkinManager {

    get skins (): readonly SkinConfig[]
    {
        return SKINS;
    }

    get selectedSkin (): SkinConfig
    {
        return getSkinById(saveManager.selectedSkinId);
    }

    get selectedSkinId (): string
    {
        return saveManager.selectedSkinId;
    }

    select (skinId: string): boolean
    {
        return saveManager.selectSkin(skinId);
    }

    getDefaultSkin (): SkinConfig
    {
        return getSkinById(DEFAULT_SKIN_ID);
    }

}

export const skinManager = new SkinManager();
