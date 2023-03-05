global css
	html,body m:0 p:0

describe "@intersect" do

	let ctx = {}
	let events = []
	let res = null
	
	def cb e
		events.push(e)
		res = e

	tag App
		# all divs start right below the viewport
		css div pos:abs h:200px w:200px l:0 t:700px

		<self[d:contents]>
			
			<div$a @intersect.in=cb>
			<div$b @intersect.in=cb>
			
			# don't trigger until we're 100px into the viewport
			<div$c
				@intersect("-100px 0px").in.log('100px')=cb
				@intersect("-300px 0px").in.log('300px')=cb
			>
			
			# adding class while intersecting
			<div$d @intersect.flag-showing=cb>
			<div$e @intersect.flag-showing(':root')=cb>


	let {$a,$b,$c,$d,$e} = imba.mount <App>
	
	def log e
		console.debug 'rootBounds',e.entry.rootBounds
		console.debug 'boundingClientRect',e.entry.boundingClientRect
		console.debug 'intersectionRect',e.entry.intersectionRect
	
	test do
		await imba.commit!
		events = []
		res = null

	# resize should be triggered immediately
	test do
		await imba.commit!
		$a.style.top = 500px
		await imba.commit!
		ok res isa CustomEvent
		eq res.isIntersecting,yes
		eq res.ratio,0.5
		eq events.length,1
		
		# now move it further, dont trigger more changes
		$a.style.top = 400px
		await imba.commit!
		eq events.length,1
		
		
	test "rootMargin" do 
		events = []
		res = null
		# await imba.commit!
		$c.style.top = 400px
		await imba.commit!
		# ok res isa CustomEvent
		eq res.isIntersecting,yes
		eq res.ratio,0.5
		eq $1.log,['100px']
		
	test ".flag" do
		$d.style.top = 400px
		await imba.commit!
		ok $d.matches('.showing')
		$d.style.top = 700px
		await imba.commit!
		ok !$d.matches('.showing')
		
	test ".flag(:root)" do
		$e.style.top = 400px
		await imba.commit!
		ok document.documentElement.matches('.showing')
		$e.style.top = 700px
		await imba.commit!
		ok !document.documentElement.matches('.showing')