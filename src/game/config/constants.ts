export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

/** Duel arena: the player at the bottom, the opponent at the top, facing each other. */
export const ARENA = {
    playerY: GAME_HEIGHT - 124,
    enemyY: 142,
    //  Delay between the end of the fight and the result screen (lets effects play out)
    endDelayMs: 900
} as const;

/** Textures drawn by code (Preloader). */
export const TEXTURES = {
    background: 'background',
    starsFar: 'stars-far',
    starsNear: 'stars-near',
    nebula: 'nebula',
    spark: 'spark',
    glow: 'glow',
    arrowShip: 'player',
    laser: 'laser',
    magicOrb: 'magic-orb',
    airBlade: 'air-blade',
    rune: 'rune'
} as const;

export const AUDIO = {
    sfxVolume: 0.6,
    musicVolume: 0.16
} as const;

export const SAVE = {
    storageKey: 'shooting-game.save.v1',
    //  v6 remembers the story dialogues already seen; older saves are upgraded on load
    version: 6
} as const;
