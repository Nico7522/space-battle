import { BlendModes, Physics } from 'phaser';
import type { Scene } from 'phaser';
import { GAME_HEIGHT, TEXTURES } from '../config/constants';
import type { ProjectileConfig } from '../data/projectiles';
import type { FighterSide } from '../types/duel';

const PROJECTILE_DEPTH = 5;

/** Reusable (pooled) projectile: the same object serves both sides. */
export class Projectile extends Physics.Arcade.Sprite {

    private ownerSide: FighterSide = 'player';
    private damageValue = 0;

    constructor (scene: Scene, x: number, y: number)
    {
        super(scene, x, y, TEXTURES.laser);

        this.setDepth(PROJECTILE_DEPTH);
    }

    get owner (): FighterSide
    {
        return this.ownerSide;
    }

    get damage (): number
    {
        return this.damageValue;
    }

    launch (x: number, y: number, config: ProjectileConfig, owner: FighterSide, directionY: -1 | 1): void
    {
        this.ownerSide = owner;
        this.damageValue = config.damage;

        this.setTexture(config.textureKey);
        this.setBlendMode(config.blendMode === 'add' ? BlendModes.ADD : BlendModes.NORMAL);
        this.setFlipY(directionY === 1);
        this.enableBody(true, x, y, true, true);

        const body = this.body as Physics.Arcade.Body;

        body.setAllowGravity(false);
        body.setSize(config.hitWidth, config.hitHeight, true);
        body.setVelocity(0, directionY * config.speed);
    }

    deactivate (): void
    {
        this.disableBody(true, true);
    }

    preUpdate (time: number, delta: number): void
    {
        super.preUpdate(time, delta);

        if (this.active && (this.y < -this.displayHeight || this.y > GAME_HEIGHT + this.displayHeight))
        {
            this.deactivate();
        }
    }

}
