import {OriginatedRange} from "./OriginatedRange.mjs";
import {Range_DirectRect} from "./Range_DirectRect.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

/**
 * @abstract
 */
export class Range_OriginatedRect extends OriginatedRange {
  *  enumeratePositions(mapSize) {
      if (this.origin !== SquareMapPosition.invalid) {
          yield* new Range_DirectRect(
              new SquareMapPosition(this._calcLeft(), this._calcTop()),
              new SquareMapPosition(this._calcRight(), this._calcBottom())
          ).enumeratePositions(mapSize);
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
