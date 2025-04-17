
type FlagTarget = Element | Document | string;

interface Event {
    /**
     Tells the browser that the default action should not be taken. The event will still continue to propagate up the tree. See Event.preventDefault()
    @see https://imba.io/events/event-modifiers#core-prevent
    */
    // αprevent(): void;
    
    /**
     Stops the event from propagating up the tree. Event listeners for the same event on nodes further up the tree will not be triggered. See Event.stopPropagation()
    */
    αstop(): void;

    /**
     Prevents default action & stops event from bubbling.
    */
    αtrap(): void;

    /**
     * Indicates that the listeners should be invoked at most once. The listener will automatically be removed when invoked.
     */
    αonce(): void;

    /**
     * Indicating that events of this type should be dispatched to the registered listener before being dispatched to tags deeper in the DOM tree.
     */
    αcapture(): void;

    /**
     * Indicates that the listener will never call preventDefault(). If a passive listener does call preventDefault(), the user agent will do nothing other than generate a console warning. This is useful for optimal performance while scrolling etc.
     *
     * @summary indicates that the listener will never call preventDefault()
     */
    αpassive(): void;

    /**
     * By default, Imba will re-render all scheduled tags after any *handled* event. So, Imba won't re-render your application if you click an element that has no attached handlers, but if you've added a `@click` listener somewhere in the chain of elements, `imba.commit` will automatically be called after the event has been handled.
     * 
     * This is usually what you want, but it is useful to be able to override this, especially when dealing with `@scroll` and other events that might fire rapidly.
     * 
     * #### Syntax
     * ```imba
     * # Will only trigger when intersection ratio increases
     * <div \@click.silent=handler>
     * ```
     * @summary Don't trigger imba.commit from this event handler
     */
    αsilent(): void;

    /**
     * Calls `imba.commit` when event is handled. This will happen by default for all events with a handler (so `.commit` is superflous in the case of `<@event.commit=handler>`). There are cases however where you just want to make sure the interface is updated when certain events are triggered, without actually doing anything in response to the event. Ie. if you have an audio-element and you render something based on the `playState` of said element, you might want to commit for certain events: `<audio @ended.commit @play.commit @pause.commit>`.
     *
     * @summary indicates that the listener will call imba.commit
     */
     αcommit(): void;

    /** The wait modifier delays the execution of subsequent modifiers and callback. It defaults to wait for 250ms, which can be overridden by passing a number or time as the first/only argument.
     *
     * @summary pause handler for `n` duration (default 250ms)
     * @detail (time = 500ms)
     */
    αwait(time?: Time): void;

    /**
     * The `throttle` modifier ensures the handler is called at most every `n` milliseconds (defaults to 500ms). This can be useful for events that fire very rapidly like `@scroll`, `@pointermove` etc.
     *
     * See `@event.cooldown` and `@event.debounce`.
     * @detail (time = 500ms)
     * @summary ensures that handler triggers at most every `n` seconds
     */
    αthrottle(time?: Time): void;

    /**
     * The `cooldown` modifier ensures the handler is called at most every `n` milliseconds (defaults to 500ms). This can be useful for events that fire very rapidly like `@scroll`, `@pointermove` etc.
     *
     * See `@event.throttle` and `@event.debounce`.
     *
     * @detail (time = 500ms)
     * @summary disable handler for a duration after trigger
     */
    αcooldown(time?: Time): void;

    /**
     * The `debounce` modifier ensures that a minimum amount of time has elapsed after the user stops interacting and before calling the handler. This is especially useful, for example, when querying an API and not wanting to perform a request on every keystroke.
     *
     * See `@event.cooldown` and `@event.throttle`.
     * @detail (time = 500ms)
     * @summary dont trigger until no events has been handled for `n` time
     */
    αdebounce(time?: Time): void;

    /**
     Stops handling unless event is trusted
     @see https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted
    */
    αtrusted(): boolean;

    /**
     * The `self` event modifier is a handy way of reacting to events only when they are clicked on the actual element you are interacting with and not, for example, a child element. This can be useful for things like modal wrappers when you only want to react when clicking directly.
     * @summary Handle if event.target is the element itself
     */
    αself(): boolean;

