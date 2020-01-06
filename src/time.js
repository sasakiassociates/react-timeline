/**
 * Time
 */

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 52 * WEEK;


class DateFormatter {

    SECONDS(d) {
        return `${d.getSeconds()}`;
    }

    DAY(d) {
        return `${d.getMonth() + 1}/${d.getDate()}`
    }

}


export default {
    SECOND,
    MINUTE,
    HOUR,
    DAY,
    WEEK,
    YEAR,
    ordered: [SECOND, MINUTE, HOUR, DAY, WEEK, YEAR],
    format: new DateFormatter(),
};
