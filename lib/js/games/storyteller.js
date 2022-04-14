function isStoryteller() {
    return gameSystem === 'storyteller';
}

function storyteller() {}

storyteller.updateTopicNode = ($ => {
    let animationDisposerHandle = null;

    return function ($node, topicText) {
        function parseWords(source) {
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

        $node.addClass('storyteller-keywords');
        $node.text('');

        parseWords((topicText ?? '').replace(/<br>/g, '')).forEach(
            x => {
                const word = x['word'];
                const collected = x['collected'];

                /** @var {jQuery} */
                const $keyword = $('<span class="storyteller-keyword" />');

                $keyword
                    .append($('<span class="bracket" />').text('【'));

                if (collected) {
                    $keyword.addClass('collected');
                    $keyword.append($('<span class="collection-mark" />').text('✔'))
                }

                $keyword
                    .append(word)
                    .append($('<span class="bracket" />').text('】'));

                $node.append($keyword);

                $keyword.on(
                    'click',
                    () => navigator.clipboard.writeText($keyword.text())
                );
            }
        );

        const classForAnimation = 'animation-updated';

        $node.removeClass(classForAnimation);

        animationDisposerHandle = setTimeout(
            () => {
                if (animationDisposerHandle != null) {
                    clearTimeout(animationDisposerHandle);
                }

                $node.addClass(classForAnimation);

                animationDisposerHandle = setTimeout(
                    () => $node.removeClass(classForAnimation),
                    1000
                );
            },
            1
        );
    };
})($);

($ => {
    if (!isStoryteller()) {
        return;
    }

    $('#edit-topic > h2').text("キーワードリスト編集");
})($);
