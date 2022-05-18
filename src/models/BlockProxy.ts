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

import { Timespan } from '../types';


export interface IBlockProxy {
    selected?: boolean;
    onSelectedChange?: (selected: boolean) => any;
    timespan?: Timespan;
    onTimespanChange?: (t: Timespan) => any;
    y?: number;
    onYChange?: (y: number) => any;
};

export default class BlockProxy implements IBlockProxy {

    constructor() {
        makeObservable(this);
    }

    // Selected Proxy

    @observable
    selected: boolean = false;

    setSelected(selected: boolean) {
        runInAction(() => {
            this._onSelectedChange(selected);
        });
    }
 
    setOnSelectedChange(onSelectedChange: (selected: boolean) => any) {
        this._onSelectedChange = onSelectedChange;
    }

    private _onSelectedChange(selected: boolean) {
        this.__internalSetSelected(selected);
    }

    @action
    __internalSetSelected(selected: boolean) {
        this.selected = selected;
    }

    // Timespan Proxy

    @observable
    timespan: Timespan = { start: 0, end: 0 };

    setTimespan(timespan: Timespan) {
        runInAction(() => {
            this._onTimespanChange(timespan);
        });
    }
 
    setOnTimespanChange(onTimespanChange: (timespan: Timespan) => any) {
        this._onTimespanChange = onTimespanChange;
    }

    private _onTimespanChange(timespan: Timespan) {
        this.__internalSetTimespan(timespan);
    }

    @action
    __internalSetTimespan(timespan: Timespan) {
        this.timespan = timespan;
    }


    // Y Proxy

    @observable
    y: number = 0;

    setY(y: number) {
        runInAction(() => {
            this._onYChange(y);
        });
    }
   
    setOnYChange(onYChange: (y: number) => any) {
        this._onYChange = onYChange;
    }

    private _onYChange(y: number) {
        this.__internalSetY(y);
    }

    @action
    __internalSetY(y: number) {
        this.y = y;
    }


    // Public Methods

    moveBy(deltaX: number, deltaY: number) {
        this.setTimespan({
            start: this.start + deltaX,
            end: this.end + deltaX,
        });

        this.setY(this.y + deltaY);
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
