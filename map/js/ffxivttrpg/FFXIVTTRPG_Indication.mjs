import {FFXIVTTRPG_Entity} from "./FFXIVTTRPG_Entity.mjs";

/**
 * @abstract
 */
export class FFXIVTTRPG_Indication extends FFXIVTTRPG_Entity {
    /**
     * @protected
     * @param {SquareMapPosition} origin
     */
    constructor(origin) {
        super('__予兆__', origin);
    }

    /**
     * @final
     * @return {boolean}
     */
    get hasName() {
        return false;
    }

    /**
     * @abstract
     * @return {Range}
     */
    get range() {
    }
}
