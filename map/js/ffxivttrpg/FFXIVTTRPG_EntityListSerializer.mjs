import {FFXIVTTRPG_Character} from "./FFXIVTTRPG_Character.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";
import {FFXIVTTRPG_ImmobileIndication} from "./FFXIVTTRPG_ImmobileIndication.mjs";
import {FFXIVTTRPG_MobileIndication} from "./FFXIVTTRPG_MobileIndication.mjs";

export class FFXIVTTRPG_EntityListSerializer {
    /**
     * @param {FFXIVTTRPG_EntityList} entityList
     * @return {string}
     */
    serializeToText(entityList) {
        /** @var {Array<string|null>} */
        const parts = [];

        entityList.forEach(
            entity => {
                if (entity instanceof FFXIVTTRPG_Character) {
                    parts.push(serializeCharacter(entity));
                } else if (entity instanceof FFXIVTTRPG_ImmobileIndication) {
                    parts.push(serializeImmobileIndication(entity));
                } else if (entity instanceof FFXIVTTRPG_MobileIndication) {
                    parts.push(serializeMobileIndication(entity));
                } else {
                    console.warn(`Found unexpected type entity: ${entity.constructor.name}`);
                }
            }
        );

        return parts.filter(x => x != null && x !== '').join('\n');
    }
}



/**
 * @param {FFXIVTTRPG_Character} character
 * @return {string|null}
 */
function serializeCharacter(character) {
    const label =
        character.role != null
            ? `[${character.role}]${character.name}`
            : character.name;

    return makeRow(label, character.position);
}



/**
 * @param {FFXIVTTRPG_ImmobileIndication} indication
 * @return {string|null}
 */
function serializeImmobileIndication(indication) {
    const text = indication.range.toText();

    if (text == null || text === '') {
        console.warn(`\`toText()\` is not implemented at ${indication.range.constructor.name}.`);
        return null;
    }

    return `固定予兆[${text}]`;
}



/**
 * @param {FFXIVTTRPG_MobileIndication} indication
 * @return {string|null}
 */
function serializeMobileIndication(indication) {
    const form = indication.range.makeFormText();

    if (form == null) {
        console.warn(`\`makeFormText()\` is not implemented at ${indication.range.constructor.name}.`);
        return null;
    }

    if (form === '') {
        return null;
    }

    return makeRow(`移動予兆[${form}]`, indication.locatorName, '::->');
}



/**
 * @param {string} label
 * @param {SquareMapPosition|string} anchor
 * @param {?string} delimiter
 * @return {string|null}
 */
function makeRow(label, anchor, delimiter = null) {
    /** @var {string} */
    let anchorText;

    if (typeof anchor === 'string') {
        anchorText = anchor;
    } else if (anchor instanceof SquareMapPosition) {
        anchorText = serializePosition(anchor);
    } else {
        console.error(`Unexpected anchor: ${anchor}`);
        return null;
    }

    return `${label}${delimiter ?? '::'} ${anchorText}`;
}

/**
 * @param {SquareMapPosition} position
 * @return {string}
 */
function serializePosition(position) {
    return `${position.horizontal}${position.vertical}`;
}
