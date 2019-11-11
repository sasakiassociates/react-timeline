import React from 'react';
import { observer, Provider } from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
import { actions } from './types/action';
import Scrubber from './components/Scrubber';
import { ContinuousEditor } from './components/Editors';
import { ContinuousCalendar } from './components/Calendars';


@observer
class Timeline extends React.Component {

    static defaultProps = config;

    constructor(props) {
        super(...arguments);

        this.store = new RootStore(props);
    }

    render() {
        const { ui } = this.store;

        return (
            <Provider store={this.store} ui={this.store.ui} viewport={this.store.viewport}>
                <div
                    className={`react-timeline ${ui.cursor}`}
                    ref={el => !ui.container && ui.setContainer(el)}
                >
                    <ContinuousCalendar />
                    <ContinuousEditor />
                    <Scrubber />
                </div>
            </Provider>
        );
    }

}


export default Timeline;
