/**
 * Editors - Continuous Row
 *
 * This editor variation allows continuity in time's representation, while the y-value
 * remains snapped to a discrete track of rows.
 */

import {inject, observer} from 'mobx-react';

import AbstractEditor from './AbstractEditor';
import time from "../../time";


@inject('store')
@observer
class ContinuousRowEditor extends AbstractEditor {

    createBlock(e) {
        // Events propogate but we only want this behavior for the grid. It's easier
        // to check for a single correct target than having to remember to prevent
        // propogation of doubleClick events for every incorrect child element.
        if (e.target === this.grid) {
            const {blocks, config, spaces, ui, viewport} = this.props.store;
            const {width, height} = ui;
            const {left, right, top} = viewport;

            const y = Math.floor(((e.clientY - e.target.getBoundingClientRect().top) + top) / config.blockHeight);
            const startTime = spaces.pxToTime(e.clientX);
            const endTime = startTime + config.defaultBlockWidth;

            if (Math.random() < 0.3) {
                blocks.createBlock(startTime, endTime, y * config.blockHeight);
            } else {
                const block1 = blocks.createBlock(startTime - time.MONTH * 3, startTime, y * config.blockHeight);
                block1.color = '#c8fff0';
                const block2 = blocks.createBlock(startTime, endTime, y * config.blockHeight);

                block1.setBlockRight(block2);
                block2.setBlockLeft(block1);
            }

        }
    }

    listeners = {
        onDrag({x, y}) {
            const {blocks, config, spaces, ui, viewport} = this.root;
            const {block, startX, startY, top} = this.userAction.data;

            const xPos = (x - startX) - config.resizeHandleWidth; // Position minus the width of the resize handle
            const yPos = y - top;

            const deltaX = spaces.pxToTime(xPos) - block.start;
            const rowLevel = Math.floor(((yPos - block.y) + viewport.top) / config.blockHeight);

            const deltaY = (config.blockHeight * rowLevel);

            blocks.selected.forEach(_block => {
                _block.moveBy(deltaX, deltaY - (_block.y % config.blockHeight));
            });
            // console.log('onDrag');

        },
    }

}


export default ContinuousRowEditor;
