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
                _block.setY(_block.y)
            });
        },

        onPushPan({ x, y }) {
            if (this.zoomLock) return;

            const { blocks, config, ui, viewport } = this.root;
            const { startX, startY, top } = this.userAction.data;
            const { pushSpeed, pushBuffer } = config;

            const pushDelta = viewport.width * pushSpeed;
            const xPos = (x - ui.container.left) + startX;
            const yPos = (y - startY) - top;

            if (!this.zoomLock) {//zoomLock only locks left/right , you can still pan top/bottom
                const xDirection = xPos < pushBuffer ? -1 : xPos > ui.width - pushBuffer ? 1 : null;
                if (xDirection !== null) {
                    if (this._intervals.horizontalPush === null) {
                        this._intervals.horizontalPush = setInterval(() => {
                            viewport.setLeft(viewport.left + (xDirection * pushDelta));
                            viewport.setRight(viewport.right + (xDirection * pushDelta));
                            blocks.selected.forEach(block => {
                                block.setEnd(block.end + (xDirection * pushDelta));
                                block.setStart(block.start + (xDirection * pushDelta));
                            });
                        }, this._interval);
                    }
                }
                else {
                    clearInterval(this._intervals.horizontalPush);
                    this._intervals.horizontalPush = null;
                }
            }

            const pushHeight = (viewport.bottom - viewport.top) * (pushSpeed * 2);
            const yDirection = yPos < pushBuffer ? -1 : yPos > (ui.height * .85) - pushBuffer ? 1 : null;
            if (yDirection !== null) {
                if (this._intervals.verticalPush === null) {
                    this._intervals.verticalPush = setInterval(() => {
                        viewport.setTop(viewport.top + (yDirection * pushHeight));
                    }, this._interval);
                }
            }
            else {
                clearInterval(this._intervals.verticalPush);
                this._intervals.verticalPush = null;
            }

        }
    }

}


export default LockedRowEditor;
