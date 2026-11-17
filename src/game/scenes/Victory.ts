import { Scene } from 'phaser';
import { getActiveMode } from '../modes/activeMode';
import type { FightOutcome } from '../modes/GameMode';
import { audioManager } from '../systems/AudioManager';
import type { DuelEndReason, DuelResult } from '../types/duel';
import { createResultScreen } from '../ui/ResultScreen';

const VICTORY_SUBTITLES: Record<DuelEndReason, (enemyName: string) => string> = {
    ko: (enemyName) => `${enemyName} is defeated!`,
    ammunition: () => 'Out of ammo: you have the most HP left',
    time: () => 'Time is up: you have the most HP left'
};

interface VictoryData {
    result: DuelResult;
    outcome: FightOutcome;
}

/**
 * Victory screen: a won fight, the end of a part of the mode (e.g. a campaign
 * stage), or the end of the mode after its last fight.
 */
export class Victory extends Scene {

    private victory!: VictoryData;

    constructor ()
    {
        super('Victory');
    }

    init (data: VictoryData): void
    {
        this.victory = data;
    }

    create (): void
    {
        const { result, outcome } = this.victory;
        const mode = getActiveMode();

        audioManager.playVictory();

        if (outcome.resolution === 'completed')
        {
            createResultScreen(this, {
                title: `${mode.name.toUpperCase()} COMPLETE`,
                subtitle: `You have beaten every level of the ${mode.name.toLowerCase()}!`,
                titleColor: '#fbbf24',
                result,
                buttons: [
                    { label: 'MAIN MENU', onClick: () => this.scene.start('MainMenu') }
                ]
            });

            return;
        }

        createResultScreen(this, {
            title: outcome.milestoneTitle ?? 'VICTORY',
            subtitle: outcome.victorySubtitle ?? VICTORY_SUBTITLES[result.reason](result.enemyName),
            titleColor: '#fbbf24',
            result,
            buttons: [
                {
                    label: outcome.nextFightLabel ?? 'NEXT FIGHT',
                    onClick: () => {
                        mode.advance();
                        this.scene.start('Game');
                    }
                },
                { label: 'MAIN MENU', onClick: () => this.scene.start('MainMenu') }
            ]
        });
    }

}
