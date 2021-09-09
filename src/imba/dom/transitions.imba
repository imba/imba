import {Element,get_document} from './core'

class Transitions
	
	selectors = []
	
	def addSelectors add
		selectors.push(...add)
		yes
		
	def nodesForBase base
		let query = selectors.join(',')
		let hits = [base]
		let elements = base.querySelectorAll(query)

		for el in elements
			if el.closest('._ease_') == base
				hits.push(el)
		return hits

export const transitions = new Transitions

export class Easer
	def constructor target
		dom = target
		#phase = null
		#nodes = []
		
	def log ...params
		console.log "ease",...params
		
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
		
	def enable
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
				unflag('_off_')
				#nodes = null
				
			if val == 'enter' and prev == 'leave'
				dom.#ease-exit-cancel!
			if val == 'leave' and prev == 'enter'
				dom.#ease-enter-cancel!
			if val == 'enter'
				dom.#ease-enter!
			if val == 'leave'
				dom.#ease-exit!
			if prev == 'leave' and !val
				dom.#ease-exited!
			if prev == 'enter' and !val
				dom.#ease-entered!
			
	
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

	def #insertInto parent, before
		if entering?
			return dom
		let finish = do
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

		let nodes = #nodes = getAnimatedNodes!

		flag('_off_')
		unflag('_out_')
		
		before ? parent.insertBefore(dom,before) : parent.appendChild(dom)

		let anims = #anims = track do
			phase = 'enter'
			unflag('_off_')

		anims.finished.then(finish) do log('cancelled insert into',$1)
		return dom

	def #removeFrom parent
		if leaving?
			return

		let finalize = do
			if phase == 'leave'
				parent.removeChild(dom)
				phase = null

		if entering?
			let anims = track do
				flag('_off_')
				unflag('_out_')
				phase = 'leave'

			anims.finished.then(finalize) do log('error cancel entering',$1)
			return

		#nodes = getAnimatedNodes!
		
		
		let anims = #anims = track do
			phase = 'leave'
			flag('_off_')
			flag('_out_')
		
		# do it in the same tick if we find no running animations(!)
		unless anims.own.length
			finalize!
			return
		
		anims.finished.then(finalize) do yes
		return

extend class Element

	# called when element is ready to enter	
	def #ease-enter
		yes
	
	# called when element has finished entering
	def #ease-entered
		yes
	
	# called when element has been asked to leave while entering
	def #ease-enter-cancel
		yes
	
	# called when element starts to leave
	def #ease-exit
		yes
	
	# called when element is done leaving
	def #ease-exited
		yes
	
	# called when element re-enters while leaving
	def #ease-exit-cancel
		yes
		
	get ease
		#_easer_ ||= new Easer(self)
		
	set ease value\any
		if value == no
			#_easer_..disable!
			return

		ease.enable(value)