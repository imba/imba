import 'imba/spec'
###

###
class Model
	# defining a type
	def @uppercase
		return {
			log: no
			$init: do yes
			$get: do(target, key) target[key]
			$set: do(value,target,key,name)
				console.info(`setting {name}`) if this.log
				target[key] = value.toUpperCase!
		}

	def @rich type
		return {
			log: no
			$init: do yes
			$get: do(target, key) target[key]
			$set: do(value,target,key,name)
				unless value isa type
					value = new type(value)
					
				console.info(`setting {name}`) if this.log
				target[key] = value.toUpperCase!
		}


class User < Model
	name as @uppercase
	other as @uppercase.log

test "descriptors" do
	let obj = new User
	obj.name = "Sindre"
	eq obj.name, "SINDRE"
	obj.other = "Hey"
	eq $1.log, ['setting other']


