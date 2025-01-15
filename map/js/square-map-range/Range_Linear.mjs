import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {OriginatedRange} from "./OriginatedRange.mjs";

export class Range_Linear extends OriginatedRange {
    /** @var {'UP'|'RIGHT'|'DOWN'|'LEFT'} */
    #direction;

    /** @var {?int} */
    #length;

    /**
     * @param {SquareMapPosition} origin
     * @param {'UP'|'RIGHT'|'DOWN'|'LEFT'} direction
     * @param {?int} length
     */
    constructor(origin, direction, length = null) {
        super(origin);
        this.#direction = direction;
        this.#length = length ?? null;
    }

    * enumeratePositions(mapSize) {
        if (this.origin !== SquareMapPosition.invalid) {
            let position = this.origin;
            yield position;

            for (let i = 1; this.#length == null || i < this.#length; i++) {
                position = move(position, this.#direction, mapSize);

                if (position != null && position !== SquareMapPosition.invalid) {
                    yield position;
                } else {
                    break;
                }
            }
        }
    }

    toText() {
        return `${this.origin ?? 'NULL'}${this.makeFormText()}`;
    }

    makeFormText() {
        return `to${this.#direction}${this.#length != null ? `~${this.#length}` : ''}`;
    }
}



/**
 * @param {SquareMapPosition} source
 * @param {'UP'|'RIGHT'|'DOWN'|'LEFT'} direction
 * @param {SquareMapSize} mapSize
 * @return {SquareMapPosition|null}
 */
function move(source, direction, mapSize) {
    let x = source.horizontalInt;
    let y = source.vertical;

    switch (direction) {
        case 'LEFT':
            x--;
            break;
        case 'RIGHT':
            x++;
            break;
        case 'UP':
            y--;
            break;
        case 'DOWN':
            y++;
            break;
        default:
            throw new Error();
    }

    if (x < 1 || x > mapSize.width || y < 1 || y > mapSize.height) {
        return null;
    }

    return new SquareMapPosition(SquareMapPosition.intToCharacter(x), y);
}
