import {Range} from "./Range.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

/**
 * @abstract
 */
export class OriginatedRange extends Range {
    /** @var {SquareMapPosition} */
    #origin;

    /**
     * @param {SquareMapPosition} origin
     */
    constructor(origin) {
        super();
        this.#origin = origin;

        if (this.#origin == null || this.#origin === SquareMapPosition.invalid) {
            console.error(`Origin must be valid position. (specified: ${this.#origin})`);
        }
    }

    /**
     * @return {SquareMapPosition}
     */
    get origin() {
        return this.#origin;
    }

    /**
     * @abstract
     * @return {string}
     */
    makeFormText() {
    }
}
