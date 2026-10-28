# reading a predicate member calls a method with no arguments, so it is
# typed as the value, not as the method

class Note
	owner = 'me'
	open? = no
	def readable? by = 'me'
		by == owner
	def writable? by\string
		by == owner
	def stopped?
		yes
	def check
		let a\boolean = readable?
		let b\boolean = self.readable?
		let c\boolean = stopped?!
		let d\boolean = open?
		# deliberate: writable? needs an argument
		let e = writable?
		a and b and c and d and e

class Draft < Note
	def readable? by = 'me'
		let inherited\boolean = super.readable?
		inherited

let note = new Note
let bag = {}
export const readable\boolean = note.readable?
export const stopped\boolean = note.stopped?
export const called\boolean = note.stopped?!
export const fresh\boolean = new Note().readable?
export const passed\boolean = note.writable?('you')
export const anything = bag.ready?
# deliberate: writable? needs an argument
export const missing = note.writable?
