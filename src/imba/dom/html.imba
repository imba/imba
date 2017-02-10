
# predefine all supported html tags
tag fragment < element

	def self.createNode
		Imba.document.createDocumentFragment

tag a
	attr href
	attr target
	attr hreflang
	attr media
	attr download
	attr rel
	attr type

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

	prop disabled dom: yes

tag canvas
	prop width dom: yes
	prop height dom: yes

	def context type = '2d'
		dom.getContext(type)

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
	prop disabled dom: yes

tag figcaption
tag figure
tag footer

tag form
	attr method
	attr action
	attr enctype
	attr autocomplete
	attr target

	prop novalidate dom: yes

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
	attr referrerpolicy
	attr src
	attr srcdoc
	attr sandbox

tag img
	attr src
	attr srcset

tag input
	attr accept
	attr disabled
	attr form
	attr list
	attr max
	attr maxlength
	attr min
	attr pattern
	attr required
	attr size
	attr step
	attr type

	prop autofocus dom: yes
	prop autocomplete dom: yes
	prop autocorrect dom: yes
	prop value dom: yes
	prop placeholder dom: yes
	prop required dom: yes
	prop disabled dom: yes
	prop multiple dom: yes
	prop checked dom: yes
	prop readOnly dom: yes

tag ins
tag kbd
tag keygen
tag label
	attr accesskey
	attr for
	attr form


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
	attr content
	attr charset

tag meter
tag nav
tag noscript

tag ol

tag optgroup
	attr label
	prop disabled dom: yes

tag option
	attr label
	prop disabled dom: yes
	prop selected dom: yes
	prop value dom: yes

tag output
	attr for
	attr form

tag p

tag object
	attr type inline: no
	attr data inline: no
	attr width inline: no
	attr height inline: no

tag param
	attr name
	attr value

tag pre
tag progress
	attr max
	prop value dom: yes

tag q
tag rp
tag rt
tag ruby
tag s
tag samp

tag script
	attr src
	attr type
	attr async
	attr defer

tag section

tag select
	attr size
	attr form
	attr multiple
	prop autofocus dom: yes
	prop disabled dom: yes
	prop required dom: yes

	def value= value
		value = String(value)
	
		if dom:value != value
			dom:value = value
		
			if dom:value != value
				@delayedValue = value

		self
	
	def value
		dom:value
	
	def syncValue
		if @delayedValue != undefined
			dom:value = @delayedValue
			@delayedValue = undefined
		self
	
	def setChildren
		super
		syncValue

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
	attr rows
	attr cols

	prop autofocus dom: yes
	prop autocomplete dom: yes
	prop autocorrect dom: yes
	prop value dom: yes
	prop disabled dom: yes
	prop required dom: yes
	prop readOnly dom: yes
	prop placeholder dom: yes

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

yes
