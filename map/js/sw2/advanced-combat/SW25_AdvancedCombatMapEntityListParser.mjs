import {MapEntityListParser} from "../../MapEntityListParser.mjs";
import {SW25_AdvancedCombatMapEntityList} from "./SW25_AdvancedCombatMapEntityList.mjs";
import {SW2_MapEntityColor} from "../SW2_MapEntityColor.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";

export class SW25_AdvancedCombatMapEntityListParser extends MapEntityListParser {
    constructor() {
        super(null);
    }

    // noinspection JSCheckFunctionSignatures
    parse(source) {
        const list = this._instantiateList();

        let text = trim(source);
        /** @var {int} */
        let positionFromLeftEnd = 0;
        /** @var {int} */
        let gapSerial = 0;

        /** @var {Object<string, {positionFromLeftEnd: int, name?: string}>} */
        const lastRanges = {};

        /**
         * @param {string} startOrEndChar
         * @return {string}
         */
        function getRangeKey(startOrEndChar) {
            switch (startOrEndChar) {
                case '[':
                case '［':
                case ']':
                case '］':
                    return '[]';
                case '{':
                case '｛':
                case '}':
                case '｝':
                    return '{}';
                default:
                    throw new Error(`Unexpected range part: ${startOrEndChar}`);
            }
        }

        /**
         * @param {'[]'|'{}'} key
         * @return int
         */
        function getRangeLayerFromKey(key) {
            switch (key) {
                case '[]':
                    return 0;
                case '{}':
                    return 1;
                default:
                    throw new Error(`Unexpected range key: '${key}'`);
            }
        }

        while (text !== '') {
            const m = text.match(/[\s　]*-+[\s　]*([^-]+)[\s　]*-+[\s　]*/);

            const gap = m != null ? m[1] : null;
            const end = m != null ? m.index : text.length;
            const gapLength = m != null ? m[0].length : 0;

            {
                const entitiesSource = trim(text.substring(0, end));

                let m;
                if (
                    (m = entitiesSource.match(/^([\[［])[\s　]*([^\]］]*)$/)) != null ||
                    (m = entitiesSource.match(/^([{｛])[\s　]*([^｝}]*)$/)) != null
                ) {
                    const key = getRangeKey(m[1]);
                    const name = m[2];

                    lastRanges[key] = {positionFromLeftEnd};

                    if (name != null) {
                        lastRanges[key]['name'] = name;
                    }

                    list.addPoint({positionFromLeftEnd});
                } else if (
                    (m = entitiesSource.match(/^[^\[［]*[\s　]*([\]］])$/)) != null ||
                    (m = entitiesSource.match(/^[^{｛]*[\s　]*([｝}])$/)) != null
                ) {
                    const key = getRangeKey(m[1]);

                    if (key in lastRanges) {
                        list.addPoint({positionFromLeftEnd});

                        {
                            const o = {
                                layer: getRangeLayerFromKey(key),
                                positionFromLeftEnd: lastRanges[key].positionFromLeftEnd,
                                size: positionFromLeftEnd - lastRanges[key].positionFromLeftEnd
                            };

                            if ('name' in lastRanges[key]) {
                                o['name'] = lastRanges[key]['name'];
                            }

                            list.addRange(o);
                        }

                        delete lastRanges[key];
                    }
                } else {
                    for (const entity of parsePoint(entitiesSource)) {
                        const o = {};
                        Object.assign(o, entity);

                        o.positionFromLeftEnd = positionFromLeftEnd;

                        list.instantiateEntity(o);
                    }
                }
            }

            text = text.substring(end + gapLength);

            if (gap != null) {
                gapSerial++;

                const m = gap.match(/([^\s　]+)[ｍmＭM]/);

                if (m != null && /^\d+$/.test(m[1])) {
                    positionFromLeftEnd += parseInt(m[1]);
                } else {
                    positionFromLeftEnd += 10; // dummy offset
                    list.setGapName(gapSerial, m != null ? `${m[1]}m` : gap);
                }
            }
        }

        return list;
    }

    /**
     * @return {SW25_AdvancedCombatMapEntityList}
     * @private
     * @final
     */
    _instantiateList() {
        return new SW25_AdvancedCombatMapEntityList();
    }
}

/**
 * @param {string} source
 * @return {Generator<{type: SW2_MapEntityType, name: string, color?: SW2_MapEntityColor}>}
 */
function parsePoint(source) {
    {
        const m = source
            .replaceAll('\n', '\t')
            .match(/^[\[［](.*?)[\]］]$/u);

        if (m != null) {
            return _parsePoint(trim(m[1].replaceAll('\t', '\n')));
        }
    }

    return _parsePoint(source);
}

/**
 * @param {string} source
 * @return {Generator<{type: SW2_MapEntityType, name: string, color?: SW2_MapEntityColor}>}
 */
function* _parsePoint(source) {
    let color;

    const entitySources = trim(source).split(/[,，、∥⚔\n]/u)
        .map(x => trim(x))
        .filter(x => x !== '');

    for (const entitySource of entitySources) {
        const m = entitySource.match(/^[\s　]*([🔵🔴🟠🟡])?[\s　]*(.+?)[\s　]*$/u);

        if (m == null) {
            console.error(`Unexpected entity source: '${entitySource}'`);
            continue;
        }

        if (m[1] != null) {
            color = (mark => {
                switch (mark) {
                    case '🔵':
                        return SW2_MapEntityColor.blue;
                    case '🔴':
                        return SW2_MapEntityColor.red;
                    case '🟠':
                        return SW2_MapEntityColor.orange;
                    case '🟡':
                        return SW2_MapEntityColor.yellow;
                    default:
                        throw new Error();
                }
            })(m[1]);
        }

        const o = {
            type: SW2_MapEntityType.character,
            name: m[2]
        };

        if (color != null) {
            o.color = color;
        }

        yield o;
    }
}

/**
 * @param {string} source
 * @return {string}
 */
function trim(source) {
    return source
        .replace(/^[\s　]+/, '')
        .replace(/[\s　]+$/, '');
}
