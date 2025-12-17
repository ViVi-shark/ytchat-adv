import {MapRenderer} from "../../MapRenderer.mjs";
import {SW25_BasicCombatMapCharacter} from "./SW25_BasicCombatMapCharacter.mjs";
import {SW25_BasicCombatMapEntity} from "./SW25_BasicCombatMapEntity.mjs";
import {SW25_BasicCombatMapPosition} from "./SW25_BasicCombatMapPosition.mjs";

export class SW25_BasicCombatMapRenderer extends MapRenderer {
    /** @type {SW2_MapTextParser} */
    #textParser;

    /**
     * @param {HTMLElement} node
     * @param {SW2_MapTextParser} textParser
     */
    constructor(node, textParser) {
        super(node, {maxFontSize: 16});

        this.#textParser = textParser;
        this._node.classList.add('sw25', 'basic-combat-map');
        this._node.appendChild(createAreaContainerElement());
    }

    _resize(canvasSize) {
    }

    _updateEntities(entities) {
        this._node.querySelectorAll('.areas > .area-entities > .entity-list')
            .forEach(x => x.textContent = '');

        entities.forEach(
            /** @param {SW25_BasicCombatMapEntity} entity */entity => {
                let entityElement;

                if (entity instanceof SW25_BasicCombatMapCharacter) {
                    entityElement = createCharacterElement(entity, this.#textParser);
                } else {
                    console.warn(`Unexpected entity type: ${entity.type} (name: ${entity.name})`);
                    return;
                }

                this._node.querySelector(`.areas > .area-entities.${entity.position.serialize()} > .entity-list`).appendChild(
                    entityElement
                );
            }
        );

        return true;
    }
}

/**
 * @return {HTMLElement}
 */
function createAreaContainerElement() {
    const container = document.createElement('dl');
    container.classList.add('areas');

    /** @var {Array<{name: string, class: string}>} */
    const areas = [
        {name: "ＰＣ側後方エリア", class: SW25_BasicCombatMapPosition.PcBackward.serialize()},
        {name: "前線エリア", class: SW25_BasicCombatMapPosition.Forward.serialize()},
        {name: "魔物側後方エリア", class: SW25_BasicCombatMapPosition.EnemyBackward.serialize()},
    ];

    for (const area of areas) {
        container.append(...createAreaElement(area.name, area.class));
    }

    return container;
}

/**
 * @param {string} areaName
 * @param {string} klass
 */
function createAreaElement(areaName, klass) {
    const areaNameElement = document.createElement('dt');
    areaNameElement.classList.add('area-name', klass);
    areaNameElement.textContent = areaName;

    const areaEntitiesElement = document.createElement('dd');
    areaEntitiesElement.classList.add('area-entities', klass);

    {
        const areaEntityListElement = document.createElement('ul');
        areaEntityListElement.classList.add('entity-list');
        areaEntitiesElement.append(areaEntityListElement);
    }

    return [areaNameElement, areaEntitiesElement];
}

/**
 * @param {SW25_BasicCombatMapCharacter} character
 * @param {SW2_MapTextParser} textParser
 */
function createCharacterElement(character, textParser) {
    const characterElement = document.createElement('li');
    characterElement.classList.add('entity', 'character');

    if (character.color != null) {
        characterElement.dataset.color = character.color;
    }

    {
        const nameElement = document.createElement('span');
        nameElement.classList.add('name');
        nameElement.innerHTML = textParser.parse(character.name);

        characterElement.appendChild(nameElement);
    }

    return characterElement;
}
