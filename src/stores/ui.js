/**
 * UiStore
 *
 * Stores the current state of the UI.
 */

import { action, observable } from 'mobx';


export default class UiStore {

    constructor() {
        window.addEventListener('resize', () => this.readDimensions());
    }


    @observable width;
    @observable height;
    @action readDimensions() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
    }


    @observable container;
    @action setContainer(container) {
        this.container = container;
        this.readDimensions();
    }

};
