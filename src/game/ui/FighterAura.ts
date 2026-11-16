import { BlendModes, Display, Geom, Math as PhaserMath, Scenes } from 'phaser';
import type { Scene } from 'phaser';
import { TEXTURES } from '../config/constants';
import type {
    AuraAfterimageConfig,
    AuraConfig,
    AuraOuterHaloConfig,
    AuraParticlesConfig,
    AuraRunesConfig,
    AuraSparksConfig
} from '../data/auras';
import type { Fighter } from '../entities/Fighter';

//  Motes appear around the lower half of the sprite (the robe), relative to its center
const PARTICLE_ZONE = new Geom.Rectangle(-18, 2, 36, 26);
//  Sparks start close to the fighter and fly outward
const SPARK_ZONE = new Geom.Circle(0, 0, 14);

/**
 * Breathing halo following a fighter, with optional outer halo, color shift,
 * rising motes, sparks, orbiting runes and afterimages. It disappears with
 * the fighter (e.g. after a KO).
 */
export class FighterAura {

    private readonly halo: Phaser.GameObjects.Image;
    private readonly outerHalo?: Phaser.GameObjects.Image;
    private readonly particles?: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly sparks?: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly runes: Phaser.GameObjects.Image[] = [];
    private readonly runesConfig?: AuraRunesConfig;
    private readonly afterimageConfig?: AuraAfterimageConfig;
    private nextAfterimageTime = 0;

    constructor (private readonly scene: Scene, private readonly fighter: Fighter, config: AuraConfig)
    {
        this.halo = this.createHalo(config.color, config.scale, config.alpha, config.pulseMs, fighter.depth - 1);

        if (config.outerHalo)
        {
            this.outerHalo = this.createOuterHalo(config.outerHalo, config.pulseMs);
        }

        if (config.shiftColor !== undefined)
        {
            this.shiftHaloColor(config.color, config.shiftColor, config.shiftMs ?? config.pulseMs);
        }

        if (config.particles)
        {
            this.particles = this.createParticles(config.particles);
        }

        if (config.sparks)
        {
            this.sparks = this.createSparks(config.sparks);
        }

        if (config.runes)
        {
            this.runesConfig = config.runes;

            for (let index = 0; index < config.runes.count; index++)
            {
                this.runes.push(scene.add.image(fighter.x, fighter.y, TEXTURES.rune)
                    .setTint(config.runes.color)
                    .setBlendMode(BlendModes.ADD));
            }
        }

        this.afterimageConfig = config.afterimage;

        //  Follows after physics moved the fighter, so the halo never lags a frame behind
        scene.events.on(Scenes.Events.POST_UPDATE, this.follow, this);
        scene.events.once(Scenes.Events.SHUTDOWN, this.destroy, this);
    }

    /** A glow that grows and brightens, then shrinks and fades, in a loop. */
    private createHalo (
        color: number,
        scale: readonly [number, number],
        alpha: readonly [number, number],
        pulseMs: number,
        depth: number
    ): Phaser.GameObjects.Image
    {
        const halo = this.scene.add.image(this.fighter.x, this.fighter.y, TEXTURES.glow)
            .setTint(color)
            .setBlendMode(BlendModes.ADD)
            .setScale(scale[0])
            .setAlpha(alpha[0])
            .setDepth(depth);

        this.scene.tweens.add({
            targets: halo,
            scale: scale[1],
            alpha: alpha[1],
            duration: pulseMs,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        return halo;
    }

    private createOuterHalo (config: AuraOuterHaloConfig, pulseMs: number): Phaser.GameObjects.Image
    {
        return this.createHalo(config.color, config.scale, config.alpha, pulseMs, this.fighter.depth - 2);
    }

    /** Tints the halo back and forth between two colors. */
    private shiftHaloColor (from: number, to: number, durationMs: number): void
    {
        const start = Display.Color.ValueToColor(from);
        const end = Display.Color.ValueToColor(to);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: durationMs,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            onUpdate: (tween) => {
                const color = Display.Color.Interpolate.ColorWithColor(start, end, 100, tween.getValue() ?? 0);

                this.halo.setTint(Display.Color.GetColor(color.r, color.g, color.b));
            }
        });
    }

