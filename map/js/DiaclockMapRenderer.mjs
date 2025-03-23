import {MapRenderer} from "./MapRenderer.mjs";
import {DiaclockSystemEntityList} from "./DiaclockSystemEntityList.mjs";

export class DiaclockMapRenderer extends MapRenderer {
    /** @var {int} */
    #cellCountInCircle;

    /** @var {int} */
    #circleCount;

    #lastEntities = new DiaclockSystemEntityList();

    /**
     * @param {HTMLElement} node
     * @param {int} cellCountInCircle
     * @param {int} circleCount
     */
    constructor(node, cellCountInCircle, circleCount) {
        super(node);

        this.#cellCountInCircle = cellCountInCircle;
        this.#circleCount = circleCount;

        this._node.classList.add('diaclock-map');
        this._node.dataset.cellCountInCircle = this.#cellCountInCircle.toString();

        function createCellNode() {
            const outerRoot = document.createElement('div');
            outerRoot.classList.add('cell-outer-root');

            {
                const cellFiller = document.createElement('div');
                cellFiller.classList.add('filler');
                outerRoot.appendChild(cellFiller);
            }

            {
                const cellContent = document.createElement('div');
                cellContent.classList.add('content');
                outerRoot.appendChild(cellContent);

                {
                    const entities = document.createElement('div');
                    entities.classList.add('entities');
                    cellContent.appendChild(entities);

                    {
                        const text = document.createElement('div');
                        text.classList.add('text');
                        entities.appendChild(text);
                    }
                }
            }

            return outerRoot;
        }

        const circleNames = (circleCount => {
            switch (circleCount) {
                case 1:
                    return [''];
                case 2:
                    return ['out', 'in'];
                default:
                    throw new Error(`Unexpected circle count: ${circleCount}`);
            }
        })(this.#circleCount);

        for (const circleName of circleNames) {
            for (let cellIndexInCircle = 1; cellIndexInCircle <= this.#cellCountInCircle; cellIndexInCircle += 1) {
                const cellNode = createCellNode();

                cellNode.dataset.cellIndexInCircle = cellIndexInCircle.toString();

                if (circleName !== '') {
                    cellNode.dataset.circleName = circleName;
                }

                cellNode.dataset.cellId =
                    circleName !== ''
                        ? `${circleName}-${cellIndexInCircle}`
                        : cellIndexInCircle.toString();

                this._node.appendChild(cellNode);
            }
        }

        {
            const centerCell = createCellNode();
            centerCell.classList.add('center');
            centerCell.dataset.cellId = 'center';
            this._node.appendChild(centerCell);
        }

        this.resize();
    }

    _resize(canvasSize) {
        const circleSize = canvasSize * 0.8;

        this._node.querySelectorAll('.cell-outer-root').forEach(
            cell => {
                const circleWidth = (circleSize * 0.3) * ((4 / this.#circleCount) / 4);

                {
                    const filler = cell.querySelector('.filler');

                    if (!cell.classList.contains('center')) {
                        switch (cell.dataset.circleName ?? '') {
                            case '':
                            case 'out':
                                filler.style.width = `${circleSize}px`;
                                filler.style.height = `${circleSize}px`;
                                filler.style.top = `${(canvasSize - circleSize) / 2}px`;
                                filler.style.left = `${(canvasSize - circleSize) / 2}px`;
                                break;
                            case 'in':
                                filler.style.width = `${circleSize * 0.7}px`;
                                filler.style.height = `${circleSize * 0.7}px`;
                                filler.style.top = `${(canvasSize - circleSize * 0.7) / 2}px`;
                                filler.style.left = `${(canvasSize - circleSize * 0.7) / 2}px`;
                                break;
                        }

                        filler.style.borderWidth = `${circleWidth}px`;
                    } else {
                        filler.style.width = `${canvasSize * 0.3}px`;
                        filler.style.height = `${canvasSize * 0.3}px`;
                    }
                }

                {
                    const content = cell.querySelector('.content');

                    if (!cell.classList.contains('center')) {
                        switch (cell.dataset.circleName ?? '') {
                            case '':
                                content.style.top = `-${circleWidth + circleSize * 0.1}px`;
                                break;
                            case 'in':
                                content.style.top = `-${circleWidth + circleSize * 0.075}px`;
                                break;
                            case 'out':
                                content.style.top = `-${circleWidth * 2 + circleSize * 0.17}px`;
                                break;
                        }
                    } else {
                        content.style.width = `${canvasSize * 0.3}px`;
                        content.style.height = `${canvasSize * 0.3}px`;
                    }
                }
            }
        );
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {DiaclockSystemEntityList} entities
     */
    _updateEntities(entities) {
        if (this.#lastEntities.toJson() === entities.toJson()) {
            return false;
        }

        this._node.querySelectorAll('.cell-outer-root .content .entities .text').forEach(
            node => {
                node.textContent = '';
            }
        );

        entities.forEach(
            entity => {
                if (entity.position.toCellId() === '') {
                    return;
                }

                const cellNode = this._node.querySelector(`[data-cell-id="${entity.position.toCellId()}"]`);

                if (cellNode == null) {
                    console.warn(`Cell '${entity.position.toCellId()}' is not found.`);
                    return;
                }

                const container = cellNode.querySelector('.content .entities .text');

                const entityNameNode = document.createElement('span');
                entityNameNode.classList.add('entity-name');
                entityNameNode.textContent = entity.name;
                entityNameNode.dataset.entityId = entity.id;

                this._setupEntityElement(entityNameNode, entity);

                container.appendChild(entityNameNode);
            }
        );

        this.#lastEntities = entities;

        return true;
    }

    /**
     * @protected
     * @param {HTMLElement} entityElement
     * @param {DiaclockSystemEntity} entity
     */
    _setupEntityElement(entityElement, entity) {
    }
}
