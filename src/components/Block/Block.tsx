import { useCallback, useEffect, useMemo, MouseEvent } from 'react';
import { observer } from 'mobx-react';

//import Action, { Actions } from '../models/Action';
import config from '../../config';
import { useTimeline } from '../../context';
import BlockProxy from '../../models/BlockProxy';


export type BlockProps = {
    className?: string;
    color?: string;
    name?: string;
    proxy?: BlockProxy;
};

export default observer(function Block(props: BlockProps) {
    const { blocks, spaces, ui, viewport } = useTimeline();
    const block = props.proxy || useMemo<BlockProxy>(() => new BlockProxy(), []);

    // Proxy lifecycle

    useEffect(() => {
        blocks.add(block);
        return () => blocks.remove(block);
    }, []);


    /**
     * Interactions
     */

    const selectBlock = useCallback((e: MouseEvent) => {
        if (e.ctrlKey) {
            block.setSelected(!block.selected);
        }
        else {
            blocks.select(block);
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
            className={`ReactTimeline__Block ${props.className} ${block.selected ? 'ReactTimeline__Block--selected' : ''}`}
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
    );
});
