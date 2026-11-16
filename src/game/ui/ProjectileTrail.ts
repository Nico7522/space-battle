import { Scenes } from 'phaser';
import type { Scene } from 'phaser';
import { TEXTURES } from '../config/constants';
import type { ProjectileTrailConfig } from '../data/auras';
import type { Projectile } from '../entities/Projectile';
import type { CombatSystem } from '../systems/CombatSystem';
import type { FighterSide } from '../types/duel';

const TRAIL_DEPTH = 4;

/**
 * Glowing trail behind every projectile fired by one side. A single emitter
 * serves all of them, so pooled projectiles need no effect of their own.
 */
export class ProjectileTrail {

    private readonly emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private readonly emitAt = (projectile: Projectile): void => {
        this.emitter.emitParticleAt(projectile.x, projectile.y);
    };

    constructor (
        private readonly scene: Scene,
        private readonly combat: CombatSystem,
        private readonly owner: FighterSide,
        config: ProjectileTrailConfig
    )
    {
        this.emitter = scene.add.particles(0, 0, TEXTURES.spark, {
            lifespan: config.lifespanMs,
            speed: { min: 0, max: 12 },
            scale: { start: config.scale, end: 0 },
            alpha: { start: 0.55, end: 0 },
            tint: config.color,
            blendMode: 'ADD',
            emitting: false
        }).setDepth(TRAIL_DEPTH);

        scene.events.on(Scenes.Events.POST_UPDATE, this.emit, this);
        scene.events.once(Scenes.Events.SHUTDOWN, this.destroy, this);
    }

    private emit (): void
    {
        this.combat.forEachActiveProjectile(this.owner, this.emitAt);
    }

    private destroy (): void
    {
        this.scene.events.off(Scenes.Events.POST_UPDATE, this.emit, this);
        this.emitter.destroy();
    }

}
