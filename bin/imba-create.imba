import {prompt} from 'enquirer'
import {execSync} from 'child_process'
let name = process.argv[2] or ''

def fetch-templates
	const url = "https://github.com/imba/imba-templates"
	

const templates = [
	['static-website', 'Regular website with server-side rendering & express.js']
	['singe-page-app', 'Application with client-side scripts']
	['electron-app', 'Desktop application']
	['tic-tac-toe', 'Barebones game example']
	['imba-gh-pages', 'App deployed to GitHub pages']
]

const schema = {
	projectType:
		type: 'select'
		name: 'template'
		message: "Template"
		choices: templates.map do([name,hint]) {name: name, hint: hint}
	name:
		type: 'input'
		name: 'name'
		message: "Project name"
		initial: name
}

def run
	let version = execSync('npm view imba version').toString!.trim!
	# console.log 'imba version',version
	# const resp = await prompt(type: 'input', name: 'username', message: "What is your username?")
	const type = await prompt([schema.projectType,schema.name])
	# console.log 'type',type

run!

