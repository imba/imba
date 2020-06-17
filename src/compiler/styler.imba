
var conv = require('../../vendor/colors')
import {fonts,colors,variants} from './theme.imba'

import * as theme from  './theme.imba'

const extensions = {}
var ThemeInstance = null

# {string: "hsla(0,0,0,var(--alpha,1))",h:0,s:0,l:0}
# {string: "hsla(0,100%,100%,var(--alpha,1))",h:0,s:0,l:100}

# export const properties =
	

export const aliases =
	
	c: 'color'
	d: 'display'
	pos: 'position'

	# padding
	p: 'padding'
	pl: 'padding-left'
	pr: 'padding-right'
	pt: 'padding-top'
	pb: 'padding-bottom'
	px: 'padding-x'
	py: 'padding-y'
	
	# margins
	m: 'margin'
	ml: 'margin-left'
	mr: 'margin-right'
	mt: 'margin-top'
	mb: 'margin-bottom'
	mx: 'margin-x'
	my: 'margin-y'
	
	g: 'gap'
	rg: 'row-gap'
	cg: 'column-gap'
	
	# add scroll snap shorthands?
	
	w: 'width'
	h: 'height'
	t: 'top'
	b: 'bottom'
	l: 'left'
	r: 'right'
	size: ['width','height']
	
	pi: 'place-items'
	pc: 'place-content'
	ps: 'place-self'	
	ai: 'align-items'
	ac: 'align-content'
	as: 'align-self'
	ji: 'justify-items'
	jc: 'justify-content'
	js: 'justify-self'
	
	
	# flex
	
	# ff: 'flex-flow' # support up/down/left/right aliases
	# fb: 'flex-basis'
	fl: 'flex'
	flf: 'flex-flow'
	fld: 'flex-direction'
	flb: 'flex-basis'
	flg: 'flex-grow'
	fls: 'flex-shrink'
	flw: 'flex-wrap'
	
	# fonts
	# f: 'font' # shorthand?
	ff: 'font-family'
	fs: 'font-size'
	fw: 'font-weight'
	ts: 'text-shadow'
	td: 'text-decoration'
	tdl: 'text-decoration-line'
	tdc: 'text-decoration-color'
	tds: 'text-decoration-style'
	tdt: 'text-decoration-thickness'
	tdsi: 'text-decoration-skip-ink'
	
	te: 'text-emphasis'
	tec: 'text-emphasis-color'
	tes: 'text-emphasis-style'
	tep: 'text-emphasis-position'
	tet: 'text-emphasis-thickness'
	tesi: 'text-decoration-skip-ink'
	
	tt: 'text-transform'
	ta: 'text-align'
	va: 'vertical-align'
	ls: 'letter-spacing'
	lh: 'line-height'
	
	# margins
	# l: 'layout'
	# l: 'layout'
	is: 'layout'
	d: 'display'
	

	# borders
	# b: 'border'
	bc: 'border-color'
	bs: 'border-style'
	bw: 'border-width'
	# br: 'border-radius'

	# bb: 'border-bottom'
	btc: 'border-top-color'
	bts: 'border-top-style'
	btw: 'border-top-width'
	# btr: ['border-top-left-radius','border-top-right-radius']
	# btrr: 'border-top-right-radius'
	# btlr: 'border-top-left-radius'
	
	brc: 'border-right-color'
	brs: 'border-right-style'
	brw: 'border-right-width'
	# brr: ['border-top-right-radius','border-bottom-right-radius']

	bbc: 'border-bottom-color'
	bbs: 'border-bottom-style'
	bbw: 'border-bottom-width'
	# bbr: ['border-bottom-left-radius','border-bottom-right-radius']
	# bbrr: 'border-bottom-right-radius'
	# bblr: 'border-bottom-left-radius'
	
	blc: 'border-left-color'
	bls: 'border-left-style'
	blw: 'border-left-width'
	# blr: ['border-top-left-radius','border-bottom-left-radius']
	
	# br: 'border-right'
	bxc: 'border-x-color'
	bxs: 'border-x-style'
	bxw: 'border-x-width'
	
	# by: 'border-y'
	byc: 'border-y-color'
	bys: 'border-y-style'
	byw: 'border-y-width'
	
	# background
	bg: 'background'
	bgp: 'background-position'
	bgc: 'background-color'
	bgr: 'background-repeat'
	bgi: 'background-image'
	bga: 'background-attachment'
	bgs: 'background-size'
	bgo: 'background-origin'
	bgclip: 'background-clip'
	

	# grid
	gtr: 'grid-template-rows'
	gtc: 'grid-template-columns'
	gta: 'grid-template-areas'
	gar: 'grid-auto-rows'
	gac: 'grid-auto-columns'
	gaf: 'grid-auto-flow'
	gcg: 'grid-column-gap'
	grg: 'grid-row-gap'
	cg: 'column-gap'
	rg: 'row-gap'
	ga: 'grid-area'
	gr: 'grid-row'
	gc: 'grid-column'
	gt: 'grid-template'
	grs: 'grid-row-start'
	gcs: 'grid-column-start'
	gre: 'grid-row-end'
	gce: 'grid-column-end'

	shadow: 'box-shadow'
	

	ws: 'white-space'
	zi: 'z-index'
	o: 'opacity'
	tween: 'transition'
	pe: 'pointer-events'
	us: 'user-select'
	
	'of':'overflow'
	'ofx':'overflow-x'
	'ofy':'overflow-y'
	'ofa':'overflow-anchor'
	# 'ofa':'overflow-anchor'
	
	prefix: 'content@before'
	suffix: 'content@after'

