/**
 * Navigator
 *
 * The navigator provides a way to pan and zoom over
 * the Editor's content.
 */

import { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';

//import time from '../../time';
import { useTimeline } from '../../context';
import BlockVisualizer from './BlockVisualizer';


export default observer(function Navigator() {
    const { blocks, viewport } = useTimeline();
    const { extent } = blocks;
    const [info, setInfo] = useState<string>('');
    const ref = useRef();

    const offset = viewport.right >= extent.right ? 'right' : 'left';

    const navigatorStyle = {
        width: `${100 * viewport.width / extent.width}%`,
        height: `${100 * viewport.height / extent.height}%`,
        top: `${100 * (viewport.top - extent.top) / extent.height}%`,
        [offset]: `${100 * (viewport[offset] - extent[offset]) / extent.width}%`,
    };

    useEffect(() => {
        //const month = time.months[Math.floor(app.scrubber / time.MONTH) % 12];
        //const year = Math.floor(app.scrubber  / time.YEAR) + config.startYear;
        const blockVisibility  = (blocks.all.length > 0) ? (100 * (blocks.visible.length / blocks.all.length)).toFixed(0) : 100;

        //setInfo(`${month} ${year} | ${blockVisibility}%`);
        setInfo(`${blockVisibility}%`);
    }, [setInfo, blocks.visible.length, blocks.all.length]);

    return (
        <div 
            className="ReactTimeline__Navigator"
            ref={ref}
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
