import 'imba/test/spec'

const cb = do console.info('cb')

tag App
	<self>
		<div$a @hotkey('a').log('a')> "a"
		
		# hotkey without a handler will default to a click
		<div$b @hotkey('b').log('b') @click.log('clicked')=cb> "b"
		
		# hotkey without a handler on a form field will default to focus
		<input$c @hotkey('c').log('c')>
		
		# hotkey without a handler on a form field will default to focus
		<textarea$d @hotkey('d').log('d') @focus.commit>
		
		
		# global hotkeys will trigger even if focus is in textarea or contentEditable
		<div$x @hotkey('x').capture.log('x')> "x"
		
		# you need to set it as passive if you do not want to suppress the native
		# key event that triggered the hotkey
		<div$y @hotkey('y').capture.passive.log('y')> "y"
		
		# for multiple elements with the same hotkey - the ones later in the dom
		# will be called first - and always stop there unless they are marked as passive
		<div @hotkey('f').passive.log('c')> "-"
		<div @hotkey('f').log('b')> "-"
		<div @hotkey('f').passive.log('a')> "-"

let app = imba.mount <App>
let {$a,$b,$x,$y,$c:input,$d:textarea} = app

describe "hotkey" do	
	test "$a" do
		await imba.commit!
		await spec.keyboard.type 'a'
		eq $1.log,['a']
		ok !imba.scheduler.committing?
		
	test "auto-click" do
		await imba.commit!
		await spec.keyboard.type 'b'
		eq $1.log,['b','clicked','cb']
		ok imba.scheduler.committing?
	
	test "auto-focus" do
		await imba.commit!
		await spec.keyboard.type 'c'
		eq document.activeElement, input
		ok !imba.scheduler.committing?
		# the keypress should be prevented
		eq input.value, ''
		input.blur!
		
		# test with textarea as well
		await spec.keyboard.type 'd'
		eq document.activeElement, textarea
		ok imba.scheduler.committing?
		eq textarea.value, ''
		textarea.blur!

	# Don't trigger hotkeys while inside input
	test "in input" do
		await imba.commit!
		await spec.keyboard.type 'c'
		await spec.keyboard.type 'c'
		await spec.keyboard.type 'd'
		eq document.activeElement, input
		eq input.value, 'cd'
		eq $1.log, ['c']
		input.value = ''
		
	test "@hotkey.capture" do
		await imba.commit!
		input.focus!
		# the x element has .capture modifier
		# and will by default capture the hotkey and
		# prevent the default action even if we are
		# in an input-field
		await spec.keyboard.type 'x'
		eq $1.log, ['x']
		eq input.value, ''
		
		# the y handler has the .passive modifier
		# so it will not prevent the default (typing y in input)
		await spec.keyboard.type 'y'
		eq $1.log, ['x','y']
		eq input.value, 'y'
		input.blur!
	
	test "@hotkey.passive" do
		await imba.commit!
		# the x element has .capture modifier
		# and will by default capture the hotkey and
		# prevent the default action even if we are
		# in an input-field
		await spec.keyboard.type 'f'
		eq $1.log, ['a','b']
