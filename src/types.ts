/**
 * General types
 */

export type Box = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export type Viewport = {
    top: number;
    left: number;
    right: number;
};

export type StateHook<T> = (T | ((value: T) => any))[];

export type Timespan = {
    start: number;
    end: number;
};

export function noop(..._: any[]): any {}
