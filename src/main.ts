import StartGame from './game/main';
import { audioManager } from './game/systems/AudioManager';

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

    const unlockAudio = (): void => {
        audioManager.unlock();
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

});
