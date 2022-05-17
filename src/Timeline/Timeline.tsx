/*
 * Timeline
 */

import { observer } from 'mobx-react';
import { useEffect, useMemo, ReactNode  } from 'react';

import Editor from '../Editor/Editor';
import { TimelineContext, TimelineStore } from '../context';


export type TimelineProps = {
    children?: ReactNode;
};

export default observer(function Timeline({ children }: TimelineProps) {
    const context = useMemo<TimelineStore>(() => new TimelineStore(), []);

    useEffect(() => () => context.clearEvents(), [context]);

    return (
        <TimelineContext.Provider value={context}>
            <div 
                className={`
                    ReactTimeline__Timeline
                    ${context.cursor}
                `}
                ref={e => !context.element && context.setElement(e)}
            >
                <Editor>
                    {children}
                </Editor>
            </div>
        </TimelineContext.Provider>
    );
});
