import {MapRenderer} from "../../MapRenderer.mjs";
import {SW25_AdvancedCombatMapEntityList} from "../advanced-combat/SW25_AdvancedCombatMapEntityList.mjs";
import {SW25_AdvancedCombatMapRenderer} from "../advanced-combat/SW25_AdvancedCombatMapRenderer.mjs";
import {SW25_BasicCombatMapEntityList} from "../basic-combat/SW25_BasicCombatMapEntityList.mjs";
import {SW25_BasicCombatMapRenderer} from "../basic-combat/SW25_BasicCombatMapRenderer.mjs";

export class SW25_CombatMapRendererHub extends MapRenderer {
    /** @type {SW25_BasicCombatMapRenderer} */
    #rendererForBasicCombat;

    /** @type {SW25_AdvancedCombatMapRenderer} */
    #rendererForAdvancedCombat;

    /**
     * @param {HTMLElement} node
     * @param {SW2_MapTextParser} textParser
     */
    constructor(node, textParser) {
        super(node);
        node.classList.remove('map');
        node.classList.add('map-hub');

        /**
         * @param {HTMLElement} parent
         * @return {HTMLElement}
         */
        function createMapNodeForRule(parent) {
            const node = document.createElement('div');

            parent.appendChild(node);

            return node;
        }

        const basicCombatMapNode = createMapNodeForRule(node);
        const advancedCombatMapNode = createMapNodeForRule(node);

        this.#rendererForBasicCombat = new SW25_BasicCombatMapRenderer(basicCombatMapNode, textParser);
        this.#rendererForAdvancedCombat = new SW25_AdvancedCombatMapRenderer(advancedCombatMapNode, textParser);
    }

    resize() {
        this.#rendererForBasicCombat.resize();
        this.#rendererForAdvancedCombat.resize();
    }

    /**
     * @private
     */
    _resize(canvasSize) {
    }

    updateEntities(entities) {
        if (entities instanceof SW25_BasicCombatMapEntityList) {
            this.#rendererForBasicCombat.updateEntities(entities);
            this._node.dataset.combatRule = '基本戦闘';
        } else if (entities instanceof SW25_AdvancedCombatMapEntityList) {
            this.#rendererForAdvancedCombat.updateEntities(entities);
            this._node.dataset.combatRule = '上級戦闘';
        } else {
            delete this._node.dataset['combatRule'];
        }
    }

    /**
     * @private
     */
    _updateEntities(entities) {
        return false;
    }
}
