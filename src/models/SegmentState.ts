/**
 * Segment State
 */

import { action, observable, makeObservable } from 'mobx';


export default class SegmentState {

    constructor(value: number) {
        makeObservable(this);

        this.setValue(value);
    }

    @observable
    color: string = '#ccc';

    @action
    setColor(color: string) {
        this.color = color;
    }

    @observable
    value?: number;

    @action
    setValue(value: number) {
        this.value = value;
    }

}