    private createParticles (config: AuraParticlesConfig): Phaser.GameObjects.Particles.ParticleEmitter
    {
        const emitter = this.scene.add.particles(0, 0, TEXTURES.spark, {
            emitZone: { type: 'random', source: PARTICLE_ZONE, quantity: 1 },
            frequency: config.frequencyMs,
            lifespan: { min: config.lifespanMs[0], max: config.lifespanMs[1] },
            speedY: { min: -config.riseSpeed[1], max: -config.riseSpeed[0] },
            speedX: { min: -8, max: 8 },
            scale: { start: config.scale, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: config.color,
            blendMode: 'ADD'
        }).setDepth(this.fighter.depth - 1);

        emitter.startFollow(this.fighter);

        return emitter;
    }

    private createSparks (config: AuraSparksConfig): Phaser.GameObjects.Particles.ParticleEmitter
    {
        const emitter = this.scene.add.particles(0, 0, TEXTURES.spark, {
            emitZone: { type: 'random', source: SPARK_ZONE, quantity: 1 },
            frequency: config.frequencyMs,
            lifespan: { min: 220, max: 420 },
            speed: { min: config.speed[0], max: config.speed[1] },
            angle: { min: 0, max: 360 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: config.color,
            blendMode: 'ADD'
        }).setDepth(this.fighter.depth + 1);

        emitter.startFollow(this.fighter);

        return emitter;
    }

    private follow (): void
    {
        const visible = this.fighter.visible;

        this.halo.setPosition(this.fighter.x, this.fighter.y).setVisible(visible);
        this.outerHalo?.setPosition(this.fighter.x, this.fighter.y).setVisible(visible);
        this.setEmitting(this.particles, visible);
        this.setEmitting(this.sparks, visible);
        this.placeRunes(visible);

        if (visible)
        {
            this.leaveAfterimage();
        }
    }

    private setEmitting (emitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined, emitting: boolean): void
    {
        if (emitter && emitter.emitting !== emitting)
        {
            emitter.emitting = emitting;
        }
    }

    /**
     * Runes turn on a flattened ellipse: on the lower half of the orbit they
     * pass in front of the fighter, on the upper half behind it.
     */
    private placeRunes (visible: boolean): void
    {
        const config = this.runesConfig;

        if (!config)
        {
            return;
        }

        const baseAngle = (this.scene.time.now / config.periodMs) * PhaserMath.PI2;

        this.runes.forEach((rune, index) => {
            const angle = baseAngle + (index * PhaserMath.PI2) / this.runes.length;
            const sin = Math.sin(angle);

            rune.setPosition(
                this.fighter.x + Math.cos(angle) * config.radiusX,
                this.fighter.y + sin * config.radiusY
            );
            rune.setDepth(this.fighter.depth + (sin > 0 ? 1 : -1));
            //  Slightly smaller and dimmer behind the fighter, for a sense of depth
            rune.setScale(1 + sin * 0.15);
            rune.setAlpha(0.8 + sin * 0.2);
            rune.setVisible(visible);
        });
    }

    /** While the fighter moves, leaves a dark copy of its current frame that fades out. */
    private leaveAfterimage (): void
    {
        const config = this.afterimageConfig;
        const body = this.fighter.body as Phaser.Physics.Arcade.Body | null;
        const now = this.scene.time.now;

        if (!config || !body || body.velocity.x === 0 || now < this.nextAfterimageTime)
        {
            return;
        }

        this.nextAfterimageTime = now + config.intervalMs;

        const copy = this.scene.add.image(this.fighter.x, this.fighter.y, this.fighter.texture.key, this.fighter.frame.name)
            .setScale(this.fighter.scaleX, this.fighter.scaleY)
            .setFlipX(this.fighter.flipX)
            .setTintFill(config.color)
            .setAlpha(config.alpha)
            .setDepth(this.fighter.depth - 1);

        this.scene.tweens.add({
            targets: copy,
            alpha: 0,
            duration: config.fadeMs,
            onComplete: () => copy.destroy()
        });
    }

    private destroy (): void
    {
        this.scene.events.off(Scenes.Events.POST_UPDATE, this.follow, this);
        this.halo.destroy();
        this.outerHalo?.destroy();
        this.particles?.destroy();
        this.sparks?.destroy();
        this.runes.forEach((rune) => rune.destroy());
    }

}
