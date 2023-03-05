import {execSync, spawn, exec} from 'child_process'
import np from 'path'
import fs from 'fs'
import tk from 'tree-kill'
import newPage from './browser'

const builds = new Set

const cwd = np.resolve(process.cwd!,'examples')
let bin = "../../../bin/imba"

console.log 'cwd is',cwd

export class Build

	static def for cmd
		new self(cmd)

	def constructor command
		self.command = command.replace(/^imba /,bin + ' ')
		child = null
		stdout = ""
		stderr = ""
		origin = "http://localhost:3009"
		closed = new Promise do(resolve)
			resolveClosed = do
				builds.delete(self)
				resolve(self)

		builds.add(self)
		self

	def run
		new Promise do(resolve)
			spawned = exec(command,{cwd: cwd}) do(error,stdout,stderr)
				# console.log([error,stdout,stderr])
				if error
					throw error

				self.stderr += stderr if stderr
				self.stdout += stdout if stdout
				
				resolve(self)
				resolveClosed(self)

	@lazy get manifest
		try JSON.parse(fs.readFileSync(np.resolve(cwd,'dist','manifest.json'),'utf-8'))

	def read src
		return fs.readFileSync(abs(src),'utf-8')

	def abs src
		manifest..[src]..path or np.resolve(cwd,src)

	def check src, pattern
		let body = read(src)
		unless pattern.test(body)
			let err = new Error
			err.body = body
			err.message = "test failed in {command}\n{abs(src)} did not match {pattern}\n{body}"
			throw err
		return yes

	def spawn
		new Promise do(resolve)
			let [bin,...params] = command.split(' ')

			let resolved = no
			let env = Object.assign({},process.env,{
				IMBA_LOGLEVEL: 'info'
				PORT: 3009
			})
			child = spawn(bin, params, {env: env, cwd: cwd})

			# collect data written to STDOUT into a string
			child.stdout.on('data') do(data)
				let str = data.toString('utf8')
				process.stdout.write(str)
				# console.log str
				if str.indexOf("listening on ") >= 0 and resolved =? yes
					resolve(self)

			# collect data written to STDERR into a string
			child.stderr.on('data') do(data)
				console.log 'got error',data.toString('utf8')

			child.on('close') do
				resolveClosed(self)
			
			console.log child.pid
	
	def stop signal = 0
		if stopped =? yes
			if child
				new Promise do(resolve)
					tk(child.pid,'SIGKILL') do(err)
						# console.log 'did kill?',err,command
						resolve(self)

			elif spawned
				spawned.kill()

	def cleanup
		await stop! unless stopped
		execSync("rm -rf dist",cwd: cwd)

	@lazy get browser
		# cannot be
		new Promise do(resolve)
			let page = await newPage!
			await page.goto(origin, waitUntil: 'domcontentloaded', timeout: 5000)
			page.body = await page.content!
			return resolve(page)

	

	@lazy get cssvars
		new Promise do(resolve)
			let page = await browser
			let res = await page.evaluate do
				let out = {}
				let res = globalThis.window.getComputedStyle(globalThis.document.documentElement)
				# let arr = Array.from(res).filter do $1.indexOf('--') == 0
				let arr = 'about ssr shared home iife head foot index static'.split(' ')
				# return arr
				while let part = arr.pop!
					# if part.indexOf('--') == 0
					let val = res.getPropertyValue('--' + part)
					if val.trim!.match(/^\d+$/)
						val = Number(val)
					out[part] = val
				return out
			resolve(res)
	
	@lazy get richPage
		new Promise do(resolve)
			let page = await browser
			page.body = await page.content!
			page.css = await cssvars

			return resolve(page)

	def goto url, history = no
		new Promise do(resolve)
			let page = await browser

			if history
				await page.evaluate(&,url) do(url)
					global.document.router.go(url)
					global.imba.commit!
			else
				await page.goto(origin + url, waitUntil: 'domcontentloaded', timeout: 5000)
			page.body = await page.content!
			return resolve(page)
	

	def cssval name = '--about'
		let page = await browser
		await page.evaluate(&,name) do(name)
			let out = {}
			let res = globalThis.window.getComputedStyle(globalThis.document.documentElement).getPropertyValue(name)
			return parseInt(res)

export default def command cmd
	new Build(cmd)


export def cleanup
	try
		for build of builds
			console.log 'stopping child',build.command,build.child.pid
			await build.stop!
	execSync("rm -rf dist", cwd: cwd)
		

export def serve cmd, cb
	console.log "serve",cmd
	let build = new Build(cmd)
	await build.spawn!
	let page = await build.richPage
	await cb(build,page,build)
	# build.stop!
	await build.cleanup!
	await build.closed
	return build

export def build cmd, cb
	let build = new Build(cmd)
	await build.spawn!
	let page = await build.richPage
	await cb(build,page,build)
	await build.cleanup!
	await build.closed
	return build
	