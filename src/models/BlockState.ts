/**
 * Block State
 */

import { v4 as uuidv4 } from 'uuid';
import { action, computed, observable, makeObservable } from 'mobx';

import config from '../config';
import { Timespan } from '../types';
import BlockProxy from './BlockProxy';
import SegmentProxy from './SegmentProxy';
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
    segments: SegmentProxy[] = [];

    @action
    addSegment(segment: SegmentProxy) {
        this.segments.push(segment);
    }

    @action
    removeSegment(segment: SegmentProxy) {
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
        this.segments.forEach(segment => {
            console.log(segment.value,  deltaX, segment.value + deltaX);
            segment.setValue(segment.value + deltaX);
        });

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

        return this.selected || (
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

    @computed
    get projects_on_requiredByProject() {
        return this.proxy.projects_on_requiredByProject;
    }

    setProjects_on_requiredByProject(projects_on_requiredByProject) {
        this.proxy.setProjects_on_requiredByProject(projects_on_requiredByProject)
    }

    setProjects_on_requiresProject(projects_on_requiresProject) {
        this.proxy.setProjects_on_requiresProject(projects_on_requiresProject)
    }
}
