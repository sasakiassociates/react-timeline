/**
 * Action
 *
 * Actions effect which event listeners are active and
 * what they should do.
 */


const actions = {
    DRAG: 'action_drag',
    NOOP: 'action_noop',
    RESIZE: 'action_resize',
};


class Action {

    constructor(action = actions.NOOP, data = null) {
        if (Object.values(actions).indexOf(action) === -1) {
            throw Error('Invalid action');
        }

        this.action = action;
        this.data = data;
    }

}


export default Action;
export { actions };
