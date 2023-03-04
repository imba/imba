import np from 'node:path'
import nfs from 'node:fs'
import url from 'node:url'
import merge from 'lodash.merge'
# import merge from 'deepmerge'

const _dirname = if typeof __dirname !== 'undefined' then __dirname else np.dirname(url.fileURLToPath(import.meta.url))
const {isPackageExists} = require('local-pkg')
import c from 'picocolors'

const EXIT_CODE_RESTART = 43
export const imbaConfigPath = np.join(_dirname, "..", "bin", "./imba.config.mjs")

let extensions = ['imba', 'ts', 'mts', 'js', 'mjs', 'cjs']
export def importWithFallback(bundled, user)
	let pkg
	try 
		pkg = await import(user) 
	catch error
		pkg = await import(bundled)
	pkg

export def getConfigFilePath(type, opts)
	opts ||= {command: "serve", mode: "development"}

	const types = ["client", "server", "test", "testSetup", "imba", "root"]
	
	unless types.includes type
		throw new Error("Unrecognized config type {type}. Should be one of {types}")

	if type == 'test'
		# priority for tests is vitest config file
		# we can't pass a merged object to vitest cli :/
		for ext in extensions when ext != 'imba'
			const name = "vitest.config.{ext}"
			const path = np.join process.cwd!, name
			if nfs.existsSync path
				return path

		# next up, see if the user has a test prop in imba config file
		# and plugins in the root
		for ext in extensions
			const name = "imba.config.{ext}"
			const path = np.join process.cwd!, name
			if nfs.existsSync path
				let {default: imbaConfig} = await import(String url.pathToFileURL path)
				if typeof imbaConfig == "function"
					imbaConfig = imbaConfig({command, mode})

				if imbaConfig[type]
					if imbaConfig.plugins
						return path
					else
						console.warn("You need to configure the plugins manually at the top level config or create a vitest.config.js file")
		# otherwise use the default test config
		return imbaConfigPath

	# load default imba config
	let {default: defaultImbaConfig} = await import(String url.pathToFileURL imbaConfigPath)
	if typeof defaultImbaConfig == "function"
		defaultImbaConfig = defaultImbaConfig({command, mode})


	const defaultConfig = defaultImbaConfig[type]

	# client, server, imba or test

	# we only support imba.config.js
	# to use a regular vite.config.js
	# add a configFile property to client: { configFile: } im imba.config.js
	
	# search in current working dir
	
	let configPath
	for ext in extensions
		const name = "imba.config.{ext}"
		const path = np.join process.cwd!, name
		if nfs.existsSync path
			configPath = path

	configPath ||= imbaConfigPath

	if configPath.endsWith('imba')
		throw new Error(".imba config file not yet supported")

	let {default: imbaConfig} = await import(String url.pathToFileURL configPath)
	if typeof imbaConfig == "function"
		imbaConfig = imbaConfig({command, mode})

	return imbaConfig if type == "root"
	const configObj = imbaConfig[type]

	return defaultConfig if !configObj
	
	merge(defaultConfig, configObj)

	
export def ensurePackagesInstalled(dependencies, root)
	const to-install = []
	const {isPackageExists} = require('local-pkg')
	for dependency in dependencies
		to-install.push dependency if !isPackageExists(dependency, {paths: [root]})
	return true if to-install.length == 0
	const promptInstall = !process.env.CI and process.stdout.isTTY
	const deps = to-install.join(', ')
	process.stderr.write c.red("{c.inverse(c.red(' MISSING DEP '))} Cannot find dependencies '{deps}'\n\n")
	if !promptInstall
		return false
	const prompts = await import("prompts")
	const {install} = await prompts.prompt(
		type: "confirm"
		name: "install"
		message: c.reset("Do you want to install {c.green(deps)}?"))
	if install
		await (await import("@antfu/install-pkg")).installPackage(to-install, dev: true)
		process.stderr.write c.yellow("\nPackages {deps} installed, re-run the command to start.\n")
		process.exit EXIT_CODE_RESTART
		return true
	return false
