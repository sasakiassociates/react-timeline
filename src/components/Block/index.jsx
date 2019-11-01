/**
 * Block
 */

import React from 'react';
import { observer } from 'mobx-react';


@observer
class Block extends React.Component {

    constructor() {
        super(...arguments);
    }

    render() {
        return (
            <div className="react-timeline__block">
            </div>
        );
    }

}


export default Block;
