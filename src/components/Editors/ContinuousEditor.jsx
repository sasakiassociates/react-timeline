/**
 * Editors - Continuous
 *
 * This editor variation allows continuity in time's representation.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';


@inject('store')
@observer
class ContinuousEditor extends React.Component {


    componentDidMount() {
        this.renderGrid();
    }

    componentDidUpdate() {
        this.renderGrid();
    }

    createBlock = e => {
    }

    renderGrid = () => {
        if (this.grid && this.container) {
            const { zoom } = this.props.store;
            const { width, height } = this.props.store.ui;

            const ctx = this.grid.getContext('2d');

            const unitLength = 150 * zoom;

            const mid = Math.round(width / 2);
            let offset = 0;

            /*
            while (offset < mid) {
                offset += unitLength;
            }
            */
        }
    }

    render() {
        const { ui } = this.props.store;

        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous"
                onDoubleClick={e => this.createBlock(e)}
            >
                <canvas width={`${ui.width}px`} height={`${ui.height * .75}px`} ref={el => this.grid = el}></canvas>
            </div>
        );
    }

}


export default ContinuousEditor;
