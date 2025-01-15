import {OriginatedRange} from "./OriginatedRange.mjs";

export class Range_Point extends OriginatedRange {
    /**
     * @param {SquareMapPosition} point
     */
    constructor(point) {
        super(point);
    }

    * enumeratePositions(mapSize) {
        if (this.origin.horizontalInt <= mapSize.width && this.origin.vertical <= mapSize.height) {
            yield this.origin;
        }
    }

    makeFormText() {
        return this.origin.toString();
    }

    toText() {
        return this.makeFormText();
    }
}
