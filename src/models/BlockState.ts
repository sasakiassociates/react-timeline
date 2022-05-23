/**
 * Block State
 */

import { v4 as uuidv4 } from 'uuid';
import { action, computed, observable, makeObservable } from 'mobx';

import BlockProxy from './BlockProxy';
import { Timespan } from '../types';


export default class BlockState {
    
    readonly id: string;

    constructor() {
        makeObservable(this);
        
        this.id = uuidv4();
    }

    @observable
    proxy: BlockProxy = new BlockProxy();

    @action
    setProxy(proxy: BlockProxy) {
        this.proxy = proxy;
    }

    @observable
    color: string = '#aaa';

    @action
    setColor(color: string) {
        this.color = color;
    }

    @computed
    get selected() {
        return this.proxy.selected;
    }

    setSelected(selected: boolean) {
        this.proxy.setSelected(selected);
    }

    @computed
    get timespan() {
        return this.proxy.timespan;
    }

    setTimespan(timespan: Timespan) {
        this.proxy.setTimespan(timespan);
    }

    @computed
    get y() {
        return this.proxy.y;
    }

    setY(y: number) {
        this.proxy.setY(y);
    }

    destroy() {
        this.proxy.destroy();
    }

    moveBy(deltaX: number, deltaY: number) {
        this.setTimespan({
            start: this.start + deltaX,
            end: this.end + deltaX,
        });

        this.setY(this.y + deltaY);
    }

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
