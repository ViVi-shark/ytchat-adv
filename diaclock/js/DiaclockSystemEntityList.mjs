import {DiaclockSystemEntity} from "./DiaclockSystemEntity.mjs";
import {DiaclockSystemPositionParser} from "./positions/DiaclockSystemPositionParser.mjs";

export class DiaclockSystemEntityList {
    /** @var {DiaclockSystemEntity[]} */
    #items;

    /**
     * @param {DiaclockSystemEntity} items
     */
    constructor(...items) {
        this.#items = items.slice();
    }

    [Symbol.iterator]() {
        return new Iterator(this.#items);
    }

    /**
     * @callback DiaclockSystemEntityList~forEach
     * @param {DiaclockSystemEntity} entity
     * @param {int} index
     */

    /**
     * @param {DiaclockSystemEntityList~forEach} callbackFn
     */
    forEach(callbackFn) {
        this.#items.forEach(callbackFn);
    }

    /**
     * @return {string} JSON
     */
    toJson() {
        return JSON.stringify(this.#serialize());
    }

    /**
     * @return {{name: string, position: string}[]}
     */
    #serialize() {
        return this.#items.map(serializeEntity);
    }

    /**
     * @param {string} json
     * @param {DiaclockSystemPositionParser} positionParser
     * @return {DiaclockSystemEntityList}
     */
    static fromJson(json, positionParser) {
        const serializedArray = JSON.parse(json);

        const items = [];

        if (serializedArray instanceof Array) {
            for (const serializedItem of serializedArray) {
                if (serializedItem != null) {
                    const item = tryDeserializeEntity(serializedArray, positionParser);

                    if (item != null) {
                        items.push(item);
                    }
                }
            }
        }

        return new DiaclockSystemEntityList(...items);
    }
}

/**
 * @param {DiaclockSystemEntity} entity
 * @return {{name: string, position: string}}
 */
function serializeEntity(entity) {
    return {name: entity.name, position: entity.position.toCellId()};
}

/**
 * @param {{name: string, position: string}} source
 * @param {DiaclockSystemPositionParser} positionParser
 */
function tryDeserializeEntity(source, positionParser) {
    const position = positionParser.parse(source.position);
    return position != null ? new DiaclockSystemEntity(source.name, position) : null;
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
