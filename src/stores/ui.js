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


    @observable userAction;
    @action setAction(action = null) {
        if (action === null) {
            action = new Action();
        }

        this.userAction = action;

        switch(action.type) {
            case actions.DRAG:
                this._addEvent('mousemove', this._listeners.onDrag.bind(this))
                this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
                break;

            case actions.PAN:
                this._addEvent('mousemove', this._listeners.onPan.bind(this))
                this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
                break;

            case actions.RESIZE:
                this._addEvent('mousemove', this._listeners.onResize.bind(this))
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
            const FPS = 50;

            const { config, spaces, ui, viewport } = this.root;
            const { block, startX, startY, top } = this.userAction.data;

            const xPos = x - ui.container.left;
            const yPos = y - top;

            const newStartTime = spaces.pxToTime(x - startX);

            block.setEnd(block.end + (newStartTime - block.start));
            block.setStart(newStartTime);
            block.setY((yPos - startY) + viewport.top);

            // Push Panning
            const pushWidth = viewport.width * config.pushSpeed;
            if (xPos < config.pushBuffer) {
                if (this._intervals.horizontalPush === null) {
                    this._intervals.horizontalPush = setInterval(() => {
                        viewport.setLeft(viewport.left - pushWidth);
                        viewport.setRight(viewport.right - pushWidth);
                        block.setEnd(block.end - pushWidth);
                        block.setStart(block.start - pushWidth);
                    }, 1000 / FPS);
                }
            }
            else if (xPos > ui.width - config.pushBuffer) {
                if (this._intervals.horizontalPush === null) {
                    this._intervals.horizontalPush = setInterval(() => {
                        viewport.setLeft(viewport.left + pushWidth);
                        viewport.setRight(viewport.right + pushWidth);
                        block.setEnd(block.end + pushWidth);
                        block.setStart(block.start + pushWidth);
                    }, 1000 / FPS);
                }
            }
            else {
                clearInterval(this._intervals.horizontalPush);
                this._intervals.horizontalPush = null;
            }

            const pushHeight = (viewport.bottom - viewport.top) * (config.pushSpeed * 2);
            if (yPos < config.pushBuffer) {
                if (this._intervals.verticalPush === null) {
                    this._intervals.verticalPush = setInterval(() => {
                        viewport.setTop(viewport.top - pushHeight);
                        block.setY(block.y - pushHeight);
                    }, 1000 / FPS);
                }
            }
            else if (yPos > (ui.height * .75) - config.pushBuffer) {
                if (this._intervals.verticalPush === null) {
                    this._intervals.verticalPush = setInterval(() => {
                        viewport.setTop(viewport.top + pushHeight);
                        block.setY(block.y + pushHeight);
                    }, 1000 / FPS);
                }
            }
            else {
                clearInterval(this._intervals.verticalPush);
                this._intervals.verticalPush = null;
            }
        },

        onMouseUp() {
            this.setAction(null);

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

        onResize({ x }) {
            const { spaces } = this.root;
            const { block, method } = this.userAction.data;

            block[method](spaces.pxToTime(x));
        },
    }

};
