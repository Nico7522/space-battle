import { BlendModes } from 'phaser';
import type { Scene } from 'phaser';
import { TEXTURES } from '../config/constants';

export const createExplosionEmitter = (scene: Scene): Phaser.GameObjects.Particles.ParticleEmitter => {
    return scene.add.particles(0, 0, TEXTURES.spark, {
        speed: { min: 70, max: 290 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 260, max: 620 },
        gravityY: 140,
        blendMode: 'ADD',
        emitting: false,
        quantity: 0,
        tint: 0xffd166
    }).setDepth(8);
};

const spawnShockwave = (scene: Scene, x: number, y: number, tint: number): void => {
    const wave = scene.add.image(x, y, TEXTURES.glow)
        .setTint(tint)
        .setBlendMode(BlendModes.ADD)
        .setScale(0.25)
        .setAlpha(0.9)
        .setDepth(7);

    scene.tweens.add({
        targets: wave,
        scale: 1.7,
        alpha: 0,
        duration: 280,
        ease: 'Cubic.easeOut',
        onComplete: () => wave.destroy()
    });
};

export const spawnExplosion = (
    scene: Scene,
    emitter: Phaser.GameObjects.Particles.ParticleEmitter,
    x: number,
    y: number,
    tint = 0xffd166,
    count = 16
): void => {
    emitter.explode(count, x, y);
    spawnShockwave(scene, x, y, tint);
};

/** Short text that rises and fades out (damage taken, bonus…). */
export const spawnFloatingText = (
    scene: Scene,
    x: number,
    y: number,
    label: string,
    color = '#fde68a'
): void => {
    const popup = scene.add.text(x, y, label, {
        fontFamily: 'Arial Black',
        fontSize: 20,
        color,
        stroke: '#020617',
        strokeThickness: 4
    })
        .setOrigin(0.5)
        .setDepth(40);

    scene.tweens.add({
        targets: popup,
        y: y - 46,
        alpha: 0,
        duration: 720,
        ease: 'Cubic.easeOut',
        onComplete: () => popup.destroy()
    });
};
