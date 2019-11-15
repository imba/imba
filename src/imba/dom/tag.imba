var Imba = require("../imba")

if $node$
	var serverDom = require './server'
	var Element = ImbaServerElement
	var document = ImbaServerDocument.new

extend class Element
	def text$ item
		@textContent = item
		self

	def insert$ item, index, prev
		let type = typeof item

		if type !== 'object'
			let res
			let txt = item === undefined or item === null ? '' : item
			if index == -1
				@textContent = txt
			else
				@appendChild(res = document.createTextNode(txt))
				return res
		elif item isa Element
			@appendChild(item)
		return

	def flag$ str
		@className = str
		return

	def flagIf$ flag, bool
		bool ? @classList.add(flag) : @classList.remove(flag)
		return

	def render
		if self.template$
			self.template$()
		return

def Imba.createElement name, parent, index, flags, text
	var type = name
	var el

	if name isa Function
		type = name
	else
		el = document.createElement(name)

	if el
		el.className = flags if flags
		el.text$(text) if text !== null

		if parent and index != null  and parent isa Element
			parent.insert$(el,index)
	return el

def Imba.createElementFactory ns
	return Imba.createElement unless ns

	return do |name,ctx,ref,pref|
		var node = Imba.createElement(name,ctx,ref,pref)
		node.dom.classList.add('_' + ns)
		return node

def Imba.createTagScope ns
	return TagScope.new(ns)

def Imba.createFragment type, parent, slot, options
	if type == 2
		return KeyedTagFragment.new(parent,slot,options)
	elif type == 1
		return IndexedTagFragment.new(parent,slot,options)

export class TagFragment
	
export class KeyedTagFragment < TagFragment
	def initialize parent, slot
		@parent = parent
		@slot = slot
		@$ = {} # this is the map
		@array = []
		@prev = []
		@index = 0
		@taglen = 0
		@starter = Imba.document.createComment('')
		@reconciled = no

	def reset
		@index = 0
		var curr = @array
		@array = @prev
		@prev = curr
		@prev.taglen = @taglen
		@index = 0

		return self

	def $iter
		@reset()

	def prune items
		return self

	def push item
		let prev = @prev[@index]
		@array[@index] = item
		@index++
		return

	def insertInto parent, index
		# console.log "inserting into!!",parent,index
		var fragment = Imba.document.createDocumentFragment()
		var i = 0
		var len = @index
		while i < len
			let item = @array[i++]
			fragment.appendChild(item.dom)

		parent.dom.appendChild(fragment)
		self

	def reconcile parent, siblings, index
		console.log "reconciling fragment!",self
		# reconcile this now?
		self

	get length
		@taglen

export class IndexedTagFragment < TagFragment
	def initialize parent, slot
		@parent = parent
		@$ = []
		@length = 0

	def push item, idx
		return

	def reconcile len
		let from = @length
		return if from == len
		let array = @$

		if from > len
			# items should have been added automatically
			while from > len
				var item = array[--from]
				@removeChild(item,from)
		elif len > from
			while len > from
				let node = array[from++]
				@appendChild(node,from - 1)
		@length = len
		return

	def insertInto parent, slot
		self

	def appendChild item, index
		# we know that these items are dom elements
		@parent.appendChild(item)
		return

	def removeChild item, index
		@parent.removeChild(item)
		return

class TagScope
	def initialize ns
		@ns = ns
		@flags = ns ? ['_'+ns] : []

	def defineTag name, supr = '', &body
		return Imba.TAGS.defineTag({scope: self},name,supr,body)

	def extendTag name, body
		return Imba.TAGS.extendTag({scope: self},name,body)
