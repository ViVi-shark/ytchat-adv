import {MapEntityList} from "../../MapEntityList.mjs";
import {SW25_AdvancedCombatMapCharacter} from "./SW25_AdvancedCombatMapCharacter.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";
import {SW25_AdvancedCombatMapNil} from "./SW25_AdvancedCombatMapNil.mjs";
import {SW25_AdvancedCombatMapRange} from "./SW25_AdvancedCombatMapRange.mjs";

/**
 * @typedef SW25_AdvancedMapPointSource
 * @property {int} positionFromLeftEnd
 */

/**
 * @typedef SW25_AdvancedMapRangeSource
 * @property {string?} name
 * @property {int} positionFromLeftEnd
 * @property {int} size
 * @property {int} layer
 */

/**
 * @typedef SW25_AdvancedMapEntitySource
 * @property {SW2_MapEntityType} type
 * @property {string} name
 * @property {int} positionFromLeftEnd
 * @property {int} [size]
 * @property {SW2_MapEntityColor} [color]
 * @property {int} [layer]
 */

/**
 * @final
 */
export class SW25_AdvancedCombatMapEntityList extends MapEntityList {
    /** @type {Object<string, string>} */
    #gapNames = {};

    /**
     * @param {int} gapSerial
     * @param {string} name
     */
    setGapName(gapSerial, name) {
        this.#gapNames[gapSerial.toString()] = name;
    }

    /**
     * @param {SW25_AdvancedMapPointSource} source
     */
    addPoint(source) {
        this.instantiateEntity(
            {
                type: SW2_MapEntityType.nil,
                positionFromLeftEnd: source.positionFromLeftEnd,
                name: ''
            }
        );
    }

    /**
     * @param {SW25_AdvancedMapRangeSource} source
     */
    addRange(source) {
        this.instantiateEntity(
            {
                type: SW2_MapEntityType.range,
                name: source.name ?? '',
                positionFromLeftEnd: source.positionFromLeftEnd,
                size: source.size,
                layer: source.layer
            }
        );
    }

    /**
     * @param {int} gapSerial
     * @return {string|null}
     */
    findGapName(gapSerial) {
        return this.#gapNames[gapSerial.toString()] ?? null;
    }

    /**
     * @param {SW25_AdvancedMapEntitySource} source
     */
    instantiateEntity(source) {
        super.instantiateEntity(source);
    }

    /**
     * @param {SW25_AdvancedMapEntitySource} source
     * @return {SW25_AdvancedCombatMapEntity}
     * @protected
     */
    _instantiateEntity(source) {
        if (source.type === SW2_MapEntityType.nil) {
            return new SW25_AdvancedCombatMapNil(source.positionFromLeftEnd);
        }

        if (source.type === SW2_MapEntityType.character) {
            return new SW25_AdvancedCombatMapCharacter(
                source.name,
                source.positionFromLeftEnd,
                source.color
            );
        }

        if (source.type === SW2_MapEntityType.range) {
            return new SW25_AdvancedCombatMapRange(
                source.name,
                source.layer,
                source.positionFromLeftEnd,
                source.size
            );
        }

        throw new Error(`type '${source.type}' is not supported. (name: ${source.name})`);
    }

    /**
     * @callback SW25_AdvancedCombatMapEntityList~forEach
     * @param {SW25_AdvancedCombatMapEntity} entity
     * @param {int} index
     */

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {SW25_AdvancedCombatMapEntityList~forEach} callbackFn
     * @param {null|SW2_MapEntityType|Array<SW2_MapEntityType>} filter
     */
    forEach(callbackFn, filter = null) {
        super.forEach(
            /**
             * @param {SW25_AdvancedCombatMapEntity} item
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
