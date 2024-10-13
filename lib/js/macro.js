function makeStorageKeyByMacroId(macroId) {
    return `ytchat-macro-${macroId}`;
}

/**
 * @param {string} json
 * @return {Object.<string, string|number>}
 */
function deserializeMacro(json) {
    return json != null && json !== '' ? JSON.parse(json) : {};
}

/**
 * @param {string} macroId
 * @param {Object.<string, string|number>} macro
 */
function saveMacroWithId(macroId, macro) {
    saveMacroJsonWithId(macroId, JSON.stringify(macro ?? {}));
}

/**
 * @param {string} macroId
 * @param {string} macroJson
 */
function saveMacroJsonWithId(macroId, macroJson) {
    localStorage.setItem(makeStorageKeyByMacroId(macroId), macroJson);
}

/**
 * @param {string} macroId
 * @return {Object.<string, string|number>}
 */
function loadMacroById(macroId) {
    const json = localStorage.getItem(makeStorageKeyByMacroId(macroId));
    return deserializeMacro(json);
}

/**
 * @param {string} content
 * @param {string} fileNameWithExtension
 */
function exportMacro(content, fileNameWithExtension) {
    const contentUrl = URL.createObjectURL(new Blob([content], {type: 'application/json'}));
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.download = fileNameWithExtension;
    a.href = contentUrl;
    a.click();
    a.remove();
    URL.revokeObjectURL(contentUrl);
}

const macroWaitCandidates = [
    0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
    1.0, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
    2.0, 2.2, 2.4, 2.6, 2.8,
    3.0, 3.2, 3.4, 3.6, 3.8,
    4.0, 4.2, 4.4, 4.6, 4.8,
    5.0, 5.2, 5.4, 5.6, 5.8,
    6.0, 6.2, 6.4, 6.6, 6.8,
    7.0, 7.2, 7.4, 7.6, 7.8,
    8.0,
];

/**
 * @param {Object.<string, string|number>} macro
 * @param {HTMLDivElement} window
 */
function applyMacroToWindow(macro, window) {
    for (const [key, value] of Object.entries(macro)) {
        const node = window.querySelector(`[name="${key}"]`);

        if (node == null) {
            continue;
        }

        if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
            node.value = value;
        } else if (node instanceof HTMLSelectElement) {
            const index = macroWaitCandidates.indexOf(value);
            node.selectedIndex = Math.max(index, 0);
        }
    }
}

function editMacro(macroId) {
    const nodeId = `macro-edit-window-${macroId}`;

    if (document.getElementById(nodeId) == null) {
        /**
         * @param {HTMLDivElement} window
         * @return {string}
         */
        function serializeMacroFromWindow(window) {
            const data = {};

            window.querySelectorAll('.macro-name input, .command textarea').forEach(
                node => data[node.getAttribute('name')] = node.value
            );

            window.querySelectorAll('.after-wait select').forEach(
                /** @param {HTMLSelectElement} node */node => {
                    data[node.getAttribute('name')] = macroWaitCandidates[node.selectedIndex] ?? 0;
                }
            );

            return JSON.stringify(data);
        }

        function saveMacro() {
            const window = document.getElementById(nodeId);
            saveMacroJsonWithId(macroId, serializeMacroFromWindow(window));
        }

        const window = document.createElement('div');
        window.classList.add('float-box', 'macro-edit-window');
        window.setAttribute('id', `macro-edit-window-${macroId}`)
        window.innerHTML = `
          <h2 data-macro-id="${macroId}">マクロ</h2>
          <label class="macro-name">
            <span class="headline">マクロ名</span>
            <input type="text" name="macro-name" />
          </label>
          <div class="macro-contents-area">
            <span class="headline">内容</span>
            <ol class="macro-contents">
            </ol>
          </div>
          <div class="meta-commands">
            <label class="import">
              <span class="button import material-symbols-outlined">upload</span>
              <input type="file" accept=".ytchat-adv-macro" class="import-file" />
            </label>
            <button class="export material-symbols-outlined">download</button>
            <button class="play material-symbols-outlined">play_arrow</button>
          </div>
          <span class="close button" onclick="boxClose('${nodeId}');">×</span>
        `;

        const macroContentsNode = window.querySelector('.macro-contents');

        for (let i = 1; i <= 30; i++) {
            const macroRowNode = document.createElement('li');
            macroRowNode.dataset.index = i.toString();
            macroRowNode.innerHTML = `
              <label class="command">
                <textarea placeholder="コマンド" name="macro-row-${i}-command"></textarea>
              </label>
              <label class="after-wait">
                <select name="macro-row-${i}-wait"></select>
              </label>
            `;

            {
                const commandTextArea = macroRowNode.querySelector('.command textarea')
                commandTextArea.addEventListener('change', () => saveMacro());
                commandTextArea.addEventListener('input', () => saveMacro());
            }

            {
                function formatTime(value) {
                    if (value === 0) {
                        return 'ウェイトなし';
                    }

                    let text = value.toString();
                    if (/^\d+$/.test(text)) {
                        text += '.0';
                    }

                    return text + 's';
                }

                /** @var {HTMLSelectElement} */
                const waitSelector = macroRowNode.querySelector('.after-wait select');
                for (const waitCandidate of macroWaitCandidates) {
                    const option = document.createElement('option');
                    option.setAttribute('value', waitCandidate.toString());
                    option.textContent = formatTime(waitCandidate);
                    waitSelector.appendChild(option);
                }

                waitSelector.addEventListener('change', () => saveMacro());
            }

            macroContentsNode.appendChild(macroRowNode);
        }

        {
            const nameInput = window.querySelector('.macro-name input');
            const listener = () => {
                document.querySelector(`[data-macro-id="${macroId}"] .macro-name`).textContent = nameInput.value;
                saveMacro();
            };
            nameInput.addEventListener('change', listener);
            nameInput.addEventListener('input', listener);
        }

        {
            const importFileSelector = window.querySelector('.import input[type="file"]');
            importFileSelector.addEventListener(
                'change',
                () => {
                    const file = importFileSelector.files[0];
                    if (file == null) {
                        return;
                    }

                    file.text().then(
                        text => {
                            applyMacroToWindow(deserializeMacro(text), window);
                            saveMacro();
                        }
                    );
                }
            );
        }

        {
            const buttonToExport = window.querySelector('button.export');
            buttonToExport.addEventListener(
                'click',
                () => {
                    const macroName = window.querySelector('.macro-name input').value;
                    const json = serializeMacroFromWindow(window);

                    exportMacro(json, `${macroName}.ytchat-adv-macro`);
                }
            );
        }

        {
            const buttonToPlay = window.querySelector('button.play');
            buttonToPlay.addEventListener(
                'click',
                () => playMacro(macroId)
            );
        }

        applyMacroToWindow(loadMacroById(macroId), window);

        document.querySelector('body').appendChild(window);
        makeDraggable(window.querySelector('h2'));
    }

    {
        const window = document.getElementById(nodeId);

        if (!window.classList.contains('open')) {
            boxOpen(nodeId);
        }
    }
}

