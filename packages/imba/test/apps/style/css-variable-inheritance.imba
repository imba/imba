# The variables behind transforms, easing and runtime values are registered
# with @property as non-inheriting. Their defaults are the initial values of
# the properties, and changing one only restyles the element and not all of
# its descendants. A runtime value that is read by a pseudo-element or by a
# rule for a descendant has to keep inheriting.

def cs el, pseudo = null
	window.getComputedStyle(el,pseudo)

def prop el, name
	cs(el).getPropertyValue(name).trim!

def matrix el
	new DOMMatrix(cs(el).transform)

# the duration of the transition for one property
def duration el, name
	let style = cs(el)
	let i = style.transitionProperty.split(', ').indexOf(name)
	style.transitionDuration.split(', ')[i]

# names of the variables set on the inline style of an element
def locals el
	Array.from(el.style).filter do $1.startsWith('--')

tag App
	dx = 10
	w = 40
	size = 30
	color = 'rgb(1, 2, 3)'

	<self>
		<div$static[x:10px]>
			<span$staticchild>
			<div$nested[scale:2]>
		<div$eased[ea:1s ec:2s]>
			<span$easedchild>
			<div$easednested[eo:100ms]>
		<div$fade[o@off:0]>
		<div$fadeslow[o@off:0 ea:1s]>
		<div$dyn[x:{dx}px w:{w}px]>
			<span$dynchild>
		<div$flagged.on[c.on:{color}]>
			<span$flaggedchild>
		<div$pseudo[c@before:{color} content@before:'x']>
		<section$own>
			css h:{size}px
			<span$ownchild>
		<section$scope>
			css .leaf c:{color}
			<span$leaf.leaf>

describe 'transform variables' do
	let el = imba.mount <App>

	test 'defaults are the initial values' do
		eq prop(el.$static,'--t_x'), '10px'
		eq prop(el.$static,'--t_y'), '0'
		eq prop(el.$static,'--t_scale'), '1'
		eq matrix(el.$static).e, 10

	test 'do not inherit' do
		eq prop(el.$staticchild,'--t_x'), '0'
		eq matrix(el.$nested).a, 2
		eq matrix(el.$nested).e, 0

	test 'follow the normal cascade' do
		el.$static.style.setProperty('--t_x','30px')
		eq matrix(el.$static).e, 30
		el.$static.style.removeProperty('--t_x')
		eq matrix(el.$static).e, 10

describe 'ease variables' do
	let el = imba.mount <App>

	test 'defaults are the initial values' do
		eq prop(el.$easednested,'--e_ad'), '0ms'
		eq prop(el.$easednested,'--e_af'), 'cubic-bezier(0.23, 1, 0.32, 1)'
		eq prop(el.$easednested,'--e_aw'), '0ms'

	test 'a group that is not set has no value' do
		eq prop(el.$eased,'--e_cd'), '2s'
		eq prop(el.$eased,'--e_sd'), ''
		eq duration(el.$eased,'opacity'), '1s'
		eq duration(el.$eased,'color'), '2s'

	test 'do not inherit' do
		eq prop(el.$easedchild,'--e_ad'), '0ms'
		eq prop(el.$easedchild,'--e_cd'), ''
		eq duration(el.$easednested,'all'), '0s'
		eq duration(el.$easednested,'opacity'), '0.1s'
		eq duration(el.$easednested,'color'), '0s'

	test 'entering elements ease for 300ms unless a duration is set' do
		el.$fade.classList.add('@enter')
		el.$fadeslow.classList.add('@enter')
		eq prop(el.$fade,'--e_ad'), '300ms'
		eq prop(el.$fadeslow,'--e_ad'), '1s'

describe 'runtime values' do
	let el = imba.mount <App>

	test 'in an inline style do not inherit' do
		let names = locals(el.$dyn)
		eq names.length, 2
		eq matrix(el.$dyn).e, 10
		eq cs(el.$dyn).width, '40px'
		for name in names
			eq prop(el.$dyn,name) != '', true
			eq prop(el.$dynchild,name), ''

	test 'still update' do
		el.dx = 25
		el.w = 60
		el.render!
		eq matrix(el.$dyn).e, 25
		eq cs(el.$dyn).width, '60px'

	test 'behind a class modifier do not inherit' do
		let names = locals(el.$flagged)
		eq names.length, 1
		eq cs(el.$flagged).color, 'rgb(1, 2, 3)'
		eq prop(el.$flaggedchild,names[0]), ''

	test 'in a css block for the tag itself do not inherit' do
		let names = locals(el.$own)
		eq names.length, 1
		eq cs(el.$own).height, '30px'
		eq prop(el.$ownchild,names[0]), ''

	test 'are still read by pseudo-elements' do
		eq cs(el.$pseudo,'::before').color, 'rgb(1, 2, 3)'

	test 'are still read by rules for descendants' do
		eq cs(el.$leaf).color, 'rgb(1, 2, 3)'
