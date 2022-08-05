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

        on(event:string,callback:Function);
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
}