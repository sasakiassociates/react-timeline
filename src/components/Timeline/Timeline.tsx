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
import { TimelineContext } from '../../context';


export type TimelineProps = {
    children?: ReactNode;
    startYear?: number;
    onCreateBlock?: (timespan: Timespan) => any;
    onCalendarClick?: (value: number) => any;
    customSpacing?: Object[];
    groupBy?: Object[];
};

export default observer(function Timeline(props: TimelineProps) {
    const { children, onCreateBlock = noop, onCalendarClick = noop, startYear, customSpacing, groupBy } = props;

    const context = useMemo<TimelineStore>(() => new TimelineStore(), []);

    useEffect(() => () => context.ui.clearEvents(), [context.ui]);
    useEffect(() => startYear !== undefined && context.spaces.setStartYear(startYear), [context.spaces, startYear]);
    useEffect(() => context.blocks.setCreateBlock(onCreateBlock), [context.blocks, onCreateBlock]);
    useEffect(() => context.ui.setCalendarClick(onCalendarClick), [context.ui, onCalendarClick]);
    useEffect(() => {
        if (customSpacing !== undefined) context.spaces.setCustomSpaces(customSpacing)}, [context.spaces, customSpacing]);
    useEffect(() => {
            context.blocks.setGroupBy(undefined)
            if (groupBy) {
                    context.blocks.setGroupBy(groupBy['fieldName'])
                    context.blocks.all.forEach((block)=>{ 
                        block.setGroupName(undefined)
                    })
                    context.blocks.all.forEach((block)=>{ //@ts-ignore
                        block[groupBy['fieldName']] = block.proxy.project[groupBy['fieldName']]
                    })
                }
                context.blocks.sortByGroup()
    }, [groupBy]);
    
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
