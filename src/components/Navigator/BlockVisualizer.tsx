/**
 * Block Visualizer
 *
 * This visualizer renders the blocks as shown in the editor
 * but drawn to the scope of the navigator.
 */

import { observer } from 'mobx-react';

import config from '../../config';
import { useTimeline } from '../../context';


export default observer(function BlockVisualizer() {
    const { blocks } = useTimeline();

    const heightPerc = 100 * config.blockHeight / blocks.extent.height;
    const height = heightPerc < 4 ? '1px' : `${heightPerc}%`;

    return (
        <div className="ReactTimeline__Navigator-visualizer">
            {blocks.all.map(block => {
                const widthPerc = 100 * (block.end - block.start) / blocks.extent.width;
                const width = widthPerc < 1 ? '1px' : `${widthPerc}%`;

                return (
                    <div
                        key={block.id}
                        className="ReactTimeline__Navigator-visualizer-block"
                        style={{
                            top: `${100 * (block.y - blocks.extent.top) / blocks.extent.height}%`,
                            left: `${100 * (block.start - blocks.extent.left) / blocks.extent.width}%`,
                            width,
                            backgroundColor: block.color,
                            height,
                        }}
                    />
                );
            })}
        </div>
    );
});
