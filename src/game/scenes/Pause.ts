import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { skinManager } from '../systems/SkinManager';
import { createButton } from '../ui/Button';

export class Pause extends Scene {

    constructor ()
    {
        super('Pause');
    }

    create (): void
    {
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x020617, 0.8)
            .setOrigin(0);

        this.add.rectangle(GAME_WIDTH / 2, 380, 620, 590, 0x0f172a, 0.55)
            .setStrokeStyle(2, 0x1e3a5f);

        this.add.text(GAME_WIDTH / 2, 140, 'PAUSED', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#e0f2fe',
            stroke: '#020617',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 204, 'The duel is on hold', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#7dd3fc'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 242, `Current skin: ${skinManager.selectedSkin.name}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#cbd5e1'
        }).setOrigin(0.5);

        createButton(this, GAME_WIDTH / 2, 330, 'RESUME', () => {
            this.resumeGame();
        });

        createButton(this, GAME_WIDTH / 2, 402, 'CHANGE SKIN', () => {
            this.scene.launch('SkinSelect', { caller: 'Game' });
            this.scene.stop();
        });

        createButton(this, GAME_WIDTH / 2, 474, 'RESTART', () => {
            this.scene.stop('Game');
            this.scene.start('Game');
            this.scene.stop();
        });

        createButton(this, GAME_WIDTH / 2, 546, 'SETTINGS', () => {
            this.scene.launch('Settings', { caller: 'Game' });
            this.scene.stop();
        });

        createButton(this, GAME_WIDTH / 2, 618, 'MAIN MENU', () => {
            this.scene.stop('Game');
            this.scene.start('MainMenu');
            this.scene.stop();
        });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 43, 'Esc / P: resume', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#64748b'
        }).setOrigin(0.5);

        this.input.keyboard?.on('keydown-ESC', this.resumeGame, this);
        this.input.keyboard?.on('keydown-P', this.resumeGame, this);
    }

    private resumeGame (): void
    {
        this.scene.resume('Game');
        this.scene.stop();
    }

}
