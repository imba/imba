# Palette colors in style values: fractional steps (cooler45), alpha with
# numbers and $vars, currentColor, hue tints, #color definitions from
# palette/rgb/hsl/hex values, and color references with alpha.

def cs el
	window.getComputedStyle(el)

def channels str
	let m = str.match(/rgba?\(([^)]+)\)/)
	return null unless m
	let parts = m[1].split(/[\s,\/]+/).filter(do $1).map(do parseFloat($1))
	parts[3] = 1 if parts.length == 3
	return parts

def hex2rgb hex
	[1,3,5].map(do parseInt(hex.slice($1,$1 + 2),16))

def rgb2hsl [r,g,b]
	r /= 255
	g /= 255
	b /= 255
	let max = Math.max(r,g,b)
	let min = Math.min(r,g,b)
	let l = (max + min) / 2
	let h = 0
	let s = 0
	if max != min
		let d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		if max == r
			h = (g - b) / d + (g < b ? 6 : 0)
		elif max == g
			h = (b - r) / d + 2
		else
			h = (r - g) / d + 4
		h *= 60
	return [h,s * 100,l * 100]

def hsl2rgb [h,s,l]
	s /= 100
	l /= 100
	let k = do(n) (n + h / 30) % 12
	let a = s * Math.min(l,1 - l)
	let f = do(n) l - a * Math.max(-1,Math.min(k(n) - 3,9 - k(n),1))
	return [f(0),f(8),f(4)].map(do Math.round($1 * 255))

# the color halfway between two palette steps, mixed in hsl
def between a, b, w = 0.5
	let x = rgb2hsl(hex2rgb(a))
	let y = rgb2hsl(hex2rgb(b))
	hsl2rgb(x.map(do(v,i) v + (y[i] - v) * w))

# resolve any css color (including lch) to rgba channels via a canvas
def paint color
	let canvas = document.createElement('canvas')
	canvas.width = canvas.height = 1
	let ctx = canvas.getContext('2d')
	ctx.fillStyle = color
	ctx.fillRect(0,0,1,1)
	let [r,g,b,a] = ctx.getImageData(0,0,1,1).data
	return [r,g,b,Math.round(a / 255 * 100) / 100]

# steps past 9 keep the hue and mix saturation/lightness toward black
def towardBlack hex, w = 0.5
	let [h,s,l] = rgb2hsl(hex2rgb(hex))
	hsl2rgb([h,s * (1 - w),l * (1 - w)])

def near actual, expected, alpha = 1, tolerance = 2
	let parts = channels(actual)
	parts = paint(actual) if !parts and actual.indexOf('lch(') == 0
	assert parts != null, "{actual} is not an rgb color"
	return unless parts
	for v,i in expected
		assert Math.abs(parts[i] - v) <= tolerance, "channel {i} of {actual} should be near {v}"
	eq parts[3], alpha

global css @root
	#accent:blue45
	#brand:#ff0000
	#half:blue5/50
	#site-bg:hsl(208,14%,10%)
	#from-rgb:rgb(255,0,0)
	#from-rgba:rgba(255,0,0,0.5)
	#from-hsla:hsla(120,100%,50%,0.5)
	#from-slash:rgb(255 0 0 / 50%)
	#from-hex8:#ff000080
	#from-white:white
	#from-step:cooler45
	#ref:#brand
	#ref-alpha:#brand/50
	#tile:#0000ff
	#from-mix:#brand(l c h / 0.5)
	#from-dark:#brand(0.5l c h)

