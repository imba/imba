interface ImbaRouter {
    
    path: string;
    hash: string;
    url: URL;
    pathname: string;

    refresh(): void;
    alias(from: string, to: string): void;
    match(pattern: string | RegExp): null | object; 
    go(url: string, state?: object): void;
    replace(url: string, state?: object): void;
}