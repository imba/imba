interface Element {
    /**
     * Schedule this element to render after imba.commit()
     */
    schedule(): this;
    unschedule(): this;
    data: any;
    hotkey: any;
    hotkey__: any;
    route: any;
    route__: any;
    $key: any;
    emit(event:string, params?: any, options?: any): Event;
    focus(options?: any): void;
    blur(): void;
    
    [key: string]: any;

    setAttribute(name: string, value: boolean): void;
    setAttribute(name: string, value: number): void;
}

interface ImbaElement implements Element {
    [key: string]: any;
}

interface ImbaAnyElement implements ImbaElement {
    [key: string]: any;
}

interface ImbaStyles {
    [key: string]: any;
}

interface ImbaAsset {
    body: string;
    url: string;
    absPath: string;
    path: string;
}


interface ImbaContext {
    setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    clearInterval(handle?: number): void;
    clearTimeout(handle?: number): void;
    commit(): Promise<this>;
    render(): Promise<this>;

    mount<T>(element: T): T;

    styles: ImbaStyles;

    createIndexedFragment(...arguments: any[]): DocumentFragment;
    createKeyedFragment(...arguments: any[]): DocumentFragment;
    createLiveFragment(...arguments: any[]): DocumentFragment;
    
    emit(source: any, event:string, params: any[]): void;
    listen(target: any, event:string, listener:any, path?: any): void;
    once(target: any, event:string, listener:any, path?: any): void;
    unlisten(target: any, event:string, listener:any, path?: any): void;
    indexOf(target: any, source:any): boolean;

    serve(target: any, options?:any): any;
}

interface Event {
    detail: any;
    originalEvent: Event | null;
}

interface Object {
    [key: string]: any;
}

declare const imba: ImbaContext

declare global {
    imba: ImbaContext;
}