/**
 * Root Store
 *
 * Contains main component state.
 */

import BlockStore from './block';
import SpaceStore from './space';
import UIStore from './ui';
import ViewportStore from './viewport';


export default class RootStore {

    constructor(props) {
        this.config = props;

        this.blocks = new BlockStore(this, props);
        this.spaces = new SpaceStore(this, props);
        this.viewport = new ViewportStore(this, props);
        this.ui = new UIStore(this, props);
    }

};
