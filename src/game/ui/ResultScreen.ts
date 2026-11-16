import type { Scene } from 'phaser';
import { GAME_WIDTH } from '../config/constants';
import type { DuelResult } from '../types/duel';
import { formatTime } from '../utils/formatTime';
import { createSpaceBackdrop } from './Background';
import { createButton } from './Button';

const FIRST_BUTTON_Y = 550;
const BUTTON_SPACING = 75;

export interface ResultButton {
    label: string;
    onClick: () => void;
}

interface ResultScreenOptions {
    title: string;
    subtitle: string;
    titleColor: string;
    result: DuelResult;
    buttons: readonly ResultButton[];
}

/** End-of-fight screen, shared by victory, defeat and the end of a mode. */
export const createResultScreen = (scene: Scene, options: ResultScreenOptions): void => {
    const { result } = options;

    createSpaceBackdrop(scene, {
        imageAlpha: 0.35,
        overlayAlpha: 0.48
    });

    scene.cameras.main.fadeIn(260, 2, 6, 23);

    scene.add.text(GAME_WIDTH / 2, 110, result.fightLabel, {
        fontFamily: 'Arial Black',
        fontSize: 22,
        color: '#fbbf24'
    }).setOrigin(0.5);

    const title = scene.add.text(GAME_WIDTH / 2, 170, options.title, {
        fontFamily: 'Arial Black',
        fontSize: 64,
        color: options.titleColor,
        stroke: '#020617',
        strokeThickness: 8
    })
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(0.86);

    scene.tweens.add({
        targets: title,
        alpha: 1,
        scale: 1,
        duration: 320,
        ease: 'Back.easeOut'
    });

    scene.add.text(GAME_WIDTH / 2, 245, options.subtitle, {
        fontFamily: 'Arial',
        fontSize: 22,
        color: '#e0f2fe'
    }).setOrigin(0.5);

    const stats = [
        `YOUR HP   ${result.playerHealth} / ${result.playerMaxHealth}`,
        `${result.enemyName.toUpperCase()} HP   ${result.enemyHealth} / ${result.enemyMaxHealth}`,
        `DUEL TIME   ${formatTime(result.durationMs)}`
    ].join('\n');

    const statsText = scene.add.text(GAME_WIDTH / 2, 390, stats, {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#ffffff',
        align: 'center',
        lineSpacing: 14
    })
        .setOrigin(0.5)
        .setAlpha(0);

    scene.tweens.add({
        targets: statsText,
        alpha: 1,
        duration: 300,
        delay: 120
    });

    options.buttons.forEach((button, index) => {
        createButton(scene, GAME_WIDTH / 2, FIRST_BUTTON_Y + (index * BUTTON_SPACING), button.label, button.onClick);
    });
};
