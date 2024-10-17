import { useCallback, useEffect, useState, MouseEvent, ReactNode } from 'react';
import { observer } from 'mobx-react';

import config from '../../config';
import { useTimeline } from '../../context';
import Action, { Actions } from '../../models/Action';
import SelectBox from '../SelectBox/SelectBox';


export type EditorProps = {
    children: ReactNode;
};

export default observer(function Editor({ children }: EditorProps) {
    const { blocks, spaces, ui, viewport } = useTimeline();
    const { editor, height, width } = ui;

    const [mouseDownTime,setMouseDownTime] = useState<number>(0);

    /**
     * Lifecycle
     */

    useEffect(() => {
        if (editor) {
            editor.addEventListener('wheel', onWheel);

            return () => {
                editor.removeEventListener('wheel', onWheel);
            };
        }
    }, [editor, onWheel]);

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
    }, [ui, viewport, setMouseDownTime]);

    const onMouseUp = useCallback(() => {
        // Simulate a click event by checking for time passed since mousedown.
        // We simulate the click instead of using the click event to have better
        // control over the behavior of the mousedown portion of the event.
        if (Date.now() - mouseDownTime < 200) {
            blocks.select();
        }
    }, [blocks, mouseDownTime]);

    var onWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        if (editor) {
            const { clientX, deltaY } = e;
            const xRatio = (clientX - editor.getBoundingClientRect().left) / width;
            viewport.setXratioOnZoom(xRatio)
            viewport.zoom(xRatio, deltaY);
        }
    }, [editor, viewport, width]);

    const onDoubleClick = useCallback(({ clientX }: MouseEvent<HTMLDivElement>) => {
        const start = spaces.pxToTime(clientX);

        blocks.createBlock({ 
            start,
            end: start + (viewport.width * .15) 
        });
    }, [blocks.createBlock, spaces, viewport.width]);


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
                ctx.setLineDash([3, 5]);

                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            });

            // Secondary Lines
            ctx.strokeStyle = config.colors.secondaryLine;
            spaces.grid.secondary.forEach(x => {
                ctx.beginPath();
                ctx.setLineDash([3, 5]);

                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            });

        }
    }, [spaces.grid, grid, width, height]);


    return (
        <div 
            className="ReactTimeline__Editor"
            ref={el => el && !editor && ui.setEditor(el)}
            onDoubleClick={onDoubleClick}
            onMouseEnter={(e)=>{
                // we didnt' want to get the re sort triggered as resizing a block since it means the block would then jump to another y and is confusing,
                blocks.preventSorting()
            }}
            onMouseLeave={(e)=>{
                // for now on mouse leave of the editor it reactivates it
                blocks.preventSorting(false)
                blocks.sortByGroup()
            }}
        >
            <canvas
                width={`${width}px`}
                height={`${height * .96}px`}
                ref={el => el !== null && grid === null && setGrid(el)}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            />

            <div className="ReactTimeline__Editor--blocks">

            {
                    (blocks.groupBy) && (blocks.groupNames.length > 0) && <>
                        {blocks.groupNames.map((name)=>(
                            <>
                             {name !== 'nan' && 
                             <>
                             <span className='ReactTimeline__Editor--blocks--GroupLabel' style={{
                                    'left': ( blocks.extentByGroupName[name]) ? blocks.extentByGroupName[name]['style']['left'] : 0,
                                    'top': (blocks.extentByGroupName[name]) ? blocks.extentByGroupName[name]['style']['top']: 0,
                                    'position':'absolute',
                                    'padding': '5px',
                                    'marginLeft': '5px',
                                    'paddingLeft': '1px',
                                }}>
                                    {name}
                                </span>
                            
                                <span
                                    className='ReactTimeline__Editor--blocks--GroupBorder'
                                    style={{// @ts-ignore
                                        width:  ( blocks.extentByGroupName[name]) ? blocks.extentByGroupName[name]['style']['width'] : 0,
                                        height: ( blocks.extentByGroupName[name]) ? blocks.extentByGroupName[name]['style']['height'] : 0,
                                        left: ( blocks.extentByGroupName[name]) ? blocks.extentByGroupName[name]['style']['left'] : 0,
                                        top: ( blocks.extentByGroupName[name]) ? blocks.extentByGroupName[name]['style']['top'] : 0,
                                        // background: "yellow",
                                        border: "1px dashed blue",
                                        borderRadius: "6px",
                                        'position':'absolute'
                                    }}
                                ></span>
                             </>
                                
                                
                                }
                            </>
                        ))}
                    </>
                }

                {/* custom grid */}
                {(spaces.customSpaces) && <>
                    
                    {spaces.customSpaceGrid.label.map((label,i) => (
                        <div
                            className='ReactTimeline__Editor--blocks--customSpacing'
                            style={{
                                'left': `${spaces.customSpaceGrid.rectsTopLeft[i]}px`,
                                'top': `${viewport.top}`,
                                'width': `${spaces.customSpaceGrid.rectsWidth[i]}px`,
                                'height': `100%`,
                                'position': 'absolute',
                                'background': `${spaces.customSpaceGrid.color[i]}`
                            }}
                        
                        ></div>
                    ))}
                    
                </>}
                {children}
            </div>

            <SelectBox />
        </div>
    );
})
