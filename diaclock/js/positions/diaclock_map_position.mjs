import {DiaclockSystemPosition} from "./DiaclockSystemPosition.mjs";
import {DiaclockSystemPositionParser} from "./DiaclockSystemPositionParser.mjs";

const CircleName_In = 'in';
const CircleName_Out = 'out';

export class DiaclockMapPosition extends DiaclockSystemPosition {
    /** @var {string} */
    #circleName;

    /** @var {int} */
    #cellIndex;

    /**
     * @param {string} circleName 'in' or 'out'
     * @param {int} cellIndex 1-12
     */
    constructor(circleName, cellIndex) {
        super();

        this.#circleName = circleName;
        this.#cellIndex = cellIndex;
    }

    toCellId() {
        return `${this.#circleName}-${this.#cellIndex}`;
    }

    /**
     * @return {DiaclockMapPositionParser}
     */
    static get parser() {
        return parser;
    }

    /**
     * @param {string} source
     * @return {DiaclockMapPosition|null}
     */
    static parse(source) {
        return this.parser.parse(source);
    }
}

class DiaclockMapPosition_Center extends DiaclockMapPosition {
    constructor() {
        super('', -1);
    }

    toCellId() {
        return 'center';
    }
}

/** @var {DiaclockMapPosition} */
const center = new DiaclockMapPosition_Center();

class DiaclockMapPosition_Invalid extends DiaclockMapPosition {
    constructor() {
        super('', -1);
    }

    toCellId() {
        return '';
    }
}

/** @var {DiaclockMapPosition} */
const invalidPosition = new DiaclockMapPosition_Invalid();

class DiaclockMapPositionParser extends DiaclockSystemPositionParser {
    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {DiaclockMapPosition|null}
     */
    parse(source, allowInvalidPosition = false) {
        const normalized = DiaclockMapPositionParser.normalize(source);

        if (normalized === 'center') {
            return center;
        }

        const circleName = DiaclockMapPositionParser.#validateCircleName(normalized.match(/[a-z]+/));
        const cellIndex = DiaclockMapPositionParser.#validateCellIndex(normalized.match(/\d+/));

        return circleName != null && cellIndex != null
            ? new DiaclockMapPosition(circleName, cellIndex)
            : allowInvalidPosition ? invalidPosition : null;
    }

    /**
     * @param {?RegExpMatchArray} source
     * @return {string|null}
     */
    static #validateCircleName(source) {
        if (source == null) {
            return null;
        }

        switch (source[0]) {
            case 'in':
                return CircleName_In;
            case 'out':
                return CircleName_Out;
        }

        return null;
    }

    /**
     * @param {?RegExpMatchArray} source
     * @return {int|null}
     */
    static #validateCellIndex(source) {
        if (source == null) {
            return null;
        }

        const num = parseInt(source[0]);

        if (1 <= num && num <= 12) {
            return num;
        }

        return null;
    }
}

class DiaclockMapPositionParserWithCache extends DiaclockMapPositionParser {
    /** @var {Object.<string, DiaclockMapPosition|null>} */
    #cache = {};

    parse(source, allowInvalidPosition) {
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

/** @var {DiaclockMapPositionParser} */
const parser = new DiaclockMapPositionParserWithCache();
