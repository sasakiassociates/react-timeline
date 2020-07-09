import React from 'react';
import { inject, observer } from 'mobx-react';

import Action, { actions } from '../../types/action';


@inject('store')
@observer
class Scrubber extends React.Component {

    onMouseDown = e => {
        const { ui } = this.props.store;

        ui.setAction(new Action(actions.SCRUB));
    }

    render() {
        return (
            <div
                className="react-timeline__editor-scrubber"
                onMouseDown={e => this.onMouseDown(e)}
            />
        );
    }

}

export default Scrubber;
