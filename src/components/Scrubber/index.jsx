import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';

import Action, { actions } from '../../types/action';


@inject('store')
@observer
class Scrubber extends React.Component {

    onMouseDown = () => {
        this.props.store.ui.setAction(new Action(actions.SCRUB));
    }

    render() {
        const { spaces, ui } = this.props.store;

        return ui.scrubber ? (
            <div
                className="react-timeline__scrubber"
                style={{
                    left: `${100 * spaces.timeToPx(ui.scrubber) / ui.width}%`,
                }}
            >
                <div
                    className="react-timeline__scrubber-buffer"
                    onMouseDown={this.onMouseDown.bind(this)}
                />
            </div>
        ) : null;
    }

}

export default Scrubber;
