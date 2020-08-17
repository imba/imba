

if $node$
	export {Document,Node,Text,Element,SVGElement,HTMLElement,HTMLInputElement,HTMLSelectElement,HTMLButtonElement,HTMLOptionElement,HTMLTextAreaElement,Comment,DocumentFragment,ShadowRoot,Event,CustomEvent,MouseEvent,KeyboardEvent,PointerEvent,document,getElementType} from './ssr'

if $web$
	export const {Document,Node,Text,Comment,Element,SVGElement,HTMLElement,HTMLInputElement,HTMLSelectElement,HTMLButtonElement,HTMLOptionElement,HTMLTextAreaElement,DocumentFragment,ShadowRoot,Event,CustomEvent,MouseEvent,KeyboardEvent,PointerEvent,document,getElementType} = window