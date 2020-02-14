if $node$
	export {Document,Node,Text,Element,SVGElement,HTMLElement,Comment,DocumentFragment,ShadowRoot,Event,CustomEvent,MouseEvent,document} from './ssr'

if $web$
	export var {Document,Node,Text,Comment,Element,SVGElement,HTMLElement,DocumentFragment,ShadowRoot,Event,CustomEvent,MouseEvent,document} = window