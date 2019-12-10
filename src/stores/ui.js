/**
 * UiStore
 *
 * Stores the current state of the UI.
 */

import { action, computed, observable } from 'mobx';

import Action, { actions } from '../types/action';


export default class UIStore {

    constructor(root) {
        this.root = root;

        this.setAction(new Action(actions.NOOP));

        window.addEventListener('resize', () => this.readDimensions());
    }


    @observable width;
    @observable height;
    @action readDimensions() {
        this.width = this.container.width;
        this.height = this.container.height;
    }


    @observable container;
    @action setContainer(container) {
        this.container = container.getBoundingClientRect();
        this.readDimensions();
    }

    @observable selectBox;
    @action setSelectBox(box = null) {
        this.selectBox = box;
    }


    @observable userAction;
    @action setAction(action = null) {
        if (action === null) {
            action = new Action();
        }

        this.userAction = action;

        switch(action.type) {
            case actions.DRAG:
                this._addEvent('mousemove', this._listeners.onDrag.bind(this))
                this._addEvent('mousemove', this._listeners.onPushPan.bind(this));
                this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
                break;

            case actions.PAN:
                this._addEvent('mousemove', this._listeners.onPan.bind(this));
                this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
                break;

            case actions.RESIZE:
                this._addEvent('mousemove', this._listeners.onResize.bind(this))
                this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
                break;

            case actions.SELECT:
                this._addEvent('mousemove', this._listeners.onSelect.bind(this));
                //this._addEvent('mousemove', this._listeners.onPushPan.bind(this));
                this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
                break;

            default:
                this._clearEvents();
        }
    }


    @computed get cursor() {
        return ({
            [actions.DRAG]: 'react-timeline--dragging',
            [actions.PAN]: 'react-timeline--dragging',
            [actions.RESIZE]: 'react-timeline--resizing',
            [actions.SELECT]: 'react-timeline--selecting',
            [actions.NOOP]: '',
        })[this.userAction.type];
    }


    /**
     * Private
     */

    _events = [];

    _addEvent(name, listener, target = window) {
        target.addEventListener(name, listener);
        this._events.push({ name, listener, target });
    }

    _clearEvents() {
        this._events.forEach(({ name, listener, target }) => {
            target.removeEventListener(name, listener);
        }) ;
    }

    _intervals = {
        horizontalPush: null,
        verticalPush: null,
    }

    _listeners = {
        onDrag({ x, y }) {
            const { blocks, spaces, ui, viewport } = this.root;
            const { block, startX, startY, top } = this.userAction.data;

            const xPos = (x - ui.container.left) + startX;
            const yPos = (y - startY) - top;

            const deltaX = spaces.pxToTime(xPos) - block.start;
            const deltaY = (yPos - block.y) + viewport.top;

            blocks.selected.forEach(_block => {
                _block.setStart(_block.start + deltaX);
                _block.setEnd(_block.end + deltaX);
                _block.setY(_block.y + deltaY);
            });
        },

        onMouseUp() {
            this.setAction(null);
            this.setSelectBox(null);

            for (let interval in this._intervals) {
                clearInterval(this._intervals[interval]);
                this._intervals[interval] = null;
            }
        },

        // Pull Panning
        onPan({ x, y }) {
            const { spaces, viewport } = this.root;
            const { startLeft, startRight, startTop, startX, startY, top } = this.userAction.data;

            const deltaX = spaces.pxDelta(startX, x) * Math.abs(startLeft - startRight);

            viewport.setTop(startTop - ((y - top) - startY));
            viewport.setRight(startRight - deltaX);
            viewport.setLeft(startLeft - deltaX);
        },

        onPushPan({ x, y }) {
            const { blocks, config, spaces, ui, viewport } = this.root;
            const { startX, startY, top } = this.userAction.data;
            const { pushSpeed, pushBuffer } = config;

            const FPS = 50;

            const pushWidth = viewport.width * pushSpeed;
            const xPos = (x - ui.container.left) + startX;
            const yPos = (y - startY) - top;

            const xDirection = xPos < pushBuffer ? -1 : xPos > ui.width - pushBuffer ? 1 : null;
            if (xDirection !== null) {
                if (this._intervals.horizontalPush === null) {
                    this._intervals.horizontalPush = setInterval(() => {
                        viewport.setLeft(viewport.left + (xDirection * pushWidth));
                        viewport.setRight(viewport.right + (xDirection * pushWidth));
                        blocks.selected.forEach(block => {
                            block.setEnd(block.end + (xDirection * pushWidth));
                            block.setStart(block.start + (xDirection * pushWidth));
                        });
                    }, 1000 / FPS);
                }
            }
            else {
                clearInterval(this._intervals.horizontalPush);
                this._intervals.horizontalPush = null;
            }

            const pushHeight = (viewport.bottom - viewport.top) * (pushSpeed * 2);
            const yDirection = yPos < pushBuffer ? -1 : yPos > (ui.height * .75) - pushBuffer ? 1 : null;
            if (yDirection !== null) {
                if (this._intervals.verticalPush === null) {
                    this._intervals.verticalPush = setInterval(() => {
                        viewport.setTop(viewport.top + (yDirection * pushHeight));
                        blocks.selected.forEach(block => block.setY(block.y + (yDirection * pushHeight)));
                    }, 1000 / FPS);
                }
            }
            else {
                clearInterval(this._intervals.verticalPush);
                this._intervals.verticalPush = null;
            }
        },

        onResize({ x }) {
            const { spaces } = this.root;
            const { block, method } = this.userAction.data;

            block[method](spaces.pxToTime(x));
        },

        onSelect({ x, y }) {
            const { blocks, spaces, ui, viewport } = this.root;
            const { startX, startY, top } = this.userAction.data;

            const blockHeight = 20;
            const height = (y - (startY - viewport.top)) - top;

            const x1 = spaces.pxToTime(startX);
            const x2 = spaces.pxToTime(x);

            // I don't know what this 8 is derived from, but it's necessary for the
            // ranges to calculate properly.
            const y1 = height >= 0 ? startY - 1 : ((startY + height) - blockHeight) - 8;
            const y2 = height >= 0 ? startY + height + 1 : startY + 1;

            blocks.elements.forEach(block => {
                block.setSelected(
                    (
                        (block.start >= x1 && block.start <= x2)
                        || (block.end >= x1 && block.end <= x2)
                        || (block.start <= x1 && block.end >= x2)
                    ) && (
                        block.y >= y1 && block.y <= y2
                    )
                );
            });

            this.setSelectBox({
                height,
                width: x - startX,
                x: x1,
                y: startY,
            });
        },
    }

};
