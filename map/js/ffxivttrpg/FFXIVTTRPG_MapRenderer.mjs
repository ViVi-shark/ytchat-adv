import {SquareMapRenderer} from "../SquareMapRenderer.mjs";
import {FFXIVTTRPG_Character} from "./FFXIVTTRPG_Character.mjs";
import {FFXIVTTRPG_Indication} from "./FFXIVTTRPG_Indication.mjs";

export class FFXIVTTRPG_MapRenderer extends SquareMapRenderer {
    _updateEntities(entities) {
        super._updateEntities(entities);

        /**
         * @return {HTMLElement}
         */
        function createFilterElement() {
            const element = document.createElement('li');
            element.style.setProperty('--color', 'orange');
            return element;
        }

        entities.forEach(
            entity => {
                if (entity instanceof FFXIVTTRPG_Indication) {
                    for (const position of entity.range.enumeratePositions(this.mapSize)) {
                        if (position == null) {
                            console.error(`Position must not be null. (${entity.range.constructor.name}: ${entity.range.toText()})`);
                            continue;
                        }

                        const cell = this._findCellElement(position);

                        if (cell == null) {
                            console.warn(`Cell ${position} is not found. (${entity.range.constructor.name})`);
                            continue;
                        }

                        cell
                            .querySelector('.background-filters')
                            .appendChild(createFilterElement());
                    }
                }
            }
        );

        return true;
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {FFXIVTTRPG_Entity} entity
     * @return {HTMLElement}
     * @private
     */
    _createEntityNameplateElement(entity) {
        const element = super._createEntityNameplateElement(entity);

        if (entity instanceof FFXIVTTRPG_Character && entity.role != null) {
            const icon = document.createElement('i');
            icon.classList.add('icon', 'role-icon');
            icon.dataset.role = entity.role;
            element.prepend(icon);
        }

        return element;
    }
}
