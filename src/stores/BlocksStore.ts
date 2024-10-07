/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, computed, observable } from 'mobx';

import config from '../config';
import { Timespan, noop } from '../types';
import TimelineStore from './TimelineStore';
import BlockState from '../models/BlockState';


export default class BlockStore {

    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        this.root = root;
    }

    createBlock: any = noop;

    setCreateBlock(createBlock: (t: Timespan) => any) {
        this.createBlock = createBlock;
    }

    @observable 
    all: BlockState[] = [];

    @action
    add(block: BlockState) {
        this.all.push(block);
    }

    @action 
    remove(block: BlockState) {
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

    @computed
    get visible() {
        return this.all.filter(block => block.visible);
    }

    select(block?: BlockState) {
        this.selected.forEach(block => block.setSelected(false));

        if (block) {
            block.setSelected(true);
        }
    }

    getBlockWidth(block: BlockState): number {
        let time = (block.timespan.end - block.timespan.start) / this.root.viewport.width;
        if (time < 0) {
            time = 0;
        }

        return this.root.ui.width * time;
    }

    canShowResizeHandle(width: number): boolean {
        return width > config.resizeHandleWidth * 3;
    }

    @observable
    groupBy: Object[]

    @action
    setGroupBy(groupBy: Object[]){
        this.groupBy = groupBy;
    }

    sortByGroup() {
        
    }

}
