extern describe, test, ok, eq

def jseq find, &blk
	let val = String(blk)
	ok(val.indexOf(find) >= 0, "'{find}' not found in {val}")
	
def htmleq find, val
	if val isa Function
		val = val()
	
	if val isa Imba.Tag
		val = val.toString

	ok(val.indexOf(find) >= 0, "'{find}' not found in {val}")
	
describe 'Syntax - Tags' do
	
	var strvar = "hello"
	var numvar = 1
	var fnvar = do yes
	var objvar = {a: 1, b: 2}

	test 'id' do
		jseq "setId('one')" do <div#one>

	test 'flags' do
		jseq "flag('only')" do <.only>
		jseq "flag('two')" do <div.two>
		jseq "flagIf('two',numvar)" do <div .two=numvar>
		jseq "setFlag(0,strvar)" do <div .{strvar}>
		jseq "setFlag(0,self.name())" do <div .{name}>
			
	# attributes
	test 'attributes' do
		jseq "setTitle(strvar)" do <div title=strvar>
		jseq "css('display','block')" do <div css:display='block'>
		jseq "setDisabled('disabled')" do <input disabled>
		jseq "setDisabled('disabled').setReadonly('readonly')" do <input disabled readonly>
		jseq "set('model',strvar,\{number:1\})" do <div model.number=strvar>
		
	# events
	test 'events' do
		jseq "(0,['tap','prevent','after'])" do <div.two :tap.prevent.after>
		jseq "(0,['tap',['incr',10]])" do <div.two :tap.incr(10)>
		jseq "(0,['tap',fnvar])" do <div.two :tap=fnvar>

	test 'data' do
		jseq "setData(objvar)" do <div[objvar]>
		jseq "setData(objvar)" do <.only[objvar]>
	
	test 'ref' do
		jseq "._main =" do <div[objvar]@main>
			
			
	test 'template' do
		class Local
			prop title default: "class"
			
			def closed
				<div title="tag" -> <h1> title
			
			def open
				<div title="tag" => <h1> title
		
		var instance = Local.new
		htmleq "<h1>tag</h1>", instance.closed
		htmleq "<h1>class</h1>", instance.open
	
	test  'root' do
		let a,b,c,d,e
		var item = <div>
			<div.b>
			<div.c>
			<div.d>
				e = <div.e>
		
		eq e.root,item
		
	test 'multiple self' do
		tag Something
		tag Local
			def render
				<self> <div> "ready"
			
			def loading
				<self> <span> "loading"
				
			def flip bool = no
				if bool
					<self> <Something> "bold"
				else
					<self> <i> "italic"
				
		var node = <Local>
		htmleq '<div>ready</div>', node
		node.loading
		htmleq '<span>loading</span>', node
		node.render
		htmleq '<div>ready</div>', node

			