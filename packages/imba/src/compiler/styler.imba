# var conv = require('../../vendor/colors')
import * as selparser from './selparse'
import {conv} from '../../vendor/colors'
import {fonts,colors,variants,named_colors} from './theme.imba'
import * as theme from  './theme.imba'

const extensions = {}
let ThemeInstance = null
const ThemeCache = new WeakMap

# {string: "hsla(0,0,0,var(--alpha,1))",h:0,s:0,l:0}
# {string: "hsla(0,100%,100%,var(--alpha,1))",h:0,s:0,l:100}

# export const properties =

export const layouts =

	vflex: do(o)
		o.display = 'flex'
		o.fld = 'column'

	hflex: do(o)
		o.display = 'flex'
		o.fld = 'row'

	box: do(o)
		o.display = 'flex'
		o.ai = 'center'
		o.jc = 'center'

	vbox: do(o)
		o.display = 'flex'
		o.fld = 'column'
		o.ai = 'center'
		o.jc = 'center'

	hbox: do(o)
		o.display = 'flex'
		o.fld = 'row'
		o.ai = 'center'
		o.jc = 'center'

	lbox: do(o)
		o.display = 'flex'
		o.fld = 'row'
		o.ai = 'center'
		o.jc = 'flex-start'

	rbox: do(o)
		o.display = 'flex'
		o.fld = 'row'
		o.ai = 'center'
		o.jc = 'flex-end'

	tbox: do(o)
		o.display = 'flex'
		o.fld = 'column'
		o.ai = 'center'
		o.jc = 'flex-start'

	bbox: do(o)
		o.display = 'flex'
		o.fld = 'column'
		o.ai = 'center'
		o.jc = 'flex-end'

	hgrid: do(o)
		o.display = 'grid'
		o.gaf = 'column'
		o.gac = '1fr'

	vgrid: do(o)
		o.display = 'grid'
		o.gaf = 'row'

for dir,row of 'vh'
	for va of 'tcbs'
		for ha of 'lcrs'

			let vm = {
				t: 'flex-start'
				b: 'flex-end'
				c: 'center'
				s: row ? 'stretch' : 'space-between'
			}

			let hm = {
				l: 'flex-start'
				r: 'flex-end'
				c: 'center'
				s: row ? 'space-between' : 'stretch'
			}

			let name = "{dir}{va}{ha}"
			let combo = {
				display: 'flex'
				fld: row ? 'row' : 'column'
				jc: row ? hm[ha] : vm[va]
				ai: row ? vm[va] : hm[ha]
				ac: row ? vm[va] : hm[ha]
			}

			layouts[name] = do(o)
				Object.assign(o,combo)
				return o

			# console.log "add layout function",name,combo

			# if dir == 'v'

export const validTypes = {
	ease: 'linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|stepsƒ|cubic-bezierƒ'
}

