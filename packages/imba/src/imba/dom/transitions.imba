# imba$stdlib=1

import {get_document} from './core'
import {Emitter} from '../utils'
$node$ import {Element} from './core'

class Transitions < Emitter
	selectors = {}

	def addSelectors add, group
		let arr = selectors[group] ||= []
		arr.push(...add)
		yes

	def getSelectors ...groups
		let sels = []
		for group in groups
			if selectors[group]
				sels.push(...selectors[group])
		sels and sels.length ? sels.join(',') : null

	def nodesForBase base, kind = 'transition'
		let hits = [base]
		let query = (selectors[kind] or []).join(',')
		return hits if query == ''

		let elements = base.querySelectorAll(query)

		for el in elements
			if el.closest('._ease_') == base
				hits.push(el)
		hits.#all = elements
		return hits

	def nodesWithSize nodes, dir = 'in'
		let sel = getSelectors('_off_sized',"_{dir}_sized")
		return [] unless sel
		nodes.filter do $1.matches(sel)

export const transitions = new Transitions

let instance = global.imba ||= {}
instance.transitions = transitions

export class EaseGroup < Emitter

	flushing? = no
	mutations = []

	def constructor callback
		super()
		callback = callback


	def insert parent, node, before
		mutations.push {target: parent, addedNodes: [node], removedNodes:[], nextSibling: before}

	def remove parent, node
		mutations.push {target: parent, addedNodes:[], removedNodes: [node]}

	def flush
		let muts = mutations.slice(0)
		unless muts.length
			return self

		mutations = []
		callback(muts) if callback isa Function
		emit('start',self,muts)
		flushing? = yes
		for mut of muts
			for add of mut.addedNodes
				add.#insertInto(mut.target,mut.nextSibling)
			for rem of mut.removedNodes
				rem.#removeFrom(mut.target)
		flushing? = no
		emit('end',self,muts)
	

