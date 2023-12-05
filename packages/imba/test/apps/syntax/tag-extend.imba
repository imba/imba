tag App

	get num
		1

	def str
		"a"

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

	def str
		"a{super}"

	get num
		super + 2

extend tag App
	get num
		super + 3

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
	eq app.str!,"aa"
	eq app.num,6
