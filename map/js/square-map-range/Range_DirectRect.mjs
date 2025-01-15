import {Range_Rect} from "./Range_Rect.mjs";

export class Range_DirectRect extends Range_Rect {
    /** @var {string} */
    #left;
    /** @var {int} */
    #top;
    /** @var {string} */
    #right;
    /** @var {int} */
    #bottom;

    /**
     * @param {SquareMapPosition} leftTop
     * @param {SquareMapPosition} rightBottom
     */
    constructor(leftTop, rightBottom) {
        super();

        this.#left = leftTop.horizontal;
        this.#top = leftTop.vertical;

        this.#right = rightBottom.horizontal;
        this.#bottom = rightBottom.vertical;
    }

    _calcBottom() {
        return this.#bottom;
    }

    _calcLeft() {
        return this.#left;
    }

    _calcRight() {
        return this.#right;
    }

    _calcTop() {
        return this.#top;
    }

    toText() {
        return `${this.#left}${this.#top}:${this.#right}${this.#bottom}`;
    }
}
