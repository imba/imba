/// <reference path="./styles.d.ts" />
declare namespace imbacss {
	/**
	 * Specifies the width of the content area, padding area or border area (depending on 'box-sizing') of certain boxes.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/width)
	 * 
	 * @alias w
	*/
	interface width extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** The width depends on the values of other properties. */
		auto: ''

		/** Use the fit-content inline size or fit-content block size, as appropriate to the writing mode. */
		fitΞcontent: ''

		/** Use the max-content inline size or max-content block size, as appropriate to the writing mode. */
		maxΞcontent: ''

		/** Use the min-content inline size or min-content block size, as appropriate to the writing mode. */
		minΞcontent: ''

	}

	/** @proxy width */
	interface w extends width { }
	/**
	 * Specifies the height of the content area, padding area or border area (depending on 'box-sizing') of certain boxes.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/height)
	 * 
	 * @alias h
	*/
	interface height extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** The height depends on the values of other properties. */
		auto: ''

		/** Use the fit-content inline size or fit-content block size, as appropriate to the writing mode. */
		fitΞcontent: ''

		/** Use the max-content inline size or max-content block size, as appropriate to the writing mode. */
		maxΞcontent: ''

		/** Use the min-content inline size or min-content block size, as appropriate to the writing mode. */
		minΞcontent: ''

	}

	/** @proxy height */
	interface h extends height { }
	/**
	 * In combination with 'float' and 'position', determines the type of box or boxes that are generated for an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
	 * 
	 * @alias d
	*/
	interface display extends _ {
		set(val: this): void;

		/** The element generates a block-level box */
		block: ''

		/** The element itself does not generate any boxes, but its children and pseudo-elements still generate boxes as normal. */
		contents: ''

		/** The element generates a principal flex container box and establishes a flex formatting context. */
		flex: ''

		/** Flex with flex-direction set to row */
		hflex: ''

		/** Flex with flex-direction set to column */
		vflex: ''

		/** The element generates a block container box, and lays out its contents using flow layout. */
		flowΞroot: ''

		/** The element generates a principal grid container box, and establishes a grid formatting context. */
		grid: ''

		/** Grid with grid-auto-flow set to column */
		hgrid: ''

		/** Grid with grid-auto-flow set to row */
		vgrid: ''

		/** The element generates an inline-level box. */
		inline: ''

		/** A block box, which itself is flowed as a single inline box, similar to a replaced element. The inside of an inline-block is formatted as a block box, and the box itself is formatted as an inline box. */
		inlineΞblock: ''

		/** Inline-level flex container. */
		inlineΞflex: ''

		/** Inline-level table wrapper box containing table box. */
		inlineΞtable: ''

		/** One or more block boxes and one marker box. */
		listΞitem: ''

		/** The element lays out its contents using flow layout (block-and-inline layout). Standardized as 'flex'. */
		ΞmozΞbox: ''

		ΞmozΞdeck: ''

		ΞmozΞgrid: ''

		ΞmozΞgridΞgroup: ''

		ΞmozΞgridΞline: ''

		ΞmozΞgroupbox: ''

		/** Inline-level flex container. Standardized as 'inline-flex' */
		ΞmozΞinlineΞbox: ''

		ΞmozΞinlineΞgrid: ''

		ΞmozΞinlineΞstack: ''

		ΞmozΞmarker: ''

		ΞmozΞpopup: ''

		ΞmozΞstack: ''

		/** The element lays out its contents using flow layout (block-and-inline layout). Standardized as 'flex'. */
		ΞmsΞflexbox: ''

		/** The element generates a principal grid container box, and establishes a grid formatting context. */
		ΞmsΞgrid: ''

		/** Inline-level flex container. Standardized as 'inline-flex' */
		ΞmsΞinlineΞflexbox: ''

		/** Inline-level grid container. */
		ΞmsΞinlineΞgrid: ''

		/** The element and its descendants generates no boxes. */
		none: ''

		/** The element generates a principal ruby container box, and establishes a ruby formatting context. */
		ruby: ''

		rubyΞbase: ''

		rubyΞbaseΞcontainer: ''

		rubyΞtext: ''

		rubyΞtextΞcontainer: ''

		/** The element generates a run-in box. Run-in elements act like inlines or blocks, depending on the surrounding elements. */
		runΞin: ''

		/** The element generates a principal table wrapper box containing an additionally-generated table box, and establishes a table formatting context. */
		table: ''

		tableΞcaption: ''

		tableΞcell: ''

		tableΞcolumn: ''

		tableΞcolumnΞgroup: ''

		tableΞfooterΞgroup: ''

		tableΞheaderΞgroup: ''

		tableΞrow: ''

		tableΞrowΞgroup: ''

		/** The element lays out its contents using flow layout (block-and-inline layout). Standardized as 'flex'. */
		ΞwebkitΞbox: ''

		/** The element lays out its contents using flow layout (block-and-inline layout). */
		ΞwebkitΞflex: ''

		/** Inline-level flex container. Standardized as 'inline-flex' */
		ΞwebkitΞinlineΞbox: ''

		/** Inline-level flex container. */
		ΞwebkitΞinlineΞflex: ''

	}

	/** @proxy display */
	interface d extends display { }
	/**
	 * Shorthand property to set values the thickness of the padding area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. The value may not be negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding)
	 * 
	 * @alias p
	*/
	interface padding extends _ {
		set(val: Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy padding */
	interface p extends padding { }
	/**
	 * The position CSS property sets how an element is positioned in a document. The top, right, bottom, and left properties determine the final location of positioned elements.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
	 * 
	 * @alias pos
	*/
	interface position extends _ {
		set(val: this): void;

		/** The box's position (and possibly size) is specified with the 'top', 'right', 'bottom', and 'left' properties. These properties specify offsets with respect to the box's 'containing block'. */
		absolute: ''

		/** The box's position is calculated according to the 'absolute' model, but in addition, the box is fixed with respect to some reference. As with the 'absolute' model, the box's margins do not collapse with any other margins. */
		fixed: ''

		/** The box's position is calculated according to the 'absolute' model. */
		ΞmsΞpage: ''

		/** The box's position is calculated according to the normal flow (this is called the position in normal flow). Then the box is offset relative to its normal position. */
		relative: ''

		/** The box is a normal box, laid out according to the normal flow. The 'top', 'right', 'bottom', and 'left' properties do not apply. */
		static: ''

		/** The box's position is calculated according to the normal flow. Then the box is offset relative to its flow root and containing block and in all cases, including table elements, does not affect the position of any following boxes. */
		sticky: ''

		/** The box's position is calculated according to the normal flow. Then the box is offset relative to its flow root and containing block and in all cases, including table elements, does not affect the position of any following boxes. */
		ΞwebkitΞsticky: ''

	}

	/** @proxy position */
	interface pos extends position { }
	/**
	 * Shorthand property for setting border width, style, and color.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border)
	 * 
	 * @alias bd
	*/
	interface border extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/** @proxy border */
	interface bd extends border { }
	/**
	 * Shorthand property to set values the thickness of the margin area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. Negative values for margin properties are allowed, but there may be implementation-specific limits.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)
	 * 
	 * @alias m
	*/
	interface margin extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		auto: ''

	}

	/** @proxy margin */
	interface m extends margin { }
	/**
	 * Set asset as inline background svg
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/svg)
	 * 
	*/
	interface svg extends _ {
		set(val: any): void;

	}

	/**
	 * Specifies how far an absolutely positioned box's top margin edge is offset below the top edge of the box's 'containing block'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/top)
	 * 
	 * @alias t
	*/
	interface top extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well */
		auto: ''

	}

	/** @proxy top */
	interface t extends top { }
	/**
	 * Specifies how far an absolutely positioned box's left margin edge is offset to the right of the left edge of the box's 'containing block'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/left)
	 * 
	 * @alias l
	*/
	interface left extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well */
		auto: ''

	}

	/** @proxy left */
	interface l extends left { }
	/**
	 * Shorthand property to set values the thickness of the margin area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. Negative values for margin properties are allowed, but there may be implementation-specific limits..
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top)
	 * 
	 * @alias mt
	*/
	interface marginΞtop extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/** @proxy marginΞtop */
	interface mt extends marginΞtop { }
	/**
	 * Sets the color of an element's text
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/color)
	 * 
	 * @alias c
	*/
	interface color extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy color */
	interface c extends color { }
	/**
	 * Indicates the desired height of glyphs from the font. For scalable fonts, the font-size is a scale factor applied to the EM unit of the font. (Note that certain glyphs may bleed outside their EM box.) For non-scalable fonts, the font-size is converted into absolute units and matched against the declared font-size of the font, using the same absolute coordinate space for both of the matched values.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size)
	 * 
	 * @alias fs
	*/
	interface fontΞsize extends _ {
		set(val: Ψfs | this | Ψlength | Ψpercentage): void;

		large: ''

		larger: ''

		medium: ''

		small: ''

		smaller: ''

		xΞlarge: ''

		xΞsmall: ''

		xxΞlarge: ''

		xxΞsmall: ''

	}

	/** @proxy fontΞsize */
	interface fs extends fontΞsize { }
	/**
	 * Sets the background color of an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color)
	 * 
	 * @alias bgc
	*/
	interface backgroundΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy backgroundΞcolor */
	interface bgc extends backgroundΞcolor { }
	/**
	 * Describes how inline contents of a block are horizontally aligned if the contents do not completely fill the line box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align)
	 * 
	 * @alias ta
	*/
	interface textΞalign extends _ {
		set(val: this | Ψstring): void;

		/** The inline contents are centered within the line box. */
		center: ''

		/** The inline contents are aligned to the end edge of the line box. */
		end: ''

		/** The text is justified according to the method specified by the 'text-justify' property. */
		justify: ''

		/** The inline contents are aligned to the left edge of the line box. In vertical text, 'left' aligns to the edge of the line box that would be the start edge for left-to-right text. */
		left: ''

		/** The inline contents are aligned to the right edge of the line box. In vertical text, 'right' aligns to the edge of the line box that would be the end edge for left-to-right text. */
		right: ''

		/** The inline contents are aligned to the start edge of the line box. */
		start: ''

	}

	/** @proxy textΞalign */
	interface ta extends textΞalign { }
	/**
	 * Opacity of an element's text, where 1 is opaque and 0 is entirely transparent.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity)
	 * 
	 * @alias o
	*/
	interface opacity extends _ {
		set(val: Ψnumber): void;

	}

	/** @proxy opacity */
	interface o extends opacity { }
	/**
	 * Shorthand property for setting most background properties at the same place in the style sheet.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background)
	 * 
	 * @alias bg
	*/
	interface background extends _ {
		set(val: this | Ψimage | Ψcolor | Ψposition | Ψlength | Ψrepeat | Ψpercentage | Ψbox, arg1: any, arg2: any, arg3: any): void;

		/** The background is fixed with regard to the viewport. In paged media where there is no viewport, a 'fixed' background is fixed with respect to the page box and therefore replicated on every page. */
		fixed: ''

		/** The background is fixed with regard to the element's contents: if the element has a scrolling mechanism, the background scrolls with the element's contents. */
		local: ''

		/** A value of 'none' counts as an image layer but draws nothing. */
		none: ''

		/** The background is fixed with regard to the element itself and does not scroll with its contents. (It is effectively attached to the element's border.) */
		scroll: ''

	}

	/** @proxy background */
	interface bg extends background { }
	/**
	 * Specifies weight of glyphs in the font, their degree of blackness or stroke thickness.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight)
	 * 
	 * @alias fw
	*/
	interface fontΞweight extends _ {
		set(val: this): void;

		/** Thin */
		100: ''

		/** Extra Light (Ultra Light) */
		200: ''

		/** Light */
		300: ''

		/** Normal */
		400: ''

		/** Medium */
		500: ''

		/** Semi Bold (Demi Bold) */
		600: ''

		/** Bold */
		700: ''

		/** Extra Bold (Ultra Bold) */
		800: ''

		/** Black (Heavy) */
		900: ''

		/** Same as 700 */
		bold: ''

		/** Specifies the weight of the face bolder than the inherited value. */
		bolder: ''

		/** Specifies the weight of the face lighter than the inherited value. */
		lighter: ''

		/** Same as 400 */
		normal: ''

	}

	/** @proxy fontΞweight */
	interface fw extends fontΞweight { }
	/**
	 * Shorthand for setting 'overflow-x' and 'overflow-y'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
	 * 
	 * @alias of
	*/
	interface overflow extends _ {
		set(val: this, arg1: any): void;

		/** The behavior of the 'auto' value is UA-dependent, but should cause a scrolling mechanism to be provided for overflowing boxes. */
		auto: ''

		/** Content is clipped and no scrolling mechanism should be provided to view the content outside the clipping region. */
		hidden: ''

		/** Same as the standardized 'clip', except doesn’t establish a block formatting context. */
		ΞmozΞhiddenΞunscrollable: ''

		/** Content is clipped and if the user agent uses a scrolling mechanism that is visible on the screen (such as a scroll bar or a panner), that mechanism should be displayed for a box whether or not any of its content is clipped. */
		scroll: ''

		/** Content is not clipped, i.e., it may be rendered outside the content box. */
		visible: ''

	}

	/** @proxy overflow */
	interface of extends overflow { }
	/**
	 * Specifies a prioritized list of font family names or generic family names. A user agent iterates through the list of family names until it matches an available font that contains a glyph for the character to be rendered.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family)
	 * 
	 * @alias ff
	*/
	interface fontΞfamily extends _ {
		set(val: this | Ψfont, arg1: any, arg2: any, arg3: any): void;

		cursive: ''

		fantasy: ''

		monospace: ''

		sansΞserif: ''

		serif: ''

	}

	/** @proxy fontΞfamily */
	interface ff extends fontΞfamily { }
	/**
	 * Specifies how a box should be floated. It may be set for any element, but only applies to elements that generate boxes that are not absolutely positioned.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/float)
	 * 
	*/
	interface float extends _ {
		set(val: this): void;

		/** A keyword indicating that the element must float on the end side of its containing block. That is the right side with ltr scripts, and the left side with rtl scripts. */
		inlineΞend: ''

		/** A keyword indicating that the element must float on the start side of its containing block. That is the left side with ltr scripts, and the right side with rtl scripts. */
		inlineΞstart: ''

		/** The element generates a block box that is floated to the left. Content flows on the right side of the box, starting at the top (subject to the 'clear' property). */
		left: ''

		/** The box is not floated. */
		none: ''

		/** Similar to 'left', except the box is floated to the right, and content flows on the left side of the box, starting at the top. */
		right: ''

	}

	/**
	 * Determines the block-progression dimension of the text content area of an inline box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)
	 * 
	 * @alias lh
	*/
	interface lineΞheight extends _ {
		set(val: this | Ψnumber | Ψlength | Ψpercentage): void;

		/** Tells user agents to set the computed value to a 'reasonable' value based on the font size of the element. */
		normal: ''

	}

	/** @proxy lineΞheight */
	interface lh extends lineΞheight { }
	/**
	 * Specifies the behavior of the 'width' and 'height' properties.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
	 * 
	*/
	interface boxΞsizing extends _ {
		set(val: this): void;

		/** The specified width and height (and respective min/max properties) on this element determine the border box of the element. */
		borderΞbox: ''

		/** Behavior of width and height as specified by CSS2.1. The specified width and height (and respective min/max properties) apply to the width and height respectively of the content box of the element. */
		contentΞbox: ''

	}

	/**
	 * Decorations applied to font used for an element's text.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
	 * 
	 * @alias td
	*/
	interface textΞdecoration extends _ {
		set(val: this | Ψcolor): void;

		/** Produces a dashed line style. */
		dashed: ''

		/** Produces a dotted line. */
		dotted: ''

		/** Produces a double line. */
		double: ''

		/** Each line of text has a line through the middle. */
		lineΞthrough: ''

		/** Produces no line. */
		none: ''

		/** Each line of text has a line above it. */
		overline: ''

		/** Produces a solid line. */
		solid: ''

		/** Each line of text is underlined. */
		underline: ''

		/** Produces a wavy line. */
		wavy: ''

	}

	/** @proxy textΞdecoration */
	interface td extends textΞdecoration { }
	/**
	 * For a positioned box, the 'z-index' property specifies the stack level of the box in the current stacking context and whether the box establishes a local stacking context.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index)
	 * 
	 * @alias zi
	*/
	interface zΞindex extends _ {
		set(val: this | Ψinteger): void;

		/** The stack level of the generated box in the current stacking context is 0. The box does not establish a new stacking context unless it is the root element. */
		auto: ''

	}

	/** @proxy zΞindex */
	interface zi extends zΞindex { }
	/**
	 * Affects the vertical positioning of the inline boxes generated by an inline-level element inside a line box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align)
	 * 
	 * @alias va
	*/
	interface verticalΞalign extends _ {
		set(val: this | Ψpercentage | Ψlength): void;

		/** Align the dominant baseline of the parent box with the equivalent, or heuristically reconstructed, baseline of the element inline box. */
		auto: ''

		/** Align the 'alphabetic' baseline of the element with the 'alphabetic' baseline of the parent element. */
		baseline: ''

		/** Align the after edge of the extended inline box with the after-edge of the line box. */
		bottom: ''

		/** Align the 'middle' baseline of the inline element with the middle baseline of the parent. */
		middle: ''

		/** Lower the baseline of the box to the proper position for subscripts of the parent's box. (This value has no effect on the font size of the element's text.) */
		sub: ''

		/** Raise the baseline of the box to the proper position for superscripts of the parent's box. (This value has no effect on the font size of the element's text.) */
		super: ''

		/** Align the bottom of the box with the after-edge of the parent element's font. */
		textΞbottom: ''

		/** Align the top of the box with the before-edge of the parent element's font. */
		textΞtop: ''

		/** Align the before edge of the extended inline box with the before-edge of the line box. */
		top: ''

		ΞwebkitΞbaselineΞmiddle: ''

	}

	/** @proxy verticalΞalign */
	interface va extends verticalΞalign { }
	/**
	 * Allows control over cursor appearance in an element
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)
	 * 
	*/
	interface cursor extends _ {
		set(val: this | Ψurl | Ψnumber): void;

		/** Indicates an alias of/shortcut to something is to be created. Often rendered as an arrow with a small curved arrow next to it. */
		alias: ''

		/** Indicates that the something can be scrolled in any direction. Often rendered as arrows pointing up, down, left, and right with a dot in the middle. */
		allΞscroll: ''

		/** The UA determines the cursor to display based on the current context. */
		auto: ''

		/** Indicates that a cell or set of cells may be selected. Often rendered as a thick plus-sign with a dot in the middle. */
		cell: ''

		/** Indicates that the item/column can be resized horizontally. Often rendered as arrows pointing left and right with a vertical bar separating them. */
		colΞresize: ''

		/** A context menu is available for the object under the cursor. Often rendered as an arrow with a small menu-like graphic next to it. */
		contextΞmenu: ''

		/** Indicates something is to be copied. Often rendered as an arrow with a small plus sign next to it. */
		copy: ''

		/** A simple crosshair (e.g., short line segments resembling a '+' sign). Often used to indicate a two dimensional bitmap selection mode. */
		crosshair: ''

		/** The platform-dependent default cursor. Often rendered as an arrow. */
		default: ''

		/** Indicates that east edge is to be moved. */
		eΞresize: ''

		/** Indicates a bidirectional east-west resize cursor. */
		ewΞresize: ''

		/** Indicates that something can be grabbed. */
		grab: ''

		/** Indicates that something is being grabbed. */
		grabbing: ''

		/** Help is available for the object under the cursor. Often rendered as a question mark or a balloon. */
		help: ''

		/** Indicates something is to be moved. */
		move: ''

		/** Indicates that something can be grabbed. */
		ΞmozΞgrab: ''

		/** Indicates that something is being grabbed. */
		ΞmozΞgrabbing: ''

		/** Indicates that something can be zoomed (magnified) in. */
		ΞmozΞzoomΞin: ''

		/** Indicates that something can be zoomed (magnified) out. */
		ΞmozΞzoomΞout: ''

		/** Indicates that movement starts from north-east corner. */
		neΞresize: ''

		/** Indicates a bidirectional north-east/south-west cursor. */
		neswΞresize: ''

		/** Indicates that the dragged item cannot be dropped at the current cursor location. Often rendered as a hand or pointer with a small circle with a line through it. */
		noΞdrop: ''

		/** No cursor is rendered for the element. */
		none: ''

		/** Indicates that the requested action will not be carried out. Often rendered as a circle with a line through it. */
		notΞallowed: ''

		/** Indicates that north edge is to be moved. */
		nΞresize: ''

		/** Indicates a bidirectional north-south cursor. */
		nsΞresize: ''

		/** Indicates that movement starts from north-west corner. */
		nwΞresize: ''

		/** Indicates a bidirectional north-west/south-east cursor. */
		nwseΞresize: ''

		/** The cursor is a pointer that indicates a link. */
		pointer: ''

		/** A progress indicator. The program is performing some processing, but is different from 'wait' in that the user may still interact with the program. Often rendered as a spinning beach ball, or an arrow with a watch or hourglass. */
		progress: ''

		/** Indicates that the item/row can be resized vertically. Often rendered as arrows pointing up and down with a horizontal bar separating them. */
		rowΞresize: ''

		/** Indicates that movement starts from south-east corner. */
		seΞresize: ''

		/** Indicates that south edge is to be moved. */
		sΞresize: ''

		/** Indicates that movement starts from south-west corner. */
		swΞresize: ''

		/** Indicates text that may be selected. Often rendered as a vertical I-beam. */
		text: ''

		/** Indicates vertical-text that may be selected. Often rendered as a horizontal I-beam. */
		verticalΞtext: ''

		/** Indicates that the program is busy and the user should wait. Often rendered as a watch or hourglass. */
		wait: ''

		/** Indicates that something can be grabbed. */
		ΞwebkitΞgrab: ''

		/** Indicates that something is being grabbed. */
		ΞwebkitΞgrabbing: ''

		/** Indicates that something can be zoomed (magnified) in. */
		ΞwebkitΞzoomΞin: ''

		/** Indicates that something can be zoomed (magnified) out. */
		ΞwebkitΞzoomΞout: ''

		/** Indicates that west edge is to be moved. */
		wΞresize: ''

		/** Indicates that something can be zoomed (magnified) in. */
		zoomΞin: ''

		/** Indicates that something can be zoomed (magnified) out. */
		zoomΞout: ''

	}

	/**
	 * Shorthand property to set values the thickness of the margin area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. Negative values for margin properties are allowed, but there may be implementation-specific limits..
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left)
	 * 
	 * @alias ml
	*/
	interface marginΞleft extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/** @proxy marginΞleft */
	interface ml extends marginΞleft { }
	/**
	 * Defines the radii of the outer border edge.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius)
	 * 
	 * @alias rd
	*/
	interface borderΞradius extends _ {
		set(val: Ψradius | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy borderΞradius */
	interface rd extends borderΞradius { }
	/**
	 * Shorthand property to set values the thickness of the margin area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. Negative values for margin properties are allowed, but there may be implementation-specific limits..
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom)
	 * 
	 * @alias mb
	*/
	interface marginΞbottom extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/** @proxy marginΞbottom */
	interface mb extends marginΞbottom { }
	/**
	 * Shorthand property to set values the thickness of the margin area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. Negative values for margin properties are allowed, but there may be implementation-specific limits..
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right)
	 * 
	 * @alias mr
	*/
	interface marginΞright extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/** @proxy marginΞright */
	interface mr extends marginΞright { }
	/**
	 * Specifies how far an absolutely positioned box's right margin edge is offset to the left of the right edge of the box's 'containing block'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/right)
	 * 
	 * @alias r
	*/
	interface right extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well */
		auto: ''

	}

	/** @proxy right */
	interface r extends right { }
	/**
	 * Shorthand property to set values the thickness of the padding area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. The value may not be negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-left)
	 * 
	 * @alias pl
	*/
	interface paddingΞleft extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/** @proxy paddingΞleft */
	interface pl extends paddingΞleft { }
	/**
	 * Shorthand property to set values the thickness of the padding area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. The value may not be negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-top)
	 * 
	 * @alias pt
	*/
	interface paddingΞtop extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/** @proxy paddingΞtop */
	interface pt extends paddingΞtop { }
	/**
	 * Allows authors to constrain content width to a certain range.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/max-width)
	 * 
	*/
	interface maxΞwidth extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** No limit on the width of the box. */
		none: ''

		/** Use the fit-content inline size or fit-content block size, as appropriate to the writing mode. */
		fitΞcontent: ''

		/** Use the max-content inline size or max-content block size, as appropriate to the writing mode. */
		maxΞcontent: ''

		/** Use the min-content inline size or min-content block size, as appropriate to the writing mode. */
		minΞcontent: ''

	}

	/**
	 * Specifies how far an absolutely positioned box's bottom margin edge is offset above the bottom edge of the box's 'containing block'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/bottom)
	 * 
	 * @alias b
	*/
	interface bottom extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well */
		auto: ''

	}

	/** @proxy bottom */
	interface b extends bottom { }
	/**
	 * Determines which page-based occurrence of a given element is applied to a counter or string value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/content)
	 * 
	*/
	interface content extends _ {
		set(val: this | Ψstring | Ψurl): void;

		/** The attr(n) function returns as a string the value of attribute n for the subject of the selector. */
		attr(): ''

		/** Counters are denoted by identifiers (see the 'counter-increment' and 'counter-reset' properties). */
		counter(name): ''

		/** The (pseudo-)element is replaced in its entirety by the resource referenced by its 'icon' property, and treated as a replaced element. */
		icon: ''

		/** On elements, this inhibits the children of the element from being rendered as children of this element, as if the element was empty. On pseudo-elements it causes the pseudo-element to have no content. */
		none: ''

		/** See http://www.w3.org/TR/css3-content/#content for computation rules. */
		normal: ''

		url(): ''

	}

	/**
	 * Attaches one or more drop-shadows to the box. The property is a comma-separated list of shadows, each specified by 2-4 length values, an optional color, and an optional 'inset' keyword. Omitted lengths are 0; omitted colors are a user agent chosen color.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
	 * 
	 * @alias shadow
	*/
	interface boxΞshadow extends _ {
		set(val: Ψshadow | this | Ψlength | Ψcolor): void;

		/** Changes the drop shadow from an outer shadow (one that shadows the box onto the canvas, as if it were lifted above the canvas) to an inner shadow (one that shadows the canvas onto the box, as if the box were cut out of the canvas and shifted behind it). */
		inset: ''

		/** No shadow. */
		none: ''

	}

	/** @proxy boxΞshadow */
	interface shadow extends boxΞshadow { }
	/**
	 * Sets the background image(s) of an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-image)
	 * 
	 * @alias bgi
	*/
	interface backgroundΞimage extends _ {
		set(val: this | Ψimage, arg1: any, arg2: any, arg3: any): void;

		/** Counts as an image layer but draws nothing. */
		none: ''

	}

	/** @proxy backgroundΞimage */
	interface bgi extends backgroundΞimage { }
	/**
	 * Shorthand property to set values the thickness of the padding area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. The value may not be negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-right)
	 * 
	 * @alias pr
	*/
	interface paddingΞright extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/** @proxy paddingΞright */
	interface pr extends paddingΞright { }
	/**
	 * Shorthand property for the 'white-space-collapsing' and 'text-wrap' properties.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
	 * 
	 * @alias ws
	*/
	interface whiteΞspace extends _ {
		set(val: this): void;

		/** Sets 'white-space-collapsing' to 'collapse' and 'text-wrap' to 'normal'. */
		normal: ''

		/** Sets 'white-space-collapsing' to 'collapse' and 'text-wrap' to 'none'. */
		nowrap: ''

		/** Sets 'white-space-collapsing' to 'preserve' and 'text-wrap' to 'none'. */
		pre: ''

		/** Sets 'white-space-collapsing' to 'preserve-breaks' and 'text-wrap' to 'normal'. */
		preΞline: ''

		/** Sets 'white-space-collapsing' to 'preserve' and 'text-wrap' to 'normal'. */
		preΞwrap: ''

	}

	/** @proxy whiteΞspace */
	interface ws extends whiteΞspace { }
	/**
	 * Shorthand property to set values the thickness of the padding area. If left is omitted, it is the same as right. If bottom is omitted it is the same as top, if right is omitted it is the same as top. The value may not be negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom)
	 * 
	 * @alias pb
	*/
	interface paddingΞbottom extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/** @proxy paddingΞbottom */
	interface pb extends paddingΞbottom { }
	/**
	 * Allows authors to constrain content height to a certain range.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/min-height)
	 * 
	*/
	interface minΞheight extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

		/** Use the fit-content inline size or fit-content block size, as appropriate to the writing mode. */
		fitΞcontent: ''

		/** Use the max-content inline size or max-content block size, as appropriate to the writing mode. */
		maxΞcontent: ''

		/** Use the min-content inline size or min-content block size, as appropriate to the writing mode. */
		minΞcontent: ''

	}

	/**
	 * A two-dimensional transformation is applied to an element through the 'transform' property. This property contains a list of transform functions similar to those allowed by SVG.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
	 * 
	*/
	interface transform extends _ {
		set(val: this): void;

		/** Specifies a 2D transformation in the form of a transformation matrix of six values. matrix(a,b,c,d,e,f) is equivalent to applying the transformation matrix [a b c d e f] */
		matrix(): ''

		/** Specifies a 3D transformation as a 4x4 homogeneous matrix of 16 values in column-major order. */
		matrix3d(): ''

		none: ''

		/** Specifies a perspective projection matrix. */
		perspective(): ''

		/** Specifies a 2D rotation by the angle specified in the parameter about the origin of the element, as defined by the transform-origin property. */
		rotate(): ''

		/** Specifies a clockwise 3D rotation by the angle specified in last parameter about the [x,y,z] direction vector described by the first 3 parameters. */
		rotate3d(): ''

		/** Specifies a 2D scale operation by the [sx,sy] scaling vector described by the 2 parameters. If the second parameter is not provided, it is takes a value equal to the first. */
		scale(): ''

		/** Specifies a 3D scale operation by the [sx,sy,sz] scaling vector described by the 3 parameters. */
		scale3d(): ''

		/** Specifies a scale operation using the [sx,1] scaling vector, where sx is given as the parameter. */
		scaleX(): ''

		/** Specifies a scale operation using the [sy,1] scaling vector, where sy is given as the parameter. */
		scaleY(): ''

		/** Specifies a scale operation using the [1,1,sz] scaling vector, where sz is given as the parameter. */
		scaleZ(): ''

		/** Specifies a skew transformation along the X and Y axes. The first angle parameter specifies the skew on the X axis. The second angle parameter specifies the skew on the Y axis. If the second parameter is not given then a value of 0 is used for the Y angle (ie: no skew on the Y axis). */
		skew(): ''

		/** Specifies a skew transformation along the X axis by the given angle. */
		skewX(): ''

		/** Specifies a skew transformation along the Y axis by the given angle. */
		skewY(): ''

		/** Specifies a 2D translation by the vector [tx, ty], where tx is the first translation-value parameter and ty is the optional second translation-value parameter. */
		translate(): ''

		/** Specifies a 3D translation by the vector [tx,ty,tz], with tx, ty and tz being the first, second and third translation-value parameters respectively. */
		translate3d(): ''

		/** Specifies a translation by the given amount in the X direction. */
		translateX(): ''

		/** Specifies a translation by the given amount in the Y direction. */
		translateY(): ''

		/** Specifies a translation by the given amount in the Z direction. Note that percentage values are not allowed in the translateZ translation-value, and if present are evaluated as 0. */
		translateZ(): ''

	}

	/**
	 * Shorthand property for setting border width, style and color.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom)
	 * 
	 * @alias bdb
	*/
	interface borderΞbottom extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/** @proxy borderΞbottom */
	interface bdb extends borderΞbottom { }
	/**
	 * Specifies whether the boxes generated by an element are rendered. Invisible boxes still affect layout (set the ‘display’ property to ‘none’ to suppress box generation altogether).
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/visibility)
	 * 
	*/
	interface visibility extends _ {
		set(val: this): void;

		/** Table-specific. If used on elements other than rows, row groups, columns, or column groups, 'collapse' has the same meaning as 'hidden'. */
		collapse: ''

		/** The generated box is invisible (fully transparent, nothing is drawn), but still affects layout. */
		hidden: ''

		/** The generated box is visible. */
		visible: ''

	}

	/**
	 * Specifies the initial position of the background image(s) (after any resizing) within their corresponding background positioning area.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position)
	 * 
	 * @alias bgp
	*/
	interface backgroundΞposition extends _ {
		set(val: Ψposition | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy backgroundΞposition */
	interface bgp extends backgroundΞposition { }
	/**
	 * Shorthand property for setting border width, style and color
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top)
	 * 
	 * @alias bdt
	*/
	interface borderΞtop extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/** @proxy borderΞtop */
	interface bdt extends borderΞtop { }
	/**
	 * Allows authors to constrain content width to a certain range.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width)
	 * 
	*/
	interface minΞwidth extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

		/** Use the fit-content inline size or fit-content block size, as appropriate to the writing mode. */
		fitΞcontent: ''

		/** Use the max-content inline size or max-content block size, as appropriate to the writing mode. */
		maxΞcontent: ''

		/** Use the min-content inline size or min-content block size, as appropriate to the writing mode. */
		minΞcontent: ''

	}

	/**
	 * Shorthand property for 'outline-style', 'outline-width', and 'outline-color'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/outline)
	 * 
	*/
	interface outline extends _ {
		set(val: this | Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

		/** Permits the user agent to render a custom outline style, typically the default platform style. */
		auto: ''

		/** Performs a color inversion on the pixels on the screen. */
		invert: ''

	}

	/**
	 * The color of the border around all four edges of an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-color)
	 * 
	 * @alias bc
	*/
	interface borderΞcolor extends _ {
		set(val: Ψcolor, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy borderΞcolor */
	interface bc extends borderΞcolor { }
	/**
	 * Specifies how background images are tiled after they have been sized and positioned.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat)
	 * 
	 * @alias bgr
	*/
	interface backgroundΞrepeat extends _ {
		set(val: Ψrepeat, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy backgroundΞrepeat */
	interface bgr extends backgroundΞrepeat { }
	/**
	 * Controls capitalization effects of an element’s text.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform)
	 * 
	 * @alias tt
	*/
	interface textΞtransform extends _ {
		set(val: this): void;

		/** Puts the first typographic letter unit of each word in titlecase. */
		capitalize: ''

		/** Puts all letters in lowercase. */
		lowercase: ''

		/** No effects. */
		none: ''

		/** Puts all letters in uppercase. */
		uppercase: ''

	}

	/** @proxy textΞtransform */
	interface tt extends textΞtransform { }
	/**
	 * Specifies the size of the background images.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size)
	 * 
	 * @alias bgs
	*/
	interface backgroundΞsize extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		/** Resolved by using the image’s intrinsic ratio and the size of the other dimension, or failing that, using the image’s intrinsic size, or failing that, treating it as 100%. */
		auto: ''

		/** Scale the image, while preserving its intrinsic aspect ratio (if any), to the largest size such that both its width and its height can fit inside the background positioning area. */
		contain: ''

		/** Scale the image, while preserving its intrinsic aspect ratio (if any), to the smallest size such that both its width and its height can completely cover the background positioning area. */
		cover: ''

	}

	/** @proxy backgroundΞsize */
	interface bgs extends backgroundΞsize { }
	/**
	 * Indicates which sides of an element's box(es) may not be adjacent to an earlier floating box. The 'clear' property does not consider floats inside the element itself or in other block formatting contexts.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/clear)
	 * 
	*/
	interface clear extends _ {
		set(val: this): void;

		/** The clearance of the generated box is set to the amount necessary to place the top border edge below the bottom outer edge of any right-floating and left-floating boxes that resulted from elements earlier in the source document. */
		both: ''

		/** The clearance of the generated box is set to the amount necessary to place the top border edge below the bottom outer edge of any left-floating boxes that resulted from elements earlier in the source document. */
		left: ''

		/** No constraint on the box's position with respect to floats. */
		none: ''

		/** The clearance of the generated box is set to the amount necessary to place the top border edge below the bottom outer edge of any right-floating boxes that resulted from elements earlier in the source document. */
		right: ''

	}

	/**
	 * Allows authors to constrain content height to a certain range.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/max-height)
	 * 
	*/
	interface maxΞheight extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** No limit on the height of the box. */
		none: ''

		/** Use the fit-content inline size or fit-content block size, as appropriate to the writing mode. */
		fitΞcontent: ''

		/** Use the max-content inline size or max-content block size, as appropriate to the writing mode. */
		maxΞcontent: ''

		/** Use the min-content inline size or min-content block size, as appropriate to the writing mode. */
		minΞcontent: ''

	}

	/**
	 * Shorthand for setting 'list-style-type', 'list-style-position' and 'list-style-image'
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style)
	 * 
	*/
	interface listΞstyle extends _ {
		set(val: this | Ψimage | Ψurl): void;

		armenian: ''

		/** A hollow circle. */
		circle: ''

		decimal: ''

		decimalΞleadingΞzero: ''

		/** A filled circle. */
		disc: ''

		georgian: ''

		/** The marker box is outside the principal block box, as described in the section on the ::marker pseudo-element below. */
		inside: ''

		lowerΞalpha: ''

		lowerΞgreek: ''

		lowerΞlatin: ''

		lowerΞroman: ''

		none: ''

		/** The ::marker pseudo-element is an inline element placed immediately before all ::before pseudo-elements in the principal block box, after which the element's content flows. */
		outside: ''

		/** A filled square. */
		square: ''

		/** Allows a counter style to be defined inline. */
		symbols(): ''

		upperΞalpha: ''

		upperΞlatin: ''

		upperΞroman: ''

		url(): ''

	}

	/**
	 * Allows italic or oblique faces to be selected. Italic forms are generally cursive in nature while oblique faces are typically sloped versions of the regular face.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style)
	 * 
	*/
	interface fontΞstyle extends _ {
		set(val: this): void;

		/** Selects a font that is labeled as an 'italic' face, or an 'oblique' face if one is not */
		italic: ''

		/** Selects a face that is classified as 'normal'. */
		normal: ''

		/** Selects a font that is labeled as an 'oblique' face, or an 'italic' face if one is not. */
		oblique: ''

	}

	/**
	 * Shorthand property for setting 'font-style', 'font-variant', 'font-weight', 'font-size', 'line-height', and 'font-family', at the same place in the style sheet. The syntax of this property is based on a traditional typographical shorthand notation to set multiple properties related to fonts.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font)
	 * 
	*/
	interface font extends _ {
		set(val: this | Ψfont): void;

		/** Thin */
		100: ''

		/** Extra Light (Ultra Light) */
		200: ''

		/** Light */
		300: ''

		/** Normal */
		400: ''

		/** Medium */
		500: ''

		/** Semi Bold (Demi Bold) */
		600: ''

		/** Bold */
		700: ''

		/** Extra Bold (Ultra Bold) */
		800: ''

		/** Black (Heavy) */
		900: ''

		/** Same as 700 */
		bold: ''

		/** Specifies the weight of the face bolder than the inherited value. */
		bolder: ''

		/** The font used for captioned controls (e.g., buttons, drop-downs, etc.). */
		caption: ''

		/** The font used to label icons. */
		icon: ''

		/** Selects a font that is labeled 'italic', or, if that is not available, one labeled 'oblique'. */
		italic: ''

		large: ''

		larger: ''

		/** Specifies the weight of the face lighter than the inherited value. */
		lighter: ''

		medium: ''

		/** The font used in menus (e.g., dropdown menus and menu lists). */
		menu: ''

		/** The font used in dialog boxes. */
		messageΞbox: ''

		/** Specifies a face that is not labeled as a small-caps font. */
		normal: ''

		/** Selects a font that is labeled 'oblique'. */
		oblique: ''

		small: ''

		/** Specifies a font that is labeled as a small-caps font. If a genuine small-caps font is not available, user agents should simulate a small-caps font. */
		smallΞcaps: ''

		/** The font used for labeling small controls. */
		smallΞcaption: ''

		smaller: ''

		/** The font used in window status bars. */
		statusΞbar: ''

		xΞlarge: ''

		xΞsmall: ''

		xxΞlarge: ''

		xxΞsmall: ''

	}

	/**
	 * Shorthand property for setting border width, style and color
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left)
	 * 
	 * @alias bdl
	*/
	interface borderΞleft extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/** @proxy borderΞleft */
	interface bdl extends borderΞleft { }
	/**
	 * Shorthand property for setting border width, style and color
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right)
	 * 
	 * @alias bdr
	*/
	interface borderΞright extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/** @proxy borderΞright */
	interface bdr extends borderΞright { }
	/**
	 * Text can overflow for example when it is prevented from wrapping.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow)
	 * 
	*/
	interface textΞoverflow extends _ {
		set(val: this | Ψstring, arg1: any): void;

		/** Clip inline content that overflows. Characters may be only partially rendered. */
		clip: ''

		/** Render an ellipsis character (U+2026) to represent clipped inline content. */
		ellipsis: ''

	}

	/**
	 * Shorthand that sets the four 'border-*-width' properties. If it has four values, they set top, right, bottom and left in that order. If left is missing, it is the same as right; if bottom is missing, it is the same as top; if right is missing, it is the same as top.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width)
	 * 
	 * @alias bw
	*/
	interface borderΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy borderΞwidth */
	interface bw extends borderΞwidth { }
	/**
	 * Aligns flex items along the main axis of the current line of the flex container.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content)
	 * 
	 * @alias jc
	*/
	interface justifyΞcontent extends _ {
		set(val: this): void;

		/** Flex items are packed toward the center of the line. */
		center: ''

		/** The items are packed flush to each other toward the start edge of the alignment container in the main axis. */
		start: ''

		/** The items are packed flush to each other toward the end edge of the alignment container in the main axis. */
		end: ''

		/** The items are packed flush to each other toward the left edge of the alignment container in the main axis. */
		left: ''

		/** The items are packed flush to each other toward the right edge of the alignment container in the main axis. */
		right: ''

		/** If the size of the item overflows the alignment container, the item is instead aligned as if the alignment mode were start. */
		safe: ''

		/** Regardless of the relative sizes of the item and alignment container, the given alignment value is honored. */
		unsafe: ''

		/** If the combined size of the alignment subjects is less than the size of the alignment container, any auto-sized alignment subjects have their size increased equally (not proportionally), while still respecting the constraints imposed by max-height/max-width (or equivalent functionality), so that the combined size exactly fills the alignment container. */
		stretch: ''

		/** The items are evenly distributed within the alignment container along the main axis. */
		spaceΞevenly: ''

		/** Flex items are packed toward the end of the line. */
		flexΞend: ''

		/** Flex items are packed toward the start of the line. */
		flexΞstart: ''

		/** Flex items are evenly distributed in the line, with half-size spaces on either end. */
		spaceΞaround: ''

		/** Flex items are evenly distributed in the line. */
		spaceΞbetween: ''

		/** Specifies participation in first-baseline alignment. */
		baseline: ''

		/** Specifies participation in first-baseline alignment. */
		'first baseline': ''

		/** Specifies participation in last-baseline alignment. */
		'last baseline': ''

	}

	/** @proxy justifyΞcontent */
	interface jc extends justifyΞcontent { }
	/**
	 * Aligns flex items along the cross axis of the current line of the flex container.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
	 * 
	 * @alias ai
	*/
	interface alignΞitems extends _ {
		set(val: this): void;

		/** If the flex item’s inline axis is the same as the cross axis, this value is identical to 'flex-start'. Otherwise, it participates in baseline alignment. */
		baseline: ''

		/** The flex item’s margin box is centered in the cross axis within the line. */
		center: ''

		/** The cross-end margin edge of the flex item is placed flush with the cross-end edge of the line. */
		flexΞend: ''

		/** The cross-start margin edge of the flex item is placed flush with the cross-start edge of the line. */
		flexΞstart: ''

		/** If the cross size property of the flex item computes to auto, and neither of the cross-axis margins are auto, the flex item is stretched. */
		stretch: ''

	}

	/** @proxy alignΞitems */
	interface ai extends alignΞitems { }
	/**
	 * Specifies the handling of overflow in the vertical direction.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y)
	 * 
	 * @alias ofy
	*/
	interface overflowΞy extends _ {
		set(val: this): void;

		/** The behavior of the 'auto' value is UA-dependent, but should cause a scrolling mechanism to be provided for overflowing boxes. */
		auto: ''

		/** Content is clipped and no scrolling mechanism should be provided to view the content outside the clipping region. */
		hidden: ''

		/** Content is clipped and if the user agent uses a scrolling mechanism that is visible on the screen (such as a scroll bar or a panner), that mechanism should be displayed for a box whether or not any of its content is clipped. */
		scroll: ''

		/** Content is not clipped, i.e., it may be rendered outside the content box. */
		visible: ''

	}

	/** @proxy overflowΞy */
	interface ofy extends overflowΞy { }
	/**
	 * Specifies under what circumstances a given element can be the target element for a pointer event.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
	 * 
	 * @alias pe
	*/
	interface pointerΞevents extends _ {
		set(val: this): void;

		/** The given element can be the target element for pointer events whenever the pointer is over either the interior or the perimeter of the element. */
		all: ''

		/** The given element can be the target element for pointer events whenever the pointer is over the interior of the element. */
		fill: ''

		/** The given element does not receive pointer events. */
		none: ''

		/** The given element can be the target element for pointer events when the pointer is over a "painted" area.  */
		painted: ''

		/** The given element can be the target element for pointer events whenever the pointer is over the perimeter of the element. */
		stroke: ''

		/** The given element can be the target element for pointer events when the ‘visibility’ property is set to visible and the pointer is over either the interior or the perimete of the element. */
		visible: ''

		/** The given element can be the target element for pointer events when the ‘visibility’ property is set to visible and when the pointer is over the interior of the element. */
		visibleFill: ''

		/** The given element can be the target element for pointer events when the ‘visibility’ property is set to visible and when the pointer is over a ‘painted’ area. */
		visiblePainted: ''

		/** The given element can be the target element for pointer events when the ‘visibility’ property is set to visible and when the pointer is over the perimeter of the element. */
		visibleStroke: ''

	}

	/** @proxy pointerΞevents */
	interface pe extends pointerΞevents { }
	/**
	 * The style of the border around edges of an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style)
	 * 
	 * @alias bs
	*/
	interface borderΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/** @proxy borderΞstyle */
	interface bs extends borderΞstyle { }
	/**
	 * Specifies the minimum, maximum, and optimal spacing between grapheme clusters.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing)
	 * 
	 * @alias ls
	*/
	interface letterΞspacing extends _ {
		set(val: this | Ψlength): void;

		/** The spacing is the normal spacing for the current font. It is typically zero-length. */
		normal: ''

	}

	/** @proxy letterΞspacing */
	interface ls extends letterΞspacing { }
	/**
	 * Shorthand property combines six of the animation properties into a single property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
	 * 
	*/
	interface animation extends _ {
		set(val: this | Ψtime | ΨeasingΞfunction | Ψidentifier | Ψnumber, arg1: any, arg2: any, arg3: any): void;

		/** The animation cycle iterations that are odd counts are played in the normal direction, and the animation cycle iterations that are even counts are played in a reverse direction. */
		alternate: ''

		/** The animation cycle iterations that are odd counts are played in the reverse direction, and the animation cycle iterations that are even counts are played in a normal direction. */
		alternateΞreverse: ''

		/** The beginning property value (as defined in the first @keyframes at-rule) is applied before the animation is displayed, during the period defined by 'animation-delay'. */
		backwards: ''

		/** Both forwards and backwards fill modes are applied. */
		both: ''

		/** The final property value (as defined in the last @keyframes at-rule) is maintained after the animation completes. */
		forwards: ''

		/** Causes the animation to repeat forever. */
		infinite: ''

		/** No animation is performed */
		none: ''

		/** Normal playback. */
		normal: ''

		/** All iterations of the animation are played in the reverse direction from the way they were specified. */
		reverse: ''

	}

	/**
	 * Specifies the handling of overflow in the horizontal direction.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x)
	 * 
	 * @alias ofx
	*/
	interface overflowΞx extends _ {
		set(val: this): void;

		/** The behavior of the 'auto' value is UA-dependent, but should cause a scrolling mechanism to be provided for overflowing boxes. */
		auto: ''

		/** Content is clipped and no scrolling mechanism should be provided to view the content outside the clipping region. */
		hidden: ''

		/** Content is clipped and if the user agent uses a scrolling mechanism that is visible on the screen (such as a scroll bar or a panner), that mechanism should be displayed for a box whether or not any of its content is clipped. */
		scroll: ''

		/** Content is not clipped, i.e., it may be rendered outside the content box. */
		visible: ''

	}

	/** @proxy overflowΞx */
	interface ofx extends overflowΞx { }
	/**
	 * Specifies how flex items are placed in the flex container, by setting the direction of the flex container’s main axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction)
	 * 
	 * @alias fld
	*/
	interface flexΞdirection extends _ {
		set(val: this): void;

		/** The flex container’s main axis has the same orientation as the block axis of the current writing mode. */
		column: ''

		/** Same as 'column', except the main-start and main-end directions are swapped. */
		columnΞreverse: ''

		/** The flex container’s main axis has the same orientation as the inline axis of the current writing mode. */
		row: ''

		/** Same as 'row', except the main-start and main-end directions are swapped. */
		rowΞreverse: ''

	}

	/** @proxy flexΞdirection */
	interface fld extends flexΞdirection { }
	/**
	 * Specifies whether the UA may break within a word to prevent overflow when an otherwise-unbreakable string is too long to fit.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/word-wrap)
	 * 
	*/
	interface wordΞwrap extends _ {
		set(val: this): void;

		/** An otherwise unbreakable sequence of characters may be broken at an arbitrary point if there are no otherwise-acceptable break points in the line. */
		breakΞword: ''

		/** Lines may break only at allowed break points. */
		normal: ''

	}

	/**
	 * Specifies the components of a flexible length: the flex grow factor and flex shrink factor, and the flex basis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex)
	 * 
	 * @alias fl
	*/
	interface flex extends _ {
		set(val: this | Ψlength | Ψnumber | Ψpercentage): void;

		/** Retrieves the value of the main size property as the used 'flex-basis'. */
		auto: ''

		/** Indicates automatic sizing, based on the flex item’s content. */
		content: ''

		/** Expands to '0 0 auto'. */
		none: ''

	}

	/** @proxy flex */
	interface fl extends flex { }
	/**
	 * Selects a table's border model.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-collapse)
	 * 
	*/
	interface borderΞcollapse extends _ {
		set(val: this): void;

		/** Selects the collapsing borders model. */
		collapse: ''

		/** Selects the separated borders border model. */
		separate: ''

	}

	/**
	 * Non-standard. Specifies the magnification scale of the object. See 'transform: scale()' for a standards-based alternative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/zoom)
	 * 
	*/
	interface zoom extends _ {
		set(val: this | Ψinteger | Ψnumber | Ψpercentage): void;

		normal: ''

	}

	/**
	 * Used to construct the default contents of a list item’s marker
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type)
	 * 
	*/
	interface listΞstyleΞtype extends _ {
		set(val: this | Ψstring): void;

		/** Traditional uppercase Armenian numbering. */
		armenian: ''

		/** A hollow circle. */
		circle: ''

		/** Western decimal numbers. */
		decimal: ''

		/** Decimal numbers padded by initial zeros. */
		decimalΞleadingΞzero: ''

		/** A filled circle. */
		disc: ''

		/** Traditional Georgian numbering. */
		georgian: ''

		/** Lowercase ASCII letters. */
		lowerΞalpha: ''

		/** Lowercase classical Greek. */
		lowerΞgreek: ''

		/** Lowercase ASCII letters. */
		lowerΞlatin: ''

		/** Lowercase ASCII Roman numerals. */
		lowerΞroman: ''

		/** No marker */
		none: ''

		/** A filled square. */
		square: ''

		/** Allows a counter style to be defined inline. */
		symbols(): ''

		/** Uppercase ASCII letters. */
		upperΞalpha: ''

		/** Uppercase ASCII letters. */
		upperΞlatin: ''

		/** Uppercase ASCII Roman numerals. */
		upperΞroman: ''

	}

	/**
	 * Defines the radii of the bottom left outer border edge.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius)
	 * 
	 * @alias rdbl
	*/
	interface borderΞbottomΞleftΞradius extends _ {
		set(val: Ψradius | Ψlength | Ψpercentage, arg1: any): void;

	}

	/** @proxy borderΞbottomΞleftΞradius */
	interface rdbl extends borderΞbottomΞleftΞradius { }
	/**
	 * Paints the interior of the given graphical element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/fill)
	 * 
	*/
	interface fill extends _ {
		set(val: this | Ψcolor | Ψurl): void;

		/** A URL reference to a paint server element, which is an element that defines a paint server: ‘hatch’, ‘linearGradient’, ‘mesh’, ‘pattern’, ‘radialGradient’ and ‘solidcolor’. */
		url(): ''

		/** No paint is applied in this layer. */
		none: ''

	}

	/**
	 * Establishes the origin of transformation for an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin)
	 * 
	 * @alias origin
	*/
	interface transformΞorigin extends _ {
		set(val: Ψposition | Ψlength | Ψpercentage): void;

	}

	/** @proxy transformΞorigin */
	interface origin extends transformΞorigin { }
	/**
	 * Controls whether the flex container is single-line or multi-line, and the direction of the cross-axis, which determines the direction new lines are stacked in.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap)
	 * 
	 * @alias flw
	*/
	interface flexΞwrap extends _ {
		set(val: this): void;

		/** The flex container is single-line. */
		nowrap: ''

		/** The flexbox is multi-line. */
		wrap: ''

		/** Same as 'wrap', except the cross-start and cross-end directions are swapped. */
		wrapΞreverse: ''

	}

	/** @proxy flexΞwrap */
	interface flw extends flexΞwrap { }
	/**
	 * Enables shadow effects to be applied to the text of the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow)
	 * 
	 * @alias ts
	*/
	interface textΞshadow extends _ {
		set(val: this | Ψlength | Ψcolor): void;

		/** No shadow. */
		none: ''

	}

	/** @proxy textΞshadow */
	interface ts extends textΞshadow { }
	/**
	 * Defines the radii of the top left outer border edge.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius)
	 * 
	 * @alias rdtl
	*/
	interface borderΞtopΞleftΞradius extends _ {
		set(val: Ψradius | Ψlength | Ψpercentage, arg1: any): void;

	}

	/** @proxy borderΞtopΞleftΞradius */
	interface rdtl extends borderΞtopΞleftΞradius { }
	/**
	 * Controls the appearance of selection.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select)
	 * 
	 * @alias us
	*/
	interface userΞselect extends _ {
		set(val: this): void;

		/** The content of the element must be selected atomically */
		all: ''

		auto: ''

		/** UAs must not allow a selection which is started in this element to be extended outside of this element. */
		contain: ''

		/** The UA must not allow selections to be started in this element. */
		none: ''

		/** The element imposes no constraint on the selection. */
		text: ''

	}

	/** @proxy userΞselect */
	interface us extends userΞselect { }
	/**
	 * Deprecated. Use the 'clip-path' property when support allows. Defines the visible portion of an element’s box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/clip)
	 * 
	*/
	interface clip extends _ {
		set(val: this): void;

		/** The element does not clip. */
		auto: ''

		/** Specifies offsets from the edges of the border box. */
		rect(): ''

	}

	/**
	 * Defines the radii of the bottom right outer border edge.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius)
	 * 
	 * @alias rdbr
	*/
	interface borderΞbottomΞrightΞradius extends _ {
		set(val: Ψradius | Ψlength | Ψpercentage, arg1: any): void;

	}

	/** @proxy borderΞbottomΞrightΞradius */
	interface rdbr extends borderΞbottomΞrightΞradius { }
	/**
	 * Specifies line break opportunities for non-CJK scripts.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break)
	 * 
	*/
	interface wordΞbreak extends _ {
		set(val: this): void;

		/** Lines may break between any two grapheme clusters for non-CJK scripts. */
		breakΞall: ''

		/** Block characters can no longer create implied break points. */
		keepΞall: ''

		/** Breaks non-CJK scripts according to their own rules. */
		normal: ''

	}

	/**
	 * Defines the radii of the top right outer border edge.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-right-radius)
	 * 
	 * @alias rdtr
	*/
	interface borderΞtopΞrightΞradius extends _ {
		set(val: Ψradius | Ψlength | Ψpercentage, arg1: any): void;

	}

	/** @proxy borderΞtopΞrightΞradius */
	interface rdtr extends borderΞtopΞrightΞradius { }
	/**
	 * Sets the flex grow factor. Negative numbers are invalid.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow)
	 * 
	 * @alias flg
	*/
	interface flexΞgrow extends _ {
		set(val: Ψnumber): void;

	}

	/** @proxy flexΞgrow */
	interface flg extends flexΞgrow { }
	/**
	 * Sets the color of the top border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color)
	 * 
	 * @alias bct
	*/
	interface borderΞtopΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy borderΞtopΞcolor */
	interface bct extends borderΞtopΞcolor { }
	/**
	 * Sets the color of the bottom border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color)
	 * 
	 * @alias bcb
	*/
	interface borderΞbottomΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy borderΞbottomΞcolor */
	interface bcb extends borderΞbottomΞcolor { }
	/**
	 * Sets the flex shrink factor. Negative numbers are invalid.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink)
	 * 
	 * @alias fls
	*/
	interface flexΞshrink extends _ {
		set(val: Ψnumber): void;

	}

	/** @proxy flexΞshrink */
	interface fls extends flexΞshrink { }
	/**
	 * The creator of SVG content might want to provide a hint to the implementation about what tradeoffs to make as it renders text. The ‘text-rendering’ property provides these hints.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-rendering)
	 * 
	*/
	interface textΞrendering extends _ {
		set(val: this): void;

		auto: ''

		/** Indicates that the user agent shall emphasize geometric precision over legibility and rendering speed. */
		geometricPrecision: ''

		/** Indicates that the user agent shall emphasize legibility over rendering speed and geometric precision. */
		optimizeLegibility: ''

		/** Indicates that the user agent shall emphasize rendering speed over legibility and geometric precision. */
		optimizeSpeed: ''

	}

	/**
	 * Allows the default alignment along the cross axis to be overridden for individual flex items.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self)
	 * 
	 * @alias as
	*/
	interface alignΞself extends _ {
		set(val: this): void;

		/** Computes to the value of 'align-items' on the element’s parent, or 'stretch' if the element has no parent. On absolutely positioned elements, it computes to itself. */
		auto: ''

		/** If the flex item’s inline axis is the same as the cross axis, this value is identical to 'flex-start'. Otherwise, it participates in baseline alignment. */
		baseline: ''

		/** The flex item’s margin box is centered in the cross axis within the line. */
		center: ''

		/** The cross-end margin edge of the flex item is placed flush with the cross-end edge of the line. */
		flexΞend: ''

		/** The cross-start margin edge of the flex item is placed flush with the cross-start edge of the line. */
		flexΞstart: ''

		/** If the cross size property of the flex item computes to auto, and neither of the cross-axis margins are auto, the flex item is stretched. */
		stretch: ''

	}

	/** @proxy alignΞself */
	interface as extends alignΞself { }
	/**
	 * Specifies the indentation applied to lines of inline content in a block. The indentation only affects the first line of inline content in the block unless the 'hanging' keyword is specified, in which case it affects all lines except the first.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-indent)
	 * 
	*/
	interface textΞindent extends _ {
		set(val: Ψpercentage | Ψlength): void;

	}

	/**
	 * Describes how the animation will progress over one cycle of its duration.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function)
	 * 
	*/
	interface animationΞtimingΞfunction extends _ {
		set(val: ΨeasingΞfunction, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The lengths specify the distance that separates adjoining cell borders. If one length is specified, it gives both the horizontal and vertical spacing. If two are specified, the first gives the horizontal spacing and the second the vertical spacing. Lengths may not be negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-spacing)
	 * 
	*/
	interface borderΞspacing extends _ {
		set(val: Ψlength): void;

	}

	/**
	 * Specifies the inline base direction or directionality of any bidi paragraph, embedding, isolate, or override established by the box. Note: for HTML content use the 'dir' attribute and 'bdo' element rather than this property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
	 * 
	*/
	interface direction extends _ {
		set(val: this): void;

		/** Left-to-right direction. */
		ltr: ''

		/** Right-to-left direction. */
		rtl: ''

	}

	/**
	 * Determines the background painting area.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip)
	 * 
	 * @alias bgclip
	*/
	interface backgroundΞclip extends _ {
		set(val: Ψbox, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy backgroundΞclip */
	interface bgclip extends backgroundΞclip { }
	/**
	 * Sets the color of the left border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-color)
	 * 
	 * @alias bcl
	*/
	interface borderΞleftΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy borderΞleftΞcolor */
	interface bcl extends borderΞleftΞcolor { }
	/**
	 * `@font-face` descriptor. Specifies the resource containing font data. It is required, whether the font is downloadable or locally installed.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/src)
	 * 
	*/
	interface src extends _ {
		set(val: this | Ψurl | Ψidentifier, arg1: any, arg2: any, arg3: any): void;

		/** Reference font by URL */
		url(): ''

		/** Optional hint describing the format of the font resource. */
		format(): ''

		/** Format-specific string that identifies a locally available copy of a given font. */
		local(): ''

	}

	/**
	 * Determines whether touch input may trigger default behavior supplied by user agent.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
	 * 
	*/
	interface touchΞaction extends _ {
		set(val: this): void;

		/** The user agent may determine any permitted touch behaviors for touches that begin on the element. */
		auto: ''

		crossΞslideΞx: ''

		crossΞslideΞy: ''

		doubleΞtapΞzoom: ''

		/** The user agent may consider touches that begin on the element only for the purposes of scrolling and continuous zooming. */
		manipulation: ''

		/** Touches that begin on the element must not trigger default touch behaviors. */
		none: ''

		/** The user agent may consider touches that begin on the element only for the purposes of horizontally scrolling the element’s nearest ancestor with horizontally scrollable content. */
		panΞx: ''

		/** The user agent may consider touches that begin on the element only for the purposes of vertically scrolling the element’s nearest ancestor with vertically scrollable content. */
		panΞy: ''

		pinchΞzoom: ''

	}

	/**
	 * Sets the color of the right border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-color)
	 * 
	 * @alias bcr
	*/
	interface borderΞrightΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy borderΞrightΞcolor */
	interface bcr extends borderΞrightΞcolor { }
	/**
	 * Specifies the name of the CSS property to which the transition is applied.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-property)
	 * 
	*/
	interface transitionΞproperty extends _ {
		set(val: this | Ψproperty): void;

		/** Every property that is able to undergo a transition will do so. */
		all: ''

		/** No property will transition. */
		none: ''

	}

	/**
	 * Defines a list of animations that apply. Each name is used to select the keyframe at-rule that provides the property values for the animation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-name)
	 * 
	*/
	interface animationΞname extends _ {
		set(val: this | Ψidentifier, arg1: any, arg2: any, arg3: any): void;

		/** No animation is performed */
		none: ''

	}

	/**
	 * Processes an element’s rendering before it is displayed in the document, by applying one or more filter effects.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)
	 * 
	*/
	interface filter extends _ {
		set(val: this | Ψurl): void;

		/** No filter effects are applied. */
		none: ''

		/** Applies a Gaussian blur to the input image. */
		blur(): ''

		/** Applies a linear multiplier to input image, making it appear more or less bright. */
		brightness(): ''

		/** Adjusts the contrast of the input. */
		contrast(): ''

		/** Applies a drop shadow effect to the input image. */
		dropΞshadow(): ''

		/** Converts the input image to grayscale. */
		grayscale(): ''

		/** Applies a hue rotation on the input image.  */
		hueΞrotate(): ''

		/** Inverts the samples in the input image. */
		invert(): ''

		/** Applies transparency to the samples in the input image. */
		opacity(): ''

		/** Saturates the input image. */
		saturate(): ''

		/** Converts the input image to sepia. */
		sepia(): ''

		/** A filter reference to a <filter> element. */
		url(): ''

	}

	/**
	 * Defines the length of time that an animation takes to complete one cycle.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration)
	 * 
	*/
	interface animationΞduration extends _ {
		set(val: Ψtime, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Specifies whether the UA may break within a word to prevent overflow when an otherwise-unbreakable string is too long to fit within the line box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap)
	 * 
	*/
	interface overflowΞwrap extends _ {
		set(val: this): void;

		/** An otherwise unbreakable sequence of characters may be broken at an arbitrary point if there are no otherwise-acceptable break points in the line. */
		breakΞword: ''

		/** Lines may break only at allowed break points. */
		normal: ''

	}

	/**
	 * Defines when the transition will start. It allows a transition to begin execution some period of time from when it is applied.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay)
	 * 
	*/
	interface transitionΞdelay extends _ {
		set(val: Ψtime, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Paints along the outline of the given graphical element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke)
	 * 
	*/
	interface stroke extends _ {
		set(val: this | Ψcolor | Ψurl): void;

		/** A URL reference to a paint server element, which is an element that defines a paint server: ‘hatch’, ‘linearGradient’, ‘mesh’, ‘pattern’, ‘radialGradient’ and ‘solidcolor’. */
		url(): ''

		/** No paint is applied in this layer. */
		none: ''

	}

	/**
	 * Specifies variant representations of the font
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant)
	 * 
	*/
	interface fontΞvariant extends _ {
		set(val: this): void;

		/** Specifies a face that is not labeled as a small-caps font. */
		normal: ''

		/** Specifies a font that is labeled as a small-caps font. If a genuine small-caps font is not available, user agents should simulate a small-caps font. */
		smallΞcaps: ''

	}

	/**
	 * Sets the thickness of the bottom border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-width)
	 * 
	 * @alias bwb
	*/
	interface borderΞbottomΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/** @proxy borderΞbottomΞwidth */
	interface bwb extends borderΞbottomΞwidth { }
	/**
	 * Defines when the animation will start.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay)
	 * 
	*/
	interface animationΞdelay extends _ {
		set(val: Ψtime, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Sets the thickness of the top border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-width)
	 * 
	 * @alias bwt
	*/
	interface borderΞtopΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/** @proxy borderΞtopΞwidth */
	interface bwt extends borderΞtopΞwidth { }
	/**
	 * Specifies how long the transition from the old value to the new value should take.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration)
	 * 
	*/
	interface transitionΞduration extends _ {
		set(val: Ψtime, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Sets the flex basis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis)
	 * 
	 * @alias flb
	*/
	interface flexΞbasis extends _ {
		set(val: this | Ψlength | Ψnumber | Ψpercentage): void;

		/** Retrieves the value of the main size property as the used 'flex-basis'. */
		auto: ''

		/** Indicates automatic sizing, based on the flex item’s content. */
		content: ''

	}

	/** @proxy flexΞbasis */
	interface flb extends flexΞbasis { }
	/**
	 * Provides a rendering hint to the user agent, stating what kinds of changes the author expects to perform on the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
	 * 
	*/
	interface willΞchange extends _ {
		set(val: this | Ψidentifier): void;

		/** Expresses no particular intent. */
		auto: ''

		/** Indicates that the author expects to animate or change something about the element’s contents in the near future. */
		contents: ''

		/** Indicates that the author expects to animate or change the scroll position of the element in the near future. */
		scrollΞposition: ''

	}

	/**
	 * Defines what values are applied by the animation outside the time it is executing.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode)
	 * 
	*/
	interface animationΞfillΞmode extends _ {
		set(val: this, arg1: any, arg2: any, arg3: any): void;

		/** The beginning property value (as defined in the first @keyframes at-rule) is applied before the animation is displayed, during the period defined by 'animation-delay'. */
		backwards: ''

		/** Both forwards and backwards fill modes are applied. */
		both: ''

		/** The final property value (as defined in the last @keyframes at-rule) is maintained after the animation completes. */
		forwards: ''

		/** There is no change to the property value between the time the animation is applied and the time the animation begins playing or after the animation completes. */
		none: ''

	}

	/**
	 * Width of the outline.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-width)
	 * 
	*/
	interface outlineΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/**
	 * Controls the algorithm used to lay out the table cells, rows, and columns.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout)
	 * 
	*/
	interface tableΞlayout extends _ {
		set(val: this): void;

		/** Use any automatic table layout algorithm. */
		auto: ''

		/** Use the fixed table layout algorithm. */
		fixed: ''

	}

	/**
	 * Specifies how the contents of a replaced element should be scaled relative to the box established by its used height and width.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
	 * 
	*/
	interface objectΞfit extends _ {
		set(val: this): void;

		/** The replaced content is sized to maintain its aspect ratio while fitting within the element’s content box: its concrete object size is resolved as a contain constraint against the element's used width and height. */
		contain: ''

		/** The replaced content is sized to maintain its aspect ratio while filling the element's entire content box: its concrete object size is resolved as a cover constraint against the element’s used width and height. */
		cover: ''

		/** The replaced content is sized to fill the element’s content box: the object's concrete object size is the element's used width and height. */
		fill: ''

		/** The replaced content is not resized to fit inside the element's content box */
		none: ''

		/** Size the content as if ‘none’ or ‘contain’ were specified, whichever would result in a smaller concrete object size. */
		scaleΞdown: ''

	}

	/**
	 * Controls the order in which children of a flex container appear within the flex container, by assigning them to ordinal groups.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/order)
	 * 
	*/
	interface order extends _ {
		set(val: Ψinteger): void;

	}

	/**
	 * Describes how the intermediate values used during a transition will be calculated.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)
	 * 
	*/
	interface transitionΞtimingΞfunction extends _ {
		set(val: ΨeasingΞfunction, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Specifies whether or not an element is resizable by the user, and if so, along which axis/axes.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/resize)
	 * 
	*/
	interface resize extends _ {
		set(val: this): void;

		/** The UA presents a bidirectional resizing mechanism to allow the user to adjust both the height and the width of the element. */
		both: ''

		/** The UA presents a unidirectional horizontal resizing mechanism to allow the user to adjust only the width of the element. */
		horizontal: ''

		/** The UA does not present a resizing mechanism on the element, and the user is given no direct manipulation mechanism to resize the element. */
		none: ''

		/** The UA presents a unidirectional vertical resizing mechanism to allow the user to adjust only the height of the element. */
		vertical: ''

	}

	/**
	 * Style of the outline.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style)
	 * 
	*/
	interface outlineΞstyle extends _ {
		set(val: this | ΨlineΞstyle): void;

		/** Permits the user agent to render a custom outline style, typically the default platform style. */
		auto: ''

	}

	/**
	 * Sets the thickness of the right border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-width)
	 * 
	 * @alias bwr
	*/
	interface borderΞrightΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/** @proxy borderΞrightΞwidth */
	interface bwr extends borderΞrightΞwidth { }
	/**
	 * Specifies the width of the stroke on the current object.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-width)
	 * 
	*/
	interface strokeΞwidth extends _ {
		set(val: Ψpercentage | Ψlength): void;

	}

	/**
	 * Defines the number of times an animation cycle is played. The default value is one, meaning the animation will play from beginning to end once.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count)
	 * 
	*/
	interface animationΞiterationΞcount extends _ {
		set(val: this | Ψnumber, arg1: any, arg2: any, arg3: any): void;

		/** Causes the animation to repeat forever. */
		infinite: ''

	}

	/**
	 * Aligns a flex container’s lines within the flex container when there is extra space in the cross-axis, similar to how 'justify-content' aligns individual items within the main-axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content)
	 * 
	 * @alias ac
	*/
	interface alignΞcontent extends _ {
		set(val: this): void;

		/** Lines are packed toward the center of the flex container. */
		center: ''

		/** Lines are packed toward the end of the flex container. */
		flexΞend: ''

		/** Lines are packed toward the start of the flex container. */
		flexΞstart: ''

		/** Lines are evenly distributed in the flex container, with half-size spaces on either end. */
		spaceΞaround: ''

		/** Lines are evenly distributed in the flex container. */
		spaceΞbetween: ''

		/** Lines stretch to take up the remaining space. */
		stretch: ''

	}

	/** @proxy alignΞcontent */
	interface ac extends alignΞcontent { }
	/**
	 * Offset the outline and draw it beyond the border edge.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset)
	 * 
	*/
	interface outlineΞoffset extends _ {
		set(val: Ψlength): void;

	}

	/**
	 * Determines whether or not the 'back' side of a transformed element is visible when facing the viewer. With an identity transform, the front side of an element faces the viewer.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility)
	 * 
	*/
	interface backfaceΞvisibility extends _ {
		set(val: this): void;

		/** Back side is hidden. */
		hidden: ''

		/** Back side is visible. */
		visible: ''

	}

	/**
	 * Sets the thickness of the left border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-width)
	 * 
	 * @alias bwl
	*/
	interface borderΞleftΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/** @proxy borderΞleftΞwidth */
	interface bwl extends borderΞleftΞwidth { }
	/**
	 * Specifies how flexbox items are placed in the flexbox.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-flow)
	 * 
	 * @alias flf
	*/
	interface flexΞflow extends _ {
		set(val: this): void;

		/** The flex container’s main axis has the same orientation as the block axis of the current writing mode. */
		column: ''

		/** Same as 'column', except the main-start and main-end directions are swapped. */
		columnΞreverse: ''

		/** The flex container is single-line. */
		nowrap: ''

		/** The flex container’s main axis has the same orientation as the inline axis of the current writing mode. */
		row: ''

		/** Same as 'row', except the main-start and main-end directions are swapped. */
		rowΞreverse: ''

		/** The flexbox is multi-line. */
		wrap: ''

		/** Same as 'wrap', except the cross-start and cross-end directions are swapped. */
		wrapΞreverse: ''

	}

	/** @proxy flexΞflow */
	interface flf extends flexΞflow { }
	/**
	 * Changes the appearance of buttons and other controls to resemble native controls.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/appearance)
	 * 
	*/
	interface appearance extends _ {
		set(val: any): void;

	}

	/**
	 * The level of embedding with respect to the bidirectional algorithm.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-bidi)
	 * 
	*/
	interface unicodeΞbidi extends _ {
		set(val: this): void;

		/** Inside the element, reordering is strictly in sequence according to the 'direction' property; the implicit part of the bidirectional algorithm is ignored. */
		bidiΞoverride: ''

		/** If the element is inline-level, this value opens an additional level of embedding with respect to the bidirectional algorithm. The direction of this embedding level is given by the 'direction' property. */
		embed: ''

		/** The contents of the element are considered to be inside a separate, independent paragraph. */
		isolate: ''

		/** This combines the isolation behavior of 'isolate' with the directional override behavior of 'bidi-override' */
		isolateΞoverride: ''

		/** The element does not open an additional level of embedding with respect to the bidirectional algorithm. For inline-level elements, implicit reordering works across element boundaries. */
		normal: ''

		/** For the purposes of the Unicode bidirectional algorithm, the base directionality of each bidi paragraph for which the element forms the containing block is determined not by the element's computed 'direction'. */
		plaintext: ''

	}

	/**
	 * Controls the pattern of dashes and gaps used to stroke paths.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dasharray)
	 * 
	*/
	interface strokeΞdasharray extends _ {
		set(val: this | Ψlength | Ψpercentage | Ψnumber): void;

		/** Indicates that no dashing is used. */
		none: ''

	}

	/**
	 * Specifies the distance into the dash pattern to start the dash.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dashoffset)
	 * 
	*/
	interface strokeΞdashoffset extends _ {
		set(val: Ψpercentage | Ψlength): void;

	}

	/**
	 * `@font-face` descriptor. Defines the set of Unicode codepoints that may be supported by the font face for which it is declared.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-range)
	 * 
	*/
	interface unicodeΞrange extends _ {
		set(val: this | ΨunicodeΞrange): void;

		/** Ampersand. */
		'U+26': ''

		/** Basic Latin (ASCII). */
		'U+00Ξ7F': ''

		/** Latin-1 Supplement. Accented characters for Western European languages, common punctuation characters, multiplication and division signs. */
		'U+80ΞFF': ''

		/** Latin Extended-A. Accented characters for for Czech, Dutch, Polish, and Turkish. */
		'U+100Ξ17F': ''

		/** Latin Extended-B. Croatian, Slovenian, Romanian, Non-European and historic latin, Khoisan, Pinyin, Livonian, Sinology. */
		'U+180Ξ24F': ''

		/** Latin Extended Additional. Vietnamese, German captial sharp s, Medievalist, Latin general use. */
		'U+1E00Ξ1EFF': ''

		/** International Phonetic Alphabet Extensions. */
		'U+250Ξ2AF': ''

		/** Greek and Coptic. */
		'U+370Ξ3FF': ''

		/** Greek Extended. Accented characters for polytonic Greek. */
		'U+1F00Ξ1FFF': ''

		/** Cyrillic. */
		'U+400Ξ4FF': ''

		/** Cyrillic Supplement. Extra letters for Komi, Khanty, Chukchi, Mordvin, Kurdish, Aleut, Chuvash, Abkhaz, Azerbaijani, and Orok. */
		'U+500Ξ52F': ''

		/** Armenian. */
		'U+530–58F': ''

		/** Hebrew. */
		'U+590–5FF': ''

		/** Arabic. */
		'U+600–6FF': ''

		/** Arabic Supplement. Additional letters for African languages, Khowar, Torwali, Burushaski, and early Persian. */
		'U+750–77F': ''

		/** Arabic Extended-A. Additional letters for African languages, European and Central Asian languages, Rohingya, Tamazight, Arwi, and Koranic annotation signs. */
		'U+8A0–8FF': ''

		/** Syriac. */
		'U+700–74F': ''

		/** Devanagari. */
		'U+900–97F': ''

		/** Bengali. */
		'U+980–9FF': ''

		/** Gurmukhi. */
		'U+A00–A7F': ''

		/** Gujarati. */
		'U+A80–AFF': ''

		/** Oriya. */
		'U+B00–B7F': ''

		/** Tamil. */
		'U+B80–BFF': ''

		/** Telugu. */
		'U+C00–C7F': ''

		/** Kannada. */
		'U+C80–CFF': ''

		/** Malayalam. */
		'U+D00–D7F': ''

		/** Sinhala. */
		'U+D80–DFF': ''

		/** Warang Citi. */
		'U+118A0–118FF': ''

		/** Thai. */
		'U+E00–E7F': ''

		/** Tai Tham. */
		'U+1A20–1AAF': ''

		/** Tai Viet. */
		'U+AA80–AADF': ''

		/** Lao. */
		'U+E80–EFF': ''

		/** Tibetan. */
		'U+F00–FFF': ''

		/** Myanmar (Burmese). */
		'U+1000–109F': ''

		/** Georgian. */
		'U+10A0–10FF': ''

		/** Ethiopic. */
		'U+1200–137F': ''

		/** Ethiopic Supplement. Extra Syllables for Sebatbeit, and Tonal marks */
		'U+1380–139F': ''

		/** Ethiopic Extended. Extra Syllables for Me'en, Blin, and Sebatbeit. */
		'U+2D80–2DDF': ''

		/** Ethiopic Extended-A. Extra characters for Gamo-Gofa-Dawro, Basketo, and Gumuz. */
		'U+AB00–AB2F': ''

		/** Khmer. */
		'U+1780–17FF': ''

		/** Mongolian. */
		'U+1800–18AF': ''

		/** Sundanese. */
		'U+1B80–1BBF': ''

		/** Sundanese Supplement. Punctuation. */
		'U+1CC0–1CCF': ''

		/** CJK (Chinese, Japanese, Korean) Unified Ideographs. Most common ideographs for modern Chinese and Japanese. */
		'U+4E00–9FD5': ''

		/** CJK Unified Ideographs Extension A. Rare ideographs. */
		'U+3400–4DB5': ''

		/** Kangxi Radicals. */
		'U+2F00–2FDF': ''

		/** CJK Radicals Supplement. Alternative forms of Kangxi Radicals. */
		'U+2E80–2EFF': ''

		/** Hangul Jamo. */
		'U+1100–11FF': ''

		/** Hangul Syllables. */
		'U+AC00–D7AF': ''

		/** Hiragana. */
		'U+3040–309F': ''

		/** Katakana. */
		'U+30A0–30FF': ''

		/** Lisu. */
		'U+A4D0–A4FF': ''

		/** Yi Syllables. */
		'U+A000–A48F': ''

		/** Yi Radicals. */
		'U+A490–A4CF': ''

		/** General Punctuation. */
		'U+2000Ξ206F': ''

		/** CJK Symbols and Punctuation. */
		'U+3000–303F': ''

		/** Superscripts and Subscripts. */
		'U+2070–209F': ''

		/** Currency Symbols. */
		'U+20A0–20CF': ''

		/** Letterlike Symbols. */
		'U+2100–214F': ''

		/** Number Forms. */
		'U+2150–218F': ''

		/** Arrows. */
		'U+2190–21FF': ''

		/** Mathematical Operators. */
		'U+2200–22FF': ''

		/** Miscellaneous Technical. */
		'U+2300–23FF': ''

		/** Private Use Area. */
		'U+E000ΞF8FF': ''

		/** Alphabetic Presentation Forms. Ligatures for latin, Armenian, and Hebrew. */
		'U+FB00–FB4F': ''

		/** Arabic Presentation Forms-A. Contextual forms / ligatures for Persian, Urdu, Sindhi, Central Asian languages, etc, Arabic pedagogical symbols, word ligatures. */
		'U+FB50–FDFF': ''

		/** Emoji: Emoticons. */
		'U+1F600–1F64F': ''

		/** Emoji: Miscellaneous Symbols. */
		'U+2600–26FF': ''

		/** Emoji: Miscellaneous Symbols and Pictographs. */
		'U+1F300–1F5FF': ''

		/** Emoji: Supplemental Symbols and Pictographs. */
		'U+1F900–1F9FF': ''

		/** Emoji: Transport and Map Symbols. */
		'U+1F680–1F6FF': ''

	}

	/**
	 * Specifies additional spacing between “words”.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing)
	 * 
	*/
	interface wordΞspacing extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** No additional spacing is applied. Computes to zero. */
		normal: ''

	}

	/**
	 * The text-size-adjust CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust)
	 * 
	*/
	interface textΞsizeΞadjust extends _ {
		set(val: any): void;

	}

	/**
	 * Sets the style of the top border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style)
	 * 
	 * @alias bst
	*/
	interface borderΞtopΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/** @proxy borderΞtopΞstyle */
	interface bst extends borderΞtopΞstyle { }
	/**
	 * Sets the style of the bottom border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-style)
	 * 
	 * @alias bsb
	*/
	interface borderΞbottomΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/** @proxy borderΞbottomΞstyle */
	interface bsb extends borderΞbottomΞstyle { }
	/**
	 * Defines whether or not the animation should play in reverse on alternate cycles.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction)
	 * 
	*/
	interface animationΞdirection extends _ {
		set(val: this, arg1: any, arg2: any, arg3: any): void;

		/** The animation cycle iterations that are odd counts are played in the normal direction, and the animation cycle iterations that are even counts are played in a reverse direction. */
		alternate: ''

		/** The animation cycle iterations that are odd counts are played in the reverse direction, and the animation cycle iterations that are even counts are played in a normal direction. */
		alternateΞreverse: ''

		/** Normal playback. */
		normal: ''

		/** All iterations of the animation are played in the reverse direction from the way they were specified. */
		reverse: ''

	}

	/**
	 * Provides a hint to the user-agent about what aspects of an image are most important to preserve when the image is scaled, to aid the user-agent in the choice of an appropriate scaling algorithm.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering)
	 * 
	*/
	interface imageΞrendering extends _ {
		set(val: this): void;

		/** The image should be scaled with an algorithm that maximizes the appearance of the image. */
		auto: ''

		/** The image must be scaled with an algorithm that preserves contrast and edges in the image, and which does not smooth colors or introduce blur to the image in the process. */
		crispΞedges: ''

		ΞmozΞcrispΞedges: ''

		/** Deprecated. */
		optimizeQuality: ''

		/** Deprecated. */
		optimizeSpeed: ''

		/** When scaling the image up, the 'nearest neighbor' or similar algorithm must be used, so that the image appears to be simply composed of very large pixels. */
		pixelated: ''

	}

	/**
	 * Applies the same transform as the perspective(<number>) transform function, except that it applies only to the positioned or transformed children of the element, not to the transform on the element itself.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
	 * 
	*/
	interface perspective extends _ {
		set(val: this | Ψlength): void;

		/** No perspective transform is applied. */
		none: ''

	}

	/**
	 * specifies, as a space-separated track list, the line names and track sizing functions of the grid.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
	 * 
	 * @alias gtc
	*/
	interface gridΞtemplateΞcolumns extends _ {
		set(val: this | Ψidentifier | Ψlength | Ψpercentage): void;

		/** There is no explicit grid; any rows/columns will be implicitly generated. */
		none: ''

		/** Represents the largest min-content contribution of the grid items occupying the grid track. */
		minΞcontent: ''

		/** Represents the largest max-content contribution of the grid items occupying the grid track. */
		maxΞcontent: ''

		/** As a maximum, identical to 'max-content'. As a minimum, represents the largest minimum size (as specified by min-width/min-height) of the grid items occupying the grid track. */
		auto: ''

		/** Indicates that the grid will align to its parent grid in that axis. */
		subgrid: ''

		/** Defines a size range greater than or equal to min and less than or equal to max. */
		minmax(): ''

		/** Represents a repeated fragment of the track list, allowing a large number of columns or rows that exhibit a recurring pattern to be written in a more compact form. */
		repeat(): ''

	}

	/** @proxy gridΞtemplateΞcolumns */
	interface gtc extends gridΞtemplateΞcolumns { }
	/**
	 * Specifies the position of the '::marker' pseudo-element's box in the list item.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position)
	 * 
	*/
	interface listΞstyleΞposition extends _ {
		set(val: this): void;

		/** The marker box is outside the principal block box, as described in the section on the ::marker pseudo-element below. */
		inside: ''

		/** The ::marker pseudo-element is an inline element placed immediately before all ::before pseudo-elements in the principal block box, after which the element's content flows. */
		outside: ''

	}

	/**
	 * Provides low-level control over OpenType font features. It is intended as a way of providing access to font features that are not widely used but are needed for a particular use case.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings)
	 * 
	*/
	interface fontΞfeatureΞsettings extends _ {
		set(val: this | Ψstring | Ψinteger): void;

		/** No change in glyph substitution or positioning occurs. */
		normal: ''

		/** Disable feature. */
		off: ''

		/** Enable feature. */
		on: ''

	}

	/**
	 * Indicates that an element and its contents are, as much as possible, independent of the rest of the document tree.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)
	 * 
	*/
	interface contain extends _ {
		set(val: this): void;

		/** Indicates that the property has no effect. */
		none: ''

		/** Turns on all forms of containment for the element. */
		strict: ''

		/** All containment rules except size are applied to the element. */
		content: ''

		/** For properties that can have effects on more than just an element and its descendants, those effects don't escape the containing element. */
		size: ''

		/** Turns on layout containment for the element. */
		layout: ''

		/** Turns on style containment for the element. */
		style: ''

		/** Turns on paint containment for the element. */
		paint: ''

	}

	/**
	 * If background images have been specified, this property specifies their initial position (after any resizing) within their corresponding background positioning area.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position-x)
	 * 
	*/
	interface backgroundΞpositionΞx extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		/** Equivalent to '50%' ('left 50%') for the horizontal position if the horizontal position is not otherwise specified, or '50%' ('top 50%') for the vertical position if it is. */
		center: ''

		/** Equivalent to '0%' for the horizontal position if one or two values are given, otherwise specifies the left edge as the origin for the next offset. */
		left: ''

		/** Equivalent to '100%' for the horizontal position if one or two values are given, otherwise specifies the right edge as the origin for the next offset. */
		right: ''

	}

	/**
	 * Defines how nested elements are rendered in 3D space.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style)
	 * 
	*/
	interface transformΞstyle extends _ {
		set(val: this): void;

		/** All children of this element are rendered flattened into the 2D plane of the element. */
		flat: ''

		/** Flattening is not performed, so children maintain their position in 3D space. */
		preserveΞ3d: ''

	}

	/**
	 * For elements rendered as a single box, specifies the background positioning area. For elements rendered as multiple boxes (e.g., inline boxes on several lines, boxes on several pages) specifies which boxes 'box-decoration-break' operates on to determine the background positioning area(s).
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin)
	 * 
	 * @alias bgo
	*/
	interface backgroundΞorigin extends _ {
		set(val: Ψbox, arg1: any, arg2: any, arg3: any): void;

	}

	/** @proxy backgroundΞorigin */
	interface bgo extends backgroundΞorigin { }
	/**
	 * Sets the style of the left border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-style)
	 * 
	 * @alias bsl
	*/
	interface borderΞleftΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/** @proxy borderΞleftΞstyle */
	interface bsl extends borderΞleftΞstyle { }
	/**
	 * The font-display descriptor determines how a font face is displayed based on whether and when it is downloaded and ready to use.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-display)
	 * 
	*/
	interface fontΞdisplay extends _ {
		set(val: any): void;

	}

	/**
	 * Specifies a clipping path where everything inside the path is visible and everything outside is clipped out.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
	 * 
	*/
	interface clipΞpath extends _ {
		set(val: this | Ψurl | Ψshape | ΨgeometryΞbox): void;

		/** No clipping path gets created. */
		none: ''

		/** References a <clipPath> element to create a clipping path. */
		url(): ''

	}

	/**
	 * Controls whether hyphenation is allowed to create more break opportunities within a line of text.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens)
	 * 
	*/
	interface hyphens extends _ {
		set(val: this): void;

		/** Conditional hyphenation characters inside a word, if present, take priority over automatic resources when determining hyphenation points within the word. */
		auto: ''

		/** Words are only broken at line breaks where there are characters inside the word that suggest line break opportunities */
		manual: ''

		/** Words are not broken at line breaks, even if characters inside the word suggest line break points. */
		none: ''

	}

	/**
	 * Specifies whether the background images are fixed with regard to the viewport ('fixed') or scroll along with the element ('scroll') or its contents ('local').
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment)
	 * 
	 * @alias bga
	*/
	interface backgroundΞattachment extends _ {
		set(val: this, arg1: any, arg2: any, arg3: any): void;

		/** The background is fixed with regard to the viewport. In paged media where there is no viewport, a 'fixed' background is fixed with respect to the page box and therefore replicated on every page. */
		fixed: ''

		/** The background is fixed with regard to the element’s contents: if the element has a scrolling mechanism, the background scrolls with the element’s contents. */
		local: ''

		/** The background is fixed with regard to the element itself and does not scroll with its contents. (It is effectively attached to the element’s border.) */
		scroll: ''

	}

	/** @proxy backgroundΞattachment */
	interface bga extends backgroundΞattachment { }
	/**
	 * Sets the style of the right border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-style)
	 * 
	 * @alias bsr
	*/
	interface borderΞrightΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/** @proxy borderΞrightΞstyle */
	interface bsr extends borderΞrightΞstyle { }
	/**
	 * The color of the outline.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color)
	 * 
	*/
	interface outlineΞcolor extends _ {
		set(val: this | Ψcolor): void;

		/** Performs a color inversion on the pixels on the screen. */
		invert: ''

	}

	/**
	 * Logical 'margin-bottom'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block-end)
	 * 
	*/
	interface marginΞblockΞend extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/**
	 * Defines whether the animation is running or paused.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state)
	 * 
	*/
	interface animationΞplayΞstate extends _ {
		set(val: this): void;

		/** A running animation will be paused. */
		paused: ''

		/** Resume playback of a paused animation. */
		running: ''

	}

	/**
	 * Specifies quotation marks for any number of embedded quotations.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/quotes)
	 * 
	*/
	interface quotes extends _ {
		set(val: this | Ψstring): void;

		/** The 'open-quote' and 'close-quote' values of the 'content' property produce no quotations marks, as if they were 'no-open-quote' and 'no-close-quote' respectively. */
		none: ''

	}

	/**
	 * If background images have been specified, this property specifies their initial position (after any resizing) within their corresponding background positioning area.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position-y)
	 * 
	*/
	interface backgroundΞpositionΞy extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		/** Equivalent to '100%' for the vertical position if one or two values are given, otherwise specifies the bottom edge as the origin for the next offset. */
		bottom: ''

		/** Equivalent to '50%' ('left 50%') for the horizontal position if the horizontal position is not otherwise specified, or '50%' ('top 50%') for the vertical position if it is. */
		center: ''

		/** Equivalent to '0%' for the vertical position if one or two values are given, otherwise specifies the top edge as the origin for the next offset. */
		top: ''

	}

	/**
	 * Selects a normal, condensed, or expanded face from a font family.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch)
	 * 
	*/
	interface fontΞstretch extends _ {
		set(val: this): void;

		condensed: ''

		expanded: ''

		extraΞcondensed: ''

		extraΞexpanded: ''

		/** Indicates a narrower value relative to the width of the parent element. */
		narrower: ''

		normal: ''

		semiΞcondensed: ''

		semiΞexpanded: ''

		ultraΞcondensed: ''

		ultraΞexpanded: ''

		/** Indicates a wider value relative to the width of the parent element. */
		wider: ''

	}

	/**
	 * Specifies the shape to be used at the end of open subpaths when they are stroked.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-linecap)
	 * 
	*/
	interface strokeΞlinecap extends _ {
		set(val: this): void;

		/** Indicates that the stroke for each subpath does not extend beyond its two endpoints. */
		butt: ''

		/** Indicates that at each end of each subpath, the shape representing the stroke will be extended by a half circle with a radius equal to the stroke width. */
		round: ''

		/** Indicates that at the end of each subpath, the shape representing the stroke will be extended by a rectangle with the same width as the stroke width and whose length is half of the stroke width. */
		square: ''

	}

	/**
	 * Determines the alignment of the replaced element inside its box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position)
	 * 
	*/
	interface objectΞposition extends _ {
		set(val: Ψposition | Ψlength | Ψpercentage): void;

	}

	/**
	 * Property accepts one or more names of counters (identifiers), each one optionally followed by an integer. The integer gives the value that the counter is set to on each occurrence of the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-reset)
	 * 
	*/
	interface counterΞreset extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The counter is not modified. */
		none: ''

	}

	/**
	 * Logical 'margin-top'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block-start)
	 * 
	*/
	interface marginΞblockΞstart extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/**
	 * Manipulate the value of existing counters.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-increment)
	 * 
	*/
	interface counterΞincrement extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** This element does not alter the value of any counters. */
		none: ''

	}

	/**
	 * undefined
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/size)
	 * 
	*/
	interface size extends _ {
		set(val: Ψlength): void;

	}

	/**
	 * Specifies the color of text decoration (underlines overlines, and line-throughs) set on the element with text-decoration-line.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color)
	 * 
	 * @alias tdc
	*/
	interface textΞdecorationΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/** @proxy textΞdecorationΞcolor */
	interface tdc extends textΞdecorationΞcolor { }
	/**
	 * Sets the image that will be used as the list item marker. When the image is available, it will replace the marker set with the 'list-style-type' marker.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-image)
	 * 
	*/
	interface listΞstyleΞimage extends _ {
		set(val: this | Ψimage): void;

		/** The default contents of the of the list item’s marker are given by 'list-style-type' instead. */
		none: ''

	}

	/**
	 * Describes the optimal number of columns into which the content of the element will be flowed.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-count)
	 * 
	*/
	interface columnΞcount extends _ {
		set(val: this | Ψinteger): void;

		/** Determines the number of columns by the 'column-width' property and the element width. */
		auto: ''

	}

	/**
	 * Shorthand property for setting 'border-image-source', 'border-image-slice', 'border-image-width', 'border-image-outset' and 'border-image-repeat'. Omitted values are set to their initial values.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image)
	 * 
	*/
	interface borderΞimage extends _ {
		set(val: this | Ψlength | Ψpercentage | Ψnumber | Ψurl): void;

		/** If 'auto' is specified then the border image width is the intrinsic width or height (whichever is applicable) of the corresponding image slice. If the image does not have the required intrinsic dimension then the corresponding border-width is used instead. */
		auto: ''

		/** Causes the middle part of the border-image to be preserved. */
		fill: ''

		/** Use the border styles. */
		none: ''

		/** The image is tiled (repeated) to fill the area. */
		repeat: ''

		/** The image is tiled (repeated) to fill the area. If it does not fill the area with a whole number of tiles, the image is rescaled so that it does. */
		round: ''

		/** The image is tiled (repeated) to fill the area. If it does not fill the area with a whole number of tiles, the extra space is distributed around the tiles. */
		space: ''

		/** The image is stretched to fill the area. */
		stretch: ''

		url(): ''

	}

	/**
	 * Sets the gap between columns. If there is a column rule between columns, it will appear in the middle of the gap.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap)
	 * 
	 * @alias cg
	*/
	interface columnΞgap extends _ {
		set(val: this | Ψlength): void;

		/** User agent specific and typically equivalent to 1em. */
		normal: ''

	}

	/** @proxy columnΞgap */
	interface cg extends columnΞgap { }
	/**
	 * Defines rules for page breaks inside an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside)
	 * 
	*/
	interface pageΞbreakΞinside extends _ {
		set(val: this): void;

		/** Neither force nor forbid a page break inside the generated box. */
		auto: ''

		/** Avoid a page break inside the generated box. */
		avoid: ''

	}

	/**
	 * Specifies the opacity of the painting operation used to paint the interior the current object.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/fill-opacity)
	 * 
	*/
	interface fillΞopacity extends _ {
		set(val: Ψnumber): void;

	}

	/**
	 * Logical 'padding-left'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline-start)
	 * 
	*/
	interface paddingΞinlineΞstart extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * In the separated borders model, this property controls the rendering of borders and backgrounds around cells that have no visible content.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/empty-cells)
	 * 
	*/
	interface emptyΞcells extends _ {
		set(val: this): void;

		/** No borders or backgrounds are drawn around/behind empty cells. */
		hide: ''

		ΞmozΞshowΞbackground: ''

		/** Borders and backgrounds are drawn around/behind empty cells (like normal cells). */
		show: ''

	}

	/**
	 * Specifies control over which ligatures are enabled or disabled. A value of ‘normal’ implies that the defaults set by the font are used.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-ligatures)
	 * 
	*/
	interface fontΞvariantΞligatures extends _ {
		set(val: this): void;

		/** Enables display of additional ligatures. */
		additionalΞligatures: ''

		/** Enables display of common ligatures. */
		commonΞligatures: ''

		/** Enables display of contextual alternates. */
		contextual: ''

		/** Enables display of discretionary ligatures. */
		discretionaryΞligatures: ''

		/** Enables display of historical ligatures. */
		historicalΞligatures: ''

		/** Disables display of additional ligatures. */
		noΞadditionalΞligatures: ''

		/** Disables display of common ligatures. */
		noΞcommonΞligatures: ''

		/** Disables display of contextual alternates. */
		noΞcontextual: ''

		/** Disables display of discretionary ligatures. */
		noΞdiscretionaryΞligatures: ''

		/** Disables display of historical ligatures. */
		noΞhistoricalΞligatures: ''

		/** Disables all ligatures. */
		none: ''

		/** Implies that the defaults set by the font are used. */
		normal: ''

	}

	/**
	 * The text-decoration-skip CSS property specifies what parts of the element’s content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-skip)
	 * 
	*/
	interface textΞdecorationΞskip extends _ {
		set(val: any): void;

	}

	/**
	 * Defines the way of justifying a box inside its container along the appropriate axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self)
	 * 
	 * @alias js
	*/
	interface justifyΞself extends _ {
		set(val: this): void;

		auto: ''

		normal: ''

		end: ''

		start: ''

		/** "Flex items are packed toward the end of the line." */
		flexΞend: ''

		/** "Flex items are packed toward the start of the line." */
		flexΞstart: ''

		/** The item is packed flush to the edge of the alignment container of the end side of the item, in the appropriate axis. */
		selfΞend: ''

		/** The item is packed flush to the edge of the alignment container of the start side of the item, in the appropriate axis.. */
		selfΞstart: ''

		/** The items are packed flush to each other toward the center of the of the alignment container. */
		center: ''

		left: ''

		right: ''

		baseline: ''

		'first baseline': ''

		'last baseline': ''

		/** If the cross size property of the flex item computes to auto, and neither of the cross-axis margins are auto, the flex item is stretched. */
		stretch: ''

		save: ''

		unsave: ''

	}

	/** @proxy justifyΞself */
	interface js extends justifyΞself { }
	/**
	 * Defines rules for page breaks after an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-after)
	 * 
	*/
	interface pageΞbreakΞafter extends _ {
		set(val: this): void;

		/** Always force a page break after the generated box. */
		always: ''

		/** Neither force nor forbid a page break after generated box. */
		auto: ''

		/** Avoid a page break after the generated box. */
		avoid: ''

		/** Force one or two page breaks after the generated box so that the next page is formatted as a left page. */
		left: ''

		/** Force one or two page breaks after the generated box so that the next page is formatted as a right page. */
		right: ''

	}

	/**
	 * specifies, as a space-separated track list, the line names and track sizing functions of the grid.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
	 * 
	 * @alias gtr
	*/
	interface gridΞtemplateΞrows extends _ {
		set(val: this | Ψidentifier | Ψlength | Ψpercentage | Ψstring): void;

		/** There is no explicit grid; any rows/columns will be implicitly generated. */
		none: ''

		/** Represents the largest min-content contribution of the grid items occupying the grid track. */
		minΞcontent: ''

		/** Represents the largest max-content contribution of the grid items occupying the grid track. */
		maxΞcontent: ''

		/** As a maximum, identical to 'max-content'. As a minimum, represents the largest minimum size (as specified by min-width/min-height) of the grid items occupying the grid track. */
		auto: ''

		/** Indicates that the grid will align to its parent grid in that axis. */
		subgrid: ''

		/** Defines a size range greater than or equal to min and less than or equal to max. */
		minmax(): ''

		/** Represents a repeated fragment of the track list, allowing a large number of columns or rows that exhibit a recurring pattern to be written in a more compact form. */
		repeat(): ''

	}

	/** @proxy gridΞtemplateΞrows */
	interface gtr extends gridΞtemplateΞrows { }
	/**
	 * Logical 'padding-right'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline-end)
	 * 
	*/
	interface paddingΞinlineΞend extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * Shorthand that specifies the gutters between grid columns and grid rows in one declaration. Replaced by 'gap' property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-gap)
	 * 
	*/
	interface gridΞgap extends _ {
		set(val: Ψlength): void;

	}

	/**
	 * Shorthand that resets all properties except 'direction' and 'unicode-bidi'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/all)
	 * 
	*/
	interface all extends _ {
		set(val: this): void;

	}

	/**
	 * Shorthand for 'grid-column-start' and 'grid-column-end'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column)
	 * 
	 * @alias gc
	*/
	interface gridΞcolumn extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞcolumn */
	interface gc extends gridΞcolumn { }
	/**
	 * Specifies the opacity of the painting operation used to stroke the current object.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-opacity)
	 * 
	*/
	interface strokeΞopacity extends _ {
		set(val: Ψnumber): void;

	}

	/**
	 * Logical 'margin-left'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-start)
	 * 
	*/
	interface marginΞinlineΞstart extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/**
	 * Logical 'margin-right'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-end)
	 * 
	*/
	interface marginΞinlineΞend extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		auto: ''

	}

	/**
	 * Controls the color of the text insertion indicator.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/caret-color)
	 * 
	*/
	interface caretΞcolor extends _ {
		set(val: this | Ψcolor): void;

		/** The user agent selects an appropriate color for the caret. This is generally currentcolor, but the user agent may choose a different color to ensure good visibility and contrast with the surrounding content, taking into account the value of currentcolor, the background, shadows, and other factors. */
		auto: ''

	}

	/**
	 * Specifies the minimum number of line boxes in a block container that must be left in a fragment before a fragmentation break.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/orphans)
	 * 
	*/
	interface orphans extends _ {
		set(val: Ψinteger): void;

	}

	/**
	 * Specifies the position of the caption box with respect to the table box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side)
	 * 
	*/
	interface captionΞside extends _ {
		set(val: this): void;

		/** Positions the caption box below the table box. */
		bottom: ''

		/** Positions the caption box above the table box. */
		top: ''

	}

	/**
	 * Establishes the origin for the perspective property. It effectively sets the X and Y position at which the viewer appears to be looking at the children of the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin)
	 * 
	*/
	interface perspectiveΞorigin extends _ {
		set(val: Ψposition | Ψpercentage | Ψlength): void;

	}

	/**
	 * Indicates what color to use at that gradient stop.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stop-color)
	 * 
	*/
	interface stopΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Specifies the minimum number of line boxes of a block container that must be left in a fragment after a break.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/widows)
	 * 
	*/
	interface widows extends _ {
		set(val: Ψinteger): void;

	}

	/**
	 * Specifies the scrolling behavior for a scrolling box, when scrolling happens due to navigation or CSSOM scrolling APIs.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)
	 * 
	*/
	interface scrollΞbehavior extends _ {
		set(val: this): void;

		/** Scrolls in an instant fashion. */
		auto: ''

		/** Scrolls in a smooth fashion using a user-agent-defined timing function and time period. */
		smooth: ''

	}

	/**
	 * Specifies the gutters between grid columns. Replaced by 'column-gap' property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-gap)
	 * 
	 * @alias gcg
	*/
	interface gridΞcolumnΞgap extends _ {
		set(val: Ψlength): void;

	}

	/** @proxy gridΞcolumnΞgap */
	interface gcg extends gridΞcolumnΞgap { }
	/**
	 * A shorthand property which sets both 'column-width' and 'column-count'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/columns)
	 * 
	*/
	interface columns extends _ {
		set(val: this | Ψlength | Ψinteger): void;

		/** The width depends on the values of other properties. */
		auto: ''

	}

	/**
	 * Describes the width of columns in multicol elements.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-width)
	 * 
	*/
	interface columnΞwidth extends _ {
		set(val: this | Ψlength): void;

		/** The width depends on the values of other properties. */
		auto: ''

	}

	/**
	 * Defines the formula that must be used to mix the colors with the backdrop.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)
	 * 
	*/
	interface mixΞblendΞmode extends _ {
		set(val: this): void;

		/** Default attribute which specifies no blending */
		normal: ''

		/** The source color is multiplied by the destination color and replaces the destination. */
		multiply: ''

		/** Multiplies the complements of the backdrop and source color values, then complements the result. */
		screen: ''

		/** Multiplies or screens the colors, depending on the backdrop color value. */
		overlay: ''

		/** Selects the darker of the backdrop and source colors. */
		darken: ''

		/** Selects the lighter of the backdrop and source colors. */
		lighten: ''

		/** Brightens the backdrop color to reflect the source color. */
		colorΞdodge: ''

		/** Darkens the backdrop color to reflect the source color. */
		colorΞburn: ''

		/** Multiplies or screens the colors, depending on the source color value. */
		hardΞlight: ''

		/** Darkens or lightens the colors, depending on the source color value. */
		softΞlight: ''

		/** Subtracts the darker of the two constituent colors from the lighter color.. */
		difference: ''

		/** Produces an effect similar to that of the Difference mode but lower in contrast. */
		exclusion: ''

		/** Creates a color with the hue of the source color and the saturation and luminosity of the backdrop color. */
		hue: ''

		/** Creates a color with the saturation of the source color and the hue and luminosity of the backdrop color. */
		saturation: ''

		/** Creates a color with the hue and saturation of the source color and the luminosity of the backdrop color. */
		color: ''

		/** Creates a color with the luminosity of the source color and the hue and saturation of the backdrop color. */
		luminosity: ''

	}

	/**
	 * Kerning is the contextual adjustment of inter-glyph spacing. This property controls metric kerning, kerning that utilizes adjustment data contained in the font.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-kerning)
	 * 
	*/
	interface fontΞkerning extends _ {
		set(val: this): void;

		/** Specifies that kerning is applied at the discretion of the user agent. */
		auto: ''

		/** Specifies that kerning is not applied. */
		none: ''

		/** Specifies that kerning is applied. */
		normal: ''

	}

	/**
	 * Specifies inward offsets from the top, right, bottom, and left edges of the image, dividing it into nine regions: four corners, four edges and a middle.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-slice)
	 * 
	*/
	interface borderΞimageΞslice extends _ {
		set(val: this | Ψnumber | Ψpercentage): void;

		/** Causes the middle part of the border-image to be preserved. */
		fill: ''

	}

	/**
	 * Specifies how the images for the sides and the middle part of the border image are scaled and tiled. If the second keyword is absent, it is assumed to be the same as the first.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-repeat)
	 * 
	*/
	interface borderΞimageΞrepeat extends _ {
		set(val: this): void;

		/** The image is tiled (repeated) to fill the area. */
		repeat: ''

		/** The image is tiled (repeated) to fill the area. If it does not fill the area with a whole number of tiles, the image is rescaled so that it does. */
		round: ''

		/** The image is tiled (repeated) to fill the area. If it does not fill the area with a whole number of tiles, the extra space is distributed around the tiles. */
		space: ''

		/** The image is stretched to fill the area. */
		stretch: ''

	}

	/**
	 * The four values of 'border-image-width' specify offsets that are used to divide the border image area into nine parts. They represent inward distances from the top, right, bottom, and left sides of the area, respectively.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width)
	 * 
	*/
	interface borderΞimageΞwidth extends _ {
		set(val: this | Ψlength | Ψpercentage | Ψnumber): void;

		/** The border image width is the intrinsic width or height (whichever is applicable) of the corresponding image slice. If the image does not have the required intrinsic dimension then the corresponding border-width is used instead. */
		auto: ''

	}

	/**
	 * Shorthand for 'grid-row-start' and 'grid-row-end'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row)
	 * 
	 * @alias gr
	*/
	interface gridΞrow extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞrow */
	interface gr extends gridΞrow { }
	/**
	 * Determines the width of the tab character (U+0009), in space characters (U+0020), when rendered.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/tab-size)
	 * 
	*/
	interface tabΞsize extends _ {
		set(val: Ψinteger | Ψlength): void;

	}

	/**
	 * Specifies the gutters between grid rows. Replaced by 'row-gap' property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-gap)
	 * 
	 * @alias grg
	*/
	interface gridΞrowΞgap extends _ {
		set(val: Ψlength): void;

	}

	/** @proxy gridΞrowΞgap */
	interface grg extends gridΞrowΞgap { }
	/**
	 * Specifies the line style for underline, line-through and overline text decoration.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style)
	 * 
	 * @alias tds
	*/
	interface textΞdecorationΞstyle extends _ {
		set(val: this): void;

		/** Produces a dashed line style. */
		dashed: ''

		/** Produces a dotted line. */
		dotted: ''

		/** Produces a double line. */
		double: ''

		/** Produces no line. */
		none: ''

		/** Produces a solid line. */
		solid: ''

		/** Produces a wavy line. */
		wavy: ''

	}

	/** @proxy textΞdecorationΞstyle */
	interface tds extends textΞdecorationΞstyle { }
	/**
	 * Specifies what set of line breaking restrictions are in effect within the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/line-break)
	 * 
	*/
	interface lineΞbreak extends _ {
		set(val: this): void;

		/** The UA determines the set of line-breaking restrictions to use for CJK scripts, and it may vary the restrictions based on the length of the line; e.g., use a less restrictive set of line-break rules for short lines. */
		auto: ''

		/** Breaks text using the least restrictive set of line-breaking rules. Typically used for short lines, such as in newspapers. */
		loose: ''

		/** Breaks text using the most common set of line-breaking rules. */
		normal: ''

		/** Breaks CJK scripts using a more restrictive set of line-breaking rules than 'normal'. */
		strict: ''

	}

	/**
	 * The values specify the amount by which the border image area extends beyond the border box on the top, right, bottom, and left sides respectively. If the fourth value is absent, it is the same as the second. If the third one is also absent, it is the same as the first. If the second one is also absent, it is the same as the first. Numbers represent multiples of the corresponding border-width.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-outset)
	 * 
	*/
	interface borderΞimageΞoutset extends _ {
		set(val: Ψlength | Ψnumber): void;

	}

	/**
	 * Shorthand for setting 'column-rule-width', 'column-rule-style', and 'column-rule-color' at the same place in the style sheet. Omitted values are set to their initial values.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule)
	 * 
	*/
	interface columnΞrule extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/**
	 * Defines the default justify-self for all items of the box, giving them the default way of justifying each box along the appropriate axis
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items)
	 * 
	 * @alias ji
	*/
	interface justifyΞitems extends _ {
		set(val: this): void;

		auto: ''

		normal: ''

		end: ''

		start: ''

		/** "Flex items are packed toward the end of the line." */
		flexΞend: ''

		/** "Flex items are packed toward the start of the line." */
		flexΞstart: ''

		/** The item is packed flush to the edge of the alignment container of the end side of the item, in the appropriate axis. */
		selfΞend: ''

		/** The item is packed flush to the edge of the alignment container of the start side of the item, in the appropriate axis.. */
		selfΞstart: ''

		/** The items are packed flush to each other toward the center of the of the alignment container. */
		center: ''

		left: ''

		right: ''

		baseline: ''

		'first baseline': ''

		'last baseline': ''

		/** If the cross size property of the flex item computes to auto, and neither of the cross-axis margins are auto, the flex item is stretched. */
		stretch: ''

		save: ''

		unsave: ''

		legacy: ''

	}

	/** @proxy justifyΞitems */
	interface ji extends justifyΞitems { }
	/**
	 * Determine a grid item’s size and location within the grid by contributing a line, a span, or nothing (automatic) to its grid placement. Shorthand for 'grid-row-start', 'grid-column-start', 'grid-row-end', and 'grid-column-end'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)
	 * 
	 * @alias ga
	*/
	interface gridΞarea extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞarea */
	interface ga extends gridΞarea { }
	/**
	 * When two line segments meet at a sharp angle and miter joins have been specified for 'stroke-linejoin', it is possible for the miter to extend far beyond the thickness of the line stroking the path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-miterlimit)
	 * 
	*/
	interface strokeΞmiterlimit extends _ {
		set(val: Ψnumber): void;

	}

	/**
	 * Describes how the last line of a block or a line right before a forced line break is aligned when 'text-align' is set to 'justify'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align-last)
	 * 
	*/
	interface textΞalignΞlast extends _ {
		set(val: this): void;

		/** Content on the affected line is aligned per 'text-align' unless 'text-align' is set to 'justify', in which case it is 'start-aligned'. */
		auto: ''

		/** The inline contents are centered within the line box. */
		center: ''

		/** The text is justified according to the method specified by the 'text-justify' property. */
		justify: ''

		/** The inline contents are aligned to the left edge of the line box. In vertical text, 'left' aligns to the edge of the line box that would be the start edge for left-to-right text. */
		left: ''

		/** The inline contents are aligned to the right edge of the line box. In vertical text, 'right' aligns to the edge of the line box that would be the end edge for left-to-right text. */
		right: ''

	}

	/**
	 * The backdrop-filter CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything behind the element, to see the effect you must make the element or its background at least partially transparent.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
	 * 
	*/
	interface backdropΞfilter extends _ {
		set(val: any): void;

	}

	/**
	 * Specifies the size of implicitly created rows.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows)
	 * 
	 * @alias gar
	*/
	interface gridΞautoΞrows extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		/** Represents the largest min-content contribution of the grid items occupying the grid track. */
		minΞcontent: ''

		/** Represents the largest max-content contribution of the grid items occupying the grid track. */
		maxΞcontent: ''

		/** As a maximum, identical to 'max-content'. As a minimum, represents the largest minimum size (as specified by min-width/min-height) of the grid items occupying the grid track. */
		auto: ''

		/** Defines a size range greater than or equal to min and less than or equal to max. */
		minmax(): ''

	}

	/** @proxy gridΞautoΞrows */
	interface gar extends gridΞautoΞrows { }
	/**
	 * Specifies the shape to be used at the corners of paths or basic shapes when they are stroked.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-linejoin)
	 * 
	*/
	interface strokeΞlinejoin extends _ {
		set(val: this): void;

		/** Indicates that a bevelled corner is to be used to join path segments. */
		bevel: ''

		/** Indicates that a sharp corner is to be used to join path segments. */
		miter: ''

		/** Indicates that a round corner is to be used to join path segments. */
		round: ''

	}

	/**
	 * Specifies an orthogonal rotation to be applied to an image before it is laid out.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-outside)
	 * 
	*/
	interface shapeΞoutside extends _ {
		set(val: this | Ψimage | Ψbox | Ψshape): void;

		/** The background is painted within (clipped to) the margin box. */
		marginΞbox: ''

		/** The float area is unaffected. */
		none: ''

	}

	/**
	 * Specifies what line decorations, if any, are added to the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line)
	 * 
	 * @alias tdl
	*/
	interface textΞdecorationΞline extends _ {
		set(val: this): void;

		/** Each line of text has a line through the middle. */
		lineΞthrough: ''

		/** Neither produces nor inhibits text decoration. */
		none: ''

		/** Each line of text has a line above it. */
		overline: ''

		/** Each line of text is underlined. */
		underline: ''

	}

	/** @proxy textΞdecorationΞline */
	interface tdl extends textΞdecorationΞline { }
	/**
	 * The scroll-snap-align property specifies the box’s snap position as an alignment of its snap area (as the alignment subject) within its snap container’s snapport (as the alignment container). The two values specify the snapping alignment in the block axis and inline axis, respectively. If only one value is specified, the second value defaults to the same value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align)
	 * 
	*/
	interface scrollΞsnapΞalign extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * Indicates the algorithm (or winding rule) which is to be used to determine what parts of the canvas are included inside the shape.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/fill-rule)
	 * 
	*/
	interface fillΞrule extends _ {
		set(val: this): void;

		/** Determines the ‘insideness’ of a point on the canvas by drawing a ray from that point to infinity in any direction and counting the number of path segments from the given shape that the ray crosses. */
		evenodd: ''

		/** Determines the ‘insideness’ of a point on the canvas by drawing a ray from that point to infinity in any direction and then examining the places where a segment of the shape crosses the ray. */
		nonzero: ''

	}

	/**
	 * Controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow)
	 * 
	 * @alias gaf
	*/
	interface gridΞautoΞflow extends _ {
		set(val: this): void;

		/** The auto-placement algorithm places items by filling each row in turn, adding new rows as necessary. */
		row: ''

		/** The auto-placement algorithm places items by filling each column in turn, adding new columns as necessary. */
		column: ''

		/** If specified, the auto-placement algorithm uses a “dense” packing algorithm, which attempts to fill in holes earlier in the grid if smaller items come up later. */
		dense: ''

	}

	/** @proxy gridΞautoΞflow */
	interface gaf extends gridΞautoΞflow { }
	/**
	 * Defines how strictly snap points are enforced on the scroll container.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type)
	 * 
	*/
	interface scrollΞsnapΞtype extends _ {
		set(val: this): void;

		/** The visual viewport of this scroll container must ignore snap points, if any, when scrolled. */
		none: ''

		/** The visual viewport of this scroll container is guaranteed to rest on a snap point when there are no active scrolling operations. */
		mandatory: ''

		/** The visual viewport of this scroll container may come to rest on a snap point at the termination of a scroll at the discretion of the UA given the parameters of the scroll. */
		proximity: ''

	}

	/**
	 * Defines rules for page breaks before an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-before)
	 * 
	*/
	interface pageΞbreakΞbefore extends _ {
		set(val: this): void;

		/** Always force a page break before the generated box. */
		always: ''

		/** Neither force nor forbid a page break before the generated box. */
		auto: ''

		/** Avoid a page break before the generated box. */
		avoid: ''

		/** Force one or two page breaks before the generated box so that the next page is formatted as a left page. */
		left: ''

		/** Force one or two page breaks before the generated box so that the next page is formatted as a right page. */
		right: ''

	}

	/**
	 * Determine a grid item’s size and location within the grid by contributing a line, a span, or nothing (automatic) to its grid placement.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start)
	 * 
	 * @alias gcs
	*/
	interface gridΞcolumnΞstart extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞcolumnΞstart */
	interface gcs extends gridΞcolumnΞstart { }
	/**
	 * Specifies named grid areas, which are not associated with any particular grid item, but can be referenced from the grid-placement properties.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
	 * 
	 * @alias gta
	*/
	interface gridΞtemplateΞareas extends _ {
		set(val: this | Ψstring): void;

		/** The grid container doesn’t define any named grid areas. */
		none: ''

	}

	/** @proxy gridΞtemplateΞareas */
	interface gta extends gridΞtemplateΞareas { }
	/**
	 * Describes the page/column/region break behavior inside the principal box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside)
	 * 
	*/
	interface breakΞinside extends _ {
		set(val: this): void;

		/** Impose no additional breaking constraints within the box. */
		auto: ''

		/** Avoid breaks within the box. */
		avoid: ''

		/** Avoid a column break within the box. */
		avoidΞcolumn: ''

		/** Avoid a page break within the box. */
		avoidΞpage: ''

	}

	/**
	 * In continuous media, this property will only be consulted if the length of columns has been constrained. Otherwise, columns will automatically be balanced.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-fill)
	 * 
	*/
	interface columnΞfill extends _ {
		set(val: this): void;

		/** Fills columns sequentially. */
		auto: ''

		/** Balance content equally between columns, if possible. */
		balance: ''

	}

	/**
	 * Determine a grid item’s size and location within the grid by contributing a line, a span, or nothing (automatic) to its grid placement.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end)
	 * 
	 * @alias gce
	*/
	interface gridΞcolumnΞend extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞcolumnΞend */
	interface gce extends gridΞcolumnΞend { }
	/**
	 * Specifies an image to use instead of the border styles given by the 'border-style' properties and as an additional background layer for the element. If the value is 'none' or if the image cannot be displayed, the border styles will be used.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source)
	 * 
	*/
	interface borderΞimageΞsource extends _ {
		set(val: this | Ψimage): void;

		/** Use the border styles. */
		none: ''

	}

	/**
	 * The overflow-anchor CSS property provides a way to opt out browser scroll anchoring behavior which adjusts scroll position to minimize content shifts.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor)
	 * 
	 * @alias ofa
	*/
	interface overflowΞanchor extends _ {
		set(val: any): void;

	}

	/** @proxy overflowΞanchor */
	interface ofa extends overflowΞanchor { }
	/**
	 * Determine a grid item’s size and location within the grid by contributing a line, a span, or nothing (automatic) to its grid placement.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start)
	 * 
	 * @alias grs
	*/
	interface gridΞrowΞstart extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞrowΞstart */
	interface grs extends gridΞrowΞstart { }
	/**
	 * Determine a grid item’s size and location within the grid by contributing a line, a span, or nothing (automatic) to its grid placement.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end)
	 * 
	 * @alias gre
	*/
	interface gridΞrowΞend extends _ {
		set(val: this | Ψidentifier | Ψinteger): void;

		/** The property contributes nothing to the grid item’s placement, indicating auto-placement, an automatic span, or a default span of one. */
		auto: ''

		/** Contributes a grid span to the grid item’s placement such that the corresponding edge of the grid item’s grid area is N lines from its opposite edge. */
		span: ''

	}

	/** @proxy gridΞrowΞend */
	interface gre extends gridΞrowΞend { }
	/**
	 * Specifies control over numerical forms.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)
	 * 
	*/
	interface fontΞvariantΞnumeric extends _ {
		set(val: this): void;

		/** Enables display of lining diagonal fractions. */
		diagonalΞfractions: ''

		/** Enables display of lining numerals. */
		liningΞnums: ''

		/** None of the features are enabled. */
		normal: ''

		/** Enables display of old-style numerals. */
		oldstyleΞnums: ''

		/** Enables display of letter forms used with ordinal numbers. */
		ordinal: ''

		/** Enables display of proportional numerals. */
		proportionalΞnums: ''

		/** Enables display of slashed zeros. */
		slashedΞzero: ''

		/** Enables display of lining stacked fractions. */
		stackedΞfractions: ''

		/** Enables display of tabular numerals. */
		tabularΞnums: ''

	}

	/**
	 * Defines the blending mode of each background layer.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode)
	 * 
	*/
	interface backgroundΞblendΞmode extends _ {
		set(val: this): void;

		/** Default attribute which specifies no blending */
		normal: ''

		/** The source color is multiplied by the destination color and replaces the destination. */
		multiply: ''

		/** Multiplies the complements of the backdrop and source color values, then complements the result. */
		screen: ''

		/** Multiplies or screens the colors, depending on the backdrop color value. */
		overlay: ''

		/** Selects the darker of the backdrop and source colors. */
		darken: ''

		/** Selects the lighter of the backdrop and source colors. */
		lighten: ''

		/** Brightens the backdrop color to reflect the source color. */
		colorΞdodge: ''

		/** Darkens the backdrop color to reflect the source color. */
		colorΞburn: ''

		/** Multiplies or screens the colors, depending on the source color value. */
		hardΞlight: ''

		/** Darkens or lightens the colors, depending on the source color value. */
		softΞlight: ''

		/** Subtracts the darker of the two constituent colors from the lighter color.. */
		difference: ''

		/** Produces an effect similar to that of the Difference mode but lower in contrast. */
		exclusion: ''

		/** Creates a color with the hue of the source color and the saturation and luminosity of the backdrop color. */
		hue: ''

		/** Creates a color with the saturation of the source color and the hue and luminosity of the backdrop color. */
		saturation: ''

		/** Creates a color with the hue and saturation of the source color and the luminosity of the backdrop color. */
		color: ''

		/** Creates a color with the luminosity of the source color and the hue and saturation of the backdrop color. */
		luminosity: ''

	}

	/**
	 * The text-decoration-skip-ink CSS property specifies how overlines and underlines are drawn when they pass over glyph ascenders and descenders.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-skip-ink)
	 * 
	 * @alias tdsi
	*/
	interface textΞdecorationΞskipΞink extends _ {
		set(val: any): void;

	}

	/** @proxy textΞdecorationΞskipΞink */
	interface tdsi extends textΞdecorationΞskipΞink { }
	/**
	 * Sets the color of the column rule
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-color)
	 * 
	*/
	interface columnΞruleΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * In CSS setting to 'isolate' will turn the element into a stacking context. In SVG, it defines whether an element is isolated or not.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/isolation)
	 * 
	*/
	interface isolation extends _ {
		set(val: this): void;

		/** Elements are not isolated unless an operation is applied that causes the creation of a stacking context. */
		auto: ''

		/** In CSS will turn the element into a stacking context. */
		isolate: ''

	}

	/**
	 * Provides hints about what tradeoffs to make as it renders vector graphics elements such as <path> elements and basic shapes such as circles and rectangles.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-rendering)
	 * 
	*/
	interface shapeΞrendering extends _ {
		set(val: this): void;

		/** Suppresses aural rendering. */
		auto: ''

		/** Emphasize the contrast between clean edges of artwork over rendering speed and geometric precision. */
		crispEdges: ''

		/** Emphasize geometric precision over speed and crisp edges. */
		geometricPrecision: ''

		/** Emphasize rendering speed over geometric precision and crisp edges. */
		optimizeSpeed: ''

	}

	/**
	 * Sets the style of the rule between columns of an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-style)
	 * 
	*/
	interface columnΞruleΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/**
	 * Logical 'border-right-width'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-width)
	 * 
	*/
	interface borderΞinlineΞendΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/**
	 * Logical 'border-left-width'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-width)
	 * 
	*/
	interface borderΞinlineΞstartΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/**
	 * Specifies the size of implicitly created columns.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns)
	 * 
	 * @alias gac
	*/
	interface gridΞautoΞcolumns extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		/** Represents the largest min-content contribution of the grid items occupying the grid track. */
		minΞcontent: ''

		/** Represents the largest max-content contribution of the grid items occupying the grid track. */
		maxΞcontent: ''

		/** As a maximum, identical to 'max-content'. As a minimum, represents the largest minimum size (as specified by min-width/min-height) of the grid items occupying the grid track. */
		auto: ''

		/** Defines a size range greater than or equal to min and less than or equal to max. */
		minmax(): ''

	}

	/** @proxy gridΞautoΞcolumns */
	interface gac extends gridΞautoΞcolumns { }
	/**
	 * This is a shorthand property for both 'direction' and 'block-progression'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode)
	 * 
	*/
	interface writingΞmode extends _ {
		set(val: this): void;

		/** Top-to-bottom block flow direction. The writing mode is horizontal. */
		horizontalΞtb: ''

		/** Left-to-right block flow direction. The writing mode is vertical, while the typographic mode is horizontal. */
		sidewaysΞlr: ''

		/** Right-to-left block flow direction. The writing mode is vertical, while the typographic mode is horizontal. */
		sidewaysΞrl: ''

		/** Left-to-right block flow direction. The writing mode is vertical. */
		verticalΞlr: ''

		/** Right-to-left block flow direction. The writing mode is vertical. */
		verticalΞrl: ''

	}

	/**
	 * Indicates the algorithm which is to be used to determine what parts of the canvas are included inside the shape.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-rule)
	 * 
	*/
	interface clipΞrule extends _ {
		set(val: this): void;

		/** Determines the ‘insideness’ of a point on the canvas by drawing a ray from that point to infinity in any direction and counting the number of path segments from the given shape that the ray crosses. */
		evenodd: ''

		/** Determines the ‘insideness’ of a point on the canvas by drawing a ray from that point to infinity in any direction and then examining the places where a segment of the shape crosses the ray. */
		nonzero: ''

	}

	/**
	 * Specifies control over capitalized forms.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-caps)
	 * 
	*/
	interface fontΞvariantΞcaps extends _ {
		set(val: this): void;

		/** Enables display of petite capitals for both upper and lowercase letters. */
		allΞpetiteΞcaps: ''

		/** Enables display of small capitals for both upper and lowercase letters. */
		allΞsmallΞcaps: ''

		/** None of the features are enabled. */
		normal: ''

		/** Enables display of petite capitals. */
		petiteΞcaps: ''

		/** Enables display of small capitals. Small-caps glyphs typically use the form of uppercase letters but are reduced to the size of lowercase letters. */
		smallΞcaps: ''

		/** Enables display of titling capitals. */
		titlingΞcaps: ''

		/** Enables display of mixture of small capitals for uppercase letters with normal lowercase letters. */
		unicase: ''

	}

	/**
	 * Used to align (start-, middle- or end-alignment) a string of text relative to a given point.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-anchor)
	 * 
	*/
	interface textΞanchor extends _ {
		set(val: this): void;

		/** The rendered characters are aligned such that the end of the resulting rendered text is at the initial current text position. */
		end: ''

		/** The rendered characters are aligned such that the geometric middle of the resulting rendered text is at the initial current text position. */
		middle: ''

		/** The rendered characters are aligned such that the start of the resulting rendered text is at the initial current text position. */
		start: ''

	}

	/**
	 * Defines the opacity of a given gradient stop.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/stop-opacity)
	 * 
	*/
	interface stopΞopacity extends _ {
		set(val: Ψnumber): void;

	}

	/**
	 * The mask CSS property alters the visibility of an element by either partially or fully hiding it. This is accomplished by either masking or clipping the image at specific points.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask)
	 * 
	*/
	interface mask extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Describes the page/column break behavior after the generated box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-span)
	 * 
	*/
	interface columnΞspan extends _ {
		set(val: this): void;

		/** The element spans across all columns. Content in the normal flow that appears before the element is automatically balanced across all columns before the element appear. */
		all: ''

		/** The element does not span multiple columns. */
		none: ''

	}

	/**
	 * Allows control of glyph substitute and positioning in East Asian text.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-east-asian)
	 * 
	*/
	interface fontΞvariantΞeastΞasian extends _ {
		set(val: this): void;

		/** Enables rendering of full-width variants. */
		fullΞwidth: ''

		/** Enables rendering of JIS04 forms. */
		jis04: ''

		/** Enables rendering of JIS78 forms. */
		jis78: ''

		/** Enables rendering of JIS83 forms. */
		jis83: ''

		/** Enables rendering of JIS90 forms. */
		jis90: ''

		/** None of the features are enabled. */
		normal: ''

		/** Enables rendering of proportionally-spaced variants. */
		proportionalΞwidth: ''

		/** Enables display of ruby variant glyphs. */
		ruby: ''

		/** Enables rendering of simplified forms. */
		simplified: ''

		/** Enables rendering of traditional forms. */
		traditional: ''

	}

	/**
	 * Sets the position of an underline specified on the same element: it does not affect underlines specified by ancestor elements. This property is typically used in vertical writing contexts such as in Japanese documents where it often desired to have the underline appear 'over' (to the right of) the affected run of text
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-position)
	 * 
	*/
	interface textΞunderlineΞposition extends _ {
		set(val: this): void;

		above: ''

		/** The user agent may use any algorithm to determine the underline’s position. In horizontal line layout, the underline should be aligned as for alphabetic. In vertical line layout, if the language is set to Japanese or Korean, the underline should be aligned as for over. */
		auto: ''

		/** The underline is aligned with the under edge of the element’s content box. */
		below: ''

	}

	/**
	 * Describes the page/column/region break behavior after the generated box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after)
	 * 
	*/
	interface breakΞafter extends _ {
		set(val: this): void;

		/** Always force a page break before/after the generated box. */
		always: ''

		/** Neither force nor forbid a page/column break before/after the principal box. */
		auto: ''

		/** Avoid a break before/after the principal box. */
		avoid: ''

		/** Avoid a column break before/after the principal box. */
		avoidΞcolumn: ''

		/** Avoid a page break before/after the principal box. */
		avoidΞpage: ''

		/** Always force a column break before/after the principal box. */
		column: ''

		/** Force one or two page breaks before/after the generated box so that the next page is formatted as a left page. */
		left: ''

		/** Always force a page break before/after the principal box. */
		page: ''

		/** Force one or two page breaks before/after the generated box so that the next page is formatted as a right page. */
		right: ''

	}

	/**
	 * Describes the page/column/region break behavior before the generated box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before)
	 * 
	*/
	interface breakΞbefore extends _ {
		set(val: this): void;

		/** Always force a page break before/after the generated box. */
		always: ''

		/** Neither force nor forbid a page/column break before/after the principal box. */
		auto: ''

		/** Avoid a break before/after the principal box. */
		avoid: ''

		/** Avoid a column break before/after the principal box. */
		avoidΞcolumn: ''

		/** Avoid a page break before/after the principal box. */
		avoidΞpage: ''

		/** Always force a column break before/after the principal box. */
		column: ''

		/** Force one or two page breaks before/after the generated box so that the next page is formatted as a left page. */
		left: ''

		/** Always force a page break before/after the principal box. */
		page: ''

		/** Force one or two page breaks before/after the generated box so that the next page is formatted as a right page. */
		right: ''

	}

	/**
	 * Defines whether the content of the <mask> element is treated as as luminance mask or alpha mask.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-type)
	 * 
	*/
	interface maskΞtype extends _ {
		set(val: this): void;

		/** Indicates that the alpha values of the mask should be used. */
		alpha: ''

		/** Indicates that the luminance values of the mask should be used. */
		luminance: ''

	}

	/**
	 * Sets the width of the rule between columns. Negative values are not allowed.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-width)
	 * 
	*/
	interface columnΞruleΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/**
	 * The row-gap CSS property specifies the gutter between grid rows.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/row-gap)
	 * 
	 * @alias rg
	*/
	interface rowΞgap extends _ {
		set(val: any): void;

	}

	/** @proxy rowΞgap */
	interface rg extends rowΞgap { }
	/**
	 * Specifies the orientation of text within a line.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-orientation)
	 * 
	*/
	interface textΞorientation extends _ {
		set(val: this): void;

		/** This value is equivalent to 'sideways-right' in 'vertical-rl' writing mode and equivalent to 'sideways-left' in 'vertical-lr' writing mode. */
		sideways: ''

		/** In vertical writing modes, this causes text to be set as if in a horizontal layout, but rotated 90° clockwise. */
		sidewaysΞright: ''

		/** In vertical writing modes, characters from horizontal-only scripts are rendered upright, i.e. in their standard horizontal orientation. */
		upright: ''

	}

	/**
	 * The scroll-padding property is a shorthand property which sets all of the scroll-padding longhands, assigning values much like the padding property does for the padding-* longhands.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding)
	 * 
	*/
	interface scrollΞpadding extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Shorthand for setting grid-template-columns, grid-template-rows, and grid-template-areas in a single declaration.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template)
	 * 
	 * @alias gt
	*/
	interface gridΞtemplate extends _ {
		set(val: this | Ψidentifier | Ψlength | Ψpercentage | Ψstring): void;

		/** Sets all three properties to their initial values. */
		none: ''

		/** Represents the largest min-content contribution of the grid items occupying the grid track. */
		minΞcontent: ''

		/** Represents the largest max-content contribution of the grid items occupying the grid track. */
		maxΞcontent: ''

		/** As a maximum, identical to 'max-content'. As a minimum, represents the largest minimum size (as specified by min-width/min-height) of the grid items occupying the grid track. */
		auto: ''

		/** Sets 'grid-template-rows' and 'grid-template-columns' to 'subgrid', and 'grid-template-areas' to its initial value. */
		subgrid: ''

		/** Defines a size range greater than or equal to min and less than or equal to max. */
		minmax(): ''

		/** Represents a repeated fragment of the track list, allowing a large number of columns or rows that exhibit a recurring pattern to be written in a more compact form. */
		repeat(): ''

	}

	/** @proxy gridΞtemplate */
	interface gt extends gridΞtemplate { }
	/**
	 * Logical 'border-right-color'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-color)
	 * 
	*/
	interface borderΞinlineΞendΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Logical 'border-left-color'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-color)
	 * 
	*/
	interface borderΞinlineΞstartΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * The scroll-snap-stop CSS property defines whether the scroll container is allowed to "pass over" possible snap positions.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-stop)
	 * 
	*/
	interface scrollΞsnapΞstop extends _ {
		set(val: any): void;

	}

	/**
	 * Adds a margin to a 'shape-outside'. This defines a new shape that is the smallest contour that includes all the points that are the 'shape-margin' distance outward in the perpendicular direction from a point on the underlying shape.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-margin)
	 * 
	*/
	interface shapeΞmargin extends _ {
		set(val: Ψurl | Ψlength | Ψpercentage): void;

	}

	/**
	 * Defines the alpha channel threshold used to extract the shape using an image. A value of 0.5 means that the shape will enclose all the pixels that are more than 50% opaque.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-image-threshold)
	 * 
	*/
	interface shapeΞimageΞthreshold extends _ {
		set(val: Ψnumber): void;

	}

	/**
	 * The gap CSS property is a shorthand property for row-gap and column-gap specifying the gutters between grid rows and columns.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/gap)
	 * 
	 * @alias g
	*/
	interface gap extends _ {
		set(val: any): void;

	}

	/** @proxy gap */
	interface g extends gap { }
	/**
	 * Logical 'min-height'. Mapping depends on the element’s 'writing-mode'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/min-inline-size)
	 * 
	*/
	interface minΞinlineΞsize extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * Specifies an orthogonal rotation to be applied to an image before it is laid out.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/image-orientation)
	 * 
	*/
	interface imageΞorientation extends _ {
		set(val: this | Ψangle): void;

		/** After rotating by the precededing angle, the image is flipped horizontally. Defaults to 0deg if the angle is ommitted. */
		flip: ''

		/** If the image has an orientation specified in its metadata, such as EXIF, this value computes to the angle that the metadata specifies is necessary to correctly orient the image. */
		fromΞimage: ''

	}

	/**
	 * Logical 'height'. Mapping depends on the element’s 'writing-mode'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inline-size)
	 * 
	*/
	interface inlineΞsize extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** Depends on the values of other properties. */
		auto: ''

	}

	/**
	 * Logical 'padding-top'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block-start)
	 * 
	*/
	interface paddingΞblockΞstart extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * Logical 'padding-bottom'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block-end)
	 * 
	*/
	interface paddingΞblockΞend extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * The text-combine-upright CSS property specifies the combination of multiple characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.

