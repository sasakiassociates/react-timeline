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

        return (
            <div
                className="react-timeline__editor-scrubber"
                onMouseDown={this.onMouseDown.bind(this)}
                style={{
                    left: `${100 * spaces.timeToPx(ui.scrubber) / ui.width}%`,
                }}
            />
        );
    }

}

export default Scrubber;
