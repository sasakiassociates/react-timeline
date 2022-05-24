/**
 * Action
 */


export enum Actions {
    DRAG,
    PAN,
    RESIZE,
    SCRUB,
    SEGMENT,
    SELECT,
    NOOP
};

export default class Action {

    readonly type: Actions;
    readonly data?: any;

    constructor(type: Actions = Actions.NOOP, data?: object) {
        this.data = data;
        this.type = type;
    }

};
