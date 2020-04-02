

def bench target,key,desc
	let prev = desc.value
	desc.value = do
		let t = Date.now!
		let res = prev.apply(this,arguments)
		let time = Date.now! - t
		console.log 'took',time
		return res
	return

class Item
	static def decorate$log target,key,desc
		let prefix = this[0] or 'nopre'
		let prev = desc.value
		desc.value = do
			console.log "call {prefix} {key}"
			return prev.apply(this,arguments)
		return
	
	@log @log('hello') @bench
	def setup
		let i = 0
		let sum = 0
		let items = []
		while ++i < 100000
			
			let val = Math.random!
			items.push(val)
			sum += val
		return sum
		
test 'multiple' do
	let item = Item.new
	item.setup!