    /**
     * Only trigger handler if event.target matches selector
     * @detail (selector)
     * */
    // αsel(selector: string422): boolean;

    /**
     * Only trigger handler if event.target.closest(selector) returns a match
     * @detail (selector)
     * */
     αclosest(selector: string): boolean;

    /**
     * Only trigger condition is truthy
     * @detail (condition)
     * */
    αif(condition: unknown): boolean;

    /**
     * Trigger a custom event via this handler
     * @param name The name of the event to trigger
     * @param detail Data associated with the event
     * @detail (name,detail = {})
     * */
    αemit(name: string, detail?: any): void;
     /**
     * Trigger a custom event via this handler
     * @param detail Data associated with the event
     * @deprecated
     * */
    αemitΞname(detail?: any): void;

    /**
     * Add an html class to target for at least 250ms
     * If the callback returns a promise, the class
     * will not be removed until said promise has resolved
     * @param name the class to add
     * @param target the element on which to add the class. Defaults to the element itself
     * @detail (name,target?)
     * */
    αflag(name: string, target?: FlagTarget): void;

    /**
     * Add an html class to target for at least 250ms
     * If the callback returns a promise, the class
     * will not be removed until said promise has resolved
     * @param target the element on which to add the class. Defaults to the element itself
     * @deprecated
     **/
    αflagΞname(target?: FlagTarget): void;

    /**
     * Logs to console
     * @detail (...data)
     */
    αlog(...data: any[]): void;

    /**
     * Handle if event originates from outside the literal container of the `<global>` teleport.
     * This modifier is only supported on `<global>` listeners.
     *
     * @summary Handle if event originates from outside the handler
     */
     αoutside(): void;
}

interface MouseEvent {
    /**
    * Handle if ctrlKey is pressed
    *
    */
    αctrl(): boolean;

    /**
    * Handle if altKey is pressed
    *
    */
    αalt(): boolean;

    /**
    * Handle if shiftKey is pressed
    *
    */
    αshift(): boolean;

    /**
    * Handle if metaKey is pressed
    *
    */
    αmeta(): boolean;

    /**
     * Apple uses the ⌘ key while others use the Ctrl key for many keyboard shortcuts
     * and features like (⌘ or Ctrl)+click for opening a link in a new tab.
     * This modifier unifies the logic and is essentially an alias for `.meta` on mac,
     * and `.ctrl` for all other platforms.
     *
    * @summary Handle if metaKey (on mac) or ctrlKey (other platforms) is pressed
    *
    */
    αmod(): boolean;

    /**
    * Handle if middle button is pressed
    *
    */
    αmiddle(): boolean;

    /**
    * Handle if left/primary button is pressed
    *
    */
    αleft(): boolean;

    /**
    * Handle if right button is pressed
    *
    */
    αright(): boolean;
}

interface KeyboardEvent {
    /**
    * Handle if enter key is pressed
    *
    */
    αenter(): boolean;

    /**
    * Handle if left key is pressed
    *
    */
    αleft(): boolean;

    /**
    * Handle if right key is pressed
    *
    */
    αright(): boolean;

    /**
    * Handle if up key is pressed
    *
    */
    αup(): boolean;

    /**
    * Handle if down key is pressed
    *
    */
    αdown(): boolean;

    /**
    * Handle if tab key is pressed
    *
    */
    αtab(): boolean;

    /**
    * Handle if esc key is pressed
    *
    */
    αesc(): boolean;

    /**
    * Handle if space key is pressed
    *
    */
    αspace(): boolean;

    /**
    * Handle if del key is pressed
    *
    */
    αdel(): boolean;

    /**
    * Handle if keyCode == code
    * @detail (code)
    */
    αkey(code:number): boolean;
}

interface PointerEvent {
    /**
    * @summary Handle if the event was generated by a mouse device.
    */
    αmouse(): boolean;

    /**
    * @summary Handle if the event was generated by a pen or stylus device.
    */
    αpen(): boolean;

    /**
    * @summary Handle if the event was generated by a touch, such as a finger.
    */
    αtouch(): boolean;

    /**
     Only trigger if PointerEvent.isPrimary returns true
        If pointerType is mouse it will only return true for main mouse button.
    */
    αprimary(): boolean;


