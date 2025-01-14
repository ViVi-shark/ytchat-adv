export class MapEntityRowParser {
    /** @var {MapPositionParser} */
    #positionParser;

    /**
     * @param {MapPositionParser} positionParser
     */
    constructor(positionParser) {
        this.#positionParser = positionParser;
    }

    /**
     * @protected
     * @return {MapPositionParser}
     */
    get _positionParser() {
        return this.#positionParser;
    }

    /**
     * @final
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {MapEntitySource|null}
     */
    parse(source, allowInvalidPosition) {
        const split = this.#splitToNameAndPosition(source);

        if (split == null) {
            return null;
        }

        const position = this.#positionParser.parse(split.position, allowInvalidPosition);

        if (position == null) {
            return null;
        }

        return this._parse(split.name, position);
    }

    /**
     * @param {string} nameSource
     * @param {MapPosition} position
     * @protected
     */
    _parse(nameSource, position) {
        return {name: nameSource, position};
    }

    /**
     * @param {string} source
     * @return {{name: string, position: string}|null}
     */
    #splitToNameAndPosition(source) {
        for (const delimiter of delimiters) {
            const split = this._splitByDelimiter(source, delimiter);

            if (split != null) {
                return {name: split.left, position: split.right};
            }
        }

        return null;
    }

    /**
     * @final
     * @protected
     * @param {string} sourceText
     * @param {string} delimiter
     * @return {{left: string, right: string}|null}
     */
    _splitByDelimiter(sourceText, delimiter) {
        const index = sourceText.indexOf(delimiter);

        if (index < 0) {
            return null;
        }

        return {
            left: sourceText.substring(0, index).trim(),
            right: sourceText.substring(index + delimiter.length).trim()
        };
    }
}

const delimiters = ['::', '：：', '＠', '@', ':', '：'];
