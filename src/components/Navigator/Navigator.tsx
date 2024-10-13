/**
 * Navigator
 *
 * The navigator provides a way to pan and zoom over
 * the Editor's content.
 */

import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { useTimeline } from '../../context';
import BlockVisualizer from './BlockVisualizer';


export default observer(function Navigator() {
    const { blocks, viewport, spaces } = useTimeline();
    const { extent } = blocks;
    const [info, setInfo] = useState<string>('');

    const offset = viewport.right >= extent.right ? 'right' : 'left';

    const navigatorStyle = {
        width: `${100 * viewport.width / extent.width}%`,
        height: `${100 * viewport.height / extent.height}%`,
        top: `${100 * (viewport.top - extent.top) / extent.height}%`,
        [offset]: `${100 * (viewport[offset] - extent[offset]) / extent.width}%`,
    };

    useEffect(() => {
        const blockVisibility  = (blocks.all.length > 0) ? (100 * (blocks.visible.length / blocks.all.length)).toFixed(0) : 100;

        setInfo(`${blockVisibility}%`);
    }, [setInfo, blocks.visible.length, blocks.all.length]);

    const onDoubleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const { clientX: x, clientY: y } = e;

        viewport.center(
            (blocks.extent.width * ((x - rect.x) / rect.width)) + blocks.extent.left,
            blocks.extent.height * ((y - rect.y) / rect.height) + blocks.extent.top,
        );
    }, [blocks.extent]);

    return (
        <div 
            className="ReactTimeline__Navigator"
            onDoubleClick={onDoubleClick}
            style={{top: `${(spaces.customSpaces && spaces.customSpaces.length > 0) ? '65px': '35px'}`}}
        >
            <div>
                <div
                    className="ReactTimeline__Navigator-viewport"
                    style={navigatorStyle}
                />

                <div className="ReactTimeline__Navigator-info">
                    {info}
                </div>

                <BlockVisualizer />
            </div>
        </div>
    );
});