    /**
    * Only when pressure is at least amount (defaults to 0.5)
    * @detail (threshold=0.5)
    */
    αpressure(amount?:number): boolean;
}

interface DragEvent {

}

type ModifierElementTarget = Element | string;

declare namespace imba {

    /**
     * To make it easier and more fun to work with touches, Imba includes a custom `@touch` event that combines `@pointerdown` -> `@pointermove` -> `@pointerup` in one convenient handler, with modifiers for commonly needed functionality.
     * @custom
     */
    class Touch {

        /** The final X coordinate of the pointer (after modifiers) */
        x: number;

        /** The final Y coordinate of the pointer (after modifiers) */
        y: number;

        /** The horizontal movement of the pointer (after modifiers) */
        dx: number;

        /** The vertical movement of the pointer (after modifiers). */
        dy: number;

        target: Element;

        /** The X coordinate of the pointer in local (DOM content) coordinates. */
        get clientX(): number;

        /** The Y coordinate of the mouse pointer in local (DOM content) coordinates. */
        get clientY(): number;

        /** True if touch is still active */
        get activeΦ(): boolean;

        /** True if touch has ended */
        get endedΦ(): boolean;

        /** Returns true if the `control` key was down when the mouse event was fired. */
        get ctrlKey(): boolean;

        /** Returns true if the `alt` key was down when the mouse event was fired. */
        get altKey(): boolean;

        /** Returns true if the `shift` key was down when the mouse event was fired. */
        get shiftKey(): boolean;

        /** Returns true if the `shift` key was down when the mouse event was fired. */
        get metaKey(): boolean;

        /** Indicates the device type that caused the event (mouse, pen, touch, etc.) */
        get pointerType(): string;

        /**
         The identifier is unique, being different from the identifiers of all other active pointer events. Since the value may be randomly generated, it is not guaranteed to convey any particular meaning.

        @summary A unique identifier for the pointer causing the event.
        * */
        get pointerId(): number;

        /**
        * This guard will break the chain unless the touch has moved more than threshold. Once this threshold has been reached, all subsequent updates of touch will pass through. The element will also activate the `@move` pseudostate during touch - after threshold is reached.
        * #### Syntax
        ```imba
        <div @touch.moved(threshold=4px, dir='any')>
        ```
        * @summary Only when touch has moved more than threshold
        * @detail (threshold = 4px, dir = 'any')
        */
        αmoved(threshold?: Length, dir?: string): boolean;

        /**
        * Only when touch has moved left or right more than threshold
        * @detail (threshold = 4px)
        * @deprecated
        */
        αmovedΞx(threshold?: Length): boolean;

        /**
        * Only when touch has moved up or down more than threshold
        * @detail (threshold = 4px)
        * @deprecated
        */
        αmovedΞy(threshold?: Length): boolean;

        /**
        * Only when touch has moved up more than threshold
        * @detail (threshold = 4px)
        ** @deprecated
        */
        αmovedΞup(threshold?: Length): boolean;

        /**
        * Only when touch has moved down more than threshold
        * @detail (threshold = 4px)
        * @deprecated
        */
        αmovedΞdown(threshold?: Length): boolean;

        /**
        * Only when touch has moved left more than threshold
        * @detail (threshold = 4px)
        * @deprecated
        */
        αmovedΞleft(threshold?: Length): boolean;

        /**
        * Only when touch has moved right more than threshold
        * @detail (threshold = 4px)
        * @deprecated
        */
        αmovedΞright(threshold?: Length): boolean;

        /**
        * This guard will break the chain unless the touch has been held for a duration.
        * If the pointer moves more than 5px before the modifier activates, the handler will
        * essentially be cancelled.
        * #### Syntax
        ```imba
        <div @touch.hold(duration=250ms)>
        ```
        * @summary Only start handling after pressing and holding still
        * @detail (duration = 250ms)
        */
        αhold(threshold?: Length, dir?: string): boolean;

        /**
         * A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.
         *
         * #### Syntax
        ```imba
        <div @touch.sync(target, xprop='x', yprop='y')>
        ```
        * @summary Sync the x,y properties of touch to another object
        * @detail (data, xProp?, yProp?)
        */
        αsync(data: object, xName?: string | null, yName?: string | null): boolean;

