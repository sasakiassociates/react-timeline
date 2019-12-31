/**
 * Scrubber
 *
 * The Scrubber provides a way to pan and zoom over
 * the Editor's content.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import BlockVisualizer from './BlockVisualizer';


@inject('store')
@observer
class Scrubber extends React.Component {

    render() {
        const { blocks, viewport } = this.props.store;
        const { extent } = blocks;

        const offset = viewport.right >= extent.right ? 'right' : 'left';
        const scrubber = {
            width: `${100 * viewport.width / extent.width}%`,
            height: `${100 * viewport.height / extent.height}%`,
            top: `${100 * (viewport.top - extent.top) / extent.height}%`,
            [offset]: `${100 * (viewport[offset] - extent[offset]) / extent.width}%`,
        };

        return (
            <div className="react-timeline__scrubber">
                <div
                    className="react-timeline__scrubber-viewport"
                    style={scrubber}
                />

                <BlockVisualizer />
            </div>
        );
    }

}


export default Scrubber;
