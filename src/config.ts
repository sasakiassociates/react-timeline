/**
 * Config
 *
 * Any property that is in the config object is assignable
 * through the Timeline component's props.
 */

import { observable } from 'mobx';

import time from './time';

//configure({ isolateGlobalState: true });

export default {

    blocks: observable([]),
    blockHeight: 20, // px
    rowPadding: 2, // px

    colors: {
        primaryLine: '#e1e1ec',
        secondaryLine: '#edebf1',
    },

    onBlockCreate: () => {},

    editor: 'ContinuousEditor',

    minLineWidth: 17, // px

    pushBuffer: 30,   // px
    pushSpeed: .01,   // %

    resizeHandleWidth: 15,
    timeMeridian: Math.round(Date.now() / 1000),

    zoomSpeed: 1.15,

    startYear: 2020,
    defaultViewportWidth: time.YEAR * 10,
    defaultBlockWidth: time.YEAR / 2,
    viewportLimit: {
        max: {width: time.DECADE * 10},
        min: {width: time.YEAR}
    },
    timelineLock: false,//or object {left:0, right:time.YEAR * 10}
    showNavigator: true,
};
