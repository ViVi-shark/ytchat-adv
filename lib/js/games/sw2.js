import {SW25_AdvancedCombatMap} from "../../../map/js/sw2/advanced-combat/SW25_AdvancedCombatMap.mjs";
import {SW2_MapTextParser} from "../../../map/js/sw2/SW2_MapTextParser.mjs";

class TextParserInRoom extends SW2_MapTextParser {
    parse(source) {
        if (/^[^<>]+$/.test(source)) {
            if (existsUnit(source)) {
                return this.parse(`<unit:${source}/>`);
            }

            if (/[&＆]/.test(source)) {
                const resolved =
                    source.split(/[&＆]/g)
                        .map(x => x.trim())
                        .filter(x => x !== '')
                        .map(x => existsUnit(x) ? `<unit:${x}/>` : x)
                        .join('＆');

                if (resolved !== source) {
                    return this.parse(resolved);
                }
            }
        }

        return tagConvert(
            source
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
        );
    }
}

/**
 * @param {string} unitName
 * @return {boolean}
 */
function existsUnit(unitName) {
    const dummy = document.createElement('span');
    dummy.textContent = unitName;

    return document.querySelector(`#status-body > [data-name="${dummy.innerHTML}"]`) != null;
}

supportMap(new SW25_AdvancedCombatMap(new TextParserInRoom()));

document.querySelector('#map-window .right-area .upper textarea').removeAttribute('wrap');
