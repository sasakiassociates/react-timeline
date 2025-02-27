/*
 * Timeline
 */

import { observer } from 'mobx-react';
import { useEffect, useMemo, ReactNode  } from 'react';

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
    onResortClick?: ()=>any;
};

export default observer(function Timeline(props: TimelineProps) {
    const { children, onCreateBlock = noop, onCalendarClick = noop, startYear, customSpacing, groupBy, onResortClick } = props;

    const context = useTimeline();
    //  useMemo<TimelineStore>(() => new TimelineStore(), []);

    useEffect(() => () => context.ui.clearEvents(), [context.ui]);
    useEffect(() => startYear !== undefined && context.spaces.setStartYear(startYear), [context.spaces, startYear]);
    useEffect(() => {
        context.blocks.setGroupBy(undefined)
        if (groupBy) {
                context.blocks.setGroupBy(groupBy['fieldName'])
                if (context.blocks.isOutOfSort) { 
                    context.blocks.sortByGroup();
                    context.blocks.setAsSorted();
                }
                // context.blocks.all.forEach((block)=>{ 
                //     block.setGroupName(undefined)
                // })
                // context.blocks.all.forEach((block)=>{ //@ts-ignore
                //     block[groupBy['fieldName']] = block.proxy.project[groupBy['fieldName']]
                // })
            }
            
}, [context.blocks, groupBy]);
    useEffect(() => context.blocks.setCreateBlock(onCreateBlock), [context.blocks, onCreateBlock]);
    useEffect(() => context.blocks.setOnResortClick(onResortClick), [context.blocks, onResortClick]);
    useEffect(() => context.ui.setCalendarClick(onCalendarClick), [context.ui, onCalendarClick]);
    useEffect(() => {
        if (customSpacing !== undefined) context.spaces.setCustomSpaces(customSpacing)}, [context.spaces, customSpacing]);
    

    useEffect(() => {
        // @ts-expect-error: stores does not exist on window
        window.timeline = context;
    }, [context]);

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