tag Steps
	<self>
		<div$c45[c:cooler45]>
		<div$c35[c:cooler35]>
		<div$c55[bg:cooler55]>
		<div$c25[c:cooler25]>
		<div$c46[c:cooler46]>
		<div$b45[c:blue45]>
		<div$y45[c:yellow45]>
		<div$y95[c:yellow95]>
		<div$b92[bg:blue92]>
		<div$alpha[c:cooler45/60]>
		<div$alpha2[c:cooler45/25]>
		<div$def[c:#accent]>
		<div$gradient[bgi:linear-gradient(to bottom,yellow4,yellow45)]>

tag Alphas
	<self>
		<div$num[bg:black/50 c:white/10]>
		<div$pal[c:blue5/50]>
		<div$var[$alpha:40% c:blue5/$alpha]>
		<div$hex[c:#ff0000]>
		<div$hexalpha[c:#ff0000/50]>
		<div$refalpha[$bo:50% bc:#brand/$bo bs:solid bw:1px]>
		<div$refnum[bg:#brand/25]>
		<div$grad[bg:linear-gradient(to bottom,#tile/0,#tile/100)]>

tag Current
	<self[c:rgb(0 128 0)]>
		<div$cur[bg:current]>
		<div$curcolor[bg:currentColor]>
		<div$curborder[bd:1px solid currentColor]>
		<div$curshadow[bxs:0 0 0 1px currentColor]>
		<svg$svg[fill:currentColor stroke:current]>

tag Hues
	<self>
		<div$indigo[hue:indigo c:hue5 bg:hue2/50]>
		<div$teal[hue:teal]>
			<div$tealchild[c:hue7]>
				<div$tealgrand[bg:hue1]>
		<div$swap.on[hue:blue .on:red c:hue5]>
		<div$tintvar[hue:yellow $a:20% c:hue5/$a]>
		<div$hueval[hue:emerald]>

tag Definitions
	<self>
		<div$brand[c:#brand]>
		<div$half[c:#half]>
		<div$site[c:#site-bg]>
		<div$rgb[c:#from-rgb]>
		<div$rgba[c:#from-rgba]>
		<div$hsla[c:#from-hsla]>
		<div$slash[c:#from-slash]>
		<div$hex8[c:#from-hex8]>
		<div$white[c:#from-white]>
		<div$step[c:#from-step]>
		<div$ref[c:#ref]>
		<div$refa[c:#ref-alpha]>
		<div$mix[c:#brand(l c h / 0.3)]>
		<div$defmix[c:#from-mix]>
		<div$defdark[c:#from-dark]>
		<div$local[#local:teal5 c:#local bg:#local/50]>
		<div$override.dark[#local:teal5 .dark:red5 c:#local]>

describe 'fractional palette steps' do
	let el = imba.mount <Steps>

	test 'cooler45 is halfway between cooler4 and cooler5' do
		near cs(el.$c45).color, between('#94a3b8','#64748b')

	test 'cooler35 and cooler25' do
		near cs(el.$c35).color, between('#cbd5e1','#94a3b8')
		near cs(el.$c25).color, between('#e2e8f0','#cbd5e1')

	test 'cooler55 as a background' do
		near cs(el.$c55).backgroundColor, between('#64748b','#475569')

	test 'cooler46 is 60% of the way' do
		near cs(el.$c46).color, between('#94a3b8','#64748b',0.6)

	test 'other palettes' do
		near cs(el.$b45).color, between('#60a5fa','#3b82f6')
		near cs(el.$y45).color, between('#facc15','#eab308')

	test 'steps past 9 mix toward black' do
		near cs(el.$y95).color, towardBlack('#713f12')
		near cs(el.$b92).backgroundColor, towardBlack('#1e3a8a',0.2)

	test 'fractional step with alpha' do
		near cs(el.$alpha).color, between('#94a3b8','#64748b'), 0.6
		near cs(el.$alpha2).color, between('#94a3b8','#64748b'), 0.25

	test 'fractional step in a color definition' do
		let col = cs(el.$def).color
		assert col.indexOf('lch(') == 0
		near col, between('#60a5fa','#3b82f6')

	test 'fractional step inside a gradient' do
		let val = cs(el.$gradient).backgroundImage
		let [a,b] = val.match(/rgba?\([^)]+\)/g)
		near a, hex2rgb('#facc15')
		near b, between('#facc15','#eab308')

describe 'alpha' do
	let el = imba.mount <Alphas>

	test 'palette color with numeric alpha' do
		eq cs(el.$num).backgroundColor, 'rgba(0, 0, 0, 0.5)'
		eq cs(el.$num).color, 'rgba(255, 255, 255, 0.1)'
		near cs(el.$pal).color, hex2rgb('#3b82f6'), 0.5

	test 'alpha from a $variable' do
		near cs(el.$var).color, hex2rgb('#3b82f6'), 0.4

	test 'hex color without alpha is kept as is' do
		eq cs(el.$hex).color, 'rgb(255, 0, 0)'

	test 'hex color with alpha' do
		near cs(el.$hexalpha).color, [255,0,0], 0.5

	test 'color reference with $variable alpha' do
		near cs(el.$refalpha).borderTopColor, [255,0,0], 0.5

	test 'color reference with numeric alpha' do
		near cs(el.$refnum).backgroundColor, [255,0,0], 0.25

	test 'color references with alpha inside a gradient' do
		let val = cs(el.$grad).backgroundImage
		let [a,b] = val.match(/(rgba?|lch)\([^)]+\)/g)
		near b, [0,0,255], 1
		eq a, b.replace(')',' / 0)')

describe 'currentColor' do
	let el = imba.mount <Current>

	test 'current is an alias for currentColor' do
		eq cs(el.$cur).backgroundColor, 'rgb(0, 128, 0)'

	test 'currentColor' do
		eq cs(el.$curcolor).backgroundColor, 'rgb(0, 128, 0)'

	test 'currentColor in borders' do
		eq cs(el.$curborder).borderLeft, '1px solid rgb(0, 128, 0)'

	test 'currentColor in shadows' do
		eq cs(el.$curshadow).boxShadow, 'rgb(0, 128, 0) 0px 0px 0px 1px'

	test 'currentColor in svg paint' do
		eq cs(el.$svg).fill, 'rgb(0, 128, 0)'
		eq cs(el.$svg).stroke, 'rgb(0, 128, 0)'

describe 'hue' do
	let el = imba.mount <Hues>

	test 'hue tints on the same element' do
		near cs(el.$indigo).color, hex2rgb('#6366f1')
		near cs(el.$indigo).backgroundColor, hex2rgb('#c7d2fe'), 0.5

	test 'hue tints are inherited by descendants' do
		near cs(el.$tealchild).color, hex2rgb('#0f766e')
		near cs(el.$tealgrand).backgroundColor, hex2rgb('#ccfbf1')

	test 'hue with a class modifier' do
		near cs(el.$swap).color, hex2rgb('#ef4444')
		el.$swap.classList.remove('on')
		near cs(el.$swap).color, hex2rgb('#3b82f6')

	test 'hue tint with a $variable alpha' do
		# hue tints are stored as rounded hsl triplets
		near cs(el.$tintvar).color, hex2rgb('#eab308'), 0.2, 4

	test 'hue sets the --hue0 to --hue9 variables' do
		let style = cs(el.$hueval)
		for i in [0 ... 10]
			assert style.getPropertyValue("--hue{i}").trim!.match(/^\d+,\d+%,\d+%$/) != null

describe 'color definitions' do
	let el = imba.mount <Definitions>

	test 'hex definition' do
		eq cs(el.$brand).color, 'lch(54.3 106.8 40.9)'

	test 'palette color with alpha' do
		eq cs(el.$half).color, 'lch(54.6 66.4 277.6 / 0.5)'

	test 'hsl() with commas' do
		eq cs(el.$site).color, 'lch(8.8 3.2 249)'

	test 'rgb() and rgba()' do
		eq cs(el.$rgb).color, 'lch(54.3 106.8 40.9)'
		eq cs(el.$rgba).color, 'lch(54.3 106.8 40.9 / 0.5)'

	test 'hsla()' do
		eq cs(el.$hsla).color, 'lch(87.8 113.3 134.4 / 0.5)'

	test 'rgb() with slash alpha' do
		eq cs(el.$slash).color, 'lch(54.3 106.8 40.9 / 0.5)'

	test 'eight digit hex' do
		eq cs(el.$hex8).color, 'lch(54.3 106.8 40.9 / 0.5)'

	test 'named palette color' do
		eq cs(el.$white).color, 'lch(100 0 0)'

	test 'reference to another definition' do
		eq cs(el.$ref).color, 'lch(54.3 106.8 40.9)'
		eq cs(el.$refa).color, 'lch(54.3 106.8 40.9 / 0.5)'

	test 'color mix with alpha' do
		eq cs(el.$mix).color, 'lch(54.3 106.8 40.9 / 0.3)'

	test 'definitions from a color mix' do
		eq cs(el.$defmix).color, 'lch(54.3 106.8 40.9 / 0.5)'
		eq cs(el.$defdark).color, 'lch(27.15 106.8 40.9)'

	test 'local definition with alpha reference' do
		near cs(el.$local).color, hex2rgb('#14b8a6')
		near cs(el.$local).backgroundColor, hex2rgb('#14b8a6'), 0.5

	test 'definition with a class modifier' do
		near cs(el.$override).color, hex2rgb('#ef4444')
		el.$override.classList.remove('dark')
		eq cs(el.$override).color, cs(el.$local).color
		near cs(el.$override).color, hex2rgb('#14b8a6')
