export {}

interface RouteEventMap {
    "change": RouteRequest;
    "beforechange": RouteRequest;
    "hashchange": string;
}

interface RouteMatch {
    [key: string]: any;
}

interface RouterHistory {

    next?: RouteState;
    prev?: RouteState;
    state: RouteState;
    states: RouteState[];
    slice(start:number,end?:number): RouteState[];
    index: number;
    get length(): number;
    get currentStates(): RouteState[];
    at(index:number): RouteState;
}

interface RouteState {
    history: RouterHistory;
    next?: RouteState;
    prev?: RouteState;
    index: number;
    local: boolean;
    data: any;
    path: string;
    // Saves potential changes of path/data/index/type to sessionStorage
    save(): this;
}

interface RouteRequest {
    params: any;
    path: string;
    url: string;
    aborted: boolean;

    apply: RouteState[];
    revert: RouteState[];
    state: RouteState;
    mode: "pop" | "push" | "replace";

    abort(force:boolean): this;
    match(pattern:string): RouteMatch?;
    redirect(path: string): this;
}
