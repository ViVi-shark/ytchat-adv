import {SW25_AdvancedCombatMap} from "../advanced-combat/SW25_AdvancedCombatMap.mjs";
import {SW2_MapTextParser} from "../SW2_MapTextParser.mjs";

export class SW25_AdvancedCombatMapForLog extends SW25_AdvancedCombatMap {
    constructor() {
        super(new TextParser());
    }
}

class TextParser extends SW2_MapTextParser {
    parse(source) {
        return source
            .replace(/<unit:\s*([^/]+?)\s*\/>/g, '<unit:$1>$1</unit>')
            .replace(/<unit:\s*[^/]+?\s*>\s*(.+?)\s*<\/unit>/g, '$1');
    }
}
