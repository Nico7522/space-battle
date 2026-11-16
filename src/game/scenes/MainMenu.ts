import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { skinManager } from '../systems/SkinManager';
import { createSpaceBackdrop } from '../ui/Background';
import { createButton } from '../ui/Button';
import { campaignMode } from '../modes/CampaignMode';
import { setActiveMode } from '../modes/activeMode';
import { showIdlePose } from '../ui/spriteVisual';

const MENU_FIRST_BUTTON_Y = 440;
const MENU_BUTTON_SPACING = 73;
//  Tighter spacing when the Continue button is added, to keep the controls hint visible
const MENU_BUTTON_SPACING_COMPACT = 64;

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        createSpaceBackdrop(this, {
            imageAlpha: 0.55,
            overlayAlpha: 0.28
        });

        this.cameras.main.fadeIn(260, 2, 6, 23);

        const title = this.add.text(GAME_WIDTH / 2, 108, 'SPACE DUEL', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#e0f2fe',
            stroke: '#0ea5e9',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scale: 1.025,
            duration: 2400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.rectangle(GAME_WIDTH / 2, 152, 360, 3, 0x38bdf8, 0.8);

        const subtitle = this.add.text(GAME_WIDTH / 2, 182, 'Face Sorcerer Space in a duel', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#7dd3fc'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: subtitle,
            alpha: 0.65,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const skin = skinManager.selectedSkin;

        this.add.rectangle(GAME_WIDTH / 2, 300, 560, 150, 0x0f172a, 0.92)
            .setStrokeStyle(2, 0x38bdf8);

        const preview = this.add.sprite(GAME_WIDTH / 2 - 190, 300, skin.textureKey).setScale(1.6);

        showIdlePose(preview, skin);

        this.tweens.add({
            targets: preview,
            y: 292,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(GAME_WIDTH / 2 - 120, 272, 'SELECTED SKIN', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#7dd3fc'
        });

        this.add.text(GAME_WIDTH / 2 - 120, 294, skin.name, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff'
        });

        const saved = campaignMode.savedPosition;
        const continueCampaign = (): void => {
            setActiveMode(campaignMode);
            campaignMode.startAt(saved);
            this.scene.start('Game');
        };
        const startCampaign = (): void => {
            setActiveMode(campaignMode);
            campaignMode.start();
            this.scene.start('Game');
        };
        const buttons: { label: string; onClick: () => void }[] = [];

        //  Once a level has been won, offer to resume or to pick any won level
        if (campaignMode.hasProgress)
        {
            buttons.push(
                {
                    label: `CONTINUE  •  STAGE ${saved.stageNumber} - LEVEL ${saved.levelNumber}`,
                    onClick: continueCampaign
                },
                { label: 'SELECT LEVEL', onClick: () => this.scene.start('LevelSelect') }
            );
        }
        else
        {
            buttons.push({ label: 'CAMPAIGN', onClick: startCampaign });
        }

        buttons.push(
            { label: 'CHARACTERS / VEHICLES', onClick: () => this.scene.start('SkinSelect', { caller: 'MainMenu' }) },
            { label: 'SETTINGS', onClick: () => this.scene.start('Settings', { caller: 'MainMenu' }) }
        );

        const spacing = buttons.length > 3 ? MENU_BUTTON_SPACING_COMPACT : MENU_BUTTON_SPACING;

        buttons.forEach((button, index) => {
            createButton(this, GAME_WIDTH / 2, MENU_FIRST_BUTTON_Y + (index * spacing), button.label, button.onClick);
        });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '← → / A D: move   •   Space: fire   •   Esc / P: pause', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#94a3b8'
        }).setOrigin(0.5);
    }
}
