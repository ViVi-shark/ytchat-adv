/**
 * @abstract
 */
export class Range {
    /**
     * @abstract
     * @param {SquareMapSize} mapSize
     * @return {Generator<SquareMapPosition>}
     */
    enumeratePositions(mapSize) {
    }

    /**
     * @abstract
     * @return {string}
     */
    toText() {
    }
}
