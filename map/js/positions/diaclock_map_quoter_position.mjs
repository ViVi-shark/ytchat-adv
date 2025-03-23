import {DiaclockSystemPosition} from "./DiaclockSystemPosition.mjs";

export class DiaclockMapQuoterPosition extends DiaclockSystemPosition {
    /** @var {int} */
    #cellIndex;

    /**
     * @param {int} cellIndex 1 to 6
     */
    constructor(cellIndex) {
        super();
        this.#cellIndex = cellIndex;
    }

    toCellId() {
        return this.#cellIndex.toString();
    }

    toString() {
        return this.toCellId();
    }
}
