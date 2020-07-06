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
        const { blocks } = this.props.store;
        const { block, store } = this.props;
        const { left, top } = e.target.getBoundingClientRect();
        const editor = e.target.parentNode.parentNode.getBoundingClientRect();

        this.selectBlock(e);

        store.ui.setAction(new Action(actions.DRAG, {
            block,
            clientX: e.clientX,
            startX: e.clientX - left,
            startY: e.clientY - top,
            top: editor.top,
        }));
    }

    onMouseUp = e => {
        const { blocks, ui } = this.props.store;

        if (ui.userAction.data !== null) {
            const { block } = this.props;

            const delta = Math.abs(ui.userAction.data.clientX - e.clientX);

            if (!e.ctrlKey && delta < 15) {
                blocks.select(block);
            }
        }
    }

    onResize = (e, bound) => {
        const { block, store } = this.props;

        this.selectBlock(e);

        store.ui.setAction(new Action(actions.RESIZE, { block, bound, clientX: e.clientX }));
    }

    selectBlock(e) {
        const { block, store } = this.props;
        const { blocks } = store;

        if (!block.selected) {
            if (!e.ctrlKey) {
                blocks.select(block);
            }
            else {
                block.setSelected();
            }
        }
    }

    render() {
        const { config, spaces, viewport, ui } = this.props.store;
        const { selected, start, width, y, color } = this.props.block;
        const x = spaces.timeToPx(start);

        const handleWidth = {
            flex: `0 0 ${config.resizeHandleWidth}px`,
        };

        return (
            <div
                className={`react-timeline__block ${selected ? 'react-timeline__block--selected':''}`}
                style={{
                    left: `${x}px`,
                    top: `${y - viewport.top}px`,
                    width: `${width.px}px`,
                    height: `${config.blockHeight}px`,
                    background: color,
                }}
                onMouseUp={e => this.onMouseUp(e)}
            >
                <div className="react-timeline__block-handle" onMouseDown={e => this.onResize(e, 'start')} style={handleWidth} />
                <div className="react-timeline__block-content" onMouseDown={e => this.onMouseDown(e)} />
                <div className="react-timeline__block-handle" onMouseDown={e => this.onResize(e, 'end')} style={handleWidth} />
            </div>
        );
    }

}


export default Block;
