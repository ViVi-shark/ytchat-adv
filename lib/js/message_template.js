(function($){
    const STATE_VALID = "valid";
    const STATE_INVALID = "invalid";

    function findUnits($){
        const units = [];

        $('#status-body [id^="stt-unit-"][data-name]').each(
            (_, node) => {
                const $node = $(node);
                const name = $node.attr('data-name');

                units.push(
                    {
                        name: name
                    }
                );
            }
        );

        return units;
    }

    function StateEvent(code, value){
        this.code = code;
        this.value = value;
    }

    function PlainText(text){
        this.text = text;
    }
    PlainText.prototype.makeNode = function($){
        const $node = $('<span class="plain-text" />').html($('<div />').text(this.text).html().replace(/ /g, '&nbsp;'));
        return [$node, Rx.Observable.return(new StateEvent(STATE_VALID, this.text))];
    };

    function validatePlaceholderName(source){
        return source.replace(/^\[\[\s*/, '').replace(/\s*\]\]$/, '');
    }

    function PlaceholderToSelect(source){
        this.name = validatePlaceholderName(source);
    }
    PlaceholderToSelect.prototype.makeNode = function($, args){
        function makeOption($, value){
            return $('<option />').text(value).attr('value', value);
        }

        const $select = $('<select />');
        $select.append(makeOption($, ''));

        if (args[this.name] != null) {
            for (const arg of args[this.name]) {
                $select.append(makeOption($, arg));
            }
        } else if (this.name == '&unit') {
            const units = findUnits($);

            for (const unit of units) {
                $select.append(makeOption($, unit.name));
            }
        }

        const rp = new ReactiveProperty(new StateEvent(STATE_INVALID));

        $select.on(
            'change',
            function(){
                const value = $select.val();

                rp.setValue(
                    new StateEvent(
                        value != null && value != '' ? STATE_VALID : STATE_INVALID,
                        value
                    )
                );
            }
        );

        return [$select, rp.observe()];
    };

    function PlaceholderToWrite(source){
        this.name = validatePlaceholderName(source);
    }
    PlaceholderToWrite.prototype.makeNode = function($){
        function makeOption($, value){
            return $('<option />').text(value).attr('value', value);
        }

        const $input = $('<input type="text" value="" />');

        if (!(/^\.+$/).test(this.name)) {
            $input.attr('placeholder', this.name.replace(/^\.+/, ''));
        }

        const rp = new ReactiveProperty(new StateEvent(STATE_INVALID));

        $input.on(
            'input',
            function(){
                const value = $input.val();

                rp.setValue(
                    new StateEvent(
                        value != null && value != '' ? STATE_VALID : STATE_INVALID,
                        value
                    )
                );
            }
        );

        return [$input, rp.observe()];
    };

    function compileFormat(format){
        const parts = [];
        var start = 0;

        while (start < format.length) {
            const substr = format.substr(start);
            const placeholderMatched = (/\[\[.+?\]\]/g).exec(substr);

            if (placeholderMatched == null) {
                parts.push(new PlainText(substr));
                break;
            } else {
                const beforeText = substr.substr(0, placeholderMatched.index);
                const matchedText = placeholderMatched[0];
                start += (placeholderMatched.index + matchedText.length);

                parts.push(new PlainText(beforeText));

                if ((/^\[\[\s*\.+/).test(matchedText)) {
                    parts.push(new PlaceholderToWrite(matchedText));
                } else {
                    parts.push(new PlaceholderToSelect(matchedText));
                }
            }
        }

        return parts;
    }

    function validateArgs(args){
        const o = {};

        if (args != null) {
            for (const [key, value] of Object.entries(args)) {
                if (value == null) {
                    continue;
                } else if (value instanceof Array) {
                    o[key] = value.filter(x => x != null).map(x => x.toString());
                } else {
                    o[key] = [value.toString()];
                }
            }
        }

        return o;
    }

    function makeTemplate($, source){
        const format = compileFormat(source['format']);
        const args = validateArgs(source['args']);

        const $format = $('<div class="format" />');
        const $template = $('<div class="template" />').append($format);

        const stateObservables = [];

        for (const elementOfFormat of format) {
            const [$node, observable] = elementOfFormat.makeNode($, args);
            $format.append($node);
            stateObservables.push(observable);
        }

        const $actions = $('<div class="actions" />');
        const $buttonToSubmit = $('<span class="button button-to-submit" />').text("送信");
        $actions.append($buttonToSubmit);
        $template.append($actions);

        var message = null;

        Rx.Observable.combineLatest(stateObservables)
        .subscribe(
            states =>
            {
                if (states.every(x => x.code == STATE_VALID)) {
                    $buttonToSubmit.removeClass('disabled');

                    message = states.map(x => x.value).join('');
                } else {
                    $buttonToSubmit.addClass('disabled');
                }
            }
        );

        const sent = new Rx.ReplaySubject();

        $buttonToSubmit.on(
            'click',
            function(){
                const id = `message_by_template_${(new Date()).getTime()}`;
                const $temporaryNode = $(`<input id="${id}" style="display: none;" />`).val(message);
                $('body').append($temporaryNode);
                formSubmit(id);
                $temporaryNode.remove();
                sent.onNext(null);
            }
        );

        return [$template, sent];
    }

    function openMessageTemplates($, source){
        const $list = $('<div class="list" />');
        const $inner = $('<div class="inner" />').append($list);
        const $outer = $('<div class="message-templates" />').append($inner);
        $('body').append($outer);
        $outer.on('click', () => $outer.remove());
        $inner.on('click', () => { return false; });

        for (const itemOfSource of source) {
            if (itemOfSource == null || itemOfSource['format'] == null) {
                continue;
            }

            const [$template, onSent] = makeTemplate($, itemOfSource);
            $list.append($template);

            onSent.take(1).subscribe(() => $outer.remove());
        }
    }

    const $buttonToOpen = $('.open-message-templates');
    $buttonToOpen.on(
        'click',
        () => openMessageTemplates(
            $,
            JSON.parse(decodeURIComponent($buttonToOpen.attr('data-source')))
        )
    );
})($);