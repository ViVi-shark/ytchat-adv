import {Range} from "./Range.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

export class ReversedRange extends Range {
    /** @var {Range} */
    #original;

    /**
     * @param {Range} original
     */
    constructor(original) {
        super();
        this.#original = original;
    }

    * enumeratePositions(mapSize) {
        const originalPositions = [...this.#original.enumeratePositions(mapSize)];

        for (let x = 1; x <= mapSize.width; x++) {
            for (let y = 1; y <= mapSize.height; y++) {
                if (
                    originalPositions
                        .some(position =>
                            position.horizontalInt === x &&
                            position.vertical === y
                        )
                ) {
                    continue;
                }

                yield new SquareMapPosition(SquareMapPosition.intToCharacter(x), y);
            }
        }
    }

    toText() {
        return `^${this.#original.toText()}`;
    }
}
