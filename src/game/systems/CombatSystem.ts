import { Events, Physics } from 'phaser';
import type { Scene } from 'phaser';
import type { Fighter } from '../entities/Fighter';
import { Projectile } from '../entities/Projectile';
import type { DuelEndReason, DuelOutcome } from '../types/duel';

const MAX_PROJECTILES = 60;

export const COMBAT_EVENTS = {
    /** (shooter: Fighter) */
    fired: 'fired',
    /** (target: Fighter, damage: number, x: number, y: number) */
    hit: 'hit'
} as const;

/**
 * Rules shared by every game mode: shots, projectiles, collisions, damage
 * and the outcome of a duel. It knows nothing about levels or progression.
 */
export class CombatSystem extends Events.EventEmitter {

    private readonly player: Fighter;
    private readonly enemy: Fighter;
    private readonly projectiles: Physics.Arcade.Group;

    constructor (scene: Scene, player: Fighter, enemy: Fighter)
    {
        super();

        this.player = player;
        this.enemy = enemy;
        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            maxSize: MAX_PROJECTILES
        });

        scene.physics.add.overlap(player, this.projectiles, (_fighter, projectile) => {
            this.resolveHit(player, projectile);
        });
        scene.physics.add.overlap(enemy, this.projectiles, (_fighter, projectile) => {
            this.resolveHit(enemy, projectile);
        });
    }

    /** Makes a fighter fire if it is allowed to (fire rate, ammunition). */
    fire (shooter: Fighter): boolean
    {
        //  Check the pool before tryFire: a round must not be consumed if no
        //  projectile can be created.
        if (this.projectiles.isFull() || !shooter.tryFire())
        {
            return false;
        }

        const projectile = this.projectiles.get(shooter.x, shooter.muzzleY) as Projectile | null;

        if (!projectile)
        {
            return false;
        }

        projectile.launch(
            shooter.x,
            shooter.muzzleY,
            shooter.projectile,
            shooter.side,
            shooter.fireDirection
        );
        this.emit(COMBAT_EVENTS.fired, shooter);

        return true;
    }

    /**
     * Outcome of the duel, or null while it is still going.
     * - A fighter at 0 HP loses.
     * - If nobody can deal damage anymore (both reserves empty and no
     *   projectile in flight), the fighter with the most HP wins; on a tie,
     *   the player loses.
     */
    getOutcome (): DuelOutcome | null
    {
        if (this.player.health.isDepleted)
        {
            return { winner: 'enemy', reason: 'ko' };
        }

        if (this.enemy.health.isDepleted)
        {
            return { winner: 'player', reason: 'ko' };
        }

        const nobodyCanFire = this.player.ammunition.isEmpty && this.enemy.ammunition.isEmpty;

        if (nobodyCanFire && this.projectiles.countActive(true) === 0)
        {
            return this.decideOnHealth('ammunition');
        }

        return null;
    }

    /**
     * Ends the duel without a KO: the fighter with the most HP wins and, on a
     * tie, the player loses. Used when the time limit is over.
     */
    decideOnHealth (reason: DuelEndReason): DuelOutcome
    {
        return {
            winner: this.player.health.current > this.enemy.health.current ? 'player' : 'enemy',
            reason
        };
    }

    /**
     * Opposing projectiles still heading toward the given fighter, within a
     * vertical distance. Used by the AI to notice the shots coming at it.
     */
    findIncomingProjectiles (target: Fighter, maxDistance: number): Projectile[]
    {
        //  Projectiles aimed at the top fighter are below it, and the other way round
        const approachSign = target.side === 'enemy' ? 1 : -1;
        const incoming: Projectile[] = [];

        for (const child of this.projectiles.getChildren())
        {
            if (!(child instanceof Projectile) || !child.active || child.owner === target.side)
            {
                continue;
            }

            const distance = (child.y - target.y) * approachSign;

            if (distance >= 0 && distance <= maxDistance)
            {
                incoming.push(child);
            }
        }

        return incoming;
    }

    /** Removes every projectile in flight (end of the fight). */
    clearProjectiles (): void
    {
        for (const child of this.projectiles.getChildren())
        {
            if (child instanceof Projectile && child.active)
            {
                child.deactivate();
            }
        }
    }

    private resolveHit (target: Fighter, projectileObject: unknown): void
    {
        if (!(projectileObject instanceof Projectile) || !projectileObject.active)
        {
            return;
        }

        //  A projectile passes through its own shooter and hits only once: it
        //  is deactivated before the damage is applied.
        if (projectileObject.owner === target.side || target.health.isDepleted)
        {
            return;
        }

        const { x, y, damage } = projectileObject;

        projectileObject.deactivate();
        target.health.damage(damage);
        this.emit(COMBAT_EVENTS.hit, target, damage, x, y);
    }

}
