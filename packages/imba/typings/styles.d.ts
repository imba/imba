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
     * @alias ea
    */
    interface ease extends _ {
        set(duration: Ψtime): void;
        set(timing: ΨeasingΞfunction): void;
        set(duration: Ψtime, timing: ΨeasingΞfunction): void;
    }

    /** @proxy ease */ interface e extends ease { }
    /** @proxy ease */ interface ea extends ease { }

    /** 
     * Transition duration for all properties
     * @custom
     * @alias ead
    */
    interface easeΞallΞduration extends _ {
        set(duration: Ψtime): void;
    }

    /** 
     * Transition timing function for all properties
     * @custom
     * @alias eaf
    */
    interface easeΞallΞfunction extends _ {
        set(timing: ΨeasingΞfunction): void;
    }
    /** 
     * Transition delay for all properties
     * @custom
     * @alias eaw
    */
    interface easeΞallΞdelay extends _ {
        set(duration: Ψtime): void;
    }

    /** @proxy easeΞallΞduration */ interface ead extends easeΞallΞduration {}
    /** @proxy easeΞallΞfunction */ interface eaf extends easeΞallΞfunction {}
    /** @proxy easeΞallΞdelay */ interface eaw extends easeΞallΞdelay {}
    
    /** Easing colors (color,background-color,border-color,outline-color,fill,stroke,box-shadow) 
     * @alias ec
    */
    interface easeΞcolors extends ease {
    }

    /** @alias ecd */ interface easeΞcolorsΞduration extends easeΞallΞduration {}
    /** @alias ecf */ interface easeΞcolorsΞfunction extends easeΞallΞfunction {}
    /** @alias ecw */ interface easeΞcolorsΞdelay extends easeΞallΞdelay {}
    /** @proxy easeΞcolors */ interface ec extends easeΞcolors { }
    /** @proxy easeΞcolorsΞduration */ interface ecd extends easeΞcolorsΞduration {}
    /** @proxy easeΞcolorsΞfunction */ interface ecf extends easeΞcolorsΞfunction {}
    /** @proxy easeΞcolorsΞdelay */ interface ecw extends easeΞcolorsΞdelay {}

    /**
     * Easing opacity
     * @alias eo
    */
    interface easeΞopacity extends ease {
    }

    /** @alias eod */ interface easeΞopacityΞduration extends easeΞallΞduration {}
    /** @alias eof */ interface easeΞopacityΞfunction extends easeΞallΞfunction {}
    /** @alias eow */ interface easeΞopacityΞdelay extends easeΞallΞdelay {}
    /** @proxy easeΞopacity */ interface eo extends easeΞopacity { }
    /** @proxy easeΞopacityΞduration */ interface eod extends easeΞopacityΞduration {}
    /** @proxy easeΞopacityΞfunction */ interface eof extends easeΞopacityΞfunction {}
    /** @proxy easeΞopacityΞdelay */ interface eow extends easeΞopacityΞdelay {}


    /** Easing dimensions
     * top,left,right,bottom,width,height,max-width,max-height
     * padding,margin,border-width,stroke-width,transform 
     * @alias eb
     * */
    interface easeΞbox extends ease {
    }

    /** @alias ebd */ interface easeΞboxΞduration extends easeΞallΞduration {}
    /** @alias ebf */ interface easeΞboxΞfunction extends easeΞallΞfunction {}
    /** @alias ebw */ interface easeΞboxΞdelay extends easeΞallΞdelay {}
    /** @proxy easeΞbox */ interface eb extends easeΞcolors { }
    /** @proxy easeΞboxΞduration */ interface ebd extends easeΞboxΞduration {}
    /** @proxy easeΞboxΞfunction */ interface ebf extends easeΞboxΞfunction {}
    /** @proxy easeΞboxΞdelay */ interface ebw extends easeΞboxΞdelay {}



    /** Shorthand for setting transform easings 
     * @alias et
    */
    interface easeΞtransform extends ease {
    }
    
    /** @alias etd */ interface easeΞtransformΞduration extends easeΞallΞduration {}
    /** @alias etf */ interface easeΞtransformΞfunction extends easeΞallΞfunction {}
    /** @alias etw */ interface easeΞtransformΞdelay extends easeΞallΞdelay {}
    /** @proxy easeΞtransform */ interface et extends easeΞtransform { }
    /** @proxy easeΞtransformΞduration */ interface etd extends easeΞtransformΞduration {}
    /** @proxy easeΞtransformΞfunction */ interface etf extends easeΞtransformΞfunction {}
    /** @proxy easeΞtransformΞdelay */ interface etw extends easeΞtransformΞdelay {}

    
    /** 
     * Set color alias
     * @custom
     * */
    interface hue extends _ {
        set(val: Ψhue): void;
    }

    // Custom border properties
    /**
	 * Shorthand property for setting border width, style and color
	 * @alias bdx
     * @custom
	*/
	interface borderΞx extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;
	}

    /**
     * @alias bwx
     * @custom
     */
    interface borderΞxΞwidth extends _ {
        set(val: Ψlength | ΨlineΞwidth): void;
    }
    /**
     * @alias bcx
     * @custom
     */
    interface borderΞxΞcolor extends _ {
        set(val: Ψcolor): void;
    }
    /**
     * @alias bsx
     * @custom
     */
    interface borderΞxΞstyle extends _ {
        set(val: ΨlineΞstyle): void;
    }

	/** @proxy borderΞx */ interface bdx extends borderΞx { }
    /** @proxy borderΞxΞwidth */ interface bwx extends borderΞxΞwidth { }
    /** @proxy borderΞxΞcolor */ interface bcx extends borderΞxΞcolor { }
    /** @proxy borderΞxΞstyle */ interface bsx extends borderΞxΞstyle { }

    /**
	 * Shorthand property for setting border width, style and color
	 * @alias bdy
     * @custom
	*/
	interface borderΞy extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;
	}

	/** @proxy borderΞy */ interface bdy extends borderΞy { }

    /**
     * @alias bwy
     * @custom
     */
    interface borderΞyΞwidth extends _ {
        set(val: Ψlength | ΨlineΞwidth): void;
    }
    /**
     * @alias bcy
     * @custom
     */
    interface borderΞyΞcolor extends _ {
        set(val: Ψcolor): void;
    }
    /**
     * @alias bsy
     * @custom
     */
    interface borderΞyΞstyle extends _ {
        set(val: ΨlineΞstyle): void;
    }

	/** @proxy borderΞyΞwidth */ interface bwy extends borderΞyΞwidth { }
    /** @proxy borderΞyΞcolor */ interface bcy extends borderΞyΞcolor { }
    /** @proxy borderΞyΞstyle */ interface bsy extends borderΞyΞstyle { }



}