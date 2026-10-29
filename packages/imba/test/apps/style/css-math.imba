# Arithmetic inside style values: calc(), bare parens, operators, and `/`
# inside function arguments. Mirrors idioms from real apps such as
# `w:calc(100% - 20px)`, `pl:(1pgp + 14px)`, `l:($x)px` and
# `zi:calc(130 + $level * 200)`.

def cs el
	window.getComputedStyle(el)

tag App
	<self[pos:relative w:200px h:100px]>
		<div$minus[w:calc(100% - 20px) h:calc(100% - 30px)]>
		<div$plus[w:calc(10px + 15px) h:calc(1rem + 4px)]>
		<div$multi[w:calc(10px + 20px - 5px) h:calc(100% - 10px - 20px + 5px)]>
		<div$mul[w:calc(10px * 3) h:calc(100px / 4)]>
		<div$paren[w:(100% - 50px) h:(10px + 15px)]>
		<div$parenmulti[w:(10px + 20px + 30px) h:(100% - 10px - 10px)]>
		<div$nested[w:calc((100% - 40px) / 2) h:calc(2 * (10px + 5px))]>
		<div$units[w:calc(4u + 2px) h:(2u - 1px)]>
		<div$sizing[ml:calc(1u + 2px) mr:(2u - 1px) pt:(1u + 14px)]>
		<div$minmax[w:min(150px, calc(100% - 20px)) h:max(20px,calc(10% + 2px))]>
		<div$clamped[w:clamp(10px,50%,60px) fs:clamp(14px,2vw,20px)]>
		<div$vars[$base:30px $level:1 w:calc($base + 10px) zi:calc(130 + $level * 200) pos:relative]>
		<div$negvar[$sait:5px mt:calc(($sait) * -1) ml:calc($sait * -2)]>
		<div$unitparens[$l:10 $t:4 pos:relative l:($l)px t:($t * 2)px w:($l + 5)px]>
		<div$customunit[1rpx:3px w:calc(2rpx + 1px) h:calc(10rpx - 2px)]>
		<div$customcalc[1base:calc(1px * (4 / 2)) w:calc(10base) h:(1base * 5)]>
		<div$vw[maw:calc(100vw - 32px) mah:calc(100vh - 32px)]>
		<div$minw[miw:calc(10px + 5px) mih:(20px - 5px)]>

tag Slashes
	<self>
		<div$rgba[bg:rgba(0 0 0 / 50%) c:rgb(255 0 0 / 0.5)]>
		<div$hsl[bc:hsl(120 100% 50% / 25%) bd:1px solid hsl(120 100% 50% / 25%)]>
		<div$aspect[w:160px aspect-ratio:16 / 9]>
		<div$aspect2[w:401px aspect-ratio:401 / 116]>
		<div$gridslash[d:grid gtc:repeat(4,10px)]>
			<div$gc[gc:1 / 3 gr:1 / span 2]>
			<div$ga[ga:2 / 3 / 3 / 5]>
		<div$grad[bg:linear-gradient(to bottom,white/0,black/50)]>
		<div$grad2[bgi:linear-gradient(to right,black/25,white/100 10px)]>
		<div$grad3[$c:255 bgi:linear-gradient(to bottom,rgb(0 0 0 / 0.5),rgb(255 255 255 / 25%))]>

