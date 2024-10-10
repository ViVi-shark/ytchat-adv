// マップ解決
import {BloodGardenMap} from "../../diaclock/js/BloodGardenMap.mjs";

{
    const body = document.querySelector('body');
    const gameName = body.dataset.gameName ?? '';

    document.querySelectorAll('#contents .logs .system .info.map > .map-update[data-map-source]:not([data-map-source=""])').forEach(
        mapSourceNode => {
            const encodedMapSource = mapSourceNode.dataset.mapSource;
            const mapSource = decodeMapSourceText(encodedMapSource);

            if (gameName.startsWith('bloodorium')) {
                const map = new BloodGardenMap();

                map.setEntities(map.entityListParser.parse(mapSource));

                const mapWrapper = document.createElement('div');
                mapWrapper.classList.add('map-wrapper');

                const mapWrapperInner = document.createElement('div');
                mapWrapperInner.classList.add('map-wrapper-inner');
                mapWrapper.appendChild(mapWrapperInner);

                const mapContainer = document.createElement('div');
                mapContainer.classList.add('map-container');
                mapWrapperInner.appendChild(mapContainer);

                {
                    const renderer = map.renderTo(mapContainer);

                    window.addEventListener('resize', () => renderer.resize());
                }

                mapSourceNode.parentNode.appendChild(mapWrapper);
                mapSourceNode.remove();
            }
        }
    );
}
