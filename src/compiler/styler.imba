
var conv = require('../../vendor/colors')
import {fonts,colors} from './theme.imba'

const extensions = {}

var palette = {}
for own name,variations of colors
	let subcolors = palette[name] = {}
	for own subname,hex of variations
		let color = subcolors[subname] = {}
		palette[name + '-' + subname] = color
		let rgb = conv.hex.rgb(hex)
		let [h,s,l] = conv.rgb.hsl(rgb)
		color.hex = conv.hex.rgb(hex)
		color.h = h
		color.s = s
		color.l = l
		let path = name + '-' + subname
		let hslstr = "{h.toFixed(2)},{s.toFixed(2)}%,{l.toFixed(2)}%"
		color.bg = "hsla({hslstr},var(--background-opacity,1))"
		color.border = "hsla({hslstr},var(--border-opacity,1))"
		color.text = "hsla({hslstr},var(--text-opacity,1))"
		color.ph = "hsla({hslstr},var(--placeholder-opacity,1))"
		extensions['bg-' + path] = {'background-color': color.bg}
		extensions['border-' + path] = {'border-color': color.border}
		extensions['text-' + path] = {'color': color.text}
		extensions['ph-' + path] = {'::placeholder color': color.ph}
		extensions[path] = {'color': color.text}


class Selectors
	static def parse context, states
		let parser = self.new
		parser.$parse(context,states)
		
	def $parse context, states
		let rule = '&'
		let breakpoints = breakpoints
		let o = {context: context, media: []}
		for [state,...params] in states
			unless self[state]
				if let media = breakpoints[state]
					o.media.push(media)
				continue
				
			let res = self[state](o,...params)
			if typeof res == 'string'
				rule = rule.replace('&',res)
		let sel = rule.replace(/\&/g,context)
		o.selectors = [sel]
		if o.media.length
			sel = '@media ' + o.media.join(' and ') + '{ ' + sel
		return sel

	def any
		'&'

	def hover
		'&:hover'
	
	def focus
		'&:focus'
		
	def active
		'&:active'
		
	def visited
		'&:visited'
	
	def disabled
		'&:disabled'
		
	def focus-within
		'&:focus-within'
		
	def odd
		'&:nth-child(odd)'
		
	def even
		'&:nth-child(even)'
		
	def empty
		'&:empty'
		
	def hocus
		'&:matches(:focus,:hover)'
		
	def first
		'&:first-child'
		
	def last
		'&:last-child'
	
	def up o, sel
		sel.indexOf('&') >= 0 ? sel : "{sel} &"
	
	def sel o, sel
		sel.indexOf('&') >= 0 ? sel : "& {sel}"
	
	# selector matching the custom component we are inside
	def scope o, sel
		sel.indexOf('&') >= 0 ? sel : "{sel} &"
		
	get breakpoints
		{
			sm: '(min-width: 640px)'
			md: '(min-width: 768px)'
			lg: '(min-width: 1024px)'
			xl: '(min-width: 1280px)'
		}
		
	# :light
	# :dark
	# :ios
	# :android
	# :mac
	# :windows
	# :linux
	# :print
		

