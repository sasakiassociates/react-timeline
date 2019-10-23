/**
 * Root Store
 *
 * Contains main component state.
 */

import { action, observable } from 'mobx';

import BlockStore from './block';
import UiStore from './ui';


export default class RootStore {

    constructor(props) {
        this.blocks = new BlockStore(this);
        this.ui = new UiStore();

        this.setTimeMeridian(props.timeMeridian);
        this.setZoom(props.zoom);
    }


    @observable timeMeridian;
    @action setTimeMeridian(meridian) {
        this.timeMeridian = meridian;
    }

    @observable zoom;
    @action setZoom(zoom) {
        this.zoom = zoom;
    }

};
