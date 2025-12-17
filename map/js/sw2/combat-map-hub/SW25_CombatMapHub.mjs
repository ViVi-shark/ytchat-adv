import {MapBase} from "../../MapBase.mjs";
import {SW2_MapTextParser} from "../SW2_MapTextParser.mjs";
import {SW25_CombatMapEntityListParserHub} from "./SW25_CombatMapEntityListParserHub.mjs";
import {SW25_CombatMapRendererHub} from "./SW25_CombatMapRendererHub.mjs";

export class SW25_CombatMapHub extends MapBase {
    /** @type {SW2_MapTextParser} */
    #textParser;

    /**
     * @param {?SW2_MapTextParser} textParser
     */
    constructor(textParser = null) {
        super(new SW25_CombatMapEntityListParserHub());
        this.#textParser = textParser ?? new SW2_MapTextParser();
    }

    _instantiateRenderer(node) {
        return new SW25_CombatMapRendererHub(node, this.#textParser);
    }
}
