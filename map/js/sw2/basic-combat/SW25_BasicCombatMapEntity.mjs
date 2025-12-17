import {SW2_MapEntity} from "../SW2_MapEntity.mjs";
import {SW25_BasicCombatMapPosition} from  "./SW25_BasicCombatMapPosition.mjs";

/**
 * @abstract
 */
export class SW25_BasicCombatMapEntity extends SW2_MapEntity {
    /** @type {SW25_BasicCombatMapPosition} */
    #position;

    /**
     * @param {string} name
     * @param {SW25_BasicCombatMapPosition} position
     * @param {?SW2_MapEntityColor} color
     */
    constructor(name, position, color = null) {
        super(name, color);

        this.#position = position;
    }

    get position() {
        return this.#position;
    }
}
