class Base
	###
	@template T
	@overload
	@param {T} this
	@param {number} id
	@return {InstanceType<T>}
	###
	static def get id
		return global.something

class Car < Base

	def completion
		yes

let car = Car.get(1)


car.completion
Car.get(1).completion




