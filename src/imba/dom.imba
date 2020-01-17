if $node$
	export {Document,Node,Element,SVGElement,HTMLElement,Comment,DocumentFragment,Event,CustomEvent,MouseEvent,document} from './ssr'

if $web$
	export var {Document,Node,Comment,Element,SVGElement,HTMLElement,DocumentFragment,Event,CustomEvent,MouseEvent} = window