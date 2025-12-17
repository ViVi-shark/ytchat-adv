/**
 * @typedef MapRendererOptions
 * @property {int} [maxFontSize]
 */

/**
 * @abstract
 */
export class MapRenderer {
    /** @var {MapRendererOptions} */
    #options = {};

    /** @var {HTMLElement} */
    #node;

    #animationDisposerHandle = null;

    /**
     * @param {HTMLElement} node
     * @param {MapRendererOptions|null} options
     */
    constructor(node, options = null) {
        this.#node = node;

        if (options != null) {
            Object.assign(this.#options, options);
        }

        this.#node.classList.add('map');

        this.#node.addEventListener(
            MapResizeEvent.type,
            () => this.resize()
        );

        setTimeout(() => this.resize(), 0);
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

        {
            const fontSize = Math.round(canvasSize * 0.025);
            this.#node.style.fontSize = `${this.#options.maxFontSize != null ? Math.min(this.#options.maxFontSize, fontSize) : fontSize}px`;
        }

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
            this.#doAnimation();
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

    /**
     * @final
     */
    refresh() {
        if (this._refresh()) {
            this.#doAnimation();
        }
    }

    /**
     * @protected
     * @return {boolean}
     */
    _refresh() {
        return false;
    }

    #doAnimation() {
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
