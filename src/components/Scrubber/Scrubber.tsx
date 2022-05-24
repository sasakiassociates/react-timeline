/**
 * Scrubber
 */

import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { useTimeline } from '../../context';
import Action, { Actions } from '../../models/Action';


export type ScrubberProps = {
    className?: string;
    label?: string|null;
    value?: number;
    onChange?: (value: number) => any;
};

export default observer(function Scrubber(props: ScrubberProps) {
    const { spaces, ui } = useTimeline();
    const [value, setValue] = useState<number>(props.value || 0);

    useEffect(() => {
        if (props.value !== value) {
            setValue(props.value);
        }
    }, [props.value]);

    const onMouseDown = useCallback(() => {
        ui.setAction(new Action(Actions.SCRUB, {
            setScrubber: props.onChange || setValue,
        }));
    }, [ui, props.onChange, setValue]);

    const visible = true;

    if (!visible) {
        return <></>;
    }

    return (
        <div 
            className={`ReactTimeline__Scrubber ${props.className || ''}`}
            style={{
                left: `${100 * spaces.timeToPx(value) / ui.width}%`,
            }}
        >
            <div
                className="ReactTimeline__Scrubber-buffer"
                onMouseDown={onMouseDown}
            />

            {props.label !== null && (
                <div className='ReactTimeline__Scrubber-label'>
                    {props.label !== undefined ? props.label : spaces.displaySecondary(value)}
                </div>
            )}
        </div>
    );
});
