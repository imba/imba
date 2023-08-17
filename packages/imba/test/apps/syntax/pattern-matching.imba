###

The `is` keyword in imba is a powerful way to check a value against a _pattern_.
While you can use `is` for plain equality like `item is 15`, it can also be used
for more advanced matches.

###

let num = 1
let str = 'done'

# Basic usage is essentially like `===` and `!==`
test do
	ok num is 1
	ok num isnt 2
	ok str is 'done'
	ok str isnt 'ready'

# Even more important, the right side of `is` can be a parenthesis with nested matchers.
test do
	ok num is (1 or 2) # checks num against both 1 and 2
	ok str isnt 'ready'
	ok str is 'done'
	ok str is ('ready' or 'done')

# Now to the more powerful things. If the right-side implements a `#matcher` method, Imba
# will call this to see if the left-side matches. So lets create a pattern:

# Implements a matcher that checks if number is odd
const Odd = { #matcher: do(v) v % 2 == 1 }

# Implements a matcher that checks if number is rounded
const Rounded = { #matcher: do(v) v % 1 == 0 }

# Implements a matcher that checks if number is more than 1000
const Huge = { #matcher: do(v) v > 1000 }

# We can now test anything against this using `is` and `isnt` operators.

test do
	ok 1 is Odd # Odd.#matcher(1) returns true
	ok 2 isnt Odd # Odd.#matcher(2) returns false
	
	# This can also be used nested with other conditions
	ok num is (Odd or 2)
	ok 2000 is Huge
	ok 3 is (Huge or (Rounded and Odd))
	ok 3.5 isnt (Huge or Rounded)

# Here's a more complicated example

# Let's create a class now


class Status
	name
	desc

	def #matcher v
		v and v.status == name ? self : false

const Ready = new Status(name: 'ready', desc: "Item is ready for upload")
const Done = new Status(name: 'done', desc: "Upload has completed")

test do
	let obj = {
		name: "Hello"
		status: "ready"
	}
	ok obj is Ready
	ok obj isnt Done
	ok obj is (Ready or Done)

	# Since the Status matcher returns the status itself on match
	let status = obj is (Done or Ready)
	ok status === Ready

# More test
test do
	ok 1 is (1)
	ok 1 isnt (2)
	ok 1 is (2 or !7)