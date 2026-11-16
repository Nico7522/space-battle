import { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { audioManager } from '../systems/AudioManager';
import { createSpaceBackdrop } from '../ui/Background';
import { createButton } from '../ui/Button';

type SettingsCaller = 'MainMenu' | 'Game';

interface SettingsData {
    caller?: SettingsCaller;
}

export class Settings extends Scene {

    private caller: SettingsCaller = 'MainMenu';

    constructor ()
    {
        super('Settings');
    }

    init (data?: SettingsData): void
    {
        this.caller = data?.caller === 'Game' ? 'Game' : 'MainMenu';
    }

    create (): void
    {
        createSpaceBackdrop(this, {
            imageAlpha: 0.4,
            overlayAlpha: 0.58
        });

        this.cameras.main.fadeIn(220, 2, 6, 23);

        this.add.text(GAME_WIDTH / 2, 110, 'SETTINGS', {
            fontFamily: 'Arial Black',
            fontSize: 52,
            color: '#e0f2fe',
            stroke: '#020617',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 160, 'Set the mood for your duels', {
            fontFamily: 'Arial',
            fontSize: 19,
            color: '#7dd3fc'
        }).setOrigin(0.5);

        this.createToggleRow(
            300,
            'SOUND EFFECTS',
            'Shots, explosions and transitions',
            audioManager.soundEnabled,
            (enabled) => audioManager.setSoundEnabled(enabled)
        );

        this.createToggleRow(
            410,
            'BACKGROUND MUSIC',
            'A subtle space ambience while you play',
            audioManager.musicEnabled,
            (enabled) => audioManager.setMusicEnabled(enabled)
        );

        this.add.text(GAME_WIDTH / 2, 510, 'Settings are saved automatically.', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#94a3b8'
        }).setOrigin(0.5);

        createButton(this, GAME_WIDTH / 2, 595, 'BACK', () => {
            this.close();
        });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 45, 'Esc: back', {
            fontFamily: 'Arial',
            fontSize: 15,
            color: '#64748b'
        }).setOrigin(0.5);

        this.input.keyboard?.on('keydown-ESC', this.close, this);
    }

    private createToggleRow (
        y: number,
        label: string,
        description: string,
        initialValue: boolean,
        onChange: (enabled: boolean) => void
    ): void
    {
        const left = GAME_WIDTH / 2 - 360;
        let enabled = initialValue;

        this.add.rectangle(GAME_WIDTH / 2, y, 720, 96, 0x0f172a, 0.92)
            .setStrokeStyle(2, 0x1e3a5f);

        this.add.text(left + 28, y - 24, label, {
            fontFamily: 'Arial Black',
            fontSize: 22,
            color: '#e0f2fe'
        }).setOrigin(0, 0.5);

        this.add.text(left + 28, y + 16, description, {
            fontFamily: 'Arial',
            fontSize: 15,
            color: '#94a3b8'
        }).setOrigin(0, 0.5);

        const button = this.add.text(GAME_WIDTH / 2 + 250, y, '', {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#ffffff',
            padding: { x: 26, y: 12 },
            align: 'center'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const refresh = (): void => {
            button.setText(enabled ? 'ON' : 'OFF');
            button.setBackgroundColor(enabled ? '#15803d' : '#7f1d1d');
        };

        refresh();

        button.on('pointerover', () => {
            this.tweens.killTweensOf(button);
            this.tweens.add({
                targets: button,
                scale: 1.06,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });

        button.on('pointerout', () => {
            this.tweens.killTweensOf(button);
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });

        button.on('pointerdown', () => {
            enabled = !enabled;
            refresh();
            onChange(enabled);
            audioManager.playClick();
        });
    }

    private close (): void
    {
        if (this.caller === 'Game')
        {
            this.scene.start('Pause');

            return;
        }

        this.scene.start('MainMenu');
    }

}
