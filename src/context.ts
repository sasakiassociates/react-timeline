import { createContext, useContext } from 'react';


import TimelineStore from './stores/TimelineStore';
export const TimelineContext = createContext<TimelineStore>(new TimelineStore());
export const useTimeline = () => useContext<TimelineStore>(TimelineContext);

import BlockState from './models/BlockState';
export const BlockContext = createContext<BlockState>(new BlockState(new TimelineStore()));
export const useBlock = () => useContext<BlockState>(BlockContext);
