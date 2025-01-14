import {MapPosition} from "./MapPosition.mjs";

export class SquareMapPosition extends MapPosition {
    /**
     * @return {SquareMapPosition}
     */
    static get invalid() {
        return invalid;
    }

    /** @var {string} */
    #horizontal;

    /** @var {int} */
    #vertical;

    /**
     * @param {string} horizontal
     * @param {int} vertical
     */
    constructor(horizontal, vertical) {
        super();

        this.#horizontal = horizontal;
        this.#vertical = vertical;
    }

    /**
     * @return {string}
     */
    get horizontal() {
        return this.#horizontal;
    }

    /**
     * @return {int}
     */
    get horizontalInt() {
        return SquareMapPosition.characterToInt(this.#horizontal);
    }

    /**
     * @return {int}
     */
    get vertical() {
        return this.#vertical;
    }

    serialize() {
        return `${this.horizontal}${this.vertical}`;
    }

    /**
     * @param {int} source
     * @return {string}
     */
    static intToCharacter(source) {
        if (source <= 0) {
            throw new Error(`Invalid source value: ${source}`);
        }

        const chars = [];
        let value = source - 1;

        do {
            const offset = (value % 26);
            const c = String.fromCharCode('A'.charCodeAt(0) + offset);

            chars.unshift(c);

            value = Math.floor(value / 26);
        } while (value > 0);

        return chars.join('');
    }

    /**
     * @param {string} source
     * @return {int}
     */
    static characterToInt(source) {
        if (source === '') {
            throw new Error("Cannot parse empty string.");
        }

        let value = 0;

        const a_code = 'A'.charCodeAt(0);
        const z_code = 'Z'.charCodeAt(0);

        for (let i = 0; i < source.length; i++) {
            const code = source.substring(i, i + 1).toUpperCase().charCodeAt(0);

            if (code < a_code || code > z_code) {
                throw new Error(`Invalid character: ${source.substring(i, i + 1)}`);
            }

            const offset = code - a_code;
            const v = offset + 1;

            value *= 26;
            value += v;
        }

        return value;
    }

    toString() {
        return `${this.horizontal}${this.vertical}`;
    }
}



class SquareMapPosition_Invalid extends SquareMapPosition {
    constructor() {
        super('-', 0);
    }
}

const invalid = new SquareMapPosition_Invalid();
