/**
 * TimelineStore
 * 
 * The root store for the context.
 */

import BlocksStore from './BlocksStore';
import SpacesStore from './SpacesStore';
import UIStore from './UIStore';
import ViewportStore from './ViewportStore';


export default class TimelineStore {

    readonly blocks: BlocksStore;
    readonly spaces: SpacesStore;
    readonly ui: UIStore;
    readonly viewport: ViewportStore;

    constructor() {
        this.blocks = new BlocksStore(this);
        this.spaces = new SpacesStore(this);
        this.ui = new UIStore(this);
        this.viewport = new ViewportStore(this);
    }

};

