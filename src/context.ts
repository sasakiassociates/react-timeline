import { createContext, useContext } from 'react';
import { action, computed, observable, makeObservable } from 'mobx';

import Action, { Actions } from './models/Action';


export class TimelineStore {

    constructor() {
        makeObservable(this);
    }

    @observable 
    action: Action = new Action();

    @action 
    setAction(action = new Action()) {
        this.action = action;

        switch(action.type) {
                /*
            case Actions.DRAG:
                this._addEvent('mousemove', this.listeners.onDrag.bind(this))
                this._addEvent('mousemove', this.listeners.onPushPan.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case Actions.PAN:
                this._addEvent('mousemove', this.listeners.onPan.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case Actions.RESIZE:
                this._addEvent('mousemove', this.listeners.onResize.bind(this))
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case Actions.SCRUB:
                this._addEvent('mousemove', this.listeners.onScrub.bind(this));
                this._addEvent('mousemove', this.listeners.onScrubPan.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;

            case Actions.SELECT:
                this._addEvent('mousemove', this.listeners.onSelect.bind(this));
                this._addEvent('mouseup', this.listeners.onMouseUp.bind(this));
                break;
                */

            default:
                this.clearEvents();
        }
    }

    @observable
    element?: HTMLDivElement;
    
    @action
    setElement(element: HTMLDivElement) {
        this.element = element;
    }

    @computed 
    get cursor() {
        return ({
            [Actions.DRAG]: 'ReactTimeline--dragging',
            [Actions.PAN]: 'ReactTimeline--dragging',
            [Actions.RESIZE]: 'ReactTimeline--resizing',
            [Actions.SCRUB]: 'ReactTimeline--resizing',
            [Actions.SELECT]: 'ReactTimeline--selecting',
            [Actions.NOOP]: '',
        })[this.action.type];
    }

    @computed 
    get height() {
        if (this.element) {
            return this.element.getBoundingClientRect().height;
        }

        return 0;
    }

    @computed 
    get width() {
        if (this.element) {
            return this.element.getBoundingClientRect().width;
        }

        return 0;
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

};


export const TimelineContext = createContext<TimelineStore>(new TimelineStore());
export const useTimeline = () => useContext<TimelineStore>(TimelineContext);
