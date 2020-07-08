import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class Scrubber extends React.Component {

    render() {
        return (
            <div className="react-timeline__scrubber">
            </div>
        );
    }

}

export default Scrubber;
