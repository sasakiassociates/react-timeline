/**
 * Space Store
 *
 * Responsible for projecting between time, unit, and pixel spaces.
 */

import { action, computed, observable } from 'mobx';
import time from '../time';


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


    @computed get grid() {
        const { config, viewport } = this.root;

        const offset = this.primaryUnits.width * (1 - (time.ordered[this.time] - (viewport.left % time.ordered[this.time])) / time.ordered[this.time]);

        const primary = [];
        const secondary = [];

        for (let i = -1; i < Math.ceil(this.primaryUnits.count); i++) {
            const x = ((i + (offset > 0 ? 1 : 0)) * this.primaryUnits.width) - offset;
            primary.push(x);

            for (let j = 1; j < Math.round(this.secondaryUnits.count / this.primaryUnits.count); j++) {
                secondary.push(x + (j * this.secondaryUnits.width));
            }
        }

        return { primary, secondary };
    }


    @computed get time() {
        const { config, viewport } = this.root;

        let _time;
        time.ordered.some((unit, i) => {
            if (viewport.width / unit < config.minLineWidth) {
                return !!(_time = i);
            }
        });

        return _time;
    }


    @computed get primaryUnits() {
        const count = this.root.viewport.width / time.ordered[this.time];
        const width = this.root.ui.width / count;

        return { count, width };
    }


    @computed get secondaryUnits() {
        const { config, viewport } = this.root;
        const primary = this.primaryUnits;

        return (function grid(count) {
            const width = primary.width / Math.round(count / primary.count);
            if (width < config.minLineWidth) {
                return grid(count / 2);
            }

            return { count, width };
        })(Math.round(viewport.width / time.ordered[this.time - 1]));
    }

}


export default SpaceStore;
