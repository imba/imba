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
        match(pattern: string | RegExp): null | object;
    
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
    }
    
    /**
     * Reference to global router
     */
    let router: Router;
}