This is used to produce an effect that is known as tate-chū-yoko (縦中横) in Japanese, or as 直書橫向 in Chinese.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-combine-upright)
	 * 
	*/
	interface textΞcombineΞupright extends _ {
		set(val: any): void;

	}

	/**
	 * Logical 'width'. Mapping depends on the element’s 'writing-mode'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/block-size)
	 * 
	*/
	interface blockΞsize extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** Depends on the values of other properties. */
		auto: ''

	}

	/**
	 * Logical 'min-width'. Mapping depends on the element’s 'writing-mode'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/min-block-size)
	 * 
	*/
	interface minΞblockΞsize extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * The scroll-padding-top property defines offsets for the top of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top)
	 * 
	*/
	interface scrollΞpaddingΞtop extends _ {
		set(val: any): void;

	}

	/**
	 * Logical 'border-right-style'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-style)
	 * 
	*/
	interface borderΞinlineΞendΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/**
	 * Logical 'border-top-width'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-width)
	 * 
	*/
	interface borderΞblockΞstartΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/**
	 * Logical 'border-bottom-width'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-width)
	 * 
	*/
	interface borderΞblockΞendΞwidth extends _ {
		set(val: Ψlength | ΨlineΞwidth): void;

	}

	/**
	 * Logical 'border-bottom-color'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-color)
	 * 
	*/
	interface borderΞblockΞendΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Logical 'border-left-style'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-style)
	 * 
	*/
	interface borderΞinlineΞstartΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/**
	 * Logical 'border-top-color'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-color)
	 * 
	*/
	interface borderΞblockΞstartΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Logical 'border-bottom-style'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-style)
	 * 
	*/
	interface borderΞblockΞendΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/**
	 * Logical 'border-top-style'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-style)
	 * 
	*/
	interface borderΞblockΞstartΞstyle extends _ {
		set(val: ΨlineΞstyle): void;

	}

	/**
	 * The font-variation-settings CSS property provides low-level control over OpenType or TrueType font variations, by specifying the four letter axis names of the features you want to vary, along with their variation values.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings)
	 * 
	*/
	interface fontΞvariationΞsettings extends _ {
		set(val: any): void;

	}

	/**
	 * Controls the order that the three paint operations that shapes and text are rendered with: their fill, their stroke and any markers they might have.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order)
	 * 
	*/
	interface paintΞorder extends _ {
		set(val: this): void;

		fill: ''

		markers: ''

		/** The element is painted with the standard order of painting operations: the 'fill' is painted first, then its 'stroke' and finally its markers. */
		normal: ''

		stroke: ''

	}

	/**
	 * Specifies the color space for imaging operations performed via filter effects.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-filters)
	 * 
	*/
	interface colorΞinterpolationΞfilters extends _ {
		set(val: this): void;

		/** Color operations are not required to occur in a particular color space. */
		auto: ''

		/** Color operations should occur in the linearized RGB color space. */
		linearRGB: ''

		/** Color operations should occur in the sRGB color space. */
		sRGB: ''

	}

	/**
	 * Specifies the marker that will be drawn at the last vertices of the given markable element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/marker-end)
	 * 
	*/
	interface markerΞend extends _ {
		set(val: this | Ψurl): void;

		/** Indicates that no marker symbol will be drawn at the given vertex or vertices. */
		none: ''

		/** Indicates that the <marker> element referenced will be used. */
		url(): ''

	}

	/**
	 * The scroll-padding-left property defines offsets for the left of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-left)
	 * 
	*/
	interface scrollΞpaddingΞleft extends _ {
		set(val: any): void;

	}

	/**
	 * Indicates what color to use to flood the current filter primitive subregion.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flood-color)
	 * 
	*/
	interface floodΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Indicates what opacity to use to flood the current filter primitive subregion.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/flood-opacity)
	 * 
	*/
	interface floodΞopacity extends _ {
		set(val: Ψnumber | Ψpercentage): void;

	}

	/**
	 * Defines the color of the light source for filter primitives 'feDiffuseLighting' and 'feSpecularLighting'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/lighting-color)
	 * 
	*/
	interface lightingΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Specifies the marker that will be drawn at the first vertices of the given markable element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/marker-start)
	 * 
	*/
	interface markerΞstart extends _ {
		set(val: this | Ψurl): void;

		/** Indicates that no marker symbol will be drawn at the given vertex or vertices. */
		none: ''

		/** Indicates that the <marker> element referenced will be used. */
		url(): ''

	}

	/**
	 * Specifies the marker that will be drawn at all vertices except the first and last.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/marker-mid)
	 * 
	*/
	interface markerΞmid extends _ {
		set(val: this | Ψurl): void;

		/** Indicates that no marker symbol will be drawn at the given vertex or vertices. */
		none: ''

		/** Indicates that the <marker> element referenced will be used. */
		url(): ''

	}

	/**
	 * Specifies the marker symbol that shall be used for all points on the sets the value for all vertices on the given ‘path’ element or basic shape.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/marker)
	 * 
	*/
	interface marker extends _ {
		set(val: this | Ψurl): void;

		/** Indicates that no marker symbol will be drawn at the given vertex or vertices. */
		none: ''

		/** Indicates that the <marker> element referenced will be used. */
		url(): ''

	}

	/**
	 * The place-content CSS shorthand property sets both the align-content and justify-content properties.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/place-content)
	 * 
	*/
	interface placeΞcontent extends _ {
		set(val: any): void;

	}

	/**
	 * The offset-path CSS property specifies the offset path where the element gets positioned. The exact element’s position on the offset path is determined by the offset-distance property. An offset path is either a specified path with one or multiple sub-paths or the geometry of a not-styled basic shape. Each shape or path must define an initial position for the computed value of "0" for offset-distance and an initial direction which specifies the rotation of the object to the initial position.

In this specification, a direction (or rotation) of 0 degrees is equivalent to the direction of the positive x-axis in the object’s local coordinate system. In other words, a rotation of 0 degree points to the right side of the UA if the object and its ancestors have no transformation applied.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path)
	 * 
	*/
	interface offsetΞpath extends _ {
		set(val: any): void;

	}

	/**
	 * The offset-rotate CSS property defines the direction of the element while positioning along the offset path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-rotate)
	 * 
	*/
	interface offsetΞrotate extends _ {
		set(val: any): void;

	}

	/**
	 * The offset-distance CSS property specifies a position along an offset-path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-distance)
	 * 
	*/
	interface offsetΞdistance extends _ {
		set(val: any): void;

	}

	/**
	 * The transform-box CSS property defines the layout box to which the transform and transform-origin properties relate.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box)
	 * 
	*/
	interface transformΞbox extends _ {
		set(val: any): void;

	}

	/**
	 * The CSS place-items shorthand property sets both the align-items and justify-items properties. The first value is the align-items property value, the second the justify-items one. If the second value is not present, the first value is also used for it.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/place-items)
	 * 
	*/
	interface placeΞitems extends _ {
		set(val: any): void;

	}

	/**
	 * Logical 'max-height'. Mapping depends on the element’s 'writing-mode'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/max-inline-size)
	 * 
	*/
	interface maxΞinlineΞsize extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** No limit on the height of the box. */
		none: ''

	}

	/**
	 * Logical 'max-width'. Mapping depends on the element’s 'writing-mode'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/max-block-size)
	 * 
	*/
	interface maxΞblockΞsize extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** No limit on the width of the box. */
		none: ''

	}

	/**
	 * Used by the parent of elements with display: ruby-text to control the position of the ruby text with respect to its base.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-position)
	 * 
	*/
	interface rubyΞposition extends _ {
		set(val: this): void;

		/** The ruby text appears after the base. This is a relatively rare setting used in ideographic East Asian writing systems, most easily found in educational text. */
		after: ''

		/** The ruby text appears before the base. This is the most common setting used in ideographic East Asian writing systems. */
		before: ''

		inline: ''

		/** The ruby text appears on the right of the base. Unlike 'before' and 'after', this value is not relative to the text flow direction. */
		right: ''

	}

	/**
	 * The scroll-padding-right property defines offsets for the right of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-right)
	 * 
	*/
	interface scrollΞpaddingΞright extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-padding-bottom property defines offsets for the bottom of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-bottom)
	 * 
	*/
	interface scrollΞpaddingΞbottom extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-padding-inline-start property defines offsets for the start edge in the inline dimension of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-inline-start)
	 * 
	*/
	interface scrollΞpaddingΞinlineΞstart extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-padding-block-start property defines offsets for the start edge in the block dimension of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-block-start)
	 * 
	*/
	interface scrollΞpaddingΞblockΞstart extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-padding-block-end property defines offsets for the end edge in the block dimension of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-block-end)
	 * 
	*/
	interface scrollΞpaddingΞblockΞend extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-padding-inline-end property defines offsets for the end edge in the inline dimension of the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or simply to put more breathing room between a targeted element and the edges of the scrollport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-inline-end)
	 * 
	*/
	interface scrollΞpaddingΞinlineΞend extends _ {
		set(val: any): void;

	}

	/**
	 * The place-self CSS property is a shorthand property sets both the align-self and justify-self properties. The first value is the align-self property value, the second the justify-self one. If the second value is not present, the first value is also used for it.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/place-self)
	 * 
	*/
	interface placeΞself extends _ {
		set(val: any): void;

	}

	/**
	 * The font-optical-sizing CSS property allows developers to control whether browsers render text with slightly differing visual representations to optimize viewing at different sizes, or not. This only works for fonts that have an optical size variation axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-optical-sizing)
	 * 
	*/
	interface fontΞopticalΞsizing extends _ {
		set(val: any): void;

	}

	/**
	 * The grid CSS property is a shorthand property that sets all of the explicit grid properties ('grid-template-rows', 'grid-template-columns', and 'grid-template-areas'), and all the implicit grid properties ('grid-auto-rows', 'grid-auto-columns', and 'grid-auto-flow'), in a single declaration.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/grid)
	 * 
	*/
	interface grid extends _ {
		set(val: Ψidentifier | Ψlength | Ψpercentage | Ψstring | this): void;

	}

	/**
	 * Logical 'border-left'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start)
	 * 
	*/
	interface borderΞinlineΞstart extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/**
	 * Logical 'border-right'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end)
	 * 
	*/
	interface borderΞinlineΞend extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/**
	 * Logical 'border-bottom'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end)
	 * 
	*/
	interface borderΞblockΞend extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/**
	 * The offset CSS property is a shorthand property for animating an element along a defined path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset)
	 * 
	*/
	interface offset extends _ {
		set(val: any): void;

	}

	/**
	 * Logical 'border-top'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start)
	 * 
	*/
	interface borderΞblockΞstart extends _ {
		set(val: Ψlength | ΨlineΞwidth | ΨlineΞstyle | Ψcolor): void;

	}

	/**
	 * The scroll-padding-block property is a shorthand property which sets the scroll-padding longhands for the block dimension.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-block)
	 * 
	*/
	interface scrollΞpaddingΞblock extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The scroll-padding-inline property is a shorthand property which sets the scroll-padding longhands for the inline dimension.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-inline)
	 * 
	*/
	interface scrollΞpaddingΞinline extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The overscroll-behavior-block CSS property sets the browser's behavior when the block direction boundary of a scrolling area is reached.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-block)
	 * 
	*/
	interface overscrollΞbehaviorΞblock extends _ {
		set(val: any): void;

	}

	/**
	 * The overscroll-behavior-inline CSS property sets the browser's behavior when the inline direction boundary of a scrolling area is reached.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-inline)
	 * 
	*/
	interface overscrollΞbehaviorΞinline extends _ {
		set(val: any): void;

	}

	/**
	 * Shorthand property for setting 'motion-path', 'motion-offset' and 'motion-rotation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/motion)
	 * 
	*/
	interface motion extends _ {
		set(val: this | Ψurl | Ψlength | Ψpercentage | Ψangle | Ψshape | ΨgeometryΞbox): void;

		/** No motion path gets created. */
		none: ''

		/** Defines an SVG path as a string, with optional 'fill-rule' as the first argument. */
		path(): ''

		/** Indicates that the object is rotated by the angle of the direction of the motion path. */
		auto: ''

		/** Indicates that the object is rotated by the angle of the direction of the motion path plus 180 degrees. */
		reverse: ''

	}

	/**
	 * Preserves the readability of text when font fallback occurs by adjusting the font-size so that the x-height is the same regardless of the font used.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust)
	 * 
	*/
	interface fontΞsizeΞadjust extends _ {
		set(val: this | Ψnumber): void;

		/** Do not preserve the font’s x-height. */
		none: ''

	}

	/**
	 * The inset CSS property defines the logical block and inline start and end offsets of an element, which map to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the top and bottom, or right and left properties depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset)
	 * 
	*/
	interface inset extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Selects the justification algorithm used when 'text-align' is set to 'justify'. The property applies to block containers, but the UA may (but is not required to) also support it on inline elements.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-justify)
	 * 
	*/
	interface textΞjustify extends _ {
		set(val: this): void;

		/** The UA determines the justification algorithm to follow, based on a balance between performance and adequate presentation quality. */
		auto: ''

		/** Justification primarily changes spacing both at word separators and at grapheme cluster boundaries in all scripts except those in the connected and cursive groups. This value is sometimes used in e.g. Japanese, often with the 'text-align-last' property. */
		distribute: ''

		distributeΞallΞlines: ''

		/** Justification primarily changes spacing at word separators and at grapheme cluster boundaries in clustered scripts. This value is typically used for Southeast Asian scripts such as Thai. */
		interΞcluster: ''

		/** Justification primarily changes spacing at word separators and at inter-graphemic boundaries in scripts that use no word spaces. This value is typically used for CJK languages. */
		interΞideograph: ''

		/** Justification primarily changes spacing at word separators. This value is typically used for languages that separate words using spaces, like English or (sometimes) Korean. */
		interΞword: ''

		/** Justification primarily stretches Arabic and related scripts through the use of kashida or other calligraphic elongation. */
		kashida: ''

		newspaper: ''

	}

	/**
	 * Specifies the motion path the element gets positioned at.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/motion-path)
	 * 
	*/
	interface motionΞpath extends _ {
		set(val: this | Ψurl | Ψshape | ΨgeometryΞbox): void;

		/** No motion path gets created. */
		none: ''

		/** Defines an SVG path as a string, with optional 'fill-rule' as the first argument. */
		path(): ''

	}

	/**
	 * The inset-inline-start CSS property defines the logical inline start inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-start)
	 * 
	*/
	interface insetΞinlineΞstart extends _ {
		set(val: any): void;

	}

	/**
	 * The inset-inline-end CSS property defines the logical inline end inset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-end)
	 * 
	*/
	interface insetΞinlineΞend extends _ {
		set(val: any): void;

	}

	/**
	 * The scale CSS property allows you to specify scale transforms individually and independently of the transform property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the transform value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scale)
	 * 
	 * @alias scale
	*/
	interface scale extends _ {
		set(val: any): void;

	}

	/** @proxy scale */
	interface scale extends scale { }
	/**
	 * The translate CSS property allows you to specify translation transforms individually and independently of the transform property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the transform value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/translate)
	 * 
	*/
	interface translate extends _ {
		set(val: any): void;

	}

	/**
	 * Defines an anchor point of the box positioned along the path. The anchor point specifies the point of the box which is to be considered as the point that is moved along the path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-anchor)
	 * 
	*/
	interface offsetΞanchor extends _ {
		set(val: any): void;

	}

	/**
	 * Specifies the initial position of the offset path. If position is specified with static, offset-position would be ignored.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-position)
	 * 
	*/
	interface offsetΞposition extends _ {
		set(val: any): void;

	}

	/**
	 * The padding-block CSS property defines the logical block start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block)
	 * 
	*/
	interface paddingΞblock extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The orientation CSS @media media feature can be used to apply styles based on the orientation of the viewport (or the page box, for paged media).
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/orientation)
	 * 
	*/
	interface orientation extends _ {
		set(val: any): void;

	}

	/**
	 * The user-zoom CSS descriptor controls whether or not the user can change the zoom factor of a document defined by @viewport.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/user-zoom)
	 * 
	*/
	interface userΞzoom extends _ {
		set(val: any): void;

	}

	/**
	 * The margin-block CSS property defines the logical block start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block)
	 * 
	*/
	interface marginΞblock extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The margin-inline CSS property defines the logical inline start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline)
	 * 
	*/
	interface marginΞinline extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The padding-inline CSS property defines the logical inline start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline)
	 * 
	*/
	interface paddingΞinline extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The inset-block CSS property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the top and bottom, or right and left properties depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block)
	 * 
	*/
	interface insetΞblock extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The inset-inline CSS property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the top and bottom, or right and left properties depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline)
	 * 
	*/
	interface insetΞinline extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The border-block-color CSS property defines the color of the logical block borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the border-top-color and border-bottom-color, or border-right-color and border-left-color property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-color)
	 * 
	*/
	interface borderΞblockΞcolor extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The border-block CSS property is a shorthand property for setting the individual logical block border property values in a single place in the style sheet.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block)
	 * 
	*/
	interface borderΞblock extends _ {
		set(val: any): void;

	}

	/**
	 * The border-inline CSS property is a shorthand property for setting the individual logical inline border property values in a single place in the style sheet.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline)
	 * 
	*/
	interface borderΞinline extends _ {
		set(val: any): void;

	}

	/**
	 * The inset-block-start CSS property defines the logical block start offset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-start)
	 * 
	*/
	interface insetΞblockΞstart extends _ {
		set(val: any): void;

	}

	/**
	 * The inset-block-end CSS property defines the logical block end offset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the top, right, bottom, or left property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-end)
	 * 
	*/
	interface insetΞblockΞend extends _ {
		set(val: any): void;

	}

	/**
	 * Deprecated. Use 'isolation' property instead when support allows. Specifies how the accumulation of the background image is managed.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/enable-background)
	 * 
	*/
	interface enableΞbackground extends _ {
		set(val: this | Ψinteger | Ψlength | Ψpercentage): void;

		/** If the ancestor container element has a property of new, then all graphics elements within the current container are rendered both on the parent's background image and onto the target. */
		accumulate: ''

		/** Create a new background image canvas. All children of the current container element can access the background, and they will be rendered onto both the parent's background image canvas in addition to the target device. */
		new: ''

	}

	/**
	 * Controls glyph orientation when the inline-progression-direction is horizontal.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/glyph-orientation-horizontal)
	 * 
	*/
	interface glyphΞorientationΞhorizontal extends _ {
		set(val: Ψangle | Ψnumber): void;

	}

	/**
	 * Controls glyph orientation when the inline-progression-direction is vertical.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/glyph-orientation-vertical)
	 * 
	*/
	interface glyphΞorientationΞvertical extends _ {
		set(val: this | Ψangle | Ψnumber): void;

		/** Sets the orientation based on the fullwidth or non-fullwidth characters and the most common orientation. */
		auto: ''

	}

	/**
	 * Indicates whether the user agent should adjust inter-glyph spacing based on kerning tables that are included in the relevant font or instead disable auto-kerning and set inter-character spacing to a specific length.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/kerning)
	 * 
	*/
	interface kerning extends _ {
		set(val: this | Ψlength): void;

		/** Indicates that the user agent should adjust inter-glyph spacing based on kerning tables that are included in the font that will be used. */
		auto: ''

	}

	/**
	 * The image-resolution property specifies the intrinsic resolution of all raster images used in or on the element. It affects both content images (e.g. replaced elements and generated content) and decorative images (such as background-image). The intrinsic resolution of an image is used to determine the image’s intrinsic dimensions.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/image-resolution)
	 * 
	*/
	interface imageΞresolution extends _ {
		set(val: any): void;

	}

	/**
	 * The max-zoom CSS descriptor sets the maximum zoom factor of a document defined by the @viewport at-rule. The browser will not zoom in any further than this, whether automatically or at the user's request.

A zoom factor of 1.0 or 100% corresponds to no zooming. Larger values are zoomed in. Smaller values are zoomed out.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/max-zoom)
	 * 
	*/
	interface maxΞzoom extends _ {
		set(val: any): void;

	}

	/**
	 * The min-zoom CSS descriptor sets the minimum zoom factor of a document defined by the @viewport at-rule. The browser will not zoom out any further than this, whether automatically or at the user's request.

A zoom factor of 1.0 or 100% corresponds to no zooming. Larger values are zoomed in. Smaller values are zoomed out.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/min-zoom)
	 * 
	*/
	interface minΞzoom extends _ {
		set(val: any): void;

	}

	/**
	 * A distance that describes the position along the specified motion path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/motion-offset)
	 * 
	*/
	interface motionΞoffset extends _ {
		set(val: Ψlength | Ψpercentage): void;

	}

	/**
	 * Defines the direction of the element while positioning along the motion path.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/motion-rotation)
	 * 
	*/
	interface motionΞrotation extends _ {
		set(val: this | Ψangle): void;

		/** Indicates that the object is rotated by the angle of the direction of the motion path. */
		auto: ''

		/** Indicates that the object is rotated by the angle of the direction of the motion path plus 180 degrees. */
		reverse: ''

	}

	/**
	 * Defines the positioning of snap points along the x axis of the scroll container it is applied to.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-points-x)
	 * 
	*/
	interface scrollΞsnapΞpointsΞx extends _ {
		set(val: this): void;

		/** No snap points are defined by this scroll container. */
		none: ''

		/** Defines an interval at which snap points are defined, starting from the container’s relevant start edge. */
		repeat(): ''

	}

	/**
	 * Defines the positioning of snap points along the y axis of the scroll container it is applied to.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-points-y)
	 * 
	*/
	interface scrollΞsnapΞpointsΞy extends _ {
		set(val: this): void;

		/** No snap points are defined by this scroll container. */
		none: ''

		/** Defines an interval at which snap points are defined, starting from the container’s relevant start edge. */
		repeat(): ''

	}

	/**
	 * Defines the x and y coordinate within the element which will align with the nearest ancestor scroll container’s snap-destination for the respective axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-coordinate)
	 * 
	*/
	interface scrollΞsnapΞcoordinate extends _ {
		set(val: this | Ψposition | Ψlength | Ψpercentage): void;

		/** Specifies that this element does not contribute a snap point. */
		none: ''

	}

	/**
	 * Define the x and y coordinate within the scroll container’s visual viewport which element snap points will align with.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-destination)
	 * 
	*/
	interface scrollΞsnapΞdestination extends _ {
		set(val: Ψposition | Ψlength | Ψpercentage): void;

	}

	/**
	 * The border-block-style CSS property defines the style of the logical block borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/viewport-fit)
	 * 
	*/
	interface viewportΞfit extends _ {
		set(val: any): void;

	}

	/**
	 * The border-block-style CSS property defines the style of the logical block borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the border-top-style and border-bottom-style, or border-left-style and border-right-style properties depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-style)
	 * 
	*/
	interface borderΞblockΞstyle extends _ {
		set(val: any): void;

	}

	/**
	 * The border-block-width CSS property defines the width of the logical block borders of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the border-top-width and border-bottom-width, or border-left-width, and border-right-width property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-width)
	 * 
	*/
	interface borderΞblockΞwidth extends _ {
		set(val: any): void;

	}

	/**
	 * The border-inline-color CSS property defines the color of the logical inline borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the border-top-color and border-bottom-color, or border-right-color and border-left-color property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-color)
	 * 
	*/
	interface borderΞinlineΞcolor extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The border-inline-style CSS property defines the style of the logical inline borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the border-top-style and border-bottom-style, or border-left-style and border-right-style properties depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-style)
	 * 
	*/
	interface borderΞinlineΞstyle extends _ {
		set(val: any): void;

	}

	/**
	 * The border-inline-width CSS property defines the width of the logical inline borders of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the border-top-width and border-bottom-width, or border-left-width, and border-right-width property depending on the values defined for writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-width)
	 * 
	*/
	interface borderΞinlineΞwidth extends _ {
		set(val: any): void;

	}

	/**
	 * The overflow-block CSS media feature can be used to test how the output device handles content that overflows the initial containing block along the block axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-block)
	 * 
	*/
	interface overflowΞblock extends _ {
		set(val: any): void;

	}

	/**
	 * `@counter-style` descriptor. Specifies the symbols used by the marker-construction algorithm specified by the system descriptor. Needs to be specified if the counter system is 'additive'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/additive-symbols)
	 * 
	*/
	interface additiveΞsymbols extends _ {
		set(val: Ψinteger | Ψstring | Ψimage | Ψidentifier): void;

	}

	/**
	 * Provides alternative text for assistive technology to replace the generated content of a ::before or ::after element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/alt)
	 * 
	*/
	interface alt extends _ {
		set(val: Ψstring | this): void;

	}

	/**
	 * IE only. Used to extend behaviors of the browser.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/behavior)
	 * 
	*/
	interface behavior extends _ {
		set(val: Ψurl): void;

	}

	/**
	 * Specifies whether individual boxes are treated as broken pieces of one continuous box, or whether each box is individually wrapped with the border and padding.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break)
	 * 
	*/
	interface boxΞdecorationΞbreak extends _ {
		set(val: this): void;

		/** Each box is independently wrapped with the border and padding. */
		clone: ''

		/** The effect is as though the element were rendered with no breaks present, and then sliced by the breaks afterward. */
		slice: ''

	}

	/**
	 * `@counter-style` descriptor. Specifies a fallback counter style to be used when the current counter style can’t create a representation for a given counter value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/fallback)
	 * 
	*/
	interface fallback extends _ {
		set(val: Ψidentifier): void;

	}

	/**
	 * The value of 'normal' implies that when rendering with OpenType fonts the language of the document is used to infer the OpenType language system, used to select language specific features when rendering.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-language-override)
	 * 
	*/
	interface fontΞlanguageΞoverride extends _ {
		set(val: this | Ψstring): void;

		/** Implies that when rendering with OpenType fonts the language of the document is used to infer the OpenType language system, used to select language specific features when rendering. */
		normal: ''

	}

	/**
	 * Controls whether user agents are allowed to synthesize bold or oblique font faces when a font family lacks bold or italic faces.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis)
	 * 
	*/
	interface fontΞsynthesis extends _ {
		set(val: this): void;

		/** Disallow all synthetic faces. */
		none: ''

		/** Allow synthetic italic faces. */
		style: ''

		/** Allow synthetic bold faces. */
		weight: ''

	}

	/**
	 * For any given character, fonts can provide a variety of alternate glyphs in addition to the default glyph for that character. This property provides control over the selection of these alternate glyphs.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-alternates)
	 * 
	*/
	interface fontΞvariantΞalternates extends _ {
		set(val: this): void;

		/** Enables display of alternate annotation forms. */
		annotation(): ''

		/** Enables display of specific character variants. */
		characterΞvariant(): ''

		/** Enables display of historical forms. */
		historicalΞforms: ''

		/** None of the features are enabled. */
		normal: ''

		/** Enables replacement of default glyphs with ornaments, if provided in the font. */
		ornaments(): ''

		/** Enables display with stylistic sets. */
		styleset(): ''

		/** Enables display of stylistic alternates. */
		stylistic(): ''

		/** Enables display of swash glyphs. */
		swash(): ''

	}

	/**
	 * Specifies the vertical position
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-position)
	 * 
	*/
	interface fontΞvariantΞposition extends _ {
		set(val: this): void;

		/** None of the features are enabled. */
		normal: ''

		/** Enables display of subscript variants (OpenType feature: subs). */
		sub: ''

		/** Enables display of superscript variants (OpenType feature: sups). */
		super: ''

	}

	/**
	 * Controls the state of the input method editor for text fields.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/ime-mode)
	 * 
	*/
	interface imeΞmode extends _ {
		set(val: this): void;

		/** The input method editor is initially active; text entry is performed using it unless the user specifically dismisses it. */
		active: ''

		/** No change is made to the current input method editor state. This is the default. */
		auto: ''

		/** The input method editor is disabled and may not be activated by the user. */
		disabled: ''

		/** The input method editor is initially inactive, but the user may activate it if they wish. */
		inactive: ''

		/** The IME state should be normal; this value can be used in a user style sheet to override the page setting. */
		normal: ''

	}

	/**
	 * Sets the mask layer image of an element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
	 * 
	*/
	interface maskΞimage extends _ {
		set(val: this | Ψurl | Ψimage, arg1: any, arg2: any, arg3: any): void;

		/** Counts as a transparent black image layer. */
		none: ''

		/** Reference to a <mask element or to a CSS image. */
		url(): ''

	}

	/**
	 * Indicates whether the mask layer image is treated as luminance mask or alpha mask.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-mode)
	 * 
	*/
	interface maskΞmode extends _ {
		set(val: this | Ψurl | Ψimage, arg1: any, arg2: any, arg3: any): void;

		/** Alpha values of the mask layer image should be used as the mask values. */
		alpha: ''

		/** Use alpha values if 'mask-image' is an image, luminance if a <mask> element or a CSS image. */
		auto: ''

		/** Luminance values of the mask layer image should be used as the mask values. */
		luminance: ''

	}

	/**
	 * Specifies the mask positioning area.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-origin)
	 * 
	*/
	interface maskΞorigin extends _ {
		set(val: ΨgeometryΞbox | this, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Specifies how mask layer images are positioned.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-position)
	 * 
	*/
	interface maskΞposition extends _ {
		set(val: Ψposition | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Specifies how mask layer images are tiled after they have been sized and positioned.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-repeat)
	 * 
	*/
	interface maskΞrepeat extends _ {
		set(val: Ψrepeat, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * Specifies the size of the mask layer images.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-size)
	 * 
	*/
	interface maskΞsize extends _ {
		set(val: this | Ψlength | Ψpercentage, arg1: any, arg2: any, arg3: any): void;

		/** Resolved by using the image’s intrinsic ratio and the size of the other dimension, or failing that, using the image’s intrinsic size, or failing that, treating it as 100%. */
		auto: ''

		/** Scale the image, while preserving its intrinsic aspect ratio (if any), to the largest size such that both its width and its height can fit inside the background positioning area. */
		contain: ''

		/** Scale the image, while preserving its intrinsic aspect ratio (if any), to the smallest size such that both its width and its height can completely cover the background positioning area. */
		cover: ''

	}

	/**
	 * Provides an way to control directional focus navigation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/nav-down)
	 * 
	*/
	interface navΞdown extends _ {
		set(val: this | Ψidentifier | Ψstring): void;

		/** The user agent automatically determines which element to navigate the focus to in response to directional navigational input. */
		auto: ''

		/** Indicates that the user agent should target the frame that the element is in. */
		current: ''

		/** Indicates that the user agent should target the full window. */
		root: ''

	}

	/**
	 * Provides an input-method-neutral way of specifying the sequential navigation order (also known as 'tabbing order').
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/nav-index)
	 * 
	*/
	interface navΞindex extends _ {
		set(val: this | Ψnumber): void;

		/** The element's sequential navigation order is assigned automatically by the user agent. */
		auto: ''

	}

	/**
	 * Provides an way to control directional focus navigation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/nav-left)
	 * 
	*/
	interface navΞleft extends _ {
		set(val: this | Ψidentifier | Ψstring): void;

		/** The user agent automatically determines which element to navigate the focus to in response to directional navigational input. */
		auto: ''

		/** Indicates that the user agent should target the frame that the element is in. */
		current: ''

		/** Indicates that the user agent should target the full window. */
		root: ''

	}

	/**
	 * Provides an way to control directional focus navigation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/nav-right)
	 * 
	*/
	interface navΞright extends _ {
		set(val: this | Ψidentifier | Ψstring): void;

		/** The user agent automatically determines which element to navigate the focus to in response to directional navigational input. */
		auto: ''

		/** Indicates that the user agent should target the frame that the element is in. */
		current: ''

		/** Indicates that the user agent should target the full window. */
		root: ''

	}

	/**
	 * Provides an way to control directional focus navigation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/nav-up)
	 * 
	*/
	interface navΞup extends _ {
		set(val: this | Ψidentifier | Ψstring): void;

		/** The user agent automatically determines which element to navigate the focus to in response to directional navigational input. */
		auto: ''

		/** Indicates that the user agent should target the frame that the element is in. */
		current: ''

		/** Indicates that the user agent should target the full window. */
		root: ''

	}

	/**
	 * `@counter-style` descriptor. Defines how to alter the representation when the counter value is negative.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/negative)
	 * 
	*/
	interface negative extends _ {
		set(val: Ψimage | Ψidentifier | Ψstring): void;

	}

	/**
	 * Logical 'bottom'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-block-end)
	 * 
	*/
	interface offsetΞblockΞend extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well. */
		auto: ''

	}

	/**
	 * Logical 'top'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-block-start)
	 * 
	*/
	interface offsetΞblockΞstart extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well. */
		auto: ''

	}

	/**
	 * Logical 'right'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-inline-end)
	 * 
	*/
	interface offsetΞinlineΞend extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well. */
		auto: ''

	}

	/**
	 * Logical 'left'. Mapping depends on the parent element’s 'writing-mode', 'direction', and 'text-orientation'.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-inline-start)
	 * 
	*/
	interface offsetΞinlineΞstart extends _ {
		set(val: this | Ψlength | Ψpercentage): void;

		/** For non-replaced elements, the effect of this value depends on which of related properties have the value 'auto' as well. */
		auto: ''

	}

	/**
	 * `@counter-style` descriptor. Specifies a “fixed-width” counter style, where representations shorter than the pad value are padded with a particular <symbol>
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/pad)
	 * 
	*/
	interface pad extends _ {
		set(val: Ψinteger | Ψimage | Ψstring | Ψidentifier): void;

	}

	/**
	 * `@counter-style` descriptor. Specifies a <symbol> that is prepended to the marker representation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/prefix)
	 * 
	*/
	interface prefix extends _ {
		set(val: Ψimage | Ψstring | Ψidentifier): void;

	}

	/**
	 * `@counter-style` descriptor. Defines the ranges over which the counter style is defined.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/range)
	 * 
	*/
	interface range extends _ {
		set(val: this | Ψinteger): void;

		/** The range depends on the counter system. */
		auto: ''

		/** If used as the first value in a range, it represents negative infinity; if used as the second value, it represents positive infinity. */
		infinite: ''

	}

	/**
	 * Specifies how text is distributed within the various ruby boxes when their contents do not exactly fill their respective boxes.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-align)
	 * 
	*/
	interface rubyΞalign extends _ {
		set(val: this): void;

		/** The user agent determines how the ruby contents are aligned. This is the initial value. */
		auto: ''

		/** The ruby content is centered within its box. */
		center: ''

		/** If the width of the ruby text is smaller than that of the base, then the ruby text contents are evenly distributed across the width of the base, with the first and last ruby text glyphs lining up with the corresponding first and last base glyphs. If the width of the ruby text is at least the width of the base, then the letters of the base are evenly distributed across the width of the ruby text. */
		distributeΞletter: ''

		/** If the width of the ruby text is smaller than that of the base, then the ruby text contents are evenly distributed across the width of the base, with a certain amount of white space preceding the first and following the last character in the ruby text. That amount of white space is normally equal to half the amount of inter-character space of the ruby text. */
		distributeΞspace: ''

		/** The ruby text content is aligned with the start edge of the base. */
		left: ''

		/** If the ruby text is not adjacent to a line edge, it is aligned as in 'auto'. If it is adjacent to a line edge, then it is still aligned as in auto, but the side of the ruby text that touches the end of the line is lined up with the corresponding edge of the base. */
		lineΞedge: ''

		/** The ruby text content is aligned with the end edge of the base. */
		right: ''

		/** The ruby text content is aligned with the start edge of the base. */
		start: ''

		/** The ruby content expands as defined for normal text justification (as defined by 'text-justify'), */
		spaceΞbetween: ''

		/** As for 'space-between' except that there exists an extra justification opportunities whose space is distributed half before and half after the ruby content. */
		spaceΞaround: ''

	}

	/**
	 * Determines whether, and on which side, ruby text is allowed to partially overhang any adjacent text in addition to its own base, when the ruby text is wider than the ruby base.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-overhang)
	 * 
	*/
	interface rubyΞoverhang extends _ {
		set(val: this): void;

		/** The ruby text can overhang text adjacent to the base on either side. This is the initial value. */
		auto: ''

		/** The ruby text can overhang the text that follows it. */
		end: ''

		/** The ruby text cannot overhang any text adjacent to its base, only its own base. */
		none: ''

		/** The ruby text can overhang the text that precedes it. */
		start: ''

	}

	/**
	 * Determines whether, and on which side, ruby text is allowed to partially overhang any adjacent text in addition to its own base, when the ruby text is wider than the ruby base.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-span)
	 * 
	*/
	interface rubyΞspan extends _ {
		set(val: this): void;

		/** The value of attribute 'x' is a string value. The string value is evaluated as a <number> to determine the number of ruby base elements to be spanned by the annotation element. */
		attr(x): ''

		/** No spanning. The computed value is '1'. */
		none: ''

	}

	/**
	 * Determines the color of the top and left edges of the scroll box and scroll arrows of a scroll bar.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-3dlight-color)
	 * 
	*/
	interface scrollbarΞ3dlightΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the arrow elements of a scroll arrow.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-arrow-color)
	 * 
	*/
	interface scrollbarΞarrowΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the main elements of a scroll bar, which include the scroll box, track, and scroll arrows.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-base-color)
	 * 
	*/
	interface scrollbarΞbaseΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the gutter of a scroll bar.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-darkshadow-color)
	 * 
	*/
	interface scrollbarΞdarkshadowΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the scroll box and scroll arrows of a scroll bar.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-face-color)
	 * 
	*/
	interface scrollbarΞfaceΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the top and left edges of the scroll box and scroll arrows of a scroll bar.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-highlight-color)
	 * 
	*/
	interface scrollbarΞhighlightΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the bottom and right edges of the scroll box and scroll arrows of a scroll bar.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-shadow-color)
	 * 
	*/
	interface scrollbarΞshadowΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * Determines the color of the track element of a scroll bar.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-track-color)
	 * 
	*/
	interface scrollbarΞtrackΞcolor extends _ {
		set(val: Ψcolor): void;

	}

	/**
	 * `@counter-style` descriptor. Specifies a <symbol> that is appended to the marker representation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/suffix)
	 * 
	*/
	interface suffix extends _ {
		set(val: Ψimage | Ψstring | Ψidentifier): void;

	}

	/**
	 * `@counter-style` descriptor. Specifies which algorithm will be used to construct the counter’s representation based on the counter value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/system)
	 * 
	*/
	interface system extends _ {
		set(val: this | Ψinteger): void;

		/** Represents “sign-value” numbering systems, which, rather than using reusing digits in different positions to change their value, define additional digits with much larger values, so that the value of the number can be obtained by adding all the digits together. */
		additive: ''

		/** Interprets the list of counter symbols as digits to an alphabetic numbering system, similar to the default lower-alpha counter style, which wraps from "a", "b", "c", to "aa", "ab", "ac". */
		alphabetic: ''

		/** Cycles repeatedly through its provided symbols, looping back to the beginning when it reaches the end of the list. */
		cyclic: ''

		/** Use the algorithm of another counter style, but alter other aspects. */
		extends: ''

		/** Runs through its list of counter symbols once, then falls back. */
		fixed: ''

		/** interprets the list of counter symbols as digits to a "place-value" numbering system, similar to the default 'decimal' counter style. */
		numeric: ''

		/** Cycles repeatedly through its provided symbols, doubling, tripling, etc. the symbols on each successive pass through the list. */
		symbolic: ''

	}

	/**
	 * `@counter-style` descriptor. Specifies the symbols used by the marker-construction algorithm specified by the system descriptor.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/symbols)
	 * 
	*/
	interface symbols extends _ {
		set(val: Ψimage | Ψstring | Ψidentifier): void;

	}

	/**
	 * The aspect-ratio   CSS property sets a preferred aspect ratio for the box, which will be used in the calculation of auto sizes and some other layout functions.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
	 * 
	*/
	interface aspectΞratio extends _ {
		set(val: any): void;

	}

	/**
	 * In combination with elevation, the azimuth CSS property enables different audio sources to be positioned spatially for aural presentation. This is important in that it provides a natural way to tell several voices apart, as each can be positioned to originate at a different location on the sound stage. Stereo output produce a lateral sound stage, while binaural headphones and multi-speaker setups allow for a fully three-dimensional stage.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/azimuth)
	 * 
	*/
	interface azimuth extends _ {
		set(val: any): void;

	}

	/**
	 * The border-end-end-radius CSS property defines a logical border radius on an element, which maps to a physical border radius that depends on on the element's writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-end-radius)
	 * 
	*/
	interface borderΞendΞendΞradius extends _ {
		set(val: Ψradius, arg1: any): void;

	}

	/**
	 * The border-end-start-radius CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-start-radius)
	 * 
	*/
	interface borderΞendΞstartΞradius extends _ {
		set(val: Ψradius, arg1: any): void;

	}

	/**
	 * The border-start-end-radius CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-end-radius)
	 * 
	*/
	interface borderΞstartΞendΞradius extends _ {
		set(val: Ψradius, arg1: any): void;

	}

	/**
	 * The border-start-start-radius CSS property defines a logical border radius on an element, which maps to a physical border radius that depends on the element's writing-mode, direction, and text-orientation.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-start-radius)
	 * 
	*/
	interface borderΞstartΞstartΞradius extends _ {
		set(val: Ψradius, arg1: any): void;

	}

	/**
	 * The box-ordinal-group CSS property assigns the flexbox's child elements to an ordinal group.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/box-ordinal-group)
	 * 
	*/
	interface boxΞordinalΞgroup extends _ {
		set(val: any): void;

	}

	/**
	 * The color-adjust property is a non-standard CSS extension that can be used to force printing of background colors and images in browsers based on the WebKit engine.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/color-adjust)
	 * 
	*/
	interface colorΞadjust extends _ {
		set(val: any): void;

	}

	/**
	 * The counter-set CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-set)
	 * 
	*/
	interface counterΞset extends _ {
		set(val: any): void;

	}

	/**
	 * The hanging-punctuation CSS property specifies whether a punctuation mark should hang at the start or end of a line of text. Hanging punctuation may be placed outside the line box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/hanging-punctuation)
	 * 
	*/
	interface hangingΞpunctuation extends _ {
		set(val: any): void;

	}

	/**
	 * The initial-letter CSS property specifies styling for dropped, raised, and sunken initial letters.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter)
	 * 
	*/
	interface initialΞletter extends _ {
		set(val: any): void;

	}

	/**
	 * The initial-letter-align CSS property specifies the alignment of initial letters within a paragraph.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter-align)
	 * 
	*/
	interface initialΞletterΞalign extends _ {
		set(val: any): void;

	}

	/**
	 * The line-clamp property allows limiting the contents of a block container to the specified number of lines; remaining content is fragmented away and neither rendered nor measured. Optionally, it also allows inserting content into the last line box to indicate the continuity of truncated/interrupted content.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/line-clamp)
	 * 
	*/
	interface lineΞclamp extends _ {
		set(val: any): void;

	}

	/**
	 * The line-height-step CSS property defines the step units for line box heights. When the step unit is positive, line box heights are rounded up to the closest multiple of the unit. Negative values are invalid.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height-step)
	 * 
	*/
	interface lineΞheightΞstep extends _ {
		set(val: any): void;

	}

	/**
	 * The margin-trim property allows the container to trim the margins of its children where they adjoin the container’s edges.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-trim)
	 * 
	*/
	interface marginΞtrim extends _ {
		set(val: any): void;

	}

	/**
	 * The mask-border CSS property lets you create a mask along the edge of an element's border.

This property is a shorthand for mask-border-source, mask-border-slice, mask-border-width, mask-border-outset, mask-border-repeat, and mask-border-mode. As with all shorthand properties, any omitted sub-values will be set to their initial value.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border)
	 * 
	*/
	interface maskΞborder extends _ {
		set(val: any): void;

	}

	/**
	 * The mask-border-mode CSS property specifies the blending mode used in a mask border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-mode)
	 * 
	*/
	interface maskΞborderΞmode extends _ {
		set(val: any): void;

	}

	/**
	 * The mask-border-outset CSS property specifies the distance by which an element's mask border is set out from its border box.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-outset)
	 * 
	*/
	interface maskΞborderΞoutset extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The mask-border-repeat CSS property defines how the edge regions of a source image are adjusted to fit the dimensions of an element's mask border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-repeat)
	 * 
	*/
	interface maskΞborderΞrepeat extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The mask-border-slice CSS property divides the image specified by mask-border-source into regions. These regions are used to form the components of an element's mask border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-slice)
	 * 
	*/
	interface maskΞborderΞslice extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The mask-border-source CSS property specifies the source image used to create an element's mask border.

