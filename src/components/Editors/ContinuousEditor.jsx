/**
 * Editors - Continuous
 *
 * This editor variation allows continuity in time's representation.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import Block from '../Block';
import time from '../../time';


const TIMES = [time.SECOND, time.MINUTE, time.HOUR, time.DAY, time.MONTH, time.YEAR];


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

        const startTime = Math.round((1 - ((width - x) / width)) * viewport.width + left);

        blocks.createBlock(startTime, startTime + (this.unitLength / 2), y + top);
    }

    onScroll = ({ deltaY }) => {
        const { store } = this.props;
        //store.setZoom(store.zoom * (1 + ((deltaY / Math.abs(deltaY)) / 3)));
    }

    renderBlocks = () => {
        const { blocks, viewport, ui } = this.props.store;
        const { width } = ui;
        const { left, right, top } = viewport;

        return blocks.elements.map(block => {
            console.log(1 - (viewport.width - block.start) / viewport.width);

            return (
                <Block
                    key={block.id}
                />
            );
        });
    }

    renderGrid = () => {
        if (this.grid) {
            const { config, ui, viewport } = this.props.store;
            const { width, height } = ui;
            const { left, right, top, bottom } = viewport;

            const ctx = this.grid.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = config.colors.primaryLine;

            let units;
            TIMES.some(timeUnit => {
                if (viewport.width / timeUnit < 10) {
                    return !!(units = Math.round(viewport.width / timeUnit));
                }
            });

            this.unitLength = width / units;
            for (let i = 0; i < units; i++) {
                ctx.beginPath();
                ctx.moveTo(i * this.unitLength, 0);
                ctx.lineTo(i * this.unitLength, height);
                ctx.stroke();
            }
        }
    }

    render() {
        const { ui, zoom } = this.props.store;

        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous"
                onDoubleClick={e => this.createBlock(e)}
            >
                <canvas
                    width={`${ui.width}px`}
                    height={`${ui.height * .75}px`}
                    ref={el => this.grid = el}
                    onWheel={e => this.onScroll(e)}
                />
                <div className="react-timeline__editor-layer--blocks">
                    {this.renderBlocks()}
                </div>
            </div>
        );
    }

}


export default ContinuousEditor;
