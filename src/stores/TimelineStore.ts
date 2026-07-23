/**
 * TimelineStore
 * 
 * The root store for the context.
 */

import { action, makeObservable, observable } from 'mobx';

import BlocksStore from './BlocksStore';
import SpacesStore from './SpacesStore';
import UIStore from './UIStore';
import ViewportStore from './ViewportStore';


export default class TimelineStore {

    readonly blocks: BlocksStore;
    readonly spaces: SpacesStore;
    readonly ui: UIStore;
    readonly viewport: ViewportStore;

    /**
     * When false, framer-motion layout animations are disabled (layout={false}
     * and transition duration=0). This eliminates the N+2G simultaneous layout
     * animation storm that freezes the app when groupBy changes.
     *
     * Set from the <Timeline animate={false}> prop.
     */
    @observable
    animate: boolean = true;

    @action
    setAnimate(animate: boolean) {
        this.animate = animate;
    }

    constructor() {
        makeObservable(this);
        this.blocks = new BlocksStore(this);
        this.spaces = new SpacesStore(this);
        this.ui = new UIStore(this);
        this.viewport = new ViewportStore(this);
    }

};

