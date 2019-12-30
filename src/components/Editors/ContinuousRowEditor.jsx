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

    createBlock(e) {
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

    listeners = {
        onDrag({ x, y }) {
            const { blocks, config, spaces, ui, viewport } = this.root;
            const { block, startX, startY, top } = this.userAction.data;

            const xPos = (x - startX) - config.resizeHandleWidth; // Position minus the width of the resize handle
            const yPos = y - top;

            const deltaX = spaces.pxToTime(xPos) - block.start;
            //const deltaY = ((config.blockHeight * Math.floor(yPos / config.blockHeight)) - block.y) + viewport.top;

            //console.log(config.blockHeight * Math.floor(((yPos - block.y) + viewport.top) / config.blockHeight));
            const deltaY = config.blockHeight * Math.floor(((yPos - block.y) + viewport.top) / config.blockHeight);

            blocks.selected.forEach(_block => {
                _block.setStart(_block.start + deltaX);
                _block.setEnd(_block.end + deltaX);
                _block.setY(_block.y + deltaY);
            });

        },
    }

}


export default ContinuousRowEditor;
