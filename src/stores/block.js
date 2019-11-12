/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, computed, observable } from 'mobx';

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

    @computed get selected() {
        return this.elements.filter(block => block.selected);
    }

    @computed get visible() {
        const { viewport } = this.root;

        return this.elements.filter(block => (
            (
                block.start >= viewport.left
                && block.start <= viewport.right
            ) || (
                block.end >= viewport.left
                && block.end <= viewport.right
            )
        ));
    }

}
