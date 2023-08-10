import {Range} from './structures'

export class Converter
	def constructor rules, matcher
		self.cache = {}
		self.rules = rules
		self.matcher = matcher

	def convert value
		for rule in rules
			if matcher
				if matcher(rule[0],value)
					return value[1]
			# if type.indexOf(strtest) >= 0 and (modtest == 0 or mods & modtest)
			#	console.log 'found?',strtest
			#	return flags
		return 0

export def matchToken token, match
	let typ = token.type
	if match isa RegExp
		return typ.match(match)
	elif typeof match == 'string'
		return typ.indexOf(match) == 0 and (!typ[match.length] or typ[match.length] == '.')

export def prevToken start, pattern, max = 100000,lines = 100000
	let tok = start
	while tok and max > 0 and lines > 0
		return tok if tok.match(pattern)
		max--
		if tok.type == 'br' or tok.value == '\n'
			lines--
		tok = tok.prev

	return null

export def pascalCase str
	str.replace(/(^|[\-\_\s])(\w)/g) do $3.toUpperCase!

export def toCustomTagIdentifier str
	'Γ' + toJSIdentifier(str)
	# toPascalCase(str + '-custom-element')

export def isTagIdentifier str
	str[0] == 'Γ'

export def isClassExtension str
	str[0] == 'Ω'

export def computeLineOffsets text, isAtLineStart, textOffset
	if textOffset === undefined
		textOffset = 0

	var result = isAtLineStart ? [textOffset] : []
	var i = 0
	while i < text.length
		var ch = text.charCodeAt(i)
		if ch === 13 || ch === 10
			if ch === 13 && (i + 1 < text.length) && text.charCodeAt(i + 1) === 10
				i++
			result.push(textOffset + i + 1)
		i++
	return result

export def getWellformedRange range
	var start = range.start
	var end = range.end
	if start.line > end.line || start.line === end.line && start.character > end.character
		return new Range(end,start) # { start: end, end: start }
	return range isa Range ? range : (new Range(start,end))

export def getWellformedEdit textEdit
	var range = getWellformedRange(textEdit.range)
	if range !== textEdit.range
		return { newText: textEdit.newText, range: range }
	return textEdit

export def mergeSort data, compare
	if data.length <= 1
		return data
	var p = (data.length / 2) | 0
	var left = data.slice(0, p)
	var right = data.slice(p)
	mergeSort(left, compare)
	mergeSort(right, compare)
	var leftIdx = 0
	var rightIdx = 0
	var i = 0
	while leftIdx < left.length && rightIdx < right.length
		var ret = compare(left[leftIdx], right[rightIdx])
		if ret <= 0
			// smaller_equal -> take left to preserve order
			data[i++] = left[leftIdx++]
		else
			// greater -> take right
			data[i++] = right[rightIdx++]

	while (leftIdx < left.length)
		data[i++] = left[leftIdx++]

	while (rightIdx < right.length)
		data[i++] = right[rightIdx++]

	return data

export def editIsFull e
		return e !== undefined && e !== null && typeof e.text === 'string' && e.range === undefined

export def editIsIncremental e
	return !editIsFull(e) && (e.rangeLength === undefined or typeof e.rangeLength === 'number')

