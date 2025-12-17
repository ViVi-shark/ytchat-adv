import {SW2_MapTextParser} from "../SW2_MapTextParser.mjs";
import {SW25_CombatMapHub} from "../combat-map-hub/SW25_CombatMapHub.mjs";

export class SW25_CombatMapHubForLog extends SW25_CombatMapHub {
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
