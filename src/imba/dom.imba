if $node$
	export {Document,Node,Text,Element,SVGElement,HTMLElement,Comment,DocumentFragment,ShadowRoot,Event,CustomEvent,MouseEvent,KeyboardEvent,PointerEvent,document} from './ssr'

if $web$
	export const {Document,Node,Text,Comment,Element,SVGElement,HTMLElement,DocumentFragment,ShadowRoot,Event,CustomEvent,MouseEvent,KeyboardEvent,PointerEvent,document} = window