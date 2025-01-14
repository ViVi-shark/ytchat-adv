import {MapPositionParser} from "./MapPositionParser.mjs";
import {SquareMapPosition} from "./SquareMapPosition.mjs";

export class SquareMapPositionParser extends MapPositionParser {
    /** @var {SquareMapSize} */
    #size;

    /**
     * @param {SquareMapSize} size
     */
    constructor(size) {
        super();

        this.#size = size;
    }

    parse(source, allowInvalidPosition) {
        const m = source.match(/^(\D+?)(\d+)$/);

        if (m != null) {
            const h = validateHorizontal(m[1]);
            const v = parseInt(m[2], 10);

            if (h != null && 1 <= h.number && h.number <= this.#size.height) {
                if (1 <= v && v <= this.#size.width) {
                    return new SquareMapPosition(h.character, v);
                }
            }
        }

        return allowInvalidPosition ? SquareMapPosition.invalid : null;
    }
}

/**
 * @param {string} source
 * @return {{number: int, character: string}|null}
 */
function validateHorizontal(source) {

    try {
        const n = SquareMapPosition.characterToInt(source);
        return {number: n, character: source.toUpperCase()};
    } catch {
        return null;
    }
}
