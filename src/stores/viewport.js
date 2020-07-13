/**
 * Viewport Store
 *
 * This store handles how the current dataset
 * is mapped onto the UI elements.
 */

import { action, computed, observable } from 'mobx';


export default class ViewportStore {

    constructor(root, config) {
        this.root = root;

        this.setLeft(0);
        this.setRight(config.defaultViewportWidth);

        this.setTop(0);
    }


    @observable left;
    @action setLeft(left) {
        this.left = left;
    }

    @observable right;
    @action setRight(right) {
        this.right = right;
    }

    @observable top;
    @action setTop(top) {
        this.top = top;
    }

    @action zoom(xRatio, direction) {
        const { zoomSpeed, viewportLimit } = this.root.config;

        let growthMod = direction > 0 ? zoomSpeed : 1 / zoomSpeed;
        growthMod = Math.min(growthMod, viewportLimit.max.width/this.width);
        growthMod = Math.max(growthMod, viewportLimit.min.width/this.width);

        const delta = ((this.width * growthMod) - this.width);

        this.setLeft(this.left - (delta * xRatio));
        this.setRight(this.right + (delta * (1 - xRatio)));
    }

    @computed get bottom() {
        return this.top + (this.root.ui.height * .85) || this.top;
    }

    @computed get width() {
        return Math.abs(this.right - this.left);
    }

    @computed get height() {
        return Math.abs(this.top - this.bottom);
    }

}
