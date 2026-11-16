import type { SpriteVisual } from '../data/skins';

/**
 * Shows the idle pose of an appearance: its animation if it has one,
 * otherwise its static texture. The starting frame is computed from the
 * scene clock, so the animation keeps advancing even when it is restarted
 * very often (returning from the fire pose after each shot).
 */
export const showIdlePose = (sprite: Phaser.GameObjects.Sprite, visual: SpriteVisual): void => {
    const idle = visual.idleAnimation;

    if (!idle || !sprite.scene.anims.exists(idle.key))
    {
        sprite.anims.stop();
        sprite.setTexture(visual.textureKey);

        return;
    }

    const frameIndex = Math.floor((sprite.scene.time.now * idle.frameRate) / 1000) % idle.frameKeys.length;

    sprite.play({ key: idle.key, startFrame: frameIndex });
};
