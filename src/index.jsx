import React from 'react';
import { Provider } from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
import Scrubber from './components/Scrubber';
import { ContinuousEditor } from './components/Editors';
import { ContinuousCalendar } from './components/Calendars';



class Timeline extends Component {

    static defaultProps = config;


    constructor(props) {
        super(...arguments);

        this.store = new RootStore(props);
    }


    render() {
        return (
            <Provider store={this.store}>
                <div className="react-timeline">
                    <ContinuousCalendar />
                    <ContinuousEditor />
                    <Scrubber />
                </div>
            </Provider>
        );
    }

}


export default Timeline;
