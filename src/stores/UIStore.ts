/**
 * UIStore
 *
 * Stores the current state of the UI.
 */

import { action, computed, observable, makeObservable } from 'mobx';

import config from '../config';
import TimelineStore from './TimelineStore';
import BlockProxy from '../models/BlockProxy';
import Action, { Actions } from '../models/Action';


const keys = {
    BACKSPACE: 8,
    PLUS: 61,
    MINUS: 173,
};


export default class UIStore {

    private readonly root: TimelineStore; 

    constructor(root: TimelineStore) {
        this.root = root;

        /*
        if (props.onScrubberChange) {
            this.onScrubberChange = props.onScrubberChange;
        }

        if (props.scrubber) {
            this.setScrubber(props.scrubber === true ? this.root.viewport.width / 5 : props.scrubber);
        }
        */

        makeObservable(this);
    }

    onScrubberChange() {
    }

    onDrag({ x }) {
        const { blocks, spaces } = this.root;
        const { block, startX } = this.action.data;

        if (!block) {
            this.onMouseUp.bind(this)();
            return;
        }

        const xPos = (x - startX) - config.resizeHandleWidth; // Position minus the width of the resize handle
        const deltaX = spaces.pxToTime(xPos) - block.start;

        blocks.selected.forEach(_block => {
            _block.moveBy(deltaX, 0);
        });
    }

    onKeyDown(e: KeyboardEvent) {
        if (!this.isFocused) return;

        const { blocks, viewport } = this.root as TimelineStore;

        switch(e.keyCode) {
            case keys.BACKSPACE:
                e.preventDefault();
                e.stopPropagation();

                blocks.selected.forEach((block: BlockProxy) => {
                    blocks.remove(block);
                });

                break;

            case keys.PLUS:
                if (e.shiftKey) {
                    viewport.zoom(.5, -1);
                }
                break;

            case keys.MINUS:
                viewport.zoom(.5, 1);
                break;
        }
    }

    onMouseUp() {
        this.setAction();
        this.setSelectBox(null);

        for (let interval in this._intervals) {
            clearInterval(this._intervals[interval]);
            this._intervals[interval] = null;
        }
    }

    // Pull Pan
    onPan({ x, y }) {
        const { spaces, viewport } = this.root;
        const { startLeft, startRight, startTop, startX, startY, top } = this.action.data;

        const deltaX = spaces.pxDelta(startX, x) * Math.abs(startLeft - startRight);

        viewport.setValue({
            top: startTop - ((y - top) - startY),
            right: startRight - deltaX,
            left: startLeft - deltaX,
        });
    }