The mask-border-slice property is used to divide the source image into regions, which are then dynamically applied to the final mask border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-source)
	 * 
	*/
	interface maskΞborderΞsource extends _ {
		set(val: any): void;

	}

	/**
	 * The mask-border-width CSS property specifies the width of an element's mask border.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-width)
	 * 
	*/
	interface maskΞborderΞwidth extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The mask-clip CSS property determines the area, which is affected by a mask. The painted content of an element must be restricted to this area.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip)
	 * 
	*/
	interface maskΞclip extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The mask-composite CSS property represents a compositing operation used on the current mask layer with the mask layers below it.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)
	 * 
	*/
	interface maskΞcomposite extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The max-liens property forces a break after a set number of lines
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/max-lines)
	 * 
	*/
	interface maxΞlines extends _ {
		set(val: any): void;

	}

	/**
	 * The overflow-clip-box CSS property specifies relative to which box the clipping happens when there is an overflow. It is short hand for the overflow-clip-box-inline and overflow-clip-box-block properties.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-clip-box)
	 * 
	*/
	interface overflowΞclipΞbox extends _ {
		set(val: any): void;

	}

	/**
	 * The overflow-inline CSS media feature can be used to test how the output device handles content that overflows the initial containing block along the inline axis.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-inline)
	 * 
	*/
	interface overflowΞinline extends _ {
		set(val: any): void;

	}

	/**
	 * The overscroll-behavior CSS property is shorthand for the overscroll-behavior-x and overscroll-behavior-y properties, which allow you to control the browser's scroll overflow behavior — what happens when the boundary of a scrolling area is reached.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
	 * 
	*/
	interface overscrollΞbehavior extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The overscroll-behavior-x CSS property is allows you to control the browser's scroll overflow behavior — what happens when the boundary of a scrolling area is reached — in the x axis direction.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x)
	 * 
	*/
	interface overscrollΞbehaviorΞx extends _ {
		set(val: any): void;

	}

	/**
	 * The overscroll-behavior-y CSS property is allows you to control the browser's scroll overflow behavior — what happens when the boundary of a scrolling area is reached — in the y axis direction.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-y)
	 * 
	*/
	interface overscrollΞbehaviorΞy extends _ {
		set(val: any): void;

	}

	/**
	 * This property controls how ruby annotation boxes should be rendered when there are more than one in a ruby container box: whether each pair should be kept separate, the annotations should be collapsed and rendered as a group, or the separation should be determined based on the space available.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-merge)
	 * 
	*/
	interface rubyΞmerge extends _ {
		set(val: any): void;

	}

	/**
	 * The scrollbar-color CSS property sets the color of the scrollbar track and thumb.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color)
	 * 
	*/
	interface scrollbarΞcolor extends _ {
		set(val: any): void;

	}

	/**
	 * The scrollbar-width property allows the author to set the maximum thickness of an element’s scrollbars when they are shown. 
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-width)
	 * 
	*/
	interface scrollbarΞwidth extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin property is a shorthand property which sets all of the scroll-margin longhands, assigning values much like the margin property does for the margin-* longhands.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin)
	 * 
	*/
	interface scrollΞmargin extends _ {
		set(val: any, arg1: any, arg2: any, arg3: any): void;

	}

	/**
	 * The scroll-margin-block property is a shorthand property which sets the scroll-margin longhands in the block dimension.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-block)
	 * 
	*/
	interface scrollΞmarginΞblock extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The scroll-margin-block-start property defines the margin of the scroll snap area at the start of the block dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-block-start)
	 * 
	*/
	interface scrollΞmarginΞblockΞstart extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-block-end property defines the margin of the scroll snap area at the end of the block dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-block-end)
	 * 
	*/
	interface scrollΞmarginΞblockΞend extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-bottom property defines the bottom margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-bottom)
	 * 
	*/
	interface scrollΞmarginΞbottom extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-inline property is a shorthand property which sets the scroll-margin longhands in the inline dimension.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-inline)
	 * 
	*/
	interface scrollΞmarginΞinline extends _ {
		set(val: any, arg1: any): void;

	}

	/**
	 * The scroll-margin-inline-start property defines the margin of the scroll snap area at the start of the inline dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-inline-start)
	 * 
	*/
	interface scrollΞmarginΞinlineΞstart extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-inline-end property defines the margin of the scroll snap area at the end of the inline dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-inline-end)
	 * 
	*/
	interface scrollΞmarginΞinlineΞend extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-left property defines the left margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-left)
	 * 
	*/
	interface scrollΞmarginΞleft extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-right property defines the right margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-right)
	 * 
	*/
	interface scrollΞmarginΞright extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-margin-top property defines the top margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container’s coordinate space), then adding the specified outsets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top)
	 * 
	*/
	interface scrollΞmarginΞtop extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-snap-type-x CSS property defines how strictly snap points are enforced on the horizontal axis of the scroll container in case there is one.

