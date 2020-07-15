/**
 * UiStore
 *
 * Stores the current state of the UI.
 */

import { action, computed, observable } from 'mobx';

import Action, { actions } from '../types/action';

const keys = {
    BACKSPACE: 8,
    PLUS: 61,
    MINUS: 173,
};


export default class UIStore {

    constructor(root, props) {
        this.root = root;

        this.setAction(new Action(actions.NOOP));
        this.setListeners();

        if (props.scrubber) {
            this.setScrubber(props.scrubber === true ? this.root.viewport.width / 5 : props.scrubber);
        }
    }

    /*
     * The default listeners are suited for the ContinuousEditor. All other editors
     * will likely need to override a few of these listeners by using setListeners().
     */

    defaultListeners = {
        onDrag({ x, y }) {
            const { blocks, config, spaces, ui, viewport } = this.root;
            const { block, startX, startY, top } = this.userAction.data;

            if (!block) {
                this.listeners.onMouseUp.bind(this)();
                return;
            }

            const xPos = (x - startX) - config.resizeHandleWidth; // Position minus the width of the resize handle
            const yPos = (y - startY) - top;

            const deltaX = spaces.pxToTime(xPos) - block.start;
            const deltaY = (yPos - block.y) + viewport.top;

            blocks.selected.forEach(_block => {
                _block.setStart(_block.start + deltaX);
                _block.setEnd(_block.end + deltaX);
                _block.setY(_block.y + deltaY);
            });
        },

        onKeyDown(e) {
            if (!this.isFocused) return;

            const { root } = this;

            switch(e.keyCode) {
                case keys.BACKSPACE:
                    e.preventDefault();
                    e.stopPropagation();

                    root.blocks.selected.forEach(block => {
                        root.blocks.remove(block);
                    });

                    break;

                case keys.PLUS:
                    if (e.shiftKey) {
                        root.viewport.zoom(.5, -1);
                    }
                    break;

                case keys.MINUS:
                    root.viewport.zoom(.5, 1);
                    break;
            }
        },

        onMouseUp() {
            this.setAction(null);
            this.setSelectBox(null);

            for (let interval in this._intervals) {
                clearInterval(this._intervals[interval]);
                this._intervals[interval] = null;
            }
        },

        // Pull Pan
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

            const pushDelta = viewport.width * pushSpeed;
            const xPos = (x - ui.container.left) + startX;
            const yPos = (y - startY) - top;

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

            const pushHeight = (viewport.bottom - viewport.top) * (pushSpeed * 2);
            const yDirection = yPos < pushBuffer ? -1 : yPos > (ui.height * .85) - pushBuffer ? 1 : null;
            if (yDirection !== null) {
                if (this._intervals.verticalPush === null) {
                    this._intervals.verticalPush = setInterval(() => {
                        viewport.setTop(viewport.top + (yDirection * pushHeight));
                        blocks.selected.forEach(block => block.setY(block.y + (yDirection * pushHeight)));
                    }, this._interval);
                }
            }
            else {
                clearInterval(this._intervals.verticalPush);
                this._intervals.verticalPush = null;
            }
        },

        onResize({ x }) {
            const { blocks, spaces } = this.root;
            const { block, bound } = this.userAction.data;

            const delta = spaces.pxToTime(x) - block[bound];
            const method = `set${bound[0].toUpperCase()}${bound.substr(1,bound.length-1)}`;

            blocks.selected.forEach(block => {
                block[method](block[bound] + delta);
            });
        },

        onScrub({ x }) {
            this.setScrubber(this.root.spaces.pxToTime(x));
        },

        onScrubPan({ x }) {
            const { config, ui, viewport } = this.root;
            const { pushBuffer, pushSpeed } = config;

            const xPos = x - ui.container.left;

            const xPushDelta = viewport.width * pushSpeed;
            const xDirection = xPos < pushBuffer ? -1 : xPos > ui.width - pushBuffer ? 1 : null;
            if (xDirection !== null) {
                if (this._intervals.horizontalPush === null) {
                    this._intervals.horizontalPush = setInterval(() => {
                        viewport.setLeft(viewport.left + (xDirection * xPushDelta));
                        viewport.setRight(viewport.right + (xDirection * xPushDelta));
                    }, this._interval);
                }
            }
            else {
                clearInterval(this._intervals.horizontalPush);
                this._intervals.horizontalPush = null;
            }
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

        onWindowClick({ target }) {
            if (this.containerElement) {
                this.setFocused(this.containerElement.contains(target));
            }
        },
    }

    @observable container;
    @observable containerElement;
    @action setContainer(container = null) {
        const update = () => {
            this.container = this.containerElement.getBoundingClientRect();
        }

        if (container) {
            this.containerElement = container;
            (new ResizeObserver(update.bind(this)).observe(this.containerElement));
        }


        if (this.containerElement) {
            if (!this._hasSetEvents) {
                this._hasSetEvents = true;
                window.addEventListener('click', e => this.listeners.onWindowClick.call(this, e));
                window.addEventListener('resize', () => this.setContainer.bind(this)(e));
                window.addEventListener('keydown', e => this.listeners.onKeyDown.bind(this)(e));
            }

            update();
        }
    }

    _hasSetEvents = false;

    @observable isFocused = false;
    @action setFocused(focused = true) {
        this.isFocused = focused;
    }

    @observable listeners;
    @action setListeners(listeners = {}) {
        this.listeners = { ...this.defaultListeners, ...listeners };
    }

    @observable scrubber = { value: null };
    @action setScrubber(value) {
        if (typeof value === 'number') {
            this.scrubber.value = value;
        }
        else {
            this.scrubber = value;
        }
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
                this._addEvent('mousemove', this.listeners.onDrag.bind(this))
                this._addEvent('mousemove', this.listeners.onPushPan.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case actions.PAN:
                this._addEvent('mousemove', this.listeners.onPan.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case actions.RESIZE:
                this._addEvent('mousemove', this.listeners.onResize.bind(this))
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case actions.SCRUB:
                this._addEvent('mousemove', this.listeners.onScrub.bind(this));
                this._addEvent('mousemove', this.listeners.onScrubPan.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case actions.SELECT:
                this._addEvent('mousemove', this.listeners.onSelect.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            default:
                this.clearEvents();
        }
    }

    @computed get cursor() {
        return ({
            [actions.DRAG]: 'react-timeline--dragging',
            [actions.PAN]: 'react-timeline--dragging',
            [actions.RESIZE]: 'react-timeline--resizing',
            [actions.SCRUB]: 'react-timeline--resizing',
            [actions.SELECT]: 'react-timeline--selecting',
            [actions.NOOP]: '',
        })[this.userAction.type];
    }

    @computed get height() {
        return this.container ? this.container.height : 0;
    }

    @computed get scrubberPosition() {
        return this.scrubber.value;
    }

    @computed get width() {
        return this.container ? this.container.width : 0;
    }

    clearEvents() {
        this._events.forEach(({ name, listener, target }) => {
            target.removeEventListener(name, listener);
        }) ;
    }


    /**
     * Private
     */


    _events = [];

    _interval = 20;

    _addEvent(name, listener, target = window) {
        target.addEventListener(name, listener);
        this._events.push({ name, listener, target });
    }

    _intervals = {
        horizontalPush: null,
        verticalPush: null,
    }

};