for own k,v of validTypes
	let o = {}
	for item in v.split('|')
		o[item] = 1
	validTypes[k] = o

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

	# add scroll snap shorthands?

	w: 'width'
	h: 'height'
	t: 'top'
	b: 'bottom'
	l: 'left'
	r: 'right'
	s: 'size'
	mih: 'min-height'
	mah: 'max-height'
	miw: 'min-width'
	maw: 'max-width'
	# size: ['width','height']

	# justify
	ji: 'justify-items'
	jc: 'justify-content'
	js: 'justify-self'
	j: ['justify-content','justify-items'] # Deprecate?

	# align
	ai: 'align-items'
	ac: 'align-content'
	as: 'align-self'
	a: ['align-content','align-items'] # Deprecate?

	# justify & align
	# To fit better with the spec - this ought to be
	jai: 'place-items'
	jac: 'place-content'
	jas: 'place-self'
	# ja: ['place-items','place-content']
	ja: 'justify-align'

	# consider using these instead
	# pi: 'place-items'
	# pc: 'place-content'
	# ps: 'place-self'
	# pa: 'place-all'

	# flex
	fl: 'flex'
	flf: 'flex-flow'
	fld: 'flex-direction'
	flb: 'flex-basis'
	flg: 'flex-grow'
	fls: 'flex-shrink'
	flw: 'flex-wrap'

	# fonts
	ff: 'font-family'
	fs: 'font-size'
	fw: 'font-weight'
	ts: 'text-shadow' # DEPCRATED - use for font-style instead?
	txs: 'text-shadow'

	# text-decoration
	td: 'text-decoration'
	tdl: 'text-decoration-line'
	tdc: 'text-decoration-color'
	tds: 'text-decoration-style'
	tdt: 'text-decoration-thickness'
	tdsi: 'text-decoration-skip-ink'
	tuo: 'text-underline-offset'

	# text-emphasis
	te: 'text-emphasis'
	tec: 'text-emphasis-color'
	tes: 'text-emphasis-style'
	tep: 'text-emphasis-position'
	tet: 'text-emphasis-thickness'

	# text
	tt: 'text-transform'
	ta: 'text-align'
	va: 'vertical-align'
	ls: 'letter-spacing'
	lh: 'line-height'

	# border
	bd: 'border'
	bdr: 'border-right'
	bdl: 'border-left'
	bdt: 'border-top'
	bdb: 'border-bottom'
	bdx: 'border-x'
	bdy: 'border-y'

	# border-style
	bs: 'border-style'
	bsr: 'border-right-style'
	bsl: 'border-left-style'
	bst: 'border-top-style'
	bsb: 'border-bottom-style'
	bsx: 'border-x-style'
	bsy: 'border-y-style'

	# border-width
	bw: 'border-width'
	bwr: 'border-right-width'
	bwl: 'border-left-width'
	bwt: 'border-top-width'
	bwb: 'border-bottom-width'
	bwx: 'border-x-width'
	bwy: 'border-y-width'

	# border-color
	bc: 'border-color'
	bcr: 'border-right-color'
	bcl: 'border-left-color'
	bct: 'border-top-color'
	bcb: 'border-bottom-color'
	bcx: 'border-x-color'
	bcy: 'border-y-color'

	# border-radius
	rd: 'border-radius'
	rdtl: 'border-top-left-radius'
	rdtr: 'border-top-right-radius'
	rdbl: 'border-bottom-left-radius'
	rdbr: 'border-bottom-right-radius'

	# TODO change these into a shared main one
	rdt: 'border-top-radius'
	rdb: 'border-bottom-radius'
	rdl: 'border-left-radius'
	rdr: 'border-right-radius'

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
	g: 'gap'
	rg: 'row-gap'
	cg: 'column-gap'
	gtr: 'grid-template-rows'
	gtc: 'grid-template-columns'
	gta: 'grid-template-areas'
	gar: 'grid-auto-rows'
	gac: 'grid-auto-columns'
	gaf: 'grid-auto-flow'
	gcg: 'grid-column-gap'
	grg: 'grid-row-gap'
	ga: 'grid-area'
	gr: 'grid-row'
	gc: 'grid-column'
	gt: 'grid-template'
	grs: 'grid-row-start'
	gcs: 'grid-column-start'
	gre: 'grid-row-end'
	gce: 'grid-column-end'

	# shadow
	shadow: 'box-shadow' # DEPRECATED
	bxs: 'box-shadow'

	# overflow
	'of':'overflow'
	'ofx':'overflow-x'
	'ofy':'overflow-y'
	'ofa':'overflow-anchor'
	'tof': 'text-overflow'

	# content
	prefix: 'content@before'
	suffix: 'content@after'

	# transforms
	x: 'x'
	y: 'y'
	z: 'z'
	rotate: 'rotate'
	scale: 'scale'
	'scale-x': 'scale-x'
	'scale-y': 'scale-y'
	'skew-x': 'skew-x'
	'skew-y': 'skew-y'
	origin: 'transform-origin'

	# others
	ws: 'white-space'
	zi: 'z-index'
	pe: 'pointer-events'
	us: 'user-select'
	o: 'opacity'
	tween: 'transition'

	# easing
	e: 'ease' # Deprecate

	ea: 'ease'
	ead: 'ease-all-duration'
	eaf: 'ease-all-function'
	eaw: 'ease-all-delay'

	eo: 'ease-opacity'
	eod: 'ease-opacity-duration'
	eof: 'ease-opacity-function'
	eow: 'ease-opacity-delay'

	ec: 'ease-colors'
	ecd: 'ease-colors-duration'
	ecf: 'ease-colors-function'
	ecw: 'ease-colors-delay'

	eb: 'ease-box'
	ebd: 'ease-box-duration'
	ebf: 'ease-box-function'
	ebw: 'ease-box-delay'

	et: 'ease-transform'
	etd: 'ease-transform-duration'
	etf: 'ease-transform-function'
	etw: 'ease-transform-delay'

	# outline
	ol: 'outline'
	olo: 'outline-offset'
	olc: 'outline-color'
	ols: 'outline-style'
	olw: 'outline-width'

export const abbreviations = {}
for own k,v of aliases
	if typeof v == 'string'
		abbreviations[v] = k

def isNumber val
	if val._value and val._value._type == "NUMBER" and !val._unit
		return true
	return false

