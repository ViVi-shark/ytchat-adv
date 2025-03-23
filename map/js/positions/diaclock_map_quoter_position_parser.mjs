import {DiaclockSystemPositionParser} from "./DiaclockSystemPositionParser.mjs";
import {DiaclockMapQuoterPosition} from "./diaclock_map_quoter_position.mjs";

class DiaclockMapQuoterPosition_Center extends DiaclockMapQuoterPosition {
    constructor() {
        super(-1);
    }

    toCellId() {
        return 'center';
    }
}

/** @var {DiaclockMapQuoterPosition} */
const center = new DiaclockMapQuoterPosition_Center();



class DiaclockMapQuoterPosition_Invalid extends DiaclockMapQuoterPosition {
    constructor() {
        super(-1);
    }

    toCellId() {
        return '';
    }
}

/** @var {DiaclockMapQuoterPosition} */
const invalidPosition = new DiaclockMapQuoterPosition_Invalid();



export class DiaclockMapQuoterPositionParser extends DiaclockSystemPositionParser {
    /**
     * @param {string} source
     * @param {boolean} allowInvalidPosition
     * @return {DiaclockMapQuoterPosition|null}
     */
    parse(source, allowInvalidPosition = false) {
        const normalized = DiaclockMapQuoterPositionParser.normalize(source);

        if (normalized === 'center') {
            return center;
        }

        const m = normalized.match(/\d+/);

        if (m != null) {
            const index = parseInt(m[0]);

            if (1 <= index && index <= 6) {
                return new DiaclockMapQuoterPosition(index);
            }
        }

        return allowInvalidPosition ? invalidPosition : null;
    }
}
