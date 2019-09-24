/**
 * Calendars - Continuous
 *
 * This calendar variation allows continuity in time's representation.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';


@inject('store')
@observer
class ContinuousCalendar extends React.Component {

    render() {
        return (
            <div className="react-timeline__calendar react-timeline__calendar-continuous">
            </div>
        );
    }

}


export default ContinuousCalendar;
