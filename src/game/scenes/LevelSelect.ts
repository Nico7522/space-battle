import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { CampaignStage } from '../data/levels';
import { campaignMode } from '../modes/CampaignMode';
import { setActiveMode } from '../modes/activeMode';
import { audioManager } from '../systems/AudioManager';
import { createSpaceBackdrop } from '../ui/Background';
import { createButton } from '../ui/Button';

const STAGE_TITLE_Y = 132;
const STAGE_HINT_Y = 166;
const FIRST_LEVEL_Y = 214;
const LEVEL_SPACING = 80;
const STATUS_OFFSET_Y = 32;
const PAGER_Y = 630;
const PAGER_ARROW_OFFSET_X = 110;
const LOCKED_ALPHA = 0.4;

type LevelStatus = 'completed' | 'next' | 'locked';

const STATUS_LABELS: Record<LevelStatus, { text: string; color: string }> = {
    completed: { text: '✓ COMPLETED', color: '#4ade80' },
    next: { text: 'NEXT CHALLENGE', color: '#fbbf24' },
    locked: { text: 'LOCKED', color: '#64748b' }
};

/**
 * Campaign level select, one page per stage: won levels can be replayed
 * directly, the next level to win is available, and the following ones stay
 * locked. A stage stays locked until the previous one is completed.
 */
export class LevelSelect extends Scene {

    private stageIndex = 0;
    private page!: Phaser.GameObjects.Container;

    constructor ()
    {
        super('LevelSelect');
    }

    create (): void
    {
        createSpaceBackdrop(this, {
            imageAlpha: 0.35,
            overlayAlpha: 0.58
        });

        this.cameras.main.fadeIn(220, 2, 6, 23);

        this.add.text(GAME_WIDTH / 2, 64, 'SELECT LEVEL', {
            fontFamily: 'Arial Black',
            fontSize: 42,
            color: '#e0f2fe',
            stroke: '#020617',
            strokeThickness: 8
        }).setOrigin(0.5);

        //  Open on the stage the player is currently progressing in
        const savedStage = campaignMode.savedPosition.stageNumber;

        this.stageIndex = Math.max(0, campaignMode.stages.findIndex((stage) => stage.number === savedStage));
        this.page = this.add.container(0, 0);

        const hasPages = campaignMode.stages.length > 1;

        if (hasPages)
        {
            createButton(this, GAME_WIDTH / 2 - PAGER_ARROW_OFFSET_X, PAGER_Y, '<', () => this.changeStage(-1));
            createButton(this, GAME_WIDTH / 2 + PAGER_ARROW_OFFSET_X, PAGER_Y, '>', () => this.changeStage(1));
            this.input.keyboard?.on('keydown-LEFT', () => this.changeStage(-1));
            this.input.keyboard?.on('keydown-RIGHT', () => this.changeStage(1));
        }

        this.renderStage();

        createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'BACK', () => {
            this.scene.start('MainMenu');
        });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, hasPages ? 'Esc: back   •   ← →: change campaign' : 'Esc: back', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#64748b'
        }).setOrigin(0.5);

        this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenu'));
    }

    private changeStage (direction: number): void
    {
        const count = campaignMode.stages.length;

        audioManager.playClick();
        this.stageIndex = (this.stageIndex + direction + count) % count;
        this.renderStage();
    }

    private renderStage (): void
    {
        this.page.removeAll(true);

        const stage = campaignMode.stages[this.stageIndex];
        const stageUnlocked = campaignMode.isStageUnlocked(stage);
        const pageInfo = campaignMode.stages.length > 1
            ? `   (${this.stageIndex + 1} / ${campaignMode.stages.length})`
            : '';

        this.page.add(this.add.text(
            GAME_WIDTH / 2,
            STAGE_TITLE_Y,
            `CAMPAIGN ${stage.number}  •  ${stage.opponentName.toUpperCase()}${pageInfo}`,
            {
                fontFamily: 'Arial Black',
                fontSize: 24,
                color: '#fbbf24'
            }
        ).setOrigin(0.5));

        this.page.add(this.add.text(
            GAME_WIDTH / 2,
            STAGE_HINT_Y,
            stageUnlocked
                ? 'Replay a level you have won, or take on the next one'
                : `Complete campaign ${stage.number - 1} to unlock this campaign`,
            {
                fontFamily: 'Arial',
                fontSize: 17,
                color: stageUnlocked ? '#7dd3fc' : '#f87171'
            }
        ).setOrigin(0.5));

        stage.levels.forEach((level, index) => {
            const y = FIRST_LEVEL_Y + (index * LEVEL_SPACING);
            const status = this.getStatus(stage, level.number);
            const button = createButton(
                this,
                GAME_WIDTH / 2,
                y,
                `LEVEL ${level.number}  •  ${level.difficulty.toUpperCase()}`,
                () => this.startLevel(stage, level.number)
            );

            if (status === 'locked')
            {
                button.disableInteractive().setAlpha(LOCKED_ALPHA);
            }

            const label = STATUS_LABELS[status];
            const statusText = this.add.text(GAME_WIDTH / 2, y + STATUS_OFFSET_Y, label.text, {
                fontFamily: 'Arial Black',
                fontSize: 13,
                color: label.color
            }).setOrigin(0.5);

            this.page.add([button, statusText]);
        });
    }

    private getStatus (stage: CampaignStage, levelNumber: number): LevelStatus
    {
        if (campaignMode.isLevelCompleted(stage, levelNumber))
        {
            return 'completed';
        }

        return campaignMode.isLevelUnlocked(stage, levelNumber) ? 'next' : 'locked';
    }

    private startLevel (stage: CampaignStage, levelNumber: number): void
    {
        setActiveMode(campaignMode);
        campaignMode.startAt({ stageNumber: stage.number, levelNumber });
        this.scene.start('Game');
    }

}
