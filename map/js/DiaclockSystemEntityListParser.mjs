import {DiaclockSystemPositionParser} from "./positions/DiaclockSystemPositionParser.mjs";
import {DiaclockSystemEntityList} from "./DiaclockSystemEntityList.mjs";
import {MapEntityListParser} from "./MapEntityListParser.mjs";
import {MapEntityRowParser} from "./MapEntityRowParser.mjs";

export class DiaclockSystemEntityListParser extends MapEntityListParser {
    /**
     * @param {DiaclockSystemPositionParser} positionParser
     */
    constructor(positionParser) {
        super(new MapEntityRowParser(positionParser));
    }

    _instantiateList() {
        return new DiaclockSystemEntityList();
    }
}