class Rules
	
	static def parse mods
		let parser = self.new
		parser.$parse(mods)
		
	def constructor
		self
	
	def $merge object, result
		if result isa Array
			for item in result
				$merge(object,item)
		else
			Object.assign(object,result)
		return object
				
		
	# pseudostates
	def $parse mods
		let values = {}
		
		for [mod,params] in mods
			let res = null
			let name = mod.replace(/\-/g,'_')
			if self[name]
				res = self[name](...params)
			elif extensions[mod]
				res = extensions[mod]
			else
				let [ns,name,variation] = mod.split('-')
				# look for potential colors
				if self[ns + '_COLOR']
					if let color = $parse-color(mod)
						res = self[ns + '_COLOR'](color)
			if res
				$merge(values,res)

		return values
	
	def $parse-color str
		let [ns,name,variation,add] = str.split('-')
		
		if let color = colors[name]
			color = color[variation] or color
			if color and color[ns]
				return color[ns]
		return null
	
	def bg_COLOR color
		{'background-color': color}
		
	def text_COLOR color
		{'color': color}
		
	def border_COLOR color
		{'border-color': color}	
		
	def stroke_COLOR color
		{'stroke': color}
	
	# converting argument to css values
	def dim value, fallback, type
		if value == undefined
			return dim(fallback,null,type)
		if typeof value == 'number'
			return value * 0.25 + 'rem'
		elif typeof value == 'string'
			return value
			
			
	# LAYOUT
	
	# Container
	
	# Box Sizing
	
	def box_border do {'box-sizing': 'border-box'}
	def box_content do {'box-sizing': 'content-box'}
	
	# Display
	
	def display v
		{display: v}
		
	def hidden do display('none')
	def block do display('block')
	def flow_root do display('flow-root')
	def inline_block do display('inline-block')
	def inline do display('inline')
	def grid do display('grid')
	def inline_grid do display('inline-grid')
	def table do display('table')
	def table_caption do display('table-caption')
	def table_cell do display('table-cell')
	def table_column do display('table-column')
	def table_column_group do display('table-column-group')
	def table_footer_group do display('table-footer-group')
	def table_header_group do display('table-header-group')
	def table_row_group do display('table-row-group')
	def table_row do display('table-row')
		
	def flex
		display('flex')
		
	def inline_flex
		display('inline-flex')
	
	# Float
	def float_right do {float: 'right'}
	def float_left do {float: 'left'}
	def float_none do {float: 'none'}
	def clearfix do
		{'&::after': {content: "", display: 'table', clear: 'both'}}
	
	# Clear
	def clear_right do {clear: 'right'}
	def clear_left do {clear: 'left'}
	def clear_both do {clear: 'both'}
	def clear_none do {clear: 'none'}
	
	# Object Fit
	def object_contain do {'object-fit': 'contain'}
	def object_cover do {'object-fit': 'cover'}
	def object_fill do {'object-fit': 'fill'}
	def object_none do {'object-fit': 'none'}
	def object_scale_down do {'object-fit': 'scale-down'}
	
	# Object Position
	
	# Overflow
	def overflow_hidden do {overflow: 'hidden'}
	
	# Position
	
	# Visibility
	
	# Z-index
	def z(v) do {'z-index': v}
		
	# FLEXBOX
	
	# Flex Direction
	
	def flex_row
		{'flex-direction': 'row'}
	
	def flex_row_reverse
		{'flex-direction': 'row-reverse'}
	
	def flex_col
		{'flex-direction': 'column'}
	
	def flex_col_reverse
		{'flex-direction': 'column-reverse'}
		
	def ltr
		{'flex-direction': 'row'}
	
	def rtl
		{'flex-direction': 'row-reverse'}
	
	def ttb
		{'flex-direction': 'column'}
	
	def btt
		{'flex-direction': 'column-reverse'}

	# add aliases ltr, ttb, btt, rtl?
	
	# Flex Wrap
	
	# margin
	def mt(v0,v1) do {'margin-top':    dim(v0,v1)}
	def ml(v0,v1) do {'margin-left':   dim(v0,v1)}
	def mr(v0,v1) do {'margin-right':  dim(v0,v1)}
	def mb(v0,v1) do {'margin-bottom': dim(v0,v1)} 
	def mx(l,r=l) do {'margin-left': dim(l), 'margin-right': dim(r)}
	def my(t,b=t) do {'margin-top': dim(t), 'margin-bottom': dim(b)}
	def m(t,r,b,l) do [mt(t),mr(r,t),mb(b,t),ml(l,r == undefined ? t : r)]
	
	# padding
	def pt(v0,v1) do {'padding-top':    dim(v0,v1)}
	def pl(v0,v1) do {'padding-left':   dim(v0,v1)}
	def pr(v0,v1) do {'padding-right':  dim(v0,v1)}
	def pb(v0,v1) do {'padding-bottom': dim(v0,v1)}
	def px(l,r=l) do {'padding-left': dim(l), 'padding-right': dim(r)}
	def py(t,b=t) do {'padding-top': dim(t), 'padding-bottom': dim(b)}
	def p(t,r=t,b=t,l=r)
		{
			'padding-top': dim(t),
			'padding-right': dim(r),
			'padding-bottom': dim(b),
			'padding-left': dim(l)
		}
		# do [pt(t),pr(r,t),pb(b,t),pl(l,r == undefin ed ? t : r)]
		
	# positioning
	# add longer aliases like left,right,bottom,top?
	def t(v0,v1) do {'top':    dim(v0,v1)}
	def l(v0,v1) do {'left':   dim(v0,v1)}
	def r(v0,v1) do {'right':  dim(v0,v1)}
	def b(v0,v1) do {'bottom': dim(v0,v1)}
	def tl(t,l) do  {'top': dim(t),'left': dim(l,t)}
	def tr(t,r) do  {'top': dim(t),'right': dim(r,t)}
	def bl(b,l) do  {'bottom': dim(b),'left': dim(l,t)}
	def br(b,r) do  {'bottom': dim(b),'right': dim(b,r)}

	def inset(t,r=t,b=t,l=r)
		{
			'top': dim(t),
			'right': dim(r),
			'bottom': dim(b),
			'left': dim(l)
		}
		
	def w(w) do  {'width': dim(w)}
	def h(w) do  {'heigth': dim(h)}
	def wh(w,h=w) do {'width': dim(w), 'height': dim(h)}


	# position
	def static do {position: 'static'}
	def fixed do {position: 'fixed'}
	def abs do {position: 'absolute'}
	def rel do {position: 'relative'}
	def sticky do {position: 'sticky'}
		
	# visibility
	def visible do {visibility: 'visible'}
	def invisible do {visibility: 'hidden'}
	
	


	# TYPOGRAPHY
	
	# Font Family
	
	def font_sans
		{'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'}
	
	def font_serif
		{'font-family': 'Georgia, Cambria, "Times New Roman", Times, serif'}
	
	def font_mono
		{'font-family': 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}
	
	
	# Font Size
	# font sizes need to be predefined somewhere outside of this - in theme?
	def text_xs do {'font-size': '.75rem'}
	def text_sm do {'font-size': '.875rem'}
	def text_base do {'font-size': '1rem'}
	def text_lg do {'font-size': '1.125rem'}
	def text_xl do {'font-size': '1.25rem'}
	def text_2xl do {'font-size': '1.5rem'}
	def text_3xl do {'font-size': '1.875rem'}
	def text_4xl do {'font-size': '2.25rem'}
	def text_5xl do {'font-size': '3rem'}
	def text_6xl do {'font-size': '4rem'}
	def text_size v do {'font-size': v}
	
	# Font Smoothing
	def antialiased
		{
			'-webkit-font-smoothing': 'antialiased'
			'-moz-osx-font-smoothing': 'grayscale'
		}
	
	def subpixel_antialiased
		{
			'-webkit-font-smoothing': 'auto'
			'-moz-osx-font-smoothing': 'auto'
		}
	
	
	# Font Style
	def italic do {'font-style': 'italic'}
	def not_italic do {'font-style': 'normal'}
	
	
	# Font Weight
	def font_hairline do {'font-weight': 100}
	def font_thin do {'font-weight': 200}
	def font_light do {'font-weight': 300}
	def font_normal do {'font-weight': 400}
	def font_medium do {'font-weight': 500}
	def font_semibold do {'font-weight': 600}
	def font_bold do {'font-weight': 700}
	def font_extrabold do {'font-weight': 800}
	def font_black do {'font-weight': 900}
	
	
	# Letter Spacing
	# Add 'ls' alias?
	def tracking_tighter do {'letter-spacing': '-0.05em' }
	def tracking_tight do {'letter-spacing': '-0.025em' }
	def tracking_normal do {'letter-spacing': '0' }
	def tracking_wide do {'letter-spacing': '0.025em' }
	def tracking_wider do {'letter-spacing': '0.05em' }
	def tracking_widest do {'letter-spacing': '0.1em' }
	
	
	# Line Height
	# Add 'lh' alias?
	def leading_none do {'line-height': '1' }
	def leading_tight do {'line-height': '1.25' }
	def leading_snug do {'line-height': '1.375' }
	def leading_normal do {'line-height': '1.5' }
	def leading_relaxed do {'line-height': '1.625' }
	def leading_loose do {'line-height': '2' }
			
	# should this use rems by default? How would you do
	# plain numeric values?
	def leading value do {'line-height': dim(value)}
	def lh value do {'line-height': value}
	
	
	# List Style Type
	def list_none do {'list-style-type': 'none' }
	def list_disc do {'list-style-type': 'disc' }
	def list_decimal do {'list-style-type': 'decimal' }
		
		
	# List Style Position
	def list_inside do {'list-style-position': 'inside' }
	def list_outside do {'list-style-position': 'outside' }
	
	
	# Placeholder Color
	
	# Placeholder Opacity
	
	def placeholder_opacity number
		{'--placeholder-opacity': number}
	
	# text align
	
	# text color
	
	# text opacity
	
	# text decoration
	def underline
		{'text-decoration': 'underline'}
	
	def line_through
		{'text-decoration': 'line-through'}
		
	def no_underline
		{'text-decoration': 'none'}
	
	# text transform
	def uppercase
		{'text-transform': 'uppercase'}
	
	def lowercase
		{'text-transform': 'lowercase'}
		
	def capitalize
		{'text-transform': 'capitalize'}
	
	def normal_case
		{'text-transform': 'normal-case'}
		
	
	# vertical align
	def align_baseline
		{'vertical-align': 'baseline'}
	
	def align_top
		{'vertical-align': 'top'}
		
	def align_middle
		{'vertical-align': 'middle'}
		
	def align_bottom
		{'vertical-align': 'bottom'}
		
	def align_text_top
		{'vertical-align': 'text-top'}
	
	def align_text_bottom
		{'vertical-align': 'text-bottom'}
		
	# whitespace
	def whitespace_normal
		{'white-space': 'whitespace-normal'}
	
	def whitespace_no_wrap
		{'white-space': 'whitespace-no-wrap'}
	
	def whitespace_pre
		{'white-space': 'whitespace-pre'}
	
	def whitespace_pre_line
		{'white-space': 'whitespace-pre-line'}
	
	def whitespace_pre_wrap
		{'white-space': 'whitespace-pre-wrap'}
		
	# word break
	def break_normal
		{'word-break': 'normal', 'overflow-wrap': 'normal'}
	
	def break_words
		{'overflow-wrap': 'break-word'}
	
	def break_all
		{'word-break': 'break-all'}
		
	def truncate
		{'overflow': 'hidden','text-overflow':'ellipsis','white-space':'nowrap'}

	# BACKGRONUDS
	
	def bg_opacity number
		{'--background-opacity': number}
	
	def bgo number
		bg_opacity(number)
	
	# BORDERS
	
	# radius
	
	# width
	
	def border value = '1px'
		{'border-width': value}
	
	# color
	
	# opacity
	
	def border_opacity number
		{'--border-opacity': number}
	
	# style
	def border_solid do	{'border-style': 'solid'}
	def border_dashed do {'border-style': 'dashed'}
	def border_dotted do {'border-style': 'dotted'}
	def border_double do {'border-style': 'double'}
	def border_none do {'border-style': 'none'}
		
	# should also support arbitrary border-(sides) methods
	
	# divide uses selector like spacing

	
	# Interactivity
	
	def select_none
		{'user-select': 'none'}
		
	def select_text
		{'user-select': 'text'}
	
	def select_all
		{'user-select': 'all'}
		
	def select_auto
		{'user-select': 'auto'}
	
	# space between .space-x-0 > * + *
	# def space-x num

export class StyleRule
	
	def constructor context,states,modifiers
		context = context
		selector = Selectors.parse(context,states)
		rules = Rules.parse(modifiers)
		
	def toString
		let sel = selector
		let parts = []
		for own key,value of rules
			parts.push "{key}: {value};"
		let out = sel + ' {\n' + parts.join('\n') + '\n}'
		out += '}' if sel.indexOf('@media') >= 0
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