/**
 * Scrubber - Block Visualizer
 *
 * This visualizer renders the blocks as shown in the editor
 * but drawn to the scope of the scrubber.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';


@inject('store')
@observer
class BlockVisualizer extends React.Component {

    constructor() {
        super();

        this.container = null;
    }

    render() {
        const { blocks, viewport } = this.props.store;

        return (
            <div className="react-timeline__scrubber-visualizer react-timeline__visualizer--block">
                {blocks.elements.map(block => (
                    <div
                        key={block.id}
                        className="react-timeline__visualizer-block"
                        style={{
                            left: `${100 * (block.start - blocks.extent.left) / blocks.extent.width}%`
                        }}
                    />
                ))}
            </div>
        ) ;
    }

}


export default BlockVisualizer;