export class Easer < Emitter
	def constructor target
		super()
		dom = target
		#phase = null
		#nodes = []
		#sizes = new Map

	def log ...params
		return

	get flags
		dom.flags

	def link el
		#linked ||= new Set
		#linked.add(el)

	def unlink el
		#linked.delete(el)

	def flag flags
		for node in #nodes
			node.flags.add(flags)
		self

	def unflag flags
		for node in #nodes
			node.flags.remove(flags)
		self

	def commit
		dom.offsetWidth

	def enable mode
		if mode
			#mode = mode
		return self unless #enabled =? yes
		# TODO support attach/detach deopt api
		dom.#insertInto = #insertInto.bind(self)
		dom.#removeFrom = #removeFrom.bind(self)
		flags.add('_ease_')

	def disable
		flags.remove('_ease_')
		yes

	set phase val
		let prev = #phase

		if #phase =? val
			unflag("@{prev}") if prev
			flag("@{val}")  if val

			# clearing all the node animations
			unless val
				unflag('@out')
				unflag('@in')
				unflag('@off')
				#nodes = null

			if val == 'enter' and prev == 'leave'
				dom..emit(`outcancel`)
				dom..transition-out-cancel(self)
			if val == 'leave' and prev == 'enter'
				dom..emit(`incancel`)
				dom..transition-in-cancel(self)
			if val == 'enter'
				dom..emit(`in`)
				dom..transition-in(self)
			if val == 'leave'
				dom..emit(`out`)
				dom..transition-out(self)
			if prev == 'leave' and !val
				dom..emit(`outend`)
				dom..transition-out-end(self)
			if prev == 'enter' and !val
				dom..emit(`inend`)
				dom..transition-in-end(self)

	get phase
		#phase

	get leaving?
		phase == 'leave'

	get entering?
		phase == 'enter'

	get idle?
		phase == null

	def track cb
		let anims = {before: get_document!.getAnimations!}
		commit!
		cb()
		commit!
		anims.after = get_document!.getAnimations!
		anims.fresh = anims.after.filter do
				anims.before.indexOf($1) == -1
		anims.deep = anims.fresh.filter do
			if let el = $1.effect.target
				return yes if el.closest('._ease_') != dom
			return no
		anims.own = anims.fresh.filter do anims.deep.indexOf($1) == -1

		if anims.own.length
			anims.finished = new Promise do(resolve)
				let all = new Set(anims.own)
				let finish = do
					all.delete(this)
					if all.size == 0
						resolve()

				for anim in anims.own
					anim.#easer = self
					anim.addEventListener('finish',finish,once:yes)
					anim.addEventListener('cancel',finish,once:yes)
				return
		else
			anims.finished = Promise.resolve(yes)
		return anims

	def getAnimatedNodes
		let nodes = transitions.nodesForBase(dom)
		nodes = nodes.concat(Array.from(#linked)) if #linked
		return nodes

	def getNodeSizes dir = 'in', nodes = #nodes
		let hits = transitions.nodesWithSize(nodes,dir)
		let map = new Map

		for node in hits
			let style = window.getComputedStyle(node)
			map.set(node,{
				width: style.width # node.offsetWidth
				height: style.height # node.offsetHeight
			})
		map

	def applyNodeSizes map
		for [node,rect] of map
			node.style.width = rect.width # + 'px'
			node.style.height = rect.height # + 'px'
		map

	def clearNodeSizes map
		return unless map

		for [node,rect] of map
			node.style.removeProperty('width')
			node.style.removeProperty('height')
		map

	def #insertInto parent, before

		if #group and !#group.flushing?
			#group.insert(parent,dom,before)
			# is it not a point to actually ensure that we do change?
			return dom

		let sizes
		if entering?
			return dom
		let finish = do
			clearNodeSizes(sizes) if sizes
			phase = null if entering?

		if leaving?
			let anims = track do
				phase = 'enter'
				unflag('@off')
				unflag('@out')

			# what if there are no animations?
			anims.finished.then(finish) do log('error cancel leave',$1)
			return dom

		let parConnected = get_document!.contains(parent)

		# Check if we are already still attached here
		if before
			unless dom.nextSibling == before
				parent.insertBefore(dom,before)
		else
			if dom.parentNode != parent
				# what if we are moving?
				parent.appendChild(dom)

		#nodes = getAnimatedNodes!

		# Could it be better to set the flags before adding it to the dom?

		flag('_instant_')
		unflag('@out')
		commit!
		# must be certain that they don't have a size set directly?
		sizes = #nodes.sized = getNodeSizes('in')

		dom..transition-in-init(self)
		flag('@off')
		flag('@in')
		flag('@enter')

		commit!
		unflag('_instant_')

		let anims = track do
			phase = 'enter'
			applyNodeSizes(sizes)
			unflag('@off')
			unflag('@in')

		anims.finished.then(finish) do
			clearNodeSizes(sizes)
			log('cancelled insert into',$1)
		return dom

	def #removeFrom parent

		if #group and !#group.flushing?
			#group.remove(parent,dom)
			# is it not a point to actually ensure that we do change?
			return

		if leaving?
			return

		let sizes
		let finalize = do
			if phase == 'leave'
				dom.emit('easeoutend',{})
				parent.removeChild(dom)
				phase = null

		if entering? and #mode != 'forward'
			let anims = track do
				flag('@off')
				flag('@in')
				unflag('@out')
				phase = 'leave'
				clearNodeSizes(#nodes.sized)
			log "cancel enter anims own",anims.own,anims
			anims.finished.then(finalize) do log('error cancel entering',$1)
			return

		#nodes = getAnimatedNodes!
		sizes = getNodeSizes('out')
		applyNodeSizes(sizes)
		flag('@leave')
		let anims = track do
			phase = 'leave'
			flag('@off')
			flag('@out')
			clearNodeSizes(sizes)

		# do it in the same tick if we find no running animations(!)
		unless anims.own.length
			finalize!
			return

		anims.finished.then(finalize) do
			yes
		return

extend class Element

	# called when element is getting ready to enter
	def transition-in-init\any transition
		yes

	# called when element is ready to enter
	def transition-in\any transition
		yes

	# called when element has finished entering
	def transition-in-end\any transition
		yes

	# called when element has been asked to leave while entering
	def transition-in-cancel\any transition
		yes

	# called when element starts to leave
	def transition-out\any transition
		yes

	# called when element is done leaving
	def transition-out-end\any transition
		yes

	# called when element re-enters while leaving
	def transition-out-cancel\any transition
		yes

	get ease
		#_easer_ ||= new Easer(self)

	###
	Enable transitions for when element is attached / detached
	@see[Transitions](https://imba.io/css/transitions)
	@idl
	###
	set ease value\any
		if value == no
			#_easer_..disable!
			return

		ease.enable(value)

export def use_dom_transitions
	global.imba.uses_dom_transitions = yes
	yes