/**
 * Navigator
 *
 * The navigator provides a way to pan and zoom over
 * the Editor's content.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import BlockVisualizer from './BlockVisualizer';


@inject('store')
@observer
class Navigator extends React.Component {

    render() {
        const { blocks, viewport } = this.props.store;
        const { extent } = blocks;

        const offset = viewport.right >= extent.right ? 'right' : 'left';
        const navigator = {
            width: `${100 * viewport.width / extent.width}%`,
            height: `${100 * viewport.height / extent.height}%`,
            top: `${100 * (viewport.top - extent.top) / extent.height}%`,
            [offset]: `${100 * (viewport[offset] - extent[offset]) / extent.width}%`,
        };

        return (
            <div className="react-timeline__navigator">
                <div
                    className="react-timeline__navigator-viewport"
                    style={navigator}
                />

                <BlockVisualizer />
            </div>
        );
    }

}


export default Navigator;
