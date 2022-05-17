/**
 * TimelineStore
 * 
 * The root store for the context.
 */

import UIStore from './UIStore';
import ViewportStore from './ViewportStore';


export default class TimelineStore {

    readonly ui: UIStore;
    readonly viewport: ViewportStore;

    constructor() {
        this.ui = new UIStore(this);
        this.viewport = new ViewportStore(this);
    }

};