        /**
         * Sets the x and y properties of object to the x and y properties of touch.
         *
         * @see https://imba.io/events/touch-events#modifiers-apply
         * @detail (data, xProp?, yProp?)
         */
        αapply(data: object, xName?: string | null, yName?: string | null): boolean;

        /**
         * A very common need for touches is to convert the coordinates of the touch to some other frame of reference. When dragging you might want to make x,y relative to the container. For a custom slider you might want to convert the coordinates from pixels to relative offset of the slider track. There are loads of other scenarios where you'd want to convert the coordinates to some arbitrary scale and offset. This can easily be achieved with fitting modifiers.
        * #### Syntax
        ```imba
        <div @touch.fit> # make x,y relative to the element
        <div @touch.fit(start,end,snap?)>
        <div @touch.fit(target)> # make x,y relative to a target element
        <div @touch.fit(target,start,end,snap?)>
        <div @touch.fit(target,[xstart,ystart],[xend,yend],snap?)>
        ```
        * @summary Convert the coordinates of the touch to some other frame of reference.
        * @detail (target?,snap?)
        */
        αfit(): void;
        αfit(start: Length, end: Length, snap?: number): void;
        αfit(target: ModifierElementTarget): void;
        αfit(target: ModifierElementTarget, snap?: number): void;
        αfit(target: ModifierElementTarget, snap?: number): void;
        αfit(target: ModifierElementTarget, start: Length, end: Length, snap?: number): void;

        /**
        * Just like @touch.fit but without clamping x,y to the bounds of the
        * target.
        * @detail (target?, ax?, ay?)
        */
        αreframe(): void;
        αreframe(start: Length, end: Length, snap?: number): void;
        αreframe(context: Element | string, snap?: number): void;
        αreframe(context: Element | string, start: Length, end: Length, snap?: number): void;

        /**
        * Allow pinning the touch to a certain point in an element, so that
        * all future x,y values are relative to this pinned point.
        * @detail (target?, ax?, ay?)
        */
        αpin(): void;
        αpin(target: ModifierElementTarget): void;
        αpin(anchorX: number, anchorY?: number): void;
        αpin(target: ModifierElementTarget, anchorX?: number, anchorY?: number): void;

        /**
        * Round the x,y coordinates with an optional accuracy
        * @detail (to = 1)
        */
        αround(nearest?: number): void;

        /**
         * Add an html class to target for at least 250ms
         * If the callback returns a promise, the class
         * will not be removed until said promise has resolved
         * @param name the class to add
         * @param target the element on which to add the class. Defaults to the element itself
         * @detail (name,target?)
         * */
        αflag(name: string, target?: FlagTarget): void;

        /**
         * Add an html class to target for at least 250ms
         * If the callback returns a promise, the class
         * will not be removed until said promise has resolved
         * @param target the element on which to add the class. Defaults to the element itself
         * @deprecated
         **/
        αflagΞname(target?: FlagTarget): void;

        /**
         Only trigger if PointerEvent.isPrimary returns true
         If pointerType is mouse it will only return true for main mouse button.
        */
        αprimary(): boolean;

        /**
         * Only trigger handler if event.target matches selector
         * @detail (selector)
         * */
        αsel(selector: string): boolean;

        /**
         Tells the browser that the default action should not be taken. The event will still continue to propagate up the tree. See Event.preventDefault()
        @see https://imba.io/events/event-modifiers#core-prevent
        */
        αprevent(): void;
        /**
         Stops the event from propagating up the tree. Event listeners for the same event on nodes further up the tree will not be triggered. See Event.stopPropagation()
        */
        αstop(): void;

        /**
         Prevents default action & stops event from bubbling.
        */
        αtrap(): void;

        /**
         * The `self` event modifier is a handy way of reacting to events only when they are clicked on the actual element you are interacting with and not, for example, a child element. This can be useful for things like modal wrappers when you only want to react when clicking directly.
         * @summary Only trigger handler if event.target is the element itself
         */
        αself(): boolean;

        /**
         * @summary Don't trigger imba.commit from this event handler
        */
        αsilent(): void;

        /**
         * @summary Suppress pointer events on all other elements
        */
         αlock(): void;

         /**
         * Only trigger condition is truthy
         * @detail (condition)
         * */
        αif(condition: unknown): boolean;

    }

