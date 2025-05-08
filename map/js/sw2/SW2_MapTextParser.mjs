export class SW2_MapTextParser {
    /**
     * @param {string} source
     * @return {string}
     */
    parse(source) {
        const dummy = document.createElement('span');
        dummy.textContent = source;
        return dummy.innerHTML;
    }
}
