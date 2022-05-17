/**
 * General types
 */

export type Box = {
    top: number;
    left: number;
    right: number;
};

export type StateHook<T> = (T | ((value: T) => any))[];

export type Timespan = {
    start: number;
    end: number;
};

export function noop() {}
