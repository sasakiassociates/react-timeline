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

    _listeners = {
        onDrag({ x, y }) {
            const { spaces } = this.root;
            const { block, startX, startY, top } = this.userAction.data;

            const newStartTime = spaces.pxToTime(x - startX);

            block.setEnd(block.end + (newStartTime - block.start));
            block.setStart(newStartTime);
            block.setY((y - startY) - top);
        },

        onMouseUp() {
            this.setAction(null);
        },

        onPan({ x }) {
            const { spaces, viewport } = this.root;
            const { startLeft, startRight, startX } = this.userAction.data;

            const delta = spaces.pxDelta(startX, x) * Math.abs(startLeft - startRight);

            viewport.setRight(startRight - delta);
            viewport.setLeft(startLeft - delta);
        },

        onResize({ x }) {
            const { spaces } = this.root;
            const { block, method } = this.userAction.data;

            block[method](spaces.pxToTime(x));
        },
    }

};
