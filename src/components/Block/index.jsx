/**
 * Block
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import Action, { actions } from '../../types/action';


@inject('store')
@observer
class Block extends React.Component {

    onMouseDown = e => {
        const { block, store } = this.props;
        const { left, top } = e.target.getBoundingClientRect();

        store.ui.setAction(new Action(actions.DRAG, {
            block,
            editorTop: e.target.parentNode.parentNode.getBoundingClientRect().top,
            startX: e.clientX - left,
            startY: e.clientY - top,
        }));
    }

    onResize = method => {
        const { block, store } = this.props;

        store.ui.setAction(new Action(actions.RESIZE, { block, method }));
    }

    render() {
        const { time, viewport, ui } = this.props.store;
        const { start, width, y } = this.props.block;
        const x = time.timeToPx(start);

        return (
            <div
                className="react-timeline__block"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    background: 'rgb(200,200,200)',
                }}
            >
                <div className="react-timeline__block-handle" onMouseDown={e => this.onResize('setStart')} />
                <div className="react-timeline__block-content" onMouseDown={e => this.onMouseDown(e)} />
                <div className="react-timeline__block-handle" onMouseDown={e => this.onResize('setEnd')} />
            </div>
        );
    }

}


export default Block;
