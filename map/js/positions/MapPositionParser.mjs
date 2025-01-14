/**
 * @abstract
 */
export class MapPositionParser {
    /**
     * @abstract
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {MapPosition|null}
     */
    parse(source, allowInvalidPosition = false) {
    }
}
