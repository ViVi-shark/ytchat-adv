import {OriginatedRange} from "./OriginatedRange.mjs";
import {Range_Row} from "./Range_Row.mjs";

export class Range_OriginatedRow extends OriginatedRange {
    enumeratePositions(mapSize) {
        return this.#makeRow().enumeratePositions(mapSize);
    }

    #makeRow() {
        return new Range_Row(this.origin.vertical);
    }

    toText() {
        return this.#makeRow().toText();
    }

    makeFormText() {
        return 'row';
    }
}
