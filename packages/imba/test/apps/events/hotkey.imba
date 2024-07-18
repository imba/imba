import 'imba/test/spec'

const cb = do console.info('cb')

describe "hotkey" do

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
	let {$c:input,$d:textarea} = app

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

describe "multiple hotkeys" do
	imba.mount do <div>
		<div @hotkey('a|b|c')=console.info("{e.hotkey}!")> ""

	test do
		await spec.keyboard.type 'a'
		eq $1.log,['a!']

		await spec.keyboard.type 'b'
		eq $1.log,['a!','b!']

describe "hotkey dynamic" do
	let shortcut = 'a'

	imba.mount do
		<div @hotkey(shortcut).log('hotkey')> ""

	test do
		await spec.keyboard.type 'a'
		eq $1.log,['hotkey']

	test do
		shortcut = 'b'
		await imba.commit!
		await spec.keyboard.type 'a'
		eq $1.log,[]
		await spec.keyboard.type 'b'
		eq $1.log,['hotkey']

describe "hotkey sequences" do
	imba.mount do
		<div @hotkey('g i').log('yes')> ""

	test do
		await spec.keyboard.type 'g'
		await spec.keyboard.type 'i'
		eq $1.log,['yes']

###
If you set hotkeys=(val) on a node it will affect how @hotkey handlers
inside of this tree works. hotkeys=yes will define a hotkey group. The hotkeys
inside will only be active if the focused element is also inside this group.
###
describe "hotkeys grouping" do
	tag App
		navkeys = no
		mainkeys = yes
		<self>
			<main$main tabIndex=-1 hotkeys=mainkeys>
				<div @hotkey('a').log('main-a')>
				<div @hotkey('d').log('main-d')>

			<nav$nav tabIndex=-1 hotkeys=navkeys>
				<div @hotkey('a').log('nav-a')>
				<div @hotkey('b').log('nav-b')>
				<div @hotkey('c').log('nav-c')>

			<footer$footer tabIndex=-1 hotkeys=yes>
				<div @hotkey('b').log('footer-b')>
				<div @hotkey('d').passive.log('footer-d')>

	let app = imba.mount <App>

	# when hotkeys is set to false - no hotkeys inside
	# the container will trigger
	test do
		await imba.commit!
		await spec.keyboard.type 'a'
		eq $1.log,[]

		app.$main.focus!
		await spec.keyboard.type 'a'
		eq $1.log,['main-a']


	test do
		await imba.commit!
		await spec.keyboard.type 'a'
		await spec.keyboard.type 'c'
		eq $1.log,['main-a']

	# when the document-body has focus, any element with
	# a hotkey that is NOT inside an ascendant with hotkeys=no
	# will be enabled
	test do
		await imba.commit!
		app.$footer.focus!
		await spec.keyboard.type 'd'
		app.$main.focus!
		await spec.keyboard.type 'd'
		eq $1.log,['footer-d','main-d']

	# when the source element of a key event has an element
	# with hotkeys=yes in its path, only listeners inside of
	# this group will be active
	test do
		await imba.commit!
		app.$footer.focus!
		await spec.keyboard.type 'a'
		await spec.keyboard.type 'b'
		eq $1.log,['footer-b']
		app.$footer.blur!

		# no longer in focus - none of the groups should trigger?
		await spec.keyboard.type 'd'
		eq $1.log,['footer-b']