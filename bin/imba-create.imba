import {prompt,Confirm,Input,Select,Snippet} from 'enquirer'
import {execSync} from 'child_process'
import np from 'path'
import nfs from 'fs'
import log from '../src/utils/logger'
import fetch from 'node-fetch'

# import degit from 'degit'

def read-package path
	if path.match(/^https?\:/)
		let res = await fetch(path)
		return res.json!

	let body = nfs.readFileSync(np.resolve(path,'package.json'),'utf-8')
	JSON.parse(body)

def write-package dir, data
	let out = JSON.stringify(data,null,2)
	nfs.writeFileSync(np.resolve(dir,'package.json'),out)

let imbadir = np.resolve(__dirname,'..')
let imbapkg = read-package(imbadir) # JSON.parse(nfs.readFileSync(np.resolve(imbadir,'package.json'),'utf-8'))

const templates = [
	['base-template', 'Application with client-side scripts']
].map do([name,hint]) {name: name, hint: hint}

const cli = new class
	prop cwd = process.cwd!

	set status value
		log.info value

	def ok msg, o = {}
		const prompt = new Confirm(Object.assign({
			name: 'question',
			message: msg
		},o))
		return prompt.run!

	def select msg, choices, o = {}
		const prompt = new Select(Object.assign({
			type: 'select',
			message: msg,
			choices: choices 
		},o))
		return prompt.run!
	
	def input msg, o = {}
		const prompt = new Input(Object.assign({message: msg},o))
		return prompt.run!

	def exec cmd,o = {}
		let res = execSync(cmd,Object.assign({cwd: cwd},o))
		return res.toString!.trim!

	def package defaults = {}
		const prompt = new Snippet({
			name: 'username',
			message: 'Fill out the fields in package.json',
			required: false,
			fields: [
				{name: 'name',message: 'project', initial: defaults.name}
				{name: 'version',initial: '1.0.0'}
				{name: 'author_name',message: 'Author Name', initial: "Author Name"}
			],
			template: '''{
				"name": "${name}",
				"repository": "${username}/${name}",
				"description": "${description}",
				"version": "${version}",
				"homepage": "https://github.com/${username}/${name}",
				"author": "${author_name} (https://github.com/${username})",
				"license": "${license:ISC}"
			}'''
		})
		prompt.run!

def run
	try
		let tplname = await cli.select("Choose your template",templates)
		let tplurl = "https://github.com/imba/imba-{tplname}"
		let tplpkg = await read-package("https://raw.githubusercontent.com/imba/imba-{tplname}/master/package.json")

		let cfg = await cli.package(
			name: process.argv[2] or '',
			description: tplpkg.description
		)

		let data = JSON.parse(cfg.result)
		
		if data.repository[0] == '/'
			delete data.repository
	
		# if cfg.username
		#	cfg.repository = "{cfg.username}/{cfg.name}"
		let ghcli = try cli.exec('which gh')

		let dir = np.resolve(data.name)

		if await cli.ok("Create project in directory: {dir}?", initial: yes)
			log.info "Generating files from template"
			await cli.exec("git clone --depth 1 {tplurl} {dir}")

			cli.cwd = dir
			await cli.exec("rm -rf {np.resolve(dir,'.git')}")
			await cli.exec("git init .")
			let pkg = Object.assign({},tplpkg,data)
			write-package(dir,pkg)

			if data.repository
				log.info "add origin https://github.com/{data.repository}.git"
				await cli.exec("git remote add origin https://github.com/{data.repository}.git")

			unless ghcli
				log.info "Install the github CLI tools (https://github.com/cli/cli) to automatically create repository"

			log.info "Installing dependencies"
			# await cli.exec("npm install imba")
			await cli.exec("npm install")

			log.success "Finished setting up project"
	catch e
		log.error "Something went wrong during creation\n  Please report at https://github.com/imba/imba/issues"

run!