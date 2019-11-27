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
        const { blocks, ui, viewport } = this.props.store;
        const { width, height } = ui;
        const { left, right, top } = viewport;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const startTime = Math.round((1 - ((width - x) / width)) * viewport.width + left) - viewport.left;

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
            const { config, ui, viewport } = this.props.store;
            const { width, height } = ui;

            const ctx = this.grid.getContext('2d');
            ctx.clearRect(0, 0, width, height);

            let units;
            TIMES.some(timeUnit => {
                if (viewport.width / timeUnit < 10) {
                    return !!(units = Math.round(viewport.width / timeUnit));
                }
            });

            const unitWidth = width / units;
            this.unitLength = viewport.width / units;
            for (let i = 0; i < units; i++) {
                ctx.strokeStyle = config.colors.primaryLine;
                ctx.beginPath();
                ctx.moveTo(i * unitWidth, 0);
                ctx.lineTo(i * unitWidth, height);
                ctx.stroke();

                for (var j = 1; j <= 3; j++) {
                    var lineStart = i * unitWidth + (unitWidth * (j/4));

                    ctx.strokeStyle = config.colors.secondaryLine;
                    ctx.beginPath();
                    ctx.moveTo(lineStart, 0);
                    ctx.lineTo(lineStart, height);
                    ctx.stroke();
                }
            }
        }
    }

    render() {
        const { height, width } = this.props.store.ui;

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
