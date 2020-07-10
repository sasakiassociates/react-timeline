/**
 * Editors - Abstract
 *
 * This is the base class for editor functionality.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';

import Block from '../Block';
import time from '../../time';
import Scrubber from '../Scrubber';
import SelectBox from './SelectBox';
import Action, { actions } from '../../types/action';


class AbstractEditor extends React.Component {

    componentDidMount() {
        this.renderGrid();

        if (this.listeners) {
            this.props.store.ui.setListeners(this.listeners);
        }
    }

    componentWillUnmount() {
        this.props.store.ui.setListeners({});
    }

    componentDidUpdate() {
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
    };

    onScroll = e => {
        e.preventDefault();
        e.stopPropagation();

        const {clientX, deltaY, target} = e;
        const {config, ui, viewport} = this.props.store;

        const xRatio = (clientX - target.getBoundingClientRect().left) / ui.width;
        let growthMod = deltaY > 0 ? config.zoomSpeed : 1 / config.zoomSpeed;

        growthMod = Math.min(growthMod, config.viewportLimit.max.width/viewport.width);
        growthMod = Math.max(growthMod, config.viewportLimit.min.width/viewport.width);

        const delta = ((viewport.width * growthMod) - viewport.width);

        viewport.setLeft(viewport.left - (delta * xRatio));
        viewport.setRight(viewport.right + (delta * (1 - xRatio)));
    };

    renderBlocks = () => {
        const {blocks, config} = this.props.store;

        return blocks.visible.map(block => (
            <Block
                key={block.id}
                block={block}
            />
        ));
    };

    renderGrid = () => {
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
        const { spaces, viewport, ui } = this.props.store;
        const { height, scrubberPosition, selectBox, userAction, width } = ui;
        const { left } = viewport;

        return (
            <div
                className="react-timeline__editor react-timeline__editor-continuous-row"
                onDoubleClick={e => this.createBlock(e)}
            >
                <canvas
                    width={`${width}px`}
                    height={`${height * .85}px`}
                    ref={el => this.grid = el}
                    onWheel={e => this.onScroll(e)}
                    onMouseDown={e => this.onMouseDown(e)}
                    onMouseUp={() => this.onMouseUp()}
                />

                <div className="react-timeline__editor-layer--blocks">
                    {this.renderBlocks()}
                </div>

                <Scrubber>
                    <div className='react-timeline__scrubber-date'>
                        {spaces.displaySecondary(scrubberPosition)}
                    </div>
                </Scrubber>

                {userAction.type === actions.SELECT && selectBox && (
                    <SelectBox />
                )}
            </div>
        );
    }

}


export default AbstractEditor;
