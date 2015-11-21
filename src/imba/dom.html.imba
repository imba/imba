
# predefine all supported html tags
extend tag htmlelement
	
	attr id
	attr tabindex
	attr title
	attr role


tag fragment < htmlelement
	
	def self.createNode
		Imba.document.createDocumentFragment

tag a
	attr href

tag abbr
tag address
tag area
tag article
tag aside
tag audio
tag b
tag base
tag bdi
tag bdo
tag big
tag blockquote
tag body
tag br

tag button
	attr autofocus
	attr type
	attr disabled

tag canvas
	def width= val
		dom:width = val unless width == val
		self

	def height= val
		dom:height = val unless height == val
		self

	def width
		dom:width

	def height
		dom:height


tag caption
tag cite
tag code
tag col
tag colgroup
tag data
tag datalist
tag dd
tag del
tag details
tag dfn
tag div
tag dl
tag dt
tag em
tag embed
tag fieldset
tag figcaption
tag figure
tag footer

tag form
	attr method
	attr action

tag h1
tag h2
tag h3
tag h4
tag h5
tag h6
tag head
tag header
tag hr
tag html
tag i

tag iframe
	attr src

tag img
	attr src

tag input
	# can use attr instead
	attr name
	attr type
	attr required
	attr disabled
	attr autofocus

	def value
		dom:value

	def value= v
		dom:value = v unless v == dom:value
		self

	def placeholder= v
		dom:placeholder = v unless v == dom:placeholder
		self

	def placeholder
		dom:placeholder

	def checked
		dom:checked

	def checked= bool
		dom:checked = bool unless bool == dom:checked
		self

tag ins
tag kbd
tag keygen
tag label
tag legend
tag li

tag link
	attr rel
	attr type
	attr href
	attr media

tag main
tag map
tag mark
tag menu
tag menuitem

tag meta
	attr name
	attr content
	attr charset

tag meter
tag nav
tag noscript
tag object
tag ol
tag optgroup

tag option
	attr value

tag output
tag p
tag param
tag pre
tag progress
tag q
tag rp
tag rt
tag ruby
tag s
tag samp

tag script
	attr src
	attr type

tag section

tag select
	attr name
	attr multiple
	attr required
	attr disabled
	
	def value
		dom:value

	def value= v
		dom:value = v unless v == dom:value
		self


tag small
tag source
tag span
tag strong
tag style
tag sub
tag summary
tag sup
tag table
tag tbody
tag td

tag textarea
	attr name
	attr disabled
	attr required
	attr rows
	attr cols
	attr autofocus

	def value
		dom:value

	def value= v
		dom:value = v unless v == dom:value
		self

	def placeholder= v
		dom:placeholder = v unless v == dom:placeholder
		self

	def placeholder
		dom:placeholder

tag tfoot
tag th
tag thead
tag time
tag title
tag tr
tag track
tag u
tag ul
tag video
tag wbr
