/**
 * Block
 *
 * Stores information regarding time blocks.
 */

import uuidv4 from 'uuid/v4';
import { action, computed, observable } from 'mobx';


export default class Block {

    constructor(start, end, y, ui, viewport) {
        this.id = uuidv4();
        this.ui = ui;
        this.viewport = viewport;

        this.setEnd(end);
        this.setStart(start);
        this.setY(y);
    }


    @observable end
    @action setEnd(end) {
        if (end - this.start < 1) {
            end = this.start + 1;
        }

        this.end = Math.round(end);
    }

    @observable selected = false;
    @action setSelected(selected = true) {
        this.selected = selected;
    }

    @observable start
    @action setStart(start) {
        if (this.end - this.start < 1) {
            start = this.end - 1;
        }

        this.start = Math.round(start);
    }

    @observable y
    @action setY(y) {
        this.y = y;
    }

    @computed get width() {
        const time = (this.end - this.start) / this.viewport.width;

        return {
            px: time * this.ui.width,
            time,
        };
    }

};
