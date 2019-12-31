/**
 * Scrubber
 *
 * The Scrubber provides a way to pan and zoom over
 * the Editor's content.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';


@inject('store')
@observer
class Scrubber extends React.Component {

    render() {
        const { blocks, viewport } = this.props.store;

        const scrubber = {
            width: `${100 * viewport.width / (blocks.extent.right - blocks.extent.left)}%`,
            height: `${100}%`,
            left: `${0}%`,
        };

        return (
            <div className="react-timeline__scrubber">
                <div
                    className="react-timeline__scrubber-viewport"
                    style={scrubber}
                />
            </div>
        );
    }

}


export default Scrubber;
