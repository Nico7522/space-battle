import { TEXTURES } from '../config/constants';

/**
 * A projectile is independent of the character firing it: any character
 * can reference any projectile.
 */
export interface ProjectileConfig {
    id: string;
    name: string;
    textureKey: string;
    damage: number;
    /** Speed in pixels per second. The direction depends on the side of the shooter. */
    speed: number;
    hitWidth: number;
    hitHeight: number;
    blendMode: 'add' | 'normal';
    /** Color of the related effects (muzzle flash, impact). */
    color: number;
}

/**
 * Look of a projectile only. A skin may change it, but never the damage,
 * speed or hitbox, which always come from the character.
 */
export type ProjectileAppearance = Pick<ProjectileConfig, 'textureKey' | 'blendMode' | 'color'>;

export const LASER_PROJECTILE: ProjectileConfig = {
    id: 'laser',
    name: 'Laser',
    textureKey: TEXTURES.laser,
    damage: 10,
    speed: 720,
    hitWidth: 6,
    hitHeight: 22,
    blendMode: 'add',
    color: 0x7dd3fc
};

export const MAGIC_ORB_PROJECTILE: ProjectileConfig = {
    id: 'magic-orb',
    name: 'Magic Orb',
    textureKey: TEXTURES.magicOrb,
    damage: 10,
    speed: 420,
    hitWidth: 16,
    hitHeight: 16,
    blendMode: 'add',
    color: 0xc084fc
};
