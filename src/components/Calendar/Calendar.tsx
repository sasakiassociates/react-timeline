/**
 * Calendar
 */

import { observer } from 'mobx-react';
import { useCallback, MouseEvent } from 'react';

import { useTimeline } from '../../context';


export default observer(function Calendar() {
    const { spaces } = useTimeline();

    const onDoubleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    }, []);

    return (
        <div 
            className="ReactTimeline__Calendar"
            onDoubleClick={onDoubleClick}
        >
            {spaces.grid.primary.map((x, i) => {
                const time = Math.round(spaces.internalPxToTime(x));
                const display = spaces.displayPrimary(time);

                return (
                    <div
                        key={i}
                        className="ReactTimeline__Calendar-date"
                        style={{ left: `${x}px` }}
                    >
                        {display}
                    </div>
                );
            })}
        </div>
    );
});
