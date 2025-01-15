import {Range} from "./Range.mjs";
import {Range_Row} from "./Range_Row.mjs";

export class Range_Rows extends Range {
    /** @var {int} */
    #start;

    /** @var {int} */
    #end;

    /**
     * @param {int} start
     * @param {int} end
     */
    constructor(start, end) {
        super();
        this.#start = start;
        this.#end = end;
    }

    * enumeratePositions(mapSize) {
        let min = Math.min(this.#start, this.#end);
        let max = Math.max(this.#start, this.#end);

        for (let y = min; y <= max; y++) {
            yield* new Range_Row(y).enumeratePositions(mapSize);
        }
    }

    toText() {
        return `${this.#start}:${this.#end}`;
    }
}