export def parseColorString str
	if named_colors[str]
		str = named_colors[str]

	if str[0] == '#'
		let hex = conv.hex.rgb(str)
		return conv.rgb.hsl(hex)

	if let m = str.match(/^(hsla?|rgba?)\((.+)\)$/)
		let [a,b,c,d = ''] = m[2].replace(/[\,\/]g/,' ').split(/\s+/g)

		let hsl

		if m[1] == 'rgb' or m[1] == 'rgba'
			hsl = conv.rgb.hsl([parseFloat(a),parseFloat(b),parseFloat(c)])

		if m[1] == 'hsl' or m[1] == 'hsla'
			hsl = [parseFloat(a),parseFloat(b),parseFloat(c)]

		return hsl

	return null

export class Color

	static def from raw
		if typeof raw == 'string'
			if raw[0] == '#' and !raw.match(/^\#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})?$/)
				return new NamedColor(raw.slice(1))

			raw = parseColorString(raw)

		if raw isa Array
			return new self('',raw[0],raw[1],raw[2])

		return null

	def constructor name,h,s,l,a = 1
		name = name
		h = h
		s = s
		l = l
		a = a

	def alpha a = 1
		new Color(name,h,s,l,a)

	def clone
		new Color(name,h,s,l,a)

	def mix other, hw = 0.5, sw = 0.5, lw = 0.5
		let	h1 = h + (other.h - h) * hw
		let	s1 = s + (other.s - s) * sw
		let	l1 = l + (other.l - l) * lw
		return new Color(name + other.name,h1,s1,l1)

	def toString a = a
		# if typeof a == 'string' and a.match(/%$/)
		#	a = parseFloat(a.slice(0,-1)) / 100
		if typeof a == 'string' and a[0] == '$'
			a = "var(--{a.slice(1)},100%)"
		"hsla({h.toFixed(2)},{s.toFixed(2)}%,{l.toFixed(2)}%,{a})"

	def toVar round = 2
		"{Math.round(h)},{Math.round(s)}%,{Math.round(l)}%"
		# "{h.toFixed(2)},{s.toFixed(2)}%,{l.toFixed(2)}%"

	def c
		toString!

export class NamedColor < Color

	def toVar
		"var(--c_{name})"

export class Tint < Color

	def alpha a = 1
		new Tint(name,h,s,l,a)

	def clone
		new Tint(name,h,s,l,a)

	def toString a = a
		if typeof a == 'string' and a[0] == '$'
			a = "var(--{a.slice(1)},100%)"

		"hsla(var(--{name}),{a})"

	def toVar round = 2
		"var(--{name})"

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

export class Calc

	def constructor expr
		expr = expr

	def cpart parts
		let out = '('
		for part in parts
			if typeof part == 'string'
				out += ' ' + part + ' '
			elif typeof part == 'number'
				out += part
			elif part.c isa Function
				out += part.c!
			elif part isa Array
				out += cpart(part)

		out += ')'
		return out

	def c
		'calc' + cpart(expr)

# This has to move into StyleTheme class
let defaultPalette = {
	# should deprecate
	current: {string: "currentColor", c: do 'currentColor' }
	transparent: new Color('transparent',0,0,100,'0%')
	clear: new Color('transparent',100,100,100,'0%')
	black: new Color('black',0,0,0,'100%')
	white: new Color('white',0,0,100,'100%')
}

def parseColors palette, colors
	for own name,variations of colors
		if typeof variations == 'string'
			palette[name] = variations
			continue

		for own subname,raw of variations
			let path = name + subname

			if palette[raw]
				palette[path] = palette[raw]
			else
				let [h,s,l] = parseColorString(raw)
				let color = palette[path] = new Color(path,h,s,l,'100%')
	return palette

parseColors(defaultPalette,colors)

const VALID_CSS_UNITS = 'cm mm Q in pc pt px em ex ch rem vw vh vmin vmax % s ms fr deg rad grad turn Hz kHz'.split(' ')

export class StyleTheme

	static def instance
		ThemeInstance ||= new self

	static def propAbbr name
		abbreviations[name] or name

	static def wrap config
		return self.instance() unless config

		let theme = ThemeCache.get(config)
		ThemeCache.set(config,theme = new self(config)) unless theme
		return theme

	def constructor ext = {}
		options = theme
		palette = Object.assign({},defaultPalette)

		ext = ext.theme if ext.theme

		if ext and ext.colors
			parseColors(palette,ext.colors)

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

	def padding_x [l,r=l]
		{'padding-left': l, 'padding-right': r}

	def padding_y [t,b=t]
		{'padding-top': t, 'padding-bottom': b}

	def margin_x [l,r=l]
		{'margin-left': l, 'margin-right': r}

	def margin_y [t,b=t]
		{'margin-top': t, 'margin-bottom': b}

	def ease pars
		$ease(pars,'a')

	def ease_opacity pars
		$ease(pars,'o')

	def ease_box pars
		$ease(pars,'b')

	def ease_transform pars
		$ease(pars,'t')

	def ease_colors pars
		$ease(pars,'c')

	def $ease pars, k = '',slot = null
		pars = pars.slice(0)

		let o = {__ease__: k}

		if pars[0]..unit
			o["--e_{k}d"] = pars[0]
			pars.shift!

		if pars[0] and !pars[0].unit
			let ev = $varFallback('ease',[pars[0]])
			o["--e_{k}f"] = ev
			pars.shift!

		if pars[0] and pars[0].unit
			o["--e_{k}w"] = pars[0]
			pars.shift!

		return o

	def inset [t,r=t,b=t,l=r]
		{position: 'absolute', top: t, right: r, bottom: b, left: l}

	def size [w,h=w]
		{width: w, height: h}

	def grid params
		if let m = $varFallback('grid',params)
			return m
		return

	def animation ...params

		let valids = {
			normal:1,reverse:1,alternate:1,'alternate-reverse':1
			infinite:2
			none:3,forwards:3,backwards:3,both:3
			running:4,paused:4
		}
		let used = {}
		for anim,k in params
			let name = null
			let ease = null
			for part,i in anim
				let str = String(part)
				let typ = valids[str]

				if validTypes.ease[str] and !ease
					ease = yes
				elif typ
					if used[typ]
						name = [i,str]
					used[typ] = yes
				elif str.match(/^[^\d\.]/) and str.indexOf('(') == -1
					if name
						ease = [i,str]
					else
						name = [i,str]
			if name
				anim[name[0]] = new Var("animation-{name[1]}",name[1])
			if ease isa Array
				let fallback = options.variants.easings[ease[1]]
				anim[ease[0]] = new Var("ease-{ease[1]}",fallback)

		return {animation: params}

	def animation_timing_function ...params
		for param,i in params
			let fb = $varFallback('ease',param)
			params[i] = fb if fb
		return params

	def animation_name ...params
		for param,i in params
			let fb = $varFallback('animation',param)
			if fb
				# param[0] = fb[0]
				params[i] = fb
			# params[i] = $varFallback('animation',param)
		return params

		if let m = $varFallback('animation',params)
			return m
		return

	def display params
		let out = {display: params}
		for par in params
			if let layout = layouts[String(par)]
				layout.call(this,out,par,params)
		return out

	def text_transform params
		let out = {'text-transform': params}
		let str = String(params[0])
		if str is 'cap'
			out['text-transform'] = 'capitalize'
		elif str is 'up'
			out['text-transform'] = 'uppercase'
		out

	def position params
		let out = {position: params}
		let str = String(params[0])
		if str == 'abs'
			out.position = 'absolute'
		elif str == 'rel'
			out.position = 'relative'
		return out

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

			if group and parts.length == 0
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

		# this is a hack
		Object.assign(out,{'--e_rest': parts},add)
		return out

	def font params,...rest
		for param,i in params
			yes
		return

	def font_family params
		if let m = $varFallback('font',params)
			return m
		return

	def text_shadow ...params
		for par,i in params
			if let m = $varFallback('text-shadow',par)
				params[i] = m
		return params

	def box_shadow ...params
		# console.log params.length # ,a..length
		let o = {'box-shadow': params}
		for pair,i in params
			# console.log par.length,par[0]
			let tpl = no
			for par,pi in pair
				if pi == 0 and pair.length < 3
					let str = String(par)
					if str.match(/^[\w\-]+$/)
						tpl = str
						pair[pi] = new Var("box-shadow-{str}",par)

				if pi == 1 and tpl
					o["--bxs-{tpl}-color"] = "/*##*/{par}"

					if par.param
						o["--bxs-{tpl}-alpha"] = par.param.toAlpha!

					par.set(parameterize: yes)
					# console.log 'dealing with the color',par.option('parameterize')
					pair[pi] = ''
					# pair.pop!
					yes
					# need to add another property
					# if let m = $varFallback('box-shadow',par)
					#	params[i] = m
		return o
		return params

	def grid_template params
		for param,i in params
			if isNumber(param)
				param._resolvedValue = "repeat({param._value},1fr)"
		return

	def grid_template_columns params
		grid_template(params)

	def grid_template_rows params
		grid_template(params)

	def size [w,h = w]
		{width: w, height: h}

	def font_size [v]
		let sizes = options.variants['font-size']
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

	def line_height [v]
		let uvar = v
		# TODO what if it has u unit?
		if v._number and !v._unit
			uvar = v.clone(v._number,'em')

		return {
			'line-height': v
			'--u_lh': uvar
		}

	def text_decoration params
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
		$border(params,'')

	def $border params,side = ''
		let o = {__border__: yes}
		let len = params.length

		if len == 3
			o["border{side}"] = [params]
			return o

		if isNumeric(params[0])
			if len == 2 and isColorish(params[1])
				params.splice(1,0,'solid')
				o["border{side}"] = [params]
				return o

			o["border{side}-style"] = 'solid'
			o["border{side}-width"] = params.shift!

		if isColorish(params[0])
			if len == 1
				o["border{side}"] = [['1px','solid',params.shift!]]
			else
				# add weak border styles
				o["border{side}-width"] ||= '1px'
				o["border{side}-style"] = 'solid'
				o["border{side}-color"] = params.shift!

		# TODO if it is not a variable?
		if params[0]
			o["border{side}-style"] = params[0]

		return o

	def border_left params
		return $border(params,'-left')

	def border_right params
		return $border(params,'-right')

	def border_top params
		return $border(params,'-top')

	def border_bottom params
		return $border(params,'-bottom')

	def border_x params
		return $border(params,'-inline')

	def border_y params
		return $border(params,'-block')

	def border_x_width [l,r=l]
		{bwl: l, bwr: r}

	def border_y_width [t,b=t]
		{bwt: t, bwb: b}

	def border_x_style [l,r=l]
		{bsl: l, bsr: r}

	def border_y_style [t,b=t]
		{bst: t, bsb: b}

	def border_x_color [l,r=l]
		{bcl: l, bcr: r}

	def border_y_color [t,b=t]
		{bct: t, bcb: b}

	# it should rather send the same to both
	def border_top_radius pars
		{'border-top-left-radius': [pars], 'border-top-right-radius': [pars]}

	def border_left_radius pars
		{'border-top-left-radius': [pars], 'border-bottom-left-radius': [pars]}

	def border_bottom_radius pars
		{'border-bottom-left-radius': [pars], 'border-bottom-right-radius': [pars]}

	def border_right_radius pars
		{'border-top-right-radius': [pars], 'border-bottom-right-radius': [pars]}

	def justify_align [justify,align = justify]
		let o = {}
		if justify == align
			o['place-items'] = o['place-content'] = justify
		else
			o['justify-content'] = o['justify-items'] = justify
			o['align-content'] = o['align-items'] = align
		return o

	def outline params		
		# outlined
		if params.length == 3
			return {outline: [params]}
		let o = {__outline__: yes}
		if isNumeric(params[0])
			o.olw = params.shift!
		if isColorish(params[0])
			o.olc = params.shift!

		if !o.olw
			o['--ol_w'] = '1px'
		return o

	def gap [rg,cg = rg]
		let o = {}
		if cg != rg
			o = {'row-gap': rg, 'column-gap': cg}
		else
			o = {'gap': rg}
			o['--u_rg'] = rg unless rg._unit == 'rg'
			o['--u_cg'] = rg unless rg._unit == 'cg'
		return o

	def row_gap [v]
		let o = {'row-gap': v}
		o['--u_rg'] = v unless v._unit == 'rg'
		return o

	def column_gap [v]
		let o = {'column-gap': v}
		o['--u_cg'] = v unless v._unit == 'cg'
		return o

	def tint [v]

		let o = {'--hue': v}
		for i in [0 ... 10]
			o["--hue{i}"] = "/*##*/{v}{i}"
			# new Tint("v{i}")
		return o

	def hue [v]
		let o = {'--hue': v}
		for i in [0 ... 10]
			o["--hue{i}"] = "/*##*/{v}{i}"
			# new Tint("v{i}")
		return o

	# def shadow ...params
	#	{}

	def $color name
		let m = name.match(/^([A-Za-z\-]+)(\d)(\d*)$/)
		let ns = m and m[1]

		# aliased colors
		if ns and typeof palette[ns] == 'string'
			return $color(palette[ns] + name.slice(ns.length))

		if ns == 'hue'
			return new Tint(name)

		if palette[name]
			return palette[name]

		if m
			let nr = parseInt(m[2])
			let fraction = m[3] ? parseFloat("0.{m[3]}") : 0
			let from = null
			let to = null

			# what if it is fractional?

			# if nr > 9
			#	fraction = (nr % 100) / 10
			#	nr = Math.floor(nr / 100)

			let n0 = nr + 1
			let n1 = nr

			if typeof palette[ns] == 'string'
				# proxy to a different color
				return $color(palette[ns] + name.slice(ns.length))

			while n0 > 1 and !from
				from = palette[ns + (--n0)]

			while n1 < 9 and !to
				to = palette[ns + (++n1)]

			# only when we could not find colors?
			let weight = ((nr - n0) + (fraction)) / (n1 - n0)
			let hw = weight
			let sw = weight
			let lw = weight

			if !to
				to = palette.black
				hw = 0
				sw = lw = fraction

			if !from
				from = palette.blue1
				hw = 1
				sw = lw = 1 - fraction

			if from and to
				return palette[name] = from.mix(to,hw,sw,lw)

		if let parsed = parseColorString(name)
				return new Color('',...parsed)
		null

	def isNumeric val
		return true if isNumber(val)
		return true if typeof val == 'number'
		return true if String(val).match(/^[\-\+]?\d?(\.?\d+)(\w+|%)?$/)
		return false

	def isColorish val
		return true if $parseColor(val)
		return false

	# too many methods doing the same thing
	def $parseColor identifier
		let key = String(identifier)
		if let color = $color(key)
			return color

		if key.match(/^#[a-fA-F0-9]{3,8}/)
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
			if exclude.indexOf(str) == -1 and str.match(/^[\w\-]+$/)
				if name == 'font' and fonts[str]
					fallback = fonts[str]
				if name == 'ease' and options.variants.easings[str]
					fallback = options.variants.easings[str]
				# elif name == 'box-shadow' and
				return [new Var("{name}-{str}",fallback)]
		return

	def $value value, index, config

		let key = config
		let orig = value
		let raw = value && value.toRaw ? value.toRaw! : String(value)
		let str = String(value)
		let fallback = no
		let result = null
		let unit = orig._unit

		# console.log 'value',key
		# console.log 'resolve value',raw
		if typeof config == 'string'
			if aliases[config]
				config = aliases[config]

				if config isa Array
					config = config[0]

			if config.match(/^((min-|max-)?(width|height)|top|left|bottom|right|padding|margin|sizing|inset|spacing|sy$|s$|\-\-s[xy])/)
				config = 'sizing'
			elif config.match(/^\-\-[gs][xy]_/)
				config = 'sizing'
			elif config.match(/^(row-|column-)?gap/)
				config = 'sizing'
			elif config.match(/^[mps][trblxy]?$/)
				config = 'sizing'
			elif config.match(/^[trblwh]$/)
				config = 'sizing'
			elif config.match(/^e[otbca]?f$/) or config.match(/^ease(-\w+)?-function$/)
				config = 'easings'
				fallback = 'ease'
			elif config.match(/^border-.*radius/) or config.match(/^rd[tlbr]{0,2}$/)
				config = 'radius'
				fallback = 'border-radius'
			# elif config.match(/^box-shadow/)
			# 	fallback = config = 'box-shadow'
			elif config.match(/^tween|transition/) and options.variants.easings[raw]
				return options.variants.easings[raw]

			config = options.variants[config] or {}

		if value == undefined
			value = config.default

		if config.hasOwnProperty(raw)
			# should we convert it or rather just link it up?
			value = config[value]

		if typeof raw == 'number' and config.NUMBER
			let [step,num,unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/)
			return value * parseFloat(num) + unit

		elif typeof raw == 'string'
			if let color = $parseColor(raw)
				return color

		if fallback and !unit
			let okstr = str.match(/^[a-zA-Z\-][\w\-]*$/) and !str.match(/^(none|inherit|unset|initial)$/)
			let oknum = unit and VALID_CSS_UNITS.indexOf(unit) == -1
			if (okstr or oknum) and value.alone
				return new Var("{fallback}-{str}",orig != value ? value : raw)

		return value

	def transformColors text
		text = text.replace(/\/\*(#+)\*\/(\#?\w+)(?:\/(\d+%?|\$[\w\-]+))?/g) do(m,typ,c,a)
			if let color = $color(c)
				if typ == '#'
					return color.toString(a,typ)
				elif typ == '##'
					return color.toVar(a)
			return m
		return text

# should not happen at root - but create a theme instance

export const StyleExtenders = {
	transform: '''
		--t_x:0;--t_y:0;--t_z:0;--t_rotate:0;
		--t_scale:1;--t_scale-x:1;--t_scale-y:1;
		--t_skew-x:0;--t_skew-y:0;
		transform: translate3d(var(--t_x),var(--t_y),var(--t_z))
		           rotate(var(--t_rotate))
		           skewX(var(--t_skew-x)) skewY(var(--t_skew-y))
		           scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale));
	'''

	outline: '''
		--ol_s:solid;--ol_w:1px;--ol_o:0px; --ol_c:transparent;
		outline:var(--ol_w) var(--ol_s) var(--ol_c); outline-offset:var(--ol_o);
		outline:1px solid transparent; outline-offset:var(--ol_o);
	'''

	ease: '''
		--e_ad:0ms;--e_af:cubic-bezier(0.23, 1, 0.32, 1);--e_aw:0ms;
		--e_od:var(--e_ad);--e_of:var(--e_af);--e_ow:var(--e_aw);
		--e_cd:var(--e_ad);--e_cf:var(--e_af);--e_cw:var(--e_aw);
		--e_bd:var(--e_ad);--e_bf:var(--e_af);--e_bw:var(--e_aw);
		--e_td:var(--e_bd);--e_tf:var(--e_bf);--e_tw:var(--e_bw);
		--e_b:var(--e_bd) var(--e_bf) var(--e_bw);
		--e_c:var(--e_cd) var(--e_cf) var(--e_cw);
		--e_rest:any;
		transition:
			all var(--e_ad) var(--e_af) var(--e_aw),
			opacity var(--e_od) var(--e_of) var(--e_ow),
			transform var(--e_td) var(--e_tf) var(--e_tw),
			color var(--e_c),background-color var(--e_c),border-color var(--e_c),fill var(--e_c),stroke var(--e_c), outline-color var(--e_c), box-shadow var(--e_c),
			inset var(--e_b), width var(--e_b),height var(--e_b),max-width var(--e_b),max-height var(--e_b),min-width var(--e_b),min-height var(--e_b),border-width var(--e_b),outline-width var(--e_b),stroke-width var(--e_b),margin var(--e_b),padding var(--e_b),
			var(--e_rest);
	'''
}

export const AutoPrefixes = {
	'user-select': ['-webkit-user-select']
	'appearance': ['-webkit-appearance']
	'backdrop-filter': ['-webkit-backdrop-filter']
	'mask-image': ['-webkit-mask-image']
}

export class StyleSheet
	def constructor stack
		#stack = stack
		#parts = []
		#apply = {}
		#register = {}
		transforms = null

	get transitions
		#register.transition

	def add part, meta = {}
		#parts.push(part)

		if meta.apply
			for own k,v of meta.apply
				let arr = #apply[k] ||= []
				for item in v
					arr.push(item) unless arr.indexOf(item) >= 0
		return

	def js root, stack
		let js = []

		for own k,v of #register
			js.push root.runtime!.transitions + ".addSelectors({JSON.stringify(v)},'{k}')"
		return js.join('\n')

	def parse
		return #string if #string

		let js = []
		let parts = #parts.slice(0)

		let prepend = do(val)
			unless parts.indexOf(val) >= 0
			parts.unshift(val)

		for own k,v of #apply
			let helper = StyleExtenders[k]

			let base = {}
			let all = {}
			let groups = {"": base}
			let easing = k == 'transition' or k.match(/^_(off|out|in)_sized/)

			for item in v
				for rule in (item.#rules or [])
					# console.log rule
					let ns = rule.#media or ''
					let sel = rule.#string.replace(/:not\((#_|\._0?)+\)/g,'')

					if easing or k == 'ease'
						sel = sel.replace(/\.\\@(off|out|in|on)\b/g,'')
					sel = sel.replace(/((\:+)[\w\-]+)(?!\()/g) do(m,k) k.length > 1 ? m : ''
					sel = sel.replace(/^\:root /g,'')

					# simplify the selectors as much as possible

					let group = groups[ns] ||= {}
					group[sel] = rule
					all[sel] = yes

			# console.log 'groups',groups
			if helper

				for own ns,group of groups
					let sel = Object.keys(group)
					if ns != ''
						sel = sel.filter do !base[$1]

					continue if sel.length == 0
					# sel.unshift('._ease_') if k == 'transition' or k == 'ease'

					let sels = sel.sort do |a,b| a.length - b.length
					let corr = []

					for s,i in sels
						let pre = sels.slice(0,i)
						let some = pre.find do
							s.indexOf($1) >= 0
						if !some or s.match(/[\s\>\,]|:(not|before|after|marker)|::/)
							corr.push(s)
					sel = corr

					let str = sel.join(', ') + ' {\n' + helper + '\n}'

					if ns
						str = ns + ' {\n' + str + '\n}'

					parts.unshift(str)

			let selectors = Object.keys(all)
			if k == 'transition' and selectors.length
				prepend('.\\@enter:not(#_),.\\@leave:not(#_) {--e_ad:300ms;}')
				prepend('._instant_:not(#_):not(#_):not(#_):not(#_) { transition-duration:0ms !important; }') #
			if easing
				#register[k] = selectors

		#string = parts.join('\n\n')

		if #stack.resolveColors!
			#string = #stack.theme!.transformColors(#string, prefix: false)

		return #string

	def toString
		parse!

export class StyleRule

	def constructor parent,selector,content,options = {}
		parent = parent
		selector = selector
		content = content
		options = options
		isKeyFrames = !!selector.match(/\@keyframes \w/)
		isKeyFrame = parent and parent.isKeyFrames
		meta = {}

	def root
		parent ? parent.root : self

	def apply kind,sel
		let arr = options.apply[kind] ||= []
		arr.push(sel)

	def register kind,sel
		let arr = options.register[kind] ||= []
		arr.push(sel)

	def toString o = {}
		let parts = []
		let subrules = []
		let subrule

		if isKeyFrames
			let [context,name] = selector.split(/\s*\@keyframes\s*/)

			context = context.trim!
			name = name.trim!

			let path = [name,context,options.ns].filter(do $1).join('-')
			# what if it is global?
			meta.name = name
			meta.uniqueName = path.replace(/[\s\.\,]+/g,'').replace(/[^\w\-]/g,'_')

			if options.global and !context
				meta.uniqueName = meta.name

			let subprops = {}
			subprops["--animation-{name}"] = "{meta.uniqueName}"

			if context
				subrules.push new StyleRule(null,context,subprops,options)
			elif options.ns and !options.global
				subrules.push new StyleRule(null,".{options.ns}",subprops,{})

		let selpri = typeof selector == 'string' and selector.indexOf('@important') >= 0 ? 1 : 0

		for own key,value of self.content
			continue if value == undefined

			let subsel = null
			let important = selpri ? ' !important' : ''
			let rawkey = key

			# let [m,imp,name,mods] = (key.match(/^(\?*\!*)?([\w\-]+)(\§.+)?/) or [])

			# if imp
			#	important = imp[0] == '!' ? ' !important' : ''
			#	key = key.slice(imp.length)

			if key.indexOf('&') >= 0
				if isKeyFrames
					let keyframe = key.replace(/&/g,'')
					let rule = new StyleRule(self,keyframe,value,options)
					parts.push(rule.toString(indent: yes))
					continue

				let subsel = selparser.unwrap(selector,key)
				subrules.push new StyleRule(self,subsel,value,options)
				continue

			elif key.indexOf('§') >= 0
				# let keys = key.replace(/[\.\~\@\+]/g,'\\$&').split('§')

				let keys = rawkey.split('§')
				# keys.slice(1).join(' ')
				# using :is it should be much, much easier with the nested selectors?
				# can even just take the whole outer selector as a simple :is on this element
				let substr = keys.slice(1).join('')
				# console.log "SUBSTR",substr
				# do we unwrap, or can we just use :where etc and trust it?
				let subsel = selparser.unwrap(selector,substr)
				let obj = {}
				obj[keys[0]] = value
				if subrule = subrules[subsel]
					subrule.content[keys[0]] = value
				else
					subrule = new StyleRule(self,subsel,obj,options)
					subrules.push subrules[subsel] = subrule
				continue

			elif key.match(/^__(\w+)__$/)
				meta[key.slice(2,-2)] = yes

			elif key[0] == '['
				# better to just check if key contains '.'
				# this is only for a single property
				# console.warn "DEPRECATED",key,self
				let o = JSON.parse(key)
				subrules.push new StyleRule(self,selector,value,options)
				continue

			elif key.match(/^outline-?/)
				meta.outline = yes
				parts.push "{key}: {value} !important;"

			elif key.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)
				unless meta.transform
					meta.transform = yes
				parts.push "--t_{key}: {value} !important;"
			elif key.match(/^(ease-.*)$/)
				meta.ease = yes
				let ref = key.replace('delay','wait').split('-').map(do $1[0]).join('')
				parts.push "--e_{ref.slice(1)}: {value} !important;"

				unless abbreviations[key]
					console.warn "{key} is not a valid style property"

			elif key.match(/^(--e_\w+)$/)
				meta.ease = yes
				if selector.match(/@in\b/)
					yes
					# TODO warn about easings not making sense inside here
				parts.push "{key}: {value} !important;"

			elif key.match(/^__ease__$/)
				yes
			else
				if key.match(/^(width|height)$/)
					# what about min/max sizes?
					meta.size = yes

				parts.push "{key}: {value}{important};"

				if AutoPrefixes[key]
					for prefixed in AutoPrefixes[key]
						parts.push "{prefixed}: {value}{important};"

		let out = ""

		let content = parts.join('\n')
		if o.indent or isKeyFrames
			content = '\n' + content + '\n'

		if isKeyFrame
			out = "{selector} \{{content}\}"

		elif isKeyFrames
			out = "@keyframes {meta.uniqueName} \{{content}\}"
		else
			let sel = isKeyFrame ? selector : selparser.parse(selector,options)
			if meta.transform
				apply('transform',sel)

			if meta.ease
				apply('ease',sel)

			if meta.outline
				apply('outline',sel)

			if sel and sel.hasTransitionStyles
				apply('transition',sel)
				apply('ease',sel) if !meta.ease

			if meta.size
				for typ in ['_off_','_out_','_in_']
					if sel[typ]
						apply("{typ}sized",sel)

			out = (content.match(/[^\n\s]/)) ? selparser.render(sel,content,options) : ""

		for own subrule in subrules
			out += '\n' + subrule.toString()

		return out
