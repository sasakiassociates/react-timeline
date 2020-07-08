/**
 * Navigator - Block Visualizer
 *
 * This visualizer renders the blocks as shown in the editor
 * but drawn to the scope of the navigator.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';


@inject('store')
@observer
class BlockVisualizer extends React.Component {

    render() {
        const { blocks, config, viewport } = this.props.store;

        let height = 100 * config.blockHeight / blocks.extent.height;
        height = height < 4 ? '1px' : `${height}%`;

        return (
            <div className="react-timeline__navigator-visualizer react-timeline__visualizer--block">
                {blocks.elements.map(block => {
                    if (!block.width) return null;
                    let width = 100 * (viewport.width * block.width.time) / blocks.extent.width;
                    width = width < 1 ? '1px' : `${width}%`;

                    return (
                        <div
                            key={block.id}
                            className="react-timeline__visualizer-block"
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
        ) ;
    }

}


export default BlockVisualizer;
