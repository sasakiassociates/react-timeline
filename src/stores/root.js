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

        this.blocks = new BlockStore(props, this);
        this.ui = new UiStore(props);
        this.viewport = new ViewportStore(props, this.ui);

        this.setTimeMeridian(props.timeMeridian);
    }


    @observable dragging = { item: null };
    @action setDragging(item = null, elem = null) {
        this.dragging = {
            item,
            elem,
            container: elem ? elem.parentNode.getBoundingClientRect() : null,
        };
    }


    @observable timeMeridian;
    @action setTimeMeridian(meridian) {
        this.timeMeridian = meridian;
    }


    @computed get isDragging() {
        return this.dragging.item !== null;
    }

};
