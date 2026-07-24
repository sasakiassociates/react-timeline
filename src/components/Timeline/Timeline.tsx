/*
 * Timeline
 */

import { observer } from 'mobx-react';
import React, { useEffect, useMemo, ReactNode, useRef  } from 'react';
import { runInAction, reaction } from 'mobx';

import Calendar from '../Calendar/Calendar';
import Editor from '../Editor/Editor';
import Navigator from '../Navigator/Navigator';
import TimelineStore from '../../stores/TimelineStore';
import { Timespan, noop } from '../../types';
import { TimelineContext, useTimeline } from '../../context';


export type TimelineProps = {
    children?: ReactNode;
    startYear?: number;
    onCreateBlock?: (timespan: Timespan) => any;
    onCalendarClick?: (value: number) => any;
    customSpacing?: Object[];
    groupBy?: Object[];
    timeline?: TimelineStore;
    /**
     * When false, disables framer-motion layout animations on all blocks,
     * labels, and group borders. This prevents the N+2G simultaneous layout
     * animation storm that freezes the app when groupBy changes.
     *
     * Default: true (preserves existing behavior).
     */
    animate?: boolean;
};

export default observer(function Timeline(props: TimelineProps) {
    const { children, onCreateBlock = noop, onCalendarClick = noop, startYear, customSpacing, groupBy, timeline, animate = true } = props;

    const context =  
    // timeline 
    // || 
    // useMemo<TimelineStore>(()=> new TimelineStore(),[])
    // useTimeline()
     // we have been doing this wrong this entire time??!!
     useMemo<TimelineStore>(() => {
        return timeline || useTimeline()
     }, [timeline]);

    const groupByFieldName = useRef<string>();

    useEffect(() => {
        // @ts-expect-error: stores does not exist on window
        window.timeline = context;
    }, [context]);

    useEffect(() => () => context.ui.clearEvents(), [context.ui]);
    useEffect(() => startYear !== undefined && context.spaces.setStartYear(startYear), [context.spaces, startYear]);

    useEffect(() => context.blocks.setCreateBlock(onCreateBlock), [context.blocks, onCreateBlock]);
    useEffect(() => context.ui.setCalendarClick(onCalendarClick), [context.ui, onCalendarClick]);
    useEffect(() => {
        if (customSpacing !== undefined) context.spaces.setCustomSpaces(customSpacing)}, [context.spaces, customSpacing]);
   
   
    // Sync the animate prop into the store so Block/Editor components can read it.
    useEffect(() => {
        context.setAnimate(animate);
    }, [context, animate]);

    // Single consolidated effect for groupBy changes.
    // Replaces the previous three separate useEffects that caused sortByGroup()
    // to fire 2-3 times per groupBy change (via ref mutation + dependent effects).
    // Wrapped in runInAction to batch setGroupBy + sortByGroup + setAsSorted
    // into a single MobX reaction cycle, preventing N individual block.setY()
    // reactions from firing as separate render cycles.
    useEffect(() => {
        if (!groupBy || !Object.keys(groupBy).includes('fieldName') || !groupBy['fieldName']) {
            groupByFieldName.current = undefined;
            runInAction(() => {
                context.blocks.setGroupBy(undefined);
                context.blocks.sortByGroup();
                context.blocks.setAsSorted();
            });
            return;
        }

        const fieldName = groupBy['fieldName'] as string;
        groupByFieldName.current = fieldName;
        runInAction(() => {
            context.blocks.setGroupBy(fieldName);
            context.blocks.sortByGroup();
            context.blocks.setAsSorted();
        });
    }, [context.blocks, groupBy]);

    // Auto re-sort when blocks become out of sync (e.g., after a scenario
    // loads new blocks with default Y=0 while the Timeline stays mounted).
    // The groupBy effect above only fires on mount or when groupBy changes —
    // it does NOT fire when new blocks are added to an existing mounted
    // Timeline. This reaction watches the `outOfSyncd` computed (which detects
    // mis-ordered block Y positions) and triggers sortByGroup() when needed.
    // The 300ms delay debounces rapid block additions/removals during scenario
    // loading so sortByGroup() fires once after all blocks settle, not per
    // individual block add.
    useEffect(() => {
        const disposer = reaction(
            () => context.blocks.all.length > 1 && context.blocks.outOfSyncd,
            (needsSort) => {
                if (needsSort) {
                    runInAction(() => {
                        context.blocks.sortByGroup();
                        context.blocks.setAsSorted();
                    });
                }
            },
            { delay: 300 }
        );
        return () => disposer();
    }, [context.blocks]);
   
    return (
        <TimelineContext.Provider value={context}>
            <div 
                className={`
                    ReactTimeline__Timeline
                    ${context.ui.cursor}
                `}
                ref={e => context.ui.setElement(e)}
            >
                <Calendar />
                <Editor>
                    {children}
                </Editor>
                <Navigator />
            </div>
        </TimelineContext.Provider>
    );
});
