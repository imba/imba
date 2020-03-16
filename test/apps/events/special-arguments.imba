var name = "John Doe"

tag app-root

	def log ...args
		console.info(args)

	def render
		<self :hello.{log(e.type,e.detail)}>
			# $ refers to the event itself
			
			<div.a :click.log($)> 'A'

			# $identifier refers to event[identifier]
			<div.b :click.{log(e.type)}> 'Event type'

			<div.c :click.emit('hello','test')> 'Trigger custom'

			<div.d :click.log('d',$)> 'D'

			<div.d :click.log('d',$)> 'D'

			<div.e reference=123 :click.{log($.element.reference)}> 'E'

imba.mount(<app-root>)

var click = do |state,sel,expect|
	state.log = []
	await spec.click(sel,no)
	eq(state.log.join(","),expect)

test "$" do
	await click($1,'.a','[object MouseEvent]')

test "$type" do
	await click($1,'.b','click')

test "$detail" do
	await click($1,'.c','hello,test')

test do
	await click($1,'.d','d,[object MouseEvent]')

test do
	await click($1,'.e','123')
