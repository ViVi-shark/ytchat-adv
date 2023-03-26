import {DiaclockSystemPosition} from "./DiaclockSystemPosition.mjs";

export class DiaclockSystemPositionParser {
    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {DiaclockSystemPosition|null}
     */
    parse(source, allowInvalidPosition = false) {
        throw new Error();
    }

    /**
     * @param {string} source
     * @return {string}
     * @protected
     */
    static normalize(source) {
        return removeSymbols(normalizeAlphabets(normalizeNumber(source)));
    }
}

const wideNumbersMap = {
    '０': '0',
    '１': '1',
    '２': '2',
    '３': '3',
    '４': '4',
    '５': '5',
    '６': '6',
    '７': '7',
    '８': '8',
    '９': '9'
}

const romanNumeralsMap = {
    'Ⅰ': '1',
    'Ⅱ': '2',
    'Ⅲ': '3',
    'Ⅳ': '4',
    'Ⅴ': '5',
    'Ⅵ': '6',
    'Ⅶ': '7',
    'Ⅷ': '8',
    'Ⅸ': '9',
    'Ⅹ': '10',
    'Ⅺ': '11',
    'Ⅻ': '12'
};

const decoratedNumbersMap = {
    '①': '',
    '②': '',
    '③': '',
    '④': '',
    '⑤': '',
    '⑥': '',
    '⑦': '',
    '⑧': '',
    '⑨': '',
    '⑩': '',
    '⑪': '',
    '⑫': ''
};

/**
 * @param {string} source
 * @return {string}
 */
function normalizeNumber(source) {
    /**
     * @param {string} char
     * @return {string}
     */
    function normalizeChar(char) {
        return wideNumbersMap[char] ?? romanNumeralsMap[char] ?? decoratedNumbersMap[char] ?? char;
    }

    return [...source].map(normalizeChar).join('');
}

const wideAlphabetsMap = {
    'Ａ': 'A',
    'Ｂ': 'B',
    'Ｃ': 'C',
    'Ｄ': 'D',
    'Ｅ': 'E',
    'Ｆ': 'F',
    'Ｇ': 'G',
    'Ｈ': 'H',
    'Ｉ': 'I',
    'Ｊ': 'J',
    'Ｋ': 'K',
    'Ｌ': 'L',
    'Ｍ': 'M',
    'Ｎ': 'N',
    'Ｏ': 'O',
    'Ｐ': 'P',
    'Ｑ': 'Q',
    'Ｒ': 'R',
    'Ｓ': 'S',
    'Ｔ': 'T',
    'Ｕ': 'U',
    'Ｖ': 'V',
    'Ｗ': 'W',
    'Ｘ': 'X',
    'Ｙ': 'Y',
    'Ｚ': 'Z',
    'ａ': 'a',
    'ｂ': 'b',
    'ｃ': 'c',
    'ｄ': 'd',
    'ｅ': 'e',
    'ｆ': 'f',
    'ｇ': 'g',
    'ｈ': 'h',
    'ｉ': 'i',
    'ｊ': 'j',
    'ｋ': 'k',
    'ｌ': 'l',
    'ｍ': 'm',
    'ｎ': 'n',
    'ｏ': 'o',
    'ｐ': 'p',
    'ｑ': 'q',
    'ｒ': 'r',
    'ｓ': 's',
    'ｔ': 't',
    'ｕ': 'u',
    'ｖ': 'v',
    'ｗ': 'w',
    'ｘ': 'x',
    'ｙ': 'y',
    'ｚ': 'z'
};

/**
 * @param {string} source
 * @return {string}
 */
function normalizeAlphabets(source) {
    return [...source].map(x => (wideAlphabetsMap[x] ?? x).toLowerCase()).join('');
}

/**
 * @param {string} source
 * @return {string}
 */
function removeSymbols(source) {
    return source.replace(/[\s-－―ー.．:：;；]/g, '');
}
