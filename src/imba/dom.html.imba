
# predefine all supported html tags
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
	attr type
	attr required
	attr disabled
	attr autofocus

	prop value dom: yes
	prop placeholder dom: yes
	prop required dom: yes
	prop disabled dom: yes
	prop checked dom: yes
	prop readOnly dom: yes

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
	attr content
	attr charset

tag meter
tag nav
tag noscript

tag ol
tag optgroup
	prop disabled dom: yes

tag option
	prop disabled dom: yes
	prop selected dom: yes
	prop value dom: yes

tag output
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
	attr multiple

	prop disabled dom: yes
	prop required dom: yes
	prop readOnly dom: yes
	prop value dom: yes


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
	attr autofocus

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

# var idls =
# 	name: ['button','form','fieldset','iframe','input','keygen','object','output','select','textarea','map','meta','param']
# 	src: ['audio','embed','iframe','img','input','script','source','track','video']
# 	disabled: ['button','fieldset','input','keygen','optgroup','option','select','textarea'] # 'command',
# 	required: ['input','select','textarea']

# for own name,tags of idls
# 	idls[name] = tags.map do |name|
# 		console.log name
# 		Imba.TAGS[name][:prototype]
# 
# for typ in idls:src
# 	def typ.src do dom:src
# 	def typ.setSrc val
# 		dom:src = val if val != dom:src
# 		self
# 
# for typ in idls:disabled
# 	def typ.disabled do dom:disabled
# 	def typ.setDisabled val
# 		dom:disabled = val if dom:disabled != !!val
# 		self
# 
# for typ in idls:required
# 	def typ.required do dom:required
# 	def typ.setRequired val
# 		dom:required = val if dom:required != !!val
# 		self


yes
