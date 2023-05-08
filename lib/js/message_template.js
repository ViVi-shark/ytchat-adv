(()=> {
    const STATE_VALID = "valid";
    const STATE_INVALID = "invalid";

    function RoomUnit(name) {
        this.name = name;
    }

    /** @return {RoomUnit[]} */
    function findUnits() {
        const units = [];

        document.querySelectorAll('#status-body [id^="stt-unit-"][data-name]').forEach(
            node => {
                const name = node.dataset.name;

                units.push(new RoomUnit(name));
            }
        );

        return units;
    }

    function StateEvent(code, value) {
        this.code = code;
        this.value = value;
    }

    function PlainText(text) {
        this.text = text;
    }

    PlainText.prototype.makeNode = function () {
        const node = document.createElement('span');
        node.classList.add('plain-text');
        node.textContent = this.text;

        return [
            node,
            Rx.Observable.return(new StateEvent(STATE_VALID, this.text))
        ];
    };

    function BreakLine() {
    }

    BreakLine.prototype.makeNode = function () {
        return [
            document.createElement('br'),
            Rx.Observable.return(new StateEvent(STATE_VALID, '\n'))
        ];
    };

    /**
     * @param {string} source
     * @return {string}
     */
    function validatePlaceholderName(source) {
        return source.replace(/^\[\[\s*/, '').replace(/\s*]]$/, '');
    }

    function PlaceholderToSelect(source) {
        this.name = validatePlaceholderName(source);
    }

    PlaceholderToSelect.prototype.makeNode = function (args) {
        function makeOption(value) {
            const node = document.createElement('option');
            node.textContent = value;
            node.setAttribute('value', value);
            return node;
        }

        const selectNode = document.createElement('select');
        selectNode.dataset.name = this.name;
        selectNode.append(makeOption(''));

        if (args[this.name] != null) {
            for (const arg of args[this.name]) {
                selectNode.append(makeOption(arg));
            }
        } else if (this.name === '&unit') {
            selectNode.append(...findUnits().map(unit => makeOption(unit.name)));
        }

        const rp = new ReactiveProperty(new StateEvent(STATE_INVALID));

        selectNode.addEventListener(
            'change',
            () => {
                const value = selectNode.value;

                rp.setValue(
                    new StateEvent(
                        value != null && value !== '' ? STATE_VALID : STATE_INVALID,
                        value
                    )
                );
            }
        );

        return [selectNode, rp.observe()];
    };

    function PlaceholderToWrite(source) {
        this.name = validatePlaceholderName(source);
    }

    PlaceholderToWrite.prototype.makeNode = function () {
        const inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('value', '');
        inputField.dataset.name = this.name;

        if (!(/^\.+$/).test(this.name)) {
            inputField.setAttribute('placeholder', this.name.replace(/^\.+/, ''));
        }

        const rp = new ReactiveProperty(new StateEvent(STATE_INVALID));

        inputField.addEventListener(
            'input',
            () => {
                const value = inputField.value;

                rp.setValue(
                    new StateEvent(
                        value != null && value !== '' ? STATE_VALID : STATE_INVALID,
                        value
                    )
                );
            }
        );

        return [inputField, rp.observe()];
    };

    function PlaceholderToRefer(source, others) {
        this.name = validatePlaceholderName(source);
        this.targetName = this.name.substr(1);
    }

    PlaceholderToRefer.prototype.makeNode = function (_, context) {
        const node = document.createElement('span');
        node.classList.add('reference');

        const rp = new ReactiveProperty(new StateEvent(STATE_INVALID));

        context.querySelector(`[data-name="${this.targetName}"]`).addEventListener(
            'change',
            x => {
                const value = x.target.value;
                node.textContent = value;

                rp.setValue(
                    new StateEvent(
                        value != null && value !== '' ? STATE_VALID : STATE_INVALID,
                        value
                    )
                );
            }
        );

        return [node, rp.observe()];
    };

    function compileFormat(format) {
        function makePlainTextElements(text) {
            const lines = text.split('\n');

            const elements = [];

            for (let i = 0; i < lines.length; i++) {
                if (i > 0) {
                    elements.push(new BreakLine());
                }

                elements.push(new PlainText(lines[i]));
            }

            return elements;
        }

        const parts = [];
        let start = 0;

        while (start < format.length) {
            const substr = format.substr(start);
            const placeholderMatched = (/\[\[.+?]]/g).exec(substr);

            if (placeholderMatched == null) {
                for (const e of makePlainTextElements(substr)) {
                    parts.push(e);
                }
                break;
            } else {
                const beforeText = substr.substr(0, placeholderMatched.index);
                const matchedText = placeholderMatched[0];
                start += (placeholderMatched.index + matchedText.length);

                for (const e of makePlainTextElements(beforeText)) {
                    parts.push(e);
                }

                if ((/^\[\[\s*\.+/).test(matchedText)) {
                    parts.push(new PlaceholderToWrite(matchedText));
                } else if ((/^\[\[\s*\*/).test(matchedText)) {
                    parts.push(new PlaceholderToRefer(matchedText, parts.slice()));
                } else {
                    parts.push(new PlaceholderToSelect(matchedText));
                }
            }
        }

        return parts;
    }

    function validateArgs(args) {
        const o = {};

        if (args != null) {
            for (const [key, value] of Object.entries(args)) {
                if (value == null) {
                } else if (value instanceof Array) {
                    o[key] = value.filter(x => x != null).map(x => x.toString());
                } else {
                    o[key] = [value.toString()];
                }
            }
        }

        return o;
    }

    function makeTemplate(source) {
        const format = compileFormat(source['format']);
        const args = validateArgs(source['args']);

        const formatNode = document.createElement('div');
        formatNode.classList.add('format');

        const templateNode = document.createElement('div');
        templateNode.classList.add('template');
        templateNode.append(formatNode);

        const stateObservables = [];

        for (const elementOfFormat of format) {
            const [node, observable] = elementOfFormat.makeNode(args, formatNode);
            formatNode.append(node);
            stateObservables.push(observable);
        }

        const actionsNode = document.createElement('div');
        actionsNode.classList.add('actions');

        const buttonToSubmit = document.createElement('button');
        buttonToSubmit.classList.add('button-to-submit');
        buttonToSubmit.textContent = "送信";

        actionsNode.append(buttonToSubmit);
        templateNode.append(actionsNode);

        let message = null;

        Rx.Observable.combineLatest(stateObservables)
            .subscribe(
                states => {
                    if (states.every(x => x.code === STATE_VALID)) {
                        buttonToSubmit.disabled = false;
                        message = states.map(x => x.value).join('');
                    } else {
                        buttonToSubmit.disabled = true;
                    }
                }
            );

        const sent = new Rx.ReplaySubject();

        buttonToSubmit.addEventListener(
            'click',
            () => {
                const id = `message_by_template_${(new Date()).getTime()}`;
                const temporaryNode = document.createElement('textarea');
                temporaryNode.setAttribute('id', id);
                temporaryNode.style.display = 'none';
                temporaryNode.value = message;

                document.querySelector('body').append(temporaryNode);

                formSubmit(id);

                temporaryNode.parentNode.removeChild(temporaryNode);
                sent.onNext(null);
            }
        );

        return [templateNode, sent];
    }

    const modal = createModal();
    modal.addClass('message-templates');

    function openMessageTemplates(source) {
        const listNode = document.createElement('div');
        listNode.classList.add('message-template-list');

        for (const itemOfSource of source) {
            if (itemOfSource == null || itemOfSource['format'] == null) {
                continue;
            }

            const [templateNode, onSent] = makeTemplate(itemOfSource);
            listNode.append(templateNode);

            onSent.take(1).subscribe(() => modal.close());
        }

        modal.open(listNode);
    }

    {
        const buttonToOpen = document.querySelector('.open-message-templates');

        const templatesSource = JSON.parse(decodeURIComponent(buttonToOpen.dataset.source));

        buttonToOpen.addEventListener(
            'click',
            () => openMessageTemplates(templatesSource)
        );

        if (
            templatesSource == null ||
            (templatesSource instanceof Array && templatesSource.length === 0)
        ) {
            buttonToOpen.style.display = 'none';
        }
    }
})();
