import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {Range} from "./Range.mjs";

/**
 * @abstract
 */
export class Range_Rect extends Range {
    /**
     * @final
     * @param {SquareMapSize} size
     * @return {Generator<SquareMapPosition>}
     */
    * enumeratePositions(size) {
        const left = SquareMapPosition.characterToInt(this._calcLeft());
        const right = SquareMapPosition.characterToInt(this._calcRight());

        const top = this._calcTop();
        const bottom = this._calcBottom();

        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                if (x > size.width || y > size.height) {
                    continue;
                }

                yield new SquareMapPosition(
                    SquareMapPosition.intToCharacter(x),
                    y
                );
            }
        }
    }

    /**
     * @protected
     * @abstract
     * @return {string}
     */
    _calcLeft() {
    }

    /**
     * @protected
     * @abstract
     * @return {string}
     */
    _calcRight() {

    }

    /**
     * @protected
     * @abstract
     * @return {int}
     */
    _calcTop() {
    }

    /**
     * @protected
     * @abstract
     * @return {int}
     */
    _calcBottom() {
    }
}
