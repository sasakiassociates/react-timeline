import { useCallback, useState, MouseEvent } from 'react';
import { observer } from 'mobx-react';

//import Action, { Actions } from '../models/Action';
import { Timespan } from '../types';
import { useTimeline } from '../context';
import config from '../config';


export type BlockProps = {
    className?: string;
    color?: string;
    name?: string;
    selected?: any[];
    timespan?: any[];
    y?: any[];
};

export default observer(function Block(props: BlockProps) {
    const { spaces, ui, viewport } = useTimeline();

    const [y, setY] = props.y || useState<number>(0);
    const [selected, setSelected] = props.selected || useState<boolean>(false);
    const [timespan] = props.timespan || useState<Timespan>({ start: 0, end: 300000 });

    const _setSelected = useCallback((_: MouseEvent) => {
        if (!selected) {
            setSelected(!selected);
        }
    }, [selected, setSelected]);

    const onResize = useCallback((e: MouseEvent<HTMLDivElement>, _: string) => {
        _setSelected(e);
        //ui.setAction(new Action(Actions.RESIZE, { bound, clientX: e.clientX }))
    }, [_setSelected]);

    const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        _setSelected(e);
    }, [_setSelected]);

    let time = (timespan.end - timespan.start) / viewport.width;
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
        left: `${spaces.timeToPx(timespan.start)}px`,
        top: `${y - viewport.top}px`,
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
