/*
 * Timeline
 */

import { observer } from 'mobx-react';
import { useEffect, useMemo, useState, ReactNode  } from 'react';

import config from '../../config';
import { Viewport } from '../../types';
import Editor from '../Editor/Editor';
import TimelineStore from '../../stores/TimelineStore';
import { TimelineContext } from '../../context';


export type TimelineProps = {
    children?: ReactNode;
    viewport?: any[];
};

export default observer(function Timeline({ children, viewport }: TimelineProps) {
    const context = useMemo<TimelineStore>(() => new TimelineStore(), []);
    const [_viewport, _setViewport] = viewport || useState<Viewport>({ top: 0, left: 0, right: config.defaultViewportWidth });

    useEffect(() => () => context.ui.clearEvents(), [context]);
    useEffect(() => context.viewport.setState(_viewport, _setViewport), [_viewport, _setViewport]);

    return (
        <TimelineContext.Provider value={context}>
            <div 
                className={`
                    ReactTimeline__Timeline
                    ${context.ui.cursor}
                `}
                ref={e => !context.ui.element && context.ui.setElement(e)}
            >
                <Editor>
                    {children}
                </Editor>
            </div>
        </TimelineContext.Provider>
    );
});
