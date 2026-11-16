import { Events } from 'phaser';

export const HEALTH_EVENTS = {
    /** (current: number, max: number) */
    changed: 'changed',
    depleted: 'depleted'
} as const;

/** Hit points of a fighter, independent of how they are displayed. */
export class Health extends Events.EventEmitter {

    readonly max: number;

    private currentValue: number;

    constructor (max: number)
    {
        super();

        this.max = max;
        this.currentValue = max;
    }

    get current (): number
    {
        return this.currentValue;
    }

    get isDepleted (): boolean
    {
        return this.currentValue <= 0;
    }

    /** Removes HP without ever going below zero. No effect once at zero. */
    damage (amount: number): void
    {
        if (this.isDepleted || amount <= 0)
        {
            return;
        }

        this.currentValue = Math.max(0, this.currentValue - amount);
        this.emit(HEALTH_EVENTS.changed, this.currentValue, this.max);

        if (this.isDepleted)
        {
            this.emit(HEALTH_EVENTS.depleted);
        }
    }

}
