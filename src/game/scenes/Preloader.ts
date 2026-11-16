import { Scene } from 'phaser';
import { TEXTURES } from '../config/constants';
import { ALL_VISUALS, STRIP_VISUALS } from '../data/characters';
import { getStripFrameKey, getStripSourceKey } from '../data/skins';

interface FrameRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const SKIN_TEXTURE_SIZE = 64;

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, TEXTURES.background);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        for (const visual of STRIP_VISUALS)
        {
            if (visual.strip)
            {
                this.load.image(getStripSourceKey(visual.id), visual.strip.path);
            }
        }
    }

    create ()
    {
        this.createBackdropTextures();
        this.createPlaceholderTextures();

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }

    private createBackdropTextures (): void
    {
        const graphics = this.add.graphics();

        if (!this.textures.exists(TEXTURES.starsFar))
        {
            graphics.clear();

            for (let index = 0; index < 110; index += 1)
            {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = Math.random() < 0.86 ? 1 : 1.6;
                const color = Math.random() < 0.18 ? 0x7dd3fc : 0xffffff;

                graphics.fillStyle(color, 0.25 + Math.random() * 0.55);
                graphics.fillCircle(x, y, radius);
            }

            graphics.generateTexture(TEXTURES.starsFar, 256, 256);
        }

        if (!this.textures.exists(TEXTURES.starsNear))
        {
            graphics.clear();

            for (let index = 0; index < 46; index += 1)
            {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 1.2 + Math.random() * 1.5;
                const color = Math.random() < 0.28 ? 0x93c5fd : 0xffffff;

                graphics.fillStyle(color, 0.45 + Math.random() * 0.5);
                graphics.fillCircle(x, y, radius);

                if (Math.random() < 0.22)
                {
                    graphics.fillStyle(color, 0.28);
                    graphics.fillRect(x - 4, y - 0.5, 9, 1);
                    graphics.fillRect(x - 0.5, y - 4, 1, 9);
                }
            }

            graphics.generateTexture(TEXTURES.starsNear, 256, 256);
        }

        if (!this.textures.exists(TEXTURES.spark))
        {
            graphics.clear();
            graphics.fillStyle(0xffffff, 0.28);
            graphics.fillCircle(6, 6, 6);
            graphics.fillStyle(0xfef3c7, 0.9);
            graphics.fillCircle(6, 6, 3.2);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(6, 6, 1.6);
            graphics.generateTexture(TEXTURES.spark, 12, 12);
        }

        if (!this.textures.exists(TEXTURES.glow))
        {
            const size = 64;
            const texture = this.textures.createCanvas(TEXTURES.glow, size, size);

            if (texture)
            {
                const context = texture.getContext();
                const gradient = context.createRadialGradient(
                    size / 2,
                    size / 2,
                    0,
                    size / 2,
                    size / 2,
                    size / 2
                );

                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.65)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                context.fillStyle = gradient;
                context.fillRect(0, 0, size, size);
                texture.refresh();
            }
        }

        if (!this.textures.exists(TEXTURES.nebula))
        {
            const size = 256;
            const texture = this.textures.createCanvas(TEXTURES.nebula, size, size);

            if (texture)
            {
                const context = texture.getContext();
                const gradient = context.createRadialGradient(
                    size / 2,
                    size / 2,
                    0,
                    size / 2,
                    size / 2,
                    size / 2
                );

                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
                gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.16)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                context.fillStyle = gradient;
                context.fillRect(0, 0, size, size);
                texture.refresh();
            }
        }

        graphics.destroy();
    }

    private createPlaceholderTextures (): void
    {
        const graphics = this.add.graphics();

        if (!this.textures.exists(TEXTURES.arrowShip))
        {
            //  Flames
            graphics.fillStyle(0xf59e0b);
            graphics.fillTriangle(22, 52, 30, 64, 38, 52);
            graphics.fillTriangle(38, 52, 46, 64, 54, 52);

            //  Hull
            graphics.fillStyle(0x0ea5e9);
            graphics.fillTriangle(32, 2, 6, 56, 58, 56);
            graphics.fillStyle(0x38bdf8);
            graphics.fillTriangle(32, 12, 14, 50, 50, 50);
            graphics.fillStyle(0xe0f2fe);
            graphics.fillTriangle(32, 16, 27, 34, 37, 34);

            graphics.generateTexture(TEXTURES.arrowShip, 64, 64);
            graphics.clear();
        }

        if (!this.textures.exists(TEXTURES.laser))
        {
            graphics.fillStyle(0x38bdf8, 0.55);
            graphics.fillRect(1, 0, 6, 28);
            graphics.fillStyle(0x7dd3fc);
            graphics.fillRect(2, 2, 4, 24);
            graphics.fillStyle(0xffffff);
            graphics.fillRect(3, 4, 2, 20);

            graphics.generateTexture(TEXTURES.laser, 8, 28);
            graphics.clear();
        }

        if (!this.textures.exists(TEXTURES.magicOrb))
        {
            //  Magic orb of Sorcerer Space: purple halo and bright core
            graphics.fillStyle(0x7e22ce, 0.3);
            graphics.fillCircle(12, 12, 12);
            graphics.fillStyle(0xa855f7, 0.65);
            graphics.fillCircle(12, 12, 8);
            graphics.fillStyle(0xe9d5ff, 0.95);
            graphics.fillCircle(12, 12, 5);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(12, 12, 2.5);

            graphics.generateTexture(TEXTURES.magicOrb, 24, 24);
            graphics.clear();
        }

        if (!this.textures.exists(TEXTURES.rune))
        {
            //  Rune orbiting a powered-up opponent: a ring around a triangle,
            //  drawn white so the aura can tint it
            graphics.lineStyle(1.5, 0xffffff, 1);
            graphics.strokeCircle(8, 8, 6.5);
            graphics.strokeTriangle(8, 3.5, 12, 10.5, 4, 10.5);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(8, 8.5, 1.2);

            graphics.generateTexture(TEXTURES.rune, 16, 16);
            graphics.clear();
        }

        if (!this.textures.exists(TEXTURES.airBlade))
        {
            //  Air blade (Ninja skin): a crescent bulging in its direction of
            //  travel, with a soft cyan edge around a bright core
            const centerX = 16;
            const centerY = 20;
            const startAngle = degreesToRadians(205);
            const endAngle = degreesToRadians(335);

            graphics.lineStyle(6, 0x7dd3fc, 0.35);
            graphics.beginPath();
            graphics.arc(centerX, centerY, 13, startAngle, endAngle);
            graphics.strokePath();

            graphics.lineStyle(3, 0xe0f2fe, 0.85);
            graphics.beginPath();
            graphics.arc(centerX, centerY, 13, startAngle, endAngle);
            graphics.strokePath();

            graphics.lineStyle(1.5, 0xffffff, 1);
            graphics.beginPath();
            graphics.arc(centerX, centerY, 12, degreesToRadians(225), degreesToRadians(315));
            graphics.strokePath();

            graphics.generateTexture(TEXTURES.airBlade, 32, 16);
            graphics.clear();
        }

        this.createStripTextures();
        this.createIdleAnimations();

        graphics.destroy();
    }

    /**
     * Sprites drawn on a template sheet: each frame is scaled up with nearest
     * neighbor (crisp pixels) to fill a fighter texture.
     */
    private createStripTextures (): void
    {
        for (const visual of STRIP_VISUALS)
        {
            const strip = visual.strip;

            if (!strip)
            {
                continue;
            }

            const sourceKey = getStripSourceKey(visual.id);
            //  Frames are read left to right then top to bottom: the sheet can be
            //  a row, a column or a grid.
            const columns = Math.max(1, Math.floor(this.textures.get(sourceKey).getSourceImage().width / strip.frameSize));
            const frameAt = (index: number): FrameRect => ({
                x: (index % columns) * strip.frameSize,
                y: Math.floor(index / columns) * strip.frameSize,
                width: strip.frameSize,
                height: strip.frameSize
            });

            const usedFrames = new Set<number>(strip.fire === undefined ? strip.idle : [...strip.idle, strip.fire]);

            for (const index of usedFrames)
            {
                this.createSkinTexture(getStripFrameKey(visual.id, index), sourceKey, frameAt(index));
            }
        }
    }

    private createIdleAnimations (): void
    {
        for (const visual of ALL_VISUALS)
        {
            const idle = visual.idleAnimation;

            if (!idle || this.anims.exists(idle.key))
            {
                continue;
            }

            this.anims.create({
                key: idle.key,
                frames: idle.frameKeys.map((key) => ({ key })),
                frameRate: idle.frameRate,
                repeat: -1
            });
        }
    }

    private createSkinTexture (
        textureKey: string,
        sourceKey: string,
        frame: FrameRect,
        smooth = false
    ): void
    {
        if (this.textures.exists(textureKey))
        {
            return;
        }

        const source = this.textures.get(sourceKey).getSourceImage() as CanvasImageSource;
        const texture = this.textures.createCanvas(textureKey, SKIN_TEXTURE_SIZE, SKIN_TEXTURE_SIZE);

        if (!texture)
        {
            return;
        }

        const scale = Math.min(
            SKIN_TEXTURE_SIZE / frame.width,
            SKIN_TEXTURE_SIZE / frame.height
        );
        const width = Math.round(frame.width * scale);
        const height = Math.round(frame.height * scale);
        const x = Math.round((SKIN_TEXTURE_SIZE - width) / 2);
        const y = Math.round((SKIN_TEXTURE_SIZE - height) / 2);
        const context = texture.getContext();

        context.imageSmoothingEnabled = smooth;
        context.imageSmoothingQuality = 'high';
        context.drawImage(
            source,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            x,
            y,
            width,
            height
        );
        texture.refresh();
    }
}
