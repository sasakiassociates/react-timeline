import React from 'react';
import { Provider } from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
import { actions } from './types/action';
import Scrubber from './components/Scrubber';
import { ContinuousCalendar } from './components/Calendars';
import { ContinuousEditor, ContinuousRowEditor } from './components/Editors';


class Timeline extends React.Component {

    static defaultProps = config;

    constructor(props) {
        super(...arguments);

        this.store = new RootStore(props);
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
                    <Scrubber />
                </div>
            </Provider>
        );
    }

}


export default Timeline;
