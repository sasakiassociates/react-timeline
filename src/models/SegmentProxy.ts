/**
 * Segment Proxy
 */

import { 
    computed, 
    observable, 
    makeObservable, 
    runInAction 
} from 'mobx';


export default class SegmentProxy {

    constructor(value: number) {
        makeObservable(this);

        this._value = value;
    }

    // Color Proxy

    @observable
    _color: string = '#ccc';

    @computed
    get color() {
        return this._color;
    }

    setColor(color: string) {
        runInAction(() => {
            this._color = color;
        });
    }


    // Value Proxy

    @observable
    _value?: number;

    @computed
    get value() {
        return this._value;
    }

    setValue(value: number) {
        runInAction(() => {
            this._value = value;
        });
    }

}
