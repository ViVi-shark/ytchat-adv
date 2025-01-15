import {OriginatedRange} from "./OriginatedRange.mjs";
import {Range_Column} from "./Range_Column.mjs";

export class Range_OriginatedColumn extends OriginatedRange {
    enumeratePositions(mapSize) {
        return this.#makeColumn().enumeratePositions(mapSize);
    }

    toText() {
        return this.#makeColumn().toText();
    }

    #makeColumn() {
        return new Range_Column(this.origin.horizontal);
    }

    makeFormText() {
        return 'column';
    }
}
