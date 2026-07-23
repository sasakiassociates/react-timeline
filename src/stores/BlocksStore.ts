/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import { action, computed, makeObservable, observable } from 'mobx';

import config from '../config';
import { Timespan, noop } from '../types';
import TimelineStore from './TimelineStore';
import BlockState from '../models/BlockState';
import Block from '../components/Block/Block';


export default class BlockStore {

    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        this.root = root;
        makeObservable(this);
    }

    onResortClick: any = noop;

    setOnResortClick(onResortClick: () => any) {
        this.onResortClick = onResortClick;
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

    @observable
    isOutOfSort: boolean = true;

    @action
    setAsSorted(isOutOfSort = false) {
        this.isOutOfSort = isOutOfSort;
    }
    @action
    remove(block: BlockState) {
        this.all.splice(this.all.indexOf(block), 1);
    }

    @computed
    get extent() {
        let { left, right, bottom, top } = this.root.viewport;

        this.all.forEach(block => {
            const proxy = block.proxy as any;
            const start = proxy.getStartTime ? proxy.getStartTime() : block.timespan.start;
            const end = proxy.getEndTime ? proxy.getEndTime() : block.timespan.end;
            if (start < left) left = start;
            if (end > right) right = end;
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
    get groupNames() {
        return [...Object.keys(this.groupedAll)]//.filter((name)=> {return name!=='nan'});
    }

    @computed
    get extentByGroupName() {
        const results = {}
        Object.keys(this.groupedAll).forEach((key) => {
            const _blocks = this.groupedAll[key] //@ts-ignore
            const maxBlockNameLength = Math.max(..._blocks.map((block) => block.proxy.project.name.length))
            // Use direct access methods to avoid expensive timespan getter
            const minLeft = Math.min(..._blocks.map((block) => {
                const p = block.proxy as any; return p.getStartTime ? p.getStartTime() : block.timespan.start;
            }))
            const maxRight = Math.max(..._blocks.map((block) => {
                const p = block.proxy as any; return p.getEndTime ? p.getEndTime() : block.timespan.end;
            }))
            const minY = Math.min(..._blocks.map((block) => block.y))
            const maxY = Math.max(..._blocks.map((block) => block.y))
            const gStyle = {
                width: `${this.root.spaces.timeToPx(maxRight) - this.root.spaces.timeToPx(minLeft) + (maxBlockNameLength * 6.2)}px`, // 6.2 here is an estimate of charecter width, which depends on typeface etc. 
                height: `${(_blocks.length + 1) * (config.blockHeight + config.rowPadding) + 5}px`,
                left: `${this.root.spaces.timeToPx(minLeft) - 5}px`,
                top: minY - 20,
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

    @action
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
    setGroupBy(groupBy: string | undefined) {
        this.groupBy = groupBy;
    }

    @computed
    get sortDefault(): BlockState[] {
        return this.all.slice().sort((a: BlockState, b: BlockState) => this.sortByName(a, b))
    }

    sortDefaultTime(): BlockState[] {
        return this.all.slice().sort((a: BlockState, b: BlockState) => this.sortBlocks(a, b))
    }


    @computed
    get groupedAll(): { [key: string]: BlockState[] } {
        if (!this.groupBy) return { "nan": this.all }
        // Copy before sorting — .sort() mutates in place, and this.all is
        // @observable. Sorting it in-place inside a @computed is a MobX
        // anti-pattern that triggers cascading observer notifications.
        //
        // NOTE: setGroupName() side effects removed from this computed.
        // Calling @action inside @computed is a MobX anti-pattern that
        // causes cascading re-computations. Group names are set in
        // sortByGroup() action instead.
        const groupd = this.all.slice().sort((a: BlockState, b: BlockState) => this.sortBlocks(a, b)).reduce((reslt, blck) => {
            // Use direct access to avoid expensive attrProps getter
            const proxy = blck.proxy as any;
            const groupName = proxy.getAttrValue ? proxy.getAttrValue(this.groupBy!) : blck.attrProps[this.groupBy!];
            if (Object.keys(reslt).includes(groupName)) {
                reslt[groupName].push(blck)
            } else {
                reslt[groupName] = [blck]
            }
            return reslt
        }, {} as { [key: string]: BlockState[] })
        return groupd
    }

    // sort the blocks by the assigned y s and iterate through that
    // using the sort's index at each iteration look at 
    // the start of the block, and compare to the previous block using the 
    // sorted index (add one), and the start time should be greater or equal 
    // then look at the next block in the sorted index, the start time should be less or equal
    // if either the case didn't happen, add 1 to a number
    // return that number, meaning it is out of sort 

    @computed
    get blockYIndecies() {
        if (this.blockYs.length <= 1) return; 
        if (this.groupBy) {

            let grppRes = 0;
            // NOTE: setGroupName() side effect removed — calling @action inside
            // @computed is a MobX anti-pattern that causes cascading recomputations.
            const grpd = this.all.reduce((reslt, blck) => {
                // Use direct access to avoid expensive attrProps getter
                const proxy = blck.proxy as any;
                const groupName = proxy.getAttrValue ? proxy.getAttrValue(this.groupBy!) : blck.attrProps[this.groupBy!];
                if (Object.keys(reslt).includes(groupName)) {
                    reslt[groupName].push(blck)
                } else {
                    reslt[groupName] = [blck]
                }
                return reslt
            }, {} as { [key: string]: BlockState[] })

            // Precompute each group's min start time once (O(N) total) instead
            // of calling Math.min(...map()) inside a sort comparator (which
            // would be O(G×N×log G)). Also removed the wasted .sort().sort()
            // chain — the second .sort() (alphabetical) overwrote the first
            // sort entirely, making the first sort's work completely discarded.
            const groupMinStarts: { [key: string]: number } = {};
            for (const key of Object.keys(grpd)) {
                groupMinStarts[key] = Math.min(...grpd[key].map((blc) => blc.timespan.start));
            }

            const overSortedGroups = Object.keys(grpd).sort((a: string, b: string) => {
                // Sort by earliest start time so groups that start earlier
                // show up higher in the timeline (requested by uncle TayTay).
                return (groupMinStarts[a] > groupMinStarts[b]) ? 1 : -1
            })
            
            const overGroups = overSortedGroups.reduce((res, groupKey, i, allGroups) => {
                const groupBlocksSortByY = grpd[groupKey]
                const sortedGroupBlocksSortByY = groupBlocksSortByY.slice().sort((a, b) => {
                    return a.y === b.y ? 0 : a.y < b.y ? -1 : 1;
                })
                const withinBlocksRes = sortedGroupBlocksSortByY.reduce((resU, curntB, curentIndx, allBlocks) => {
                    if (allBlocks.length === 1) { return resU }
                    else if (curentIndx === 0) {
                        // only compare with next in the list...
                        const nextB = allBlocks[curentIndx + 1];
                        if (nextB.timespan.start < curntB.timespan.start) { resU = resU + 1; }
                        return resU;
                    } else
                    // if (curentIndx === allBlocks.length - 1) 
                    {
                        // only compare to previous 
                        const prevB = allBlocks[curentIndx - 1];
                        if (curntB.timespan.start < prevB.timespan.start) { resU = resU + 1; }
                        return resU;
                    }
                }, 0)
                res = res + withinBlocksRes;
                return res;
            }, 0)
            grppRes = grppRes + overGroups
            return grppRes;
        }

        else {
            const sortedByDefault = [...this.all]
                .sort((a, b) => {
                    return a.timespan.start === b.timespan.start ? 0 : a.timespan.start < b.timespan.start ? -1 : 1;
                })

            return sortedByDefault.reduce((resU, curntB, curentIndx, allBlocks) => {
                if (curentIndx === 0) {
                    // only compare with next in the list...
                    const nextB = allBlocks[curentIndx + 1];
                    if (nextB.y <= curntB.y) { resU = resU + 1; }
                    return resU
                } else if (curentIndx === allBlocks.length - 1) {
                    // only compare to previous 
                    const prevB = allBlocks[curentIndx - 1];
                    if (curntB.y <= prevB.y) { resU = resU + 1; }
                    return resU
                } else {
                    const nextB = allBlocks[curentIndx + 1];
                    const prevB = allBlocks[curentIndx - 1];
                    if ((nextB.y <= curntB.y) || (curntB.y <= prevB.y)) { resU = resU + 1; }
                    return resU
                }
            }, 0)
        }
    }

    @computed
    get blockYs() {
        return this.all.map((blck) => blck.y)
    }

    @computed
    get outOfSyncd() {
        return (this.blockYIndecies === 0) ? false : true;
    }

    @action
    sortByGroup() {
        const timelineBlockHeight = config.blockHeight; // px
        const timelineRowPadding = config.rowPadding; // px
        const timelineBlockGroupPadding = config.blockHeight * 4; // px

        // CRITICAL PERF: Precompute all block data using direct access methods
        // on DashiBlockProxy that bypass the expensive attrProps and timespan
        // getters. Those getters create new objects on every access (iterating
        // all 30+ project attributes for attrProps, creating {start,end} for
        // timespan). Sort comparators would call them O(N log N) times.
        // By precomputing once with direct access, we reduce to exactly N calls.
        const blockData = this.all.map(blck => {
            const proxy = blck.proxy as any;
            return {
                block: blck,
                // Use direct access if available (DashiBlockProxy), fall back to attrProps
                groupName: this.groupBy ? (proxy.getAttrValue ? proxy.getAttrValue(this.groupBy) : blck.attrProps[this.groupBy]) as string : 'nan',
                // Use direct access if available, fall back to timespan
                start: proxy.getStartTime ? proxy.getStartTime() : blck.timespan.start,
            };
        });

        // Sort once by start time (used for within-group ordering)
        blockData.sort((a, b) => a.start === b.start ? 0 : a.start < b.start ? -1 : 1);

        // Group blocks by groupName
        const grpd: { [key: string]: typeof blockData } = {};
        for (const bd of blockData) {
            if (!grpd[bd.groupName]) {
                grpd[bd.groupName] = [];
                bd.block.setGroupName(bd.groupName);
            }
            grpd[bd.groupName].push(bd);
        }

        // Precompute each group's min start time
        const groupMinStarts: { [key: string]: number } = {};
        for (const key of Object.keys(grpd)) {
            groupMinStarts[key] = Math.min(...grpd[key].map(bd => bd.start));
        }

        // Sort groups by earliest start time, then assign Y positions
        let _gi = 0;
        Object.keys(grpd).sort((a: string, b: string) => {
            return (groupMinStarts[a] > groupMinStarts[b]) ? 1 : -1;
        }).forEach((grp, g_ig) => {
            const groupBlocks = grpd[grp];
            groupBlocks.forEach((bd, i__) => {
                bd.block.setY((_gi * (timelineBlockHeight + timelineRowPadding)) + ((i__) * (timelineBlockHeight + timelineRowPadding)) + ((g_ig) * timelineBlockGroupPadding));
            });
            _gi = _gi + groupBlocks.length;
        });
    }

    @action
    triggerDefaultSort() {
        const timelineBlockHeight = config.blockHeight; // px
        const timelineRowPadding = config.rowPadding; // px

        this.sortDefault.forEach((_block, __i) => {
            _block.setY(__i * (timelineBlockHeight + timelineRowPadding))
        })
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
    preventSorting(sort = true) {
        this.sortingPrevented = sort
    }

}
