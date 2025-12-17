import {MapEntityList} from "../../MapEntityList.mjs";
import {MapEntityListParser} from "../../MapEntityListParser.mjs";
import {SW25_BasicCombatMapEntityListParser} from "../basic-combat/SW25_BasicCombatMapEntityListParser.mjs";
import {SW25_AdvancedCombatMapEntityListParser} from "../advanced-combat/SW25_AdvancedCombatMapEntityListParser.mjs";

export class SW25_CombatMapEntityListParserHub extends MapEntityListParser {
    #parserForBasicCombat = new SW25_BasicCombatMapEntityListParser();
    #parserForAdvancedCombat = new SW25_AdvancedCombatMapEntityListParser();

    constructor() {
        super(null);
    }

    // noinspection JSCheckFunctionSignatures
    parse(source) {
        let combatRule;
        let entitiesSource;

        if (/^\n*#基本戦闘\s*(\n|$)/.test(source)) {
            combatRule = '基本戦闘';
            entitiesSource = source.replace(/^\n*#基本戦闘\s*(\n|$)/, '');
        } else if (/^\n*#上級戦闘\s*(\n|$)/.test(source)) {
            combatRule = '上級戦闘';
            entitiesSource = source.replace(/^\n*#上級戦闘\s*(\n|$)/, '');
        } else {
            combatRule = '上級戦闘';
            entitiesSource = source;
        }

        switch (combatRule) {
            case '基本戦闘':
                return this.#parserForBasicCombat.parse(entitiesSource);
            case '上級戦闘':
                return this.#parserForAdvancedCombat.parse(entitiesSource);
            default:
                console.warn(`Unexpected combat rule: ${combatRule}`);
                return new EmptyList();
        }
    }

    /**
     * @private
     * @final
     */
    _instantiateList() {
        throw new Error('not implemented!');
    }
}

class EmptyList extends MapEntityList {
    _instantiateEntity(source) {
    }
}
