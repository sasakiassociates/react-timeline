import time from './time';


export default {

    baseWidth: 150,
    baseTime: time.DAY,

    colors: {
        primaryLine: '#cc0000',
        secondaryLine: '#0000cc',
    },

    minLineWidth: 24,

    timeMeridian: Math.round(Date.now() / 1000),

    zoomSpeed: 1.3,

};
