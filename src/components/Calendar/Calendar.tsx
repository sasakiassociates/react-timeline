/**
 * Calendar
 */

import { observer } from 'mobx-react';
import { MouseEvent, useCallback } from 'react';

import { useTimeline } from '../../context';


export default observer(function Calendar() {
    const { spaces, ui } = useTimeline();

    const onDoubleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        ui.onCalendarClick(spaces.pxToTime(e.clientX));
    }, [spaces, ui]);

    return (
        <div 
            className="ReactTimeline__Calendar"
            onDoubleClick={onDoubleClick}
            style={{flexGrow:1, flexBasis: `${(spaces.customSpaces && spaces.customSpaces.length > 0) ? '60px' : '30px'}`, flexShrink: '0'}}

        >
            {spaces.grid.primary.map((x, i) => {
                const time = Math.round(spaces.internalPxToTime(x));
                const display = spaces.displayPrimary(time);

                return (
                    <><div
                        key={i}
                        className="ReactTimeline__Calendar-date"
                        style={{ left: `${x}px`, height: "25px" }}
                    >
                        <span
                        className="ReactTimeline__Calendar-date-label"
                        >
                            {display}
                        </span>
                        
                    </div>

                    </>
                    

                );
            })}

            { spaces.customSpaceGrid.label.map((label, j)=>(
                    <>
                {
                    <div
                        key={`${j}-custom-spacing-div`}
                        className="ReactTimeline__Calendar-customSpacing"
                        style={{ position:'absolute', left: `${spaces.customSpaceGrid.rectsTopLeft[j] }px`, height: `25px`, background: spaces.customSpaceGrid.color[j], width:`${spaces.customSpaceGrid.rectsWidth[j] }px`}}
                    >
                        <span 
                            className="ReactTimeline__Calendar-customSpacing-label"
                            key={`${j}-custom-spacing-span`}
                            style={{ position:'relative'}}// 15 is to count of the length of the label itself
                   
                        >
                            {label}
                        </span>
                        
                    </div>


                }
                    </>

            ))}
        </div>
    );
});
