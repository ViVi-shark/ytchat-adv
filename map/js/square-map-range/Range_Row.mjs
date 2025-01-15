import {Range} from "./Range.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

export class Range_Row extends Range {
    /** @var {int} */
    #verticalPosition;

    /**
     * @param {int} verticalPosition
     */
    constructor(verticalPosition) {
        super();

        this.#verticalPosition = verticalPosition;
    }

    * enumeratePositions(mapSize) {
        if (this.#verticalPosition <= mapSize.height) {
            for (let x = 1; x <= mapSize.width; x++) {
                yield new SquareMapPosition(SquareMapPosition.intToCharacter(x), this.#verticalPosition);
            }
        }
    }

    toText() {
        return this.#verticalPosition.toString();
    }
}
