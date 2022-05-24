/**
 * Segment
 */

import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import config from '../../config';
import SegmentState from '../../models/SegmentState';
import { useBlock, useTimeline } from '../../context';


export type SegmentProps = {
    color?: string;
    value: number;
    onChange?: (value: number) => any;
};

export default observer(function Segment(props: SegmentProps) {
    const segment = useMemo<SegmentState>(() => new SegmentState(props.value), []);
    const { blocks } = useTimeline();
    const block = useBlock();
    const { start, end } = block;

    const width = 100 * (segment.value - start) / (end - start);

    useEffect(() => {
        block.addSegment(segment);
        return () => block.removeSegment(segment);
    }, []);

    useEffect(() => {
        if (segment.value !== undefined && segment.value !== props.value) {
            props.onChange(segment.value);
        }
    }, [segment.value]);

    useEffect(() => {
        if (props.value !== segment.value) {
            segment.setValue(props.value);
        }
    }, [props.value]);

    useEffect(() => {
        if (props.color !== segment.color) {
            segment.setColor(props.color);
        }
    }, [props.color]);


    return (
        <div 
            className="ReactTimeline__Segment"
            style={{
                backgroundColor: segment.color,
                width: `${width}%`,
            }}
        >
            {blocks.canShowResizeHandle(blocks.getBlockWidth(block)) && (
                <div 
                    className="ReactTimeline__Segment-handle"
                    style={{ width: `${config.resizeHandleWidth}px` }}
                />
            )}
        </div>
    );
});
