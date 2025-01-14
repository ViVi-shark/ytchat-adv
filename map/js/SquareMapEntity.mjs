import {MapEntity} from "./MapEntity.mjs";

export class SquareMapEntity extends MapEntity {
    /**
     * @return {SquareMapPosition}
     */
    get position() {
        // noinspection JSValidateTypes
        return super.position;
    }
}
