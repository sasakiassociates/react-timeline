/**
 * Block Proxy
 */

import { 
    action,
    computed, 
    observable, 
    makeObservable, 
    runInAction 
} from 'mobx';

import { v4 as uuidv4 } from 'uuid';

import { Timespan } from '../types';


export default class BlockProxy {

    readonly id: string;

    constructor() {
        makeObservable(this);

        this.id = uuidv4();
    }


    // Selected Proxy

    @observable
    _selected: boolean = false;

    @computed
    get selected() {
        return this._selected;
    }

    setSelected(selected: boolean) {
        runInAction(() => {
            this._selected = selected;
        });
    }
 

    // Timespan Proxy

    @observable
    _timespan: Timespan = { start: 0, end: 0 };

    @computed
    get timespan() {
        return this._timespan;
    }

    setTimespan(timespan: Timespan) {
        runInAction(() => {
            this._timespan = timespan;
        });
    }

    // Y Proxy

    @observable
    _y: number = 0;

    @computed
    get y() {
        return this._y;
    }

    setY(y: number) {
        runInAction(() => {
            this._y = y;
        });
    }

    // Non-proxy properties
    
    @observable
    color: string = '#aaa';

    @action
    setColor(color: string) {
        this.color = color;
    }


    // Public Methods

    moveBy(deltaX: number, deltaY: number) {
        this.setTimespan({
            start: this.start + deltaX,
            end: this.end + deltaX,
        });

        this.setY(this.y + deltaY);
    }

    destroy() {
    }


    // Computed

    @computed 
    get duration() {
        return this.end - this.start;
    }

    @computed
    get start() {
        return this.timespan.start;
    }
   
    @computed
    get end() {
        return this.timespan.end;
    }

}
