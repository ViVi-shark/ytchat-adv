import {SW25_AdvancedCombatMapEntity} from "./SW25_AdvancedCombatMapEntity.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";

export class SW25_AdvancedCombatMapNil extends SW25_AdvancedCombatMapEntity {
    /**
     * @param {int} positionFromLeftEnd
     */
    constructor(positionFromLeftEnd) {
        super('', positionFromLeftEnd);
    }

    get type() {
        return SW2_MapEntityType.nil;
    }
}
