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

    onClick = ({ target, clientX, clientY }) => {
        if (this.ref) {
            const { blocks, viewport } = this.props.store;
            const { left, top, width, height } = this.ref.getBoundingClientRect();

            const xPos = clientX - left;
            const yPos = clientY - top;

            const xValue = (xPos / width) * blocks.extent.width;
            const yValue = (yPos / height) * blocks.extent.height;
            const halfwidth = viewport.width / 2;

            viewport.setLeft(xValue - halfwidth);
            viewport.setRight(xValue + halfwidth);

            viewport.setTop(yValue - viewport.height / 2);
        }
    }

    render() {
        const { blocks, viewport, ui, spaces } = this.props.store;
        const { extent } = blocks;
        const offset = viewport.right >= extent.right ? 'right' : 'left';
        const navigator = {
            width: `${100 * viewport.width / extent.width}%`,
            height: `${100 * viewport.height / extent.height}%`,
            top: `${100 * (viewport.top - extent.top) / extent.height}%`,
            [offset]: `${100 * (viewport[offset] - extent[offset]) / extent.width}%`,
        };
        return (
            <div
                ref={el => this.ref = el}
                className="react-timeline__navigator"
                onClick={e => this.onClick(e)}
            >
                <div
                    className="react-timeline__navigator-viewport"
                    style={navigator}
                />
                <div
                    className="react-timeline__navigator-scrubber-date"

                >
                    {spaces.displaySecondary(ui.scrubber)} | {(100 * (blocks.visible.length / blocks.elements.length)).toFixed(0)}%
                </div>

                <BlockVisualizer />

            </div>
        );
    }

}


export default Navigator;
