import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {Range_OriginatedRect} from "./Range_OriginatedRect.mjs";

export class Range_OriginatedSquare extends Range_OriginatedRect {
    /** @var {int} */
    #size;

    /**
     * @param {SquareMapPosition} origin
     * @param {int} size allow only odd value
     */
    constructor(origin, size) {
        super(origin);
        this.#size = size;
    }

    _calcLeft() {
        return SquareMapPosition.intToCharacter(
            Math.max(
                1,
                this.origin.horizontalInt - Math.floor(this.#size / 2)
            )
        );
    }

    _calcRight() {
        return SquareMapPosition.intToCharacter(
            this.origin.horizontalInt + Math.floor(this.#size / 2)
        );
    }

    _calcTop() {
        return Math.max(
            1,
            this.origin.vertical - Math.floor(this.#size / 2)
        );
    }

    _calcBottom() {
        return this.origin.vertical + Math.floor(this.#size / 2);
    }

    toText() {
        return `${this.makeFormText()}@${this.origin}`;
    }

    makeFormText() {
        return `${this.#size}x${this.#size}`;
    }
}
