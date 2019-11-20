/**
 * Root Store
 *
 * Contains main component state.
 */

import { action, computed, observable } from 'mobx';

import BlockStore from './block';
import TimeStore from './time';
import UIStore from './ui';
import ViewportStore from './viewport';


export default class RootStore {

    constructor(props) {
        this.config = props;

        this.blocks = new BlockStore(this, props);
        this.time = new TimeStore(this, props);
        this.ui = new UIStore(this, props);
        this.viewport = new ViewportStore(this, props);
    }

};
