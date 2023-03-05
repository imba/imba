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

interface Route {

}

interface ElementRoute {
    node: HTMLElement;
    path: string;
    get route(): Route;
    get params(): any;
    get state(): any;
}

declare global {
    declare namespace imba {

        /**
         * @custom
         */
        interface Router {
        
            /**
             * The currently matching path
             */
            path: string;
            /**
             * The hash
             */
            hash: string;
            url: URL;
            pathname: string;
            history: RouterHistory;

            state: RouteState;

            refresh(): void;
        
            alias(from: string, to: string): void;
            /**
             * See if router currently matches a pattern/path
             */
            match(pattern: string | RegExp): null | any;
        
            /**
             * Go to a url
             * @param url 
             * @param state 
             */
            go(url: string, state?: object): void;
            /**
             * Switch to another url without pushing to the history
             * @param url
             * @param state
             */
            replace(url: string, state?: object): void;

            // on(event:string,callback:Function);
            on<K extends keyof RouteEventMap>(type: K, listener: (ev: RouteEventMap[K]) => any): void;

            // addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        }
        
        
        /**
         * Reference to global router
         */
        let router: Router;
    }

    interface Element {
        /**
         * @idl
         * @summary The path/route this element should be enabled for
         */
        set route(val: string);
        get route(): imba.ElementRoute;
        
        /**
         * @idl
         * @summary The path/route to go to when clicking this element
         */
        routeΞto: string;
        
        /**
         * @summary Reference to the imba router
         * @custom
         */
        readonly router: imba.Router;
        
        // internal - not to be called
        // routed(match:RouteMatch,state:any,prev:RouteMatch): any;
    }
}