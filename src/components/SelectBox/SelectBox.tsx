/**
 * SelectBox
 *
 * Draws a box that indicates the currently selected area of the editor.
 */

import { observer } from 'mobx-react';

import { useTimeline } from '../../context';
import { Actions } from '../../models/Action';


export default observer(function SelectBox() {
    const { spaces, viewport, ui } = useTimeline();
    const { height, selectBox,  width } = ui;
    const { top } = viewport;

    if (ui.action.type !== Actions.SELECT || selectBox === null) {
        return <></>;
    }

    const selectBoxStyles = {
        width: `${Math.abs(selectBox.width)}px`,
        height: `${Math.abs(selectBox.height)}px`,
        top: undefined,
        bottom: undefined,
        right: undefined,
        left: undefined,
    };

    if (selectBox.height < 0) {
        selectBoxStyles.bottom = `${(height * .85) - (selectBox.y - top)}px`;
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
            className="ReactTimeline__SelectBox"
            style={selectBoxStyles}
        />
    );
});
