/**
 * Block State
 */

import { v4 as uuidv4 } from 'uuid';
import { action, computed, observable, makeObservable } from 'mobx';

import config from '../config';
import { Timespan } from '../types';
import BlockProxy from './BlockProxy';
import SegmentState from './SegmentState';
import TimelineStore from '../stores/TimelineStore';


export default class BlockState {
    

    readonly id: string;
    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        makeObservable(this);

        this.id = uuidv4();
        this.root = root;
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

    @observable
    segments: SegmentState[] = [];

    @action
    addSegment(segment: SegmentState) {
        this.segments.push(segment);
    }

    @action
    removeSegment(segment: SegmentState) {
        this.segments.splice(this.segments.indexOf(segment), 1);
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
        this.segments.forEach(segment => segment.setValue(segment.value + deltaX));

        this.setTimespan({
            start: this.start + deltaX,
            end: this.end + deltaX,
        });

        this.setY(this.y + deltaY);
    }

    @computed
    get visible() {
        const { viewport } = this.root;
        const { start, end, y }  = this;

        return (
            (
                (
                    start >= viewport.left
                    && start <= viewport.right
                ) || (
                    end >= viewport.left
                    && end <= viewport.right
                ) || (
                    start <= viewport.left
                    && end >= viewport.right
                )
            ) && (
                y >= viewport.top - config.blockHeight
                && y - config.blockHeight <= viewport.bottom + config.blockHeight
            )
        );
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
