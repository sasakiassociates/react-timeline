/**
 * Block
 */

import React from 'react';
import { observer } from 'mobx-react';


@observer
class Block extends React.Component {

    render() {
        const { x, y, width } = this.props;
        console.log(x,y,width);

        return (
            <div
                className="react-timeline__block"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    background: 'rgb(200,200,200)',
                }}
            >
            </div>
        );
    }

}


export default Block;
