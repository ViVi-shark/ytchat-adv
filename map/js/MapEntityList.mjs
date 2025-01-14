/**
 * @typedef MapEntitySource
 * @protected {string} name
 * @protected {MapPosition} position
 */

/**
 * @abstract
 */
export class MapEntityList {
    /** @var {MapEntity[]} */
    #items;

    /**
     * @param {MapEntity} items
     */
    constructor(...items) {
        this.#items = items.slice();
    }

    /**
     * @final
     * @return {Iterator}
     */
    [Symbol.iterator]() {
        return new Iterator(this.#items);
    }

    /**
     * @callback MapEntityList~forEach
     * @param {MapEntity} entity
     * @param {int} index
     */

    /**
     * @param {MapEntityList~forEach} callbackFn
     */
    forEach(callbackFn) {
        this.#items.forEach(callbackFn);
    }

    /**
     * @final
     * @return {string} JSON
     */
    toJson() {
        return JSON.stringify(this.#serialize());
    }

    /**
     * @return {{name: string, position: string}[]}
     */
    #serialize() {
        return this.#items.map(x => x.serialize());
    }

    /**
     * @protected
     * @final
     * @param {string} json
     * @param {MapPositionParser} positionParser
     */
    _importFromJson(json, positionParser) {
        this.#items.splice(0);

        const serializedArray = JSON.parse(json);

        if (serializedArray instanceof Array) {
            for (/** @var {{name: string, position: *}} */const serializedItem of serializedArray) {
                if (serializedItem != null) {
                    const position =
                        positionParser.parse(serializedItem.position?.toString() ?? '');

                    if (position == null) {
                        continue;
                    }

                    const o = {};
                    Object.assign(o, serializedItem);
                    o['position'] = position;

                    this.instantiateEntity(o);
                }
            }
        }
    }

    /**
     * @final
     * @param {MapEntitySource} source
     */
    instantiateEntity(source) {
        const entity = this._instantiateEntity(source);
        this.#items.push(entity);
        this._onAdded(entity);
    }

    /**
     * @protected
     * @abstract
     * @param {MapEntitySource} source
     */
    _instantiateEntity(source) {
    }

    /**
     * @protected
     * @param {MapEntitySource} entity
     */
    _onAdded(entity) {
    }
}

class Iterator {
    /** @var {Array} */
    #array;

    /** @var {int} */
    #lastIndex = -1;

    /**
     * @param {Array} array
     */
    constructor(array) {
        this.#array = array;
    }

    next() {
        this.#lastIndex++;

        if (this.#lastIndex < this.#array.length) {
            return {done: false, value: this.#array[this.#lastIndex]};
        } else {
            return {done: true};
        }
    }
}
