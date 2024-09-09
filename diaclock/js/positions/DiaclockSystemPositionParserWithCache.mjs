import {DiaclockSystemPositionParser} from "./DiaclockSystemPositionParser.mjs";

export class DiaclockSystemPositionParserWithCache extends DiaclockSystemPositionParser {
    /** @var {DiaclockSystemPositionParser} */
    #core;

    /** @var {DiaclockSystemPosition} */
    #invalidPosition;

    /** @var {Object.<string, DiaclockSystemPosition|null>} */
    #cache = {};

    /**
     * @param {DiaclockSystemPositionParser} core
     * @param {DiaclockSystemPosition} invalidPosition
     */
    constructor(core, invalidPosition) {
        super();
        this.#core = core;
        this.#invalidPosition = invalidPosition;
    }

    parse(source, allowInvalidPosition) {
        if (source in this.#cache) {
            if (this.#cache[source] === this.#invalidPosition) {
                return allowInvalidPosition ? this.#cache[source] : null;
            }

            return this.#cache[source];
        }

        this.#cache[source] = this.#core.parse(source, allowInvalidPosition);

        return this.parse(source, allowInvalidPosition);
    }
}
