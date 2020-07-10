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
const QUIN = 5 * YEAR;
const DECADE = 2 * QUIN;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default {
    SECOND,
    MINUTE,
    HOUR,
    DAY,
    WEEK,
    MONTH,
    QUARTER,
    YEAR,
    QUIN,
    DECADE,
    months,
    ordered: [SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR, QUIN, DECADE],
    displayTimeUnits: (startYear, value, unit) => {
        switch (unit) {
            case SECOND:
                return value + ' second';
            case MINUTE:
                return value + ' minute';
            case HOUR:
                return value + ' hour';
            case DAY:
                return value + ' day';
            case WEEK:
                return value + ' week';
            case MONTH:
                return months[value % 12] + ' ' + (startYear + Math.floor(value / 12));
            case QUARTER:
                return `${value % 4 === 0 ? (`${startYear + Math.floor(value / 4)}: `) : ''}Q${1 + value % 4}`;
            case YEAR:
                return startYear + value;
            case QUIN:
                return Math.floor(startYear / 5) * 5 + value * 5;
            case DECADE:
                return Math.floor(startYear / 10) * 10 + value * 10;
        }
    },
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
            case QUIN:
                return 'quinquennial';
            case DECADE:
                return 'decade';
        }
    }
};