export class Color
	
	def constructor name,h,s,l,a = '100%'
		name = name
		h = h
		s = s
		l = l
		a = a
		
	def alpha v = '100%'
		new Color(name,h,s,l,v)
	
	def toString
		"hsla({h.toFixed(2)},{s.toFixed(2)}%,{l.toFixed(2)}%,{a})"
		
	def c
		toString!

export class Length
	
	static def parse value
		let m = String(value).match(/^(\-?[\d\.]+)(\w+|%)?$/)
		return null unless m
		return new self(parseFloat(m[1]),m[2])
	
	def constructor number, unit
		number = number
		unit = unit
	
	def valueOf
		number
		
	def toString
		number + (unit or '')
		
	def clone num = number, u = unit
		new Length(num,u)
		
	def rounded
		clone(Math.round(number))
		
	def c
		toString!
	
	get _unit
		unit
	
	get _number
		number

export class Var
	
	def constructor name, fallback
		name = name
		fallback = fallback
		
	def c
		fallback ? "var(--{name},{fallback.c ? fallback.c! : String(fallback)})" : "var(--{name})"

# This has to move into StyleTheme class
var palette = {
	current: {string: "currentColor"}
	transparent: new Color('transparent',0,0,100,'0%')
	clear: new Color('transparent',100,100,100,'0%')
	black: new Color('black',0,0,0,'100%')
	white: new Color('white',0,0,100,'100%')
}

for own name,variations of colors
	for own subname,raw of variations
		let path = name + subname
		
		# are these just aliases?
		if palette[raw]
			palette[path] = palette[raw]
		else
			let rgb = conv.hex.rgb(raw)
			let [h,s,l] = conv.rgb.hsl(rgb)
			let color = palette[path] = new Color(path,h,s,l,'100%')
			
		if subname.match(/^\d00$/)
			palette[name + subname[0]] = palette[path]

var colorRegex = new RegExp('\\b(' + Object.keys(palette).join('|') + ')\\b')

