def @register key
	
	
	yes

def @actionable target
	extend class target
		def hey
			"WOW!"
	yes

def @eventable target
	extend class target
		def on name
			"WOW!"
		
		def un name
			yes
			
		def emit name, data
			yes

class Decorator
	
	def #property
		yes
		
	def #method
		yes
		
	def #class
		yes
		
	def #tag
		yes


class Simple
	def render
		yes

@actionable @eventable
class Lock
	
	def constructor
		seed = Math.random!
	
	def test
		seed.toFixed
		yes

let item = new Lock
console.log item.hey!
console.log item.on