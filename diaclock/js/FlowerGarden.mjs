import {DiaclockMapQuoter} from "./diaclock.mjs";

export class FlowerGarden extends DiaclockMapQuoter {
    constructor() {
        super();

        this._addClassToRenderer('flower-garden');
        this._hideCenter();
    }
}