    type IntersectRoot = Element | Document;

    type IntersectOptions = {
        rootMargin?: string;
        root?: IntersectRoot;
        thresholds?: number[];
    }

    /**
     [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. Imba adds a simplified abstraction on top of this via the custom `@intersect` event.

    #### Syntax

    ```imba
    # Will only trigger when intersection ratio increases
    <div \@intersect.in=handler>
    # Will only trigger when element is more than 50% visible
    <div \@intersect(0.5).in=handler>
    ```

    #### Parameters

    The `@intersect` events accepts several arguments. You can pass in an object with the same [root](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root), [rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin), and [threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/threshold)  properties supported by [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver).

    ```imba
    <div \@intersect=handler> # default options
    <div \@intersect(root: frame, rootMargin: '20px')=handler>
    <div \@intersect(threshold: [0,0.5,1])=handler>
    ```

    For convenience, imba will convert certain arguments into options. A single number between 0 and 1 will map to the [threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/threshold) option:
    ```imba
    # n 0-1 adds single threshold at n visibility
    <div \@intersect(0)=handler> # {threshold: 0}
    <div \@intersect(0.5)=handler> # {threshold: 0.5}
    <div \@intersect(1)=handler> # {threshold: 1.0}
    ```
    Any number above 1 will add n thresholds, spread evenly:
    ```imba
    <div \@intersect(2)=handler> # {threshold: [0,1]}
    <div \@intersect(3)=handler> # {threshold: [0,0.5,1]}
    <div \@intersect(5)=handler> # {threshold: [0,0.25,0.5,0.75,1]}
    # ... and so forth
    ```
    An element will map to the [root](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root) option:
    ```imba
    <div \@intersect(frame)=handler> # {root: frame}
    <div \@intersect(frame,3)=handler> # {root: frame, threshold: [0,0.5,1]}
    ```
    A string will map to the [rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) option:
    ```imba
    <div \@intersect("20px 10px")=handler> # {rootMargin: "20px 10px"}
    ```
    * @custom
    */
    class IntersectEvent extends Event {
        /**
        The `out` modifier stops the handler unless intersectionRatio has *increased*.

        #### Syntax
        ```imba
        # Will only trigger when intersection ratio increases
        <div \@intersect.in=handler>
        # Will only trigger when element is more than 50% visible
        <div \@intersect(0.5).in=handler>
        ```
        @summary Stop handling unless intersectionRatio has increased.
        */
        αin(): boolean;

        /**
         *
        The `out` modifier stops the handler unless intersectionRatio has *decreased*.

        #### Syntax
        ```imba
        # Will only trigger when element starts intersecting
        <div \@intersect.out=handler>
        # Will trigger whenever any part of the div is hidden
        <div \@intersect(1).out=handler>
        ```
        @summary Stop handling unless intersectionRatio has decreased.
        */
        αout(): boolean;

        /**
        The css modifier sets a css variable --ratio on the event target with the current ratio.
        @summary Set css variable `--ratio` to the intersectionRatio.
        */
        αcss(): void;

        /**
        * Will add a class to the DOM element when intersecting
        * @param name The class-name to add
        */
        αflag(name: string): void;

        /**
        * Configuring
        * @param root reference to the parent
        * @param thresholds 0-1 for a single threshold, 2+ for n slices

        */
        αoptions(root?: IntersectRoot, thresholds?: number): void;

        αoptions(thresholds?: number): void;
        αoptions(rootMargin: string, thresholds?: number): void;
        αoptions(rootMargin: string, thresholds?: number): void;
        αoptions(options: IntersectOptions): void;

        /**
        * The raw IntersectionObserverEntry
        *
        */
        entry: IntersectionObserverEntry;
        /**
        * Ratio of the intersectionRect to the boundingClientRect
        *
        */
        ratio: number;
        /**
        * Difference in ratio since previous event
        *
        */
        delta: number;
    }

    class HotkeyEvent extends Event {

        /**
         *
         * @param pattern string following pattern from mousetrap
         * @see https://craig.is/killing/mice
         */
        αoptions(pattern:string): void;

        /**
        * Also trigger when input,textarea or a contenteditable is focused
        * @deprecated Use `force` instead
        */
        αcapture(): void;

