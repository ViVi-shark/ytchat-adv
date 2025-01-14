import {MapEntityList} from "./MapEntityList.mjs";
import {SquareMapEntity} from "./SquareMapEntity.mjs";

/**
 * @typedef SquareMapEntitySource
 * @property {string} name
 * @property {SquareMapPosition} position
 */

export class SquareMapEntityList extends MapEntityList {
    /**
     * @param {SquareMapEntitySource} source
     * @return {SquareMapEntity}
     */
    _instantiateEntity(source) {
        return new SquareMapEntity(source.name, source.position);
    }

    /**
     * @callback SquareMapEntityList~forEach
     * @param {SquareMapEntity} entity
     * @param {int} index
     */

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {SquareMapEntityList~forEach} callbackFn
     */
    forEach(callbackFn) {
        super.forEach(callbackFn);
    }
}