export def fastExtractSymbols text
	let lines = text.split(/\n/)
	let symbols = []
	let scope = {indent: -1,children: []}
	let root = scope
	# symbols.root = scope
	let m
	let t0 = Date.now!

	for line,i in lines
		if line.match(/^\s*$/)
			continue

		let indent = line.match(/^\t*/)[0].length

		while scope.indent >= indent
			scope = scope.parent or root

		m = line.match(/^(\t*((?:export )?(?:static )?(?:extend )?)(class|tag|def|get|set|prop|attr) )(\@?[\w\-\$\:]+(?:\.[\w\-\$]+)?)/)
		# m ||= line.match(/^(.*(def|get|set|prop|attr) )([\w\-\$]+)/)

		if m
			let kind = m[3]
			let name = m[4]
			let ns = scope.name ? scope.name + '.' : ''
			let mods = m[2].trim().split(/\s+/)
			let md = ''

			let span = {
				start: {line: i, character: m[1].length}
				end: {line: i, character: m[0].length}
			}

			let symbol = {
				kind: kind
				ownName: name
				name: ns + name
				span: span
				indent: indent
				modifiers: mods
				children: []
				parent: scope == root ? null : scope
				type: kind
				data: {}
				static: mods.indexOf('static') >= 0
				extends: mods.indexOf('extend') >= 0
			}

			if symbol.static
				symbol.containerName = 'static'

			symbol.containerName = m[2] + m[3]

			if kind == 'tag' and m = line.match(/\<\s+([\w\-\$\:]+(?:\.[\w\-\$]+)?)/)
				symbol.superclass = m[1]

			if scope.type == 'tag'
				md = "```html\n<{scope.name} {name}>\n```\n"
				symbol.description = {kind: 'markdown',value: md}

			scope.children.push(symbol)
			scope = symbol

			symbols.push(symbol)

	root.all = symbols
	# console.log 'fast outline',text.length,Date.now! - t0
	return root

# To avoid collisions etc with symbols we are using
# greek characters to convert special imba identifiers
# to valid js identifiers.
export const ToJSMap = {
	'-': 'Ξ'
	'?': 'Φ'
	'#': 'Ψ'
	'@': 'α'
}

const toJSregex = new RegExp("[\-\?\#\@]","gu")
const toJSreplacer = do(m) ToJSMap[m]

export def toJSIdentifier raw
	raw.replace(toJSregex,toJSreplacer)

export const ToImbaMap = {
	'Ξ': '-'
	'Φ': '?'
	'Ψ': '#'
	'Γ': ''
	'α': '@'
}

const toImbaRegex = new RegExp("[ΞΦΨΓα]","gu")
const toImbaReplacer = do(m) ToImbaMap[m]

export def toImbaIdentifier raw
	raw ? raw.replace(toImbaRegex,toImbaReplacer) : raw

export def toImbaString str
	unless typeof str == 'string'
		# log('cannot convert to imba string',str)
		return str

	str = str.replace(toImbaRegex,toImbaReplacer)
	return str

export def toImbaMessageText str
	if typeof str == 'string'
		return toImbaString(str)
	if str.messageText
		str.messageText = toImbaMessageText(str.messageText)

	return str

export def fromJSIdentifier raw
	toImbaIdentifier(raw)

export def displayPartsToString parts
	fromJSIdentifier(global.ts.displayPartsToString(parts))

