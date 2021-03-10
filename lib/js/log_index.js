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

        $('#base #contents').find('h3, h4, h5, h6').each(
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

                const textNodes = $clonedNode.contents().filter((_, x) => x.nodeName == '#text' && x.textContent.length > 0);
                const $li = $('<li />').text(textNodes.length > 0 ? textNodes[0].textContent : '');

                $tableOfContents_list.append($li);

                $li.on(
                    'click',
                    () => zoomMemo($clonedNode.html())
                );
            }
        );
    })($, $tableOfContents);
})($);