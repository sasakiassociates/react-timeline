/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, computed, observable } from 'mobx';

import TimelineStore from './TimelineStore';
import BlockProxy from '../models/BlockProxy';


export default class BlockStore {

    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        this.root = root;
    }

    @observable 
    all: BlockProxy[] = [];

    @action
    add(block: BlockProxy) {
        this.all.push(block);
    }

    @action 
    remove(block: BlockProxy) {
        this.all.splice(this.all.indexOf(block), 1);
    }

    @computed 
    get extent() {
        let { left, right, bottom, top } = this.root.viewport;

        this.all.forEach(block => {
            if (block.timespan.start < left) left = block.timespan.start;
            if (block.timespan.end > right) right = block.timespan.end;
            if (block.y > bottom) bottom = block.y;
            if (block.y < top) top = block.y;
        });

        return {
            left,
            right,
            top,
            bottom,
            width: Math.abs(left - right),
            height: Math.abs(top - bottom),
        };
    }

    @computed 
    get selected() {
        return this.all.filter(block => block.selected);
    }

    select(block?: BlockProxy) {
        this.all.forEach(block => block.setSelected(false));

        if (block) {
            block.setSelected(true);
        }
    }

}
