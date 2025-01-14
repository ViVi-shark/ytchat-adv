import {MapEntityList} from "./MapEntityList.mjs";
import {MapEntityRowParser} from "./MapEntityRowParser.mjs";

/**
 * @abstract
 */
export class MapEntityListParser {
    /** @var {MapEntityRowParser} */
    #rowParser;

    /**
     * @param {MapEntityRowParser} rowParser
     */
    constructor(rowParser) {
        this.#rowParser = new RowParserWithCache(rowParser);
    }

    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {MapEntityList}
     */
    parse(source, allowInvalidPosition = false) {
        const list = this._instantiateList();

        source.split('\n')
            .map(line => this.#rowParser.parse(line, allowInvalidPosition))
            .filter(x => x != null)
            .forEach(x => list.instantiateEntity(x));

        return list;
    }

    /**
     * @protected
     * @abstract
     * @return {MapEntityList}
     */
    _instantiateList() {
    }
}



class RowParserWithCache extends MapEntityRowParser {
    /** @var {MapEntityRowParser} */
    #parser;

    /** @var {Object.<string, MapEntitySource|null>} */
    #cacheWithoutInvalidPosition = {};

    /** @var {Object.<string, MapEntitySource|null>} */
    #cacheWithInvalidPosition = {};

    /**
     * @param {MapEntityRowParser} parser
     */
    constructor(parser) {
        super(null);
        this.#parser = parser;
    }

    /**
     * @override
     */
    parse(sourceLine, allowInvalidPosition) {
        const cache =
            allowInvalidPosition ? this.#cacheWithInvalidPosition : this.#cacheWithoutInvalidPosition;

        if (sourceLine in cache) {
            return cache[sourceLine];
        }

        return (cache[sourceLine] = this.#parser.parse(sourceLine, allowInvalidPosition));
    }
}
