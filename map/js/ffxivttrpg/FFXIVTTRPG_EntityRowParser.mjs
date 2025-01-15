import {MapEntityRowParser} from "../MapEntityRowParser.mjs";
import {SquareMapPosition} from "../positions/SquareMapPosition.mjs";

export class FFXIVTTRPG_EntityRowParser extends MapEntityRowParser {
    /**
     * @return {SquareMapPositionParser}
     */
    get _positionParser() {
        // noinspection JSValidateTypes
        return super._positionParser;
    }

    parse(source, allowInvalidPosition) {
        const m = source.match(/^\s*((?:固定|移動)予兆)\[\s*([^\]]+?)\s*](?:\s*[:：]{2}(?:→|[-－―ー][>＞])\s*(\S+?))?\s*$/);

        if (m != null) {
            /** @var {'固定予兆'|'移動予兆'} */
            const kind = m[1];
            const formSource = m[2];
            /** @var {null|string} */
            const anchor = m[3];

            const entitySource = this.#parseIndicationForm(formSource, kind);

            if (entitySource == null) {
                console.warn(`Unexpected format form: ${formSource}`);
                return null;
            }

            switch (kind) {
                case '固定予兆':
                    return entitySource;
                case '移動予兆':
                    if (anchor == null) {
                        console.warn(`Anchor must be specified.\n(source: ${source})`);
                        return;
                    }

                    entitySource['anchor'] = anchor;
                    return entitySource;
            }
        }

        const split = this._splitByDelimiter(source, '::');

        if (split == null) {
            return null;
        }

        return this.#parseCharacter(split.left, split.right, allowInvalidPosition);
    }

    /**
     * @param {string} form
     * @param {'固定予兆'|'移動予兆'} mode
     * @return {null|FFXIVTTRPG_EntitySource}
     */
    #parseIndicationForm(form, mode) {
        const name = `__${mode}__`;

        let m;

        if ((m = form.match(/^(\d+)x\d+(?:@([A-Z]+\d+))?$/i))) {
            const size = parseInt(m[1]);
            const origin = m[2] != null ? this._positionParser.parse(m[2]) : null;

            if (origin == null && mode === '固定予兆') {
                return null;
            }

            if (origin != null && mode === '移動予兆') {
                return null;
            }

            return {name, form: 'square', size, origin};
        }

        if ((m = form.match(/^cross(?:[~～](\d+))?(?:@([A-Z]+\d+))?$/i))) {
            const size = m[1] != null ? parseInt(m[1]) : null;
            const origin = m[2] != null ? this._positionParser.parse(m[2]) : null;

            if (origin == null && mode === '固定予兆') {
                return null;
            }

            if (origin != null && mode === '移動予兆') {
                return null;
            }

            return {name, form: 'cross', size, origin};
        }

        if (mode === '固定予兆' && (m = form.match(/^(\d+)$/))) {
            const row = parseInt(m[1]);
            return {name, form: 'row', row};
        }

        if (mode === '固定予兆' && (m = form.match(/^(\d+)[:：](\d+)$/))) {
            const start = parseInt(m[1]);
            const end = parseInt(m[2]);
            return {name, form: 'rows', start, end};
        }

        if (mode === '固定予兆' && (m = form.match(/^([A-Z]+)$/i))) {
            const column = m[1].toUpperCase();
            return {name, form: 'column', column};
        }

        if (mode === '固定予兆' && (m = form.match(/^([A-Z]+)[:：]([A-Z]+)$/i))) {
            const start = m[1].toUpperCase();
            const end = m[2].toUpperCase();
            return {name, form: 'columns', start, end};
        }

        if ((m = form.match(/^([A-Z]+\d+)$/i))) {
            const position = this._positionParser.parse(m[1]);

            if (position == null && mode === '固定予兆') {
                return null;
            }

            if (position != null && mode === '移動予兆') {
                return null;
            }

            return {name, form: 'point', position};
        }

        if (mode === '固定予兆' && (m = form.match(/^([A-Z]+\d+)[:：]([A-Z]+\d+)$/i))) {
            const start = this._positionParser.parse(m[1]);
            const end = this._positionParser.parse(m[2]);

            if (start == null || end == null) {
                return null;
            }

            return {name, form: 'direct-rect', start, end};
        }

        if ((m = form.match(/^([A-Z]+\d+)\s*to\s*(UP|DOWN|RIGHT|LEFT)(?:\s*[~～]\s*(\d+))?$/i))) {
            const origin = this._positionParser.parse(m[1]);
            const direction = m[2].toUpperCase();
            const size = m[3] != null ? parseInt(m[3]) : null;

            if ((origin == null || origin === SquareMapPosition.invalid) && mode === '固定予兆') {
                return null;
            }

            if (origin != null && mode === '移動予兆') {
                return null;
            }

            return {name, form: 'linear', origin, direction, size};
        }

        return null;
    }

    #parseCharacter(nameSource, positionSource, allowInvalidPosition) {
        /** @var {string} */
        let name;

        const options = {};

        {
            const re = /\[(TANK|HEALER|DPS)]/i;
            const m = nameSource.match(re);

            if (m != null) {
                options['role'] = m[1].toUpperCase();
                name = nameSource.replace(re, '');
            } else {
                name = nameSource;
            }
        }

        const result = {
            name,
            position: this._positionParser.parse(positionSource, allowInvalidPosition)
        };

        if (result.position == null) {
            return null;
        }

        Object.assign(result, options);

        return result;
    }
}
