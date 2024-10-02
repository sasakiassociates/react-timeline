/**
 * Block Proxy
 */

import { 
    computed, 
    observable, 
    makeObservable, 
    runInAction 
} from 'mobx';

import { Timespan } from '../types';


export default class BlockProxy {

    constructor() {
        makeObservable(this);
    }


    // Selected Proxy

    @observable
    _selected: boolean = false;

    @computed
    get selected() {
        return this._selected;
    }

    setSelected(selected: boolean) {
        runInAction(() => {
            this._selected = selected;
        });
    }
 

    // Timespan Proxy

    @observable
    _timespan: Timespan = { start: 0, end: 0 };

    @computed
    get timespan() {
        return this._timespan;
    }

    setTimespan(timespan: Timespan) {
        runInAction(() => {
            this._timespan = timespan;
        });
    }

    // Y Proxy

    @observable
    _y: number = 0;

    @computed
    get y() {
        return this._y;
    }

    setY(y: number) {
        runInAction(() => {
            this._y = y;
        });
    }


    destroy() {
    }

    // projects_on_requiredByProject proxy
    @observable
    _projects_on_requiredByProject: object[] = []

    @computed
    get projects_on_requiredByProject() {
        return this._projects_on_requiredByProject;
    }
 
    setProjects_on_requiredByProject(projects_on_requiredByProject: object[]){
        runInAction(()=>{
            this._projects_on_requiredByProject = projects_on_requiredByProject;
        })
    }

    // projects_on_requiresProject proxy
    @observable
    _projects_on_requiresProject: object[] = []

    @computed
    get projects_on_requiresProject() {
        return this._projects_on_requiresProject;
    }
 
    setProjects_on_requiresProject(projects_on_requiresProject: object[]){
        runInAction(()=>{
            this._projects_on_requiresProject = projects_on_requiresProject;
        })
    }
}


