/**
 * Segment
 */

import { observer } from 'mobx-react';

import { useBlock } from '../../context';


export type SegmentProps = {
    color?: string;
    value: number;
    onChange?: (value: number) => any;
};

export default observer(function Segment(props: SegmentProps) {
    const block = useBlock();

    return (
        <div 
            className="ReactTimeline__Segment"
            style={{
                backgroundColor: props.color
            }}
        />
    );
});
