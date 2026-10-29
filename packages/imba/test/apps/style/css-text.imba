# Text shorthands: text-transform / text-decoration keywords, font-family
# theme fonts with var fallbacks, text-shadow vars, font-size with
# line-height (fs:size/lh) and line-height units.

def cs el, pseudo = null
	window.getComputedStyle(el,pseudo)

const MONO = 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
const SERIF = 'Georgia, Cambria, "Times New Roman", Times, serif'

global css @root
	$font-brand:Georgia
	$text-shadow-glow:0 0 2px red

tag Transforms
	<self>
		<div$cap[tt:cap]> "hello"
		<div$up[tt:up]> "hello"
		<div$lower[tt:lowercase]> "HELLO"
		<div$none[tt:none]> "Hello"

tag Decorations
	<self>
		<div$u[td:u]> "underlined"
		<div$s[td:s]> "struck"
		<div$full[td:u wavy red]> "wavy"
		<div$off[td:none]> "none"
		<a$link[td:none @hover:u] href='#'> "link"
		<div$parts[tdl:underline tdc:blue tds:dotted tdt:2px tuo:3px]> "parts"

tag Fonts
	<self>
		<div$mono[ff:mono]>
		<div$serif[ff:serif]>
		<div$sans[ff:sans]>
		<div$override[$font-mono:Courier ff:mono]>
		<div$custom[ff:brand]>
		<div$unknown[ff:Arial]>
		<div$quoted[ff:"system-ui"]>
		<div$inherit[ff:serif]>
			<span$child[ff:inherit]>
		<code$code[ff:mono fs:sm]>

tag Shadows
	<self>
		<div$plain[txs:0 1px 2px black]>
		<div$none[txs:none]>
		<div$themed[ts:glow]>
		<div$themed2[txs:glow, 0 0 1px blue]>
		<div$local[$text-shadow-soft:1px 1px 0 white txs:soft]>

tag Sizes
	<self>
		<div$sm[fs:sm]>
		<div$lg[fs:lg]>
		<div$xl2[fs:2xl]>
		<div$num3[fs:3]>
		<div$num11[fs:11]>
		<div$ratio[fs:24px/1.2]>
		<div$px[fs:24px/30px]>
		<div$named[fs:lg/1.5]>
		<div$fsunit[fs:xl/2fs]>
		<div$zero[lh:40px]>
			<div$zerochild[fs:16px/0]>
		<div$plainlh[fs:10px lh:20px]>
		<div$unitless[fs:10px lh:1.5]>
		<div$ulh[lh:1.5u]>
		<div$lhunit[lh:20px]>
			<div$lhchild[h:1lh]>
			<div$lhchild2[h:2lh]>
		<div$fslhunit[fs:xl/2fs]>
			<div$fslhchild[h:1lh]>
		<div$ls[fs:10px ls:2]>
		<div$lsem[fs:10px ls:0.5em]>
		<div$md[fs:md-]>

describe 'text-transform' do
	let el = imba.mount <Transforms>

	test 'tt:cap' do
		eq cs(el.$cap).textTransform, 'capitalize'

	test 'tt:up' do
		eq cs(el.$up).textTransform, 'uppercase'

	test 'regular keywords pass through' do
		eq cs(el.$lower).textTransform, 'lowercase'
		eq cs(el.$none).textTransform, 'none'

describe 'text-decoration' do
	let el = imba.mount <Decorations>

	test 'td:u' do
		eq cs(el.$u).textDecorationLine, 'underline'

	test 'td:s' do
		eq cs(el.$s).textDecorationLine, 'line-through'

	test 'td:u with style and color' do
		eq cs(el.$full).textDecorationLine, 'underline'
		eq cs(el.$full).textDecorationStyle, 'wavy'
		eq cs(el.$full).textDecorationColor, 'rgb(255, 0, 0)'

	test 'td:none' do
		eq cs(el.$off).textDecorationLine, 'none'
		eq cs(el.$link).textDecorationLine, 'none'

	test 'longhand aliases' do
		eq cs(el.$parts).textDecorationLine, 'underline'
		eq cs(el.$parts).textDecorationColor, 'rgb(0, 0, 255)'
		eq cs(el.$parts).textDecorationStyle, 'dotted'
		eq cs(el.$parts).textDecorationThickness, '2px'
		eq cs(el.$parts).textUnderlineOffset, '3px'

