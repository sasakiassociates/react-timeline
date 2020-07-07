/**
 * Block
 *
 * Stores information regarding time blocks.
 */

import uuidv4 from 'uuid/v4';
import {action, computed, observable} from 'mobx';


export default class Block {

    constructor(start, end, y, ui, viewport) {
        this.id = uuidv4();
        this.ui = ui;
        this.viewport = viewport;

        this.setEnd(end);
        this.setStart(start);
        this.setY(y);
        // console.log(y);
        let hackColor = '#e8ca15';
        if (y > 100) {
            hackColor = '#dd373a';
        }
        if (y > 400) {
            hackColor = '#ce3edd';
        }
        if (y > 700) {
            hackColor = '#73eeed';
        }
        if (y > 1000) {
            hackColor = '#ade859';
        }
        this.setColor(hackColor);
    }

    @observable name;

    @action setName(name) {
        this.name = name;
    }

    @observable blockLeft;

    @action setBlockLeft(blockLeft) {
        this.blockLeft = blockLeft;
    }

    @observable blockRight;

    @action setBlockRight(blockRight) {
        this.blockRight = blockRight;
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

    @observable start;

    @action setStart(start, updateNeighbor = true) {
        this.start = Math.round(start);
        if (updateNeighbor && this.blockLeft) {
            this.blockLeft.setEnd(this.start, false);
        }
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

    @action
    moveBy(deltaX, deltaY, updateNeighbor = true) {
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

    @computed get width() {
        let time = (this.end - this.start) / this.viewport.width;
        if (time < 0) {
            time = 0;
        }

        return {
            px: time * this.ui.width,
            time,
        };
    }

};
