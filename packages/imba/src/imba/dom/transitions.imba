import {Element,get_document} from './core'

class Transitions
	
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

export class Easer
	def constructor target
		dom = target
		#phase = null
		#nodes = []
		#sizes = new Map
		
	def log ...params
		return
		
		
	get flags
		dom.flags
		
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
		flags.unflag('_ease_')
		yes
	
	set phase val
		let prev = #phase
		
		if #phase =? val
			flags.remove("_{prev}_") if prev
			flags.add("_{val}_")  if val
			flags.toggle('_easing_',!!val)
		
			# clearing all the node animations
			unless val
				unflag('_out_')
				unflag('_in_')
				unflag('_off_')
				#nodes = null
				
			if val == 'enter' and prev == 'leave'
				dom..transition-out-cancel(self)
			if val == 'leave' and prev == 'enter'
				dom..transition-in-cancel(self)
			if val == 'enter'
				dom..transition-in(self)
			if val == 'leave'
				dom..transition-out(self)
			if prev == 'leave' and !val
				dom..transition-out-end(self)
			if prev == 'enter' and !val
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
		anims.finished = Promise.all(anims.own.map do $1.finished)
		return anims
		
	def getAnimatedNodes
		return transitions.nodesForBase(dom)

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
		for [node,rect] of map
			node.style.removeProperty('width')
			node.style.removeProperty('height')
		map

	def #insertInto parent, before
		let sizes
		if entering?
			return dom
		let finish = do
			clearNodeSizes(sizes) if sizes
			phase = null if entering?
		
		if leaving?
			let anims = track do
				phase = 'enter'
				unflag('_off_')
				unflag('_out_')
				
			# what if there are no animations?
			anims.finished.then(finish) do log('error cancel leave',$1)
			return dom

		let parConnected = get_document!.contains(parent)

		before ? parent.insertBefore(dom,before) : parent.appendChild(dom)
		
		#nodes = getAnimatedNodes!

		flag('_instant_')
		unflag('_out_')
		commit!
		# must be certain that they don't have a size set directly?
		
		sizes = #nodes.sized = getNodeSizes('in')
		dom..transition-in-init(self)
		flag('_off_')
		flag('_in_')
		
		commit!
		unflag('_instant_')

		let anims = #anims = track do
			phase = 'enter'
			applyNodeSizes(sizes)
			unflag('_off_')
			unflag('_in_')

		anims.finished.then(finish) do
			clearNodeSizes(sizes)
			log('cancelled insert into',$1)
		return dom

	def #removeFrom parent
		if leaving?
			return

		let sizes
		let finalize = do
			if phase == 'leave'
				parent.removeChild(dom)
				phase = null

		if entering? and #mode != 'forward'
			let anims = track do
				flag('_off_')
				flag('_in_')
				unflag('_out_')
				phase = 'leave'
				clearNodeSizes(#nodes.sized)
			log "cancel enter anims own",anims.own,anims
			anims.finished.then(finalize) do log('error cancel entering',$1)
			return

		#nodes = getAnimatedNodes!
		sizes = getNodeSizes('out')
		applyNodeSizes(sizes)
		
		let anims = #anims = track do
			phase = 'leave'
			flag('_off_')
			flag('_out_')
			clearNodeSizes(sizes)
		
		# do it in the same tick if we find no running animations(!)
		unless anims.own.length
			finalize!
			return
		
		anims.finished.then(finalize) do yes
		return

extend class Element

	# called when element is getting ready to enter	
	def transition-in-init transition
		yes

	# called when element is ready to enter	
	def transition-in transition
		yes
	
	# called when element has finished entering
	def transition-in-end transition
		yes
	
	# called when element has been asked to leave while entering
	def transition-in-cancel transition
		yes
	
	# called when element starts to leave
	def transition-out transition
		yes
	
	# called when element is done leaving
	def transition-out-end transition
		yes
	
	# called when element re-enters while leaving
	def transition-out-cancel transition
		yes
		
	get ease
		#_easer_ ||= new Easer(self)
		
	set ease value\any
		if value == no
			#_easer_..disable!
			return

		ease.enable(value)
		
export def use_dom_transitions
	yes