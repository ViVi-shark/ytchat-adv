import {DiaclockSystemPositionParser} from "./positions/DiaclockSystemPositionParser.mjs";
import {DiaclockSystemEntity} from "./DiaclockSystemEntity.mjs";
import {DiaclockSystemEntityList} from "./DiaclockSystemEntityList.mjs";

export class DiaclockSystemEntityListParser {
    /** @var {LineParser} */
    #lineParser;

    /**
     * @param {DiaclockSystemPositionParser} positionParser
     */
    constructor(positionParser) {
        this.#lineParser = new LineParserWithCache(positionParser);
    }

    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {DiaclockSystemEntityList}
     */
    parse(source, allowInvalidPosition = false) {
        return new DiaclockSystemEntityList(
            ...(
                source.split('\n')
                    .map(line => this.#lineParser.parse(line, allowInvalidPosition))
                    .filter(x => x != null)
            )
        );
    }
}

class LineParser {
    /** @var {DiaclockSystemPositionParser} */
    #positionParser;

    /**
     * @param {DiaclockSystemPositionParser} positionParser
     */
    constructor(positionParser) {
        this.#positionParser = positionParser;
    }

    /**
     * @param {string} sourceLine
     * @param {boolean} allowInvalidPosition
     * @return {DiaclockSystemEntity|null}
     */
    parse(sourceLine, allowInvalidPosition) {
        const split = splitToNameAndPosition(sourceLine);

        if (split == null) {
            return null;
        }

        const position = this.#positionParser.parse(split.position, allowInvalidPosition);

        if (position == null) {
            return null;
        }

        return new DiaclockSystemEntity(split.name, position);
    }
}

class LineParserWithCache extends LineParser {
    /** @var {Object.<string, DiaclockSystemEntity|null>} */
    #cacheWithoutInvalidPosition = {};

    /** @var {Object.<string, DiaclockSystemEntity|null>} */
    #cacheWithInvalidPosition = {};

    parse(sourceLine, allowInvalidPosition) {
        const cache = allowInvalidPosition ? this.#cacheWithInvalidPosition : this.#cacheWithoutInvalidPosition;

        if (sourceLine in cache) {
            return cache[sourceLine];
        }

        cache[sourceLine] = super.parse(sourceLine, allowInvalidPosition);

        return this.parse(sourceLine, allowInvalidPosition);
    }
}

const delimiters = ['::', '：：', '＠', '@', ':', '：'];

/**
 * @param {string} sourceText
 * @param {string} delimiter
 * @return {{name: string, position: string}|null}
 */
function splitByDelimiter(sourceText, delimiter) {
    const index = sourceText.indexOf(delimiter);

    if (index < 0) {
        return null;
    }

    return {
        name: sourceText.substring(0, index).trim(),
        position: sourceText.substring(index + delimiter.length).trim()
    };
}

/**
 * @param {string} source
 * @return {{name: string, position: string}|null}
 */
function splitToNameAndPosition(source) {
    for (const delimiter of delimiters) {
        const split = splitByDelimiter(source, delimiter);

        if (split != null) {
            return split;
        }
    }

    return null;
}
