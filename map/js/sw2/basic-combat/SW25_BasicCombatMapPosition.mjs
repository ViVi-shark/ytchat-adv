import {MapPosition} from "../../positions/MapPosition.mjs";

/** @enum {string} */
const Positions = {
    pcBackward: 'pc-backward',
    forward: 'forward',
    enemyBackward: 'enemy-backward'
}

export class SW25_BasicCombatMapPosition extends MapPosition {
    /** @type {string} */
    #value;

    static #pcBackward = new SW25_BasicCombatMapPosition(Positions.pcBackward);
    static #forward = new SW25_BasicCombatMapPosition(Positions.forward);
    static #enemyBackward = new SW25_BasicCombatMapPosition(Positions.enemyBackward);

    static get PcBackward() {
        return this.#pcBackward;
    }

    static get Forward() {
        return this.#forward;
    }

    static get EnemyBackward() {
        return this.#enemyBackward;
    }

    /**
     * @private
     * @param {Positions} value
     */
    constructor(value) {
        super();

        this.#value = value;
    }

    serialize() {
        return this.#value;
    }

    toString() {
        return `<${this.#value}>`;
    }

    /**
     * @param {string} source
     */
    static from(source) {
        if (source === Positions.pcBackward) {
            return this.PcBackward;
        }

        if (source === Positions.forward) {
            return this.Forward;
        }

        if (source === Positions.enemyBackward) {
            return this.EnemyBackward;
        }

        throw new Error(`Unexpected position source: ${source}`);
    }
}
