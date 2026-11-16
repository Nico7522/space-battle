import { campaignMode } from './CampaignMode';
import type { GameMode } from './GameMode';

//  Campaign is the only mode for now; the menu will pick one once others exist
let activeMode: GameMode = campaignMode;

/** Mode whose fights are played by the Game scene. */
export const getActiveMode = (): GameMode => activeMode;

export const setActiveMode = (mode: GameMode): void => {
    activeMode = mode;
};
