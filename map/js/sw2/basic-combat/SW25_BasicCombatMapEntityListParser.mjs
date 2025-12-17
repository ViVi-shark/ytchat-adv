import {MapEntityListParser} from "../../MapEntityListParser.mjs";
import {SW2_MapEntityColor} from "../SW2_MapEntityColor.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";
import {SW25_BasicCombatMapEntityList} from "./SW25_BasicCombatMapEntityList.mjs";
import {SW25_BasicCombatMapPosition} from "./SW25_BasicCombatMapPosition.mjs";

export class SW25_BasicCombatMapEntityListParser extends MapEntityListParser {
    constructor() {
        super(null);
    }

    // noinspection JSCheckFunctionSignatures
    parse(source) {
        const list = this._instantiateList();

        const [pcBackward, forward, enemyBackward] = source.split(/^===+$/m);

        this._parseArea(list, SW25_BasicCombatMapPosition.PcBackward, pcBackward ?? '');
        this._parseArea(list, SW25_BasicCombatMapPosition.Forward, forward ?? '');
        this._parseArea(list, SW25_BasicCombatMapPosition.EnemyBackward, enemyBackward ?? '');

        return list;
    }

    /**
     * @private
     */
    _parseArea(list, position, source) {
        let color;
        for (const entitySource of source.split(/[\s　]*[,\n][\s　]*/).filter(x => x !== '')) {
            const m = entitySource.match(/^([🔵🔴🟠🟡])?[\s　]*(.+?)[\s　]*$/u);

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
                name: m[2],
                position
            };

            if (color != null) {
                o.color = color;
            }

            list.instantiateEntity(o);
        }
    }

    /**
     * @return {SW25_BasicCombatMapEntityList}
     * @private
     * @final
     */
    _instantiateList() {
        return new SW25_BasicCombatMapEntityList();
    }
}
