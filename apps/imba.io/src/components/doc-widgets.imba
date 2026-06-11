import {aliases} from 'imba/compiler'
import {fonts,modifiers,variants} from 'imba/compiler'
import {selparser} from 'imba/compiler'

const selparseCache = {}

def parseSel str
	if selparseCache[str]
		return selparseCache[str]
	let sel = selparser.parse(str,{})
	return selparseCache[str] = selparser.render(sel,'...')

const transforms = 
	x: 'translateX'
	y: 'translateY'
	z: 'translateZ'
	rotate: 'rotate'
	scale: 'scale'
	'scale-x': 'scaleX'
	'scale-y': 'scaleY'
	'skew': 'skewX'
	'skew-y': 'skewY'

css h2 + p > .deftable @first > header mt:-6 bg:white
	
css .defs
	d:grid gtc:max-content auto pc:start ff:mono fs:4
	.pair d:contents
	.dt c:purple7 pr:4
	.dd c:gray6
	.dd a + a prefix: ', '

	[cols=2] & gtc@lg: max-content 1fr max-content 1fr

	@lg [cols='3-transposed'] &
		gtc: 1fr 1fr 1fr
		.pair d:block
		> @nth-child(4n+1) order:0
		> @nth-child(4n+2) order:1
		> @nth-child(4n+3) order:2
		> @nth-child(4n+4) order:4

	@lg [cols=3] &
		gtc: max-content 1fr max-content 1fr max-content 1fr
	@lg [cols=4] &
		gtc: max-content 1fr max-content 1fr max-content 1fr max-content 1fr

css .defbar 
	border-bottom:1px solid gray3 pb:2
	button mr:3 fw:500 fs:8 c:blue6 c@hover:gray7 c.checked:gray9 outline@focus:none 
		bbw:2px bc:clear bc.checked:teal6

tag doc-style-transform-aliases
	def hydrate
		yes

	<self[d:block mt:2]>
		<div.defs> for own alias,val of transforms
			<div.pair>
				<span.dt> alias
				<span.dd> "transform: {<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/{val}"> val}(...)"

tag doc-style-val
	def render
		let val = data isa Array ? data : [data]
		

tag doc-style-ff

	<self>
		<div.defs> for own name,val of fonts
			<div.pair>
				<.dt> name
				<.dd> val

tag doc-style-fs

	<self>
		<div.defs[gtc:max-content max-content auto ai:center]> for own name,val of variants.fontSize
			continue if !name.match(/[a-z]/)
			<div.pair>
				<.dt> name
				<.dd[pr:3]>
					val[0]
					# <span[prefix:' / ']> val[1]
				<span[lh:1.2em ws:nowrap overflow:hidden text-overflow:ellipsis fs:{val[0]}]> "Quick brown fox"

tag doc-style-easings
	<self>
		<div.defs> for own name,val of variants.easings
			<div[d:contents]>
				<.dt> name
				<.dd> val

tag doc-util-output
	name

	<self>
		for own k,v of data
			<span.pair[suffix:';']>
				<span.key[suffix:': ']> k
				<span.val> JSON.stringify(v)

for own k,v of modifiers
	v.example = "@{k}{v.type == 'selector' and '(sel)' or ''}"
	v.parsed = parseSel("sel {v.example}")
	v.custom = (v.name and v.name != k) or v.media or v.ua or v.flag
	v.kind = v.media ? 'media' : (v.ua ? 'user-agent' : ('pseudo-class'))
	v.title = v.name

tag doc-colors
	css .palette my:2 fw:500 cursor:default rd:sm of:hidden d:flex
		.name w:80px as:center
	css .color ff:sans fs:xs rd:0 flex:1 1 50px p:1 h:12 d:flex ai:center jc:center w:5 ls:-0.5px
		span o:0 tween:30ms ease-in-out
		@first span o:0.5
		@last span o:0.5
		@hover span o:1

	def render
		let texttint = [7,6,6,6,7,1,1,1,1,0]
		<self> <div>
			for color in imba.colors
				<div.palette.{color}>
					# <div.name> "{color}"
					<div.color[bg:hue0 c:hue7 flb:100px]> <span[o:1x fw:500 fs:sm]> "{color}0"
					<div.color[bg:hue1 c:hue7]> <span> "{color}1"
					<div.color[bg:hue2 c:hue7]> <span> "{color}2"
					<div.color[bg:hue3 c:hue7]> <span> "{color}3"
					<div.color[bg:hue4 c:hue7]> <span> "{color}4"
					<div.color[bg:hue5 c:hue1]> <span> "{color}5"
					<div.color[bg:hue6 c:hue1]> <span> "{color}6"
					<div.color[bg:hue7 c:hue0]> <span> "{color}7"
					<div.color[bg:hue8 c:hue0]> <span> "{color}8"
					<div.color[bg:hue9 c:hue0]> <span> "{color}9"
					# for tint,i in [0,1,2,3,4,5,6,7,8,9]
					#	<div.color[bg:{color+tint} c:{color+texttint[i]}]> <span> "{color}{tint}"