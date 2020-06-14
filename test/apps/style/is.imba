
def check el, match
	if typeof el == 'string'
		el = document.querySelector(el)
	elif el isa Element and !el.parentNode
		document.body.appendChild(el)
	let style = window.getComputedStyle(el)
	for own k,expected of match
		let real = style[k]
		if expected isa RegExp
			global.ok real.match(expected)
			unless real.match(expected)
				console.log real,'did no match',expected
		else
			global.eq(real,expected)
	return
	

test 'font-weight' do
	check(<p.(is:medium)>, fontWeight: '500')
	check(<p.(is:semibold)>, fontWeight: '600')
	check(<p.(is:bold)>, fontWeight: '700')

test 'font-family' do
	check(<p.(is:mono)>, fontFamily: /Menlo/)
	
test 'color' do
	check(<p.(is:blue4/50)>, color: /0\.5\)/)
	
test 'position' do
	check(<p[is:fixed]>, position: 'fixed')
	check(<p[is:rel]>, position: 'relative')
	check(<p[is:abs]>, position: 'absolute')
	check(<p[is:sticky]>, position: 'sticky')
	
	
