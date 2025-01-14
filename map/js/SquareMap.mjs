import {MapBase} from "./MapBase.mjs";
import {SquareMapRenderer} from "./SquareMapRenderer.mjs";
import {SquareMapEntityListParser} from "./SquareMapEntityListParser.mjs";
import {SquareMapPositionParser} from "./positions/SquareMapPositionParser.mjs";
import {MapEntityRowParser} from "./MapEntityRowParser.mjs";

export class SquareMap extends MapBase {
    /** @var {SquareMapSize} */
    #size;

    /**
     * @param {SquareMapSize} size
     * @param {SquareMapEntityListParser} entityListParser
     */
    constructor(size, entityListParser = null) {
        super(
            entityListParser ??
            new SquareMapEntityListParser(new MapEntityRowParser(new SquareMapPositionParser(size)))
        );

        this.#size = size;
    }

    get size() {
        return this.#size;
    }

    /**
     * @final
     * @protected
     */
    _instantiateRenderer(node) {
        return new SquareMapRenderer(this.size, node);
    }
}
