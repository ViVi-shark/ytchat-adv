/**
 * @param {string} sourceJson
 * @return {?HTMLDivElement}
 */
function createDataStructureNodeByJson(sourceJson) {
    /**
     * @param {string} source
     * @return {string}
     */
    function resolveLinefeed(source) {
        return source.replaceAll(/(&#92;r&#92;n|&#92;r|&#92;n)/g, '\n')
            .split('\n')
            .map(x => x.trim() !== '' ? `<div class="paragraph">${x}</div>` : '<hr class="space" />')
            .join('');
    }

    /**
     * @param json
     * @return {*|null}
     */
    function parseJson(json) {
        try {
            return JSON.parse(json.replaceAll(/<span class="dash">(―+)<\/span>/ig, '$1') /* この置換は暫定措置 */);
        } catch (e) {
            console.error(e.message);
            console.error(json);
            return null;
        }
    }

    const source = parseJson(sourceJson);

    if (source == null) {
        return null;
    }

    const containerNode = document.createElement('div');
    containerNode.classList.add('data-structure');

    if (source['game'] != null) {
        containerNode.dataset.game = source['game'].toString();
    }

    if (source['mode'] != null) {
        containerNode.dataset.mode = source['mode'].toString();
    }

    if (source['title'] != null) {
        const titleNode = document.createElement('span');
        titleNode.classList.add('title');
        titleNode.innerHTML = resolveLinefeed(source['title'].toString());
        containerNode.appendChild(titleNode);
    }

    /**
     * @param {{label: string, value: string|Array}[]} source
     * @return {HTMLDListElement}
     */
    function createDescriptionList(source) {
        const dl = document.createElement('dl');

        for (const content of source) {
            const dt = document.createElement('dt');
            dt.innerHTML = resolveLinefeed(content.label?.toString() ?? '');
            dt.dataset.content = content.label?.toString() ?? '';

            const dd = document.createElement('dd');
            dd.dataset.relatedTerm = dt.dataset.content;

            if (content.value instanceof Array) {
                const childList = createDescriptionList(content.value);
                dd.appendChild(childList);
            } else {
                dd.innerHTML = resolveLinefeed(content.value?.toString() ?? '');
            }

            dl.appendChild(dt);
            dl.appendChild(dd);
        }

        return dl;
    }

    if (source['contents'] instanceof Array) {
        const dl = createDescriptionList(source['contents']);
        containerNode.appendChild(dl);
    } else if (typeof source['contents'] === 'string') {
        const div = document.createElement('div');
        div.innerHTML = resolveLinefeed(source['contents']);
        containerNode.appendChild(div);
    }

    return containerNode;
}

{
    document.querySelectorAll('#contents > .logs .data-structure-source').forEach(
        sourceNode => {
            const urlEncoded = sourceNode.textContent;
            const json = decodeURIComponent(urlEncoded);

            const node = createDataStructureNodeByJson(json);

            if (node != null) {
                sourceNode.after(node);
            }

            sourceNode.remove();
        }
    );
}
