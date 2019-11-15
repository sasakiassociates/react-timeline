/**
 * Time Store
 *
 * Responsible for projecting between time, unit, and pixel spaces.
 */

import { action, observable } from 'mobx';


class TimeStore {

    constructor(root, props) {
        this.root = root;

        this.setTimeMeridian(props.timeMeridian);
    }


    @observable timeMeridian;
    @action setTimeMeridian(meridian) {
        this.timeMeridian = meridian;
    }

}


export default TimeStore;
