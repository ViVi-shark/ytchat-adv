/**
 * @typedef FFXIVTTRPG_Locator
 * @property {string} name
 * @property {SquareMapPosition} position
 */
import {Range} from "./Range.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {OriginatedRange} from "./OriginatedRange.mjs";

export class OriginatedRangeBuilder {
    /**
     * @callback OriginatedRangeBuilder~toBuild
     * @param {SquareMapPosition} origin
     * @return {OriginatedRange}
     */

    /** @var {OriginatedRangeBuilder~toBuild} */
    #toBuild;

    /**
     * @param {OriginatedRangeBuilder~toBuild} toBuild
     */
    constructor(toBuild) {
        this.#toBuild = toBuild;
    }

    /**
     * @param {FFXIVTTRPG_Locator} locator
     * @return {OriginatedRange}
     */
    build(locator) {
        if (locator.position === SquareMapPosition.invalid) {
            console.warn(`Locator[${locator.name}]'s position is invalid.`);
            return new EmptyRange();
        }

        return this.#toBuild.call(null, locator.position);
    }
}



class EmptyRange extends OriginatedRange {
    constructor() {
        super(new SquareMapPosition('A', 1));
    }

    * enumeratePositions(mapSize) {
    }

    toText() {
        return this.makeFormText();
    }

    makeFormText() {
        return '';
    }
}
