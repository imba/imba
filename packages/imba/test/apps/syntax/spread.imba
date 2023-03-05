
class Cat

	def one
		1

	def two
		2

class Lion < Cat

	def log name, ...params
		console.info(params)
		# super[name](...parans)


let lion = new Lion
let pars = [1,2,3]
lion.log('hello',...pars)