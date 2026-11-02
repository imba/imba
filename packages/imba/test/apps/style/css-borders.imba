# Border side shorthands with full width/style/color triples, and the
# outline shorthand in its 1, 2 and 3 parameter forms.

def cs el
	window.getComputedStyle(el)

tag Borders
	css div bs:none

	<self>
		<div$left[bdl:1px solid red]>
		<div$top[bdt:2px dashed blue5]>
		<div$bottom[bdb:3px dotted #ff0000]>
		<div$right[bdr:4px double black/50]>
		<div$all[bd:1px solid gray3]>
		<div$sides[bdt:1px solid red bdb:2px solid blue bdl:3px dashed green bdr:4px dotted black]>
		<div$leftpair[bdl:2px red]>
		<div$bottomcolor[bdb:blue]>
		<div$topwidth[bdt:3px]>
		<div$inline[bdx:2px solid red bdy:1px dashed blue]>
		<div$current[c:red bd:1px solid currentColor]>
		<div$currentbottom[c:blue bdb:2px solid currentColor]>
		<div$var[$border:green bdb:1px solid $border]>
		<div$hsl[bdl:2px solid hsl(120 100% 50%)]>
		<div$rgb[bdl:2px solid rgb(0 0 255)]>
		<div$rgbonly[bd:rgb(255 0 0)]>
		<div$hslonly[bdl:hsl(120 100% 50%)]>
		<div$transparent[bdb:1px solid transparent]>
		<div$hover[bdb:1px solid red @hover:2px solid blue]>
		<div$override[bd:1px solid red bdl:3px dashed blue]>

tag Outlines
	<self>
		<div$full[ol:2px solid red]>
		<div$none[ol:none]>
		<div$pair[ol:2px red]>
		<div$color[ol:red]>
		<div$width[ol:3px]>
		<div$longhands[olw:2px olc:blue olo:3px ols:dashed]>
		<div$current[c:green ol:1px solid currentColor]>
		<div$offset[ol:1px solid red olo:4px]>
		<div$pairoffset[ol:2px blue olo:2px]>
		<div$huedotted[ol:1px dotted blue5]>

describe 'border sides' do
	let el = imba.mount <Borders>

	test 'bdl with width, style and color' do
		eq cs(el.$left).borderLeft, '1px solid rgb(255, 0, 0)'
		eq cs(el.$left).borderTopStyle, 'none'

	test 'bdt with a palette color' do
		eq cs(el.$top).borderTopWidth, '2px'
		eq cs(el.$top).borderTopStyle, 'dashed'
		eq cs(el.$top).borderTopColor, 'rgb(59, 130, 246)'

	test 'bdb with a hex color' do
		eq cs(el.$bottom).borderBottom, '3px dotted rgb(255, 0, 0)'

	test 'bdr with an alpha color' do
		eq cs(el.$right).borderRight, '4px double rgba(0, 0, 0, 0.5)'

	test 'bd with all three' do
		eq cs(el.$all).borderTopWidth, '1px'
		eq cs(el.$all).borderLeftStyle, 'solid'

	test 'every side at once' do
		eq cs(el.$sides).borderTop, '1px solid rgb(255, 0, 0)'
		eq cs(el.$sides).borderBottom, '2px solid rgb(0, 0, 255)'
		eq cs(el.$sides).borderLeft, '3px dashed rgb(0, 128, 0)'
		eq cs(el.$sides).borderRight, '4px dotted rgb(0, 0, 0)'

	test 'side with width and color gets solid' do
		eq cs(el.$leftpair).borderLeft, '2px solid rgb(255, 0, 0)'

	test 'side with only a color is 1px solid' do
		eq cs(el.$bottomcolor).borderBottom, '1px solid rgb(0, 0, 255)'

	test 'side with only a width is solid' do
		eq cs(el.$topwidth).borderTopWidth, '3px'
		eq cs(el.$topwidth).borderTopStyle, 'solid'

	test 'bdx and bdy with three params' do
		eq cs(el.$inline).borderLeft, '2px solid rgb(255, 0, 0)'
		eq cs(el.$inline).borderRight, '2px solid rgb(255, 0, 0)'
		eq cs(el.$inline).borderTop, '1px dashed rgb(0, 0, 255)'
		eq cs(el.$inline).borderBottom, '1px dashed rgb(0, 0, 255)'

	test 'currentColor' do
		eq cs(el.$current).borderTop, '1px solid rgb(255, 0, 0)'
		eq cs(el.$currentbottom).borderBottom, '2px solid rgb(0, 0, 255)'

	test 'css variable as color' do
		eq cs(el.$var).borderBottom, '1px solid rgb(0, 128, 0)'

	test 'hsl() and rgb() colors' do
		eq cs(el.$hsl).borderLeft, '2px solid rgb(0, 255, 0)'
		eq cs(el.$rgb).borderLeft, '2px solid rgb(0, 0, 255)'

	test 'hsl() and rgb() alone are treated as colors' do
		eq cs(el.$rgbonly).borderTop, '1px solid rgb(255, 0, 0)'
		eq cs(el.$hslonly).borderLeft, '1px solid rgb(0, 255, 0)'

	test 'transparent' do
		# the palette transparent is a fully transparent white
		eq cs(el.$transparent).borderBottomColor, 'rgba(255, 255, 255, 0)'
		eq cs(el.$transparent).borderBottomWidth, '1px'

	test 'side shorthand with a modifier' do
		eq cs(el.$hover).borderBottom, '1px solid rgb(255, 0, 0)'

	test 'later side overrides the full border' do
		eq cs(el.$override).borderTop, '1px solid rgb(255, 0, 0)'
		eq cs(el.$override).borderLeft, '3px dashed rgb(0, 0, 255)'

describe 'outline' do
	let el = imba.mount <Outlines>

	test 'three params' do
		eq cs(el.$full).outline, 'rgb(255, 0, 0) solid 2px'

	test 'none' do
		eq cs(el.$none).outlineStyle, 'none'

	test 'width and color' do
		eq cs(el.$pair).outlineWidth, '2px'
		eq cs(el.$pair).outlineStyle, 'solid'
		eq cs(el.$pair).outlineColor, 'rgb(255, 0, 0)'

	test 'color only defaults to 1px solid' do
		eq cs(el.$color).outlineWidth, '1px'
		eq cs(el.$color).outlineStyle, 'solid'
		eq cs(el.$color).outlineColor, 'rgb(255, 0, 0)'

	test 'width only keeps a transparent color' do
		eq cs(el.$width).outlineWidth, '3px'
		eq cs(el.$width).outlineStyle, 'solid'
		eq cs(el.$width).outlineColor, 'rgba(0, 0, 0, 0)'

	test 'longhands' do
		eq cs(el.$longhands).outlineWidth, '2px'
		eq cs(el.$longhands).outlineColor, 'rgb(0, 0, 255)'
		eq cs(el.$longhands).outlineOffset, '3px'
		eq cs(el.$longhands).outlineStyle, 'dashed'

	test 'currentColor' do
		eq cs(el.$current).outlineColor, 'rgb(0, 128, 0)'

	test 'offset after a full outline' do
		eq cs(el.$offset).outlineOffset, '4px'
		eq cs(el.$offset).outlineWidth, '1px'

	test 'offset after a two param outline' do
		eq cs(el.$pairoffset).outlineOffset, '2px'
		eq cs(el.$pairoffset).outlineWidth, '2px'
		eq cs(el.$pairoffset).outlineColor, 'rgb(0, 0, 255)'

	test 'three params with a palette color' do
		eq cs(el.$huedotted).outlineStyle, 'dotted'
		eq cs(el.$huedotted).outlineColor, 'rgb(59, 130, 246)'
