const NS = {}

# global class with namespace
# will create a global reference
# with the name of the class
# so NS.Item == global.Item
global class NS.Item
	def ping
		yes

test 'namespaced class' do
	let item = new NS.Item
	ok item.ping!
