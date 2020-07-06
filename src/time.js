/**
 * Time
 */

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 4 * WEEK;
const QUARTER = 3 * MONTH;
const YEAR = 4 * QUARTER;

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
    MONTH,
    QUARTER,
    YEAR,
    ordered: [SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR],
    format: new DateFormatter(),
    displayText: (unit) => {
        switch (unit) {
            case SECOND:
                return 'second';
            case MINUTE:
                return 'minute';
            case HOUR:
                return 'hour';
            case DAY:
                return 'day';
            case WEEK:
                return 'week';
            case MONTH:
                return 'month';
            case QUARTER:
                return 'quarter';
            case YEAR:
                return 'year';
        }
    }
};
