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
        this.end = end;
    }

    @observable start
    @action setStart(start) {
        this.start = start;
    }

    @observable y
    @action setY(y) {
        this.y = y;
    }

    @computed get width() {
        console.log(this.ui.width);
        console.log((this.end - this.start) / this.viewport.width);
        return ((this.end - this.start) / this.viewport.width) * this.ui.width;
    }

};
