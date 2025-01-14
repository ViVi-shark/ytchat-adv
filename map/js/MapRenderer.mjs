/**
 * @abstract
 */
export class MapRenderer {
    /** @var {HTMLElement} */
    #node;

    #animationDisposerHandle = null;

    /**
     * @param {HTMLElement} node
     */
    constructor(node) {
        this.#node = node;

        this.#node.classList.add('map');

        this.#node.addEventListener(
            MapResizeEvent.type,
            () => this.resize()
        );

        this.resize();
    }

    /**
     * @return {HTMLElement}
     * @protected
     * @final
     */
    get _node() {
        return this.#node;
    }

    /**
     * @final
     */
    resize() {
        const canvasSize = this.#node.clientWidth;

        this.#node.dataset.canvasSize = canvasSize.toString();
        this.#node.style.fontSize = `${Math.round(canvasSize * 0.025)}px`;

        this._resize(canvasSize);
    }

    /**
     * @protected
     * @abstract
     * @param {number} canvasSize
     */
    _resize(canvasSize) {
    }

    /**
     * @final
     * @param {string} className
     */
    addClass(className) {
        this._node.classList.add(className);
    }

    /**
     * @final
     * @param {MapEntityList} entities
     */
    updateEntities(entities) {
        if (this._updateEntities(entities)) {
            if (this.#animationDisposerHandle != null) {
                clearTimeout(this.#animationDisposerHandle);
                this.#animationDisposerHandle = null;
            }

            const classForAnimation = 'animation-updated';

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
    }

    /**
     * @protected
     * @abstract
     * @param {MapEntityList} entities
     * @return {boolean}
     */
    _updateEntities(entities) {
    }
}
