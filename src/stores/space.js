/**
 * Space Store
 *
 * Responsible for projecting between time, unit, and pixel spaces.
 */

import { action, observable } from 'mobx';


class SpaceStore {

    constructor(root, props) {
        this.root = root;

        this.setTimeMeridian(props.timeMeridian);
    }


    @observable timeMeridian;
    @action setTimeMeridian(meridian) {
        this.timeMeridian = meridian;
    }


    pxDelta(start, end, withContainer = true) {
        const { container } = this.root.ui;

        return ((end - (withContainer ? container.left : 0)) - start) / container.width;
    }


    pxToTime(px) {
        const { ui, viewport } = this.root;
        const { container } = ui;

        return viewport.left + (viewport.width * (px - container.left) / container.width);
    }


    timeToPx(time) {
        const { ui, viewport } = this.root;
        const { container } = ui;

        return (container.width * (time - viewport.left) / viewport.width);
    }

}


export default SpaceStore;
