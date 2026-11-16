import type { Scene } from 'phaser';
import { audioManager } from '../systems/AudioManager';

export const createButton = (
    scene: Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void
): Phaser.GameObjects.Text => {

    const button = scene.add.text(x, y, label, {
        fontFamily: 'Arial Black',
        fontSize: 26,
        color: '#ffffff',
        backgroundColor: '#0ea5e9',
        padding: { x: 24, y: 12 },
        align: 'center'
    })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setShadow(0, 3, '#020617', 6, true, true);

    const setHovered = (hovered: boolean): void => {
        scene.tweens.killTweensOf(button);
        button.setBackgroundColor(hovered ? '#0284c7' : '#0ea5e9');

        scene.tweens.add({
            targets: button,
            scale: hovered ? 1.05 : 1,
            duration: 130,
            ease: 'Sine.easeOut'
        });
    };

    button.on('pointerover', () => {
        setHovered(true);
        audioManager.playHover();
    });

    button.on('pointerout', () => {
        setHovered(false);
    });

    button.on('pointerdown', () => {
        audioManager.playClick();
        scene.tweens.killTweensOf(button);
        scene.tweens.add({
            targets: button,
            scale: 0.97,
            duration: 60,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (button.active)
                {
                    button.setScale(1);
                }
            }
        });
        onClick();
    });

    return button;
};
