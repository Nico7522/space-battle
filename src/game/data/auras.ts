/** Small motes of light rising from the lower part of the fighter. */
export interface AuraParticlesConfig {
    color: number;
    /** Delay between two motes. */
    frequencyMs: number;
    /** How long a mote lives, as a random range. */
    lifespanMs: readonly [number, number];
    /** Upward speed in pixels per second, as a random range. */
    riseSpeed: readonly [number, number];
    /** Starting size relative to the 12 px spark texture; motes shrink to nothing. */
    scale: number;
}

/** Small glyphs orbiting the fighter on a flattened ellipse, passing in front of it and behind it. */
export interface AuraRunesConfig {
    count: number;
    color: number;
    /** Horizontal and vertical radius of the orbit, in pixels. */
    radiusX: number;
    radiusY: number;
    /** Duration of one full turn. */
    periodMs: number;
}

/** Second, larger halo behind the main one, giving the aura a colored edge. */
export interface AuraOuterHaloConfig {
    color: number;
    scale: readonly [number, number];
    alpha: readonly [number, number];
}

/** Short-lived sparks crackling outward from the fighter. */
export interface AuraSparksConfig {
    color: number;
    /** Delay between two sparks. */
    frequencyMs: number;
    /** Outward speed in pixels per second, as a random range. */
    speed: readonly [number, number];
}

/** Fading dark copies of the fighter left behind while it moves. */
export interface AuraAfterimageConfig {
    color: number;
    /** Delay between two copies while moving. */
    intervalMs: number;
    /** How long a copy takes to fade out. */
    fadeMs: number;
    /** Opacity of a fresh copy. */
    alpha: number;
}

/** Glowing trail left by the fighter's projectiles. */
export interface ProjectileTrailConfig {
    color: number;
    /** How long each trail mote lives. */
    lifespanMs: number;
    /** Starting size relative to the 12 px spark texture. */
    scale: number;
}

/**
 * Glowing halo drawn behind a fighter. Purely visual: it never changes stats
 * or the hitbox. Levels use it to show that an opponent grows stronger.
 */
export interface AuraConfig {
    color: number;
    /** Size of the halo relative to the 64 px glow texture, from smallest to largest. */
    scale: readonly [number, number];
    /** Opacity of the halo, from faintest to brightest. */
    alpha: readonly [number, number];
    /** Duration of one breath, from small to large. */
    pulseMs: number;
    /** Second color: the halo slowly shifts between `color` and this one. */
    shiftColor?: number;
    /** Duration of one shift from `color` to `shiftColor`. */
    shiftMs?: number;
    outerHalo?: AuraOuterHaloConfig;
    particles?: AuraParticlesConfig;
    sparks?: AuraSparksConfig;
    runes?: AuraRunesConfig;
    afterimage?: AuraAfterimageConfig;
    projectileTrail?: ProjectileTrailConfig;
}

/** Stage 1, level 2: Sorcerer Space starts to gather power, a faint violet halo. */
export const SORCERER_SPACE_AURA_LEVEL_2: AuraConfig = {
    color: 0xc4b5fd,
    scale: [1.5, 1.85],
    alpha: [0.22, 0.42],
    pulseMs: 1400
};

/** Stage 1, level 3: a stronger halo, and violet motes rising from the robe. */
export const SORCERER_SPACE_AURA_LEVEL_3: AuraConfig = {
    color: 0xa78bfa,
    scale: [1.7, 2.15],
    alpha: [0.3, 0.52],
    pulseMs: 1200,
    particles: {
        color: 0xc084fc,
        frequencyMs: 70,
        lifespanMs: [700, 1100],
        riseSpeed: [45, 90],
        scale: 0.95
    }
};

/**
 * Stage 1, level 4: the halo shifts from violet to magenta, two runes orbit
 * Sorcerer Space and its orbs leave a glowing trail.
 */
export const SORCERER_SPACE_AURA_LEVEL_4: AuraConfig = {
    color: 0xa855f7,
    shiftColor: 0xe879f9,
    shiftMs: 1800,
    scale: [1.85, 2.35],
    alpha: [0.36, 0.6],
    pulseMs: 1050,
    particles: {
        color: 0xf0abfc,
        frequencyMs: 50,
        lifespanMs: [700, 1200],
        riseSpeed: [50, 100],
        scale: 1
    },
    runes: {
        count: 2,
        color: 0xf5d0fe,
        radiusX: 46,
        radiusY: 14,
        periodMs: 2600
    },
    projectileTrail: {
        color: 0xd946ef,
        lifespanMs: 220,
        scale: 0.6
    }
};

/**
 * Stage 1, level 5: ultimate form. A dark, intense halo with a red edge,
 * crackling sparks, three faster runes, a shadow trail when it moves and a
 * brighter trail behind its orbs.
 */
export const SORCERER_SPACE_AURA_LEVEL_5: AuraConfig = {
    color: 0x7e22ce,
    shiftColor: 0xa21caf,
    shiftMs: 1400,
    scale: [1.95, 2.45],
    alpha: [0.5, 0.75],
    pulseMs: 900,
    outerHalo: {
        color: 0xdc2626,
        scale: [2.6, 3.1],
        alpha: [0.18, 0.32]
    },
    particles: {
        color: 0xc026d3,
        frequencyMs: 45,
        lifespanMs: [700, 1200],
        riseSpeed: [55, 110],
        scale: 1
    },
    sparks: {
        color: 0xf87171,
        frequencyMs: 120,
        speed: [70, 150]
    },
    runes: {
        count: 3,
        color: 0xfca5a5,
        radiusX: 50,
        radiusY: 15,
        periodMs: 1700
    },
    afterimage: {
        color: 0x581c87,
        intervalMs: 70,
        fadeMs: 320,
        alpha: 0.45
    },
    projectileTrail: {
        color: 0xf43f5e,
        lifespanMs: 260,
        scale: 0.75
    }
};
