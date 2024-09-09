const idOfWindow = 'map-window';

/**
 * @return {HTMLDivElement}
 */
function createMapWindow() {
    const window = document.createElement('div');
    window.classList.add('map-window', 'float-box');
    window.setAttribute('id', idOfWindow);
    window.innerHTML = `
                  <h2>マップ</h2>
                  <div class="window-content-area">
                    <div class="map-area"><div class="map-area-inner"></div></div>
                    <div class="right-area">
                      <div class="right-area-inner">
                        <div class="upper">
                          <textarea class="entities-field" wrap="off"></textarea>
                        </div>
                        <div class="lower buttons">
                          <button class="to-add-all-units">全ユニットを追加</button>
                          <button class="to-submit">送信</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span class="close button" onclick="boxClose('${idOfWindow}');">×</span>
                `;

    document.querySelector('body').appendChild(window);

    makeDraggable(window.querySelector('h2'));

    return window;
}

function getBrowserWindowSize() {
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}

/**
 * @param {DiaclockMapCore} map
 */
function supportMap(map) {
    const window = createMapWindow();

    {
        const menuItemNode = document.getElementById('menu-button-map');

        menuItemNode.querySelector('a').setAttribute('onclick', `boxOpen('${idOfWindow}');`);
        menuItemNode.style.display = 'initial';
    }

    {
        const renderer = map.renderTo(window.querySelector('.map-area-inner'));

        let lastWindowSize;

        new MutationObserver(
            () => {
                const outerRect = window.getBoundingClientRect();
                const browserRect = getBrowserWindowSize();

                if (outerRect.width < 600 && outerRect.width < browserRect.width * 0.9) {
                    window.style.width = '600px';
                }

                if (outerRect.height < 400 && outerRect.height < browserRect.height * 0.8) {
                    window.style.height = '400px';
                }

                const currentWindowSize = window.clientWidth;

                if (currentWindowSize === lastWindowSize) {
                    return;
                }

                lastWindowSize = currentWindowSize;

                renderer.resize();

                setTimeout(() => renderer.resize(), 1);
            }
        ).observe(
            window,
            {
                attributes: true,
                attributeFilter: ['style']
            }
        );

        window.addEventListener('mouseup', () => renderer.resize());
        window.addEventListener('pointerup', () => renderer.resize());
    }

    {
        /** @var {HTMLTextAreaElement} */
        const textarea = window.querySelector('textarea.entities-field');

        {
            window.addEventListener(
                MapUpdateEvent.type,
                /** @param {MapUpdateEvent} e*/e => {
                    const mapSourceText = decodeMapSourceText(e.encodedMapSourceText);

                    textarea.value = mapSourceText;
                    map.setEntities(map.entityListParser.parse(mapSourceText));
                }
            );
        }

        {
            const buttonToAddAllUnits = window.querySelector('button.to-add-all-units');

            buttonToAddAllUnits.addEventListener(
                'click',
                () => {
                    const currentEntityNames = [...map.entityListParser.parse(textarea.value, true)].map(
                        /** @param {DiaclockSystemEntity} x */x => x.name
                    );

                    document.querySelectorAll('#status #status-body dl[id^="stt-unit-"] dt.chara-name').forEach(
                        node => {
                            const unitName = node.textContent.trim();

                            if (currentEntityNames.includes(unitName)) {
                                return;
                            }

                            if (textarea.value !== '' && !textarea.value.endsWith('\n')) {
                                textarea.value += '\n';
                            }

                            textarea.value += `${unitName} :: \n`;
                        }
                    );
                }
            );
        }

        {
            const makeTemporaryNodeId = (() => {
                let serial = 0;
                return () => `temporary-node-id-${++serial}`;
            })();

            /**
             * @param {string} text
             * @return {HTMLTextAreaElement}
             */
            function makeTemporaryTextAreaNode(text) {
                const node = document.createElement('textarea');
                node.dataset.commPre = '/map ';
                node.setAttribute('id', makeTemporaryNodeId());
                node.style.display = 'none';
                node.value = text ?? '';

                document.querySelector('body').appendChild(node);

                return node;
            }

            /**
             * @param {string} sourceText
             * @return {string}
             */
            function optimizeSourceText(sourceText) {
                return [...map.entityListParser.parse(sourceText)]
                    .map(/** @param {DiaclockSystemEntity} x*/x => `${x.name}:: ${x.position.toString()}`)
                    .join('\n');
            }

            const buttonToSubmit = window.querySelector('button.to-submit');

            buttonToSubmit.addEventListener(
                'click',
                () => {
                    const temporaryNode = makeTemporaryTextAreaNode(
                        encodeMapSourceText(optimizeSourceText(textarea.value))
                    );

                    formSubmit(temporaryNode.getAttribute('id'), null).then(
                        () => {
                            temporaryNode.remove();
                        },
                        () => temporaryNode.remove()
                    );
                }
            );
        }
    }
}
