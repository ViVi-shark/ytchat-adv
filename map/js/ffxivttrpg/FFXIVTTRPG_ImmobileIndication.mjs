import {FFXIVTTRPG_Indication} from "./FFXIVTTRPG_Indication.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

export class FFXIVTTRPG_ImmobileIndication extends FFXIVTTRPG_Indication {
    /** @var {Range} */
    #range;

    /**
     * @param {Range} range
     */
    constructor(range) {
        super(SquareMapPosition.invalid);
        this.#range = range;
    }

    /**
     * @return {Range}
     */
    get range() {
        return this.#range;
    }
}
