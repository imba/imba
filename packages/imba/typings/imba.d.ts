/// <reference path="./imba.types.d.ts" />
/// <reference path="./imba.dom.d.ts" />
/// <reference path="./imba.events.d.ts" />
/// <reference path="./imba.router.d.ts" />
/// <reference path="./imba.snippets.d.ts" />

/// <reference path="./styles.d.ts" />
/// <reference path="./styles.generated.d.ts" />
/// <reference path="./styles.modifiers.d.ts" />

interface Node {
    /**
     * @custom
     * @summary Proxy to reference data on elements up the tree
     */
    get Ψcontext(): ΤObject;
    
    
    /**
     * @custom
     * @summary Reference to the parentNode even before element has been attached
     */
    get Ψparent(): ΤObject;
}

interface Element {
    
    /**
     * @idl
     * @summary Default property for setting the data of an element
     */
    data: any;
    
    /**
     * @idl
     */
    route: any;
    
    /**
     * @private
     */
    private route__: any;
    
    /**
     * @idl
     * @summary The path/route this element should be enabled for
     */
    route: string;
    
    /**
     * @idl
     * @summary The path/route to go to when clicking this element
     */
    routeΞto: string;
    
    /**
     * @summary Reference to the imba router
     * @custom
     */
    get router(): imba.Router;
    
    /**
    * Gives elements a stable identity inside lists
    * @idl
    */
    $key: any;
    
    /**
    * Sets whether `@hotkey` events inside of this element
    * is enabled or not. If explicitly set to true, only
    * `@hotkey` events inside this group will be triggered
    * when this element or a child has focus.
    * @summary Sets whether `@hotkey` events inside of this element
    * is enabled or not
    * @idl
    */
    hotkeys: bool;

    /**
    * Enable transitions for when element is attached / detached
    * @see[Transitions](https://imba.io/css/transitions)
    * @idl
    */
    ease: any;

    // itemid: any;
    // itemprop: any;
    // itemref: any;
    // itemscope: any;
    // itemtype: any;
    // enterkeyhint: any;
    // autofocus: any;
    // autocapitalize: any;
    // autocomplete: any;
    // accesskey: any;
    // inputmode: any;
    // spellcheck: any;
    // translate: any;
    // is: any;
    
    /**
     * @summary Allows for manipulation of element's class content attribute
     */
    get flags(): {
        contains(flag: string): boolean;
        add(flag: string): void;
        remove(flag: string): void;
        toggle(flag: string, toggler?: any): void;
        incr(flag: string): number;
        decr(flag: string): number;
    }
    
    /**
     * Emits event
     * @param event 
     * @param params 
     * @param options 
     * @custom
     */
    emit(event: string, params?: any, options?: any): Event;
    focus(options?: any): void;
    blur(): void;

    // [key: string]: any;
    
    setAttribute(name: string, value: boolean): void;
    setAttribute(name: string, value: number): void;
    
    addEventListener(event: string, listener: (event: Event) => void, options?: {
        passive?: boolean;
        once?: boolean;
        capture?: boolean;
    });

    removeEventListener(event: string, listener: (event: Event) => void, options?: {
        passive?: boolean;
        once?: boolean;
        capture?: boolean;
    });

    log(...arguments: any[]): void;
}

interface Document {
    get flags(): {
        contains(flag: string): boolean;
        add(flag: string): void;
        remove(flag: string): void;
        toggle(flag: string, toggler?: any): void;
        incr(flag: string): number;
        decr(flag: string): number;
    }
}

interface HTMLMetaElement {
    property?: string;
}

interface EventListenerOptions {
    passive?: boolean;
    once?: boolean;
}

interface Storage {
    setItem(key: string, value: number): void;
}

interface HTMLStyleElement {
    /**
     * The supplied path will be run through the imba bundler
     */
    src: ImbaAsset | string;
}

interface SVGSVGElement {
    /**
     * Reference to svg asset that will be inlined
     */
    src: ImbaAsset | string;
}

declare class ΤObject {
    [key: string]: any;
}


/** Portal to declare window/document event handlers from
 * inside custom tags.
 */
declare class Γglobal extends HTMLElement {

}

declare class Γteleport extends HTMLElement {
    /** The element (or selector) you want to add listeners and content to */
    to: string | Element;
}

interface HTMLElementTagNameMap {
    "global": Γglobal,
    "teleport": Γteleport
}

interface ImbaAsset {
    body: string;
    url: string;
    absPath: string;
    path: string;
}

interface Event {
    detail: any;
    originalEvent: Event | null;
}

// interface Object {
//     [key: string]: any;
// }

declare namespace imba {

    /**
     * @custom
     */
    declare class Component extends HTMLElement {
        
        /**
         * @summary Called to update the element and their children
         * @abstract
         * @lifecycle
        */
        render(): any;
        
