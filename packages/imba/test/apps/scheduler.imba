const scheduler = imba.scheduler

tag flush-app
	prop msg = 'a'
	def render
		<self> msg

imba.mount let app = <flush-app>

let parked = []
let nativeRaf = global.requestAnimationFrame

def freeze
	global.requestAnimationFrame = do(cb) parked.push(cb)

def thaw
	global.requestAnimationFrame = nativeRaf

def hide
	Object.defineProperty(global.document,'hidden',{value: yes, configurable: yes})

def show
	Object.defineProperty(global.document,'hidden',{value: no, configurable: yes})

def sleep ms = 60
	new Promise(do(resolve) global.setTimeout(resolve,ms))

test "hidden commit flushes without rAF" do
	await imba.commit!
	eq app.textContent, 'a'
	scheduler.flushHidden = yes
	freeze!
	hide!
	app.msg = 'b'
	let resolved = no
	imba.commit!.then(do resolved = yes)
	await sleep!
	eq app.textContent, 'b'
	eq resolved, yes

test "raf-only ticks stay frozen while hidden" do
	let rafTicks = 0
	let listener = do rafTicks++
	scheduler.listen('raf',listener)
	await sleep!
	eq rafTicks, 0
	app.msg = 'c'
	await imba.commit!
	eq app.textContent, 'c'
	let count = rafTicks
	assert count >= 1
	await sleep 100
	eq rafTicks, count
	scheduler.unlisten('raf',listener)
	await imba.commit!

test "stale parked rAF callbacks are ignored" do
	app.msg = 'd'
	await imba.commit!
	eq app.textContent, 'd'
	let stale = parked.splice(0)
	assert stale.length > 0
	let v = scheduler.version
	for cb in stale
		cb(global.performance.now!)
	eq scheduler.version, v
	eq app.textContent, 'd'

test "commit parked before hiding flushes on visibilitychange" do
	show!
	app.msg = 'e'
	imba.commit!
	await sleep!
	eq app.textContent, 'd'
	hide!
	global.document.dispatchEvent(new global.Event('visibilitychange'))
	await sleep!
	eq app.textContent, 'e'

test "flushHidden off keeps commits frozen" do
	scheduler.flushHidden = no
	app.msg = 'f'
	imba.commit!
	await sleep 100
	eq app.textContent, 'e'
	scheduler.flushHidden = yes
	show!
	thaw!
	for cb in parked.splice(0)
		cb(global.performance.now!)
	eq app.textContent, 'f'
	delete global.document.hidden
	await imba.commit!
