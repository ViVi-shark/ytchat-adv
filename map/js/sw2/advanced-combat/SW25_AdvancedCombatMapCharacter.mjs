import {SW25_AdvancedCombatMapEntity} from "./SW25_AdvancedCombatMapEntity.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";

export class SW25_AdvancedCombatMapCharacter extends SW25_AdvancedCombatMapEntity {
    /**
     * @param {string} name
     * @param {int} positionFromLeftEnd
     * @param {?SW2_MapEntityColor} color
     */
    constructor(name, positionFromLeftEnd, color = null) {
        super(name, positionFromLeftEnd, color);
    }

    get type() {
        return SW2_MapEntityType.character;
    }
}