        /**
        * Trigger even if outside of the originating hotkey group
        */
        αglobal(): void;

        /**
        * Trigger only if KeyboardEvent originates from this element or a child.
        */
         αlocal(): void;

        /**
        * Allow subsequent hotkey handlers for the same combo
        * and don't automatically prevent default behaviour of originating
        * keyboard event
        */
        αpassive(): void;

        /**
        * Also trigger when input,textarea or a contenteditable is focused
        */
        αforce(): void;

        /**
        * Allow the handler to trigger multiple times while user
        * keeps pressing the key combination.
        */
         αrepeat(): void;

        /**
         * The KeyboardEvent responsible for this HotkeyEvent
         *
         */
        readonly originalEvent: KeyboardEvent;

        /**
         * The combo for the event
         *
         */
        readonly combo: string;
    }

    /**
     * The [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) interface reports changes to the dimensions of an Element's content or border box. It has [good browser support](https://caniuse.com/#feat=resizeobserver) and is very useful in a wide variety of usecases. ResizeObserver avoids infinite callback loops and cyclic dependencies that are often created when resizing via a callback function. It does this by only processing elements deeper in the DOM in subsequent frames.
     * @custom
     */
    class ResizeEvent extends UIEvent {
        /** Width of the resized element */
        readonly width: number;
        /** Height of the resized element */
        readonly height: number;

        /** contentRect from the ResizeObserverEntry */
        readonly rect: DOMRectReadOnly;
        /** the raw ResizeObserverEntry */
        readonly entry: ResizeObserverEntry;

        /**
        The css modifier sets css variables (or units) to the width/height
        of the resized element
        @summary Set css variables for width / height of resized element
        */
        αcss(wunit?:string, hunit?:string, selector?: FlagTarget): void;
    }

    class SelectionEvent extends Event {
        detail: {
            start: number;
            end: number;
        }
    }

    class MutateEvent extends Event {

        /**
        Include modifier to extend monitoring to the entire subtree of nodes rooted at target. All of the other properties are then extended to all of the nodes in the subtree instead of applying solely to the target node. The default value is false. Note that if a descendant of target is removed, changes in that descendant subtree will continue to be observed, until the notification about the removal itself has been delivered.
        *
        * @summary Include mutations for subtree of nodes
        */
        αsubtree(): void;

        /**
        Set to true to monitor the target node (and, if subtree is true, its descendants) for the addition of new child nodes or removal of existing child nodes. The default value is false.
        * @summary Include removal and addition of child nodes
        */
        αchildList(): void;

        /**
        Set to true to watch for changes to the value of attributes on the node or nodes being monitored. The default value is true if either of attributeFilter or attributeOldValue is specified, otherwise the default value is false.
        * @summary Include changes to attribute values
        */
        αattributes(): void;
    }
}

interface GlobalEventHandlersEventMap {
    "touch": imba.Touch;
    "intersect": imba.IntersectEvent;
    "selection": imba.SelectionEvent;
    "hotkey": imba.HotkeyEvent;
    "resize": imba.ResizeEvent;
    "mutate": imba.MutateEvent;
    "__unknown": CustomEvent;
}

interface HTMLElementEventMap {
    "resize": imba.ResizeEvent;
}

interface ImbaEvents {
    /**
    * The loading of a resource has been aborted.
    *
    */
    abort: Event;
    animationcancel: AnimationEvent;
    /**
    * A CSS animation has completed.
    *
    */
    animationend: AnimationEvent;
    /**
    * A CSS animation is repeated.
    *
    */
    animationiteration: AnimationEvent;
    /**
    * A CSS animation has started.
    *
    */
    animationstart: AnimationEvent;

    auxclick: MouseEvent;
    /**
    * An element has lost focus (does not bubble).
    *
    */
    blur: FocusEvent;

    cancel: Event;
    /**
    * The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content.
    *
    */
    canplay: Event;
    /**
    * The user agent can play the media up to its end without having to stop for further buffering of content.
    *
    */
    canplaythrough: Event;
    /**
    * The change event is fired for `<input>`, `<select>`, and `<textarea>` elements when a change to the element's value is committed by the user.
    *
    */
    change: Event;
    /**
    * A pointing device button has been pressed and released on an element.
    *
    */
    click: MouseEvent;
    close: Event;
    contextmenu: MouseEvent;
    cuechange: Event;
    dblclick: MouseEvent;

