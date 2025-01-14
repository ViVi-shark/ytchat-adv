import {MapEntityList} from "./MapEntityList.mjs";

/**
 * @abstract
 */
export class MapBase {
    /** @var {MapEntityList|null} */
    #entities = null;

    /** @var {MapRenderer[]} */
    #renderers = [];

    /** @var {MapEntityListParser} */
    #entityListParser;

    /** @var {string[]} */
    #additionalClassNames = [];

    /**
     * @param {MapEntityListParser} entityListParser
     */
    constructor(entityListParser) {
        this.#entityListParser = entityListParser;
    }

    /**
     * @final
     * @return {MapEntityListParser}
     */
    get entityListParser() {
        return this.#entityListParser;
    }

    /**
     * @final
     * @param {MapEntityList} entities
     */
    setEntities(entities) {
        this.#entities = entities;

        this.#renderers.forEach(x => x.updateEntities(this.#entities));
    }

    /**
     * @final
     * @param {HTMLElement} node
     * @return {MapRenderer}
     */
    renderTo(node) {
        const renderer = this._instantiateRenderer(node);

        for (const className of this.#additionalClassNames) {
            renderer.addClass(className);
        }

        if (this.#entities != null) {
            renderer.updateEntities(this.#entities);
        }

        this.#renderers.push(renderer);

        return renderer;
    }

    /**
     * @protected
     * @abstract
     * @param {HTMLElement} node
     * @return {MapRenderer}
     */
    _instantiateRenderer(node) {
    }

    /**
     * @protected
     * @final
     * @param {string} className
     */
    _addClassToRenderer(className) {
        for (const renderer of this.#renderers) {
            renderer.addClass(className);
        }

        this.#additionalClassNames.push(className);
    }
}
