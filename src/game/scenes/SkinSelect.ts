import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { getSkinTypeLabel } from '../data/skins';
import type { SkinConfig } from '../data/skins';
import { audioManager } from '../systems/AudioManager';
import { skinManager } from '../systems/SkinManager';
import { createSpaceBackdrop } from '../ui/Background';
import { createButton } from '../ui/Button';
import { showIdlePose } from '../ui/spriteVisual';

type SkinSelectCaller = 'MainMenu' | 'Game';

interface SkinSelectData {
    caller?: SkinSelectCaller;
}

interface SkinCardView {
    skin: SkinConfig;
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Rectangle;
    preview: Phaser.GameObjects.Sprite;
    status: Phaser.GameObjects.Text;
    condition: Phaser.GameObjects.Text;
}

const CARD_WIDTH = 300;
const CARD_HEIGHT = 470;
const CARD_GAP = 20;
const CARD_Y = 410;
const CARDS_MARGIN_X = 24;
const CARD_HOVER_SCALE = 1.025;
const CARDS_PER_PAGE = 4;
const PAGER_Y = 628;
const PAGER_ARROW_OFFSET_X = 110;

export class SkinSelect extends Scene {

    private caller: SkinSelectCaller = 'MainMenu';
    private cards: SkinCardView[] = [];
    private cardScale = 1;
    private page = 0;
    private pageLabel!: Phaser.GameObjects.Text;
    private previousButton!: Phaser.GameObjects.Text;
    private nextButton!: Phaser.GameObjects.Text;

    constructor ()
    {
        super('SkinSelect');
    }

    init (data?: SkinSelectData): void
    {
        this.caller = data?.caller === 'Game' ? 'Game' : 'MainMenu';
        this.cards = [];

        //  Open the page that contains the currently selected skin
        const selectedIndex = skinManager.skins.findIndex((skin) => skin.id === skinManager.selectedSkinId);

        this.page = Math.max(0, Math.floor(selectedIndex / CARDS_PER_PAGE));
    }

    private get pageCount (): number
    {
        return Math.ceil(skinManager.skins.length / CARDS_PER_PAGE);
    }

    create (): void
    {
        createSpaceBackdrop(this, {
            imageAlpha: 0.35,
            overlayAlpha: 0.58
        });

        this.cameras.main.fadeIn(220, 2, 6, 23);

        this.add.text(GAME_WIDTH / 2, 72, 'CHARACTERS & VEHICLES', {
            fontFamily: 'Arial Black',
            fontSize: 42,
            color: '#e0f2fe',
            stroke: '#020617',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 122, 'Choose the skin you will take into battle', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#7dd3fc'
        }).setOrigin(0.5);

        //  Scale computed for a full page, so it is the same on every page
        const availableWidth = GAME_WIDTH - (CARDS_MARGIN_X * 2) - ((CARDS_PER_PAGE - 1) * CARD_GAP);

        this.cardScale = Math.min(1, availableWidth / (CARDS_PER_PAGE * CARD_WIDTH));

        this.previousButton = createButton(this, GAME_WIDTH / 2 - PAGER_ARROW_OFFSET_X, PAGER_Y, '<', () => {
            this.changePage(-1);
        });
        this.nextButton = createButton(this, GAME_WIDTH / 2 + PAGER_ARROW_OFFSET_X, PAGER_Y, '>', () => {
            this.changePage(1);
        });
        this.pageLabel = this.add.text(GAME_WIDTH / 2, PAGER_Y, '', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#e0f2fe'
        }).setOrigin(0.5);

        const hasPages = this.pageCount > 1;

        this.previousButton.setVisible(hasPages);
        this.nextButton.setVisible(hasPages);
        this.pageLabel.setVisible(hasPages);

        this.renderPage();

        createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 55, 'BACK', () => {
            this.close();
        });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, hasPages ? 'Esc: back   •   ← →: change page' : 'Esc: back', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#64748b'
        }).setOrigin(0.5);

        this.input.keyboard?.on('keydown-ESC', this.close, this);
        this.input.keyboard?.on('keydown-LEFT', () => this.changePage(-1));
        this.input.keyboard?.on('keydown-RIGHT', () => this.changePage(1));
    }

    private changePage (direction: number): void
    {
        const pageCount = this.pageCount;

        if (pageCount <= 1)
        {
            return;
        }

        audioManager.playClick();
        this.page = (this.page + direction + pageCount) % pageCount;
        this.renderPage();
    }

    private renderPage (): void
    {
        for (const card of this.cards)
        {
            this.tweens.killTweensOf([card.container, card.preview]);
            card.container.destroy();
        }

        const skins = skinManager.skins.slice(this.page * CARDS_PER_PAGE, (this.page + 1) * CARDS_PER_PAGE);
        const step = (CARD_WIDTH * this.cardScale) + CARD_GAP;
        const startX = (GAME_WIDTH - (step * skins.length) + CARD_GAP + (CARD_WIDTH * this.cardScale)) / 2;

        this.cards = skins.map((skin, index) => this.createCard(skin, startX + index * step));
        this.pageLabel.setText(`${this.page + 1} / ${this.pageCount}`);
        this.refreshCards();
    }

    private createCard (skin: SkinConfig, x: number): SkinCardView
    {
        const container = this.add.container(x, CARD_Y).setScale(this.cardScale);

        const background = this.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0x0f172a, 0.94)
            .setStrokeStyle(3, 0x334155)
            .setInteractive({ useHandCursor: true });

        const preview = this.add.sprite(0, -145, skin.textureKey).setScale(2.4);

        showIdlePose(preview, skin);

        const name = this.add.text(0, -35, skin.name, {
            fontFamily: 'Arial Black',
            fontSize: 26,
            color: '#ffffff'
        }).setOrigin(0.5);

        const maxNameWidth = CARD_WIDTH - 30;

        if (name.width > maxNameWidth)
        {
            name.setScale(maxNameWidth / name.width);
        }

        const type = this.add.text(0, 0, getSkinTypeLabel(skin), {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: skin.accentColor
        }).setOrigin(0.5);

        const description = this.add.text(0, 62, skin.description, {
            fontFamily: 'Arial',
            fontSize: 15,
            color: '#cbd5e1',
            align: 'center',
            wordWrap: { width: CARD_WIDTH - 50 }
        }).setOrigin(0.5);

        const status = this.add.text(0, 170, '', {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#f87171'
        }).setOrigin(0.5);

        const condition = this.add.text(0, 204, '', {
            fontFamily: 'Arial',
            fontSize: 13,
            color: '#94a3b8',
            align: 'center',
            wordWrap: { width: CARD_WIDTH - 40 }
        }).setOrigin(0.5);

        container.add([
            background,
            preview,
            name,
            type,
            description,
            status,
            condition
        ]);

        background.on('pointerdown', () => {
            this.handleCardClick(skin);
        });

        background.on('pointerover', () => {
            this.tweens.killTweensOf(container);
            this.tweens.add({
                targets: container,
                scale: this.cardScale * CARD_HOVER_SCALE,
                duration: 130,
                ease: 'Sine.easeOut'
            });
        });

        background.on('pointerout', () => {
            this.tweens.killTweensOf(container);
            this.tweens.add({
                targets: container,
                scale: this.cardScale,
                duration: 130,
                ease: 'Sine.easeOut'
            });
        });

        this.tweens.add({
            targets: preview,
            y: -153,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return {
            skin,
            container,
            background,
            preview,
            status,
            condition
        };
    }

    private handleCardClick (skin: SkinConfig): void
    {
        audioManager.playClick();
        skinManager.select(skin.id);
        this.refreshCards();
    }

    private refreshCards (): void
    {
        for (const card of this.cards)
        {
            const selected = skinManager.selectedSkinId === card.skin.id;

            card.background.setStrokeStyle(3, selected ? 0x38bdf8 : 0x334155);

            if (selected)
            {
                card.status.setText('SELECTED').setColor('#38bdf8');
                card.condition.setText('Equipped for the next duel').setColor('#7dd3fc');
            }
            else
            {
                card.status.setText('AVAILABLE').setColor('#4ade80');
                card.condition.setText('Click to select').setColor('#94a3b8');
            }
        }
    }

    private close (): void
    {
        if (this.caller === 'Game')
        {
            this.scene.stop();
            this.scene.resume('Game');

            return;
        }

        this.scene.start('MainMenu');
    }

}
