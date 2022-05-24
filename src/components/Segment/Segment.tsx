/**
 * Segment
 */

import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';

import config from '../../config';
import SegmentProxy from '../../models/SegmentProxy';
import Action, { Actions } from '../../models/Action';
import { useBlock, useTimeline } from '../../context';


export type SegmentProps = {
    proxy: SegmentProxy;
    value?: number;
    color?: string;
    onChange?: (value: number) => any;
};

export default observer(function Segment(props: SegmentProps) {
    const { blocks, ui } = useTimeline();
    const block = useBlock();

    const width = Math.round(100 * (props.proxy.value - block.start) / (block.end - block.start));

    useEffect(() => {
        block.addSegment(props.proxy);
        return () => block.removeSegment(props.proxy);
    }, [props.proxy]);

    const onMouseDown = useCallback(() => {
        ui.setAction(new Action(Actions.SEGMENT, {
            segment: props.proxy,
            block,
        }));
    }, [props.proxy, block, ui]);

    return (
        <div 
            className="ReactTimeline__Segment"
            style={{
                backgroundColor: props.color || '#ccc',
                width: `${width}%`,
            }}
        >
            {blocks.canShowResizeHandle(blocks.getBlockWidth(block)) && (
                <div 
                    className="ReactTimeline__Segment-handle"
                    style={{ width: `${config.resizeHandleWidth}px` }}
                    onMouseDown={onMouseDown}
                />
            )}
        </div>
    );
});
