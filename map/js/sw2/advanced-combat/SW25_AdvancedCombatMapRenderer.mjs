import {MapRenderer} from "../../MapRenderer.mjs";
import {SW25_AdvancedCombatMapNil} from "./SW25_AdvancedCombatMapNil.mjs";
import {SW2_MapEntityType} from "../SW2_MapEntityType.mjs";

export class SW25_AdvancedCombatMapRenderer extends MapRenderer {
    /** @type {SW2_MapTextParser} */
    #textParser;

    /**
     * @param {HTMLElement} node
     * @param {SW2_MapTextParser} textParser
     */
    constructor(node, textParser) {
        super(node, {maxFontSize: 16});

        this.#textParser = textParser;
        this._node.classList.add('sw25', 'advanced-combat-map');
    }

    _resize(canvasSize) {
        const totalWeight =
            calcWeightFromMeter(1) * 2 +
            [...this._node.querySelectorAll('.gap')]
                .map(x => parseFloat(x.dataset.widthWeight))
                .reduce((x, y) => x + y, 0);

        this._node.querySelectorAll('.point').forEach(
            pointElement => {
                const nextGapSerial = pointElement.dataset.nextGapSerial;

                const nextGapElement =
                    nextGapSerial != null && nextGapSerial !== ''
                        ? pointElement.parentElement.querySelector(`.gap[data-serial="${nextGapSerial}"]`)
                        : null;

                const nextGapWeight =
                    nextGapElement != null
                        ? parseFloat(nextGapElement.dataset.widthWeight)
                        : calcWeightFromMeter(1);

                pointElement.dataset.nextGapWeight = nextGapWeight.toString();
            }
        );

        this._node.querySelectorAll('.gap, .point').forEach(
            x => x.style.left = `${(parseFloat(x.dataset.horizontalOffset) / totalWeight) * canvasSize}px`
        );

        this._node.querySelectorAll('.gap').forEach(
            x => x.style.width = `${(parseFloat(x.dataset.widthWeight) / totalWeight) * canvasSize}px`
        );

        this._node.querySelectorAll('.point').forEach(
            x => x.style.width = `${(parseFloat(x.dataset.nextGapWeight) / totalWeight) * canvasSize}px`
        );

        this._node.querySelectorAll('.range').forEach(
            x => {
                const offsetOfLeft = parseFloat(x.dataset.horizontalOffsetOfLeft);
                const offsetOfRight = parseFloat(x.dataset.horizontalOffsetOfRight);

                x.style.left = `${(offsetOfLeft / totalWeight) * canvasSize}px`;
                x.style.width = `${((offsetOfRight - offsetOfLeft) / totalWeight) * canvasSize}px`;
            }
        );
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {SW25_AdvancedCombatMapEntityList} entities
     * @return {boolean}
     */
    _updateEntities(entities) {
        this._node.textContent = '';

        const rangeContainerElement = document.createElement('div');
        rangeContainerElement.classList.add('ranges');
        this._node.appendChild(rangeContainerElement);

        /** @var {int} */
        let pointSerial = 0;
        /** @var {int} */
        let lastPosition = 0;
        /** @var {{root: HTMLElement, entityList: HTMLElement}|null} */
        let lastPoint = null;
        let horizontalOffset = calcWeightFromMeter(1);

        /** @var {Object<string, number>} */
        const horizontalOffsetByPositionFromLeftEnd = {'0': horizontalOffset};

        /** @var {HTMLElement[]} */
        const gapElements = [];
        /** @var {HTMLElement[]} */
        const pointElements = [];

        entities.forEach(
            entity => {
                if (lastPoint == null || entity.positionFromLeftEnd > lastPosition) {
                    if (lastPoint != null) {
                        const gap = createGapElement(
                            lastPosition,
                            entity.positionFromLeftEnd - lastPosition,
                            horizontalOffset,
                            entities.findGapName(++pointSerial),
                            this.#textParser
                        );

                        gapElements.push(gap.element);
                        gap.element.dataset.serial = gapElements.length.toString();

                        horizontalOffset += gap.weight;

                        lastPoint.root.dataset.nextGapSerial = gap.element.dataset.serial;
                    }

                    lastPoint = createPointElement(
                        entity.positionFromLeftEnd,
                        horizontalOffset
                    );

                    horizontalOffsetByPositionFromLeftEnd[entity.positionFromLeftEnd.toString()] = horizontalOffset;

                    pointElements.push(lastPoint.root);
                }

                if (!(entity instanceof SW25_AdvancedCombatMapNil)) {
                    lastPoint.entityList.appendChild(
                        createEntityElement(entity, this.#textParser)
                    );
                }

                lastPosition = entity.positionFromLeftEnd;
            },
            [SW2_MapEntityType.nil, SW2_MapEntityType.character]
        );

        this._node.append(...gapElements);
        this._node.append(...pointElements);

        entities.forEach(
            /** @param {SW25_AdvancedCombatMapRange} range */
            range => {
                const leftKey = range.positionFromLeftEnd.toString();
                const rightKey = (range.positionFromLeftEnd + range.size).toString();

                const horizontalOffsetOfLeft = horizontalOffsetByPositionFromLeftEnd[leftKey];
                const horizontalOffsetOfRight = horizontalOffsetByPositionFromLeftEnd[rightKey];

                const element = createRangeElement(
                    range.positionFromLeftEnd,
                    range.size,
                    {
                        left: horizontalOffsetOfLeft,
                        right: horizontalOffsetOfRight
                    },
                    range.name,
                    this.#textParser
                );

                {
                    /** @var {HTMLElement} */
                    const layerElement =
                        rangeContainerElement.querySelector(`[data-layer="${range.layerIndex}"]`) ??
                        ((container, layerIndex) => {
                            const layerElement = document.createElement('div');
                            layerElement.classList.add('layer');
                            layerElement.dataset.layer = layerIndex.toString();

                            container.appendChild(layerElement);

                            return layerElement;
                        })(rangeContainerElement, range.layerIndex);

                    layerElement.appendChild(element);
                }
            },
            SW2_MapEntityType.range
        );

        this.resize();

        return true;
    }
}

/**
 * @param {int} leftFromLeftEnd
 * @param {int} size
 * @param {{left: number, right: number}} horizontalOffsets
 * @param {?string} name
 * @param {SW2_MapTextParser} textParser
 * @return {HTMLElement}
 */
function createRangeElement(
    leftFromLeftEnd,
    size,
    horizontalOffsets,
    name,
    textParser
) {
    const element = document.createElement('div');
    element.classList.add('range');
    element.dataset.gameSize = size.toString();
    element.dataset.horizontalOffsetOfLeft = horizontalOffsets.left.toString();
    element.dataset.horizontalOffsetOfRight = horizontalOffsets.right.toString();

    if (name != null && name !== '') {
        const nameElement = document.createElement('span');
        nameElement.classList.add('name');
        nameElement.innerHTML = textParser.parse(name);

        element.dataset.name = nameElement.textContent;
        element.appendChild(nameElement);
    }

    return element;
}

/**
 * @param {int} leftFromLeftEnd
 * @param {int} size
 * @param {number} horizontalOffset
 * @param {?string} name
 * @param {SW2_MapTextParser} textParser
 * @return {{element: HTMLElement, weight: number}}
 */
function createGapElement(
    leftFromLeftEnd,
    size,
    horizontalOffset,
    name,
    textParser
) {
    const weight = calcWeightFromMeter(size);

    const element = document.createElement('div');
    element.classList.add('gap');
    element.dataset.gameSize = size.toString();
    element.dataset.widthWeight = weight.toString();
    element.dataset.horizontalOffset = horizontalOffset.toString();

    {
        const sizeElement = document.createElement('span');
        sizeElement.classList.add('size');
        sizeElement.textContent = name ?? `${size}m`;

        if (name != null) {
            sizeElement.innerHTML = textParser.parse(name);
            sizeElement.classList.add('named');

            element.dataset.name = sizeElement.textContent;
        } else {
            sizeElement.textContent = `${size}m`;
        }

        element.appendChild(sizeElement);
    }

    return {element, weight};
}

/**
 * @param {int} positionFromLeftEnd
 * @param {number} horizontalOffset
 * @return {{root: HTMLElement, entityList: HTMLElement}}
 */
function createPointElement(positionFromLeftEnd, horizontalOffset) {
    const element = document.createElement('div');
    element.classList.add('point');
    element.dataset.positionFromLeftEnd = positionFromLeftEnd.toString();
    element.dataset.horizontalOffset = horizontalOffset.toString();

    {
        const circle = document.createElement('div');
        circle.classList.add('circle');

        element.appendChild(circle);
    }

    {
        const entityList = document.createElement('ul');
        entityList.classList.add('entity-list');

        element.appendChild(entityList);

        return {root: element, entityList};
    }
}

/**
 * @param {SW25_AdvancedCombatMapEntity} entity
 * @param {SW2_MapTextParser} textParser
 * @return {HTMLElement}
 */
function createEntityElement(entity, textParser) {
    const element = document.createElement('li');
    element.classList.add('entity');

    if (entity.color != null) {
        element.dataset.color = entity.color;
    }

    {
        const nameElement = document.createElement('span');
        nameElement.classList.add('name');
        nameElement.innerHTML = textParser.parse(entity.name);
        nameElement.setAttribute('title', nameElement.textContent);

        element.appendChild(nameElement);
    }

    return element;
}

/**
 * @param {int} meter
 * @return {number}
 */
function calcWeightFromMeter(meter) {
    return Math.log(Math.max(meter, 2)) / Math.log(1.1);
}
