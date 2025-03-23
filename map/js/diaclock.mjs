import {DiaclockSystemPositionParser} from "./positions/DiaclockSystemPositionParser.mjs";
import {DiaclockSystemEntityListParser} from "./DiaclockSystemEntityListParser.mjs";
import {DiaclockMapPosition} from "./positions/diaclock_map_position.mjs";
import {DiaclockMapQuoterPosition} from "./positions/diaclock_map_quoter_position.mjs";
import {DiaclockSystemEntityList} from "./DiaclockSystemEntityList.mjs";
import {MapRenderer} from "./MapRenderer.mjs";
import {MapBase} from "./MapBase.mjs";
import {DiaclockMapQuoterPositionParser} from "./positions/diaclock_map_quoter_position_parser.mjs";
import {DiaclockMapRenderer} from "./DiaclockMapRenderer.mjs";

export class DiaclockMapCore extends MapBase {
    /** @var {int} */
    #cellCountInCircle;

    /** @var {int} */
    #circleCount;

    /**
     * @param {int} cellCountInCircle
     * @param {int} circleCount
     * @param {DiaclockSystemPositionParser} positionParser
     */
    constructor(
        cellCountInCircle,
        circleCount,
        positionParser
    ) {
        super(new DiaclockSystemEntityListParser(positionParser));

        this.#cellCountInCircle = cellCountInCircle;
        this.#circleCount = circleCount;
    }

    /**
     * @protected
     */
    get _cellCountInCircle() {
        return this.#cellCountInCircle;
    }

    /**
     * @protected
     */
    get _circleCount() {
        return this.#circleCount;
    }

    /**
     * @protected
     */
    _hideCenter() {
        this._addClassToRenderer('hide-center');
    }

    _instantiateRenderer(node) {
        return new DiaclockMapRenderer(node, this.#cellCountInCircle, this.#circleCount);
    }
}

export class DiaclockMap extends DiaclockMapCore {
    constructor() {
        super(12, 2, DiaclockMapPosition.parser);
    }
}

export class DiaclockMapQuoter extends DiaclockMapCore {
    constructor() {
        super(6, 1, new DiaclockMapQuoterPositionParser());
    }
}
