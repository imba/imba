const L = console.log
const cwd = process.cwd!
const swd = __dirname

require 'colors'
const fs = require 'fs'
const path = require 'path'
const prompt = require 'prompts'
const spawn = require 'cross-spawn'

def quit msg='Quit'
	console.error msg.red
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
	'cli':
		path: 'cli'
		name: 'CLI Tool'
		desc: 'A CLI tool ready for npm publishing'

const noCopy = [
	'.git'
	'dist'
	'node_modules'
	'package-lock.json'
]

def copy src, dest
	return if noCopy.includes path.basename(src)
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
		throw 'Project name can only contain a-z A-Z 0-9 _ . -'
	if name is '..'
		throw "Project name cannot be '..'"
	if fs.existsSync(name)
		throw "Project name '{name}' already exists in current directory"
	name

def assertCleanGit
	try
		throw 1 if spawn.sync('git',['status','--porcelain']).output.join('')
	catch
		quit 'Creating a project in the current directory requires a clean git status'

def main name, opts

	try
		throw 1 unless parseInt(process.version.slice(1).split('.',1)[0]) >= 16
	catch
		L "Detected Node {process.version}, v16 or higher is recommended.".yellow

	const promptOpts = onCancel: do quit!

	let projectName =
		try toValidRepoName name
		catch e L(e.red)

	projectName ??= (await prompt {
		type: 'text'
		message: 'Enter a project name or . for current dir'
		initial: name or 'imba-project'
		format: toValidRepoName
		validate: do
			try yes if toValidRepoName($1)
			catch e e
		name: 'value'
	}, promptOpts).value

	assertCleanGit! if projectName is '.'

	let template = templates[opts.template]
	L('Template not found'.red) if opts.template and not template

	template ??= (await prompt {
		type: 'select'
		message: 'Choose a template or find more at ' + 'https://imba.io/templates'.blue
		choices: for own key, t of templates
			{ title:t.name, description:t.desc, value:t }
		initial: 0
		name: 'value'
	}, promptOpts).value

	const src = path.join swd, '..', 'templates', template.path
	const dest = path.join cwd, projectName

	const packageName = projectName is '.' ? path.basename(cwd) : projectName
	const dirStr = "./{projectName is '.' ? '' : projectName}"

	unless opts.yes
		quit! unless (await prompt {
			type: 'confirm'
			message: "Create {template.name.cyan} project named {packageName.cyan} in {dirStr.cyan}?"
			initial: yes
			name: 'value'
		}, promptOpts).value

	if dest is cwd
		assertCleanGit!
	elif fs.existsSync dest
		quit 'Project dir already exists'

	try
		copy src, dest
		L "\nCreated <{template.name}> project named '{packageName}' in {dirStr}".green
	catch e
		quit "\nFailed to copy project:\n\n{e}"

	L '\nInstalling dependencies'.bold

	try
		process.chdir(dest) unless projectName is '.'
		spawn.sync 'npm', ['pkg', 'set', "name={packageName}"]
		spawn.sync 'npm', ['up', '-S'], stdio:'inherit'
	catch e
		L "\nFailed to install dependencies:\n\n{e}".red

	L """

		Install the vscode extension for an optimal experience:
		  {'https://marketplace.visualstudio.com/items?itemName=scrimba.vsimba'.blue}

		Join the Imba community on discord for help and friendly discussions:
		  {'https://discord.gg/mkcbkRw'.blue}

		Get started:

		  {'➜'.cyan} cd {projectName}
		  {'➜'.cyan} npm run dev

	"""

module.exports = main
