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
    get groupNames() {
        return [...Object.keys(this.groupedAll)]//.filter((name)=> {return name!=='nan'});
    }

    @computed
    get extentByGroupName() {
        const results = {}
        Object.keys(this.groupedAll).forEach((key) => {
            const _blocks = this.groupedAll[key] //@ts-ignore maybe bring out the name out of the proxy similar to how it is done for color or selected ...
            const maxBlockNameLength = Math.max(..._blocks.map((block) => block.proxy.project.name.length))
            const minLeft = Math.min(..._blocks.map((block) => block.timespan.start))
            const maxRight = Math.max(..._blocks.map((block) => block.timespan.end))
            const minY = Math.min(..._blocks.map((block) => block.y))
            const maxY = Math.max(..._blocks.map((block) => block.y))
            const gStyle = {
                width: `${this.root.spaces.timeToPx(maxRight) - this.root.spaces.timeToPx(minLeft) + (maxBlockNameLength * 6.2)}px`, // 6.2 here is an estimate of charecter width, which depends on typeface etc. 
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
    setGroupBy(groupBy: string | undefined) {
        this.groupBy = groupBy;
    }

    @computed
    get sortDefault(): BlockState[] {
        return this.all.sort((a: BlockState, b: BlockState) => this.sortByName(a, b))
    }

    sortDefaultTime(): BlockState[] {
        return this.all.sort((a: BlockState, b: BlockState) => this.sortBlocks(a, b))
    }


    @computed
    get groupedAll(): { [key: string]: BlockState[] } {
        if (!this.groupBy) return { "nan": this.all }
        const groupd = this.sortDefaultTime().reduce((reslt, blck) => {
            if (Object.keys(reslt).includes(blck.attrProps[this.groupBy])) {
                reslt[blck.attrProps[this.groupBy]].push(blck)
            } else {
                blck.setGroupName(blck.attrProps[this.groupBy])
                reslt[blck.attrProps[this.groupBy]] = [blck]
            }
            return reslt
        }, {})
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
        if (this.groupBy) {
            let grppRes = 0;
            // need the check to happen for/per group meaning it wants to add them up...
            // const sortedByDefaultY = this.all
            // .sort((a, b) => {  //@ts-ignore
            //     return a.name === b.name ? 0 : a.name > b.name ? -1 : 1;})
            

            const grpd = this.all.reduce((reslt, blck) => {
                if (Object.keys(reslt).includes(blck.attrProps[this.groupBy])) {
                    reslt[blck.attrProps[this.groupBy]].push(blck)
                } else {
                    blck.setGroupName(blck.attrProps[this.groupBy])
                    reslt[blck.attrProps[this.groupBy]] = [blck]
                }
                return reslt
            }, {})

            console.log("groosospssps",grpd )

            const overSortedGroups = Object.keys(grpd).sort((a:string, b:string)=> {
                // this is to make sure groups that have starting time earlier show up higher in the time line (requested by uncle TayTay)
                // if decided against it just make it a pure sort() here
                const a_first_block = Math.min(...grpd[a].map((blc)=>blc.timespan.start))
                const b_first_block = Math.min(...grpd[b].map((blc)=>blc.timespan.start))
                return (a_first_block > b_first_block) ? 1 : -1
    
            }).sort()
            console.log("grppResgrppResgrppResgrppResgrppResgrppRes ",overSortedGroups)            
            const overGroups = overSortedGroups.reduce((res, groupKey,i, allGroups)=>{
                const groupBlocksSortByY = grpd[groupKey]
                    // console.log("groupBlocksSortByY",groupBlocksSortByY)
                    const sortedGroupBlocksSortByY =  groupBlocksSortByY.sort((a, b) => {
                    return a.y === b.y ? 0 : a.y < b.y ? -1 : 1;
                })
                // console.log("sortedGroupBlocksSortByY",sortedGroupBlocksSortByY)
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
                    // else {
                    //     const nextB = allBlocks[curentIndx + 1];
                    //     const prevB = allBlocks[curentIndx - 1];
                    //     if ((nextB.timespan.start > curntB.timespan.start) || (curntB.timespan.start < prevB.timespan.start)) { resU = resU + 1; }
                    //     return resU;
                    // }
        
                    
                }, 0)
                res = res + withinBlocksRes;
                return res;
            },0)

            // if (overGroups > 0) {
            console.log("overGroups", overGroups)
                grppRes = grppRes + overGroups
            // }
            return grppRes;
            // console.log("sorted by y ", sortedByDefaultY, sortedByDefaultY.map((s)=>s.y))
            // return sortedByDefaultY.reduce((resU, curntB, curentIndx, allBlocks) => {

            //     if (curentIndx === 0) {
            //         // only compare with next in the list...
            //         const nextB = allBlocks[curentIndx + 1];
            //         if (nextB.timespan.start < curntB.timespan.start) { resU = resU + 1; }
            //         return resU
            //     } else if (curentIndx === allBlocks.length - 1) {
            //         // only compare to previous 
            //         const prevB = allBlocks[curentIndx - 1];
            //         if (curntB.timespan.start < prevB.timespan.start) { resU = resU + 1; }
            //         return resU
            //     } else {
            //         const nextB = allBlocks[curentIndx + 1];
            //         const prevB = allBlocks[curentIndx - 1];
            //         if ((nextB.timespan.start > curntB.timespan.start) || (curntB.timespan.start < prevB.timespan.start)) { resU = resU + 1; }
            //         return resU
            //     }
    
                
            // }, 0)

        }


        else {const sortedByDefault = this.all
        // .sort((a, b) => {  //@ts-ignore
        //     return a.name === b.name ? 0 : a.name > b.name ? -1 : 1;})
        .sort((a, b) => {
            return a.timespan.start === b.timespan.start ? 0 : a.timespan.start < b.timespan.start ? -1 : 1;
        })
        // console.log("sorted by defayl ", sortedByDefault, sortedByDefault.map((s)=>s.y))
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

            
        }, 0)}
    }

    @computed
    get blockYs() {
        return this.all.map((blck) => blck.y)
    }


    @computed
    get outOfSyncd() {
        return (this.blockYIndecies === 0) ? false : true;
    }

    sortByGroup() {
        const timelineBlockHeight = config.blockHeight; // px
        const timelineRowPadding = config.rowPadding; // px
        const timelineBlockGroupPadding = config.blockHeight * 4; // px
        let groupd: any;
        if (!this.groupBy) { groupd = { "nan": this.all } }
        else if (this.groupBy) {
            groupd = this.sortDefaultTime().sort(this.sortByName).reduce((reslt, blck) => {
                if (Object.keys(reslt).includes(blck.attrProps[this.groupBy])) {
                    reslt[blck.attrProps[this.groupBy]].push(blck)
                } else {
                    blck.setGroupName(blck.attrProps[this.groupBy])
                    reslt[blck.attrProps[this.groupBy]] = [blck]
                }
                return reslt
            }, {})
        }
        let _gi = 0

        const grpd = groupd;
        // console.log("this.groupedAll",this.groupedAll)
        // if (this.sortingPrevented) return;
        const sortedGroup = Object.keys(grpd)
            .sort()
            .reduce(function (result, key) {
                result[key] = grpd[key];
                return result;
            }, {});
        Object.keys(sortedGroup).sort((a:string, b:string)=> {
            // this is to make sure groups that have starting time earlier show up higher in the time line (requested by uncle TayTay)
            // if decided against it just make it a pure sort() here
            const a_first_block = Math.min(...groupd[a].map((blc)=>blc.timespan.start))
            const b_first_block = Math.min(...groupd[b].map((blc)=>blc.timespan.start))
            return (a_first_block > b_first_block) ? 1 : -1

        }).sort().forEach((grp, g_ig) => {
            const ggrp_len = sortedGroup[grp].length
            sortedGroup[grp].sort((a, b) => this.sortBlocks(a, b)).forEach((block, i__) => {
                block.setY((_gi * (timelineBlockHeight + timelineRowPadding)) + ((i__) * (timelineBlockHeight + timelineRowPadding)) + ((g_ig) * timelineBlockGroupPadding));
            })
            _gi = _gi + ggrp_len
        })


        //     this.sortDefaultTime().forEach((_block, __i)=>{
        //     _block.setY(__i  * (timelineBlockHeight + timelineRowPadding) )
        // } )


        // if (this.groupBy){
        //     if (this.root.spaces.customSpaces && this.root.spaces.customSpaces.length > 0) {
        //         this.root.spaces.customSpaces.forEach((spaceCustom)=>{
        //             const space = spaceCustom['spaces']
        // let _i = 0      
        // let _i_p = 0                  
        //             Object.keys(space).forEach((spcValue, ii)=>{
        //                 const phaseBlocks = this.sortDefault.filter((block)=>{
        //                     // console.log("block in phase blocks sorting", block)
        //                     //@ts-ignore
        //                     return block.proxy.project[spaceCustom['blockSpaceFieldName']] === spcValue
        //                 })

        //                 const phaseHeightLength = phaseBlocks.length;
        //                 const inGroupPhaseBlocks = phaseBlocks.filter((blk)=>{
        //                     return blk[this.groupBy] !== 'nan';
        //                 }) 

        //                 const outGroupPhaseBlocks = phaseBlocks.filter((blk)=>{
        //                     return blk[this.groupBy] === 'nan';
        //                 }) 
        //                 const ingroupLength = inGroupPhaseBlocks.length 
        //                 const ungroupLength = outGroupPhaseBlocks.length 
        //                 const groupd: {[key:string]: BlockState[]} = inGroupPhaseBlocks.reduce((reslt,blck)=>{
        //                     if (Object.keys(reslt).includes(blck[this.groupBy])) { 
        //                         reslt[blck[this.groupBy]].push(blck)
        //                     } else { 
        //                         blck.setGroupName(blck[this.groupBy])
        //                         reslt[blck[this.groupBy]] = [blck]
        //                     }
        //                     return reslt
        //                 }, {})



        //                 const sortedGroup = Object.keys(groupd)
        //                 // .sort((a:string, b:string)=> {
        //                 //     // this is to make sure groups that have starting time earlier show up higher in the time line (requested by uncle TayTay)
        //                 //     // if decided against it just make it a pure sort() here
        //                 //     const a_first_block = Math.min(...groupd[a].map((blc)=>blc.timespan.start))
        //                 //     const b_first_block = Math.min(...groupd[b].map((blc)=>blc.timespan.start))
        //                 //     return (a_first_block > b_first_block) ? 1 : -1

        //                 // })
        //                 .sort()
        // .reduce(function (result, key) {
        //     result[key] = groupd[key];
        //     return result;
        // }, {});
        //                 Object.keys(sortedGroup).forEach((grp, g_i)=>{
        //                     const grp_len = sortedGroup[grp].length
        //                     sortedGroup[grp].sort((a, b)=> this.sortBlocks(a, b)).forEach((block, i)=>{
        //                         block.setY((  _i  * (timelineBlockHeight + timelineRowPadding) )+ ((i ) * (timelineBlockHeight + timelineRowPadding)) + ((_i_p + g_i) * timelineBlockGroupPadding))
        //                     })
        //                     _i = _i + grp_len
        //                 })
        //                 _i_p = _i_p + Object.keys(sortedGroup).length;
        //                 outGroupPhaseBlocks.sort((a, b)=> this.sortBlocks(a, b)).forEach((block, ui)=>{
        //                     block.setY( (_i  * (timelineBlockHeight + timelineRowPadding) )+ (_i_p * timelineBlockGroupPadding) + ((ui) * (timelineBlockHeight + timelineRowPadding)))

        //                 })
        //                 _i_p = _i_p + 1
        //                 _i = _i + ungroupLength;
        //             })



        //         })
        //     } else { // this is when there is a groupby but there is no custom spacing (phasing ...)
        //         let _gi = 0  
        //         const groupd: {[key:string]: BlockState[]} = this.sortDefault.reduce((reslt,blck)=>{
        //         //     console.log("block in else blocks sorting", blck,blck.attrProps.get(this.groupBy))

        //         //    console.log( Object.values(blck.attrProps.get(this.groupBy).byPeriodValues))


        //             if (Object.keys(reslt).includes(blck.attrProps.get(this.groupBy).exValue)) { 
        //                 reslt[blck[this.groupBy]].push(blck)
        //             } else { 
        //                 blck.setGroupName(blck[this.groupBy])
        //                 reslt[blck[this.groupBy]] = [blck]
        //             }
        //             return reslt
        //         }, {})



        //         const sortedGroup = Object.keys(groupd)
                // .sort((a:string, b:string)=> {
                //     // this is to make sure groups that have starting time earlier show up higher in the time line (requested by uncle TayTay)
                //     // if decided against it just make it a pure sort() here
                //     const a_first_block = Math.min(...groupd[a].map((blc)=>blc.timespan.start))
                //     const b_first_block = Math.min(...groupd[b].map((blc)=>blc.timespan.start))
                //     return (a_first_block > b_first_block) ? 1 : -1

                // })
        // .sort()
        // .reduce(function (result, key) {
        //     result[key] = groupd[key];
        //     return result;
        // }, {});
        // Object.keys(sortedGroup).forEach((grp, g_ig)=>{
        //     const ggrp_len = sortedGroup[grp].length
        //     sortedGroup[grp].sort((a, b)=> this.sortBlocks(a, b)).forEach((block, i__)=>{
        //         block.setY((  _gi  * (timelineBlockHeight + timelineRowPadding) )+ ((i__) * (timelineBlockHeight + timelineRowPadding)) + ((g_ig) * timelineBlockGroupPadding))
        //     })
        //     _gi = _gi + ggrp_len
        // })


        //     }

        // } else { 
        //     // if no groupby is passed just go by default
        //     this.sortDefault.forEach((_block, __i)=>{
        //         _block.setY(__i  * (timelineBlockHeight + timelineRowPadding) )
        //     } )
        // }
    }

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
