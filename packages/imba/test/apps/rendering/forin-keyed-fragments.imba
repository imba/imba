let items = ['a','b','c']

def reset
	items = ['a','b','c']

tag Item
	<self>
		"x"
		<slot> "-"

describe "for in keyed fragments" do	
	tag App
		items = items
		bool = yes
		kind = null

		<self[bd:blue4 m:4 p:4]>
			<div>
				if kind == 'fragment'
					<> for item in items
						<Item .c{item} $key=item> item
				if kind == 'if'
					for item in items
						<Item .c{item} $key=item> item

	test 'placeholder' do
		let app = <App>
		imba.mount app

		for v in ['fragment','if']
			reset!
			console.log "testing {v}"
			app.kind = null
			app.render!
			eq app.textContent,""

			app.kind = v
			app.render!
			eq app.textContent,"xaxbxc"

			app.kind = null
			app.render!
			eq app.textContent,""

			# replace an item
			app.kind = v
			items.push(items.shift!)
			app.render!
			eq app.textContent,"xbxcxa"

			items.shift!
			app.render!
			eq app.textContent,"xcxa"

	test 'placeholder2' do
		reset!

		tag App
			items = items
			bool = yes

			<self[bd:blue4 m:4 p:4]>
				<div>
					for item in items
						<Item $key=item> bool ? item : null

		let app = <App bool=yes>
		eq app.textContent,"xaxbxc"

		app.bool = no
		app.render!
		eq app.textContent,"x-x-x-"

		app.bool = yes
		app.render!
		eq app.textContent,"xaxbxc"

		imba.mount app
