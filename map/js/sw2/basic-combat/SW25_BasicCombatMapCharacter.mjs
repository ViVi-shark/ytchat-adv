import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";
import {SW25_BasicCombatMapPosition} from  "./SW25_BasicCombatMapPosition.mjs";
import {SW25_BasicCombatMapEntity} from "./SW25_BasicCombatMapEntity.mjs";

export class SW25_BasicCombatMapCharacter extends SW25_BasicCombatMapEntity {
    /**
     * @param {string} name
     * @param {SW25_BasicCombatMapPosition} position
     * @param {?SW2_MapEntityColor} color
     */
    constructor(name, position, color = null) {
        super(name, position, color);
    }

    get type() {
        return SW2_MapEntityType.character;
    }
}
