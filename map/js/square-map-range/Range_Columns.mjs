import {Range} from "./Range.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {Range_Column} from "./Range_Column.mjs";

export class Range_Columns extends Range {
    /** @var {string} */
    #start;

    /** @var {string} */
    #end;

    /**
     * @param {string} start
     * @param {string} end
     */
    constructor(start, end) {
        super();
        this.#start = start;
        this.#end = end;
    }

    * enumeratePositions(mapSize) {
        const start = SquareMapPosition.characterToInt(this.#start);
        const end = SquareMapPosition.characterToInt(this.#end);

        let min = Math.min(start, end);
        let max = Math.max(start, end);

        for (let x = min; x <= max; x++) {
            yield* new Range_Column(SquareMapPosition.intToCharacter(x)).enumeratePositions(mapSize);
        }
    }

    toText() {
        return `${this.#start}:${this.#end}`;
    }
}
