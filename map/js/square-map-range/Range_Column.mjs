import {Range} from "./Range.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

export class Range_Column extends Range {
    /** @var {string} */
    #horizontalPosition;

    /**
     * @param {string} horizontalPosition
     */
    constructor(horizontalPosition) {
        super();

        this.#horizontalPosition = horizontalPosition;
    }

    * enumeratePositions(mapSize) {
        const x = SquareMapPosition.characterToInt(this.#horizontalPosition);

        if (x <= mapSize.width) {
            for (let y = 1; y <= mapSize.height; y++) {
                yield new SquareMapPosition(this.#horizontalPosition, y);
            }
        }
    }

    toText() {
        return this.#horizontalPosition;
    }
}
