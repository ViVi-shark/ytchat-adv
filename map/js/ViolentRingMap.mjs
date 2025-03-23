import {DiaclockMapQuoter} from "./diaclock.mjs";
import {DiaclockMapQuoterPositionParser} from "./positions/diaclock_map_quoter_position_parser.mjs";
import {DiaclockMapRenderer} from "./DiaclockMapRenderer.mjs";

export class ViolentRingMap extends DiaclockMapQuoter {
    constructor() {
        super(new PositionParser());
        this._hideCenter();
    }

    _instantiateRenderer(node) {
        return new Renderer(node, this._cellCountInCircle, this._circleCount);
    }
}



class PositionParser extends DiaclockMapQuoterPositionParser {
    constructor() {
        super();
    }

    parse(source, allowInvalidPosition = false) {
        return super.parse(kanjiMap[source] ?? source, allowInvalidPosition);
    }
}

/**
 * @type {Object<string, string>}
 */
const kanjiMap = {
    '壱': '1',
    '弐': '2',
    '参': '3',
    '肆': '4',
    '伍': '5',
    '陸': '6'
};



class Renderer extends DiaclockMapRenderer {
    _refreshEntityElement(entityElement, entity) {
        super._refreshEntityElement(entityElement, entity);

        const unitStatusElement =
            document.querySelector(`#status-body > dl[data-name="${entity.name}"]`);

        if (unitStatusElement == null) {
            return false;
        }

        const range =
            unitStatusElement.querySelector('ul.details > [data-stt="間合"] .num-font .value')?.textContent;

        if (range == null) {
            console.log(`Unit '${entity.name}' has not property '間合'.`);
            return false;
        }

        let changed = false;

        {
            const rangeElement =
                entityElement.querySelector('.property[data-property-name="間合"]') ??
                (entityElement => {
                    const element = document.createElement('span');
                    element.classList.add('property');
                    element.dataset.propertyName = "間合";

                    entityElement.appendChild(element);

                    return element;
                })(entityElement);

            if (range !== rangeElement.textContent) {
                rangeElement.textContent = range;
                changed = true;
            }
        }

        return changed;
    }
}
