
const scope = document.location.pathname.replace(/\/\w+\.html/,'')

console.log 'bridge for scope',scope

const client = new class
	registration

	def constructor
		sw = window.navigator.serviceWorker
		setup!

	def log ...params
		console.log "Bridge",...params

	def setup
		window.addEventListener('message') do(e)
			log "window.onmessage",e
			if sw.controller
				sw.controller.postMessage(e.data)

		sw.addEventListener('message') do(e)
			log "sw.onmessage",e
			window.parent.postMessage(e.data,'*')

		await createServiceWorker!
		
		
	def createServiceWorker
		if !sw
			throw new Error("Service workers are not supported")

		let reg = await sw.getRegistration(scope)

		if reg
			await reg.update!
		else
			reg = await sw.register('/__sw__.js', scope: './')
		
		window.parent.replService = sw.controller
		window.parent.postMessage('ready','*')
		self