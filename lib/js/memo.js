function zoomMemo(html){
    const $body = $('<div class="memo-zoom-body" />');
    const $inner = $('<div class="memo-zoom-inner" />').append($body);
    const $outer = $('<div class="memo-zoom-screen" />').append($inner);

    $body.html(html);
    $('body').append($outer);

    $outer.on('click', () => $outer.remove());
    $inner.on('click', () => { return false; });
}
