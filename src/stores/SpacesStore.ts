/**
 * Space Store
 *
 * Responsible for projecting between time, unit, and pixel spaces.
 */

import { action, computed, observable, makeObservable } from 'mobx';

import time from '../time';
import config from '../config';
import TimelineStore from './TimelineStore';


export default class SpacesStore {

    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        this.root = root;

        makeObservable(this);
    }

    @observable
    customSpaces: Object[] | undefined

    @action
    setCustomSpaces(customSpaces: Object[]) {
        this.customSpaces = customSpaces;
    }

    @observable
    startYear: number = 2020;

    @action
    setStartYear(startYear: number) {
        this.startYear = startYear;
    }

    pxDelta(start: number, end: number, withContainer = true) {
        const { container } = this.root.ui;

        return ((end - (withContainer ? container.left : 0)) - start) / container.width;
    }

    internalPxToTime(px: number) {
        const { container } = this.root.ui;

        if (container) {
            px += container.left;
        }

        return this.pxToTime(px);
    }

    pxToTime(px: number) {
        const { ui, viewport } = this.root;
        const { container } = ui;

        return container ? viewport.left + (viewport.width * (px - container.left) / container.width) : 0;
    }

    timeToPx(time: number) {
        const {ui, viewport} = this.root;

        return (ui.width * (time - viewport.left) / viewport.width);
    }

    @computed 
    get grid() {
        const { viewport } = this.root;
        const offset = this.primaryUnits.width * (1 - (this.primaryTimeUnit - (viewport.left % this.primaryTimeUnit)) / this.primaryTimeUnit);

        const primary = [];
        const secondary = [];

        for (let i = -1; i < Math.ceil(this.primaryUnits.count); i++) {
            const x = ((i + (offset > 0 ? 1 : 0)) * this.primaryUnits.width) ;
            primary.push(x - offset);

            for (let j = 1; j < Math.round(this.secondaryUnits.count / this.primaryUnits.count); j++) {
                secondary.push(x + (j * this.secondaryUnits.width) - offset);
            }
        }

        return {primary, secondary};
    }

    // TODO this is part of the phase styling of the rice work and is wip
    @computed
    get customSpaceGrid() {
        // the custom spaces info lke labels are currently set in years format like [2024, 2030] showing the space 
        // should be set x's that are set on start and end of each phase, where start of the phaze is top left of a rectangle, 
        // with the end - start as the width of the rectangle
        const { viewport } = this.root;
        const rectsTopLeft = []
        const rectsWidth = []
        const label = []
        // offset is the x of the starting of the left of the primary units
        // so when the timeline is grabbed to right and left it will change to reflect where the startign point for the prinary unit is 
        // for example if panning left, stuff on timeline move to right, the offset goes positive and when panning right, it will be negative
        const offset = this.primaryUnits.width * (1 - (this.primaryTimeUnit - (viewport.left % this.primaryTimeUnit)) / this.primaryTimeUnit);
        
        if (this.customSpaces)  this.customSpaces.forEach((cs)=>{
            Object.keys(cs).forEach((k)=>{
                const time_span = cs[k]
                const span_start_sec = (time_span[0] - this.startYear) * time.YEAR   
                const span_end_sec = (time_span[1] - this.startYear) * time.YEAR  
                const span_start_px = this.timeToPx(+span_start_sec) - offset
                const span_end_px = this.timeToPx(+span_end_sec) - offset
                rectsTopLeft.push(span_start_px);
                rectsWidth.push(span_start_px + span_end_px)
                label.push(k)
            })
        })

        return {rectsTopLeft, rectsWidth, label}
    }

    @computed 
    get time() {
        const { viewport } = this.root;

        let _time: number;
        time.ordered.some((unit, i) => {
            if (viewport.width / unit < config.minLineWidth) {
                return !!(_time = i);
            }
        });

        return _time;
    }


    @computed 
    get primaryUnits() {
        const count = this.root.viewport.width / this.primaryTimeUnit;
        const width = this.root.ui.width / count;

        return {count, width};
    }

    @computed 
    get primaryTimeUnit() {
        return time.ordered[this.time];
    }

    displayPrimary(seconds: number) {
        return time.displayTimeUnits(this.startYear, Math.floor(seconds / this.primaryTimeUnit), this.primaryTimeUnit);
    }

    @computed 
    get secondaryTimeUnit() {
        return time.ordered[this.time > 0 ? this.time - 1 : 0];
    }

    displaySecondary(seconds: number) {
        return time.displayTimeUnits(this.startYear, Math.floor(seconds / this.secondaryTimeUnit), this.secondaryTimeUnit);
    }

    @computed 
    get secondaryUnits() {
        const { viewport } = this.root;
        const primary = this.primaryUnits;

        return (function grid(count) {
            const width = primary.width / Math.round(count / primary.count);
            if (width < config.minLineWidth) {
                return grid(count / 2);
            }

            return {count, width};
        })(Math.round(viewport.width / this.secondaryTimeUnit));
    }

}


