/**
 * UiStore
 *
 * Stores the current state of the UI.
 */

import { action, computed, observable } from 'mobx';

import Action, { actions } from '../types/action';


export default class UiStore {

    constructor(root) {
        this.root = root;

        this.setAction(actions.NOOP);
        window.addEventListener('resize', () => this.readDimensions());
    }


    @observable width;
    @observable height;
    @action readDimensions() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
    }


    @observable container;
    @action setContainer(container) {
        this.container = container;
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
            const { viewport } = this.root;
            const { block, container, startX, startY } = this.userAction.data;

            const newStartTime = this._calculateTimeFromPx(startX, x, container);

            block.setEnd(block.end + (newStartTime - block.start));
            block.setStart(newStartTime);
            block.setY((y - startY) - container.top);
        },

        onMouseUp() {
            this.setAction(null);
        },

        onPan({ x }) {
            const { viewport } = this.root;
            const { container, startLeft, startX } = this.userAction.data;

            const newLeftTime = this._calculateTimeFromPx(startX, x, container);

            viewport.setRight((startLeft - newLeftTime) + viewport.width);
            viewport.setLeft(startLeft - newLeftTime);

            //const newLeftTime = this._calculateTimeFromPx(startX, x, container);

            //viewport.setRight(viewport.right + (newLeftTime - viewport.left));
            //viewport.setLeft(newLeftTime);
        },

        onResize({ x }) {
            const { block, container, method, startTime, startX } = this.userAction.data;

            block[method](startTime + this._calculateTimeFromPx(startX, x, container));
        },
    }

    _calculateTimeFromPx(start, end, container) {
        const { viewport } = this.root;

        return (1 - viewport.meridianRatio) * (viewport.width * (((end - container.left) - start) / container.width));
    }

};
