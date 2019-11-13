/**
 * UiStore
 *
 * Stores the current state of the UI.
 */

import { action, computed, observable } from 'mobx';

import { actions } from '../types/action';


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
    @action setAction(type = null, data) {
        if (type === null) {
            type = actions.NOOP;
        }

        this.userAction = { type, data };

        if (type === actions.RESIZE) {
            this._addEvent('mousemove', this._listeners.onResize.bind(this))
            this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
        }
        else if (type === actions.DRAG) {
            this._addEvent('mousemove', this._listeners.onDrag.bind(this))
            this._addEvent('mouseup', this._listeners.onMouseUp.bind(this));
        }
        else {
            this._clearEvents();
        }
    }


    @computed get cursor() {
        return ({
            [actions.DRAG]: 'react-timeline--dragging',
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

        onResize({ x }) {
            const { viewport } = this.root;
            const { block, container, method, startX } = this.userAction.data;

            block[method](this._calculateTimeFromPx(startX, x, container));
        },
    }

    _calculateTimeFromPx(start, end, container) {
        const { viewport } = this.root;

        return (1 - viewport.meridianRatio) * (viewport.width * (((end - start) - container.left) / container.width));
    }

};
