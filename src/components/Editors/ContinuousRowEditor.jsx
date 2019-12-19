/**
 * Editors - Continuous Row
 *
 * This editor variation allows continuity in time's representation, while the y-value
 * remains snapped to a discrete track of rows.
 */

import { inject, observer } from 'mobx-react';

import AbstractEditor from './AbstractEditor';


@inject('store')
@observer
class ContinuousRowEditor extends AbstractEditor {

    createBlock = e => {
        // Events propogate but we only want this behavior for the grid. It's easier
        // to check for a single correct target than having to remember to prevent
        // propogation of doubleClick events for every incorrect child element.
        if (e.target === this.grid) {
            const { blocks, config, spaces, ui, viewport } = this.props.store;
            const { width, height } = ui;
            const { left, right, top } = viewport;

            const y = Math.floor(((e.clientY - e.target.getBoundingClientRect().top) + top) / config.blockHeight);
            const startTime = spaces.pxToTime(e.clientX);
            const endTime = spaces.pxToTime(e.clientX + (width * .1));

            blocks.createBlock(startTime, endTime, y * config.blockHeight);
        }
    }

}


export default ContinuousRowEditor;