export class StyleTheme
	
	static def instance
		ThemeInstance ||= new self
		
	def constructor 
		options = theme
		
	def parseColors
		self
		
	get colors
		palette
		
	def expandProperty name
		return aliases[name] or undefined
		
	def expandValue value, config
	
		if value == undefined
			value = config.default

		if config.hasOwnProperty(value)
			value = config[value]

		if typeof value == 'number' and config.NUMBER
			let [step,num,unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/)
			return value * parseFloat(num) + unit

		return value
	
	def padding-x [l,r=l]
		{'padding-left': l, 'padding-right': r}
	
	def padding-y [t,b=t]
		{'padding-top': t, 'padding-bottom': b}
		
	def margin-x [l,r=l]
		{'margin-left': l, 'margin-right': r}
	
	def margin-y [t,b=t]
		{'margin-top': t, 'margin-bottom': b}
		
	def inset [t,r=t,b=t,l=r]
		{top: t, right: r, bottom: b, left: l}
		
	def size [w,h=w]
		{width: w, height: h}
		
	def grid params
		if let m = $varFallback('grid',params)
			return m
		return
		
	def radius [tl,tr=tl,br=tl,bl=tr]
		if tl == tr == br == bl
			return {'border-radius': tl}
		else
			return {
				'border-top-left-radius': tl
				'border-top-right-radius': tr
				'border-bottom-right-radius': br
				'border-bottom-left-radius': bl
			}
		
	def width [...params]
		let o = {}
		for param in params
			let opts = param._options or {}
			let u = param._unit
			if u == 'c' or u == 'col' or u == 'cols'
				o['grid-column-end'] = "span {param._number}"
			elif opts.op and String(opts.op) == '>'
				o['min-width'] = param
			elif opts.op and String(opts.op) == '<'
				o['max-width'] = param
			else
				o.width = param
		return o
		
	def height [...params]
		let o = {}
		for param in params
			let opts = param._options or {}
			let u = param._unit
			if u == 'r' or u == 'row' or u == 'rows'
				o['grid-row-end'] = "span {param._number}"
			elif opts.op and String(opts.op) == '>'
				o['min-height'] = param
			elif opts.op and String(opts.op) == '<'
				o['max-height'] = param
			else
				o.height = param
		return o

	def transition ...parts
		let out = {}
		let add = {}

		let signatures = [
			'name | duration'
			'name | duration | delay'
			'name | duration | ease'
			'name | duration | ease | delay'
		]
		
		let groups = {
			styles: ['background-color','border-color','color','fill','stroke','opacity','box-shadow','transform']
			sizes: ['width','height','left','top','right','bottom','margin','padding']
			colors: ['background-color','border-color','color','fill','stroke']
		}
		
		let i = 0
		while i < parts.length
			let part = parts[i]
			let name = String(part[0])
			if name.match(/^[\-\+]?\d?(\.?\d+)(s|ms)?$/)
				part.unshift(name = 'styles')
				
			let ease = part[2]
			let group = groups[name]
			
			if group and parts.length == 1
				part[0] = 'none'
				Object.assign(add,{'transition-property': group.join(',')})
			elif group and parts.length > 1
				# TODO we could do a more advanced version where we 
				# create repeating transition-property and duration etc and seam
				# the pairs together
				let subparts = group.map do [$1].concat(part.slice(1))
				parts.splice(i,1,...subparts)
				continue
			i++

		Object.assign(out,{'transition': parts},add)
		return out
		
	def font params,...rest
		for param,i in params
			yes
		return
		
	def font-family params
		if let m = $varFallback('font',params)
			return m
		return
	
	def box-shadow params
		if let m = $varFallback('box-shadow',params)
			return m
		return
		
	def font-size [v]
		let sizes = options.variants.fontSize
		let raw = String(v)
		let size = v
		let lh
		let out = {}
		
		if sizes[raw]
			[size,lh] = sizes[raw]
			size = Length.parse(size)
			lh = Length.parse(lh or '')
		
		if v.param and v.param
			lh = v.param
			
		out['font-size'] = size
		
		if lh
			let lhu = lh._unit
			let lhn = lh._number
			out.lh = lh
			# supprt base unit as well?
			if lhu == 'fs'
				out.lh = new Length(lhn)
			elif lhu
				out.lh = lh
			elif lhn == 0
				out.lh = 'inherit'
			elif lhn and size._unit == 'px'
				let rounded = Math.round(size._number * lhn)
				if rounded % 2 == 1
					rounded++
				out.lh = new Length(rounded,'px')
		
		return out
		
	def line-height [v]
		let uvar = v
		# TODO what if it has u unit?
		if v._number and !v._unit
			uvar = v.clone(v._number,'em')
			
		return {
			'line-height': v
			'--u_lh': uvar
		}
		
	def text-decoration params
		for param,i in params
			let str = String(param)
			if str == 'u'
				param._resolvedValue = 'underline'
			elif str == 's'
				param._resolvedValue = 'line-through'
			
		return [params]

	# TODO allow setting border style and color w/o width?
	# TODO allow size hidden etc?
	def border [...params]
		if params.length == 1 and $parseColor(params[0])
			return [['1px','solid',params[0]]]
		return

	def border-left params
		return border(params)
		
	def border-right params
		return border(params)
	
	def border-top params
		return border(params)
		
	def border-bottom params
		return border(params)
		
	def border-x params
		{'border-left': border(params) or params, 'border-right': border(params) or params}
		
	def border-y params
		{'border-top': border(params) or params, 'border-bottom': border(params) or params}
		
	def border-x-width [l,r=l]
		{blw: l, brw: r}
		
	def border-y-width [t,b=t]
		{btw: t, bbw: b}
		
	def border-x-style [l,r=l]
		{bls: l, brs: r}
		
	def border-y-style [t,b=t]
		{bts: t, bbs: b}
	
	def border-x-color [l,r=l]
		{blc: l, brc: r}
		
	def border-y-color [t,b=t]
		{btc: t, bbc: b}

	# def shadow ...params
	#	{}
		
	def $u number, part
		let [step,num,unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/)
		# should we not rather convert hte value
		return value * parseFloat(num) + unit
	
	def $parseColor identifier
		let key = String(identifier)

		if let m = key.match(colorRegex)
			let color = self.colors[m[1]]
			let rest = key.replace(colorRegex,'')
			# console.log 'found color!!'
			# identifier.color = color
			if m = rest.match(/^\-(\d+)$/)
				color = color.alpha(m[1] + '%')
			# let name = key.replace(colorRegex,'COLOR').replace(/\-/g,'_')
			return color
		elif key.match(/^#[a-fA-F0-9]{3,8}/)
			return identifier
			
		elif key.match(/^(rgb|hsl)/)
			return identifier
		
		elif key == 'currentColor'
			return identifier

		return null
		
	def $varFallback name, params, exclude = []
		if params.length == 1
			let str = String(params[0])
			let fallback = params[0]
			exclude.push('none','initial','unset','inherit')
			if !exclude.indexOf(str) >= 0
				if name == 'font' and fonts[str]
					fallback = fonts[str]
				return [new Var("{name}-{str}",fallback)]
		return
		
	def $value value, index, config
		let key = config
		let orig = value
		let result = null
		# console.log 'resolve value',String(config),value
		if typeof config == 'string'
			if config.match(/^((min-|max-)?(width|height)|top|left|bottom|right|padding|margin|sizing|inset|spacing|sy$|s$|\-\-s[xy])/)
				config = 'sizing'
			elif config.match(/^\-\-[gs][xy]_/)
				config = 'sizing'
			elif config.match(/^(row-|column-)?gap/)
				config = 'sizing'
			elif config.match(/^border-.*radius/)
				config = 'radius'
			elif config.match(/^tween|transition/) and options.variants.easings[String(value)]
				return options.variants.easings[String(value)]

			config = options.variants[config] or {}
		
		if value == undefined
			value = config.default
	
		
		if config.hasOwnProperty(String(value))
			# should we convert it or rather just link it up?
			value = config[value]
			
		if typeof value == 'number' and config.NUMBER
			let [step,num,unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/)
			return value * parseFloat(num) + unit
		
		elif typeof value == 'string'
			if let color = $parseColor(value)
				return color

		return value
		
# should not happen at root - but create a theme instance
	
export const TransformMixin = '''
	--t_x:0;--t_y:0;--t_z:0;--t_rotate:0;--t_scale:1;--t_scale-x:1;--t_scale-y:1;--t_skew-x:0;--t_skew-y:0;
	transform: translate3d(var(--t_x),var(--t_y),var(--t_z)) rotate(var(--t_rotate)) skewX(var(--t_skew-x)) skewY(var(--t_skew-y)) scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale));
'''

import * as selparser from './selparse'

export class StyleRule
	
	def constructor parent,selector,content,options = {}
		parent = parent
		selector = selector
		content = content
		options = options
		meta = {}
		
	def root
		parent ? parent.root : self
		
	def toString
		let parts = []
		let subrules = []

		for own key,value of self.content
			continue if value == undefined
			
			let subsel = null
			
			if key.indexOf('&') >= 0
				let subsel = selparser.unwrap(selector,key)
				subrules.push new StyleRule(self,subsel,value,options)
				continue
			
			elif key.indexOf('§') >= 0
				# let keys = key.replace(/[\.\~\@\+]/g,'\\$&').split('§')
				let keys = key.split('§')
				let subsel = selparser.unwrap(selector,keys.slice(1).join(' '))
				let obj = {}
				obj[keys[0]] = value
				subrules.push new StyleRule(self,subsel,obj,options)
				continue
			
			elif key[0] == '['
				# better to just check if key contains '.'
				# this is only for a single property
				console.warn "DEPRECATED",key,self
				let o = JSON.parse(key)
				subrules.push new StyleRule(self,selector,value,options)
				continue

			elif key.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)
				unless meta.transform
					meta.transform = yes
					parts.unshift(TransformMixin)
				parts.push "--t_{key}: {value} !important;"
			else
				parts.push "{key}: {value};"
		
		let content = parts.join('\n')
		let sel = selparser.parse(selector,options)
		let out = content.match(/[^\n\s]/) ? selparser.render(sel,content) : ""

		for own subrule in subrules
			out += '\n' + subrule.toString()

		return out
