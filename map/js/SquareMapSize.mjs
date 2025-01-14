export class SquareMapSize {
    /** @var {int} */
    #width;

    /** @var {int} */
    #height;

    /**
     * @param {int} width
     * @param {int} height
     */
    constructor(width, height) {
        this.#width = width;
        this.#height = height;
    }

    /**
     * @return {int}
     */
    get width() {
        return this.#width;
    }

    /**
     * @return {int}
     */
    get height() {
        return this.#height;
    }
}
