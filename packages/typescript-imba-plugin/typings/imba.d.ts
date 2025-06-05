/// <reference path="./imba.types.d.ts" />
/// <reference path="./imba.dom.d.ts" />
/// <reference path="./imba.events.d.ts" />
// <reference path="./imba.router.d.ts" />
/// <reference path="./imba.snippets.d.ts" />
/// <reference path="./imba.meta.d.ts" />
/// <reference path="./styles.d.ts" />
/// <reference path="./styles.generated.d.ts" />
/// <reference path="./styles.modifiers.d.ts" />

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

// Added

interface HTMLMetaElement {
    charset: string;
}

declare class Γany extends HTMLElement {
    [key: string]: any;
}


interface ImbaAsset {
    body: string;
    url: string;
    absPath: string;
    path: string;
}

declare namespace imba  {
    // Should be documented in codebase instead

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

    /**
     * Replaced at compile-time by looking in process.env
     */
    function $env(key:string): any;

    type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
    type Desc<T> = {[K in keyof T]: IsFunction<T[K]> extends true ? T[K] : (arg: T[K]) => void};
    function descriptor<T>(val: T): Desc<T>;

    interface Storage extends Function {
        [key: string]: any;
        (ns: string): Storage;
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



interface GlobalClassMap {

}

type ImbaConstructor = new (...args:any[]) => any;

type ImbaSubclassKeys<T,C> = { [K in keyof T]:
    unknown extends T[K] ? never : (T[K] extends C ? K : never)
}[keyof T];

declare const ImbaUnionType: unique symbol;
// Wrap any type in Any<...> to potentially return a subclass set
type Any<T> = T extends { [ImbaUnionType]: infer A } ? A 
    : T extends new (...args:any[]) => {[ImbaUnionType]: infer X} ? X 
    : T extends new (...args:any[]) => any ? InstanceType<T> : T;

type ImbaSubclassUnion<C,T = GlobalClassMap> = T[ImbaSubclassKeys<T, C>];


declare module "imba/compiler" {
    export function compile(fileName: string, options: any): any;
}

declare module "imba/runtime" {
    export function iterable$<T>(a:T):(T extends {toIterable: (...args: any[]) => infer X} ? X : T);

    export function isa$<T>(a:T):(T extends {[Symbol.hasInstance]: (...args: any[]) => infer X} ? T : false);
    // type Narrow<T,R> = R extends {Ψmatcher: (item: T) => infer X} ? X : String;
    // export function is$<T,R>(a:T,b:R):a is Narrow<T,R>;
    export function is$<T,R>(a:T,b:R):a is R;

    // export function rescue$<T extends (...args: any) => any>(cb:T): ReturnType<T> | Error;
    export function rescue$<T>(value:T): T | Error;

}

declare module "imba/typings" {

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