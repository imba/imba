
var conv = require('../../vendor/colors')
import {fonts,colors,variants,breakpoints} from './theme.imba'

import * as theme from  './theme.imba'

const extensions = {}
var ThemeInstance = null

# {string: "hsla(0,0,0,var(--alpha,1))",h:0,s:0,l:0}
# {string: "hsla(0,100%,100%,var(--alpha,1))",h:0,s:0,l:100}

export const aliases =

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
	
	w: 'width'
	h: 'height'
	
	# flex
	ai: 'align-items'
	as: 'align-self'
	ac: 'align-content'
	jc: 'justify-content'
	fd: 'flex-direction'
	fg: 'flex-grow'
	fs: 'flex-shrink'
	fb: 'flex-basis'
	
	# margins
	d: 'display'
	l: 'layout'
	t: 'text'
	
	# borders
	b: 'border'
	bt: 'border-top'
	br: 'border-right'
	bb: 'border-bottom'
	bl: 'border-left'
	bc: 'border-color'
	bs: 'border-style'
	
	# background
	bg: 'background'
	bgp: 'background-position'
	bgr: 'background-repeat'
	bgi: 'background-image'
	bga: 'background-attachment'
	
	# TODO decide on one of these
	round: 'border-radius'
	radius: 'border-radius'

	shadow: 'box-shadow'
	
	# should rather use the multi-purpose [t]ext property
	td: 'text-decoration'
	tt: 'text-transform'
	ta: 'text-align'

	va: 'vertical-align'
	ls: 'letter-spacing'

export class Color
	
	def constructor name,h,s,l,a = '100%'
		name = name
		h = h
		s = s
		l = l
		a = a
		
	def alpha v
		Color.new(name,h,s,l,v)
	
	def toString
		"hsla({h.toFixed(2)},{s.toFixed(2)}%,{l.toFixed(2)}%,{a})"

export class Length
	
	static def parse value
		let m = String(value).match(/^(\-?[\d\.]+)(\w+|%)?$/)
		return null unless m
		return self.new(parseFloat(m[1]),m[2])
	
	def constructor number, unit
		number = number
		unit = unit
	
	def valueOf
		number
		
	def toString
		number + (unit or '')
		
	def clone num = number, u = unit
		Length.new(num,u)
		
	def rounded
		clone(Math.round(number))

