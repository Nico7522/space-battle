import { Scene } from 'phaser';
import { ARENA, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { DialogueSpeaker } from '../data/dialogues';

/** A line ready to display: the speaker is already resolved to a name and a portrait. */
export interface DialogueLineView {
    speaker: DialogueSpeaker;
    name?: string;
    portraitKey?: string;
    text: string;
}

export interface DialogueData {
    lines: readonly DialogueLineView[];
    /** Paused scene to resume once the dialogue is over. */
    returnTo: string;
}

/** Data passed to the resumed scene, so it knows the dialogue is finished. */
export interface DialogueResumeData {
    dialogueComplete: true;
}

const BOX_WIDTH = 780;
const BOX_HEIGHT = 170;
const BOX_RADIUS = 14;
const BOX_PADDING = 28;
const PORTRAIT_SIZE = 96;
const TYPE_DELAY_MS = 28;
const OVERLAY_ALPHA = 0.55;
const DEPTH = 100;
//  Space kept between a speaking fighter's center and the edge of its box
const FIGHTER_CLEARANCE = 80;

//  Characters speak near where they stand: the opponent at the top of the
//  arena, the player at the bottom; the narrator speaks from the center
const BOX_Y: Record<DialogueSpeaker, number> = {
    narrator: GAME_HEIGHT / 2,
    opponent: ARENA.enemyY + FIGHTER_CLEARANCE + BOX_HEIGHT / 2,
    player: ARENA.playerY - FIGHTER_CLEARANCE - BOX_HEIGHT / 2
};

const NAME_COLORS: Record<DialogueSpeaker, string> = {
    narrator: '#e0f2fe',
    opponent: '#c084fc',
    player: '#7dd3fc'
};

/**
 * Story dialogue shown over a paused scene. Text appears letter by letter;
 * Space, Enter or a click reveals the whole line, then moves to the next one.
 * Esc skips the rest of the dialogue.
 */
export class Dialogue extends Scene {

    private lines: readonly DialogueLineView[] = [];
    private returnTo = '';
    private lineIndex = 0;
    private visibleChars = 0;
    private typeTimer?: Phaser.Time.TimerEvent;
    private box!: Phaser.GameObjects.Container;
    private textObject!: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Dialogue');
    }

    init (data: DialogueData): void
    {
        this.lines = data.lines;
        this.returnTo = data.returnTo;
        this.lineIndex = 0;
    }

    create (): void
    {
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x020617, OVERLAY_ALPHA)
            .setOrigin(0)
            .setDepth(DEPTH);

        this.box = this.add.container(GAME_WIDTH / 2, 0).setDepth(DEPTH + 1);

        this.input.keyboard?.on('keydown-SPACE', this.advance, this);
        this.input.keyboard?.on('keydown-ENTER', this.advance, this);
        this.input.keyboard?.on('keydown-ESC', this.finish, this);
        this.input.on('pointerdown', this.advance, this);

        this.showLine();
    }

    private showLine (): void
    {
        const line = this.lines[this.lineIndex];

        this.box.removeAll(true);
        this.box.setY(BOX_Y[line.speaker]);

        const background = this.add.graphics();

        background.fillStyle(0x0f172a, 0.94);
        background.fillRoundedRect(-BOX_WIDTH / 2, -BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT, BOX_RADIUS);
        background.lineStyle(2, 0x38bdf8, 0.7);
        background.strokeRoundedRect(-BOX_WIDTH / 2, -BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT, BOX_RADIUS);
        this.box.add(background);

        let textLeft = -BOX_WIDTH / 2 + BOX_PADDING;

        if (line.portraitKey)
        {
            const portrait = this.add.image(textLeft + PORTRAIT_SIZE / 2, 0, line.portraitKey)
                .setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE);

            this.box.add(portrait);
            textLeft += PORTRAIT_SIZE + BOX_PADDING;
        }

        const textWidth = BOX_WIDTH / 2 - BOX_PADDING - textLeft;
        const isNarrator = line.speaker === 'narrator';
        let textTop = -BOX_HEIGHT / 2 + BOX_PADDING;

        if (line.name)
        {
            this.box.add(this.add.text(textLeft, textTop, line.name.toUpperCase(), {
                fontFamily: 'Arial Black',
                fontSize: 16,
                color: NAME_COLORS[line.speaker]
            }));
            textTop += 30;
        }

        this.textObject = this.add.text(textLeft, textTop, '', {
            fontFamily: 'Arial',
            fontSize: 21,
            fontStyle: isNarrator ? 'italic' : 'normal',
            color: '#e0f2fe',
            lineSpacing: 6,
            wordWrap: { width: textWidth }
        });
        this.box.add(this.textObject);

        const isLastLine = this.lineIndex >= this.lines.length - 1;

        this.box.add(this.add.text(
            BOX_WIDTH / 2 - BOX_PADDING,
            BOX_HEIGHT / 2 - 14,
            isLastLine ? 'Space / Click: start' : 'Space / Click: continue   •   Esc: skip',
            {
                fontFamily: 'Arial',
                fontSize: 13,
                color: '#64748b'
            }
        ).setOrigin(1, 1));

        this.startTyping(line.text);
    }

    private startTyping (text: string): void
    {
        this.typeTimer?.remove(false);
        this.visibleChars = 0;

        //  A repeat count of -1 would make the timer endless
        if (text.length === 0)
        {
            return;
        }

        this.typeTimer = this.time.addEvent({
            delay: TYPE_DELAY_MS,
            repeat: text.length - 1,
            callback: () => {
                this.visibleChars += 1;
                this.textObject.setText(text.slice(0, this.visibleChars));
            }
        });
    }

    private get isTyping (): boolean
    {
        return this.visibleChars < this.lines[this.lineIndex].text.length;
    }

    private advance (): void
    {
        //  First press completes the line being typed, the next one moves on
        if (this.isTyping)
        {
            this.typeTimer?.remove(false);
            this.visibleChars = this.lines[this.lineIndex].text.length;
            this.textObject.setText(this.lines[this.lineIndex].text);

            return;
        }

        if (this.lineIndex >= this.lines.length - 1)
        {
            this.finish();

            return;
        }

        this.lineIndex += 1;
        this.showLine();
    }

    private finish (): void
    {
        const resumeData: DialogueResumeData = { dialogueComplete: true };

        this.typeTimer?.remove(false);
        this.scene.stop();
        this.scene.resume(this.returnTo, resumeData);
    }

}
