import type { Scene } from 'phaser';
import type { CharacterConfig } from '../data/characters';
import type { SpriteVisual } from '../data/skins';
import { Fighter } from './Fighter';

/**
 * Arena opponent. It carries out the actions it is asked to perform (move,
 * tryFire): its decisions are made by the AI controller, not here.
 */
export class Enemy extends Fighter {

    constructor (scene: Scene, x: number, y: number, character: CharacterConfig, visual: SpriteVisual)
    {
        super(scene, x, y, 'enemy', character, visual);
    }

}
