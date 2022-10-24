const p = console.log
const cwd = process.cwd!
const swd = __dirname

let parseArgs = require 'minimist'
let prompt = require 'prompts'
let fs = require 'fs'
let path = require 'path'
let { execSync } = require 'child_process'
let { red, green, blue, cyan, bold } = require 'kolorist'

def quit msg='Quit'
	p red(msg)
	process.exit!

const templates =
	'default':
		path: 'default'
		name: 'Default'
		desc: 'Client only application (Imba bundler)'
	'vite':
		path: 'vite'
		name: 'Vite'
		desc: 'Client only application (Vite bundler)'
	'express':
		path: 'express'
		name: 'Express'
		desc: 'Full stack application (Imba bundler)'
	'vitest':
		path: 'vitest'
		name: 'Vitest'
		desc: 'Client only application with vitest (Vite bundler)'
	'module':
		path: 'module'
		name: 'Module'
		desc: 'A module that can be used in any JavaScript project (Vite bundler)'
	'tauri':
		path: 'tauri'
		name: 'Tauri'
		desc: 'Desktop application (Vite bundler)'

const ignore = [
	'.git'
	'node_modules'
	'package-lock.json'
]

def copy src, dest
	return if ignore.includes path.basename(src)
	if path.basename(dest) is '_gitignore'
		dest = path.join(path.dirname(dest), '.gitignore')
	if fs.statSync(src).isDirectory!
		fs.mkdirSync(dest,recursive:yes)
		for file of fs.readdirSync(src)
			copy path.resolve(src,file), path.resolve(dest,file)
	else
		fs.copyFileSync(src,dest)

def toValidRepoName name
	return unless typeof name is 'string'
	return name if name is '.'
	name = name.replaceAll(/[^\s\w.-]/g,'').trim!.replaceAll(/\s+/g,'-')
	if not name or name is '.'
		throw 'Project name can only contain a-z A-Z 0-9 _.-'
	if name is '..'
		throw "Project name cannot be '..'"
	if fs.existsSync(name)
		throw "Project name '{name}' already exists in current directory"
	name

def assertCleanGit
	try
		if execSync('git status --porcelain',stdio:'pipe').toString!
			throw 1
	catch
		quit 'Creating a project in the current directory requires a clean git status'

def main

	const args = parseArgs process.argv.slice(2)

	let opts = onCancel: do quit!

	let projectName
	try projectName = toValidRepoName args._[0]
	catch e p(red(e))

	projectName ??= (await prompt {
		type: 'text'
		message: 'Enter a project name or . for current dir'
		initial: args._[0] or 'imba-project'
		format: toValidRepoName
		validate: do
			try yes if toValidRepoName($1)
			catch e
		name: 'value'
	}, opts).value

	assertCleanGit! if projectName is '.'

	let template = templates[args.t or args.template]

	template ??= (await prompt {
		type: 'select'
		message: 'Choose a template'
		choices: for own key, t of templates
			{ title:t.name, description:t.desc, value:t }
		initial: 0
		name: 'value'
	}, opts).value

	let src = path.join swd, 'templates', template.path
	let dest = path.join cwd, projectName

	if dest is cwd
		assertCleanGit!
	elif fs.existsSync dest
		quit 'Project dir already exists'

	try
		copy src, dest
		let dirStr = "./{projectName is '.' ? '' : projectName}"
		p green("\nCreated <{template.name}> project in {dirStr}")
	catch e
		quit "\nFailed to copy project:\n\n{e}"

	p bold("\nInstalling dependencies")

	try
		process.chdir dest
		execSync "npm pkg set name='{projectName}'"
		execSync 'npm up -S',stdio:'inherit'
	catch e
		p red("\nFailed to install dependencies:\n\n{e}")

	p """

		Install the vscode extension for an optimal experience:
		  {blue('https://marketplace.visualstudio.com/items?itemName=scrimba.vsimba')}

		Join the Imba community on discord for help and friendly discussions:
		  {blue('https://discord.gg/mkcbkRw')}

		Get started:

		  {cyan('➜')} cd {projectName}
		  {cyan('➜')} npm run dev

	"""

main!
