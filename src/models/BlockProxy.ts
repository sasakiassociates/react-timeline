/**
 * Block Proxy
 */

import { 
    computed, 
    observable, 
    makeObservable, 
    runInAction 
} from 'mobx';

//import { v4 as uuidv4 } from 'uuid';

import { Timespan } from '../types';


export default class BlockProxy {

    constructor() {
        makeObservable(this);
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


    destroy() {
    }
 
}
