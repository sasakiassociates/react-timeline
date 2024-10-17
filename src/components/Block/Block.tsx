/**
 * Block
 */

import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, MouseEvent, ReactNode, useState } from 'react';

import config from '../../config';
import { useTimeline, BlockContext } from '../../context';
import BlockState from '../../models/BlockState';
import BlockProxy from '../../models/BlockProxy';
import Action, { Actions } from '../../models/Action';

import {
    PiGitCommitBold,
    PiLeafBold,
} from 'react-icons/pi';


export type BlockProps = {
    children?: ReactNode;
    className?: string;
    color?: string;
    name?: string;
    proxy?: BlockProxy;
};

export default observer(function Block(props: BlockProps) {
    const timeline = useTimeline();
    const { blocks, spaces, ui, viewport } = timeline;
    const block = useMemo<BlockState>(() => new BlockState(timeline), [timeline]);
    const [blockHovered, setBlockHovered] = useState<boolean>(false)

    // Lifecycle

    useEffect(() => {
        blocks.add(block);
        return () => blocks.remove(block);
    }, []);

    useEffect(() => block.setColor(props.color), [props.color]);
    useEffect(() => block.setProxy(props.proxy), [props.proxy]);

    const selectBlock = useCallback((e: MouseEvent) => {
        if (!block.selected) {
            if (e.ctrlKey) {
                block.setSelected(!block.selected);
            }
            else {
                blocks.select(block);
            }
        }
    }, [block, blocks]);


    /**
     * Events
     */

    const onResize = useCallback((e: MouseEvent<HTMLDivElement>, bound: string) => {
        e.preventDefault();
        e.stopPropagation();

        selectBlock(e);

        ui.setAction(new Action(Actions.RESIZE, {
            block,
            bound,
            clientX: e.clientX,
        }));
    }, [ui, block, selectBlock]);

    const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        const editor = ui.editor.getBoundingClientRect();

        selectBlock(e);

        ui.setAction(new Action(Actions.DRAG, {
            block,
            clientX: e.clientX,
            startX: e.clientX - left,
            startY: e.clientY - top,
            top: editor.top,
        }));
    }, [ui, selectBlock, ui.editor]);

    const onMouseUp = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (ui.action.data) {
            const delta = Math.abs(ui.action.data.clientX - e.clientX);

            if (!e.ctrlKey && delta < 15) {
                blocks.select(block);
            }
        }
    }, [ui.action, block, blocks]);


    /** 
     * Render
     */

    if (!block.visible) {
        return <></>;
    }

    const width = blocks.getBlockWidth(block);

    const handleWidth = {
        flex: `0 0 ${config.resizeHandleWidth}px`,
    };

    const showResizeHandle = blocks.canShowResizeHandle(width);

    const style = {
        width: `${width}px`,
        height: `${config.blockHeight}px`,
        left: `${spaces.timeToPx(block.timespan.start)}px`,
        top: `${block.y - viewport.top}px`,
        background: undefined,
    };

    const styleHover = {
        width: `${width}px`,
        height: `${config.blockHeight}px`,
        left: `${spaces.timeToPx(block.timespan.start)}px`,
        top: `${block.y - viewport.top}px`,
    };



    if (props.color) {
        style.background = props.color;
    }


    return (
        <>
            <div
                className={`ReactTimeline__Block ${props.className} ${block.selected ? 'ReactTimeline__Block--selected' : ''}`}
                style={style}
                draggable="false"
                onMouseUp={onMouseUp}
                onMouseEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBlockHovered(true)
                }}
                onMouseLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBlockHovered(false)
                }}
            >

                {(block.selected) ? (
                    <>
                        <div
                            className="ReactTimeline__Block-handleleft"
                            onMouseDown={e => onResize(e, 'start')}
                            style={handleWidth}
                        >
                        </div>
                    </>
                ) : <></>}

                {((block.projects_on_requiredByProject.length > 0) || (block.projects_on_requiresProject.length > 0)) && <span
                        className='ReactTimeline__Block-dependency'
                        style={{left: '10px', top: '0'}} // TODO this is very manual I know ...
                    >
                            <PiGitCommitBold />
                        </span>}
                <div className="ReactTimeline__Block-content" onMouseDown={e => onMouseDown(e)} />

                {(block.selected) ? (
                    <>
                        <div
                            className="ReactTimeline__Block-handleright"
                            onMouseDown={e => onResize(e, 'end')}
                            style={handleWidth}
                        ></div>
                    </>
                ) : <></>}

                <BlockContext.Provider value={block}>
                    <div className='ReactTimeline__Block-overflow'>
                    </div>

                    
                    {props.children}
                </BlockContext.Provider>
            </div>

            {(blockHovered && (!block.selected)) ? (
                <div key={`${block.id}-icon`} style={styleHover}>
                    <div className={`ReactTimeline__Block-left-icon`} />
                    <div className='ReactTimeline__Block-right-icon' />
                </div>
            ) : (block.selected) ? <></> : <></>}

            {props.name && (
                <div className={`ReactTimeline__Block-label ${block.selected ? 'ReactTimeline__Block-label--selected' : ''}`} style={{ left: `${spaces.timeToPx(block.timespan.start) + width}px`, top: `${block.y - viewport.top}px`, }}>
                    {props.name}
                </div>
            )}
        </>

    );
});
