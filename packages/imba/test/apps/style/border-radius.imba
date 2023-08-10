import 'imba/spec'

tag App
	def render
		<self[d:hflex ja:center g:10]>
			css section d:hflex ja:center g:10
			css div w:20px h:20px bg:gray3 # default
			<section title="border-radius">
				<div[rd:2px] eq={borderRadius: '2px'}>
				<div[rdt:2px] eq={borderRadius: '2px 2px 0px 0px'}>
				<div[rdb:2px] eq={borderRadius: '0px 0px 2px 2px'}>
				<div[rdl:2px] eq={borderRadius: '2px 0px 0px 2px'}>
				<div[rdr:2px] eq={borderRadius: '0px 2px 2px 0px'}>

imba.mount(let app = <App>)

for child in app.children
	let items = child.children
	# describe(child.title) do
	for item,i in items
		test("{child.title} {i + 1}") do
			eqcss item, item.eq