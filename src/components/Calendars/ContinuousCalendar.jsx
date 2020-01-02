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

    componentDidMount() {
        this.renderGrid();
    }

    componentWillUpdate() {
        this.renderGrid();
    }

    renderGrid() {
        if (this.grid) {
            const { config, spaces, ui, viewport } = this.props.store;
            const { width, height } = ui;

            const ctx = this.grid.getContext('2d');
            ctx.clearRect(0, 0, width, height);

            // Primary Lines
            ctx.strokeStyle = config.colors.primaryLine;
            spaces.grid.primary.forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            });

            // Secondary Lines
            ctx.strokeStyle = config.colors.secondaryLine;
            spaces.grid.secondary.forEach(x => {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            });
        }
    }

    render() {
        const { width, height} = this.props.store.ui;
        const { primary } = this.props.store.spaces.grid;

        return (
            <div className="react-timeline__calendar react-timeline__calendar-continuous">
                <canvas
                    width={`${width}px`}
                    height={`${height * .1}px`}
                    ref={el => this.grid = el}
                />

            </div>
        );
    }

}


export default ContinuousCalendar;
