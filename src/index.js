import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

import Scrubber from './components/Scrubber';
import { ContinuousEditor } from './components/Editors';
import { ContinuousCalendar } from './components/Calendars';


class Timeline extends Component {

    render() {
        return (
            <div className="react-timeline">
                <ContinuousCalendar />
                <ContinuousEditor />
                <Scrubber />
            </div>
        );
    }

}


export default Timeline;
