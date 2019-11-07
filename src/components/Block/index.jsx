/**
 * Block
 */

import React from 'react';
import { inject, observer } from 'mobx-react';


@inject('store')
@observer
class Block extends React.Component {

    onMouseDown = e => {
        const { store, block } = this.props;
        store.setDragging(block, e.target);
    }

    render() {
        const { viewport, ui } = this.props.store;
        const { start, width, y } = this.props.block;
        const x = (1 - (viewport.width - start) / viewport.width) * ui.width;

        return (
            <div
                className="react-timeline__block"
                onMouseDown={e => this.onMouseDown(e)}
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    background: 'rgb(200,200,200)',
                }}
            >
            </div>
        );
    }

}


export default Block;