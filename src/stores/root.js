/**
 * Root Store
 *
 * Contains main component state.
 */

import { action, computed, observable } from 'mobx';

import BlockStore from './block';
import UiStore from './ui';
import ViewportStore from './viewport';


export default class RootStore {

    constructor(props) {
        this.config = props;

        this.blocks = new BlockStore(this, props);
        this.ui = new UiStore(this, props);
        this.viewport = new ViewportStore(this, props);

        this.setTimeMeridian(props.timeMeridian);
    }


    @observable timeMeridian;
    @action setTimeMeridian(meridian) {
        this.timeMeridian = meridian;
    }

};
