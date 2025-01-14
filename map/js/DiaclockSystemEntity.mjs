import {DiaclockSystemPosition} from "./positions/DiaclockSystemPosition.mjs";
import {MapEntity} from "./MapEntity.mjs";

export class DiaclockSystemEntity extends MapEntity {
    /** @var {DiaclockSystemPosition} */
    #position;

    /**
     * @param {string} name
     * @param {DiaclockSystemPosition} position
     */
    constructor(name, position) {
        super(name, position);

        this.#position = position;
    }

    /**
     * @return {DiaclockSystemPosition}
     */
    get position() {
        return this.#position;
    }
}
