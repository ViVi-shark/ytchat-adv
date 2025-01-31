import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {Range_OriginatedRect} from "./Range_OriginatedRect.mjs";

export class Range_OriginatedSquare extends Range_OriginatedRect {
    /** @var {int} */
    #width;

    /** @var {int} */
    #height;

    /**
     * @param {SquareMapPosition} origin
     * @param {int} width allow only odd value
     * @param {int} height allow only odd value
     */
    constructor(origin, width, height) {
        super(origin);
        this.#width = width;
        this.#height = height;
    }

    _calcLeft() {
        return SquareMapPosition.intToCharacter(
            Math.max(
                1,
                this.origin.horizontalInt - Math.floor(this.#width / 2)
            )
        );
    }

    _calcRight() {
        return SquareMapPosition.intToCharacter(
            this.origin.horizontalInt + Math.floor(this.#width / 2)
        );
    }

    _calcTop() {
        return Math.max(
            1,
            this.origin.vertical - Math.floor(this.#height / 2)
        );
    }

    _calcBottom() {
        return this.origin.vertical + Math.floor(this.#height / 2);
    }

    toText() {
        return `${this.makeFormText()}@${this.origin}`;
    }

    makeFormText() {
        return `${this.#width}x${this.#height}`;
    }
}