async function playMacro(macroId) {
    async function wait(milliseconds) {
        await new Promise(resolver => setTimeout(resolver, milliseconds));
    }

    /**
     * @param {string} command
     * @return {Promise<boolean>}
     */
    async function sendCommand(command) {
        const temporaryNodeId = `macro-command-${(new Date()).getTime()}-${Math.floor(Math.random() * 1000000)}`;
        const temporaryNode = document.createElement('textarea');
        temporaryNode.setAttribute('id', temporaryNodeId);
        temporaryNode.style.display = 'none';
        temporaryNode.value = command;

        document.querySelector('body').append(temporaryNode);

        try {
            await formSubmit(temporaryNodeId);
        } catch {
            console.error('macro execution failed');
            return false;
        }

        temporaryNode.remove();
        return true;
    }

    const macro = loadMacroById(macroId);

    for (let rowIndex = 1; rowIndex <= 30; rowIndex++) {
        const command = macro[`macro-row-${rowIndex}-command`];
        const waitSeconds = macro[`macro-row-${rowIndex}-wait`];

        const pre = new Date().getTime();
        if (command != null && command !== '') {
            if (!(await sendCommand(command))) {
                alert("通信上のエラーによりマクロが中断されました。");
                break;
            }
        }
        const post = new Date().getTime();

        if (waitSeconds != null && waitSeconds > 0) {
            await wait(waitSeconds * 1000 - (post - pre));
        }
    }
}

(() => {
    const macroListNode = document.querySelector('#macro-window .macro-list');

    const numberOfMacroSlots = 20;
    const macroIds = Array.from(new Array(numberOfMacroSlots)).map((_, i) => (i + 1).toString());

    macroIds.forEach(
        macroId => {
            const macroName = loadMacroById(macroId)['macro-name'];

            const macroListItemNode = document.createElement('li');
            macroListItemNode.dataset.macroId = macroId;
            macroListItemNode.dataset.macroNumber = `0${macroId}`.slice(-2);

            {
                const macroNameNode = document.createElement('span');
                macroNameNode.classList.add('macro-name');
                macroNameNode.textContent = macroName;

                macroListItemNode.appendChild(macroNameNode);
            }

            {
                const buttonToEdit = document.createElement('button');
                buttonToEdit.classList.add('edit', 'material-symbols-outlined');
                buttonToEdit.textContent = 'edit';

                buttonToEdit.addEventListener(
                    'click',
                    (macroId => {
                        return () => editMacro(macroId);
                    })(macroId)
                );

                macroListItemNode.appendChild(buttonToEdit);
            }

            {
                const buttonToPlay = document.createElement('button');
                buttonToPlay.classList.add('play', 'material-symbols-outlined');
                buttonToPlay.textContent = 'play_arrow';

                buttonToPlay.addEventListener(
                    'click',
                    (macroId => {
                        return () => playMacro(macroId);
                    })(macroId)
                );

                macroListItemNode.appendChild(buttonToPlay);
            }

            macroListNode.appendChild(macroListItemNode);
        }
    );

    {
        const fileSelector = document.querySelector('#macro-window .import-all input[type="file"]');
        fileSelector.addEventListener(
            'change',
            () => {
                const file = fileSelector.files[0];
                if (file == null) {
                    return;
                }

                file.text().then(
                    /** @param {string} text */text => {
                        const all = JSON.parse(text !== '' ? text : '{}');

                        macroIds.forEach(
                            macroId => {
                                const macro = all[macroId] ?? {};

                                saveMacroWithId(macroId, macro);

                                {
                                    const macroNameNode = document.querySelector(`[data-macro-id="${macroId}"] .macro-name`);

                                    if (macroNameNode != null) {
                                        macroNameNode.textContent = macro['macro-name'] ?? '';
                                    }
                                }

                                {
                                    const window = document.getElementById(`macro-edit-window-${macroId}`);

                                    if (window != null) {
                                        applyMacroToWindow(deserializeMacro(JSON.stringify(macro)), window);
                                    }
                                }
                            }
                        );
                    }
                );
            }
        );
    }

    {
        const button = document.querySelector('#macro-window .export-all');
        button.addEventListener(
            'click',
            () => {
                const all = {};
                macroIds.forEach(macroId => all[macroId] = loadMacroById(macroId) ?? null);

                const json = JSON.stringify(all);
                exportMacro(json, 'macro.ytchat-adv-macro-all');
            }
        );
    }
})();