# This has to move into StyleTheme class
var palette = {
	current: {string: "currentColor"}
	black: Color.new('black',0,0,0,'100%')
	white: Color.new('white',0,0,100,'100%')
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
			let color = palette[path] = Color.new(path,h,s,l,'100%')

# var colorRegex = RegExp.new('^(?:(\\w+)\-)?(' + Object.keys(palette).join('|') + ')\\b')
var colorRegex = RegExp.new('\\b(' + Object.keys(palette).join('|') + ')\\b')

export class StyleTheme
	
	static def instance
		ThemeInstance ||= self.new
		
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
		
	def space [length]
		{
			"padding": length # $length(length / 2)
			"& > *": {'margin': length } # $length(length / 2)
		}

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
			elif !size and (sizes[value] or (length and length.unit))
				size = [].concat(sizes[value] or length)
				if String(params[i]) == '/'
					size[1] = params[i + 1]
					i += 2
			elif color = $parseColor(value)
				out['color'] = String(color)
			
			elif let mixin = options.variants.text[value]
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

				out['line-height'] = String(fs.clone(rounded))
			elif lh
				out['line-height'] = String(lh)
			elif String(size[1]) == 'inherit'
				out['line-height'] = 'inherit'
			
			if out['line-height'] and out['line-height'] != 'inherit'
				out['--lh'] = out['line-height']

		# extract bold
		return out
		
	def layout [...params]
		let out = {}
		let schema = options.variants.layout
		for param,i in params
			let str = String(param)
			let val = schema[str]
			if val
				Object.assign(out,val)

		# extract bold
		return out
		
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
			if m = rest.match(/^\-(\d+)$/)
				color = color.alpha(m[1] + '%')
			# let name = key.replace(colorRegex,'COLOR').replace(/\-/g,'_')
			return color
		return null
		
	def $value value, index, config
		let key = config
		if typeof config == 'string'
			if config.match(/^(width|height|top|left|bottom|right|padding|margin|sizing|inset)/)
				config = 'sizing'
			elif config.match(/^(border-radius)/)
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
			# should we not rather convert hte value
			return value * parseFloat(num) + unit
		
		if typeof value == 'string'
			if let color = $parseColor(value)
				return color
			# console.log 'found color!!',self.colors[value]
			# return self.colors[value]

		return value
		
# should not happen at root - but create a theme instance

class Selectors
	static def parse context, states
		let parser = self.new
		parser.$parse(context,states)
		
	def $parse context, states
		let rule = '&'
		o = {context: context, media: []}
		for state in states
			let res
			let params = []
			
			if state isa Array
				params = state.slice(1)
				state = state[0]

			unless self[state]
				if let media = breakpoints[state]
					o.media.push(media)
					continue
					
				elif state.indexOf('&') >= 0
					res = state
				else
					let [prefix,...flags] = state.split('-')
					prefix = '_'+prefix if prefix == 'in' or prefix == 'is'

					if self[prefix] and flags.length
						params.unshift(".{flags.join('.')}")
						state = prefix
			
			if self[state]
				res = self[state](...params)
			

			if typeof res == 'string'
				rule = rule.replace('&',res)


		let sel = rule.replace(/\&/g,context)
		
		# possibly expand selectors?

		o.selectors = [sel]
		if o.media.length
			sel = '@media ' + o.media.join(' and ') + '{ ' + sel
		return sel

	def any
		'&'
		
	def pseudo type,sel
		sel ? "{sel}{type} &" : "&{type}"

	def hover sel
		pseudo(':hover',sel)
	
	def focus sel
		pseudo(':focus',sel)

	def active sel
		pseudo(':active',sel)
		
	def visited sel
		pseudo(':visited',sel)
	
	def disabled sel
		pseudo(':disabled',sel)
		
	def focus-within sel
		pseudo(':focus-within',sel)
		
	def odd sel
		pseudo(':nth-child(odd)',sel)		
		
	def even sel
		pseudo(':nth-child(even)',sel)
		
	def first sel
		pseudo(':first-child',sel)
		
	def last sel
		pseudo(':last-child',sel)
		
	def empty sel
		pseudo(':empty',sel)
		
	def hocus
		'&:matches(:focus,:hover)'
		
	def _in sel
		sel.indexOf('&') >= 0 ? sel : "{sel} &"
	
	def _is sel
		sel.indexOf('&') >= 0 ? sel : "&{sel}"
	
	def up sel
		sel.indexOf('&') >= 0 ? sel : "{sel} &"
	
	def sel sel
		sel.indexOf('&') >= 0 ? sel : "& {sel}"
	
	# selector matching the custom component we are inside
	def scope sel
		sel.indexOf('&') >= 0 ? sel : "{sel} &"

	# :light
	# :dark
	# :ios
	# :android
	# :mac
	# :windows
	# :linux
	# :print

	
export const TransformMixin = '''
	--t_x:0;--t_y:0;--t_z:0;--t_rotate:0;--t_scale:1;--t_scale-x:1;--t_scale-y:1;--t_skew-x:0;--t_skew-y:0;
	transform: translate3d(var(--t_x),var(--t_y),var(--t_z)) rotate(var(--t_rotate)) skewX(var(--t_skew-x)) skewY(var(--t_skew-y)) scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale));
'''

export class StyleRule
	
	def constructor context,states,modifiers
		context = context
		states = states
		selector = Selectors.parse(context,states)
		rules = modifiers
		selectors = {}
		options = {}
		
	def toString
		let sel = selector
		let parts = []
		let subselectors = {}
		let subrules = []

		for own key,value of rules
			continue if value == undefined
			
			let subsel = null
			
			if key.indexOf('&') >= 0
				# console.log 'subquery',key,value
				# let substates = states.concat([[key]])
				let substates = ([[key]]).concat(states)
				subrules.push StyleRule.new(context,substates,value)
				continue

				subsel = key.replace('&',sel)

				let sub = subselectors[subsel] ||= []
				for own subkey,subvalue of value
					unless subvalue == undefined
						sub.push "{subkey}: {subvalue};"
			
			elif key.indexOf('.') >= 0
				let keys = key.split('.')
				
				# let substates = states.concat(keys.slice(1))
				let substates = keys.slice(1).concat(states)
				# console.log 'compile with substates',substates
				# TODO use interpolated key?
				let obj = {}
				obj[keys[0]] = value				
				subrules.push StyleRule.new(context,substates,obj)
				continue
			
			elif key[0] == '['
				# better to just check if key contains '.'
				# this is only for a single property
				let o = JSON.parse(key)
				let substates = states.concat(o)
				subrules.push StyleRule.new(context,substates,value)
				continue

			elif key.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)
				unless options.transform
					options.transform = yes
					parts.unshift(TransformMixin)
				parts.push "--t_{key}: {value} !important;"
			else
				parts.push "{key}: {value};"

		let out = sel + ' {\n' + parts.join('\n') + '\n}'
		out += '}' if sel.indexOf('@media') >= 0
		
		for own subsel,contents of subselectors
			let subout = subsel + ' {\n' + contents.join('\n') + '\n}'
			subout += '}' if subsel.indexOf('@media') >= 0	
			out += '\n' + subout
		
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