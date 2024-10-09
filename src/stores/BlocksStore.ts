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
import Block from '../components/Block/Block';


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
    groupBy: string | null = null;

    @action
    setGroupBy(groupBy: string | null){
        this.groupBy = groupBy;
    }

    @computed
    sortDefault(): BlockState[] {
        return this.all.sort((a: BlockState, b: BlockState)=>this.sortByName(a, b))
    }

    sortByGroup() {
            const timelineBlockHeight = 20; // px
            const timelineRowPadding = 2; // px
            const timelineBlockGroupPadding = 50; // px

        if (this.groupBy){
            const groupd = this.sortDefault().reduce((reslt,blck)=>{
                if (Object.keys(reslt).includes(blck[this.groupBy])) { 
                    reslt[blck[this.groupBy]].push(blck)
                } else { 
                    blck.setGroupName(blck[this.groupBy])
                    reslt[blck[this.groupBy]] = [blck]
                }
                
                let { left, right, bottom, top } = this.root.viewport;

                reslt[blck[this.groupBy]].forEach(block => {
                        if (block.timespan.start < left) left = block.timespan.start;
                        if (block.timespan.end > right) right = block.timespan.end;
                        if (block.y > bottom) bottom = block.y;
                        if (block.y < top) top = block.y;
                    });

                    reslt[blck[this.groupBy]].filter((blc)=>blc.groupName)[0].setGroupBound({
                        left,
                        right,
                        top,
                        bottom,
                        width: Math.abs(left - right),
                        height: reslt[blck[this.groupBy]].length * config.blockHeight + timelineBlockGroupPadding / 2,
                    })   

                return reslt
            }, {})
            
            let _i = 0
            const sortedGroup = Object.keys(groupd).sort().reduce(function (result, key) {
                result[key] = groupd[key];
                return result;
            }, {});

            Object.keys(sortedGroup).forEach((grp, g_i)=>{
                const grp_len = sortedGroup[grp].length
                sortedGroup[grp].sort((a, b)=> this.sortBlocks(a, b)).forEach((block, i)=>{
                    block.setY((_i  * (timelineBlockHeight + timelineRowPadding) )+ ((i + 1) * (timelineBlockHeight + timelineRowPadding)) + ((g_i + 1) * timelineBlockGroupPadding))
                })
                _i = _i + grp_len
            })
        } else { 
            // if no groupby is passed just go by default
            this.sortDefault().forEach((_block, __i)=>{
                _block.setY(__i  * (timelineBlockHeight + timelineRowPadding) )
            } )
        }
    }


    sortBlocks(a: BlockState, b: BlockState) { 
        //@ts-ignore
        return a.timespan.start === b.timespan.start ? 0 : a.timespan.start < b.timespan.start ? -1 : 1;
    }

    sortByName(a: BlockState, b: BlockState) { 
        //@ts-ignore
        return a.name === b.name ? 0 : a.name > b.name ? -1 : 1;
    }
}
