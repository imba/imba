declare namespace imbacss {
    /** Represents elements whose numeric position in a series of siblings is odd 1, 3, 5, etc 
* @detail :nth-child(odd)
*/
    interface αodd { name: 'nth-child', valueType: 'string', value: 'odd' };

    /** Represents elements whose numeric position in a series of siblings is even 2, 4, 6, etc 
     * @detail :nth-child(even)
    */
    interface αeven { name: 'nth-child', valueType: 'string', value: 'even' };

    /** represents the first element among a group of sibling elements
     * @detail :first-child
     */
    interface αfirst { name: 'first-child' }

    /** represents the last element among a group of sibling elements 
     * @detail :last-child
    */
    interface αlast { name: 'last-child' };

    /** represents an element without any siblings 
     * @detail :only-child
    */
    interface αonly { name: 'only-child' };

    /** Generally triggered when the user hovers over an element with the cursor (mouse pointer) */
    interface αhover { name: 'hover' };

    /** Element is being activated by the user. When using a mouse, "activation" typically starts when the user presses down the primary mouse button. */
    interface αactive { name: 'active' };

    interface αvisited { name: 'visited' };

    interface αlink { name: 'link' };

    interface αenabled { name: 'enabled' };

    interface αchecked { name: 'checked' };

    /** element has focus */
    interface αfocus { name: 'focus' };

    /** element OR descendant of element has focus */
    interface αfocin {};


    /** @detail (min-width: 480px) */
    interface αxs { media: '(min-width: 480px)' }
    /** @detail (min-width: 640px) */
    interface αsm { media: '(min-width: 640px)' }
    /** @detail (min-width: 768px) */
    interface αmd { media: '(min-width: 768px)' }
    /** @detail (min-width: 1024px) */
    interface αlg { media: '(min-width: 1024px)' }
    /** @detail (min-width: 1280px) */
    interface αxl { media: '(min-width: 1280px)' }

    /** @detail (max-width: 479px) */
    interface αltΞxs { media: '(max-width: 479px)' }
    /** @detail (max-width: 639px) */
    interface αltΞsm { media: '(max-width: 639px)' }
    /** @detail (max-width: 767px) */
    interface αltΞmd { media: '(max-width: 767px)' }
    /** @detail (max-width: 1023px) */
    interface αltΞlg { media: '(max-width: 1023px)' }
    /** @detail (max-width: 1279px) */
    interface αltΞxl { media: '(max-width: 1279px)' }

    // color modifiers

    /** Indicates that user has notified that they prefer an interface that has a dark theme. 
     * @detail (prefers-color-scheme: dark)
    */
    interface αdark { media: '(prefers-color-scheme: dark)' }

    /** Indicates that user has notified that they prefer an interface that has a light theme, or has not expressed an active preference. 
     * @detail (prefers-color-scheme: light)
    */
    interface αlight { media: '(prefers-color-scheme: light)' }
    
    /**
     * @custom
     */
    interface αtouch { flag: '_touch_' }
    
    /**
     * @custom
     */
    interface αsuspended { flag: '_suspended_' }

    /**
     * @custom
     */
    interface αmove { flag: '_move_' }
    
    /**
     * @custom
     */
    interface αhold { flag: '_hold_' }
    
    /**
     * @custom
     */
    interface αssr { flag: '_ssr_' }

    /** 
     * The viewport is in a landscape orientation, i.e., the width is greater than the height.
     * @detail (orientation: landscape)
     *  */
    interface αlandscape { media: '(orientation: landscape)' }

    /** 
     * The viewport is in a portrait orientation, i.e.,  the height is greater than or equal to the width.
     * @detail (orientation: portrait)
        */
    interface αportrait { media: '(orientation: portrait)' }

    /** Intended for paged material and documents viewed on a screen in print preview mode. 
     * @detail (media: print)
    */
    interface αprint { media: 'print' }

    /** Intended primarily for screens.
     * @detail (media: screen)
    */
    interface αscreen { media: 'screen' }

    /** Pseudo-element that is the first child of the selected element 
     * @detail ::before { ... }
     * @pseudoelement
    */
    interface αbefore { name: '::before' }

    /** Pseudo-element that is the last child of the selected element 
     * @pseudoelement
     * @detail ::after { ... }
    */
    interface αafter { name: '::after' }


    /** 
     * @see [Transitions](https://imba.io/css/transitions)
     * @detail Style when element is transitioning into the dom
    */
    interface αin { }

    /** 
     * @see [Transitions](https://imba.io/css/transitions)
     * @detail Style when element is transitioning out of the dom
    */
    interface αout { }

    /** 
     * @see [Transitions](https://imba.io/css/transitions)
     * @detail Style when element is removed
    */
    interface αoff { }
}