/**
 * Block
 *
 * Stores information regarding time blocks.
 */

import uuidv4 from 'uuid/v4';
import { action, computed, observable } from 'mobx';


export default class Block {

    constructor(blockId, start, end, y, color='#ffffff') {
        this.id = uuidv4();
        this.blockId = blockId;

        this.setEnd(end);
        this.setStart(start);
        this.setY(y);
        this.setColor(color);
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

    @observable color;
    @action setColor(color) {
        this.color = color;
    }

    @observable end;
    @action setEnd(end, updateNeighbor = true) {
        this.end = Math.round(end);
        if (updateNeighbor && this.blockRight) {
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
        if (updateNeighbor && this.blockLeft) {
            this.blockLeft.setEnd(this.start, false);
        }
    }

    @observable y;
    @action setY(y, updateNeighbor = true) {
        this.y = y;
        if (updateNeighbor) {
            if (this.blockLeft) {
                this.blockLeft.setY(this.y, false);
            }
            if (this.blockRight) {
                this.blockRight.setY(this.y, false);
            }
        }
    }

    @action moveBy(deltaX, deltaY, updateNeighbor = true) {
        this.setStart(this.start + deltaX, false);
        this.setEnd(this.end + deltaX, false);
        this.setY(this.y + deltaY, false);
        if (updateNeighbor) {
            if (this.blockLeft) {
                this.blockLeft.moveBy(deltaX, deltaY, false);
            }
            if (this.blockRight) {
                this.blockRight.moveBy(deltaX, deltaY, false);
            }
        }
    }

    @computed get duration() {
        return this.end - this.start;
    }

};
