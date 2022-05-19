import { useCallback, useEffect, useState, MouseEvent, ReactNode } from 'react';
import { observer } from 'mobx-react';

import config from '../../config';
import { useTimeline } from '../../context';
import Action, { Actions } from '../../models/Action';


export type EditorProps = {
    children: ReactNode;
};

export default observer(function Editor({ children }: EditorProps) {
    const { blocks, spaces, ui, viewport } = useTimeline();
    const { height, width } = ui;

    const [mouseDownTime,setMouseDownTime] = useState<number>(0);

    /**
     * Events
     */

    const onMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
        const container = e.currentTarget.getBoundingClientRect();

        setMouseDownTime(Date.now());

        if (e.ctrlKey) {
            var action = new Action(Actions.SELECT, {
                startX: e.clientX,
                startY: (e.clientY - container.top) + viewport.top,
                top: container.top,
            });
        }
        else {
            var action = new Action(Actions.PAN, {
                startLeft: viewport.left,
                startRight: viewport.right,
                startTop: viewport.top,
                startX: e.clientX - container.left,
                startY: e.clientY - container.top,
                top: container.top,
            });
        }

        ui.setAction(action);
    }, [ui, viewport]);

    const onMouseUp = useCallback(() => {
        // Simulate a click event by checking for time passed since mousedown.
        // We simulate the click instead of using the click event to have better
        // control over the behavior of the mousedown portion of the event.
        if (Date.now() - mouseDownTime < 200) {
            blocks.select();
        }
    }, [blocks, mouseDownTime]);



    /** 
     * Render Grid
     */

    const [grid, setGrid] = useState<HTMLCanvasElement|null>(null);

    useEffect(() => {
        if (grid) {
            const ctx = grid.getContext('2d');
            ctx.clearRect(0, 0, width, height);

            // Primary Lines
            ctx.strokeStyle = config.colors.primaryLine;
            spaces.grid.primary.forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            });

            // Secondary Lines
            ctx.strokeStyle = config.colors.secondaryLine;
            spaces.grid.secondary.forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            });

        }
    }, [spaces.grid, grid, width, height]);


    return (
        <div className="ReactTimeline__Editor">
            <canvas
                width={`${width}px`}
                height={`${height * .96}px`}
                ref={el => el !== null && grid === null && setGrid(el)}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            />

            <div className="ReactTimeline__Editor--blocks">
                {children}
            </div>
        </div>
    );
})
