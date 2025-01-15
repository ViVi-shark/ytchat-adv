import {SquareMap} from "../SquareMap.mjs";
import {FFXIVTTRPG_EntityListParser} from "./FFXIVTTRPG_EntityListParser.mjs";
import {FFXIVTTRPG_MapRenderer} from "./FFXIVTTRPG_MapRenderer.mjs";

export class FFXIVTTRPG_Map extends SquareMap {
    /**
     * @param {SquareMapSize} size
     */
    constructor(size) {
        super(size, new FFXIVTTRPG_EntityListParser(size));
    }

    _instantiateRenderer(node) {
        return new FFXIVTTRPG_MapRenderer(this.size, node);
    }
}
