import np from 'node:path'
import nfs from 'node:fs'
import url from 'node:url'
import c from 'picocolors'
const _dirname = if typeof __dirname !== 'undefined' then __dirname else np.dirname(url.fileURLToPath(import.meta.url))

const EXIT_CODE_RESTART = 43
export const viteServerConfigFile = np.join(_dirname, "..", "bin", "./vite.config.server.mjs")
export const viteClientConfigFile = np.join(_dirname, "..", "bin", "./vite.config.mjs")
export const vitestSetupPath = np.join(_dirname, "..", "bin", "./test-setup.js")

export def getConfigFilePath(type)
	const typeMap = 
		client: 'vite.config'
		server: 'vite.config.server'
		test: 'vitest.config'
		testSetup: 'test-setup'
		imba: 'imba.config'
	
	const fileName = typeMap[type]

	unless fileName
		throw new Error("Unrecognized config type {type}. Should be one of {Object.keys typeMap}")

	# search in current working dir
	let extensions = ['ts', 'mts', 'js', 'mjs', 'cjs']
	extensions.unshift 'imba' if type == 'testSetup'
	
	for ext in extensions
		const name = "{fileName}.{ext}"
		const path = np.join process.cwd!, name
		if nfs.existsSync path
			return path

	# not found, use default config
	if type == 'test' or type == 'server'
		return viteServerConfigFile
	elif type == 'client'
		return viteClientConfigFile
	elif type == 'testSetup'
		return vitestSetupPath

	throw new Error("config file {type} not found. This is probably a bug. Please open an issue in https://github.com/imba/imba/issues/new")
	
export def ensurePackagesInstalled(dependencies, root)
	const to-install = []
	const {isPackageExists} = require('local-pkg')
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
