/**
 * Block
 *
 * Stores information regarding time blocks.
 */

import uuidv4 from 'uuid/v4';
import { action, computed, observable } from 'mobx';


export default class Block {

    constructor(blockId, start, end, y, opts = {}) {
        this.id = uuidv4();
        this.blockId = blockId;

        this.onChange = opts.onChange || (() => {});
        this.store = opts.store;

        this.removed = false;

        this._stopPropagation = true;
        this.setEnd(end);
        this.setStart(start);
        this.setY(y);
        this.setColor(opts.color || '#ffffff');
        this._stopPropagation = false;
    }

    emitChange() {
        if (!this._stopPropagation) {
            this.onChange(this);
        }
    }

    @action remove() {
        if (this.store) {
            this.store.remove(this);
        }
    }

    @observable blockLeft;
    @action setBlockLeft(blockLeft) {
        this.blockLeft = blockLeft;
    }

    @observable blockRight;
    @action setBlockRight(blockRight) {
        this.blockRight = blockRight;
    }

    @observable blockId;
    @action setBlockId(blockId) {
        this.blockId = blockId;
    }

    @observable className = '';
    @action setClassName(className) {
        this.className = className;
    }

    @observable color;
    @action setColor(color) {
        this.color = color;
    }

    @observable end;
    @action setEnd(end, updateNeighbor = true) {
        this.end = Math.round(end);

        if (updateNeighbor && this.blockRight && !this.blockRight.selected) {
            this.blockRight.setStart(this.end, false);
        }
    }

    @observable name;
    @action setName(name) {
        this.name = name;
    }

    @observable selected = false;
    @action setSelected(selected = true, updateNeighbor = false) {
        this.selected = selected;

        this.emitChange();

        if (updateNeighbor) {
            if (this.blockLeft) {
                this.blockLeft.setSelected(this.selected, false);
            }
            if (this.blockRight) {
                this.blockRight.setSelected(this.selected, false);
            }
        }
    }

    @observable start;
    @action setStart(start, updateNeighbor = true) {
        this.start = Math.round(start);
        if (updateNeighbor && this.blockLeft && !this.blockLeft.selected) {
            this.blockLeft.setEnd(this.start, false);
        }
    }

    @observable y;
    @action setY(y, updateNeighbor = true) {
        this.y = y;

        if (updateNeighbor) {
            if (this.blockLeft && !this.blockLeft.selected) {
                this.blockLeft.setY(this.y, false);
            }
            if (this.blockRight && !this.blockRight.selected) {
                this.blockRight.setY(this.y, false);
            }
        }
    }

    @action moveBy(deltaX, deltaY, updateNeighbor = true) {
        this.setStart(this.start + deltaX, false);
        this.setEnd(this.end + deltaX, false);
        this.setY(this.y + deltaY, false);

        if (updateNeighbor) {
            if (this.blockLeft && !this.blockLeft.selected) {
                this.blockLeft.moveBy(deltaX, deltaY, false);
            }
            if (this.blockRight && !this.blockRight.selected) {
                this.blockRight.moveBy(deltaX, deltaY, false);
            }
        }
    }

    @computed get duration() {
        return this.end - this.start;
    }

};
