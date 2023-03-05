import 'imba/spec'
import './shared.imba'

class AnimTracker < Array
	queue = []

	def then cb
		Promise.all(queue).then(cb)

let anims = new AnimTracker

def eqanim obj
	for own k,v of obj
		let anim = anims[k]

		if v == false 
			return ok(!anim,message: "Did not expect {k} transition") if anim
			continue
		
		ok(!!anim,message: "Expected animations")
		
		return unless anim
		# console.log 'eq anim',k,v,String(v[0]),v[1],anim,[String(anim[0]),String(anim[1]),anim[1]]
		eq String(anim[0]),String(v[0])
		eq String(anim[1]),String(v[1])
		eq anim.duration,v[2]

def track cb
	let c = anims = new AnimTracker
	let promise = new Promise do
		document.addEventListener('transitionrun',$1,once: true)
		setTimeout($1,1000)
	cb()
	
	try
		# let timeout = setTimeout(&,2000) do throw "Timeout!"	
		await promise
		await Promise.all(c.queue)
		clearTimeout(timeout)
	catch e
		console.log 'caught timeout?'
		yes
	return c

global css @root.noanim
	* tween@important:all 0ms

def instant cb
	document.flags.incr('noanim')
	document.body.offsetWidth
	cb()
	document.body.offsetWidth
	document.flags.decr('noanim')


for typ in ['start','run','end','cancel']
	document.addEventListener(`transition{typ}`) do(e)
		let curr = document.getAnimations!.slice(0)
		if e.type == 'transitionrun'
			global.a = curr
			for item in curr
				if item.#found =? yes
					let found = item
					let key = item.transitionProperty
					let el = item.effect.target
					anims.push(anims[key] = found)
					let start = found.startTime
					found.pause()
					found.startTime = found.timeline.currentTime
					found.currentTime = 0
					found[0] = el.computedStyleMap!.get(key)
					found.play()
					console.log 'started',found.startTime,found.timeline.currentTime,found[0],found.#easer,curr
					let resolve
					let promise = new Promise do resolve = $1
					anims.queue.push(promise)

					let finisher = do
						if resolve
							found[1] = el.computedStyleMap!.get(key)
							found.duration = found.currentTime
							resolve([found[0],found[1],found.duration])
							resolve = null
					
					found.onfinish = finisher
					# hacky event from imba core just to allow testing currently
					if found.#easer
						found.#easer.dom.addEventListener('easeoutend',finisher,once: true)
						# console.log "OUTEND!",found.#easer.dom.parentNode

tag App
	<self[inset:0 d:vflex ja:center ai:stretch g:4 p:4]>
		css counter-reset:section
		css section pos:relative
			@before
				content:counter(section)
				counter-increment:section
				inset:0 zi:2 d:hflex ja:center

		css .trx transform:translate(0px,0px) .hover:translate(10px,0px) @off:translate(20px,0px)
		css .fade o:0.5 .hover:0.8 @off:0
		css .pos l:0px .hover:10px @off:20px @in:-20px

		<variations.variations>
			<toggleable flaganim={opacity: [0.5,1,50]}>
				<section[o:0.5 .hover:1 ease:50ms]>

			<toggleable flaganim={opacity: [0.5,0.8,40],transform:["translate(0px, 0px)","translate(10px, 0px)",50]}>
				<section.trx.fade[eod:40ms etd:50ms]>

			<toggleable flaganim={transform:["translate(0px, 0px)","translate(10px, 0px)",40]}>
				<section.trx[ebd:40ms]>

			<toggleable flaganim={opacity:[0.5,0.8,60]}>
				<section.fade[eo:40ms linear 20ms]> # ease opacity with timing and delay

			# disable certain easings
			<toggleable flaganim={opacity:[0.5,0.8,40], left: false}>
				<section.fade.pos[e:40ms transition:left 0ms]> # ease opacity with timing and delay

			<toggleable flaganim={opacity:[0.5,0.8,60]}>
				<section.fade[eod:40ms eow:20ms]> # ease opacity with timing and delay

			<toggleable flaganim={opacity: [0.5,0.8,50],left:[0px,10px,40]}>
				<section.pos.fade[e:40ms eo:50ms eof:quint-in]>

			<toggleable outanim={opacity: [1,0,300]}> <section ease [o:1 @off:0]>
			<toggleable flaganim={opacity: [1,0,20]}> <section[o:1 .hover:0 eod:20ms]>
			
			<toggleable
				outanim={opacity: [1,0,60],left:[0px,10px,300]}
				flaganim={opacity: [1,0.8,60]}
			> <section[o:1 @off:0 .hover:0.8 ease:60ms] ease>
				<div[pos:absolute l:0px @out:10px]>

			<toggleable
				outanim={opacity: [1,0,60]}
			> <section.active ease>
				css o:0.5 @off:0 .active:1 ease:60ms
				# @off, @in, @out should always have higher precedence than other styles

			<toggleable
				outanim={opacity: [1,0,70]}
				inanim={opacity: [0,1,40]}
			> <section ease>
				css o:1 @off:0
					ease:60ms
					@leave ease:70ms # different duration when leaving
					@enter ease:40ms # and entering

			# you can set different ease durations and timing functions for
			# different properties
			<toggleable
				outanim={opacity: [1,0,30], left: [0px,10px,50ms]}
			> <section ease>
				css o:1 @off:0
					l:0px @off:10px
					e:30ms eb:50ms

imba.mount let app = <App>

for el,i in document.querySelectorAll('.variations > *')
	let name = "section #{i}"
	if el.flaganim
		test "{name} flag" do
			console.log 'check hover!',el.children[0]
			let res = await track do el.children[0].flags.add('hover')
			eqanim el.flaganim
			instant do el.children[0].flags.remove('hover')

	if el.outanim
		test "{name} leave" do
			await imba.commit!
			let res = await track do el.toggle!
			# console.log 'got anims',res
			eqanim el.outanim
	
	if el.inanim
		test "{name} enter" do
			await imba.commit!
			let res = await track do el.toggle!
			eqanim el.inanim
	
		
	
