/**
 * Editors - Continuous
 *
 * This editor variation allows continuity in time's representation.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import Block from '../Block';
import time from '../../time';
import Action, { actions } from '../../types/action';


const TIMES = [time.SECOND, time.MINUTE, time.HOUR, time.DAY, time.WEEK, time.YEAR];


@inject('store')
@observer
class ContinuousEditor extends React.Component {

    constructor(props) {
        super();

        this.unitLength = props.store.config.baseTime;
    }

    componentDidMount() {
        this.renderGrid();
    }

    componentDidUpdate() {
        const { config, ui, viewport } = this.props.store;

        // If the viewport is still the initial value, define a reasonable viewport
        // width from the right to the left (initial value is meridian) using config defaults.
        if (viewport.right === 0) {
            viewport.setRight((ui.width / config.baseWidth) * config.baseTime);
        }

        this.renderGrid();
    }

    createBlock = e => {
        const { blocks, spaces, ui, viewport } = this.props.store;
        const { width, height } = ui;
        const { left, right, top } = viewport;

        const y = e.clientY - e.target.getBoundingClientRect().top;
        const startTime = spaces.pxToTime(e.clientX);

        blocks.createBlock(startTime, startTime + (this.unitLength / 2), y + top);
    }

    onMouseDown = e => {
        const { ui, viewport } = this.props.store;
        const container = e.target.getBoundingClientRect();

        ui.setAction(new Action(actions.PAN, {
            startLeft: viewport.left,
            startRight: viewport.right,
            startX: e.clientX - container.left,
        }));
    }

    onScroll = ({ deltaY }) => {
        const { config, viewport } = this.props.store;

        const growthMod = deltaY > 0 ? config.zoomSpeed : 1 / config.zoomSpeed;
        const delta = ((viewport.width * growthMod) - viewport.width) / 2;

        viewport.setLeft(viewport.left - delta);
        viewport.setRight(viewport.right + delta);
    }

    renderBlocks = () => {
        const { blocks } = this.props.store;

        return blocks.visible.map(block => (
            <Block
                key={block.id}
                block={block}
            />
        ));
    }

    renderGrid = () => {
        if (this.grid) {
            const { config, spaces, ui, viewport } = this.props.store;
            const { width, height } = ui;

            const ctx = this.grid.getContext('2d');
            ctx.clearRect(0, 0, width, height);

            let time;
            TIMES.some((unit, i) => {
                if (viewport.width / unit < config.minLineWidth) {
                    return !!(time = i);
                }
            });

            const units = viewport.width / TIMES[time];
            const unitWidth = width / units;
            const offset = unitWidth * (1 - (TIMES[time] - (viewport.left % TIMES[time])) / TIMES[time]);

            const { subUnits, subUnitWidth } = (function grid(subUnits) {
                if (width / subUnits < config.minLineWidth) {
                    return grid(subUnits / 2);
                }

                return { subUnits, subUnitWidth: width / subUnits };
            })(Math.round(viewport.width / TIMES[time - 1]));

            this.unitLength = viewport.width / units;

            // Primary lines
            for (let i = -1; i < Math.ceil(units); i++) {
                const x = ((i + (offset > 0 ? 1 : 0)) * unitWidth) - offset;

                ctx.strokeStyle = config.colors.primaryLine;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();

                ctx.strokeStyle = config.colors.secondaryLine;

                // Secondary Lines
                for (let j = 0; j < subUnits; j++) {
                    const xs = x + (j * subUnitWidth);

                    ctx.beginPath();
                    ctx.moveTo(xs, 0);
                    ctx.lineTo(xs, height);
                    ctx.stroke();
                }
            }
        }
    }

    render() {
        const { store } = this.props;
        const { height, width } = store.ui;
        const { left } = store.viewport;

        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous"
                onDoubleClick={e => this.createBlock(e)}
            >
                <canvas
                    width={`${width}px`}
                    height={`${height * .75}px`}
                    ref={el => this.grid = el}
                    onWheel={e => this.onScroll(e)}
                    onMouseDown={e => this.onMouseDown(e)}
                />
                <div className="react-timeline__editor-layer--blocks">
                    {this.renderBlocks()}
                </div>
            </div>
        );
    }

}


export default ContinuousEditor;
