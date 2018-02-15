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
	
	test 'owner' do
		var key = 100
		var ary = [1,2,3]
		var obj =
			str: 1
			def header
				<div@{key}> "hello"
		
		var node = <div>
		var header = obj:header.call(node)
		eq header.@owner_,node
		
		tag Local
			def list
				<div>
					<ul> for item in ary
						<li@{item}> item
					<ul> for item in ary
						<li> item
					<@named>
						for item,i in ary
							<li[item]>
						
			def list2
				for item in ary
					<li@{item}> item
			
			def render
				<self>
					<ul@itemlist>
						for item,i in ary
							<li[item]>
					<div@other>
						<ul> <li> 1
		
		var list = <div>
			<ul> for item in ary
				<li@{item}> item
			<ul> for item in ary
				<li> item
		
		var checkParents = do |dom|
			for child in dom:children
				continue unless child.@tag
				checkParents(child)
				eq child.@tag.@owner_, dom.@tag
			return
			
		# var par = null
		checkParents(list.dom)
		var localNode = <Local>
		list = localNode.list
		checkParents(list.dom)
		
		var list2 = localNode.list2
		for item in list2
			eq item.@owner_, localNode
		return

	test 'lists' do
		let types = [1,2,3,4]
		tag Radio
			prop value
			prop label
			prop desc

		tag Local
			def render
				<self>
					<.Radios.group.xl>
						for item in types
							if item % 2 == 0
								continue
							<Radio name='type' tabindex=1 value=item>
						
		var node = <Local>
	
	test "nested loops" do
		var data = [
			{id: 'a', items: ['a','b','c']},
			{id: 'b', items: ['d','e','f']}
		]
		
		var node = <div ->
			<.content>
				for item in data
					<h1> item:id
					for child in item:items
						<div> child
						
		htmleq "<h1>a</h1><div>a</div>", node
		htmleq "<h1>b</h1><div>d</div>", node
		
		var node2 = <div ->
			<.content>
				for item in data
					<h1> item:id
					<hr>
					<ul> for child in item:items
						<li> child
	
		node2.render
		node2.render
		htmleq "<h1>a</h1><hr><ul><li>a</li><li>b</li>", node2
		htmleq "<h1>b</h1><hr><ul><li>d</li><li>e</li>", node2

	test 'wrapping' do
		var str = "str"
		tag Local
			prop content
			
			def dyn
				"yes"

			def render
				<self>
					dyn
					<h1>
					<section> @content
		
		var node = <Local>
			<p> "one"
			<p> "two"
		node.render
		htmleq '<h1></h1><section><p>one</p><p>two</p></section>', node
		
		tag Other
			def header
				<Local@header>
					<p> "one"
					<p> "two"
					str

			def render
				<self>
					header
					<h1>
		
		var node = <Other>
		node.render
		htmleq '<h1></h1><section><p>one</p><p>two</p>str</section></div><h1>', node
					
					