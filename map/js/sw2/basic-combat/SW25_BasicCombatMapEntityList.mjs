import {MapEntityList} from "../../MapEntityList.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";
import {SW25_BasicCombatMapCharacter} from "./SW25_BasicCombatMapCharacter.mjs";
import {SW25_BasicCombatMapPosition} from "./SW25_BasicCombatMapPosition.mjs";

/**
 * @typedef SW25_BasicMapEntitySource
 * @property {SW2_MapEntityType} type
 * @property {string} name
 * @property {SW25_BasicCombatMapPosition} position
 * @property {SW2_MapEntityColor} [color]
 */

/**
 * @final
 */
export class SW25_BasicCombatMapEntityList extends MapEntityList {
    /**
     * @param {SW25_BasicMapEntitySource} source
     */
    instantiateEntity(source) {
        super.instantiateEntity(source);
    }

    /**
     * @param {SW25_BasicMapEntitySource} source
     * @return {SW25_BasicCombatMapEntity}
     * @protected
     */
    _instantiateEntity(source) {
        if (source.type === SW2_MapEntityType.character) {
            return new SW25_BasicCombatMapCharacter(
                source.name,
                source.position,
                source.color
            );
        }

        throw new Error(`type '${source.type}' is not supported. (name: ${source.name})`);
    }

    /**
     * @callback SW25_BasicCombatMapEntityList~forEach
     * @param {SW25_BasicCombatMapEntity} entity
     * @param {int} index
     */

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {SW25_BasicCombatMapEntityList~forEach} callbackFn
     * @param {null|SW2_MapEntityType|Array<SW2_MapEntityType>} filter
     */
    forEach(callbackFn, filter = null) {
        super.forEach(
            /**
             * @param {SW25_BasicCombatMapEntity} item
             * @param {int} index
             */
            (item, index) => {
                if (filter == null || item.type === filter || filter.includes(item.type)) {
                    callbackFn(item, index);
                }
            }
        );
    }
}
