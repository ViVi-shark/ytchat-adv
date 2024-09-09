import {DiaclockSystemPositionParser} from "./positions/DiaclockSystemPositionParser.mjs";
import {DiaclockSystemEntityListParser} from "./DiaclockSystemEntityListParser.mjs";
import {DiaclockMapPosition} from "./positions/diaclock_map_position.mjs";
import {DiaclockMapQuoterPosition} from "./positions/diaclock_map_quoter_position.mjs";
import {DiaclockSystemEntityList} from "./DiaclockSystemEntityList.mjs";

export class DiaclockMapCore {
    /** @var {int} */
    #cellCountInCircle;

    /** @var {int} */
    #circleCount;

    #entities = new DiaclockSystemEntityList();

    /** @var {DiaclockMapRendererInternal[]} */
    #renderers = [];

    /** @var {DiaclockSystemEntityListParser} */
    #entityListParser;

    /** @var {string[]} */
    #additionalClassNames = [];

    /**
     * @param {int} cellCountInCircle
     * @param {int} circleCount
     * @param {DiaclockSystemPositionParser} positionParser
     */
    constructor(
        cellCountInCircle,
        circleCount,
        positionParser
    ) {
        this.#cellCountInCircle = cellCountInCircle;
        this.#circleCount = circleCount;
        this.#entityListParser = new DiaclockSystemEntityListParser(positionParser);
    }

    /**
     * @return {DiaclockSystemEntityListParser}
     */
    get entityListParser() {
        return this.#entityListParser;
    }

    /**
     * @param {DiaclockSystemEntityList} entities
     */
    setEntities(entities) {
        this.#entities = entities;

        this.#renderers.forEach(x => x.updateEntities(this.#entities));
    }

    /**
     * @param {HTMLElement} node
     * @return {DiaclockMapRenderer}
     */
    renderTo(node) {
        const renderer = new DiaclockMapRendererInternal(node, this.#cellCountInCircle, this.#circleCount);

        for (const className of this.#additionalClassNames) {
            renderer.addClass(className);
        }
        renderer.updateEntities(this.#entities);
        this.#renderers.push(renderer);

        return renderer;
    }

    /**
     * @param {string} className
     * @protected
     */
    _addClassToRenderer(className) {
        for (const renderer of this.#renderers) {
            renderer.addClass(className);
        }

        this.#additionalClassNames.push(className);
    }

    /**
     * @protected
     */
    _hideCenter() {
        this._addClassToRenderer('hide-center');
    }
}

class DiaclockMapRenderer {
    /** @var {HTMLElement} */
    #node;

    /** @var {int} */
    #cellCountInCircle;

    /** @var {int} */
    #circleCount;

    /**
     * @param {HTMLElement} node
     * @param {int} cellCountInCircle
     * @param {int} circleCount
     */
    constructor(node, cellCountInCircle, circleCount) {
        this.#node = node;
        this.#cellCountInCircle = cellCountInCircle;
        this.#circleCount = circleCount;

        this.#node.classList.add('diaclock-map');
        this.#node.dataset.cellCountInCircle = this.#cellCountInCircle.toString();

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

                this.#node.appendChild(cellNode);
            }
        }

        {
            const centerCell = createCellNode();
            centerCell.classList.add('center');
            centerCell.dataset.cellId = 'center';
            this.#node.appendChild(centerCell);
        }

        this.#node.addEventListener(
            MapResizeEvent.type,
            () => this.resize()
        );

        this.resize();
    }

    /**
     * @return {HTMLElement}
     * @protected
     */
    get _node() {
        return this.#node;
    }

    resize() {
        const canvasSize = this.#node.clientWidth;
        const circleSize = canvasSize * 0.8;

        this.#node.dataset.canvasSize = canvasSize.toString();
        this.#node.style.fontSize = `${Math.round(canvasSize * 0.025)}px`;

        this.#node.querySelectorAll('.cell-outer-root').forEach(
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
}

const classForAnimation = 'animation-updated';

class DiaclockMapRendererInternal extends DiaclockMapRenderer {
    #lastEntities = new DiaclockSystemEntityList();

    #animationDisposerHandle = null;

    /**
     * @param {DiaclockSystemEntityList} entities
     */
    updateEntities(entities) {
        if (this.#lastEntities.toJson() === entities.toJson()) {
            return;
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

                container.appendChild(entityNameNode);
            }
        );

        {
            if (this.#animationDisposerHandle != null) {
                clearTimeout(this.#animationDisposerHandle);
                this.#animationDisposerHandle = null;
            }

            this._node.classList.remove(classForAnimation);

            this.#animationDisposerHandle = setTimeout(
                () => {
                    if (this.#animationDisposerHandle != null) {
                        clearTimeout(this.#animationDisposerHandle);
                        this.#animationDisposerHandle = null;
                    }

                    this._node.classList.add(classForAnimation);

                    this.#animationDisposerHandle = setTimeout(
                        () => this._node.classList.remove(classForAnimation),
                        1000
                    );
                },
                1
            );
        }

        this.#lastEntities = entities;
    }

    /**
     * @param {string} className
     */
    addClass(className) {
        this._node.classList.add(className);
    }
}

export class DiaclockMap extends DiaclockMapCore {
    constructor() {
        super(12, 2, DiaclockMapPosition.parser);
    }
}

export class DiaclockMapQuoter extends DiaclockMapCore {
    constructor() {
        super(6, 1, DiaclockMapQuoterPosition.parser);
    }
}
