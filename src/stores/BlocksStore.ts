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
    get groupNames(){
        return [...Object.keys(this.groupedAll)]//.filter((name)=> {return name!=='nan'});
    }

    @computed
    get extentByGroupName() {
        const results = {}
        Object.keys(this.groupedAll).forEach((key)=>{
            const _blocks = this.groupedAll[key] //@ts-ignore maybe bring out the name out of the proxy similar to how it is done for color or selected ...
            const maxBlockNameLength = Math.max(..._blocks.map((block)=>block.proxy.project.name.length))
            const minLeft = Math.min(..._blocks.map((block)=>block.timespan.start))
            const maxRight = Math.max(..._blocks.map((block)=>block.timespan.end))
            const minY = Math.min(..._blocks.map((block)=>block.y))
            const maxY = Math.max(..._blocks.map((block)=>block.y))
            const gStyle = {
                width: `${this.root.spaces.timeToPx(maxRight ) - this.root.spaces.timeToPx(minLeft) + (maxBlockNameLength * 6.2)}px`, // 6.2 here is an estimate of charecter width, which depends on typeface etc. 
                height: `${(_blocks.length + 1) * (config.blockHeight + config.rowPadding)}px`,
                left: `${this.root.spaces.timeToPx(minLeft) - 5}px`,
                top: `${minY - this.root.viewport.top - 15}px`,
                background: undefined,
            };
                results[key] = 
                    {
                        'name': key,
                        'left': minLeft,
                        'top': minY,
                        'style': gStyle
                    }
        })
        return results;

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
    groupBy: string | undefined = undefined;

    @action
    setGroupBy(groupBy: string | undefined){
        this.groupBy = groupBy;
    }

    @computed
    get sortDefault(): BlockState[] {
        return this.all.sort((a: BlockState, b: BlockState)=>this.sortByName(a, b))
    }

    @computed
    sortDefaultTime(): BlockState[] {
        return this.all.sort((a: BlockState, b: BlockState)=>this.sortBlocks(a, b))
    }


    @computed 
    get groupedAll(): {[key:string]: BlockState[]} {
        if (!this.groupBy) return {"nan": this.all}
        const groupd = this.sortDefault.reduce((reslt,blck)=>{
            if (Object.keys(reslt).includes(blck[this.groupBy])) { 
                reslt[blck[this.groupBy]].push(blck)
            } else { 
                blck.setGroupName(blck[this.groupBy])
                reslt[blck[this.groupBy]] = [blck]
            }
            return reslt
        }, {})
        return groupd
    }

    sortByGroup() {
        const timelineBlockHeight = config.blockHeight; // px
        const timelineRowPadding = config.rowPadding; // px
        const timelineBlockGroupPadding = config.blockHeight * 4; // px

        if (this.sortingPrevented) return;
        if (this.groupBy){
            const groupd: {[key:string]: BlockState[]} = this.sortDefault.reduce((reslt,blck)=>{
                if (Object.keys(reslt).includes(blck[this.groupBy])) { 
                    reslt[blck[this.groupBy]].push(blck)
                } else { 
                    blck.setGroupName(blck[this.groupBy])
                    reslt[blck[this.groupBy]] = [blck]
                }
                return reslt
            }, {})
            
            let _i = 0
            const sortedGroup = Object.keys(groupd).sort((a:string, b:string)=> {
                // this is to make sure groups that have starting time earlier show up higher in the time line (requested by uncle TayTay)
                // if decided against it just make it a pure sort() here
                const a_first_block = Math.min(...groupd[a].map((blc)=>blc.timespan.start))
                const b_first_block = Math.min(...groupd[b].map((blc)=>blc.timespan.start))
                return (a_first_block > b_first_block) ? 1 : -1

            }).reduce(function (result, key) {
                result[key] = groupd[key];
                return result;
            }, {});

            Object.keys(sortedGroup).forEach((grp, g_i)=>{
                const grp_len = sortedGroup[grp].length
                sortedGroup[grp].sort((a, b)=> this.sortBlocks(a, b)).forEach((block, i)=>{
                    block.setY((_i  * (timelineBlockHeight + timelineRowPadding) )+ ((i ) * (timelineBlockHeight + timelineRowPadding)) + ((g_i ) * timelineBlockGroupPadding))
                })
                _i = _i + grp_len
            })
        } else { 
            // if no groupby is passed just go by default
            this.sortDefault.forEach((_block, __i)=>{
                _block.setY(__i  * (timelineBlockHeight + timelineRowPadding) )
            } )
        }
    }

    triggerDefaultSort() {
        const timelineBlockHeight = config.blockHeight; // px
        const timelineRowPadding = config.rowPadding; // px
            
        this.sortDefault.forEach((_block, __i)=>{
            _block.setY(__i  * (timelineBlockHeight + timelineRowPadding) )
        } )
    }

    sortBlocks(a: BlockState, b: BlockState) { 
        //@ts-ignore
        return a.timespan.start === b.timespan.start ? 0 : a.timespan.start < b.timespan.start ? -1 : 1;
    }

    sortByName(a: BlockState, b: BlockState) { 
        //@ts-ignore
        return a.name === b.name ? 0 : a.name > b.name ? -1 : 1;
    }


    @observable
    sortingPrevented: boolean = false

    @action
    preventSorting(sort=true){
        this.sortingPrevented = sort
    }

}
