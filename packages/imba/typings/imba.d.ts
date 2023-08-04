/// <reference path="./imba.types.d.ts" />
/// <reference path="./imba.dom.d.ts" />
/// <reference path="./imba.events.d.ts" />
/// <reference path="./imba.router.d.ts" />
/// <reference path="./imba.snippets.d.ts" />
/// <reference path="./imba.meta.d.ts" />

/// <reference path="./styles.d.ts" />
/// <reference path="./styles.generated.d.ts" />
/// <reference path="./styles.modifiers.d.ts" />

interface Node {
    /**
     * @custom
     * @summary Proxy to reference data on elements up the tree
     */
    readonly Ψcontext: imba.Context;

    /**
     * @custom
     * @summary Reference to the parentNode even before element has been attached
     */
    readonly Ψparent: Element;
}

interface Element {

    /**
     * @idl
     * @summary Default property for setting the data of an element
     */
    data: any;

    /**
     * @private
     */
    private route__: any;

    /**
    * Gives elements a stable identity inside lists
    * @idl
    * @deprecated Use key instead
    */
    $key: any;

    /**
    * Gives elements a stable identity inside lists.
    * Any value (both objects and primitive values) may be used as a key.
    * @idl
    */
    key: any;

    /**
    * Sets whether `@hotkey` events inside of this element
    * is enabled or not. If explicitly set to true, only
    * `@hotkey` events inside this group will be triggered
    * when this element or a child has focus.
    * @summary Sets whether `@hotkey` events inside of this element
    * is enabled or not
    * @idl
    */
    hotkeys: boolean;

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
    readonly flags: imba.Flags;

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
    readonly flags: imba.Flags;
}

