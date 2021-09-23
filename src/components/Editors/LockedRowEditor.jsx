/**
 * Editors - Locked Row
 *
 * This editor variation allows continuity in time's representation, while the y-value
 * remains locked to a discrete track of rows.
 */

import {inject, observer} from 'mobx-react';

import AbstractEditor from './AbstractEditor';


@inject('store')
@observer
class LockedRowEditor extends AbstractEditor {

    createBlock(e) {
        // Events propogate but we only want this behavior for the grid. It's easier
        // to check for a single correct target than having to remember to prevent
        // propogation of doubleClick events for every incorrect child element.
        if (e.target === this.grid) {
            const { blocks, config, spaces, viewport } = this.props.store;
            const { top } = viewport;

            const y = Math.floor(((e.clientY - e.target.getBoundingClientRect().top) + top) / config.blockHeight);
            const startTime = spaces.pxToTime(e.clientX);
            const endTime = startTime + config.defaultBlockWidth;

            blocks.createBlock(`new_${Math.round(Math.random() * 1000000)}`, startTime, endTime, y * config.blockHeight);
        }
    }

    listeners = {
        onDrag({ x }) {
            const {blocks, config, spaces} = this.root;
            const {block, startX } = this.userAction.data;

            if (!block) {
                this.listeners.onMouseUp.bind(this)();
                return;
            }

            const xPos = (x - startX) - config.resizeHandleWidth; // Position minus the width of the resize handle
            const deltaX = spaces.pxToTime(xPos) - block.start;

            blocks.selected.forEach(_block => {
                _block.moveBy(deltaX, 0);
            });
        },
    }

}


export default LockedRowEditor;
