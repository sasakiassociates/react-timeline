import time from './time';


export default {

    baseWidth: 150,
    baseTime: time.DAY,

    colors: {
        primaryLine: '#888888',
        secondaryLine: '#444444',
    },

    timeMeridian: Math.round(Date.now() / 1000),

    zoomSpeed: 1.3,

};
