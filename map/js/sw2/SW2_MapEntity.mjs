import {MapEntity} from "../MapEntity.mjs";
import {MapPosition} from "../positions/MapPosition.mjs";

export class SW2_MapEntity extends MapEntity {
    /** @var {SW2_MapEntityColor|null} */
    #color;

    /**
     * @param {string} name
     * @param {?SW2_MapEntityColor} color
     */
    constructor(name, color = null) {
        super(name, new DummyPosition());

        this.#color = color;
    }

    /**
     * @abstract
     * @return {SW2_MapEntityType}
     */
    get type() {
        throw new Error('not implemented');
    }

    /**
     * @return {SW2_MapEntityColor|null}
     */
    get color() {
        return this.#color;
    }
}

class DummyPosition extends MapPosition {
    serialize() {
        return 'DUMMY';
    }
}
