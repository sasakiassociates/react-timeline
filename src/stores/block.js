/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, observable } from 'mobx';

import Block from '../types/block';


export default class BlockStore {

    constructor(root, props) {
        this.root = root;
    }

    @observable elements = [];

    @action createBlock(start, end, y) {
        this.elements.push(new Block(
            start, end, y, this.root.ui, this.root.viewport
        ));
    }

}
