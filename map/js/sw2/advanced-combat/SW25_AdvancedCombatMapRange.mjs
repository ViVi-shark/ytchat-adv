import {SW25_AdvancedCombatMapEntity} from "./SW25_AdvancedCombatMapEntity.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";

export class SW25_AdvancedCombatMapRange extends SW25_AdvancedCombatMapEntity {
    /** @type {int} */
    #layerIndex;

    /** @type {int} */
    #size;

    /**
     * @param {string} name
     * @param {int} layerIndex
     * @param {int} positionFromLeftEnd
     * @param {int} size
     */
    constructor(name, layerIndex, positionFromLeftEnd, size) {
        super(name, positionFromLeftEnd);
        this.#layerIndex = layerIndex;
        this.#size = size;
    }

    get type() {
        return SW2_MapEntityType.range;
    }

    /**
     * @return {int}
     */
    get layerIndex() {
        return this.#layerIndex;
    }

    /**
     * @return {int}
     */
    get size() {
        return this.#size;
    }
}
