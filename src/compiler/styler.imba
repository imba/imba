
var conv = require('../../vendor/colors')
import {fonts,colors,variants,breakpoints} from './theme.imba'

import * as theme from  './theme.imba'

const extensions = {}
var ThemeInstance = null

# {string: "hsla(0,0,0,var(--alpha,1))",h:0,s:0,l:0}
# {string: "hsla(0,100%,100%,var(--alpha,1))",h:0,s:0,l:100}

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
	
	s: 'spacing'
	sx: 'spacing-x'
	sy: 'spacing-y'
	st: 'spacing-top'
	sr: 'spacing-right'
	sb: 'spacing-bottom'
	sl: 'spacing-left'
	
	# add scroll snap shorthands?
	
	w: 'width'
	h: 'height'
	t: 'top'
	b: 'bottom'
	l: 'left'
	r: 'right'
	i: 'inset'
	size: ['width','height']
	
	# alignment
	a: 'align'
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

		if typeof value == 'number' and config.step
			let [step,num,unit] = config.step.match(/^(\-?[\d\.]+)(\w+|%)?$/)
			return value * parseFloat(num) + unit

		return value

	def antialiazed value
		# what if it is false?
		if String(value) == 'subpixel'
			{
				'-webkit-font-smoothing':'auto'
				'-moz-osx-font-smoothing': 'auto'
			}
		else
			{
				'-webkit-font-smoothing':'antialiased'
				'-moz-osx-font-smoothing': 'grayscale'
			}
			
	
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
		
	def space [length]
		{
			"padding": length # $length(length / 2)
			"& > *": {'margin': length } # $length(length / 2)
		}
		
	def spacing [y,x=y]
		return {'spacing-x': x,'spacing-y': y}
		{
			"padding": length # $length(length / 2)
			"& > *": {'margin': length } # $length(length / 2)
		}
	
	def spacing-x [v]
		v._unit ||= 'u'
		{$sx_c:v, $sx_s:v, px:"calc(var(--sx_s) / 2)", "& > *": {$sx_:v, mx:'calc(var(--sx_) / 2)'}}
		
	def spacing-y [v]
		v._unit ||= 'u'
		{$sy_s:v, py:"calc(var(--sy_s) / 2)", "& > *": {$sy_:v, my:'calc(var(--sy_) / 2)'}}
	
	def g [y,x=y]
		return {gx: x,gy: y}
		
	def gx [v]
		v.unit ||= 'u'
		{
			'column-gap': v
			'--gx': v
			# $sx_s:v, mx:'calc((var(--sx_,0px) - var(--sx_s)) / 2)', "& > *": {$sx_:v, mx:'calc(var(--sx_) / 2)'}
		}
		
	def gy [v]
		v.unit ||= 'u'
		{
			'row-gap': v
			'--gy': v
			# $sy_s:v, my:'calc((var(--sy_,0px) - var(--sy_s)) / 2)', "& > *": {$sy_:v, my:'calc(var(--sy_) / 2)'}
		}
		
	def any-layout o
		o["& > *"] = {position: 'relative'}
		return
	
	def row-layout o
		any-layout(o)
		o.display = 'flex'
		o.ff = 'row wrap'
		o.jc = 'var(--row-jc,inherit)'
		o.ai = 'center'
		yes
		
	def col-layout o
		any-layout(o)
		o.display = 'flex'
		o.ff = 'column nowrap'
		o.ai = 'var(--row-jc,stretch)'
		o.jc = 'var(--col-jc,inherit)'
		
	def cluster-layout o
		o.display = 'flex'
		o.ff = 'row wrap'
		o.jc = 'var(--row-jc,inherit)'
		o.ai = 'center'
		o.margin = 'calc(var(--gy) * -0.5) calc(var(--gx) * -0.5)' # weak padding
		o["& > *"] = {margin:'calc(var(--gy) / 2) calc(var(--gx) / 2)'}
		
	def auto-layout o
		any-layout(o)
		o.display = 'flex'
		o.ai = 'var(--flow-ai,center)'
		o.ff = 'var(--flow-fd,row) nowrap'
		o.jc = 'var(--flow-ai,inherit)'
		
	def box-layout o
		any-layout(o)
		o.display = 'flex'
		o.ff = 'column nowrap'
		o.ai = 'var(--box-ai,center)'
		o.jc = 'var(--box-jc,center)'
		
	def cols-layout o, key
		o.display = 'grid'
		o['row-gap'] = 'var(--gy,inherit)'
		o['column-gap'] = 'var(--gx,inherit)'
		o.gaf = 'column'
		o.gac = 'minmax(0,100%)'
		
	def rows-layout o, key
		o.display = 'grid'
		o['row-gap'] = 'var(--gy,inherit)'
		o['column-gap'] = 'var(--gx,inherit)'
		o.gaf = 'row'
		o.gar = 'auto'
		if key.param
			o.gtc = "minmax(auto,{key.param.c!})"
		else
			o.gtc = "1fr"
		
		
	def stack-layout o, key
		any-layout(o)
		
		o.display = 'grid'
		if key.param
			o.gtc = "minmax(auto,{key.param.c!})"
		else
			o.gtc = "1fr"
		o.jc = 'center'
		# o.ff = 'column nowrap'
		# o.ai = 'var(--stack-ai,stretch)'
		# o.jc = 'var(--row-jc,inherit)'
		
	def cluster2-layout o
		any-layout(o)
		o.display = 'flex'
		o.ff = 'row wrap'
		o.jc = 'var(--row-jc,inherit)'
		o.ai = 'center'
		
	def align [...params]
		
		let o = {}
		
		for par in params
			let str = String(par)
			o['--align'] = str
			if str == 'left'
				o.ta = 'left'
				o['--row-jc'] = 'flex-start'
				o['--flow-fd'] = 'row'
				o['--flow-ai'] = 'flex-start'

			elif str == 'right'
				o.ta = 'right'
				o['--row-jc'] = 'flex-end'
				o['--flow-fd'] = 'row-reverse'
				o['--flow-ai'] = 'flex-start'
				
			elif str == 'center'
				o.ta = 'center'
				o['--row-jc'] = 'center'
				o['--flow-fd'] = 'column'
				o['--flow-ai'] = 'center'
			
			elif str == 'justify'
				o.ta = 'left'
				o['--row-jc'] = 'flex-start'
				o['--flow-fd'] = 'row'
				o['--flow-ai'] = 'stretch'
				o['--box-jc'] = 'space-around'
			
			elif str == 'top'
				o['--col-jc'] = 'flex-start'
				o['--box-jc'] = 'flex-start'
			elif str == 'bottom'
				o['--col-jc'] = 'flex-end'
				o['--box-jc'] = 'flex-end'
			elif str == 'middle'
				o['--col-jc'] = 'center'
				o['--box-jc'] = 'center'
				
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
			
			
		
	
	def text [...params]
		let out = {}
		let fonts = options.fonts
		let sizes = options.variants.fontSize
		let size = null
		let color = null
		
		let i = 0
		
		while i < params.length
			let param = params[i++]

			let value = String(param)
			let length = /\d/.test(value) and Length.parse(value)

			if options.fonts[value]
				out['font-family'] = options.fonts[value]
			elif value.match(/^(\d\d\d|bold|bolder|lighter|normal)$/)
				out['font-weight'] = value
			elif !size and (sizes[value] or (length))
				if !sizes[value] and !length.unit
					length.unit = 'px'

				size = [].concat(sizes[value] or length)
				if String(params[i]) == '/'
					size[1] = params[i + 1]
					i += 2

			elif color = $parseColor(value)
				out['color'] = String(color)
			
			elif let mixin = options.variants.text[value]
				if typeof mixin == 'string'
					mixin = mixin.replace(/\//g,' / ').split(/\s+/)

				if mixin isa Array
					let parts = self.text(mixin)
					out = Object.assign(parts,out)
					continue
					
				for own k,v of mixin
					if out[k] and k == 'text-decoration' and v != 'undecorated'
						out[k] = out[k] + " " + v
					else
						out[k] = v
				# Object.apply(out,options.variants.text[value])

		if size
			let fs = Length.parse(size[0])
			let lh = Length.parse(size[1] or '')
			out['font-size'] = String(fs)

			if lh and !lh.unit
				let rounded = Math.round(fs.number * lh.number)
				if rounded % 2 == 1
					rounded++
				
				out['line-height'] = lh.number == 0 ? 'inherit' : String(fs.clone(rounded))
			elif lh
				out['line-height'] = String(lh)
			elif String(size[1]) == 'inherit'
				out['line-height'] = 'inherit'
			
			if out['line-height'] and out['line-height'] != 'inherit'
				out['--lh'] = out['line-height']

		# extract bold
		return out
		
	def layout_old [...params]
		let out = {}
		let schema = options.variants.layout
		for param,i in params
			let str = String(param)
			let val = schema[str]
			if val
				Object.assign(out,val)
			else
				# TODO check if it is a valid display value
				out.display = str
		# extract bold
		return out
		
	def layout [...params]
		let out = {}
		let schema = options.variants.layout
		# real positions ought to be set as important
		out.position = 'relative'

		for param,i in params
			# console.log 'display param',param
			let next = params[i + 1]
			let str = String(param)
			let val = schema[str]
			let u = param._unit

			if val
				Object.assign(out,val)
			
			elif param._color
				
				out.color = param
			elif options.fonts[str]
				out['font-family'] = options.fonts[str]
			elif self[str+'Layout']
				self[str+'Layout'](out,param)
			elif u == 'col' or u == 'cols' or u == 'c'
				out.display = 'grid'
				out.jc = 'var(--cols-jc,center)'
				
				let w = '1fr'
				if param.param
					param.param._unit ||= 'u'
					w = param.param.c!
				out['grid-template-columns'] = "repeat({param._number}, {w})"
			else
				# TODO check if it is a valid display value
				out.display = str
		# extract bold
		return out
		
	def composition [...params]
		let out = {}
		let fonts = options.fonts
		let schema = options.variants.helpers

		for param,i in params
			# find fonts and all that?
			let str = String(param)
			let val = schema[str]
			if val
				Object.assign(out,val)
			else
				self
				# TODO check if it is a valid display value
				# out.display = str
		# extract bold
		return out
	
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
		{'border-left-width': l, 'border-right-width': r}
		
	def border-y-width [t,b=t]
		{'border-top-width': t, 'border-bottom-width': b}
		
	def border-x-style [l,r=l]
		{'border-left-style': l, 'border-right-style': r}
		
	def border-y-style [t,b=t]
		{'border-top-style': t, 'border-bottom-style': b}

	# def shadow ...params
	#	{}
		
	def $u number, part
		let [step,num,unit] = config.step.match(/^(\-?[\d\.]+)(\w+|%)?$/)
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
			
		if typeof value == 'number' and config.step
			let [step,num,unit] = config.step.match(/^(\-?[\d\.]+)(\w+|%)?$/)
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
			
			elif key.indexOf('~') >= 0
				let keys = key.split('~')
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



###

:active
:any-link
:checked
:blank
:default
:defined
:dir()
:disabled
:empty
:enabled
:first
:first-child
:first-of-type
:fullscreen
:focus
:focus-visible
:focus-within
:has()
:host()
:host-context()
:hover
:indeterminate
:in-range
:invalid
:is() (:matches(), :any())
:lang()
:last-child
:last-of-type
:left
:link
:not()
:nth-child()
:nth-last-child()
:nth-last-of-type()
:nth-of-type()
:only-child
:only-of-type
:optional
:out-of-range
:placeholder-shown
:read-only
:read-write
:required
:right
:root
:scope
:target
:valid
:visited
:where()

###