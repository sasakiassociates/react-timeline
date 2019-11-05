/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, observable } from 'mobx';

import Block from '../types/block';


export default class BlockStore {

    constructor(props, parent, viewport) {
        this.parent = parent;
    }

    @observable elements = [];

    @action createBlock(start, end, y) {
        this.push(new Block(start, end, y, this.parent.ui, this.parent.viewport));
    }

    @action push(block) {
        this.elements.push(block);
    }


}
