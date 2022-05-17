import { createContext, useContext } from 'react';

import TimelineStore from './stores/TimelineStore';


export const TimelineContext = createContext<TimelineStore>(new TimelineStore());
export const useTimeline = () => useContext<TimelineStore>(TimelineContext);
