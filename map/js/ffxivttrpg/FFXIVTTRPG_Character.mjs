import {FFXIVTTRPG_Entity} from "./FFXIVTTRPG_Entity.mjs";

export class FFXIVTTRPG_Character extends FFXIVTTRPG_Entity {
    /** @var {?string} */
    #role;

    /**
     * @param {string} name
     * @param {SquareMapPosition} position
     * @param {?string} role
     */
    constructor(name, position, role = null) {
        super(name, position);
        this.#role = role;
    }

    /**
     * @return {?string}
     */
    get role() {
        return this.#role ?? null;
    }

    serialize() {
        const o = super.serialize();

        if (this.role != null) {
            o.role = this.role;
        }

        return o;
    }
}
