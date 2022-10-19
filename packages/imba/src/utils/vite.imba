import np from 'node:path'
import nfs from 'node:fs'

export const viteServerConfigFile = np.join(__dirname,"./vite.config.server.mjs")

export def importWithFallback(bundled, user)
	let pkg
	try 
		pkg = await import(user) 
	catch error
		pkg = await import(bundled)
	pkg

export def resolveWithFallbacks(ours, fallbacks)
	let pkg = ours
	fallbacks = [fallbacks] unless Array.isArray fallbacks
	for fallback in fallbacks
		const userPkg = np.resolve(fallback)
		if nfs.existsSync userPkg
			return userPkg
	pkg