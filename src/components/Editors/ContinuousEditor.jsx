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

    createBlock = e => {

    }

    renderGrid = () => {
        const { timeUnit } = this.props.store;
        const ctx = this.grid.getContext('2d');
    }

    render() {
        this.renderGrid();

        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous"
                onDblClick={e => this.createBlock(e)}
            >
                <canvas rel={el => this.grid = el}></canvas>
            </div>
        );
    }

}


export default ContinuousEditor;
