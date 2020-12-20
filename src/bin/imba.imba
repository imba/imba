import {program} from 'commander'
import Program from '../bundler/program'
import Server from '../bundler/serve'
import np from 'path'
import nfs from 'fs'
import {resolveConfig,resolvePackage} from '../bundler/utils'

const fmt = {
	int: do(val) parseInt(val)
	i: do(val) val == 'max' ? 0 : parseInt(val)
}

def addDefaults options
	let cwd = options.cwd ||= process.cwd!
	options.imbaPath ||= np.resolve(__dirname,'..','..')
	options.mtime = nfs.statSync(__filename).mtimeMs
	options.config = resolveConfig(cwd,options.config or 'imbaconfig.json')
	options.package = resolvePackage(cwd)
	return options


def serve main, o
	console.log 'got here!!'
	o = addDefaults(o)
	o.main = main if main

	let prog = new Program(o.config,o)
	await prog.setup!

	# if we are watching - also compile and continue building
	if o.watch
		await prog.build!

	let server = new Server(prog)

	let scripts = []
	if main
		scripts.push({
			exec: main
			instances: o.instances
		})
	elif o.config.serve
		scripts.push(Object.assign({},o.config.serve,{
			instances: o.instances
		}))
	
	server.start(scripts)

def build o
	o = addDefaults(o)
	let prog = new Program(o.config,o)
	await prog.build!


let binary = program.version('2.0.0')
	.name('imba')
	.option("-c, --config", "Remove previously generated files")
	.option("-m, --minify", "Minify generated files")

program.command('start [script]')
	.description('clone a repository into a newly created directory',{
		script: "something here"
	})
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-c, --clean", "Remove previously generated files")
	.option("-f, --force", "Disregard previosly cached compilations")
	.option("-i, --instances <count>", "Number of instances to start",fmt.i,1)
	.action(serve)

program.command('build')
	.description('clone a repository into a newly created directory')
	.option("-c, --clean", "Remove previously generated files")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-f, --force", "Disregard previosly cached compilations")
	.option("-m, --minify", "Minify generated files")
	.action(build)

binary.parse(process.argv)