describe 'font-family' do
	let el = imba.mount <Fonts>

	test 'ff:mono falls back to the theme stack' do
		eq cs(el.$mono).fontFamily, MONO

	test 'ff:serif falls back to the theme stack' do
		eq cs(el.$serif).fontFamily, SERIF

	test 'ff:sans falls back to the theme stack' do
		assert cs(el.$sans).fontFamily.indexOf('system-ui, -apple-system') == 0

	test 'theme font can be overridden with $font-mono' do
		eq cs(el.$override).fontFamily, 'Courier'

	test 'custom font names read --font-name' do
		eq cs(el.$custom).fontFamily, 'Georgia'

	test 'unknown font names fall back to themselves' do
		eq cs(el.$unknown).fontFamily, 'Arial'

	test 'quoted font names are kept' do
		eq cs(el.$quoted).fontFamily, '"system-ui"'

	test 'inherit is not wrapped in a var' do
		eq cs(el.$child).fontFamily, SERIF

	test 'font-size together with a theme font' do
		eq cs(el.$code).fontFamily, MONO
		eq cs(el.$code).fontSize, '14px'

describe 'text-shadow' do
	let el = imba.mount <Shadows>

	test 'plain shadow' do
		eq cs(el.$plain).textShadow, 'rgb(0, 0, 0) 0px 1px 2px'

	test 'none' do
		eq cs(el.$none).textShadow, 'none'

	test 'named shadow reads --text-shadow-name' do
		eq cs(el.$themed).textShadow, 'rgb(255, 0, 0) 0px 0px 2px'

	test 'named shadow in a list' do
		eq cs(el.$themed2).textShadow, 'rgb(255, 0, 0) 0px 0px 2px, rgb(0, 0, 255) 0px 0px 1px'

	test 'locally defined shadow var' do
		eq cs(el.$local).textShadow, 'rgb(255, 255, 255) 1px 1px 0px'

describe 'font-size and line-height' do
	let el = imba.mount <Sizes>

	test 'named sizes include a line-height' do
		eq cs(el.$sm).fontSize, '14px'
		eq cs(el.$sm).lineHeight, '22px'
		eq cs(el.$lg).fontSize, '18px'
		eq cs(el.$lg).lineHeight, '28px'
		eq cs(el.$xl2).fontSize, '24px'
		eq cs(el.$xl2).lineHeight, '36px'
		eq cs(el.$md).fontSize, '15px'

	test 'numeric sizes' do
		eq cs(el.$num3).fontSize, '13px'
		eq cs(el.$num3).lineHeight, '20px'
		eq cs(el.$num11).fontSize, '24px'
		eq cs(el.$num11).lineHeight, '34px'

	test 'size/ratio rounds line-height up to an even pixel value' do
		eq cs(el.$ratio).fontSize, '24px'
		eq cs(el.$ratio).lineHeight, '30px'

	test 'size/px line-height' do
		eq cs(el.$px).fontSize, '24px'
		eq cs(el.$px).lineHeight, '30px'

	test 'named size with custom ratio' do
		eq cs(el.$named).fontSize, '18px'
		eq cs(el.$named).lineHeight, '28px'

	test 'line-height in fs units' do
		eq cs(el.$fsunit).fontSize, '20px'
		eq cs(el.$fsunit).lineHeight, '40px'

	test 'line-height 0 inherits' do
		eq cs(el.$zerochild).fontSize, '16px'
		eq cs(el.$zerochild).lineHeight, '40px'

	test 'lh with px' do
		eq cs(el.$plainlh).lineHeight, '20px'

	test 'unitless lh' do
		eq cs(el.$unitless).lineHeight, '15px'

	test 'lh with u units' do
		eq cs(el.$ulh).lineHeight, '6px'

	test 'lh unit follows a px line-height' do
		eq cs(el.$lhchild).height, '20px'
		eq cs(el.$lhchild2).height, '40px'

	test 'lh unit follows fs line-height in fs units' do
		eq cs(el.$fslhchild).height, '40px'

	test 'letter-spacing numbers are 0.05em steps' do
		eq cs(el.$ls).letterSpacing, '1px'
		eq cs(el.$lsem).letterSpacing, '5px'
