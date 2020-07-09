/**
 * Action
 *
 * Actions alter which event listeners are active and
 * what the listeners should do.
 */


const actions = {
    DRAG: 'action_drag',
    NOOP: 'action_noop',
    PAN: 'action_pan',
    RESIZE: 'action_resize',
    SCRUB: 'action_scrub',
    SELECT: 'action_select',
};


class Action {

    constructor(type = actions.NOOP, data = null) {
        if (Object.values(actions).indexOf(type) === -1) {
            throw Error('Invalid action');
        }

        this.type = type;
        this.data = data;
    }

}


export default Action;
export { actions };
