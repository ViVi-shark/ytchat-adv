import {MapRenderer} from "./MapRenderer.mjs";
import {SquareMapPosition} from "./positions/SquareMapPosition.mjs";

export class SquareMapRenderer extends MapRenderer {
    /** @var {SquareMapSize} */
    #mapSize;

    /** @var {HTMLElement} */
    #rootElement;

    /**
     * @param {SquareMapSize} mapSize
     * @param {HTMLElement} node
     */
    constructor(mapSize, node) {
        super(node);

        this.#mapSize = mapSize;

        const squareMapRoot = document.createElement('div');
        squareMapRoot.classList.add('square-map-root');
        this.#rootElement = squareMapRoot;

        const gridTemplateColumns = [];
        const gridTemplateRows = [];

        /**
         * @param {string[]} additionalClassNames
         * @param {string} label
         * @return {HTMLElement}
         */
        function createHeaderCellElement(additionalClassNames, label) {
            const element = document.createElement('div');
            element.classList.add('cell', 'header', ...additionalClassNames);
            element.textContent = label;
            return element;
        }

        /**
         * @param {string} horizontalPosition
         * @param {int} verticalPosition
         * @return {HTMLElement}
         */
        function createBodyCellElement(horizontalPosition, verticalPosition) {
            const element = document.createElement('div');
            element.classList.add('cell', 'body');
            element.dataset.h = horizontalPosition;
            element.dataset.v = verticalPosition.toString();

            const backgroundFilterElement = document.createElement('ul');
            backgroundFilterElement.classList.add('filters', 'background-filters');
            element.appendChild(backgroundFilterElement);

            const entityListElement = document.createElement('ul');
            entityListElement.classList.add('entity-list');
            element.appendChild(entityListElement);

            const foregroundFilterElement = document.createElement('ul');
            foregroundFilterElement.classList.add('filters', 'foreground-filters');
            element.appendChild(foregroundFilterElement);

            return element;
        }

        /**
         * @param {'horizontal'|'vertical'|'cross'} mode
         * @return {HTMLElement}
         */
        function createGapElement(mode) {
            const element = document.createElement('div');
            element.classList.add('gap');
            element.dataset.gapMode = mode;
            return element;
        }

        // header row
        {
            squareMapRoot.append(createHeaderCellElement(['vertical', 'horizontal'], ''));
            squareMapRoot.append(createGapElement('horizontal'));

            gridTemplateColumns.push('max-content', 'max-content');

            for (let x = 1; x <= this.#mapSize.width; x++) {
                squareMapRoot.append(createHeaderCellElement(['vertical'], SquareMapPosition.intToCharacter(x)));
                squareMapRoot.append(createGapElement('horizontal'));

                gridTemplateColumns.push('1fr', 'max-content');
            }

            gridTemplateRows.push('max-content');
        }

        // gap after header row
        {
            squareMapRoot.append(
                createGapElement('vertical'),
                createGapElement('cross')
            );

            for (let x = 1; x <= this.#mapSize.width; x++) {
                squareMapRoot.append(
                    createGapElement('vertical'),
                    createGapElement('cross')
                );
            }

            gridTemplateRows.push('max-content');
        }

        for (let y = 1; y <= this.#mapSize.height; y++) {
            squareMapRoot.append(createHeaderCellElement(['horizontal'], y.toString()));
            squareMapRoot.append(createGapElement('horizontal'));

            for (let x = 1; x <= this.#mapSize.width; x++) {
                squareMapRoot.append(createBodyCellElement(SquareMapPosition.intToCharacter(x), y));
                squareMapRoot.append(createGapElement('horizontal'));
            }

            gridTemplateRows.push('1fr');

            // gap header row
            {
                squareMapRoot.append(
                    createGapElement('vertical'),
                    createGapElement('cross')
                );

                for (let x = 1; x <= this.#mapSize.width; x++) {
                    squareMapRoot.append(
                        createGapElement('vertical'),
                        createGapElement('cross')
                    );
                }
            }

            gridTemplateRows.push('max-content');
        }

        squareMapRoot.style.gridTemplateRows = gridTemplateRows.join(' ');
        squareMapRoot.style.gridTemplateColumns = gridTemplateColumns.join(' ');

        this._node.append(squareMapRoot);
    }

    _resize(canvasSize) {
    }

    get mapSize() {
        return this.#mapSize;
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {SquareMapEntityList} entities
     * @return {boolean}
     */
    _updateEntities(entities) {
        this.#rootElement.querySelectorAll('.cell.body > :is(.entity-list, .filters)')
            .forEach(x => x.innerHTML = '');

        entities.forEach(
            /** @param {SquareMapEntity} entity */entity => {
                if (entity.hasName) {
                    const cell = this._findCellElement(entity.position);

                    if (cell == null) {
                        console.warn(`Cell [${entity.position.horizontal}, ${entity.position.vertical}] is not found.`);
                        return;
                    }

                    cell.querySelector('.entity-list').appendChild(
                        this._createEntityNameplateElement(entity)
                    );
                }
            }
        );

        return true;
    }

    /**
     * @protected
     * @final
     * @param {SquareMapPosition} position
     * @return {?HTMLElement}
     */
    _findCellElement(position) {
        return this.#rootElement.querySelector(`[data-h="${position.horizontal}"][data-v="${position.vertical}"]`);
    }

    /**
     * @protected
     * @param {SquareMapEntity} entity
     * @return {HTMLElement}
     */
    _createEntityNameplateElement(entity) {
        const li = document.createElement('li');
        li.classList.add('nameplate');
        li.textContent = entity.name;

        return li;
    }
}
