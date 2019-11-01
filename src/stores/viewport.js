/**
 * Viewport Store
 *
 * This store handles how the current dataset
 * is mapped onto the UI elements.
 */

import { action, computed, observable } from 'mobx';


export default class ViewportStore {

    constructor(props, ui) {
        this.setLeft(0);
        this.setRight(0);
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

    @computed get width() {
        return Math.abs(this.right - this.left);
    }

}
