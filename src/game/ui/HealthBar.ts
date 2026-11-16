import type { Scene } from 'phaser';

const BAR_HEIGHT = 14;
const BAR_RADIUS = 7;
const LOW_RATIO = 0.25;
const MEDIUM_RATIO = 0.5;
const UI_DEPTH = 30;

/** Health bar with a label and a numeric value, reusable for any fighter. */
export class HealthBar {

    private readonly scene: Scene;
    private readonly x: number;
    private readonly y: number;
    private readonly width: number;
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly valueText: Phaser.GameObjects.Text;
    private readonly displayed = { value: 0 };
    private max: number;
    private tween?: Phaser.Tweens.Tween;

    constructor (scene: Scene, x: number, y: number, width: number, label: string, max: number)
    {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.max = max;
        this.displayed.value = max;

        scene.add.text(x, y - 22, label, {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#e0f2fe'
        }).setDepth(UI_DEPTH);

        this.valueText = scene.add.text(x + width, y - 22, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#cbd5e1'
        }).setOrigin(1, 0).setDepth(UI_DEPTH);

        this.graphics = scene.add.graphics().setDepth(UI_DEPTH);
        this.set(max, max, false);
    }

    set (current: number, max: number, animate = true): void
    {
        this.max = max;
        this.valueText.setText(`${current} / ${max}`);
        this.tween?.stop();

        if (!animate)
        {
            this.displayed.value = current;
            this.draw();

            return;
        }

        this.tween = this.scene.tweens.add({
            targets: this.displayed,
            value: current,
            duration: 220,
            ease: 'Cubic.easeOut',
            onUpdate: () => this.draw()
        });
    }

    private draw (): void
    {
        const ratio = this.max > 0 ? Math.max(0, Math.min(1, this.displayed.value / this.max)) : 0;
        const color = ratio <= LOW_RATIO ? 0xf87171 : ratio <= MEDIUM_RATIO ? 0xfbbf24 : 0x4ade80;
        const innerWidth = (this.width - 4) * ratio;

        this.graphics.clear();
        this.graphics.fillStyle(0x0f172a, 0.9);
        this.graphics.fillRoundedRect(this.x, this.y, this.width, BAR_HEIGHT, BAR_RADIUS);
        this.graphics.lineStyle(1, color, 0.8);
        this.graphics.strokeRoundedRect(this.x, this.y, this.width, BAR_HEIGHT, BAR_RADIUS);

        //  Below a few pixels, a rounded rectangle does not draw properly
        if (innerWidth >= 6)
        {
            this.graphics.fillStyle(color, 1);
            this.graphics.fillRoundedRect(this.x + 2, this.y + 2, innerWidth, BAR_HEIGHT - 4, 5);
        }
    }

}
