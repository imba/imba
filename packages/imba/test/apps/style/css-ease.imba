# Easing shorthands (ea/es/eo/ec/eb/et and their -d/-f/-w longhands).
# They set --e_* custom properties that feed a shared transition rule;
# assert both the variables and the resolved transition lists.

def cs el
	window.getComputedStyle(el)

def prop el, name
	cs(el).getPropertyValue(name).trim!

# split a computed list on top-level commas
def items str
	let out = []
	let depth = 0
	let curr = ''
	for chr in str
		if chr == '('
			depth++
		elif chr == ')'
			depth--
		if chr == ',' and depth == 0
			out.push(curr.trim!)
			curr = ''
		else
			curr += chr
	out.push(curr.trim!)
	return out

# the transition timing for one property in the generated transition list
def timing el, name
	let style = cs(el)
	let props = items(style.transitionProperty)
	let i = props.indexOf(name)
	return null if i == -1
	return [
		items(style.transitionDuration)[i]
		items(style.transitionTimingFunction)[i]
		items(style.transitionDelay)[i]
	].join(' ')

const QUINT = 'cubic-bezier(0.23, 1, 0.32, 1)'

global css @root
	1fxd:250ms

tag App
	<self>
		<div$all[ea:100ms]>
		<div$allfull[ea:1s ease-in-out 2s]>
		<div$allparts[eaf:quint-in ead:10ms eaw:5ms]>
		<div$unit[ea:1fxd]>
		<div$transform[et:200ms quad-in 10ms]>
		<div$tunit[et:2fxd]>
		<div$colors[ec:300ms linear]>
		<div$styles[ease:150ms]>
		<div$e[e:400ms ec:50ms]>
		<div$opacity[eo:50ms ebd:20ms]>
		<div$box[eb:80ms et:500ms]>
		<div$custom[ea:100ms myease]>
		<div$mixed[eo:300ms ec:1s]>

describe 'ease variables' do
	let el = imba.mount <App>

	test 'ea sets the base duration' do
		eq prop(el.$all,'--e_ad'), '100ms'

	test 'ea with duration, easing and delay' do
		eq prop(el.$allfull,'--e_ad'), '1s'
		eq prop(el.$allfull,'--e_af'), 'ease-in-out'
		eq prop(el.$allfull,'--e_aw'), '2s'

	test 'ead/eaf/eaw longhands' do
		eq prop(el.$allparts,'--e_ad'), '10ms'
		eq prop(el.$allparts,'--e_af'), 'cubic-bezier(0.755, 0.05, 0.855, 0.06)'
		eq prop(el.$allparts,'--e_aw'), '5ms'

	test 'ea with a custom unit' do
		eq prop(el.$unit,'--e_ad'), '250ms'

	test 'et sets transform timing' do
		eq prop(el.$transform,'--e_td'), '200ms'
		eq prop(el.$transform,'--e_tf'), 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'
		eq prop(el.$transform,'--e_tw'), '10ms'

	test 'ec sets color timing' do
		eq prop(el.$colors,'--e_cd'), '300ms'
		eq prop(el.$colors,'--e_cf'), 'linear'

	test 'ease sets the styles group' do
		eq prop(el.$styles,'--e_sd'), '150ms'
		eq prop(el.$styles,'--e_ad'), '0ms'

	test 'unknown easing names read --ease-name' do
		eq prop(el.$custom,'--e_af'), 'myease'

describe 'ease transitions' do
	let el = imba.mount <App>

	test 'ea applies to all groups' do
		eq timing(el.$all,'all'), "0.1s {QUINT} 0s"
		eq timing(el.$all,'opacity'), "0.1s {QUINT} 0s"
		eq timing(el.$all,'transform'), "0.1s {QUINT} 0s"
		eq timing(el.$all,'color'), "0.1s {QUINT} 0s"
		eq timing(el.$all,'width'), "0.1s {QUINT} 0s"

	test 'ea with easing and delay' do
		eq timing(el.$allfull,'all'), "1s ease-in-out 2s"
		eq timing(el.$allfull,'background-color'), "1s ease-in-out 2s"

	test 'ea with a custom unit duration' do
		eq timing(el.$unit,'all'), "0.25s {QUINT} 0s"

	test 'et only affects transform' do
		eq timing(el.$transform,'transform'), "0.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) 0.01s"
		eq timing(el.$transform,'opacity'), "0s {QUINT} 0s"
		eq timing(el.$transform,'all'), "0s {QUINT} 0s"

	test 'et with a custom unit' do
		eq timing(el.$tunit,'transform'), "0.5s {QUINT} 0s"

	test 'ec only affects colors' do
		for name in ['color','background-color','border-color','fill','stroke','outline-color','box-shadow']
			eq timing(el.$colors,name), "0.3s linear 0s"
		eq timing(el.$colors,'opacity'), "0s {QUINT} 0s"

	test 'ease cascades to every group except all' do
		eq timing(el.$styles,'all'), "0s {QUINT} 0s"
		eq timing(el.$styles,'opacity'), "0.15s {QUINT} 0s"
		eq timing(el.$styles,'color'), "0.15s {QUINT} 0s"
		eq timing(el.$styles,'height'), "0.15s {QUINT} 0s"
		eq timing(el.$styles,'transform'), "0.15s {QUINT} 0s"

	test 'e with a color override' do
		eq timing(el.$e,'opacity'), "0.4s {QUINT} 0s"
		eq timing(el.$e,'color'), "0.05s {QUINT} 0s"

	test 'eo and ebd' do
		eq timing(el.$opacity,'opacity'), "0.05s {QUINT} 0s"
		eq timing(el.$opacity,'width'), "0.02s {QUINT} 0s"
		eq timing(el.$opacity,'transform'), "0.02s {QUINT} 0s"
		eq timing(el.$opacity,'color'), "0s {QUINT} 0s"

	test 'eb is overridden by et for transforms' do
		eq timing(el.$box,'padding'), "0.08s {QUINT} 0s"
		eq timing(el.$box,'transform'), "0.5s {QUINT} 0s"

	test 'eo and ec together' do
		eq timing(el.$mixed,'opacity'), "0.3s {QUINT} 0s"
		eq timing(el.$mixed,'border-color'), "1s {QUINT} 0s"
