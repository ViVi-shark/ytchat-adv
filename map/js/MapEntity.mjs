import {MapPosition} from "./positions/MapPosition.mjs";

const generateEntityId = (() => {
    let i = 0;
    return () => `entity-${++i}`;
})();

/**
 * @abstract
 */
export class MapEntity {
    /** @var {string} */
    #id;

    /** @var {string} */
    #name;

    /** @var {MapPosition} */
    #position;

    /**
     * @param {string} name
     * @param {MapPosition} position
     */
    constructor(name, position) {
        if (position == null) {
            console.error(`Must be specified position. (entity-name: ${name})`);
        }

        this.#id = generateEntityId();
        this.#name = name;
        this.#position = position;
    }

    /**
     * @final
     * @return {string}
     */
    get id() {
        return this.#id;
    }

    /**
     * @final
     * @return {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * @return {boolean}
     */
    get hasName() {
        return true;
    }

    /**
     * @return {MapPosition}
     */
    get position() {
        return this.#position;
    }

    /**
     * @return {{name: string, id: string, position: *}}
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            position: this.position.serialize()
        };
    }
}
