import {MapBase} from "../../MapBase.mjs";
import {SW25_AdvancedCombatMapRenderer} from "./SW25_AdvancedCombatMapRenderer.mjs";
import {SW25_AdvancedCombatMapEntityListParser} from "./SW25_AdvancedCombatMapEntityListParser.mjs";
import {SW2_MapTextParser} from "../SW2_MapTextParser.mjs";

export class SW25_AdvancedCombatMap extends MapBase {
    /** @type {SW2_MapTextParser} */
    #textParser;

    /**
     * @param {?SW2_MapTextParser} textParser
     */
    constructor(textParser = null) {
        super(new SW25_AdvancedCombatMapEntityListParser());
        this.#textParser = textParser ?? new SW2_MapTextParser();
    }

    _instantiateRenderer(node) {
        return new SW25_AdvancedCombatMapRenderer(node, this.#textParser);
    }
}
