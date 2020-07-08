import React from 'react';
import { Provider } from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
import { actions } from './types/action';
import Navigator from './components/Navigator';
import { ContinuousCalendar } from './components/Calendars';
import { ContinuousEditor, ContinuousRowEditor } from './components/Editors';
import {autorun} from "mobx";

class Timeline extends React.Component {

    static defaultProps = config;

    constructor(props) {
        super(...arguments);

        this.store = new RootStore(props);

        const {ui, viewport} = this.store;

        autorun(() => {
            if (!this.store.blocks.elements) return;
            this.store.blocks.elements.forEach((block, i) => {
                block.setViewport(ui, viewport);
            });
        });
    }

    componentWillUnmount() {
        this.store.ui.clearEvents();
    }

    render() {
        const { ui } = this.store;

        return (
            <Provider store={this.store}>
                <div
                    className={`react-timeline ${ui.cursor}`}
                    ref={el => !ui.container && ui.setContainer(el)}
                >
                    <ContinuousCalendar />
                    <ContinuousRowEditor />
                    <Navigator />
                </div>
            </Provider>
        );
    }

}

export { default as timeScale } from "./time";
export { default as Block } from "./types/block";
export default Timeline;
