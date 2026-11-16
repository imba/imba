import 'imba/spec'

# Browsers do not agree on how the computed value of an alignment keyword is
# written: Chromium 159 reports flex-start as flow-start. Ask the browser how
# it writes a keyword instead of spelling it out here.
def keyword value
	let el = document.createElement('div')
	el.style.alignContent = value
	document.body.appendChild(el)
	let res = window.getComputedStyle(el).alignContent
	el.remove!
	res

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
			<div[d:flex ja:center flex-start] eq={display: 'flex', justifyContent: 'center', alignItems: keyword('flex-start')}>
			<div[d:flex ja:stretch] eq={display: 'flex', justifyContent: 'stretch', alignItems: 'stretch'}>

imba.mount(let app = <App>)

for child in app.children
	let items = child.children
	# describe(child.title) do
	for item,i in items
		test("{child.title} {i + 1}") do
			eqcss item, item.eq