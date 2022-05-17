import React from 'react';
import {observer, Provider} from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
import Navigator from './components/Navigator';
import Editors from './components/Editors';
import {ContinuousCalendar} from './components/Calendars';


@observer
class Timeline extends React.Component {

    static defaultProps = config;

    constructor(props) {
        super(...arguments);

        this.store = new RootStore(props);
    }

    componentDidUpdate() {
        if (this.props.scrubber !== this.store.ui.scrubber) {
            this.store.ui.setScrubber(this.props.scrubber);
        }
    }

    componentWillUnmount() {
        this.store.ui.clearEvents();
    }

    render() {
        const {ui, viewport} = this.store;
        const {editor, timelineLock, showNavigator} = this.props;

        // console.log('TIMELINE RENDER ', this.props)

        //TODO what is the best way to modify 'component state' from outside a component?
        // we can set properties on the component
        // and then apply those to the internal mobx state for react-timeline
        // OR do we expose the store directly through the timeline component so we can call this from the main app?
        if (timelineLock) {
            ui.setZoomLock(true);

            viewport.setLeft(timelineLock.left);
            viewport.setRight(timelineLock.right);
        } else {
            ui.setZoomLock(false);
        }

        const Editor = Editors[editor];

        return (
            <Provider store={this.store}>
                <div
                    className={`react-timeline ${ui.cursor}`}
                    ref={el => !ui.container && ui.setContainer(el)}
                >
                    <ContinuousCalendar/>
                    <Editor onBlockCreate={this.props.onBlockCreate} />
                    {showNavigator && <Navigator/>}
                </div>
            </Provider>
        );
    }

}


export {default as time} from "./time";
export {default as Block} from "./types/block";
export default Timeline;
