import {SW2_MapEntity} from "../SW2_MapEntity.mjs";

/**
 * @abstract
 */
export class SW25_AdvancedCombatMapEntity extends SW2_MapEntity {
    /** @type {int} */
    #positionFromLeftEnd;

    /**
     * @param {string} name
     * @param {int} positionFromLeftEnd
     * @param {?SW2_MapEntityColor} color
     */
    constructor(name, positionFromLeftEnd, color = null) {
        super(name, color);

        this.#positionFromLeftEnd = positionFromLeftEnd;
    }

    /**
     * @private
     */
    get position() {
        throw new Error('Position is not supported in Advanced-Combat.');
    }

    /**
     * @return {int}
     */
    get positionFromLeftEnd() {
        return this.#positionFromLeftEnd;
    }
}
