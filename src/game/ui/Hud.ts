import type { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { Fighter } from '../entities/Fighter';
import { AMMUNITION_EVENTS } from '../systems/Ammunition';
import { HEALTH_EVENTS } from '../systems/Health';
import { formatTime } from '../utils/formatTime';
import { HealthBar } from './HealthBar';

const PANEL_HEIGHT = 60;
const PANEL_DEPTH = 25;
const UI_DEPTH = 30;
const MARGIN_X = 24;
const HEALTH_BAR_WIDTH = 280;
const LOW_AMMUNITION = 5;
//  Below this many seconds the timer turns red
const LOW_TIME_SECONDS = 10;

/**
 * Combat UI: the opponent in the top banner, the player in the bottom one.
 * It updates by listening to the HP and ammunition of the fighters, without
 * taking part in the combat rules.
 */
export class Hud {

    private readonly scene: Scene;
    private readonly timerText: Phaser.GameObjects.Text;
    private displayedSeconds = -1;

    constructor (scene: Scene, player: Fighter, enemy: Fighter, fightLabel: string)
    {
        this.scene = scene;

        this.createFighterPanel(0, enemy, enemy.character.name.toUpperCase());
        this.createFighterPanel(GAME_HEIGHT - PANEL_HEIGHT, player, 'YOU');

        scene.add.text(GAME_WIDTH / 2, 16, fightLabel, {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#fbbf24'
        }).setOrigin(0.5).setDepth(UI_DEPTH);

        this.timerText = scene.add.text(GAME_WIDTH / 2, 40, '', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#e0f2fe'
        }).setOrigin(0.5).setDepth(UI_DEPTH);

        scene.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT - (PANEL_HEIGHT / 2),
            '← → / A D: move   •   Space: fire   •   Esc / P: pause',
            {
                fontFamily: 'Arial',
                fontSize: 13,
                color: '#94a3b8'
            }
        ).setOrigin(0.5).setDepth(UI_DEPTH);
    }

    /** Countdown shown in the top banner, refreshed only when the second changes. */
    setTimeLeft (milliseconds: number): void
    {
        const seconds = Math.max(0, Math.ceil(milliseconds / 1000));

        if (seconds === this.displayedSeconds)
        {
            return;
        }

        this.displayedSeconds = seconds;
        this.timerText
            .setText(formatTime(seconds * 1000))
            .setColor(seconds <= LOW_TIME_SECONDS ? '#f87171' : '#e0f2fe');
    }

    showBanner (title: string, subtitle: string, accent = 0x38bdf8): void
    {
        const banner = this.scene.add.container(GAME_WIDTH / 2, 368)
            .setDepth(50)
            .setAlpha(0)
            .setScale(0.92);

        const background = this.scene.add.rectangle(0, 0, GAME_WIDTH, 120, 0x020617, 0.88);
        const accentTop = this.scene.add.rectangle(0, -58, GAME_WIDTH, 3, accent, 0.9);
        const accentBottom = this.scene.add.rectangle(0, 58, GAME_WIDTH, 3, accent, 0.55);
        const titleText = this.scene.add.text(0, -16, title, {
            fontFamily: 'Arial Black',
            fontSize: 40,
            color: '#e0f2fe'
        }).setOrigin(0.5);
        const subtitleText = this.scene.add.text(0, 28, subtitle, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#7dd3fc'
        }).setOrigin(0.5);

        banner.add([background, accentTop, accentBottom, titleText, subtitleText]);

        this.scene.tweens.add({
            targets: banner,
            alpha: 1,
            scale: 1,
            y: 384,
            duration: 260,
            hold: 1050,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => banner.destroy()
        });
    }

    private createFighterPanel (top: number, fighter: Fighter, label: string): void
    {
        this.scene.add.rectangle(0, top, GAME_WIDTH, PANEL_HEIGHT, 0x020617, 0.62)
            .setOrigin(0)
            .setDepth(PANEL_DEPTH);

        const healthBar = new HealthBar(
            this.scene,
            MARGIN_X,
            top + 34,
            HEALTH_BAR_WIDTH,
            label,
            fighter.health.max
        );

        fighter.health.on(HEALTH_EVENTS.changed, (current: number, max: number) => {
            healthBar.set(current, max);
        });

        this.scene.add.text(GAME_WIDTH - MARGIN_X, top + 12, 'AMMO', {
            fontFamily: 'Arial Black',
            fontSize: 12,
            color: '#7dd3fc'
        }).setOrigin(1, 0).setDepth(UI_DEPTH);

        const ammunitionText = this.scene.add.text(GAME_WIDTH - MARGIN_X, top + 26, '', {
            fontFamily: 'Arial Black',
            fontSize: 22,
            color: '#e0f2fe'
        }).setOrigin(1, 0).setDepth(UI_DEPTH);

        const refreshAmmunition = (current: number, max: number): void => {
            ammunitionText
                .setText(`${current} / ${max}`)
                .setColor(current === 0 ? '#f87171' : current <= LOW_AMMUNITION ? '#fbbf24' : '#e0f2fe');
        };

        refreshAmmunition(fighter.ammunition.current, fighter.ammunition.max);
        fighter.ammunition.on(AMMUNITION_EVENTS.changed, refreshAmmunition);
    }

}
