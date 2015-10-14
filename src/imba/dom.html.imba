
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
	prop href dom: yes

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
	prop type dom: yes
	prop disabled dom: yes

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
	prop method dom: yes
	prop action dom: yes

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
	prop name dom: yes
	prop type dom: yes
	prop value dom: yes # dom property - NOT attribute
	prop required dom: yes
	prop disabled dom: yes
	prop placeholder dom: yes

	attr autofocus

	def value
		dom:value

	def value= v
		dom:value = v unless v == dom:value
		self

	def placeholder= v
		dom:placeholder = v unless v == dom:placeholder
		self

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
	prop rel dom: yes
	prop type dom: yes
	prop href dom: yes
	prop media dom: yes

tag main
tag map
tag mark
tag menu
tag menuitem

tag meta
	prop name dom: yes
	prop content dom: yes
	prop charset dom: yes

tag meter
tag nav
tag noscript
tag object
tag ol
tag optgroup

tag option
	prop value dom: yes

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
	prop src dom: yes
	prop type dom: yes

tag section

tag select
	prop multiple dom: yes
	
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
	prop name dom: yes
	prop disabled dom: yes
	prop required dom: yes
	prop placeholder dom: yes
	prop value dom: yes
	prop rows dom: yes
	prop cols dom: yes

	attr autofocus

	def value
		dom:value

	def value= v
		dom:value = v unless v == dom:value
		self

	def placeholder= v
		dom:placeholder = v unless v == dom:placeholder
		self

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
