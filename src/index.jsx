import React from 'react';
import { observer, Provider } from 'mobx-react';

import './styles.scss';

import config from './config';
import RootStore from './stores/root';
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

    componentDidUpdate() {
        if (this.store.isDragging) {
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        }
        else {
            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
        }
    }

    onMouseMove = ({ x, y }) => {
        const { dragging, viewport } = this.store;
        const { item: block , container } = dragging;

        const newStart = viewport.left + viewport.width * (x - container.left) / container.width;
        block.setEnd(block.end + (newStart - block.start));
        block.setStart(viewport.left + viewport.width * (x - container.left) / container.width);
    }

    onMouseUp = () => {
        this.store.setDragging(null);
    }


    render() {
        const { isDragging, ui } = this.store;

        return (
            <Provider store={this.store} ui={this.store.ui} viewport={this.store.viewport}>
                <div
                    className={`react-timeline ${isDragging ? 'react-timeline--dragging' : ''}`}
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
