import np from 'node:path'
import nfs from 'node:fs'
import {isPackageExists} from 'local-pkg'
import c from 'picocolors'

const EXIT_CODE_RESTART = 43
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
		# const userPkg = np.resolve(fallback)
		if nfs.existsSync fallback
			return fallback
	pkg

export def ensurePackagesInstalled(dependencies, root)
	const to-install = []
	for dependency in dependencies
		to-install.push dependency if !isPackageExists(dependency, {paths: [root]})
	return true if to-install.length == 0
	const promptInstall = !process.env.CI and process.stdout.isTTY
	const deps = to-install.join(', ')
	process.stderr.write c.red("{c.inverse(c.red(' MISSING DEP '))} Can not find dependencies '{deps}'\n\n")
	if !promptInstall
		return false
	const prompts = await import("prompts")
	const {install} = await prompts.prompt(
		type: "confirm"
		name: "install"
		message: c.reset("Do you want to install {c.green(deps)}?"))
	if install
		for dependency in to-install
			await (await import("@antfu/install-pkg")).installPackage(dependency, dev: true)
		process.stderr.write c.yellow("\nPackages {deps} installed, re-run the command to start.\n")
		process.exit EXIT_CODE_RESTART
		return true
	return false
