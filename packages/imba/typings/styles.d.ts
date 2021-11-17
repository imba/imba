declare namespace imbacss {

    interface _ {

    }

    interface Ψnumber {

    }

    interface Ψpercentage {

    }

    interface Ψlength {

    }



    interface ΨlineΞwidth {
        thin: 'thin'
        medium: 'medium'
        thick: 'thick'
    }

    interface ΨlineΞstyle {
        none: 'none'
        hidden: 'hidden'
        dotted: 'dotted'
        dashed: 'dashed'
        solid: 'solid'
        double: 'double'
        groove: 'groove'
        ridge: 'ridge'
        inset: 'inset'
        outset: 'outset'
    }

    interface Ψcolor {

    }

    interface Ψposition {
        center: 'center'
        top: 'top'
        left: 'left'
        right: 'right'
        bottom: 'bottom'
    }

    interface Ψstring {

    }

    interface Ψimage {

    }

    interface Ψrepeat {

    }

    interface Ψbox {

    }

    interface Ψfont {
        sans: 'Sans serif'
        mono: 'monospace'
        serif: 'serif'
    }

    interface Ψtime {

    }

    interface ΨeasingΞfunction {
        /**
         * @easing cubic-bezier(0.25, 0.1, 0.25, 1.0)
         */
        ease: ''
        /**
         * @easing cubic-bezier(0.42, 0.0, 1.0, 1.0)
         */
        easeΞin: ''
        /**
         * @easing cubic-bezier(0.0, 0.0, 0.58, 1.0)
         */
        easeΞout: ''
        /**
         * @easing cubic-bezier(0.42, 0.0, 0.58, 1.0)
         */
        easeΞinΞout: ''
        linear: ''
    }

    interface Ψproperty {

    }

    interface Ψidentifier {

    }

    interface Ψurl {

    }

    interface Ψinteger {

    }

    interface ΨunicodeΞrange {

    }

    interface ΨgeometryΞbox {

    }

    interface Ψshape {

    }

    interface Ψangle {

    }

    interface Ψglobals {
        inherit: 'inherit'
        initial: 'initial'
        unset: 'unset'
    }

    interface Ψradius {
        /** @detail 100% */ full: '9999px';
        /** @detail 1px */ xxs: '1px';
        /** @detail 2px */ xs: '2px';
        /** @detail 3px */ sm: '3px';
        /** @detail 4px */ md: '4px';
        /** @detail 6px */ lg: '6px';
        /** @detail 8px */ xl: '8px';
    }


    interface Ψspacing {

    }

    interface Ψdimension {

    }

    /**
     * @detail padding-(left+right)
     * @custom
     */
    interface px extends _ {
        set(x: Ψspacing): void;
        set(left: Ψspacing, right: Ψspacing): void;
    }

    /**
     * @detail padding-(top+bottom)
     * @custom
     */
    interface py extends _ {
        set(y: Ψspacing): void;
        set(top: Ψspacing, bottom: Ψspacing): void;
    }

    /**
     * @detail margin-(left+right)
     * @custom
     */
    interface mx extends _ {
        set(x: Ψspacing): void;
        set(left: Ψspacing, right: Ψspacing): void;
    }

    interface my extends _ {
        set(y: Ψspacing): void;
        set(top: Ψspacing, bottom: Ψspacing): void;
    }

    /** 
     * @detail width+height 
     * @custom
     * */
    interface size extends _ {
        set(y: Ψdimension): void;
    }

    /** 
     * @detail justify-(items+content)
     * @custom
     * */
    interface j extends _ {
        set(value: justifyΞcontent): void;
        set(value: justifyΞitems): void;
    }

    /**
     * @detail align-(items+content)
     * @custom
     * */
    interface a extends _ {
        set(value: alignΞitems): void;
        set(value: alignΞcontent): void;
    }

    /**
     * @proxy placeΞitems
    */
    interface jai extends _ {
        set(value: alignΞitems): void;
        set(value: justifyΞitems): void;
    }

    /**
     * @proxy placeΞcontent
     * */
    interface jac extends _ {
        set(value: alignΞcontent): void;
        set(value: justifyΞcontent): void;
    }

    /**
     * @proxy placeΞself
     */
    interface jas extends _ {
        set(value: alignΞself): void;
        set(value: justifyΞself): void;
    }
    /**
     * @detail place-(items+content)
     * @custom
     */
    interface ja extends _ {
        set(value: alignΞcontent): void;
        set(value: justifyΞcontent): void;
        set(value: alignΞitems): void;
        set(value: justifyΞitems): void
    }

    /** 
     * @detail border-top-(left+right)-radius
     * @custom
     * */
    interface rdt extends _ {
        set(val: Ψradius | Ψlength | Ψpercentage): void;
    }

    /** 
     * @detail border-(top+bottom)-left-radius
     * @custom
     * */
    interface rdl extends rdt {

    }

    /** 
     * @detail border-bottom-(left+right)-radius
     * @custom
     * */
    interface rdb extends rdt {

    }

    /** 
     * @detail border-(top+bottom)-right-radius
     * @custom
     * */
    interface rdr extends rdt {

    }

    /**
     * Shorthand property combines four of the transition properties into a single property.
     * @alias tween
    */
    interface transition extends _ {
        set(val: this | Ψtime | Ψproperty | ΨeasingΞfunction): void;
        set(props: this | Ψproperty, duration: Ψtime, timing?: ΨeasingΞfunction, arg3?: any): void;

        /** Every property that is able to undergo a transition will do so. */
        all: ''

        /** background-color, border-color, color, fill, stroke, opacity, box-shadow, transform */
        styles: ''

        /** width, height, left, top, right, bottom, margin, padding */
        sizes: ''

        /** background-color, border-color, color, fill, stroke */
        colors: ''

        /** No property will transition. */
        none: ''
    }

    /** @proxy transition */
    interface tween extends transition { }


    /** 
     * Shorthand for setting transform translateX() 
     * @detail transform: translateX(...)
     * @custom
     **/
    interface x extends _ {
        set(val: Ψnumber): void;
    }

    /** 
     * Shorthand for setting transform translateY()
     * @detail transform: translateY(...)
     * @custom
     * */
    interface y extends x {

    }

    /** 
     * Shorthand for setting transform translateZ()
     * @detail transform: translateZ(...)
     * @custom
     * */
    interface z extends x {

    }

    /** 
     * Shorthand for setting transform skewX()
     * @detail transform: skewX(...)
     * @custom
     * */
    interface skewΞx extends _ {
        set(val: Ψnumber): void;
    }
    /** 
     * Shorthand for setting transform skewY() 
     * @detail transform: skewY(...)
     * @custom
     * */
    interface skewΞy extends _ {
        set(val: Ψnumber): void;
    }
    /** 
     * Shorthand for setting transform scaleX()
     * @detail transform: scaleX(...)
     * @custom
     * */
    interface scaleΞx extends _ {
        set(val: Ψnumber): void;
    }
    /** 
     * Shorthand for setting transform scaleY() 
     * @detail transform: scaleY(...)
     * @custom
     * */
    interface scaleΞy extends _ {
        set(val: Ψnumber): void;
    }
    /** 
     * Shorthand for setting transform scale()
     * @detail transform: scale(...)
     * @custom
     *  */
    interface scale extends _ {
        set(val: Ψnumber): void;
    }
    /** 
     * Shorthand for setting transform rotate() 
     * @detail transform: rotate(...)
     * @custom
     * */
    interface rotate extends _ {
        set(val: Ψnumber): void;
    }

    /** 
     * Shorthand for setting transform skeq-y() 
     * @custom
    */
    interface ease extends _ {
        set(duration: Ψtime): void;
        set(timing: ΨeasingΞfunction): void;
        set(duration: Ψtime, timing: ΨeasingΞfunction): void;
    }
    /** Shorthand for setting transform scale-x() */
    interface easeΞtransform extends ease {
    }
    /** Shorthand for setting transform scale-x() */
    interface easeΞcolors extends ease {
    }

    /** Shorthand for setting transform scale-x() */
    interface easeΞopacity extends ease {
    }

    /** @proxy ease */
    interface e extends ease { }

    /** @proxy easeΞtransform */
    interface et extends easeΞtransform { }
    /** @proxy easeΞcolors */
    interface ec extends easeΞcolors { }
    /** @proxy easeΞopacity */
    interface eo extends easeΞopacity { }
    
    /** 
     * Set color alias
     * @custom
     * */
    interface hue extends _ {
        set(val: Ψhue): void;
    }
}