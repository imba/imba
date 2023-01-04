import 'imba/spec'

tag App
	<self[d:hflex ja:center g:10]>
		css section d:hflex ja:center g:10
		css div s:40px bg:gray3 # default
		<section title="layouts">
			<div[d:hflex] eq={display: 'flex', flexDirection: 'row'}>
			<div[d:vflex] eq={display: 'flex', flexDirection: 'column'}>
			# <div[d:cluster] eq={display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', alignContent: 'center'}>
			# <div[d:cluster] eq={display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', alignContent: 'center'}>
			<div[d:vflex] eq={display: 'flex', flexDirection: 'column'}>
			<div[d:hbox] eq={display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}>
			<div[d:vbox] eq={display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}>
		<section title="justify-align">
			<div[d:flex ja:center flex-start] eq={display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}>
			<div[d:flex ja:stretch] eq={display: 'flex', justifyContent: 'stretch', alignItems: 'stretch'}>

imba.mount(let app = <App>)

for child in app.children
	let items = child.children
	# describe(child.title) do
	for item,i in items
		test("{child.title} {i + 1}") do
			# console.log 'running for',item,item.eq,!!item.parentNode,window.getComputedStyle(item)
			eqcss item, item.eq