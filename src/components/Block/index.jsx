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

        store.ui.setAction(actions.DRAG, {
            block,
            container: e.target.parentNode.parentNode.getBoundingClientRect(),
            elem: e.target,
            startX: e.clientX - left,
            startY: e.clientY - top,
        });
    }

    onResize = (e, method) => {
        const { left, top } = e.target.getBoundingClientRect();
        const startX = e.clientX - left;

        this.props.store.ui.setAction(actions.RESIZE, {
            block: this.props.block,
            container: e.target.parentNode.parentNode.getBoundingClientRect(),
            method,
            startX,
        });
    }

    render() {
        const { viewport, ui } = this.props.store;
        const { start, width, y } = this.props.block;
        const x = (1 - ((viewport.width - start) / viewport.width)) * (ui.width / (1 - viewport.meridianRatio));

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
                <div className="react-timeline__block-handle" onMouseDown={e => this.onResize(e, 'setStart')} />
                <div className="react-timeline__block-content" onMouseDown={e => this.onMouseDown(e)} />
                <div className="react-timeline__block-handle" onMouseDown={e => this.onResize(e, 'setEnd')} />
            </div>
        );
    }

}


export default Block;
