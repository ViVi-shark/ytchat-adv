import {DiaclockSystemEntity} from "./DiaclockSystemEntity.mjs";
import {DiaclockSystemPositionParser} from "./positions/DiaclockSystemPositionParser.mjs";
import {MapEntityList} from "./MapEntityList.mjs";

/**
 * @typedef DiaclockSystemEntitySource
 * @property {string} name
 * @property {DiaclockSystemPosition} position
 */

export class DiaclockSystemEntityList extends MapEntityList {
    /**
     * @param {DiaclockSystemEntity} items
     */
    constructor(...items) {
        super(...items);
    }

    /**
     * @callback DiaclockSystemEntityList~forEach
     * @param {DiaclockSystemEntity} entity
     * @param {int} index
     */

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {DiaclockSystemEntityList~forEach} callbackFn
     */
    forEach(callbackFn) {
        super.forEach(callbackFn);
    }

    /**
     * @param {string} json
     * @param {DiaclockSystemPositionParser} positionParser
     * @return {DiaclockSystemEntityList}
     */
    static fromJson(json, positionParser) {
        const list = new DiaclockSystemEntityList();
        list._importFromJson(json, positionParser);
        return list;
    }

    /**
     * @param {DiaclockSystemEntitySource} source
     * @return {DiaclockSystemEntity}
     * @private
     */
    _instantiateEntity(source) {
        return new DiaclockSystemEntity(source.name, source.position);
    }
}
