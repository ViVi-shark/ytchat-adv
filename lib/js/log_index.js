(function(){
    const $tableOfContents = $('<div class="box table-of-contents"><h2>Table of Contents</h2></div>');
    $('#logviewer').append($tableOfContents);

    (function($, $tableOfContents){
        function getSurfaceText(selector){
            const elem = $(selector[0].outerHTML);
            elem.children().empty();
            return elem.text();
        }

        const $tableOfContents_list = $('<ul class="headlines" />');
        $tableOfContents.append($tableOfContents_list);

        $('#base #contents > .logs > dl').find('dd.comm > h3, dd.comm > h4, dd.comm > h5, dd.comm > h6').each(
            (index, node) =>
            {
                const id = '__headline_' + (index+1).toString();
                $(node).prepend($('<a id="'+id+'" style="inline-block; width: 0; height: 0; position: relative; top: -8em;" />'));

                const levelName = node.tagName.toLowerCase() + (node.hasAttribute('class') ? '.'+node.getAttribute('class') : '');

                $tableOfContents_list.append($('<li />').attr('data-level', levelName).append($('<a />').attr('href', '#'+id).text(getSurfaceText($(node)))));
            }
        );
    })($, $tableOfContents);

    (function($, $tableOfContents){
        const $tableOfContents_list = $('<ul class="memo" />');
        $tableOfContents.append($tableOfContents_list);

        $('#base #contents > .logs > dl > dd.memo > details').each(
            (_, node) =>
            {
                const $clonedNode = $(node).clone();
                $clonedNode.find('summary').remove();

                const headline = $('<div />').html($clonedNode.html().split(/(\n|<(br|hr)\s*\/?>|<\/.+?>)/)[0]).text();

                const $li = $('<li />').text(headline);

                $tableOfContents_list.append($li);

                $li.on(
                    'click',
                    () => zoomMemo($clonedNode.html())
                );
            }
        );
    })($, $tableOfContents);
})($);