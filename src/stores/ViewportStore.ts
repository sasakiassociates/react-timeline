/**
 * Viewport Store
 *
 * This store handles how the current dataset
 * is mapped onto the UI elements.
 */

import { action, computed, observable, makeObservable } from 'mobx';

import config from '../config';
import { Viewport, noop } from '../types';
import TimelineStore from './TimelineStore';


export default class ViewportStore {

    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        this.root = root;
        makeObservable(this);
    }

    @observable
    value: Viewport = { top: 0, left: 0, right: config.defaultViewportWidth };

    @action
    setValue(value: Viewport) {
        this.value = value;
    }

    @action 
    zoom(xRatio: number, direction: number) {
        const { zoomSpeed, viewportLimit } = config;

        let growthMod = direction > 0 ? zoomSpeed : 1 / zoomSpeed;
        growthMod = Math.min(growthMod, viewportLimit.max.width/this.width);
        growthMod = Math.max(growthMod, viewportLimit.min.width/this.width);

        const delta = ((this.width * growthMod) - this.width);

        this.setValue({
            ...this.value,
            left: this.left - (delta * xRatio),
            right: this.right + (delta * (1 - xRatio)),
        });
    }

    center(x: number, y: number) {
        this.setValue({
            top: y - (this.height / 2),
            left: x - (this.width / 2),
            right: x + (this.width / 2),
        });
    }

    @computed
    get top(){
        return this.value.top;
    }

    @computed
    get left(){
        return this.value.left;
    }

    @computed
    get right(){
        return this.value.right;
    }

    @computed 
    get bottom() {
        return this.top + (this.root.ui.height * .85) || this.top;
    }

    @computed 
    get width() {
        return Math.abs(this.right - this.left);
    }

    @computed 
    get height() {
        return Math.abs(this.top - this.bottom);
    }

}
