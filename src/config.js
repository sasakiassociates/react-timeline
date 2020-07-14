/**
 * Config
 *
 * Any property that is in the config object is assignable
 * through the Timeline component's props.
 */

import { observable } from 'mobx';

import time from './time';


export default {

    blocks: observable([]),
    blockHeight: 20, // px

    colors: {
        primaryLine: '#c1c1d4',
        secondaryLine: '#d8d5e7',
    },

    minLineWidth: 24, // px

    pushBuffer: 30,   // px
    pushSpeed: .01,   // %

    resizeHandleWidth: 15,
    timeMeridian: Math.round(Date.now() / 1000),

    zoomSpeed: 1.15,

    startYear: 2020,
    defaultViewportWidth: time.YEAR * 3,
    defaultBlockWidth: time.YEAR / 2,
    viewportLimit: {
        max: {width: time.DECADE * 10},
        min: {width: time.YEAR}
    }

};
