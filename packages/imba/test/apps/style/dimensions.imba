import 'imba/spec'

tag App
	def render
		<self[d:hflex ja:center g:10]>
			css section d:hflex ja:center g:10
			css div w:10px h:10px bg:gray3 # default
			<section title="width">
				<div[w:2px] eq={width: '2px'}>
				# Experimental max/min width syntax
				<div[w:40px <20px] eq={width: '20px', maxWidth: '20px'}>
				<div[w:40px <20px] eq={width: '20px', maxWidth: '20px'}>
				<div[w:10px >20px] eq={width: '20px', minWidth: '20px'}>

			<section title="height">
				<div[h:2px] eq={height: '2px'}>
				<div[h:40px <20px] eq={height: '20px', maxHeight: '20px'}>
				<div[h:40px <20px] eq={height: '20px', maxHeight: '20px'}>
				<div[h:10px >20px] eq={height: '20px', minHeight: '20px'}>

			<section title="size">
				<div[size:20px] eq={width: 20px, height:20px}>
				<div[s:20px 5px] eq={width: 20px, height:5px}>
				<div[s:8px] eq={width: 8px, height:8px}>
			# <div[py:2px 1px] eq={padding: '2px 0px 1px'}>

imba.mount(let app = <App>)

for child in app.children
	let items = child.children
	# describe(child.title) do
	for item,i in items
		test("{child.title} {i + 1}") do
			eqcss item, item.eq