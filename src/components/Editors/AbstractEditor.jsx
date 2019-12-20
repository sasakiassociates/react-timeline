/**
 * Editors - Abstract
 *
 * This is the base class for editor functionality.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import Block from '../Block';
import time from '../../time';
import SelectBox from './SelectBox';
import Action, { actions } from '../../types/action';


const TIMES = [time.SECOND, time.MINUTE, time.HOUR, time.DAY, time.WEEK, time.YEAR];


class AbstractEditor extends React.Component {

    componentDidMount() {
        this.renderGrid();

        if (this.listeners) {
            this.props.store.ui.setListeners(this.listeners);
        }
    }

    componentDidUnmount() {
        this.props.store.ui.setListeners({});
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

    createBlock() {
        throw new Error(`${this.constructor.name} must define a 'createBlock' method`);
    }

    onMouseDown = e => {
        const { ui, viewport } = this.props.store;
        const container = e.target.getBoundingClientRect();
        const editor = e.target.parentNode.parentNode.getBoundingClientRect();

        this.mouseDownTime = Date.now();

        if (e.ctrlKey) {
            var action = new Action(actions.SELECT, {
                startX: e.clientX,
                startY: (e.clientY - container.top) + viewport.top,
                top: container.top,
            });
        }
        else {
            var action = new Action(actions.PAN, {
                startLeft: viewport.left,
                startRight: viewport.right,
                startTop: viewport.top,
                startX: e.clientX - container.left,
                startY: e.clientY - container.top,
                top: container.top,
            });
        }

        ui.setAction(action);
    }

    onMouseUp = () => {
        // Simulate a click event by checking for time passed since mousedown.
        // We simulate the click instead of using the click event to have better
        // control over the behavior of the mousedown portion of the event.
        if (Date.now() - this.mouseDownTime < 200) {
            this.props.store.blocks.select();
        }
    }

    onScroll = ({ clientX, deltaY, target }) => {
        const { config, ui, viewport } = this.props.store;

        const xRatio = (clientX - target.getBoundingClientRect().left) / ui.width;
        const growthMod = deltaY > 0 ? config.zoomSpeed : 1 / config.zoomSpeed;
        const delta = ((viewport.width * growthMod) - viewport.width);

        viewport.setLeft(viewport.left - (delta * xRatio));
        viewport.setRight(viewport.right + (delta * (1 - xRatio)));
    }

    renderBlocks = () => {
        const { blocks, config } = this.props.store;

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
                const subUnitWidth = unitWidth / Math.round(subUnits / units);
                if (subUnitWidth < config.minLineWidth) {
                    return grid(subUnits / 2);
                }

                return { subUnits, subUnitWidth };
            })(Math.round(viewport.width / TIMES[time - 1]));

            // Primary Lines
            for (let i = -1; i < Math.ceil(units); i++) {
                const x = ((i + (offset > 0 ? 1 : 0)) * unitWidth) - offset;

                // Primary line
                ctx.strokeStyle = config.colors.primaryLine;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();

                // Secondary Lines
                ctx.strokeStyle = config.colors.secondaryLine;

                for (let j = 1; j < Math.round(subUnits / units); j++) {
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
        const { viewport, ui } = this.props.store;
        const { height, selectBox, userAction, width } = ui;
        const { left } = viewport;

        const dblClick = e => this.createBlock(e);

        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous-row"
                onDoubleClick={dblClick}
            >
                <canvas
                    width={`${width}px`}
                    height={`${height * .75}px`}
                    ref={el => this.grid = el}
                    onWheel={e => this.onScroll(e)}
                    onMouseDown={e => this.onMouseDown(e)}
                    onMouseUp={() => this.onMouseUp()}
                />

                <div className="react-timeline__editor-layer--blocks">
                    {this.renderBlocks()}
                </div>

                {userAction.type === actions.SELECT && selectBox && (
                    <SelectBox />
                )}
            </div>
        );
    }

}


export default AbstractEditor;
