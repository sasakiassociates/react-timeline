/*
 * Timeline
 */

import { observer } from 'mobx-react';
import React, { useEffect, useMemo, ReactNode  } from 'react';

import Calendar from '../Calendar/Calendar';
import Editor from '../Editor/Editor';
import Navigator from '../Navigator/Navigator';
import TimelineStore from '../../stores/TimelineStore';
import { Timespan, noop } from '../../types';
import { TimelineContext, useTimeline } from '../../context';
import time from '../../time';


export type TimelineProps = {
    children?: ReactNode;
    startYear?: number;
    onCreateBlock?: (timespan: Timespan) => any;
    onCalendarClick?: (value: number) => any;
    customSpacing?: Object[];
    groupBy?: Object[];
    timelineStore?: TimelineStore;
};

export default observer(function Timeline(props: TimelineProps) {
    const { children, onCreateBlock = noop, onCalendarClick = noop, startYear, customSpacing, groupBy, timelineStore } = props;

    const context = timelineStore ||
    //  useTimeline();
     // we have been doing this wrong this entire time??!!
     useMemo<TimelineStore>(() => new TimelineStore(), []);

    useEffect(() => {
        // @ts-expect-error: stores does not exist on window
        window.timeline = context;
    }, [context]);

    useEffect(() => () => context.ui.clearEvents(), [context.ui]);
    useEffect(() => startYear !== undefined && context.spaces.setStartYear(startYear), [context.spaces, startYear]);
    useEffect(() => {
        // console.log("use timline effect?", groupBy['fieldName'])
        context.blocks.setGroupBy(undefined)
        context.blocks.setAsSorted(true);
        if (groupBy) {
                context.blocks.setGroupBy(groupBy['fieldName'])
                if (context.blocks.isOutOfSort) { 
                    context.blocks.sortByGroup();
                    context.blocks.setAsSorted();
                }
            }
            
}, [context.blocks, groupBy['fieldName']]);
    useEffect(() => context.blocks.setCreateBlock(onCreateBlock), [context.blocks, onCreateBlock]);
    // useEffect(() => context.blocks.setOnResortClick(onResortClick), [context.blocks, onResortClick]);
    useEffect(() => context.ui.setCalendarClick(onCalendarClick), [context.ui, onCalendarClick]);
    useEffect(() => {
        if (customSpacing !== undefined) context.spaces.setCustomSpaces(customSpacing)}, [context.spaces, customSpacing]);

    return (
        <TimelineContext.Provider value={context}>
            <div 
                className={`
                    ReactTimeline__Timeline
                    ${context.ui.cursor}
                `}
                ref={e => !context.ui.element && context.ui.setElement(e)}
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
