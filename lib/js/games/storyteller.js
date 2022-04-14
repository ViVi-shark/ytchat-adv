function isStoryteller() {
    return gameSystem === 'storyteller';
}

function storyteller() {}

storyteller.updateTopicNode = (() => {
    let animationDisposerHandle = null;

    /**
     * @param {HTMLDivElement} node
     * @param {string} topicText
     */
    function update(node, topicText) {
        /**
         * @param {string} source
         * @return {{collected: boolean, word: string}[]}
         */
        function parseWords(source) {
            /**
             * @param {string} source
             * @return {boolean}
             */
            function isEmpty(source) {
                return source.replace(/\n/, '').replace(/\r/, '').match(/^\s*$/) != null;
            }

            if (isEmpty(source)) {
                return [];
            }

            let words = null;

            {
                const m = source.match(/(^|、|，|,|\n)?\s*([☑✓✔✅])?\s*【\s*([☑✓✔✅])?\s*(.+?)】(、|，|,|\n|$)?/);

                if (m != null) {
                    const word = m[4];
                    const collected = (m[2] ?? m[3]) != null;
                    const previous = source.substr(0, m.index);
                    const next = source.substr(m.index + m[0].length);

                    words = parseWords(previous)
                        .concat([{word, collected}])
                        .concat(parseWords(next));
                }
            }

            if (words == null) {
                const m = source.match(/(^|、|，|,|\n)?\s*([☑✓✔✅])?\s*「\s*([☑✓✔✅])?\s*(.+?)」(、|，|,|\n|$)?/);

                if (m != null) {
                    const word = `「${m[4]}」`;
                    const collected = (m[2] ?? m[3]) != null;
                    const previous = source.substr(0, m.index);
                    const next = source.substr(m.index + m[0].length);

                    words = parseWords(previous)
                        .concat([{word, collected}])
                        .concat(parseWords(next));
                }
            }

            if (words == null) {
                words = source.split(/[、，,\n\r]+/)
                    .map(
                        x => {
                            const m = x.match(/^\s*([☑✓✔✅])?\s*(.+?)\s*$/);

                            if (m == null) {
                                return {word: x, collected: false};
                            }

                            return {word: m[2], collected: m[1] != null};
                        }
                    );
            }

            if (words == null) {
                return [];
            }

            return words
                .filter(x => x.word != null && x.word !== '')
                .map(
                    x => {
                        return {
                            word: x.word.replace(/^\s+/, '').replace(/\s+$/, ''),
                            collected: x.collected
                        };
                    }
                );
        }

        if (animationDisposerHandle != null) {
            clearTimeout(animationDisposerHandle);
        }

        node.classList.add('storyteller-keywords');
        node.innerHTML = '';

        parseWords((topicText ?? '').replace(/<br>/g, '')).forEach(
            x => {
                const word = x['word'];
                const collected = x['collected'];

                const keywordNode = document.createElement('span');
                keywordNode.classList.add('storyteller-keyword');

                function createBracketNode(text) {
                    const node = document.createElement('span');
                    node.classList.add('bracket');
                    node.textContent = text;
                    return node;
                }

                keywordNode.appendChild(createBracketNode('【'));

                if (collected) {
                    keywordNode.classList.add('collected');

                    {
                        const collectionMarkNode = document.createElement('span');
                        collectionMarkNode.classList.add('collection-mark');
                        collectionMarkNode.textContent = '✔';

                        keywordNode.appendChild(collectionMarkNode);
                    }
                }

                {
                    const wordBodyNode = document.createElement('span');
                    wordBodyNode.classList.add('word-body');
                    wordBodyNode.textContent = word;
                    keywordNode.appendChild(wordBodyNode);
                }


                keywordNode.appendChild(createBracketNode('】'));

                node.appendChild(keywordNode);

                keywordNode.addEventListener(
                    'click',
                    () => navigator.clipboard.writeText(keywordNode.innerText)
                );
            }
        );

        const classForAnimation = 'animation-updated';

        node.classList.remove(classForAnimation);

        animationDisposerHandle = setTimeout(
            () => {
                if (animationDisposerHandle != null) {
                    clearTimeout(animationDisposerHandle);
                }

                node.classList.add(classForAnimation);

                animationDisposerHandle = setTimeout(
                    () => node.classList.remove(classForAnimation),
                    1000
                );
            },
            1
        );
    }

    return update;
})();

(() => {
    if (!isStoryteller()) {
        return;
    }

    document.querySelector('#edit-topic > h2').textContent = "キーワードリスト編集";

    {
        const editTopicNode = document.getElementById('edit-topic');
        editTopicNode.classList.add('storyteller-keyword-area');

        const buttonToInsertCheckMark = document.createElement('button');
        buttonToInsertCheckMark.textContent = "チェックマークを挿入";

        const bottomAreaNode = document.createElement('div');
        bottomAreaNode.classList.add('bottom-area');
        bottomAreaNode.appendChild(buttonToInsertCheckMark);

        editTopicNode.appendChild(bottomAreaNode);

        {
            /** @var {HTMLTextAreaElement} */
            const textarea = document.querySelector('#edit-topic textarea');

            buttonToInsertCheckMark.addEventListener(
                'click',
                () => {
                    if (buttonToInsertCheckMark.hasAttribute('disabled')) {
                        return;
                    }

                    const selectionStart = textarea.selectionStart;
                    const selectionEnd = textarea.selectionEnd;

                    const previous = textarea.value.substr(0, selectionStart);
                    const selected = textarea.value.substr(selectionStart, selectionEnd - selectionEnd);
                    const next = textarea.value.substr(selectionEnd);

                    textarea.value = `${previous}✔${selected}${next}`;
                    textarea.selectionStart = selectionStart;
                    textarea.selectionEnd = selectionEnd + 1;
                }
            );

            textarea.addEventListener(
                'focus',
                () => buttonToInsertCheckMark.removeAttribute('disabled')
            );

            textarea.addEventListener(
                'blur',
                e => {
                    if (e.relatedTarget === buttonToInsertCheckMark) {
                        return;
                    }

                    buttonToInsertCheckMark.setAttribute('disabled', '');
                }
            );

            buttonToInsertCheckMark.setAttribute('disabled', '');
        }
    }
})();
