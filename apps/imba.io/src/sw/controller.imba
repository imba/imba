import {fs} from '../store'

# Get a unique service-worker / scope for this window
let clid

try
	let now = Date.now!
	let nr = 0
	while nr < 30
		let id = "repl-{nr++}"
		let expiry = global.localStorage.getItem(id)
		if !expiry || parseInt(expiry) < now
			break clid = id

window.CONTAINER_ID = clid
global.localStorage.setItem(clid,Date.now! + 60000 * 60 * 72)
window.addEventListener('unload') do global.localStorage.removeItem(clid)

let promise = null
let resolved = null

export const scope = "/{clid}"
export const id = String(Math.random!)

export def load
	return Promise.resolve(resolved) if resolved
	
	promise ||= new Promise do(resolve)
		return unless window.parent == window

		const sw = window.navigator.serviceWorker

		try
			# remove the old root registration
			let rootreg = await sw.getRegistration("/")
			rootreg.unregister! if rootreg
		try
			let reg = await sw.getRegistration(scope + "/")
			
			if reg
				await reg.update!
			else
				# console.log 'register service worker'
				reg = await sw.register(scope + "/__sw_{clid.split("-")[1]}__.js", scope: scope + "/")

			let frame = new <iframe[pos:absolute t:-10 l:-10 h:1 w:1] src="{scope}/__blank__.html">

			frame.onload = do(e)
				
				let win = frame.contentWindow
				let replserver = win..navigator..serviceWorker
				await fs.connectToWorker(replserver)
				global.replsw = replserver
				resolve(resolved = replserver)

			document.body.appendChild(frame)
			return
		catch e
			console.warn 'error setting up service worker',e