        /**
     * @summary Suspend rendering of component
     */
        suspend(): this;
        
        /**
        * @summary Unsuspend rendering of component
        * @lifecycle
        */
        unsuspend(): this;

        /**
         * @summary Tells whether the component should render
         * @abstract
         * @lifecycle
        */
        get renderΦ(): boolean;
        
        /**
         * @readonly
         * @summary Tells whether the component is currently being mounted
         * @lifecycle
        */
        get mountingΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component is currently mounted in document
         * @lifecycle */
        get mountedΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component has been awakened
         * @lifecycle */
        get awakenedΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component has been rendered
         * @lifecycle */
        get renderedΦ(): boolean;
        
        /**
         * @readonly
         * @summary Tells whether the component has been suspended
         * @lifecycle */
        get suspendedΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component is currently rendering
         * @lifecycle */
        get renderingΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component is scheduled to automatically render
         * @lifecycle 
         * */
        get scheduledΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component has been hydrated on the client
         * @lifecycle */
        get hydratedΦ(): boolean;
        
        /** 
         * @readonly
         * @summary Tells whether the component was originally rendered on the server */
        get ssrΦ(): boolean;
        
        /**
         * @summary Start rendering the component on every imba.commit 
         */
        schedule(): this;
        
        /**
         * @summary Stop rendering the component automatically on every imba.commit
         */
        unschedule(): this;
        
        /**
         * @summary Called before any properties are set
         * @lifecycle
         * @abstract
         */
        build(): any;
        
        /**
         * @summary Called before any properties are set
         * @lifecycle
         * @abstract
         */
        setup(): any;
        
        /**
         * @summary Called before any properties are set
         * @lifecycle
         * @abstract
         */
        awaken(): any;
        
        /**
         * @summary Called when element is attached to document
         * @lifecycle
         * @abstract
         */
        mount(): any;
        
        /**
         * @summary Called when element is detached from document
         * @lifecycle
         * @abstract
         */
        unmount(): any;
        
        /**
         * @summary Called after render
         * @lifecycle
         * @abstract
         */
        rendered(): any;
        

        /**
        Schedule the element to update itself
        yes = render on events / imba.commit
        no = force manual render
        null / undefined = render via parent
        (n)s = render every n s
        (n)ms = render every n ms
        (n)fps = render n times per second
        
        @summary Specify how / when the component should re-render
        @idl
        */
        autorender: boolean | number | null | `${number}ms` | `${number}s` | `${number}fps`;
    }

    function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
    function clearInterval(handle?: number): void;
    function clearTimeout(handle?: number): void;
    
    /**
     * Schedule re-render
     */
    function commit(): Promise<void>;
    
    /**
     * Render elements in custom context
     */
    function render(func: Function, context?: any): any;
    
    /**
     * Attach an element to the dom
     * @param element 
     * @param into 
     */
    function mount<T>(element: T, into?: Element): T;
    function mount(func: Function, into?: Element): Element;
    
    /**
     * Detach element from document
     * @param element 
     */
    function unmount<T>(element: T): T;
    
    

    let colors: string[];
    
    

    namespace types {
        let events: GlobalEventHandlersEventMap;
        let eventHandlers: GlobalEventHandlers;

        namespace html {
            let tags: HTMLElementTagNameMap;
            let events: GlobalEventHandlersEventMap;
        }

        namespace svg {
            let tags: SVGElementTagNameMap;
            let events: SVGElementEventMap;
        }
    }

    let Element: Component;
    
    /**
     * Class for scheduling
     */
    export interface Scheduler {
        add(target: any, force?: boolean): void;
        on(group: string, target: any): void;
        un(group: string, target: any): void;

        /** Milliseconds since previous tick */
        dt: number;
    }
    
    /**
     * Reference to global scheduler
     */
    let scheduler: Scheduler;

    function createIndexedFragment(...arguments: any[]): DocumentFragment;
    function createKeyedFragment(...arguments: any[]): DocumentFragment;
    function createLiveFragment(...arguments: any[]): DocumentFragment;

    function emit(source: any, event: string, params: any[]): void;
    function listen(target: any, event: string, listener: any, path?: any): void;
    function once(target: any, event: string, listener: any, path?: any): void;
    function unlisten(target: any, event: string, listener: any, path?: any): void;
    function indexOf(target: any, source: any): boolean;
    
    /**
     * Start an asset-aware server
     */
    function serve(target: any, options?: any): any;
}

declare module "data:text/asset;*" {
    const value: ImbaAsset;
    export default value;
    export const body: string;
    export const url: string;
    export const absPath: string;
    export const path: string;
}

declare module "imba/compiler" {
    export function compile(fileName: string, options: any): any;
}

declare module "imba" {

}