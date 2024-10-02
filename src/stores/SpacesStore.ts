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
            const x = ((i + (offset > 0 ? 1 : 0)) * this.primaryUnits.width) - offset;
            primary.push(x);

            for (let j = 1; j < Math.round(this.secondaryUnits.count / this.primaryUnits.count); j++) {
                secondary.push(x + (j * this.secondaryUnits.width));
            }
        }

        return {primary, secondary};
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


