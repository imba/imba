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

const templates = [
	name: 'Full Stack'
	desc: 'Full stack app with backend in Express (Imba bundler)'
	path: 'base'
	-
	name: 'Jamstack'
	desc: 'Client only application (Vite bundler)'
	path: 'vite'
	-
	name: 'Module'
	desc: 'Good for reusable components, libraries, and use in nonImba projects (Vite bundler)'
	path: 'module'
	-
	name: 'Desktop'
	desc: 'Desktop application using Tauri (Vite bundler)'
	path: 'tauri'
]

def copy src, dest
	return if path.basename(src) is '.git'
	if path.basename(dest) is '_gitignore'
		dest = path.join(path.dirname(dest), '.gitignore')
	if fs.statSync(src).isDirectory!
		fs.mkdirSync(dest,recursive:yes)
		for file of fs.readdirSync(src)
			copy path.resolve(src,file), path.resolve(dest,file)
	else
		fs.copyFileSync(src,dest)

def getValidProjectName name
	return unless typeof name is 'string'
	name = name.trim!.replaceAll(/\s+/g,'-')
	return name if name is '.'
	throw 'Project name already exists' if fs.existsSync(name)
	unless /^[\w.-]+$/.test name
		throw 'Invalid repository name, can only contain a-zA-Z0-9_.-'
	name

def getTemplateByName name
	return unless typeof name is 'string'
	templates.find do $1.name.toLowerCase! is name.toLowerCase!

def main

	const args = parseArgs process.argv.slice(2)

	let opts = { onCancel: do quit! }

	let projectName
	if args._[0]
		try
			projectName = getValidProjectName args._[0]
		catch e
			p red(e)

	unless projectName
		{ projectName } = await prompt {
			type: 'text'
			name: 'projectName'
			message: 'Enter a project name or . for current dir'
			initial: 'imba-project'
			format: getValidProjectName
			validate: do
				try
					yes if getValidProjectName $1
				catch e
					e
		}, opts

	if projectName is '.'
		try
			if execSync("git status --porcelain", { stdio: "pipe" }).toString!
				throw 1
		catch
			quit 'Creating a project in the current directory requires a clean git status'

	let template = getTemplateByName(args.t or args.template)

	unless template
		{ template } = await prompt {
			type: 'select'
			name: 'template'
			message: 'Choose a template'
			choices: templates.map do
				{ title:$1.name, description:$1.desc, value:$1 }
			initial: 0
		}, opts

	let src = path.join swd, 'templates', template.path
	let dest = path.join cwd, projectName

	if dest isnt cwd and fs.existsSync dest
		quit 'Project dir already exists'

	try
		copy src, dest
		let dirStr = "./{projectName is '.' ? '' : projectName}"
		p green("\nCreated project in {dirStr}")
	catch e
		quit "\nFailed to copy project:\n\n{e}"

	p bold("\nInstalling dependencies")

	try
		process.chdir dest
		execSync "npm pkg set name='{projectName}'"
		execSync 'npm i', {stdio: 'inherit'}
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