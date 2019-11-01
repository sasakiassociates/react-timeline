/**
 * Block
 *
 * Stores information regarding time blocks.
 */

import { action, observable } from 'mobx';

import uuidv4 from 'uuid/v4';


export default class Block {

    constructor(start, end, y) {
        this.id = uuidv4();

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

};
