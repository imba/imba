# JavaScript runs a default value in the parameter list, where the variables
# of the function body are not visible. These defaults need variables of
# their own.
class Defaults
	active = yes
	count = 2
	items = [1, 2]

	def doubled value = (for item in items then item * 2)
		value

	def kind value = (switch count
		when 2 then active
		else no)
		value

	def found source, value = (if let item = source.item then item else active)
		value

	def callback value = (do active)
		value

	def label value = <span> "active {active}"
		value

	def picker
		do(a, b = a, c = $1, d = active) [a, b, c, d]

test 'loop in a default' do
	eq (new Defaults).doubled!, [2, 4]

test 'switch in a default' do
	let defaults = new Defaults
	eq defaults.kind!, yes
	defaults.active = no
	eq defaults.kind!, no

test 'if let in a default' do
	let defaults = new Defaults
	eq defaults.found({item: 5}), 5
	eq defaults.found({}), yes
	defaults.active = no
	eq defaults.found({}), no

test 'closure default reads the self of the method' do
	let defaults = new Defaults
	let callback = defaults.callback!
	eq callback!, yes
	defaults.active = no
	eq callback!, no

test 'tag literal default' do
	eq (new Defaults).label!.textContent, 'active true'

test 'defaults of closure parameters' do
	let pick = (new Defaults).picker!
	eq pick(1), [1, 1, 1, yes]
	eq pick(1, 2, 3, 4), [1, 2, 3, 4]
