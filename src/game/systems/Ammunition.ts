import { Events } from 'phaser';

export const AMMUNITION_EVENTS = {
    /** (current: number, max: number) */
    changed: 'changed'
} as const;

/** Total ammunition reserve: each shot consumes one round, with no reloading. */
export class Ammunition extends Events.EventEmitter {

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

    get isEmpty (): boolean
    {
        return this.currentValue <= 0;
    }

    /** Consumes one round. Returns false if the reserve is empty. */
    consume (): boolean
    {
        if (this.isEmpty)
        {
            return false;
        }

        this.currentValue -= 1;
        this.emit(AMMUNITION_EVENTS.changed, this.currentValue, this.max);

        return true;
    }

}
