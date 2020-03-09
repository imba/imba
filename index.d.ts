interface Element {
    /**
     * Schedule this element to render after imba.commit()
     */
    schedule(): this;
    unschedule(): this;
    model: any;
    data: any;
    $key: any;
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
    mount(element: Element): this;

    createIndexedFragment(...arguments: any[]): DocumentFragment;
    createKeyedFragment(...arguments: any[]): DocumentFragment;
    createLiveFragment(...arguments: any[]): DocumentFragment;
    
    emit(source: any, event:string, params: any[]): void;
    listen(target: any, event:string, listener:any, path?: any): void;
    once(target: any, event:string, listener:any, path?: any): void;
    unlisten(target: any, event:string, listener:any, path?: any): void;
}

declare const imba: Imba