    drag: DragEvent;

    dragend: DragEvent;

    dragenter: DragEvent;

    dragleave: DragEvent;

    dragover: DragEvent;

    dragstart: DragEvent;

    /**
     * @summaryz Fires when an element or text selection is dropped on a valid drop target.
     */
    drop: DragEvent;
    durationchange: Event;
    emptied: Event;
    ended: Event;
    error: ErrorEvent;
    focus: FocusEvent;
    focusin: FocusEvent;
    focusout: FocusEvent;
    /**
     * @custom
     * @summary Fired when the supplied keycombo is pressed anywhere in the document.
     * @detail (combo)
     */
    hotkey: imba.HotkeyEvent;
    input: Event;
    invalid: Event;
    /**
     * @custom
     * @summary Fired when the element appears in the viewport (or another element).
     */
    intersect: imba.IntersectEvent;
    keydown: KeyboardEvent;
    keypress: KeyboardEvent;
    keyup: KeyboardEvent;
    load: Event;
    loadeddata: Event;
    loadedmetadata: Event;
    loadstart: Event;
    mousedown: MouseEvent;
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
    mousemove: MouseEvent;
    mouseout: MouseEvent;
    mouseover: MouseEvent;
    mouseup: MouseEvent;
    pause: Event;
    play: Event;
    playing: Event;

    /**
     * @summary A browser fires this event if it concludes the pointer will no longer be able to generate events (for example the related device is deactivated).
     */
    pointercancel: PointerEvent;
    /**
     * @summary Fired when a pointer becomes active buttons state.
     */
    pointerdown: PointerEvent;
    /**
     * @summary Fired when a pointer is moved into the hit test boundaries of an element or one of its descendants, including as a result of a pointerdown event from a device that does not support hover (see pointerdown).
     */
    pointerenter: PointerEvent;
    /**
     * @summary Fired when a pointer is moved out of the hit test boundaries of an element. For pen devices, this event is fired when the stylus leaves the hover range detectable by the digitizer.
     */
    pointerleave: PointerEvent;
    /**
     * @summary Fired when a pointer changes coordinates. This event is also used if the change in pointer state can not be reported by other events.
     */
    pointermove: PointerEvent;

    /**
     * @summary Fired for several reasons including: pointer is moved out of the hit test boundaries of an element; firing the pointerup event for a device that does not support hover (see pointerup); after firing the pointercancel event (see pointercancel); when a pen stylus leaves the hover range detectable by the digitizer.
     */
    pointerout: PointerEvent;

    /**
     * @summary Fired when a pointer is moved into an element's hit test boundaries.
     */
    pointerover: PointerEvent;
    /**
     * @summary Fired when a pointer is no longer active buttons state.
     */
    pointerup: PointerEvent;

    /**
     * @summary Fired when an element receives pointer capture.
     */
    gotpointercapture: PointerEvent;

    /**
     * @summary Fired after pointer capture is released for a pointer.
     */
    lostpointercapture: PointerEvent;

    progress: ProgressEvent;
    ratechange: Event;
    reset: Event;
    /**
     * @custom
     * @summary Fired when element is resized.
     */
    resize: imba.ResizeEvent;
    mutate: imba.MutateEvent;

    scroll: Event;
    securitypolicyviolation: SecurityPolicyViolationEvent;
    seeked: Event;
    seeking: Event;
    select: Event;
    selectionchange: Event;
    selectstart: Event;
    stalled: Event;
    submit: Event;
    suspend: Event;
    timeupdate: Event;
    toggle: Event;
    /**
     * @custom
     * @summary Normalized handler for pointerdown->move->up with powerful custom modifiers.
     */
    touch: imba.Touch;
    touchcancel: TouchEvent;
    touchend: TouchEvent;
    touchmove: TouchEvent;
    touchstart: TouchEvent;
    transitioncancel: TransitionEvent;
    transitionend: TransitionEvent;
    transitionrun: TransitionEvent;
    transitionstart: TransitionEvent;
    volumechange: Event;
    waiting: Event;
    wheel: WheelEvent;
    [event: string]: CustomEvent;
}