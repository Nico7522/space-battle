import { AUTO, Scale } from 'phaser';
import { Boot } from '../scenes/Boot';
import { GameOver } from '../scenes/GameOver';
import { Dialogue } from '../scenes/Dialogue';
import { Game as MainGame } from '../scenes/Game';
import { LevelSelect } from '../scenes/LevelSelect';
import { MainMenu } from '../scenes/MainMenu';
import { Pause } from '../scenes/Pause';
import { Preloader } from '../scenes/Preloader';
import { Settings } from '../scenes/Settings';
import { SkinSelect } from '../scenes/SkinSelect';
import { Victory } from '../scenes/Victory';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#020617',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    render: {
        antialias: true,
        roundPixels: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        Pause,
        Settings,
        GameOver,
        Victory,
        SkinSelect,
        LevelSelect,
        Dialogue
    ]
};
