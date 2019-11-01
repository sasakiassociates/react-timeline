import time from './time';


export default {

    // How many pixels wide the width of each block for zoom@1
    baseWidth: 150,
    baseTime: time.DAY,

    colors: {
        primaryLine: '#888888',
    },

    timeMeridian: Math.round(Date.now() / 1000),

};
