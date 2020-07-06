import time from './time';


export default {

    baseWidth: 150,
    baseTime: time.DAY,
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

};
