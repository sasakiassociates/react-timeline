/**
 * SelectBox
 *
 * Draws a box that indicates the currently selected area of the editor.
 */

import React from 'react';
import { observer, inject } from 'mobx-react';


@inject('store')
@observer
class SelectBox extends React.Component {

    render() {
        const { spaces, viewport, ui } = this.props.store;
        const { height, selectBox,  width } = ui;
        const { top, bottom } = viewport;

        const selectBoxStyles = {
            width: `${Math.abs(selectBox.width)}px`,
            height: `${Math.abs(selectBox.height)}px`,
        };

        if (selectBox.height < 0) {
            selectBoxStyles.bottom = `${(height * .75) - (selectBox.y - top)}px`;
        }
        else {
            selectBoxStyles.top = `${selectBox.y - top}px`;
        }

        if (selectBox.width < 0) {
            selectBoxStyles.right = `${width - spaces.timeToPx(selectBox.x)}px`;
        }
        else {
            selectBoxStyles.left = `${spaces.timeToPx(selectBox.x)}px`;
        }

        return (
            <div
                className="react-timeline__editor-layer--select-box"
                style={selectBoxStyles}
            />
        );
    }

}


export default SelectBox;