interface HTMLMetaElement {
    property?: string;
    charset?: string;
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

declare class ImbaElement extends imba.Component {

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

declare class Γany extends HTMLElement {
    [key: string]: any;
}

declare function Γany extends HTMLElement {
    [key: string]: any;
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

    interface Globals {
        /** The global clearInterval() method cancels a timed, repeating action which was previously established by a call to setInterval(). */
        clearInterval(handle?: number): void;
        /** The global clearTimeout() method cancels a timeout previously established by calling setTimeout(). */
        clearTimeout(handle?: number): void;
        fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
        queueMicrotask(callback: VoidFunction): void;
        /**
         * The setInterval() method, offered on the Window and Worker interfaces, repeatedly calls a function or executes a code snippet, with a fixed time delay between each call.
         */
        setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
        /** The global setTimeout() method sets a timer which executes a function or specified piece of code once the timer expires. */
        setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;

        /**
         * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a number).
         * @param number A numeric value.
         */
        isNaN(number: number): boolean;

        /**
         * Determines whether a supplied number is finite.
         * @param number Any numeric value.
         */
        isFinite(number: number): boolean;

        /** Reference to the current window */
        readonly window: Window;

        /** Reference to the current document */
        readonly document: Document;

        /** Reference to the current document */
        readonly process: any;

        /** Dirname */
        readonly __dirname: string;

        /** Filename */
        readonly __filename: string;

        /** Real filename */
        readonly __realname: string;

        /** Reference to the global object */
        readonly global: typeof globalThis;

        /**
         * Converts a string to an integer.
         * @param string A string to convert into a number.
         * @param radix A value between 2 and 36 that specifies the base of the number in `string`.
         * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
         * All other strings are considered decimal.
         */
        parseInt(string: string, radix?: number): number;

        /**
         * Converts a string to a floating-point number.
         * @param string A string that contains a floating-point number.
         */
        parseFloat(string: string): number;

        /** Access to the global console object */
        console: Console;
    }

    interface Context {
        [key: string]: any;
    }

    interface Flags {
        /**
         *
         * @summary Returns true if the list contains the given token, otherwise false.
         */
        contains(flag: string): boolean;
        /**
         *
         * @summary Adds the specified token to the list.
         */
        add(flag: string): void;
        /**
         *
         * @summary Removes the specified token from the list.
         */
        remove(flag: string): void;
        /**
         *
         * @summary Toggles specified token in the list.
         */
        toggle(flag: string, toggler?: any): void;
        /**
         *
         * @summary Adds the specified token to the list
         */
        incr(flag: string): number;
        /**
         *
         * @summary Removes the specified token from the list if zero increments remain
         */
        decr(flag: string): number;
    }

    interface units {
        /**
         * Milliseconds
         */
        ms: number;

        /**
         * Seconds. Compiles to n * 1000 (milliseconds in one second)
         */
         s: number;

        /**
         * Days. Compiles to n * 60000 (milliseconds in one minute)
         */
        minutes: number;

        /**
         * Hours. Compiles to n * 3600000 (milliseconds in 1 hour)
         */
        hours: number;

        /**
         * Days. Compiles to n * 86400000 (milliseconds in one day)
         */
        days: number;

        /**
         * Frames per second. Compiles to 1000 / n
         * Ie 60fps => 1000 / 60.
         */
        fps: number;

        /**
         * Pixels
         */
        px: string;

        /**
         * Bytes in n kilobytes
         */
        kb: number;

        /**
         * Bytes in n megabytes
         */
        mb: number;

        /**
         * Bytes in n gigabytes
         */
        gb: number;
    }

    namespace hotkeys {
        function trigger(combo: string): void;

        /**
         * Format combo as readable label
         */
        function humanize(combo: string, platform?: string): string;

        /**
         * Format combo as html (readable keys wrapped in <kbd> elements)
         */
         function htmlify(combo: string, platform?: string): string;
    }

    /**
     * @custom
     */
    class Component extends HTMLElement {

        /**
         * @summary Called to update the element and their children
         * @abstract
         * @lifecycle
        */
        render(): any;

        /**
         * @summary Called on client to hydrate SSR element
         * @abstract
         * @lifecycle
        */
         hydrate(): any;

         /**
         * @summary Called on server when stringifying a component
         * @abstract
         * @lifecycle
        */
          dehydrate(): any;

        /**
         * @summary Suspend rendering of component
         * @lifecycle
         */
        suspend(): this;

        /**
        * @summary Unsuspend rendering of component
        * @lifecycle
        */
        unsuspend(): this;

        /**
        * @summary Called to update element via scheduler
        * @abstract
        * @lifecycle
        */
        tick(): any;

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
         * @summary Called when element is *first* attached to document
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
    
	type mode = "development" | "production"
	interface setupCallback {
		(dist:string) : any
	}
	interface setupOptions {
		mode: mode
		serverOptions: import("Vite").ServerOptions
	}
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

    /**
     * Mark field as observable
     */
     function αobservable(): void;

    /**
     * Mark getter as computed
     */
     function αcomputed(): void;

    /**
     * Mark function as thenable
     */
      function αthenable(): void;

     /**
     * Runs the method immediately after instance is initialized
     * and re-runs whenever any of the referenced observables
     * change. Methods marked with autorun in tag declarations
     * will run immediately after mount, and automatically dispose
     * when element unmounts.
     */
      function αautorun(options?: any): void;

     /**
     * Mark getter as lazy. It will only be evaluated once,
     * and then return the resulting value forever after.
     */
      function αlazy(): void;

    let colors: string[];

    interface ImbaProcess {
        on(event:string,callback:Function);
    }

    let process: ImbaProcess;

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
     * @custom
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

    /*
    Observability
    TODO Complete & document types
    */

    interface Reaction {
        dispose(): this;
    }

    function observable<T>(value: T): T;

    function run(callback: any): void;
    function autorun(callback: any): Reaction;

    // TODO check if T responds to accessor method - if so, return the result of that type
    function accessor<T>(accessor: T,...rest:any[]): T extends {$accessor: (...args: any[]) => infer X} ? X : T;

    type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
    type Desc<T> = {[K in keyof T]: IsFunction<T[K]> extends true ? T[K] : (arg?: T[K]) => void};
    function descriptor<T>(val: T): Desc<T>;


    interface AccessorGenerator {
        $accessor(target: any, key: symbol, name: string | symbol, slot: symbol, context: any);
    }

    interface Accessor {
        $get(target: any, key: string | symbol, name: string | symbol): any;
        $set(value: any, target: any, key: string | symbol, name: string | symbol): void;
    }

    interface Storage extends Function {
        [key: string]: any;

        /** Returns a namespaced store where the namespace is the stringified parameter */
        (ns: any): Storage;
    }

    /**
     * localStorage as a rich object
     */
    let locals: Storage;

    /**
     * sessionStorage as a rich object
     */
    let session: Storage;
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

	interface ThemeColors {
		[key: string]: {
			[key: string]: string;
		};
	}
	
	interface Theme {
		colors?: ThemeColors;
	}

	interface ImbaConfig {
		/**
		* create aliases for color keywords, make your own keywords,
		* or redefine the default keywords to new color values
		* 
		* @example <caption>create an alias for the `indigo` color called `primary`</caption> 
		*  { theme: {colors: {primary: 'indigo'}}}
		* // now use it like this <h1[c:primary4]> "hey"  
		* 
		* @example <caption>Override default colors. Make `gray` an alias for `warmer` instead of the default gray color</caption> 
		*  { theme: {colors: {gray: 'warmer'}}}
		* 
		* @example <caption>create your own color keywords with specified tint values. Any unspecified tint values will be interpolated</caption> 
		*  { theme: {colors: { coral: {
		*						"0": "hsl(40,33%,98%)",
		*						"4": "hsl(6,56%,65%)",
		*						"9": "hsl(6,52%,15%)"
		*		}}}}
		**/
		theme?: Theme
	}
}