/**
 * Viewport Store
 *
 * This store handles how the current dataset
 * is mapped onto the UI elements.
 */

import { action, computed, observable, makeObservable } from 'mobx';

import config from '../config';
import { Box, noop } from '../types';
import TimelineStore from './TimelineStore';


export default class ViewportStore {

    private readonly root: TimelineStore;

    constructor(root: TimelineStore) {
        this.root = root;
        makeObservable(this);
    }

    @observable
    setValue: (_: Box) => any = noop;

    @observable
    value: Box = { top: 0, left: 0, right: 0 };

    @action
    setState(value: Box, setValue: (_: Box) => any) {
        this.value = value;
        this.setValue = setValue;
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
