# A `do` block after a field descriptor becomes `desc.callback`. When the
# modifier chain ends with a bare modifier, the block is still the callback
# and the modifier is set as a flag.

class Model
	def @action ...args
		{
			args: args
			labels: []
			label: do(value) this.labels.push(value)
			$get: do(target, key)
				let desc = this
				do(...params) desc.callback.apply(target, params)
			$set: do(value, target, key) target[key] = value
		}

	name = 'model'

class Doc < Model
	save @action do
		"saved {name}"

	upload @action.dnd do(files, o = {})
		"{name} got {files.length} {o.mode or 'files'}"

	rename @action.label('Rename').g(110).confirm do(to)
		name = to

	remote @action.rpc $node$ and do(path = '.')
		path

	local @action.rpc $web$ and do(path = '.')
		"{name}:{path}"

describe 'descriptor callbacks' do

	test 'plain do block' do
		let doc = new Doc
		assert doc.@@save.callback isa Function
		eq doc.save!, 'saved model'

	test 'block after a bare modifier' do
		let doc = new Doc
		let desc = doc.@@upload
		eq desc.dnd, yes
		assert desc.callback isa Function
		eq doc.upload([1,2]), 'model got 2 files'
		eq doc.upload([1], mode: 'images'), 'model got 1 images'

	test 'block after a chain with arguments and a bare modifier' do
		let doc = new Doc
		let desc = doc.@@rename
		eq desc.labels, ['Rename']
		eq desc.g, 110
		eq desc.confirm, yes
		doc.rename('other')
		eq doc.name, 'other'

	test 'callback guarded by a platform flag' do
		let doc = new Doc
		# tests compile for the browser
		eq doc.@@remote.callback, false
		eq doc.@@remote.rpc, yes
		assert doc.@@local.callback isa Function
		eq doc.local!, 'model:.'
		eq doc.local('src'), 'model:src'

	test 'descriptor is created through the instance factory' do
		let doc = new Doc
		eq doc.@@save.args, []
		eq doc.@@save, (new Doc).@@save
