import { Local } from './local'

def method stuff
	return stuff

extend class String
	get plural
		yes

extend class SomeClass

	get _this_\SomeClass
		return

	def ext
		extthis
		_this_.main
		yes

	def extthis
		_this_.main!

	
	get that
		self

	get thut
		method(self)
	
	get num
		'10'


extend class Local

	def ext
		main!

	get state
		global.appState

	get localState
		global.localState
		
	get num
		yes

	get element
		<app-panel>

	get str
		""

extend tag element

	spuce\<app-button>

	get space\<app-button>
		global.somethings

	def smeth\<app-button>
		global.something

	get state
		global.appState
	
	get other
		<app-something>

	get main
		self

extend class HTMLElement
	get state
		offsetWidth
		offsetHeight
		offsetParent
		# state.two
		global.appState

extend tag app-button

	def ext
		main
		offsetWidth
		ext
		offsetWidth
		yes


extend tag app-panel

	def ext
		yes

extend class Element

	get button\<app-button>
		yes
	
	get that
		self

	# @this ThisType<this>
	get thatexpl
		self

	get rect
		parentElement
		let v = querySelector('app-button')
		getBoundingClientRect!

	get rect2
		parentElement
		
	def ext2
		parentElement
		parentElement

		


extend class ManualGlobal

	get that
		self

extend class AutoGlobal

	get that
		self
	
extend class Element
	get staff
		1234

extend class Element
	get stata
		1234232

APPNS.PROPERTY = 10