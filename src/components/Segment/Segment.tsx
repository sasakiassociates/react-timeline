/**
 * Segment
 */

import { observer } from 'mobx-react';

import { Timespan } from '../../types';


export type SegmentProps = Timespan & {
    color?: string;
    onChange?: (timespan: Timespan) => any;
};

export default observer(function Segment(props: SegmentProps) {
    return (
        <div 
            className="ReactTimeline__Segment"
            style={{
                backgroundColor: props.color
            }}
        />
    );
});
