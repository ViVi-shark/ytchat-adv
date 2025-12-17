import {MapBase} from "../../MapBase.mjs";
import {SW2_MapTextParser} from "../SW2_MapTextParser.mjs";
import {SW25_BasicCombatMapRenderer} from "./SW25_BasicCombatMapRenderer.mjs";
import {SW25_BasicCombatMapEntityListParser} from "./SW25_BasicCombatMapEntityListParser.mjs";

export class SW25_BasicCombatMap extends MapBase {
    /** @type {SW2_MapTextParser} */
    #textParser;

    /**
     * @param {?SW2_MapTextParser} textParser
     */
    constructor(textParser = null) {
        super(new SW25_BasicCombatMapEntityListParser());
        this.#textParser = textParser ?? new SW2_MapTextParser();
    }

    _instantiateRenderer(node) {
        return new SW25_BasicCombatMapRenderer(node, this.#textParser);
    }
}
