import {DiaclockMapCore} from "./diaclock.mjs";
import {MaleGateMapPosition} from "./positions/male_gate_map_position.mjs";

export class MaleGateMap extends DiaclockMapCore {
    constructor() {
        super(14, 1, MaleGateMapPosition.parser);

        this._addClassToRenderer('m-gate-map');
        this._hideCenter();
    }
}
