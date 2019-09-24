/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, observable } from 'mobx';


export default class BlockStore {

    constructor(parent) {
        this.parent = parent;
    }


    @observable blocks = [];

    @action addBlock(block) {
        this.blocks.push(block);
    }

}
