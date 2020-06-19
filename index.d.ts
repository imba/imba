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
    emit(event:string, params?: any): Event;
    focus(options?: any): void;
    blur(): void;
}

interface ImbaElement implements Element {
}

interface ImbaAnyElement implements ImbaElement {
    [key: string]: any;
}


interface Imba {
    setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    clearInterval(handle?: number): void;
    clearTimeout(handle?: number): void;
    commit(): Promise<this>;
    render(): Promise<this>;

    mount<T>(element: T): T;

    createIndexedFragment(...arguments: any[]): DocumentFragment;
    createKeyedFragment(...arguments: any[]): DocumentFragment;
    createLiveFragment(...arguments: any[]): DocumentFragment;
    
    emit(source: any, event:string, params: any[]): void;
    listen(target: any, event:string, listener:any, path?: any): void;
    once(target: any, event:string, listener:any, path?: any): void;
    unlisten(target: any, event:string, listener:any, path?: any): void;
    indexOf(target: any, source:any): boolean;
}

declare const imba: Imba