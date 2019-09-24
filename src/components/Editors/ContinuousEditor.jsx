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

    createBlock(e) {

    }

    render() {
        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous"
                onClick={e => this.createBlock(e)}
            >
            </div>
        );
    }

}


export default ContinuousEditor;