Specifying any precise animations or physics used to enforce those snap points is not covered by this property but instead left up to the user agent.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type-x)
	 * 
	*/
	interface scrollΞsnapΞtypeΞx extends _ {
		set(val: any): void;

	}

	/**
	 * The scroll-snap-type-y CSS property defines how strictly snap points are enforced on the vertical axis of the scroll container in case there is one.

Specifying any precise animations or physics used to enforce those snap points is not covered by this property but instead left up to the user agent.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type-y)
	 * 
	*/
	interface scrollΞsnapΞtypeΞy extends _ {
		set(val: any): void;

	}

	/**
	 * The text-decoration-thickness CSS property sets the thickness, or width, of the decoration line that is used on text in an element, such as a line-through, underline, or overline.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness)
	 * 
	 * @alias tdt
	*/
	interface textΞdecorationΞthickness extends _ {
		set(val: any): void;

	}

	/** @proxy textΞdecorationΞthickness */
	interface tdt extends textΞdecorationΞthickness { }
	/**
	 * The text-emphasis CSS property is a shorthand property for setting text-emphasis-style and text-emphasis-color in one declaration. This property will apply the specified emphasis mark to each character of the element's text, except separator characters, like spaces,  and control characters.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis)
	 * 
	 * @alias te
	*/
	interface textΞemphasis extends _ {
		set(val: any): void;

	}

	/** @proxy textΞemphasis */
	interface te extends textΞemphasis { }
	/**
	 * The text-emphasis-color CSS property defines the color used to draw emphasis marks on text being rendered in the HTML document. This value can also be set and reset using the text-emphasis shorthand.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-color)
	 * 
	 * @alias tec
	*/
	interface textΞemphasisΞcolor extends _ {
		set(val: any): void;

	}

	/** @proxy textΞemphasisΞcolor */
	interface tec extends textΞemphasisΞcolor { }
	/**
	 * The text-emphasis-position CSS property describes where emphasis marks are drawn at. The effect of emphasis marks on the line height is the same as for ruby text: if there isn't enough place, the line height is increased.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-position)
	 * 
	 * @alias tep
	*/
	interface textΞemphasisΞposition extends _ {
		set(val: any): void;

	}

	/** @proxy textΞemphasisΞposition */
	interface tep extends textΞemphasisΞposition { }
	/**
	 * The text-emphasis-style CSS property defines the type of emphasis used. It can also be set, and reset, using the text-emphasis shorthand.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-style)
	 * 
	 * @alias tes
	*/
	interface textΞemphasisΞstyle extends _ {
		set(val: any): void;

	}

	/** @proxy textΞemphasisΞstyle */
	interface tes extends textΞemphasisΞstyle { }
	/**
	 * The text-underline-offset CSS property sets the offset distance of an underline text decoration line (applied using text-decoration) from its original position.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-offset)
	 * 
	*/
	interface textΞunderlineΞoffset extends _ {
		set(val: any): void;

	}

	/**
	 * The speak-as descriptor specifies how a counter symbol constructed with a given @counter-style will be represented in the spoken form. For example, an author can specify a counter symbol to be either spoken as its numerical value or just represented with an audio cue.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/speak-as)
	 * 
	*/
	interface speakΞas extends _ {
		set(val: any): void;

	}

	/**
	 * The bleed CSS at-rule descriptor, used with the @page at-rule, specifies the extent of the page bleed area outside the page box. This property only has effect if crop marks are enabled using the marks property.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/bleed)
	 * 
	*/
	interface bleed extends _ {
		set(val: any): void;

	}

	/**
	 * The marks CSS at-rule descriptor, used with the @page at-rule, adds crop and/or cross marks to the presentation of the document. Crop marks indicate where the page should be cut. Cross marks are used to align sheets.
	 * 
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/marks)
	 * 
	*/
	interface marks extends _ {
		set(val: any): void;

	}

	interface Ψcolor {
		/** The current color */
		current: 'current';
		/** Clear */
		transparent: 'transparent';
		/** Clear */
		clear: 'clear';
		/** @color hsla(0,0%,0%,1) */
		black: 'hsla(0,0%,0%,1)';
		/** @color hsla(0,0%,100%,1) */
		white: 'hsla(0,0%,100%,1)';
		/** @color hsla(355,100%,97%,1) */
		rose0: 'hsla(355,100%,97%,1)';
		/** @color hsla(355,100%,94%,1) */
		rose1: 'hsla(355,100%,94%,1)';
		/** @color hsla(352,96%,90%,1) */
		rose2: 'hsla(352,96%,90%,1)';
		/** @color hsla(352,95%,81%,1) */
		rose3: 'hsla(352,95%,81%,1)';
		/** @color hsla(351,94%,71%,1) */
		rose4: 'hsla(351,94%,71%,1)';
		/** @color hsla(349,89%,60%,1) */
		rose5: 'hsla(349,89%,60%,1)';
		/** @color hsla(346,77%,49%,1) */
		rose6: 'hsla(346,77%,49%,1)';
		/** @color hsla(345,82%,40%,1) */
		rose7: 'hsla(345,82%,40%,1)';
		/** @color hsla(343,79%,34%,1) */
		rose8: 'hsla(343,79%,34%,1)';
		/** @color hsla(341,75%,30%,1) */
		rose9: 'hsla(341,75%,30%,1)';
		/** @color hsla(327,73%,97%,1) */
		pink0: 'hsla(327,73%,97%,1)';
		/** @color hsla(325,77%,94%,1) */
		pink1: 'hsla(325,77%,94%,1)';
		/** @color hsla(325,84%,89%,1) */
		pink2: 'hsla(325,84%,89%,1)';
		/** @color hsla(327,87%,81%,1) */
		pink3: 'hsla(327,87%,81%,1)';
		/** @color hsla(328,85%,70%,1) */
		pink4: 'hsla(328,85%,70%,1)';
		/** @color hsla(330,81%,60%,1) */
		pink5: 'hsla(330,81%,60%,1)';
		/** @color hsla(333,71%,50%,1) */
		pink6: 'hsla(333,71%,50%,1)';
		/** @color hsla(335,77%,41%,1) */
		pink7: 'hsla(335,77%,41%,1)';
		/** @color hsla(335,74%,35%,1) */
		pink8: 'hsla(335,74%,35%,1)';
		/** @color hsla(335,69%,30%,1) */
		pink9: 'hsla(335,69%,30%,1)';
		/** @color hsla(289,100%,97%,1) */
		fuchsia0: 'hsla(289,100%,97%,1)';
		/** @color hsla(286,100%,95%,1) */
		fuchsia1: 'hsla(286,100%,95%,1)';
		/** @color hsla(288,95%,90%,1) */
		fuchsia2: 'hsla(288,95%,90%,1)';
		/** @color hsla(291,93%,82%,1) */
		fuchsia3: 'hsla(291,93%,82%,1)';
		/** @color hsla(292,91%,72%,1) */
		fuchsia4: 'hsla(292,91%,72%,1)';
		/** @color hsla(292,84%,60%,1) */
		fuchsia5: 'hsla(292,84%,60%,1)';
		/** @color hsla(293,69%,48%,1) */
		fuchsia6: 'hsla(293,69%,48%,1)';
		/** @color hsla(294,72%,39%,1) */
		fuchsia7: 'hsla(294,72%,39%,1)';
		/** @color hsla(295,70%,32%,1) */
		fuchsia8: 'hsla(295,70%,32%,1)';
		/** @color hsla(296,63%,28%,1) */
		fuchsia9: 'hsla(296,63%,28%,1)';
		/** @color hsla(269,100%,98%,1) */
		purple0: 'hsla(269,100%,98%,1)';
		/** @color hsla(268,100%,95%,1) */
		purple1: 'hsla(268,100%,95%,1)';
		/** @color hsla(268,100%,91%,1) */
		purple2: 'hsla(268,100%,91%,1)';
		/** @color hsla(269,97%,85%,1) */
		purple3: 'hsla(269,97%,85%,1)';
		/** @color hsla(270,95%,75%,1) */
		purple4: 'hsla(270,95%,75%,1)';
		/** @color hsla(270,91%,65%,1) */
		purple5: 'hsla(270,91%,65%,1)';
		/** @color hsla(271,81%,55%,1) */
		purple6: 'hsla(271,81%,55%,1)';
		/** @color hsla(272,71%,47%,1) */
		purple7: 'hsla(272,71%,47%,1)';
		/** @color hsla(272,67%,39%,1) */
		purple8: 'hsla(272,67%,39%,1)';
		/** @color hsla(273,65%,31%,1) */
		purple9: 'hsla(273,65%,31%,1)';
		/** @color hsla(250,100%,97%,1) */
		violet0: 'hsla(250,100%,97%,1)';
		/** @color hsla(251,91%,95%,1) */
		violet1: 'hsla(251,91%,95%,1)';
		/** @color hsla(250,95%,91%,1) */
		violet2: 'hsla(250,95%,91%,1)';
		/** @color hsla(252,94%,85%,1) */
		violet3: 'hsla(252,94%,85%,1)';
		/** @color hsla(255,91%,76%,1) */
		violet4: 'hsla(255,91%,76%,1)';
		/** @color hsla(258,89%,66%,1) */
		violet5: 'hsla(258,89%,66%,1)';
		/** @color hsla(262,83%,57%,1) */
		violet6: 'hsla(262,83%,57%,1)';
		/** @color hsla(263,69%,50%,1) */
		violet7: 'hsla(263,69%,50%,1)';
		/** @color hsla(263,69%,42%,1) */
		violet8: 'hsla(263,69%,42%,1)';
		/** @color hsla(263,67%,34%,1) */
		violet9: 'hsla(263,67%,34%,1)';
		/** @color hsla(225,100%,96%,1) */
		indigo0: 'hsla(225,100%,96%,1)';
		/** @color hsla(226,100%,93%,1) */
		indigo1: 'hsla(226,100%,93%,1)';
		/** @color hsla(228,96%,88%,1) */
		indigo2: 'hsla(228,96%,88%,1)';
		/** @color hsla(229,93%,81%,1) */
		indigo3: 'hsla(229,93%,81%,1)';
		/** @color hsla(234,89%,73%,1) */
		indigo4: 'hsla(234,89%,73%,1)';
		/** @color hsla(238,83%,66%,1) */
		indigo5: 'hsla(238,83%,66%,1)';
		/** @color hsla(243,75%,58%,1) */
		indigo6: 'hsla(243,75%,58%,1)';
		/** @color hsla(244,57%,50%,1) */
		indigo7: 'hsla(244,57%,50%,1)';
		/** @color hsla(243,54%,41%,1) */
		indigo8: 'hsla(243,54%,41%,1)';
		/** @color hsla(242,47%,34%,1) */
		indigo9: 'hsla(242,47%,34%,1)';
		/** @color hsla(213,100%,96%,1) */
		blue0: 'hsla(213,100%,96%,1)';
		/** @color hsla(213,100%,96%,1) */
		hue0: 'hsla(213,100%,96%,1)';
		/** @color hsla(214,94%,92%,1) */
		blue1: 'hsla(214,94%,92%,1)';
		/** @color hsla(214,94%,92%,1) */
		hue1: 'hsla(214,94%,92%,1)';
		/** @color hsla(213,96%,87%,1) */
		blue2: 'hsla(213,96%,87%,1)';
		/** @color hsla(213,96%,87%,1) */
		hue2: 'hsla(213,96%,87%,1)';
		/** @color hsla(211,96%,78%,1) */
		blue3: 'hsla(211,96%,78%,1)';
		/** @color hsla(211,96%,78%,1) */
		hue3: 'hsla(211,96%,78%,1)';
		/** @color hsla(213,93%,67%,1) */
		blue4: 'hsla(213,93%,67%,1)';
		/** @color hsla(213,93%,67%,1) */
		hue4: 'hsla(213,93%,67%,1)';
		/** @color hsla(217,91%,59%,1) */
		blue5: 'hsla(217,91%,59%,1)';
		/** @color hsla(217,91%,59%,1) */
		hue5: 'hsla(217,91%,59%,1)';
		/** @color hsla(221,83%,53%,1) */
		blue6: 'hsla(221,83%,53%,1)';
		/** @color hsla(221,83%,53%,1) */
		hue6: 'hsla(221,83%,53%,1)';
		/** @color hsla(224,76%,48%,1) */
		blue7: 'hsla(224,76%,48%,1)';
		/** @color hsla(224,76%,48%,1) */
		hue7: 'hsla(224,76%,48%,1)';
		/** @color hsla(225,70%,40%,1) */
		blue8: 'hsla(225,70%,40%,1)';
		/** @color hsla(225,70%,40%,1) */
		hue8: 'hsla(225,70%,40%,1)';
		/** @color hsla(224,64%,32%,1) */
		blue9: 'hsla(224,64%,32%,1)';
		/** @color hsla(224,64%,32%,1) */
		hue9: 'hsla(224,64%,32%,1)';
		/** @color hsla(204,100%,97%,1) */
		sky0: 'hsla(204,100%,97%,1)';
		/** @color hsla(204,93%,93%,1) */
		sky1: 'hsla(204,93%,93%,1)';
		/** @color hsla(200,94%,86%,1) */
		sky2: 'hsla(200,94%,86%,1)';
		/** @color hsla(199,95%,73%,1) */
		sky3: 'hsla(199,95%,73%,1)';
		/** @color hsla(198,93%,59%,1) */
		sky4: 'hsla(198,93%,59%,1)';
		/** @color hsla(198,88%,48%,1) */
		sky5: 'hsla(198,88%,48%,1)';
		/** @color hsla(200,98%,39%,1) */
		sky6: 'hsla(200,98%,39%,1)';
		/** @color hsla(201,96%,32%,1) */
		sky7: 'hsla(201,96%,32%,1)';
		/** @color hsla(200,89%,27%,1) */
		sky8: 'hsla(200,89%,27%,1)';
		/** @color hsla(202,80%,23%,1) */
		sky9: 'hsla(202,80%,23%,1)';
		/** @color hsla(183,100%,96%,1) */
		cyan0: 'hsla(183,100%,96%,1)';
		/** @color hsla(185,95%,90%,1) */
		cyan1: 'hsla(185,95%,90%,1)';
		/** @color hsla(186,93%,81%,1) */
		cyan2: 'hsla(186,93%,81%,1)';
		/** @color hsla(186,92%,69%,1) */
		cyan3: 'hsla(186,92%,69%,1)';
		/** @color hsla(187,85%,53%,1) */
		cyan4: 'hsla(187,85%,53%,1)';
		/** @color hsla(188,94%,42%,1) */
		cyan5: 'hsla(188,94%,42%,1)';
		/** @color hsla(191,91%,36%,1) */
		cyan6: 'hsla(191,91%,36%,1)';
		/** @color hsla(192,82%,30%,1) */
		cyan7: 'hsla(192,82%,30%,1)';
		/** @color hsla(194,69%,27%,1) */
		cyan8: 'hsla(194,69%,27%,1)';
		/** @color hsla(196,63%,23%,1) */
		cyan9: 'hsla(196,63%,23%,1)';
		/** @color hsla(166,76%,96%,1) */
		teal0: 'hsla(166,76%,96%,1)';
		/** @color hsla(167,85%,89%,1) */
		teal1: 'hsla(167,85%,89%,1)';
		/** @color hsla(168,83%,78%,1) */
		teal2: 'hsla(168,83%,78%,1)';
		/** @color hsla(170,76%,64%,1) */
		teal3: 'hsla(170,76%,64%,1)';
		/** @color hsla(172,66%,50%,1) */
		teal4: 'hsla(172,66%,50%,1)';
		/** @color hsla(173,80%,40%,1) */
		teal5: 'hsla(173,80%,40%,1)';
		/** @color hsla(174,83%,31%,1) */
		teal6: 'hsla(174,83%,31%,1)';
		/** @color hsla(175,77%,26%,1) */
		teal7: 'hsla(175,77%,26%,1)';
		/** @color hsla(176,69%,21%,1) */
		teal8: 'hsla(176,69%,21%,1)';
		/** @color hsla(175,60%,19%,1) */
		teal9: 'hsla(175,60%,19%,1)';
		/** @color hsla(151,80%,95%,1) */
		emerald0: 'hsla(151,80%,95%,1)';
		/** @color hsla(149,80%,89%,1) */
		emerald1: 'hsla(149,80%,89%,1)';
		/** @color hsla(152,75%,80%,1) */
		emerald2: 'hsla(152,75%,80%,1)';
		/** @color hsla(156,71%,66%,1) */
		emerald3: 'hsla(156,71%,66%,1)';
		/** @color hsla(158,64%,51%,1) */
		emerald4: 'hsla(158,64%,51%,1)';
		/** @color hsla(160,84%,39%,1) */
		emerald5: 'hsla(160,84%,39%,1)';
		/** @color hsla(161,93%,30%,1) */
		emerald6: 'hsla(161,93%,30%,1)';
		/** @color hsla(162,93%,24%,1) */
		emerald7: 'hsla(162,93%,24%,1)';
		/** @color hsla(163,88%,19%,1) */
		emerald8: 'hsla(163,88%,19%,1)';
		/** @color hsla(164,85%,16%,1) */
		emerald9: 'hsla(164,85%,16%,1)';
		/** @color hsla(138,76%,96%,1) */
		green0: 'hsla(138,76%,96%,1)';
		/** @color hsla(140,84%,92%,1) */
		green1: 'hsla(140,84%,92%,1)';
		/** @color hsla(141,78%,85%,1) */
		green2: 'hsla(141,78%,85%,1)';
		/** @color hsla(141,76%,73%,1) */
		green3: 'hsla(141,76%,73%,1)';
		/** @color hsla(141,69%,58%,1) */
		green4: 'hsla(141,69%,58%,1)';
		/** @color hsla(142,70%,45%,1) */
		green5: 'hsla(142,70%,45%,1)';
		/** @color hsla(142,76%,36%,1) */
		green6: 'hsla(142,76%,36%,1)';
		/** @color hsla(142,71%,29%,1) */
		green7: 'hsla(142,71%,29%,1)';
		/** @color hsla(142,64%,24%,1) */
		green8: 'hsla(142,64%,24%,1)';
		/** @color hsla(143,61%,20%,1) */
		green9: 'hsla(143,61%,20%,1)';
		/** @color hsla(78,92%,95%,1) */
		lime0: 'hsla(78,92%,95%,1)';
		/** @color hsla(79,89%,89%,1) */
		lime1: 'hsla(79,89%,89%,1)';
		/** @color hsla(80,88%,79%,1) */
		lime2: 'hsla(80,88%,79%,1)';
		/** @color hsla(81,84%,67%,1) */
		lime3: 'hsla(81,84%,67%,1)';
		/** @color hsla(82,77%,55%,1) */
		lime4: 'hsla(82,77%,55%,1)';
		/** @color hsla(83,80%,44%,1) */
		lime5: 'hsla(83,80%,44%,1)';
		/** @color hsla(84,85%,34%,1) */
		lime6: 'hsla(84,85%,34%,1)';
		/** @color hsla(85,78%,27%,1) */
		lime7: 'hsla(85,78%,27%,1)';
		/** @color hsla(86,68%,22%,1) */
		lime8: 'hsla(86,68%,22%,1)';
		/** @color hsla(87,61%,20%,1) */
		lime9: 'hsla(87,61%,20%,1)';
		/** @color hsla(54,91%,95%,1) */
		yellow0: 'hsla(54,91%,95%,1)';
		/** @color hsla(54,96%,88%,1) */
		yellow1: 'hsla(54,96%,88%,1)';
		/** @color hsla(52,98%,76%,1) */
		yellow2: 'hsla(52,98%,76%,1)';
		/** @color hsla(50,97%,63%,1) */
		yellow3: 'hsla(50,97%,63%,1)';
		/** @color hsla(47,95%,53%,1) */
		yellow4: 'hsla(47,95%,53%,1)';
		/** @color hsla(45,93%,47%,1) */
		yellow5: 'hsla(45,93%,47%,1)';
		/** @color hsla(40,96%,40%,1) */
		yellow6: 'hsla(40,96%,40%,1)';
		/** @color hsla(35,91%,32%,1) */
		yellow7: 'hsla(35,91%,32%,1)';
		/** @color hsla(31,80%,28%,1) */
		yellow8: 'hsla(31,80%,28%,1)';
		/** @color hsla(28,72%,25%,1) */
		yellow9: 'hsla(28,72%,25%,1)';
		/** @color hsla(47,100%,96%,1) */
		amber0: 'hsla(47,100%,96%,1)';
		/** @color hsla(47,96%,88%,1) */
		amber1: 'hsla(47,96%,88%,1)';
		/** @color hsla(48,96%,76%,1) */
		amber2: 'hsla(48,96%,76%,1)';
		/** @color hsla(45,96%,64%,1) */
		amber3: 'hsla(45,96%,64%,1)';
		/** @color hsla(43,96%,56%,1) */
		amber4: 'hsla(43,96%,56%,1)';
		/** @color hsla(37,92%,50%,1) */
		amber5: 'hsla(37,92%,50%,1)';
		/** @color hsla(32,94%,43%,1) */
		amber6: 'hsla(32,94%,43%,1)';
		/** @color hsla(25,90%,37%,1) */
		amber7: 'hsla(25,90%,37%,1)';
		/** @color hsla(22,82%,31%,1) */
		amber8: 'hsla(22,82%,31%,1)';
		/** @color hsla(21,77%,26%,1) */
		amber9: 'hsla(21,77%,26%,1)';
		/** @color hsla(33,100%,96%,1) */
		orange0: 'hsla(33,100%,96%,1)';
		/** @color hsla(34,100%,91%,1) */
		orange1: 'hsla(34,100%,91%,1)';
		/** @color hsla(32,97%,83%,1) */
		orange2: 'hsla(32,97%,83%,1)';
		/** @color hsla(30,97%,72%,1) */
		orange3: 'hsla(30,97%,72%,1)';
		/** @color hsla(27,95%,60%,1) */
		orange4: 'hsla(27,95%,60%,1)';
		/** @color hsla(24,94%,53%,1) */
		orange5: 'hsla(24,94%,53%,1)';
		/** @color hsla(20,90%,48%,1) */
		orange6: 'hsla(20,90%,48%,1)';
		/** @color hsla(17,88%,40%,1) */
		orange7: 'hsla(17,88%,40%,1)';
		/** @color hsla(15,79%,33%,1) */
		orange8: 'hsla(15,79%,33%,1)';
		/** @color hsla(15,74%,27%,1) */
		orange9: 'hsla(15,74%,27%,1)';
		/** @color hsla(0,85%,97%,1) */
		red0: 'hsla(0,85%,97%,1)';
		/** @color hsla(0,93%,94%,1) */
		red1: 'hsla(0,93%,94%,1)';
		/** @color hsla(0,96%,89%,1) */
		red2: 'hsla(0,96%,89%,1)';
		/** @color hsla(0,93%,81%,1) */
		red3: 'hsla(0,93%,81%,1)';
		/** @color hsla(0,90%,70%,1) */
		red4: 'hsla(0,90%,70%,1)';
		/** @color hsla(0,84%,60%,1) */
		red5: 'hsla(0,84%,60%,1)';
		/** @color hsla(0,72%,50%,1) */
		red6: 'hsla(0,72%,50%,1)';
		/** @color hsla(0,73%,41%,1) */
		red7: 'hsla(0,73%,41%,1)';
		/** @color hsla(0,70%,35%,1) */
		red8: 'hsla(0,70%,35%,1)';
		/** @color hsla(0,62%,30%,1) */
		red9: 'hsla(0,62%,30%,1)';
		/** @color hsla(60,9%,97%,1) */
		warmer0: 'hsla(60,9%,97%,1)';
		/** @color hsla(60,4%,95%,1) */
		warmer1: 'hsla(60,4%,95%,1)';
		/** @color hsla(20,5%,90%,1) */
		warmer2: 'hsla(20,5%,90%,1)';
		/** @color hsla(23,5%,82%,1) */
		warmer3: 'hsla(23,5%,82%,1)';
		/** @color hsla(23,5%,63%,1) */
		warmer4: 'hsla(23,5%,63%,1)';
		/** @color hsla(24,5%,44%,1) */
		warmer5: 'hsla(24,5%,44%,1)';
		/** @color hsla(33,5%,32%,1) */
		warmer6: 'hsla(33,5%,32%,1)';
		/** @color hsla(30,6%,25%,1) */
		warmer7: 'hsla(30,6%,25%,1)';
		/** @color hsla(12,6%,15%,1) */
		warmer8: 'hsla(12,6%,15%,1)';
		/** @color hsla(24,9%,10%,1) */
		warmer9: 'hsla(24,9%,10%,1)';
		/** @color hsla(0,0%,98%,1) */
		warm0: 'hsla(0,0%,98%,1)';
		/** @color hsla(0,0%,96%,1) */
		warm1: 'hsla(0,0%,96%,1)';
		/** @color hsla(0,0%,89%,1) */
		warm2: 'hsla(0,0%,89%,1)';
		/** @color hsla(0,0%,83%,1) */
		warm3: 'hsla(0,0%,83%,1)';
		/** @color hsla(0,0%,63%,1) */
		warm4: 'hsla(0,0%,63%,1)';
		/** @color hsla(0,0%,45%,1) */
		warm5: 'hsla(0,0%,45%,1)';
		/** @color hsla(0,0%,32%,1) */
		warm6: 'hsla(0,0%,32%,1)';
		/** @color hsla(0,0%,25%,1) */
		warm7: 'hsla(0,0%,25%,1)';
		/** @color hsla(0,0%,14%,1) */
		warm8: 'hsla(0,0%,14%,1)';
		/** @color hsla(0,0%,9%,1) */
		warm9: 'hsla(0,0%,9%,1)';
		/** @color hsla(0,0%,98%,1) */
		gray0: 'hsla(0,0%,98%,1)';
		/** @color hsla(240,4%,95%,1) */
		gray1: 'hsla(240,4%,95%,1)';
		/** @color hsla(240,5%,90%,1) */
		gray2: 'hsla(240,5%,90%,1)';
		/** @color hsla(240,4%,83%,1) */
		gray3: 'hsla(240,4%,83%,1)';
		/** @color hsla(240,5%,64%,1) */
		gray4: 'hsla(240,5%,64%,1)';
		/** @color hsla(240,3%,46%,1) */
		gray5: 'hsla(240,3%,46%,1)';
		/** @color hsla(240,5%,33%,1) */
		gray6: 'hsla(240,5%,33%,1)';
		/** @color hsla(240,5%,26%,1) */
		gray7: 'hsla(240,5%,26%,1)';
		/** @color hsla(240,3%,15%,1) */
		gray8: 'hsla(240,3%,15%,1)';
		/** @color hsla(240,5%,10%,1) */
		gray9: 'hsla(240,5%,10%,1)';
		/** @color hsla(210,19%,98%,1) */
		cool0: 'hsla(210,19%,98%,1)';
		/** @color hsla(219,14%,95%,1) */
		cool1: 'hsla(219,14%,95%,1)';
		/** @color hsla(220,13%,90%,1) */
		cool2: 'hsla(220,13%,90%,1)';
		/** @color hsla(215,12%,83%,1) */
		cool3: 'hsla(215,12%,83%,1)';
		/** @color hsla(217,10%,64%,1) */
		cool4: 'hsla(217,10%,64%,1)';
		/** @color hsla(220,8%,46%,1) */
		cool5: 'hsla(220,8%,46%,1)';
		/** @color hsla(215,13%,34%,1) */
		cool6: 'hsla(215,13%,34%,1)';
		/** @color hsla(216,19%,26%,1) */
		cool7: 'hsla(216,19%,26%,1)';
		/** @color hsla(214,27%,16%,1) */
		cool8: 'hsla(214,27%,16%,1)';
		/** @color hsla(220,39%,10%,1) */
		cool9: 'hsla(220,39%,10%,1)';
		/** @color hsla(210,40%,98%,1) */
		cooler0: 'hsla(210,40%,98%,1)';
		/** @color hsla(209,40%,96%,1) */
		cooler1: 'hsla(209,40%,96%,1)';
		/** @color hsla(214,31%,91%,1) */
		cooler2: 'hsla(214,31%,91%,1)';
		/** @color hsla(212,26%,83%,1) */
		cooler3: 'hsla(212,26%,83%,1)';
		/** @color hsla(215,20%,65%,1) */
		cooler4: 'hsla(215,20%,65%,1)';
		/** @color hsla(215,16%,46%,1) */
		cooler5: 'hsla(215,16%,46%,1)';
		/** @color hsla(215,19%,34%,1) */
		cooler6: 'hsla(215,19%,34%,1)';
		/** @color hsla(215,24%,26%,1) */
		cooler7: 'hsla(215,24%,26%,1)';
		/** @color hsla(217,32%,17%,1) */
		cooler8: 'hsla(217,32%,17%,1)';
		/** @color hsla(222,47%,11%,1) */
		cooler9: 'hsla(222,47%,11%,1)';
	}

	interface Ψhue {
		/** @color hsla(351,94%,71%,1) */
		rose: 'hsla(351,94%,71%,1)';
		/** @color hsla(328,85%,70%,1) */
		pink: 'hsla(328,85%,70%,1)';
		/** @color hsla(292,91%,72%,1) */
		fuchsia: 'hsla(292,91%,72%,1)';
		/** @color hsla(270,95%,75%,1) */
		purple: 'hsla(270,95%,75%,1)';
		/** @color hsla(255,91%,76%,1) */
		violet: 'hsla(255,91%,76%,1)';
		/** @color hsla(234,89%,73%,1) */
		indigo: 'hsla(234,89%,73%,1)';
		/** @color hsla(213,93%,67%,1) */
		blue: 'hsla(213,93%,67%,1)';
		/** @color hsla(198,93%,59%,1) */
		sky: 'hsla(198,93%,59%,1)';
		/** @color hsla(187,85%,53%,1) */
		cyan: 'hsla(187,85%,53%,1)';
		/** @color hsla(172,66%,50%,1) */
		teal: 'hsla(172,66%,50%,1)';
		/** @color hsla(158,64%,51%,1) */
		emerald: 'hsla(158,64%,51%,1)';
		/** @color hsla(141,69%,58%,1) */
		green: 'hsla(141,69%,58%,1)';
		/** @color hsla(82,77%,55%,1) */
		lime: 'hsla(82,77%,55%,1)';
		/** @color hsla(47,95%,53%,1) */
		yellow: 'hsla(47,95%,53%,1)';
		/** @color hsla(43,96%,56%,1) */
		amber: 'hsla(43,96%,56%,1)';
		/** @color hsla(27,95%,60%,1) */
		orange: 'hsla(27,95%,60%,1)';
		/** @color hsla(0,90%,70%,1) */
		red: 'hsla(0,90%,70%,1)';
		/** @color hsla(23,5%,63%,1) */
		warmer: 'hsla(23,5%,63%,1)';
		/** @color hsla(0,0%,63%,1) */
		warm: 'hsla(0,0%,63%,1)';
		/** @color hsla(240,5%,64%,1) */
		gray: 'hsla(240,5%,64%,1)';
		/** @color hsla(217,10%,64%,1) */
		cool: 'hsla(217,10%,64%,1)';
		/** @color hsla(215,20%,65%,1) */
		cooler: 'hsla(215,20%,65%,1)';
	}

	interface Ψfs {
		/** 10px */
		'xxs': '10px';
		/** 12px */
		'xs': '12px';
		/** 13px */
		'sm-': '13px';
		/** 14px */
		'sm': '14px';
		/** 15px */
		'md-': '15px';
		/** 16px */
		'md': '16px';
		/** 18px */
		'lg': '18px';
		/** 20px */
		'xl': '20px';
		/** 24px */
		'2xl': '24px';
		/** 30px */
		'3xl': '30px';
		/** 36px */
		'4xl': '36px';
		/** 48px */
		'5xl': '48px';
		/** 64px */
		'6xl': '64px';
	}

	interface Ψshadow {
		/** 0 0 0 1px rgba(0, 0, 0, 0.05) */
		'xxs': '0 0 0 1px rgba(0, 0, 0, 0.05)';
		/** 0 1px 2px 0 rgba(0, 0, 0, 0.05) */
		'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
		/** 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) */
		'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
		/** 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) */
		'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
		/** 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) */
		'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
		/** 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) */
		'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
		/** 0 25px 50px -6px rgba(0, 0, 0, 0.25) */
		'xxl': '0 25px 50px -6px rgba(0, 0, 0, 0.25)';
		/** inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) */
		'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)';
		/** 0 0 0 3px rgba(66, 153, 225, 0.5) */
		'outline': '0 0 0 3px rgba(66, 153, 225, 0.5)';
		/** none */
		'none': 'none';
	}

	interface Ψradius {
		/** 9999px */
		'full': '9999px';
		/** 1px */
		'xxs': '1px';
		/** 2px */
		'xs': '2px';
		/** 3px */
		'sm': '3px';
		/** 4px */
		'md': '4px';
		/** 6px */
		'lg': '6px';
		/** 8px */
		'xl': '8px';
	}

	interface ΨeasingΞfunction {
		/** @easing cubic-bezier(0.47, 0, 0.745, 0.715) */
		sineΞin: 'cubic-bezier(0.47, 0, 0.745, 0.715)';
		/** @easing cubic-bezier(0.39, 0.575, 0.565, 1) */
		sineΞout: 'cubic-bezier(0.39, 0.575, 0.565, 1)';
		/** @easing cubic-bezier(0.445, 0.05, 0.55, 0.95) */
		sineΞinΞout: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)';
		/** @easing cubic-bezier(0.55, 0.085, 0.68, 0.53) */
		quadΞin: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
		/** @easing cubic-bezier(0.25, 0.46, 0.45, 0.94) */
		quadΞout: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
		/** @easing cubic-bezier(0.455, 0.03, 0.515, 0.955) */
		quadΞinΞout: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)';
		/** @easing cubic-bezier(0.55, 0.055, 0.675, 0.19) */
		cubicΞin: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)';
		/** @easing cubic-bezier(0.215, 0.61, 0.355, 1) */
		cubicΞout: 'cubic-bezier(0.215, 0.61, 0.355, 1)';
		/** @easing cubic-bezier(0.645, 0.045, 0.355, 1) */
		cubicΞinΞout: 'cubic-bezier(0.645, 0.045, 0.355, 1)';
		/** @easing cubic-bezier(0.895, 0.03, 0.685, 0.22) */
		quartΞin: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)';
		/** @easing cubic-bezier(0.165, 0.84, 0.44, 1) */
		quartΞout: 'cubic-bezier(0.165, 0.84, 0.44, 1)';
		/** @easing cubic-bezier(0.77, 0, 0.175, 1) */
		quartΞinΞout: 'cubic-bezier(0.77, 0, 0.175, 1)';
		/** @easing cubic-bezier(0.755, 0.05, 0.855, 0.06) */
		quintΞin: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)';
		/** @easing cubic-bezier(0.23, 1, 0.32, 1) */
		quintΞout: 'cubic-bezier(0.23, 1, 0.32, 1)';
		/** @easing cubic-bezier(0.86, 0, 0.07, 1) */
		quintΞinΞout: 'cubic-bezier(0.86, 0, 0.07, 1)';
		/** @easing cubic-bezier(0.95, 0.05, 0.795, 0.035) */
		expoΞin: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)';
		/** @easing cubic-bezier(0.19, 1, 0.22, 1) */
		expoΞout: 'cubic-bezier(0.19, 1, 0.22, 1)';
		/** @easing cubic-bezier(1, 0, 0, 1) */
		expoΞinΞout: 'cubic-bezier(1, 0, 0, 1)';
		/** @easing cubic-bezier(0.6, 0.04, 0.98, 0.335) */
		circΞin: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)';
		/** @easing cubic-bezier(0.075, 0.82, 0.165, 1) */
		circΞout: 'cubic-bezier(0.075, 0.82, 0.165, 1)';
		/** @easing cubic-bezier(0.785, 0.135, 0.15, 0.86) */
		circΞinΞout: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)';
		/** @easing cubic-bezier(0.6, -0.28, 0.735, 0.045) */
		backΞin: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)';
		/** @easing cubic-bezier(0.175, 0.885, 0.32, 1.275) */
		backΞout: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
		/** @easing cubic-bezier(0.68, -0.55, 0.265, 1.55) */
		backΞinΞout: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
	}

}

