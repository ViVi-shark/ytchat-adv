import {Range_Linear} from "./Range_Linear.mjs";
import {OriginatedRange} from "./OriginatedRange.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

export class Range_Cross extends OriginatedRange {
    /** @var {?int} */
    #size;

    /**
     * @param {SquareMapPosition} origin
     * @param {?int} size
     */
    constructor(origin, size = null) {
        super(origin);
        this.#size = size ?? null;
    }

    * enumeratePositions(mapSize) {
        if (this.origin !== SquareMapPosition.invalid) {
            yield this.origin;

            for (const direction of ['LEFT', 'UP', 'RIGHT', 'DOWN']) {
                const linear = new Range_Linear(
                    this.origin,
                    direction,
                    this.#size != null ? this.#size + 1 : null
                );

                yield* [...linear.enumeratePositions(mapSize)].slice(1);
            }
        }
    }

    toText() {
        return `${this.makeFormText()}@${this.origin}`;
    }

    makeFormText() {
        return `cross${this.#size != null ? `~${this.#size}` : ''}`;
    }
}
