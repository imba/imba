import {program} from 'commander'
import Program from '../bundler/program'
import np from 'path'
import nfs from 'fs'
import {resolveConfig,resolvePackage} from '../bundler/utils'

def addDefaults options
	let cwd = options.cwd ||= process.cwd!
	options.imbaPath ||= np.resolve(__dirname,'..')
	options.mtime = nfs.statSync(__filename).mtimeMs
	options.config = resolveConfig(cwd,options.config or 'imbaconfig.json')
	options.package = resolvePackage(cwd)
	return options

let prog = program.version('2.0.0')
	.name('imba')
	.option("-t, --ta", "Remove previously generated files")
	.option("-c, --config", "Remove previously generated files")
	.option("-m, --minify", "Minify generated files")

let serve = program.command('start [script]')
	.description('clone a repository into a newly created directory',{
		script: "something here"
	})
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.action do(env,options)
		addDefaults(options)
		console.log 'running start',options.config
		# .watch

let build = program.command('build [script]')
	.description('clone a repository into a newly created directory')
	.option("-c, --clean", "Remove previously generated files")
	.option("-f, --force", "Disregard previosly cached compilations")
	.action do(env,options)
		console.log 'running build',options

prog.parse(process.argv)
