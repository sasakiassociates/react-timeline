/**
 * Calendar
 */

import { observer } from 'mobx-react';

import { useTimeline } from '../../context';


export default observer(function Calendar() {
    const { spaces } = useTimeline();
    return (
        <div className="ReactTimeline__Calendar">
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
