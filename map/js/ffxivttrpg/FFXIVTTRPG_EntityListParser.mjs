import {SquareMapEntityListParser} from "../SquareMapEntityListParser.mjs";
import {FFXIVTTRPG_EntityList} from "./FFXIVTTRPG_EntityList.mjs";
import {SquareMapPositionParser} from "../positions/SquareMapPositionParser.mjs";
import {FFXIVTTRPG_EntityRowParser} from "./FFXIVTTRPG_EntityRowParser.mjs";

export class FFXIVTTRPG_EntityListParser extends SquareMapEntityListParser {
    /**
     * @param {SquareMapSize} mapSize
     */
    constructor(mapSize) {
        super(
            new FFXIVTTRPG_EntityRowParser(
                new SquareMapPositionParser(mapSize)
            )
        );
    }

    _instantiateList() {
        return new FFXIVTTRPG_EntityList();
    }
}
