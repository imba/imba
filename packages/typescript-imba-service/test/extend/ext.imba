import { Local } from './local'

Local # yes

extend class String
	get plural
		yes

extend class SomeClass

	def ext
		extthis
		main
		yes

	def extthis
		main!

	get that
		self
	
	get num
		'10'

extend class LateDefJS

	def ext
		main
		main!
	
	get that
		
		self

extend class ImmediateDefJS

	def ext
		main
		main!

	def ext2
		self

	get that
		self

extend class GlobalSomeClass

	def ext
		main!

	get that
		self

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

extend tag element

	spuce\<app-button>

	get space\<app-button>
		global.something

	def smeth\<app-button>
		global.something

	get state
		global.appState
	
	get other
		<app-something>

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
	get that
		self
		
	def ext2
		parentElement

extend class ManualGlobal

	get that
		self

extend class AutoGlobal

	get that
		self
	
	