import {DiaclockSystemPosition} from "./DiaclockSystemPosition.mjs";
import {DiaclockSystemPositionParser} from "./DiaclockSystemPositionParser.mjs";
import {DiaclockSystemPositionParserWithCache} from "./DiaclockSystemPositionParserWithCache.mjs";

const SideName_L = 'L';
const SideName_R = 'R';

/** @var {Object.<string, string>} */
const cellIdMap = {
    'R1': '1',
    'R2': '2',
    'R3': '3',
    'R4': '4',
    'R5': '5',
    'R6': '6',
    '7': '7',
    'L6': '8',
    'L5': '9',
    'L4': '10',
    'L3': '11',
    'L2': '12',
    'L1': '13',
    '0': '14'
};

export class MaleGateMapPosition extends DiaclockSystemPosition {
    /** @var {string|null} */
    #sideName;

    /** @var {int} */
    #cellIndex;

    /**
     * @param {string|null} sideName 'L' or 'R' or null
     * @param {int} cellIndex 0, 1-6, 7
     */
    constructor(sideName, cellIndex) {
        super();

        this.#sideName = sideName ?? null;
        this.#cellIndex = cellIndex;
    }

    toCellId() {
        return cellIdMap[this.toString()] ?? '';
    }

    toString() {
        return `${this.#sideName ?? ''}${this.#cellIndex}`;
    }

    /**
     * @return {DiaclockSystemPositionParser}
     */
    static get parser() {
        return parser;
    }

    /**
     * @param {string} source
     * @return {MaleGateMapPosition|null}
     */
    static parse(source) {
        return this.parser.parse(source);
    }
}

class MaleGateMapPosition_Invalid extends MaleGateMapPosition {
    constructor() {
        super(null, NaN);
    }

    toCellId() {
        return '';
    }
}

/** @var {MaleGateMapPosition} */
const invalidPosition = new MaleGateMapPosition_Invalid();

class MaleGateMapPositionParser extends DiaclockSystemPositionParser {
    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {MaleGateMapPosition|null}
     */
    parse(source, allowInvalidPosition = false) {
        const normalized = DiaclockSystemPositionParser.normalize(source);

        const sideName = MaleGateMapPositionParser.#validateSideName(normalized.match(/[LR]+/i));
        const cellIndex = MaleGateMapPositionParser.#validateCellIndex(normalized.match(/\d+/));

        if (sideName == null) {
            switch (cellIndex) {
                case 0:
                case 7:
                    return new MaleGateMapPosition(null, cellIndex);
            }
        } else {
            if (1 <= cellIndex && cellIndex <= 6) {
                return new MaleGateMapPosition(sideName, cellIndex);
            }
        }

        return allowInvalidPosition ? invalidPosition : null;
    }

    /**
     * @param {?RegExpMatchArray} source
     * @return {string|null}
     */
    static #validateSideName(source) {
        if (source == null) {
            return null;
        }

        switch (source[0]?.toUpperCase() ?? '') {
            case 'L':
                return SideName_L;
            case 'R':
                return SideName_R;
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

        if (0 <= num && num <= 7) {
            return num;
        }

        return null;
    }
}

/** @var {DiaclockSystemPositionParser} */
const parser = new DiaclockSystemPositionParserWithCache(
    new MaleGateMapPositionParser(),
    invalidPosition
);
