/**
 * Calendars - Continuous
 *
 * This calendar variation allows continuity in time's representation.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import time  from '../../time';
import Scrubber from '../Scrubber';
import Action, {actions} from "../../types/action";


@inject('store')
@observer
class ContinuousCalendar extends React.Component {

    renderDates() {
        const { spaces, ui } = this.props.store;

        return spaces.grid.primary.map((x, i) => {
            let time = Math.round(spaces.internalPxToTime(x));

            const displayPrimary = spaces.displayPrimary(time);

            return (
                <div
                    className="react-timeline__calendar-date"
                    style={{ left: `${x}px` }}
                    key={i}
                >
                    {displayPrimary}
                </div>
            );
        });
    }

    setScrubberTime(e) {
        const {spaces, ui} = this.props.store;

        const time = spaces.pxToTime(e.clientX);
        ui.setScrubber(time);
    }

    render() {
        return (
            <div className="react-timeline__calendar react-timeline__calendar-continuous" onDoubleClick={e => this.setScrubberTime(e)}>
                <Scrubber />
                {this.renderDates()}
            </div>
        );
    }

}


export default ContinuousCalendar;
