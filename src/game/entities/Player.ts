import { Input } from 'phaser';
import type { Scene } from 'phaser';
import type { CharacterConfig } from '../data/characters';
import type { SpriteVisual } from '../data/skins';
import { Fighter } from './Fighter';

/** Keyboard-controlled fighter: ← → or A/D to move, Space to fire. */
export class Player extends Fighter {

    private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private readonly keyA: Input.Keyboard.Key;
    private readonly keyD: Input.Keyboard.Key;
    private readonly fireKey: Input.Keyboard.Key;

    constructor (scene: Scene, x: number, y: number, character: CharacterConfig, visual: SpriteVisual)
    {
        super(scene, x, y, 'player', character, visual);

        const keyboard = scene.input.keyboard;

        if (!keyboard)
        {
            throw new Error('A keyboard is required to control the player.');
        }

        this.cursors = keyboard.createCursorKeys();
        this.keyA = keyboard.addKey(Input.Keyboard.KeyCodes.A);
        this.keyD = keyboard.addKey(Input.Keyboard.KeyCodes.D);
        this.fireKey = keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    }

    /** Applies the requested movement and tells whether the player wants to fire. */
    handleInput (): boolean
    {
        const movingLeft = this.cursors.left.isDown || this.keyA.isDown;
        const movingRight = this.cursors.right.isDown || this.keyD.isDown;

        if (movingLeft === movingRight)
        {
            this.move(0);
        }
        else
        {
            this.move(movingLeft ? -1 : 1);
        }

        return this.fireKey.isDown;
    }

}
