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
        const editor = e.target.parentNode.parentNode.getBoundingClientRect();

        store.ui.setAction(new Action(actions.DRAG, {
            block,
            startX: e.clientX - left,
            startY: e.clientY - top,
            top: editor.top,
        }));
    }

    onResize = method => {
        const { block, store } = this.props;

        store.ui.setAction(new Action(actions.RESIZE, { block, method }));
    }

    render() {
        const { spaces, viewport, ui } = this.props.store;
        const { start, width, y } = this.props.block;
        const x = spaces.timeToPx(start);

        return (
            <div
                className="react-timeline__block"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width.px}px`,
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
