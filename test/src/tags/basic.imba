
# this is the basic type that all nodes inherit from
tag element

# this is the 
tag htmlelement

# 
tag svg:element # < base:element

tag ul
	
	def ok
		"ul"

tag li
	
	def ok
		"li"

tag hello < li

	def ok
		"hello"


	def hide
		@dom:style:display = 'none'
		self

	def show
		@dom:style:display = 'block'
		self

tag canvas

tag element

tag app:element

tag svg:element

# all tags in this namespace (app) will inherit from app:element
# so, you cannot 

tag app:hello

tag app:canvas

tag app:focusable

tag app:input < app:field
	include <app:field>

tag app:select < app:field
	# includes methods from focusable
	# should probably include the name in our chain as well
	# so that $(focusable) will include these fields(!)
	include <app:focusable>



U = <ul.harroo>
H = <hello.title>
P = <p.text>

<app:hello>
	<input>
	# should possibly be of the type app:input if one exists?
	# if it is, we might not need local tags the same way, as it
	# is easy to create our namespaces and all that.
	# it would require any namespace to inherit from the html-namespace though
	# so that they fall through to the base tags if not defined?

###

tag.field()
should return a new instance of <field>, with the correct domnode


###