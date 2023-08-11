import np from 'node:path'
import nfs from 'node:fs'
import url from 'node:url'
import c from './colors'
import mergeWith from 'lodash.mergewith'

const _dirname = if typeof __dirname !== 'undefined' then __dirname else np.dirname(url.fileURLToPath(import.meta.url))

const EXIT_CODE_RESTART = 43
export const imbaConfigPath = np.join(_dirname, "..", "bin", "./imba.config.mjs")

let extensions = ['imba', 'ts', 'mts', 'js', 'mjs', 'cjs']

export def getConfigFilePath(type, opts\Object)
	opts.command ||= "serve"
	opts.mode ||= "development"

	const types = ["client", "server", "test", "testSetup", "imba", "root"]
	
	unless types.includes type
		throw new Error("Unrecognized config type {type}. Should be one of {types}")

	let configPath
	for ext in extensions
		const name = "imba.config.{ext}"
		const path = np.join process.cwd!, name
		if nfs.existsSync path
			configPath = path

	# debugger
	return {} unless opts.vite or configPath

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
					imbaConfig = await imbaConfig(opts)
				return path
		# otherwise use the default test config
		return imbaConfigPath

	# client, server, imba or test

	# we only support imba.config.js
	# to use a regular vite.config.js
	# add a configFile property to client: { configFile: } im imba.config.js
	
	# search in current working dir

	configPath ||= imbaConfigPath

	if configPath.endsWith('imba')
		throw new Error(".imba config file not yet supported")

	let {default: imbaConfig} = await import(String url.pathToFileURL configPath)
	if typeof imbaConfig == "function"
		imbaConfig = await imbaConfig({command, mode})

	return imbaConfig if type == "root"
	return imbaConfig if configPath == imbaConfigPath

	const configObj = imbaConfig[type]

	# TODO no merging if it is all the same file

	# load default imba config
	let {default: defaultImbaConfig} = await import(String url.pathToFileURL imbaConfigPath)
	if typeof defaultImbaConfig == "function"
		defaultImbaConfig = await defaultImbaConfig({command, mode})
	const defaultConfig = defaultImbaConfig[type]

	return defaultConfig if !configObj
	
	mergeWith(defaultConfig, configObj) do(objValue, srcValue, prop)
		# merge configs while removing duplicates
		if Array.isArray(objValue) and Array.isArray(srcValue)
			const flatSrc = srcValue.flat!
			const flatObj = objValue.flat!
			const merged = flatSrc.concat flatObj
			return merged.filter do(v, i, a)
				const ind = a.findLastIndex do(v2)
					if prop == 'plugins'
						v2..name === v..name
					else
						v2 === v

				return ind == i

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
