import React from 'react';
import { reaction } from "mobx";
import { Provider } from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
import Navigator from './components/Navigator';
import { ContinuousRowEditor } from './components/Editors';
import { ContinuousCalendar } from './components/Calendars';


class Timeline extends React.Component {

    static defaultProps = config;

    constructor(props) {
        super(...arguments);

        this.store = new RootStore(props);

        reaction(
            () => this.store.blocks.elements.length,
            () => {
                const { blocks, ui, viewport } = this.store;

                blocks.elements.forEach((block, i) => {
                    block.setViewport(ui, viewport);
                });
            }
        );
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
