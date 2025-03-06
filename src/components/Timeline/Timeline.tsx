/*
 * Timeline
 */

import { observer } from 'mobx-react';
import React, { useEffect, useMemo, ReactNode, useRef  } from 'react';

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
};

export default observer(function Timeline(props: TimelineProps) {
    const { children, onCreateBlock = noop, onCalendarClick = noop, startYear, customSpacing, groupBy, timeline } = props;

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
   
   
    useEffect(() => {
        context.blocks.setGroupBy(undefined)
        // context.blocks.setAsSorted(true);
    }, [context.blocks]);

    useEffect(()=>{
        if (groupBy) {
            if (Object.keys(groupBy).includes("fieldName")) {
                if (groupBy["fieldName"]) { 
                    groupByFieldName.current = groupBy["fieldName"] 
                } else {
                    groupByFieldName.current = undefined;
                }
            }
        }
    },[groupBy])

    useEffect(() => {
        if (groupBy) {
                context.blocks.setGroupBy(groupByFieldName.current)
                if (context.blocks.isOutOfSort) { 
                    context.blocks.sortByGroup();
                    context.blocks.setAsSorted();
                }
            }
    }, [context.blocks, groupBy, groupByFieldName]);


    useEffect(() => {
        context.blocks.sortByGroup();
    }, [groupByFieldName.current]);
   
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
