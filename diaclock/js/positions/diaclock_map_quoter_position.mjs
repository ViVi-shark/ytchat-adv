import {DiaclockSystemPosition} from "./DiaclockSystemPosition.mjs";
import {DiaclockSystemPositionParser} from "./DiaclockSystemPositionParser.mjs";

export class DiaclockMapQuoterPosition extends DiaclockSystemPosition {
    /** @var {int} */
    #cellIndex;

    /**
     * @param {int} cellIndex 1 to 6
     */
    constructor(cellIndex) {
        super();
        this.#cellIndex = cellIndex;
    }

    toCellId() {
        return this.#cellIndex.toString();
    }

    /**
     * @return {DiaclockMapQuoterPositionParser}
     */
    static get parser() {
        return parser;
    }

    /**
     * @param {string} source
     * @return {DiaclockMapQuoterPosition|null}
     */
    static parse(source) {
        return this.parser.parse(source);
    }
}

class DiaclockMapQuoterPosition_Center extends DiaclockMapQuoterPosition {
    constructor() {
        super(-1);
    }

    toCellId() {
        return 'center';
    }
}

/** @var {DiaclockMapQuoterPosition} */
const center = new DiaclockMapQuoterPosition_Center();

class DiaclockMapQuoterPosition_Invalid extends DiaclockMapQuoterPosition {
    constructor() {
        super(-1);
    }

    toCellId() {
        return '';
    }
}

/** @var {DiaclockMapQuoterPosition} */
const invalidPosition = new DiaclockMapQuoterPosition_Invalid();

class DiaclockMapQuoterPositionParser extends DiaclockSystemPositionParser {
    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {DiaclockMapQuoterPosition|null}
     */
    parse(source, allowInvalidPosition = false) {
        const normalized = DiaclockMapQuoterPositionParser.normalize(source);

        if (normalized === 'center') {
            return center;
        }

        const m = normalized.match(/\d+/);

        if (m != null) {
            const index = parseInt(m[0]);

            if (1 <= index && index <= 6) {
                return new DiaclockMapQuoterPosition(index);
            }
        }

        return allowInvalidPosition ? invalidPosition : null;
    }
}

class DiaclockMapQuoterPositionParserWithCache extends DiaclockMapQuoterPositionParser {
    /** @var {Object.<string, DiaclockMapQuoterPosition|null>} */
    #cache = {};

    parse(source, allowInvalidPosition = false) {
        if (source in this.#cache) {
            if (this.#cache[source] === invalidPosition) {
                return allowInvalidPosition ? this.#cache[source] : null;
            }

            return this.#cache[source];
        }

        this.#cache[source] = super.parse(source, true);

        return this.parse(source, allowInvalidPosition);
    }
}

/** @var {DiaclockMapQuoterPositionParser} */
const parser = new DiaclockMapQuoterPositionParserWithCache();
