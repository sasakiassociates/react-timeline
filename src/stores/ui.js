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
            const { time, ui, vewiport } = this.root;
            const { block, editorTop, startX, startY } = this.userAction.data;

            const newStartTime = time.pxToTime(x - startX);

            block.setEnd(block.end + (newStartTime - block.start));
            block.setStart(newStartTime);
            block.setY((y - startY) - editorTop);
        },

        onMouseUp() {
            this.setAction(null);
        },

        onPan({ x }) {
            const { time, viewport } = this.root;
            const { container, startLeft, startX } = this.userAction.data;

            const newLeftTime = time.pxToTime(x - startX);

            viewport.setRight((startLeft - newLeftTime) + viewport.width);
            viewport.setLeft(startLeft - newLeftTime);
        },

        onResize({ x }) {
            const { time } = this.root;
            const { block, method } = this.userAction.data;

            block[method](time.pxToTime(x));
        },
    }

    _calculateTimeFromPx(start, end, container) {
        const { viewport } = this.root;

        return (1 - viewport.meridianRatio) * (viewport.width * (((end - container.left) - start) / container.width));
    }

};
