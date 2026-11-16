/**
 * Who says a line:
 * - `narrator`: the omniscient voice telling the story, with no portrait.
 * - `player`: the character of the player, shown with the selected skin.
 * - `opponent`: the opponent of the current fight.
 *
 * Speakers are relative to the fight rather than named characters, so a
 * dialogue works whatever skin the player uses.
 */
export type DialogueSpeaker = 'narrator' | 'player' | 'opponent';

export interface DialogueLine {
    speaker: DialogueSpeaker;
    text: string;
}

export interface Dialogue {
    /** Stable identifier used by the save to remember dialogues already seen. */
    id: string;
    lines: readonly DialogueLine[];
}

/** Opening of the story, before the first fight against Sorcerer Space. */
export const STAGE_1_INTRO: Dialogue = {
    id: 'stage-1-intro',
    lines: [
        {
            speaker: 'narrator',
            text: 'You are a mysterious traveler in search of adventure. You have decided to leave your planet: '
                + 'you have been tired of it ever since you were born.'
        },
        {
            speaker: 'narrator',
            text: 'After three days of travel, you come across a mysterious figure... A sorcerer?'
        },
        {
            speaker: 'opponent',
            text: 'Ohh, I\'m finally going to be able to have some fun!'
        }
    ]
};

/** After Sorcerer Space is defeated for the last time, at the end of stage 1. */
export const STAGE_1_OUTRO: Dialogue = {
    id: 'stage-1-outro',
    lines: [
        {
            speaker: 'player',
            text: "A space wizard? I've heard of them on my planet. But I thought they'd all been killed."
        }
    ]
};
