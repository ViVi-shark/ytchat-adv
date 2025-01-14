import {MapEntityListParser} from "./MapEntityListParser.mjs";
import {SquareMapEntityList} from "./SquareMapEntityList.mjs";

export class SquareMapEntityListParser extends MapEntityListParser {
    _instantiateList() {
        return new SquareMapEntityList();
    }
}