describe 'calc' do
	let app = imba.mount <App>

	test 'minus' do
		eq cs(app.$minus).width, '180px'
		eq cs(app.$minus).height, '70px'

	test 'plus' do
		eq cs(app.$plus).width, '25px'
		eq cs(app.$plus).height, '20px'

	test 'multi-term + and -' do
		eq cs(app.$multi).width, '25px'
		eq cs(app.$multi).height, '75px'

	test 'multiply and divide' do
		eq cs(app.$mul).width, '30px'
		eq cs(app.$mul).height, '25px'

	test 'nested parens inside calc' do
		eq cs(app.$nested).width, '80px'
		eq cs(app.$nested).height, '30px'

	test 'imba units inside calc' do
		eq cs(app.$units).width, '18px'
		eq cs(app.$units).height, '7px'

	test 'spacing properties' do
		eq cs(app.$sizing).marginLeft, '6px'
		eq cs(app.$sizing).marginRight, '7px'
		eq cs(app.$sizing).paddingTop, '18px'

	test 'calc inside min/max' do
		eq cs(app.$minmax).width, '150px'
		eq cs(app.$minmax).height, '20px'

	test 'clamp' do
		await spec.page.setViewport(width: 800, height: 600)
		await new Promise do requestAnimationFrame($1)
		eq cs(app.$clamped).width, '60px'
		# 2vw of an 800px viewport
		eq cs(app.$clamped).fontSize, '16px'

	test 'viewport units' do
		eq cs(app.$vw).maxWidth, "{window.innerWidth - 32}px"
		eq cs(app.$vw).maxHeight, "{window.innerHeight - 32}px"

	test 'min/max sizes' do
		eq cs(app.$minw).minWidth, '15px'
		eq cs(app.$minw).minHeight, '15px'

describe 'parens' do
	let app = imba.mount <App>

	test 'bare parens become calc' do
		eq cs(app.$paren).width, '150px'
		eq cs(app.$paren).height, '25px'

	test 'multiple operators in parens' do
		eq cs(app.$parenmulti).width, '60px'
		eq cs(app.$parenmulti).height, '80px'

	test 'parens with a trailing unit' do
		eq cs(app.$unitparens).left, '10px'
		eq cs(app.$unitparens).top, '8px'
		eq cs(app.$unitparens).width, '15px'

describe 'variables in calc' do
	let app = imba.mount <App>

	test '$var plus dimension' do
		eq cs(app.$vars).width, '40px'

	test 'unitless math for z-index' do
		eq cs(app.$vars).zIndex, '330'

	test 'negating a variable' do
		eq cs(app.$negvar).marginTop, '-5px'
		eq cs(app.$negvar).marginLeft, '-10px'

	test 'custom units in calc' do
		eq cs(app.$customunit).width, '7px'
		eq cs(app.$customunit).height, '28px'

	test 'custom unit declared with calc' do
		eq cs(app.$customcalc).width, '20px'
		eq cs(app.$customcalc).height, '10px'

describe 'slash in values' do
	let sl = imba.mount <Slashes>

	test 'rgb and rgba with slash alpha' do
		eq cs(sl.$rgba).backgroundColor, 'rgba(0, 0, 0, 0.5)'
		eq cs(sl.$rgba).color, 'rgba(255, 0, 0, 0.5)'

	test 'hsl with slash alpha' do
		eq cs(sl.$hsl).borderTopColor, 'rgba(0, 255, 0, 0.25)'
		eq cs(sl.$hsl).borderTopWidth, '1px'

	test 'aspect-ratio' do
		eq cs(sl.$aspect).aspectRatio, '16 / 9'
		eq cs(sl.$aspect).height, '90px'
		eq cs(sl.$aspect2).height, '116px'

	test 'grid placement with slash' do
		eq cs(sl.$gc).gridColumnStart, '1'
		eq cs(sl.$gc).gridColumnEnd, '3'
		eq cs(sl.$gc).gridRowStart, '1'
		eq cs(sl.$gc).gridRowEnd, 'span 2'
		eq cs(sl.$ga).gridRowStart, '2'
		eq cs(sl.$ga).gridColumnStart, '3'
		eq cs(sl.$ga).gridRowEnd, '3'
		eq cs(sl.$ga).gridColumnEnd, '5'

	test 'color alpha inside gradients' do
		eq cs(sl.$grad).backgroundImage, 'linear-gradient(rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.5))'
		eq cs(sl.$grad2).backgroundImage, 'linear-gradient(to right, rgba(0, 0, 0, 0.25), rgb(255, 255, 255) 10px)'

	test 'rgb with slash inside gradients' do
		eq cs(sl.$grad3).backgroundImage, 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.25))'
