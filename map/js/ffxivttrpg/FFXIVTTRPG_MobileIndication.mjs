import {FFXIVTTRPG_Indication} from "./FFXIVTTRPG_Indication.mjs";

export class FFXIVTTRPG_MobileIndication extends FFXIVTTRPG_Indication {
    /** @var {FFXIVTTRPG_Locator} */
    #locator;

    /** @var {OriginatedRangeBuilder} */
    #rangeBuilder;

    /**
     * @param {FFXIVTTRPG_Locator} locator
     * @param {OriginatedRangeBuilder} rangeBuilder
     */
    constructor(locator, rangeBuilder) {
        super(locator.position);
        this.#locator = locator;
        this.#rangeBuilder = rangeBuilder;
    }

    /**
     * @return {string}
     */
    get locatorName() {
        return this.#locator.name;
    }

    /**
     * @return {OriginatedRange}
     */
    get range() {
        return this.#rangeBuilder.build(this.#locator);
    }
}
