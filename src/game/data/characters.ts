import { LASER_PROJECTILE, MAGIC_ORB_PROJECTILE } from './projectiles';
import type { ProjectileConfig } from './projectiles';
import { SKINS, createStripVisual } from './skins';
import type { SpriteVisual } from './skins';

/**
 * Combat stats of a character, kept separate from its appearance.
 * Levels will be able to override some values (ammunition, fire rate…).
 */
export interface CharacterConfig {
    id: string;
    name: string;
    maxHealth: number;
    /** Horizontal movement speed in pixels per second. */
    speed: number;
    /** Total ammunition for one fight, with no reloading. */
    ammunition: number;
    /** Minimum delay between two shots. */
    fireIntervalMs: number;
    projectile: ProjectileConfig;
    /** Collision area, centered on the sprite (64 × 64 texture). */
    hitbox: { width: number; height: number };
}

/** The pilot controlled by the player. Its appearance comes from the selected skin. */
export const PLAYER_CHARACTER: CharacterConfig = {
    id: 'pilot',
    name: 'Pilot',
    maxHealth: 100,
    speed: 420,
    ammunition: 40,
    fireIntervalMs: 320,
    projectile: LASER_PROJECTILE,
    hitbox: { width: 44, height: 52 }
};

export const SORCERER_SPACE: CharacterConfig = {
    id: 'sorcerer-space',
    name: 'Sorcerer Space',
    maxHealth: 100,
    speed: 220,
    ammunition: 40,
    fireIntervalMs: 900,
    projectile: MAGIC_ORB_PROJECTILE,
    hitbox: { width: 44, height: 56 }
};

//  sorcerer.png: frame 0 idle, frame 1 staff raised (firing)
export const SORCERER_SPACE_VISUAL: SpriteVisual = createStripVisual('sorcerer-space', {
    path: 'sorcerer.png',
    frameSize: 32,
    idle: [0],
    fire: 1
});

//  sorcerer_max_power.png (level 5): frame 0 idle with two staves and red eyes,
//  frame 1 both staves raised (firing). Frames 2-4 are unused: they repeat the
//  single-staff pose of sorcerer.png and would break the max power look.
export const SORCERER_SPACE_MAX_POWER_VISUAL: SpriteVisual = createStripVisual('sorcerer-space-max-power', {
    path: 'sorcerer_max_power.png',
    frameSize: 32,
    idle: [0],
    fire: 1
});

/** Every appearance in the game: player skins and opponents. */
export const ALL_VISUALS: readonly SpriteVisual[] = [
    ...SKINS,
    SORCERER_SPACE_VISUAL,
    SORCERER_SPACE_MAX_POWER_VISUAL
];

/** Appearances drawn on a template sheet, loaded and sliced by the Preloader. */
export const STRIP_VISUALS: readonly SpriteVisual[] = ALL_VISUALS
    .filter((visual) => visual.strip !== undefined);
