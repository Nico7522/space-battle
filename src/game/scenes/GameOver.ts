import { Scene } from 'phaser';
import { audioManager } from '../systems/AudioManager';
import type { DuelEndReason, DuelResult } from '../types/duel';
import { createResultScreen } from '../ui/ResultScreen';

const DEFEAT_SUBTITLES: Record<DuelEndReason, (enemyName: string) => string> = {
    ko: (enemyName) => `${enemyName} defeated you`,
    ammunition: (enemyName) => `Out of ammo: ${enemyName} keeps the upper hand`,
    time: (enemyName) => `Time is up: ${enemyName} keeps the upper hand`
};

/** Defeat screen: the same fight can be retried. */
export class GameOver extends Scene {

    private result!: DuelResult;

    constructor ()
    {
        super('GameOver');
    }

    init (data: DuelResult): void
    {
        this.result = data;
    }

    create (): void
    {
        audioManager.playGameOver();

        createResultScreen(this, {
            title: 'DEFEAT',
            subtitle: DEFEAT_SUBTITLES[this.result.reason](this.result.enemyName),
            titleColor: '#f87171',
            result: this.result,
            buttons: [
                { label: 'RETRY LEVEL', onClick: () => this.scene.start('Game') },
                { label: 'MAIN MENU', onClick: () => this.scene.start('MainMenu') }
            ]
        });
    }

}
