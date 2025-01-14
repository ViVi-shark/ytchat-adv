import {MapPosition} from "./MapPosition.mjs";

export class DiaclockSystemPosition extends MapPosition {
    /**
     * @return {string}
     */
    toCellId() {
        throw new Error();
    }

    serialize() {
        return this.toCellId();
    }
}
