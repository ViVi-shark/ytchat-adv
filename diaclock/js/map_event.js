class MapUpdateEvent extends Event {
    /** @var {string} */
    #encodedMapSourceText;

    /**
     * @return {string}
     */
    static get type() {
        return 'map-update';
    }

    /**
     * @param {string} encodedMapSourceText
     */
    constructor(encodedMapSourceText) {
        super(MapUpdateEvent.type);

        this.#encodedMapSourceText = encodedMapSourceText;
    }

    get encodedMapSourceText() {
        return this.#encodedMapSourceText;
    }
}

/**
 * @param {string} text
 * @return {string}
 */
function encodeMapSourceText(text) {
    return btoa(encodeURIComponent(text));
}

/**
 * @param {string} encoded
 * @return {string}
 */
function decodeMapSourceText(encoded) {
    if (encoded === '') {
        return '';
    }

    let binary;

    try {
        binary = atob(encoded);
    } catch {
        console.warn(`Invalid map source: ${encoded}`);
        return '';
    }

    return decodeURIComponent(binary);
}

class MapResizeEvent extends Event {
    /**
     * @return {string}
     */
    static get type() {
        return 'map-resize';
    }

    constructor() {
        super(MapResizeEvent.type);
    }
}
