tag App

# extend all tags
extend tag element
	def baseExtended
		yes

extend tag p
	def pExtended
		yes

extend tag App
	attr hello

	def appExtended
		yes

let div = document.createElement('div')
let p = document.createElement('p')
let app = <App>

test 'extend tag element' do
	eq div.baseExtended!, yes
	ok !div.pExtended

test 'extend tag p' do
	ok p.pExtended

test 'extend tag App' do
	ok app.appExtended!
	app.hello = 'world'
	eq app.getAttribute('hello'),'world'
