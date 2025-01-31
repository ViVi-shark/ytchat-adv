import {SquareMapEntityList} from "../SquareMapEntityList.mjs";
import {FFXIVTTRPG_Character} from "./FFXIVTTRPG_Character.mjs";
import {FFXIVTTRPG_ImmobileIndication} from "./FFXIVTTRPG_ImmobileIndication.mjs";
import {Range_OriginatedSquare} from "../square-map-range/Range_OriginatedSquare.mjs";
import {Range_Cross} from "../square-map-range/Range_Cross.mjs";
import {Range_Row} from "../square-map-range/Range_Row.mjs";
import {Range_Column} from "../square-map-range/Range_Column.mjs";
import {Range_Rows} from "../square-map-range/Range_Rows.mjs";
import {Range_Columns} from "../square-map-range/Range_Columns.mjs";
import {Range_DirectRect} from "../square-map-range/Range_DirectRect.mjs";
import {Range_Point} from "../square-map-range/Range_Point.mjs";
import {Range_Linear} from "../square-map-range/Range_Linear.mjs";
import {FFXIVTTRPG_MobileIndication} from "./FFXIVTTRPG_MobileIndication.mjs";
import {Range_OriginatedRow} from "../square-map-range/Range_OriginatedRow.mjs";
import {Range_OriginatedColumn} from "../square-map-range/Range_OriginatedColumn.mjs";
import {OriginatedRangeBuilder} from "../square-map-range/OriginatedRangeBuilder.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {ReversedRange} from "../square-map-range/ReversedRange.mjs";

/**
 * @typedef FFXIVTTRPG_EntitySource
 * @property {boolean} reverse
 * @property {string} name
 * @property {SquareMapPosition} [position]
 * @property {string} [role]
 * @property {string} [anchor]
 * @property {'square'|'cross'|'row'|'rows'|'column'|'columns'|'point'|'direct-rect'|'linear'} [form]
 * @property {SquareMapPosition} [origin]
 * @property {int} [size]
 * @property {int} [width]
 * @property {int} [height]
 * @property {int} [row]
 * @property {string} [column]
 * @property {int|string|SquareMapPosition} [start]
 * @property {int|string|SquareMapPosition} [end]
 * @property {'UP'|'DOWN'|'LEFT'|'RIGHT'} [direction]
 */

export class FFXIVTTRPG_EntityList extends SquareMapEntityList {
    /** @var {Object<string, Locator>} */
    #locators = {};

    /**
     * @param {FFXIVTTRPG_EntitySource} source
     * @return {FFXIVTTRPG_Entity}
     */
    _instantiateEntity(source) {
        if (source.name === '__固定予兆__') {
            const range = (source => {
                switch (source.form) {
                    case 'square':
                        return new Range_OriginatedSquare(source.origin, source.width, source.height);
                    case 'cross':
                        return new Range_Cross(source.origin, source.size);
                    case 'row':
                        return new Range_Row(source.row);
                    case 'rows':
                        return new Range_Rows(source.start, source.end);
                    case 'column':
                        return new Range_Column(source.column);
                    case 'columns':
                        return new Range_Columns(source.start, source.end);
                    case 'point':
                        return new Range_Point(source.position);
                    case 'direct-rect':
                        return new Range_DirectRect(source.start, source.end);
                    case 'linear':
                        return new Range_Linear(source.origin, source.direction, source.size);
                    default:
                        throw new Error(`Unsupported form: ${source.form}`);
                }
            })(source);

            return new FFXIVTTRPG_ImmobileIndication(
                source.reverse ? new ReversedRange(range) : range
            );
        } else if (source.name === '__移動予兆__') {
            if (source.anchor == null) {
                throw new Error(`Anchor must be specified to mobile indication.`);
            }

            if (!(source.anchor in this.#locators)) {
                this.#locators[source.anchor] = new Locator(source.anchor);
            }

            const anchor = this.#locators[source.anchor];

            const toBuild = (/** @return {OriginatedRangeBuilder~toBuild} */source => {
                switch (source.form) {
                    case 'square':
                        return x => new Range_OriginatedSquare(x, source.width, source.height);
                    case 'cross':
                        return x => new Range_Cross(x, source.size);
                    case 'row':
                        return x => new Range_OriginatedRow(x);
                    case 'column':
                        return x => new Range_OriginatedColumn(x);
                    case 'point':
                        return x => new Range_Point(x);
                    case 'linear':
                        return x => new Range_Linear(x, source.direction, source.size);
                    default:
                        throw new Error(`Unsupported form: ${source.form}`);
                }
            })(source);

            return new FFXIVTTRPG_MobileIndication(
                anchor,
                new OriginatedRangeBuilder(
                    origin => {
                        const range = toBuild(origin);
                        return source.reverse ? new ReversedRange(range) : range;
                    }
                )
            );
        } else if ('role' in source) {
            return new FFXIVTTRPG_Character(source.name, source.position, source.role);
        }

        return new FFXIVTTRPG_Character(source.name, source.position); // character without role
    }

    /**
     * @param {FFXIVTTRPG_Entity} entity
     */
    _onAdded(entity) {
        if (!(entity.name in this.#locators)) {
            this.#locators[entity.name] = new Locator(entity.name);
        }

        this.#locators[entity.name].connect(entity);
    }

    /**
     * @callback FFXIVTTRPG_EntityList~forEach
     * @param {FFXIVTTRPG_Entity} entity
     * @param {int} index
     */

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {FFXIVTTRPG_EntityList~forEach} callbackFn
     */
    forEach(callbackFn) {
        super.forEach(callbackFn);
    }
}


/**
 * @extends FFXIVTTRPG_Locator
 */
class Locator {
    /** @var {string} */
    #name;

    /** @var {null|FFXIVTTRPG_Entity} */
    #connectedEntity;

    /**
     * @param {string} name
     */
    constructor(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }

    get position() {
        return this.#connectedEntity?.position ?? SquareMapPosition.invalid;
    }

    /**
     * @param {FFXIVTTRPG_Entity} entity
     */
    connect(entity) {
        this.#connectedEntity = entity;
    }
}
