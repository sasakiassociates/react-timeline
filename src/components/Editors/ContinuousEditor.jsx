/**
 * Editors - Continuous
 *
 * This editor variation allows continuity in time's representation.
 */

import { inject, observer } from 'mobx-react';

import AbstractEditor from './AbstractEditor';


@inject('store')
@observer
class ContinuousEditor extends AbstractEditor {

    createBlock = e => {
        // Events propogate but we only want this behavior for the grid. It's easier
        // to check for a single correct target than having to remember to prevent
        // propogation of doubleClick events for every incorrect child element.
        if (e.target === this.grid) {
            const { blocks, spaces, ui, viewport } = this.props.store;
            const { width, height } = ui;
            const { left, right, top } = viewport;

            const y = e.clientY - e.target.getBoundingClientRect().top;
            const startTime = spaces.pxToTime(e.clientX);
            const endTime = spaces.pxToTime(e.clientX + (width * .1));

            blocks.createBlock(startTime, endTime, y + top);
        }
    }

}


export default ContinuousEditor;
