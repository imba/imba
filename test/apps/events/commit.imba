###
By default, Imba will commit (re-render all mounted elements)
after event-handlers have handled an event. Events can have
guard-modifiers, that essentially decide whether or not to
break out of an event handler. If your handler never reaches
a non-guard modifier or the final callback - it will _not_
ask Imba to commit afterwards.
###
const cb = do yes

# An event handler that never reaches a callback
# should not commit
test "not committing" do
	await imba.commit!

	tag App
		bool = no
		<self>
			<div @click.stop.prevent.log('ok')> "-"
			<div @click.if(bool)=cb> "-"
			<div @click.shift.log('ok')=cb> "-"
			<div @click.silent=cb> "-"
			<div @click.flag-clicked.silent> "-"

	let app = imba.mount <App>
	# eq imba.scheduler.committing?, 10
	for el in app.children
		# ok imba.scheduler.committing?
		el.click!
		ok !imba.scheduler.committing?
		# eq $1.commits,0

# An event that has no callback will not call event
test "committing" do
	await imba.commit!

	tag App
		bool = yes
		<self>
			<div @click.stop=cb> "A"
			<div @click.if(bool)=cb> "B"
			# flag will commit by default
			<div @click.flag-clicked> "C"
			<div @click.commit> "C"

	let app = imba.mount <App>
	# eq imba.scheduler.committing?, 10
	for el in app.children
		await imba.commit!
		ok !imba.scheduler.committing?
		el.click!
		ok imba.scheduler.committing?
