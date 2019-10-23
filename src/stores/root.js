/**
 * Root Store
 *
 * Contains main component state.
 */

import { action, observable } from 'mobx';

import BlockStore from './block';


export default class RootStore {

    constructor(props) {
        this.blocks = new BlockStore(this);

        this.setZoom(props.zoom);
        this.setPolarTime(props.polarTime);
    }


    @observable zoom;

    @action setZoom(zoom) {
        this.zoom = zoom;
    }

};
