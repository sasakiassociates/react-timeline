import time from './time';


export default {

    blockHeight: 20, // px

    colors: {
        primaryLine: '#5d5d65',
        secondaryLine: '#2a2b30',
    },

    minLineWidth: 24, // px

    pushBuffer: 30,   // px
    pushSpeed: .01,   // %

    resizeHandleWidth: 15,

    timeMeridian: Math.round(Date.now() / 1000),

    zoomSpeed: 1.3,

    defaultViewportWidth: time.YEAR,
    viewportLimit: {
        max: {width: time.DECADE * 10},
        min: {width: time.WEEK}
    }

};