    onPushPan({ x, y }) {
        const { blocks, ui, viewport } = this.root;
        const { startX, startY, top } = this.action.data;
        const { pushSpeed, pushBuffer } = config;

        const pushDelta = viewport.width * pushSpeed;
        const xPos = (x - ui.container.left) + startX;
        const yPos = (y - startY) - top;

        const xDirection = xPos < pushBuffer ? -1 : xPos > ui.width - pushBuffer ? 1 : null;
        if (xDirection !== null) {
            if (this._intervals.horizontalPush === null) {
                this._intervals.horizontalPush = setInterval(() => {
                    viewport.setValue({
                        top: viewport.top,
                        left: viewport.left + (xDirection * pushDelta),
                        right: viewport.right + (xDirection * pushDelta),
                    });
                    blocks.selected.forEach((block: BlockProxy) => {
                        block.setTimespan({
                            start: block.start + (xDirection * pushDelta),
                            end: block.end + (xDirection * pushDelta)
                        });
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
                    viewport.setValue({
                        top: viewport.top + (yDirection * pushHeight),
                        left: viewport.left,
                        right: viewport.right,
                    });
                    blocks.selected.forEach((block: BlockProxy) => block.setY(block.y + (yDirection * pushHeight)));
                }, this._interval);
            }
        }
        else {
            clearInterval(this._intervals.verticalPush);
            this._intervals.verticalPush = null;
        }
    }

    onResize({ x }) {
        const { blocks, spaces } = this.root;
        const { block, bound } = this.action.data;

        const delta = spaces.pxToTime(x) - block[bound];
        const method = `set${bound[0].toUpperCase()}${bound.substr(1,bound.length-1)}`;

        blocks.selected.forEach(block => {
            block[method](block[bound] + delta);
        });
    }

    onScrub(/*{ x }*/) {
        //this.setScrubber(this.root.spaces.pxToTime(x));
    }

    onScrubPan({ x }) {
        const { ui, viewport } = this.root;
        const { pushBuffer, pushSpeed } = config;

        const xPos = x - ui.container.left;

        const xPushDelta = viewport.width * pushSpeed;
        const xDirection = xPos < pushBuffer ? -1 : xPos > ui.width - pushBuffer ? 1 : null;
        if (xDirection !== null) {
            if (this._intervals.horizontalPush === null) {
                this._intervals.horizontalPush = setInterval(() => {
                    viewport.setValue({
                        left: viewport.left + (xDirection * xPushDelta),
                        right: viewport.right + (xDirection * xPushDelta),
                        top: viewport.top,
                    })
                }, this._interval);
            }
        }
        else {
            clearInterval(this._intervals.horizontalPush);
            this._intervals.horizontalPush = null;
        }
    }

    onSelect({ x, y }) {
        const { blocks, spaces, viewport } = this.root;
        const { startX, startY, top } = this.action.data;

        const blockHeight = 20;
        const height = (y - (startY - viewport.top)) - top;

        const x1 = spaces.pxToTime(startX);
        const x2 = spaces.pxToTime(x);

        // I don't know what this 8 is derived from, but it's necessary for the
        // ranges to calculate properly.
        const y1 = height >= 0 ? startY - 1 : ((startY + height) - blockHeight) - 8;
        const y2 = height >= 0 ? startY + height + 1 : startY + 1;

        blocks.all.forEach((block: BlockProxy) => {
            block.setSelected((
                (block.start >= x1 && block.start <= x2)
                || (block.end >= x1 && block.end <= x2)
                || (block.start <= x1 && block.end >= x2)
            ) && (
                block.y >= y1 && block.y <= y2
            ));
        });

        this.setSelectBox({
            height,
            width: x - startX,
            x: x1,
            y: startY,
        });
    }

    onWindowClick({ target }) {
        if (this.element) {
            this.setFocused(this.element.contains(target));
        }
    }

    @observable 
    container: DOMRect = new DOMRect();

    @action
    setContainer(container: DOMRect) {
        this.container = container;
    }

    @observable 
    element: HTMLDivElement|null = null;

    @action 
    setElement(element: HTMLDivElement|null = null) {
        if (element !== null) {
            const update = () => {
                this.setContainer(this.element.getBoundingClientRect());
            };

            this.element = element;
            (new ResizeObserver(() => update()).observe(this.element));

            if (!this._hasSetEvents) {
                this._hasSetEvents = true;

                window.addEventListener('click', e => this.onWindowClick.call(this, e));
                window.addEventListener('keydown', e => this.onKeyDown.bind(this)(e));
            }

            update();
        }
    }

    @observable
    editor?: HTMLDivElement;
    
    @action
    setEditor(editor: HTMLDivElement) {
        this.editor = editor; 
    }

    @observable 
    isFocused: boolean = false;

    @action 
    setFocused(focused = true) {
        this.isFocused = focused;
    }

    @observable selectBox;
    @action setSelectBox(box = null) {
        this.selectBox = box;
    }

    @observable 
    action: Action = new Action();

    @action 
    setAction(action = new Action()) {
        this.action = action;

        switch(action.type) {
            case Actions.DRAG:
                this._addEvent('mousemove', this.onDrag.bind(this))
                this._addEvent('mousemove', this.onPushPan.bind(this));
                this._addEvent('mouseup', this.onMouseUp.bind(this));
                break;

            case Actions.PAN:
                this._addEvent('mousemove', this.onPan.bind(this));
                this._addEvent('mouseup', this.onMouseUp.bind(this));
                break;

            case Actions.RESIZE:
                this._addEvent('mousemove', this.onResize.bind(this))
                this._addEvent('mouseup', this.onMouseUp.bind(this));
                break;

            case Actions.SCRUB:
                this._addEvent('mousemove', this.onScrub.bind(this));
                this._addEvent('mousemove', this.onScrubPan.bind(this));
                this._addEvent('mouseup', this.onMouseUp.bind(this));
                break;

            case Actions.SELECT:
                this._addEvent('mousemove', this.onSelect.bind(this));
                this._addEvent('mouseup', this.onMouseUp.bind(this));
                break;

            default:
                this.clearEvents();
        }
    }

    @computed 
    get cursor() {
        return ({
            [Actions.DRAG]: 'react-timeline--dragging',
            [Actions.PAN]: 'react-timeline--dragging',
            [Actions.RESIZE]: 'react-timeline--resizing',
            [Actions.SCRUB]: 'react-timeline--resizing',
            [Actions.SELECT]: 'react-timeline--selecting',
            [Actions.NOOP]: '',
        })[this.action.type];
    }

    @computed 
    get height() {
        return this.container ? this.container.height : 0;
    }

    @computed 
    get width() {
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


    private _events = [];

    private _interval = 20;

    private _addEvent(name: string, listener: any, target = window) {
        target.addEventListener(name, listener);
        this._events.push({ name, listener, target });
    }

    private _intervals = {
        horizontalPush: null,
        verticalPush: null,
    }

    private _hasSetEvents = false;

};