import { useCallback, useEffect, useMemo, MouseEvent } from 'react';
import { observer } from 'mobx-react';

//import Action, { Actions } from '../models/Action';
import config from '../../config';
import { useTimeline } from '../../context';
import BlockProxy, { IBlockProxy } from '../../models/BlockProxy';


export type BlockProps = IBlockProxy & {
    className?: string;
    color?: string;
    name?: string;
};

export default observer(function Block(props: BlockProps) {
    const { blocks, spaces, ui, viewport } = useTimeline();
    const block = useMemo<BlockProxy>(() => new BlockProxy(), []);

    // Proxy lifecycle
    useEffect(() => {
        blocks.add(block);
        return () => blocks.remove(block);
    }, []);

    /**
     * Proxy sync
     */

    useEffect(() => {
        if (props.selected !== undefined) {
            block.__internalSetSelected(props.selected);
        }
    }, [props.selected]);

    useEffect(() => {
        if (props.onSelectedChange !== undefined) {
            block.setOnSelectedChange(props.onSelectedChange);
        }
    }, [props.onSelectedChange]);

    useEffect(() => {
        if (props.timespan !== undefined) {
            block.__internalSetTimespan(props.timespan);
        }
    }, [props.timespan.end, props.timespan.start]);

    useEffect(() => {
        if (props.onTimespanChange !== undefined) {
            block.setOnTimespanChange(props.onTimespanChange);
        }
    }, [props.onTimespanChange]);

    useEffect(() => {
        if (props.y !== undefined) {
            block.__internalSetY(props.y);
        }
    }, [props.y]);

    useEffect(() => {
        if (props.onYChange !== undefined) {
            block.setOnYChange(props.onYChange);
        }
    }, [props.onYChange]);


    /**
     * Interactions
     */

    const selectBlock = useCallback((e: MouseEvent) => {
        if (!block.selected) {
            if (!e.ctrlKey) {
                block.setSelected(!block.selected);
            }
            else {
                blocks.select(block);
            }
        }
    }, [block, blocks]);

    const onResize = useCallback((e: MouseEvent<HTMLDivElement>, _: string) => {
        selectBlock(e);
        //ui.setAction(new Action(Actions.RESIZE, { bound, clientX: e.clientX }))
    }, [selectBlock]);

    const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        selectBlock(e);
    }, [selectBlock]);


    /** 
     * Render
     */

    const visible = (
        (
            (
                block.timespan.start >= viewport.left
                && block.timespan.start <= viewport.right
            ) || (
                block.timespan.end >= viewport.left
                && block.timespan.end <= viewport.right
            ) || (
                block.timespan.start <= viewport.left
                && block.timespan.end >= viewport.right
            )
        ) && (
            block.y >= viewport.top - config.blockHeight
            && block.y <= viewport.bottom + config.blockHeight
        )
    );

    if (!visible) {
        return <></>;
    }

    let time = (block.timespan.end - block.timespan.start) / viewport.width;
    if (time < 0) {
        time = 0;
    }

    const width = ui.width * time;

    const handleWidth = {
        flex: `0 0 ${config.resizeHandleWidth}px`,
    };

    const showResizeHandleWidth = config.resizeHandleWidth * 3;

    const style = {
        width: `${width}px`,
        height: `${config.blockHeight}px`,
        left: `${spaces.timeToPx(block.timespan.start)}px`,
        top: `${block.y - viewport.top}px`,
        background: undefined,
    };

    if (props.color) {
        style.background = props.color;
    }

    return (
        <div 
            className={`
                ReactTimeline__Block
                ${props.className}
            `}
            style={style}
            draggable="false"
        >
            {width > showResizeHandleWidth && (
                <div 
                    className="ReactTimeline__Block-handle" 
                    onMouseDown={e => onResize(e, 'start')} 
                    style={handleWidth} 
                />
            )}

            <div className="ReactTimeline__Block-content" onMouseDown={e => onMouseDown(e)} />

            {width > showResizeHandleWidth && (
                <div 
                    className="ReactTimeline__Block-handle" 
                    onMouseDown={e => onResize(e, 'end')} 
                    style={handleWidth} 
                />
            )}

            {props.name && (
                <div className="ReactTimeline__Block-label" style={{left: `${width}px`}}>
                    {props.name}
                </div>
            )}
        </div>
    )
});