const TAG_TYPES = {
	"": [-1,{id: 1,className: 'class',slot: 1,part: 1,elementTiming: 'elementtiming'}]
	HTML: [-1,{title: 1,lang: 1,translate: 1,dir: 1,accessKey: 'accesskey',draggable: 1,spellcheck: 1,autocapitalize: 1,inputMode: 'inputmode',style: 1,tabIndex: 'tabindex',enterKeyHint: 'enterkeyhint'}]
	HTMLAnchor: [1,{target: 1,download: 1,ping: 1,rel: 1,relList: 'rel',hreflang: 1,type: 1,referrerPolicy: 'referrerpolicy',coords: 1,charset: 1,name: 1,rev: 1,shape: 1,href: 1}]
	HTMLArea: [1,{alt: 1,coords: 1,download: 1,shape: 1,target: 1,ping: 1,rel: 1,relList: 'rel',referrerPolicy: 'referrerpolicy',href: 1}]
	HTMLMedia: [1,{src: 1,crossOrigin: 'crossorigin',preload: 1,controlsList: 'controlslist'}]
	HTMLAudio: [4,{}]
	HTMLBase: [1,{href: 1,target: 1}]
	HTMLQuote: [1,{cite: 1}]
	HTMLBody: [1,{text: 1,link: 1,vLink: 'vlink',aLink: 'alink',bgColor: 'bgcolor',background: 1}]
	HTMLBR: [1,{clear: 1}]
	HTMLButton: [1,{formAction: 'formaction',formEnctype: 'formenctype',formMethod: 'formmethod',formTarget: 'formtarget',name: 1,type: 1,value: 1}]
	HTMLCanvas: [1,{width: 1,height: 1}]
	HTMLTableCaption: [1,{align: 1}]
	HTMLTableCol: [1,{span: 1,align: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign',width: 1}]
	HTMLData: [1,{value: 1}]
	HTMLDataList: [1,{}]
	HTMLMod: [1,{cite: 1,dateTime: 'datetime'}]
	HTMLDetails: [1,{}]
	HTMLDialog: [1,{}]
	HTMLDiv: [1,{align: 1}]
	HTMLDList: [1,{}]
	HTMLEmbed: [1,{src: 1,type: 1,width: 1,height: 1,align: 1,name: 1}]
	HTMLFieldSet: [1,{name: 1}]
	HTMLForm: [1,{acceptCharset: 'accept-charset',action: 1,autocomplete: 1,enctype: 1,encoding: 'enctype',method: 1,name: 1,target: 1}]
	HTMLHeading: [1,{align: 1}]
	HTMLHead: [1,{}]
	HTMLHR: [1,{align: 1,color: 1,size: 1,width: 1}]
	HTMLHtml: [1,{version: 1}]
	HTMLIFrame: [1,{src: 1,srcdoc: 1,name: 1,sandbox: 1,width: 1,height: 1,referrerPolicy: 'referrerpolicy',csp: 1,allow: 1,align: 1,scrolling: 1,frameBorder: 'frameborder',longDesc: 'longdesc',marginHeight: 'marginheight',marginWidth: 'marginwidth',loading: 1}]
	HTMLImage: [1,{alt: 1,src: 1,srcset: 1,sizes: 1,crossOrigin: 'crossorigin',useMap: 'usemap',width: 1,height: 1,referrerPolicy: 'referrerpolicy',decoding: 1,name: 1,lowsrc: 1,align: 1,hspace: 1,vspace: 1,longDesc: 'longdesc',border: 1,loading: 1}]
	HTMLInput: [1,{accept: 1,alt: 1,autocomplete: 1,dirName: 'dirname',formAction: 'formaction',formEnctype: 'formenctype',formMethod: 'formmethod',formTarget: 'formtarget',height: 1,max: 1,maxLength: 'maxlength',min: 1,minLength: 'minlength',name: 1,pattern: 1,placeholder: 1,src: 1,step: 1,type: 1,defaultValue: 'value',width: 1,align: 1,useMap: 'usemap'}]
	HTMLLabel: [1,{htmlFor: 'for'}]
	HTMLLegend: [1,{align: 1}]
	HTMLLI: [1,{value: 1,type: 1}]
	HTMLLink: [1,{href: 1,crossOrigin: 'crossorigin',rel: 1,relList: 'rel',media: 1,hreflang: 1,type: 1,as: 1,referrerPolicy: 'referrerpolicy',sizes: 1,imageSrcset: 'imagesrcset',imageSizes: 'imagesizes',charset: 1,rev: 1,target: 1,integrity: 1}]
	HTMLMap: [1,{name: 1}]
	HTMLMenu: [1,{}]
	HTMLMeta: [1,{name: 1,httpEquiv: 'http-equiv',content: 1,scheme: 1}]
	HTMLMeter: [1,{value: 1,min: 1,max: 1,low: 1,high: 1,optimum: 1}]
	HTMLObject: [1,{data: 1,type: 1,name: 1,useMap: 'usemap',width: 1,height: 1,align: 1,archive: 1,code: 1,hspace: 1,standby: 1,vspace: 1,codeBase: 'codebase',codeType: 'codetype',border: 1}]
	HTMLOList: [1,{start: 1,type: 1}]
	HTMLOptGroup: [1,{label: 1}]
	HTMLOption: [1,{label: 1,value: 1}]
	HTMLOutput: [1,{htmlFor: 'for',name: 1}]
	HTMLParagraph: [1,{align: 1}]
	HTMLParam: [1,{name: 1,value: 1,type: 1,valueType: 'valuetype'}]
	HTMLPicture: [1,{}]
	HTMLPre: [1,{width: 1}]
	HTMLProgress: [1,{value: 1,max: 1}]
	HTMLScript: [1,{src: 1,type: 1,charset: 1,crossOrigin: 'crossorigin',referrerPolicy: 'referrerpolicy',event: 1,htmlFor: 'for',integrity: 1}]
	HTMLSelect: [1,{autocomplete: 1,name: 1,size: 1}]
	HTMLSlot: [1,{name: 1}]
	HTMLSource: [1,{src: 1,type: 1,srcset: 1,sizes: 1,media: 1}]
	HTMLSpan: [1,{}]
	HTMLStyle: [1,{media: 1,type: 1}]
	HTMLTable: [1,{align: 1,border: 1,frame: 1,rules: 1,summary: 1,width: 1,bgColor: 'bgcolor',cellPadding: 'cellpadding',cellSpacing: 'cellspacing'}]
	HTMLTableSection: [1,{align: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign'}]
	HTMLTableCell: [1,{colSpan: 'colspan',rowSpan: 'rowspan',headers: 1,align: 1,axis: 1,height: 1,width: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign',bgColor: 'bgcolor',abbr: 1,scope: 1}]
	HTMLTemplate: [1,{}]
	HTMLTextArea: [1,{autocomplete: 1,cols: 1,dirName: 'dirname',maxLength: 'maxlength',minLength: 'minlength',name: 1,placeholder: 1,rows: 1,wrap: 1}]
	HTMLTime: [1,{dateTime: 'datetime'}]
	HTMLTitle: [1,{}]
	HTMLTableRow: [1,{align: 1,ch: 'char',chOff: 'charoff',vAlign: 'valign',bgColor: 'bgcolor'}]
	HTMLTrack: [1,{kind: 1,src: 1,srclang: 1,label: 1}]
	HTMLUList: [1,{type: 1}]
	HTMLVideo: [4,{width: 1,height: 1,poster: 1}]
	SVG: [-1,{}]
	SVGGraphics: [66,{transform: 1}]
	SVGA: [67,{}]
	SVGAnimation: [66,{}]
	SVGAnimate: [69,{}]
	SVGAnimateMotion: [69,{}]
	SVGAnimateTransform: [69,{}]
	SVGGeometry: [67,{}]
	SVGCircle: [73,{cx: 1,cy: 1,r: 1}]
	SVGClipPath: [67,{clipPathUnits: 1}]
	SVGDefs: [67,{}]
	SVGDesc: [66,{}]
	SVGDiscard: [66,{}]
	SVGEllipse: [73,{cx: 1,cy: 1,rx: 1,ry: 1}]
	SVGFEBlend: [66,{mode: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEColorMatrix: [66,{type: 1,values: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEComponentTransfer: [66,{x: 1,y: 1,width: 1,height: 1}]
	SVGFEComposite: [66,{operator: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEConvolveMatrix: [66,{orderX: 1,orderY: 1,kernelMatrix: 1,divisor: 1,edgeMode: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEDiffuseLighting: [66,{surfaceScale: 1,diffuseConstant: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEDisplacementMap: [66,{xChannelSelector: 1,yChannelSelector: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEDistantLight: [66,{}]
	SVGFEDropShadow: [66,{dx: 1,dy: 1,stdDeviationX: 1,stdDeviationY: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEFlood: [66,{x: 1,y: 1,width: 1,height: 1}]
	SVGComponentTransferFunction: [66,{type: 1,tableValues: 1,slope: 1,amplitude: 1,exponent: 1}]
	SVGFEFuncA: [90,{}]
	SVGFEFuncB: [90,{}]
	SVGFEFuncG: [90,{}]
	SVGFEFuncR: [90,{}]
	SVGFEGaussianBlur: [66,{x: 1,y: 1,width: 1,height: 1}]
	SVGFEImage: [66,{preserveAspectRatio: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEMerge: [66,{x: 1,y: 1,width: 1,height: 1}]
	SVGFEMergeNode: [66,{}]
	SVGFEMorphology: [66,{operator: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFEOffset: [66,{x: 1,y: 1,width: 1,height: 1}]
	SVGFEPointLight: [66,{}]
	SVGFESpecularLighting: [66,{surfaceScale: 1,specularConstant: 1,specularExponent: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFESpotLight: [66,{specularExponent: 1}]
	SVGFETile: [66,{x: 1,y: 1,width: 1,height: 1}]
	SVGFETurbulence: [66,{numOctaves: 1,stitchTiles: 1,type: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGFilter: [66,{filterUnits: 1,primitiveUnits: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGForeignObject: [67,{x: 1,y: 1,width: 1,height: 1}]
	SVGG: [67,{}]
	SVGImage: [67,{x: 1,y: 1,width: 1,height: 1,preserveAspectRatio: 1}]
	SVGLine: [73,{x1: 1,y1: 1,x2: 1,y2: 1}]
	SVGGradient: [66,{gradientUnits: 1,gradientTransform: 1,spreadMethod: 1}]
	SVGLinearGradient: [111,{x1: 1,y1: 1,x2: 1,y2: 1}]
	SVGMarker: [66,{refX: 1,refY: 1,markerUnits: 1,markerWidth: 1,markerHeight: 1,orientType: 1,orientAngle: 1,viewBox: 1,preserveAspectRatio: 1}]
	SVGMask: [66,{maskUnits: 1,maskContentUnits: 1,x: 1,y: 1,width: 1,height: 1}]
	SVGMetadata: [66,{}]
	SVGMPath: [66,{}]
	SVGPath: [73,{}]
	SVGPattern: [66,{patternUnits: 1,patternContentUnits: 1,patternTransform: 1,x: 1,y: 1,width: 1,height: 1,viewBox: 1,preserveAspectRatio: 1}]
	SVGPolygon: [73,{}]
	SVGPolyline: [73,{}]
	SVGRadialGradient: [111,{cx: 1,cy: 1,r: 1,fx: 1,fy: 1,fr: 1}]
	SVGRect: [73,{x: 1,y: 1,width: 1,height: 1,rx: 1,ry: 1}]
	SVGScript: [66,{}]
	SVGSet: [69,{}]
	SVGStop: [66,{}]
	SVGStyle: [66,{}]
	SVGSVG: [67,{x: 1,y: 1,width: 1,height: 1,viewBox: 1,preserveAspectRatio: 1}]
	SVGSwitch: [67,{}]
	SVGSymbol: [66,{viewBox: 1,preserveAspectRatio: 1}]
	SVGTextContent: [67,{textLength: 1,lengthAdjust: 1}]
	SVGTextPositioning: [130,{x: 1,y: 1,dx: 1,dy: 1,rotate: 1}]
	SVGText: [131,{}]
	SVGTextPath: [130,{startOffset: 1,method: 1,spacing: 1}]
	SVGTitle: [66,{}]
	SVGTSpan: [131,{}]
	SVGUse: [67,{x: 1,y: 1,width: 1,height: 1}]
	SVGView: [66,{viewBox: 1,preserveAspectRatio: 1}]
}
export const TAG_NAMES = {
	a:2
	abbr:1
	address:1
	area:3
	article:1
	aside:1
	audio:5
	b:1
	base:6
	bdi:1
	bdo:1
	blockquote:7
	body:8
	br:9
	button:10
	canvas:11
	caption:12
	cite:1
	code:1
	col:13
	colgroup:13
	data:14
	datalist:15
	dd:1
	del:16
	details:17
	dfn:1
	dialog:18
	div:19
	dl:20
	dt:1
	em:1
	embed:21
	fieldset:22
	figcaption:1
	figure:1
	footer:1
	form:23
	h1:24
	h2:24
	h3:24
	h4:24
	h5:24
	h6:24
	head:25
	header:1
	hgroup:1
	hr:26
	html:27
	i:1
	iframe:28
	img:29
	input:30
	ins:16
	kbd:1
	label:31
	legend:32
	li:33
	link:34
	main:1
	map:35
	mark:1
	menu:36
	meta:37
	meter:38
	nav:1
	noscript:1
	object:39
	ol:40
	optgroup:41
	option:42
	output:43
	p:44
	param:45
	picture:46
	pre:47
	progress:48
	q:7
	rp:1
	rt:1
	ruby:1
	s:1
	samp:1
	script:49
	section:1
	select:50
	slot:51
	small:1
	source:52
	span:53
	strike:1
	strong:1
	style:54
	sub:1
	summary:1
	sup:1
	table:55
	tbody:56
	td:57
	template:58
	textarea:59
	tfoot:56
	th:57
	thead:56
	time:60
	title:61
	tr:62
	track:63
	u:1
	ul:64
	'var': 1
	video:65
	wbr:1
	svg_a:68
	svg_animate:70
	svg_animateMotion:71
	svg_animateTransform:72
	svg_audio:66
	svg_canvas:66
	svg_circle:74
	svg_clipPath:75
	svg_defs:76
	svg_desc:77
	svg_discard:78
	svg_ellipse:79
	svg_feBlend:80
	svg_feColorMatrix:81
	svg_feComponentTransfer:82
	svg_feComposite:83
	svg_feConvolveMatrix:84
	svg_feDiffuseLighting:85
	svg_feDisplacementMap:86
	svg_feDistantLight:87
	svg_feDropShadow:88
	svg_feFlood:89
	svg_feFuncA:91
	svg_feFuncB:92
	svg_feFuncG:93
	svg_feFuncR:94
	svg_feGaussianBlur:95
	svg_feImage:96
	svg_feMerge:97
	svg_feMergeNode:98
	svg_feMorphology:99
	svg_feOffset:100
	svg_fePointLight:101
	svg_feSpecularLighting:102
	svg_feSpotLight:103
	svg_feTile:104
	svg_feTurbulence:105
	svg_filter:106
	svg_foreignObject:107
	svg_g:108
	svg_iframe:66
	svg_image:109
	svg_line:110
	svg_linearGradient:112
	svg_marker:113
	svg_mask:114
	svg_metadata:115
	svg_mpath:116
	svg_path:117
	svg_pattern:118
	svg_polygon:119
	svg_polyline:120
	svg_radialGradient:121
	svg_rect:122
	svg_script:123
	svg_set:124
	svg_stop:125
	svg_style:126
	svg_svg:127
	svg_switch:128
	svg_symbol:129
	svg_text:132
	svg_textPath:133
	svg_title:134
	svg_tspan:135
	svg_unknown:66
	svg_use:136
	svg_video:66
	svg_view:137
	element:0
}
let keys = Object.keys(TAG_TYPES)
for typ,i in keys
	let item = TAG_TYPES[typ]
	item.up = TAG_TYPES[keys[item[0]]]
	item.name = typ + 'Element'
	item.props = item[1]

for own name,ref of TAG_NAMES
	TAG_NAMES[name] = TAG_TYPES[keys[ref]]

export def tagNameToClassName name
	let ref = toImbaIdentifier(name)
	let hit = TAG_NAMES[ref]
	# console.log 'hit?!',ref
	return hit
	# fromJSIdentifier(global.ts.displayPartsToString(parts))

# console.log tagNameToClassName('element')

