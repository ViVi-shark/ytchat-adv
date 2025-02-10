// マップ解決
import {BloodGardenMap} from "../../map/js/BloodGardenMap.mjs";
import {MaleGateMap} from "../../map/js/MaleGateMap.mjs";
import {FFXIVTTRPG_Map} from "../../map/js/ffxivttrpg/FFXIVTTRPG_Map.mjs";
import {SquareMapSize} from "../../map/js/SquareMapSize.mjs";
import {DiaclockMap} from "../../map/js/diaclock.mjs";

{
    const body = document.querySelector('body');
    const gameName = body.dataset.gameName ?? '';

    document.querySelectorAll('#contents .logs .system .info.map > .map-update[data-map-source]:not([data-map-source=""])').forEach(
        mapSourceNode => {
            const encodedMapSource = mapSourceNode.dataset.mapSource;
            const mapSource = decodeMapSourceText(encodedMapSource);

            /** @var {DiaclockMapCore|null} */
            const map = (() => {
                if (gameName.startsWith('drag-bride')) {
                    return new MaleGateMap();
                }

                if (gameName.startsWith('bloodorium')) {
                    return new BloodGardenMap();
                }

                if (gameName === 'Avandner') {
                    return new DiaclockMap();
                }

                if (gameName === 'FinalFantasyXIV') {
                    return new FFXIVTTRPG_Map(new SquareMapSize(9, 9));
                }

                return null;
            })(gameName);

            if (map != null) {
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
