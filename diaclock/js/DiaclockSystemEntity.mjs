import {DiaclockSystemPosition} from "./positions/DiaclockSystemPosition.mjs";

const generateEntityId = (() => {
    let i = 0;
    return () => `entity-${++i}`;
})();

export class DiaclockSystemEntity {
    /** @var {string} */
    #id;

    /** @var {string} */
    #name;

    /** @var {DiaclockSystemPosition} */
    #position;

    /**
     * @param {string} name
     * @param {DiaclockSystemPosition} position
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
     * @return {string}
     */
    get id() {
        return this.#id;
    }

    /**
     * @return {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * @return {DiaclockSystemPosition}
     */
    get position() {
        return this.#position;
    }
}
