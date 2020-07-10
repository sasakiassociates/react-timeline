import React from 'react';
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

        return ui.scrubberPosition ? (
            <div
                className="react-timeline__scrubber"
                style={{
                    left: `${100 * spaces.timeToPx(ui.scrubberPosition) / ui.width}%`,
                }}
            >
                <div
                    className="react-timeline__scrubber-buffer"
                    onMouseDown={this.onMouseDown.bind(this)}
                />

                {this.props.children}
            </div>
        ) : null;
    }

}

export default Scrubber;
