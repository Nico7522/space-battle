import { BlendModes } from 'phaser';
import type { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TEXTURES } from '../config/constants';

interface BackdropOptions {
    imageAlpha?: number;
    overlayAlpha?: number;
    overlayColor?: number;
    nebulaAlpha?: number;
}

const addStarLayer = (
    scene: Scene,
    textureKey: string,
    alpha: number,
    depth: number,
    duration: number
): void => {
    const layer = scene.add.tileSprite(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        textureKey
    )
        .setAlpha(alpha)
        .setDepth(depth);

    scene.tweens.add({
        targets: layer,
        tilePositionY: 256,
        duration,
        repeat: -1,
        ease: 'Linear'
    });
};

/**
 * Space backdrop shared by menus and game scenes: background image,
 * glowing nebulae and two scrolling star layers.
 */
export const createSpaceBackdrop = (scene: Scene, options: BackdropOptions = {}): void => {
    const {
        imageAlpha = 0.5,
        overlayAlpha = 0,
        overlayColor = 0x020617,
        nebulaAlpha = 1
    } = options;

    scene.cameras.main.setBackgroundColor(0x020617);

    scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, TEXTURES.background)
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
        .setAlpha(imageAlpha)
        .setDepth(-30);

    const nebulaA = scene.add.image(GAME_WIDTH * 0.24, GAME_HEIGHT * 0.28, TEXTURES.nebula)
        .setScale(2.4)
        .setTint(0x0ea5e9)
        .setAlpha(0.32 * nebulaAlpha)
        .setBlendMode(BlendModes.ADD)
        .setDepth(-25);

    const nebulaB = scene.add.image(GAME_WIDTH * 0.78, GAME_HEIGHT * 0.74, TEXTURES.nebula)
        .setScale(2.8)
        .setTint(0x7c3aed)
        .setAlpha(0.2 * nebulaAlpha)
        .setBlendMode(BlendModes.ADD)
        .setDepth(-25);

    scene.tweens.add({
        targets: nebulaA,
        x: nebulaA.x + 42,
        y: nebulaA.y + 26,
        duration: 16000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    scene.tweens.add({
        targets: nebulaB,
        x: nebulaB.x - 36,
        y: nebulaB.y - 30,
        duration: 21000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    addStarLayer(scene, TEXTURES.starsFar, 0.42, -20, 26000);
    addStarLayer(scene, TEXTURES.starsNear, 0.62, -15, 13000);

    if (overlayAlpha > 0)
    {
        scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, overlayColor, overlayAlpha)
            .setOrigin(0)
            .setDepth(-10);
    }
};
