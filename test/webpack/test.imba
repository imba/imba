# imba$es6=1

var cp = require 'child_process'
var fs = require 'fs'
var path = require 'path'
var assert = require 'assert'

def test conf, bin = 'webpack'
	let prefix = path.resolve(__dirname,"{conf}.{bin}")
	let cmd = "{bin} --config {prefix}.config.js"
	let out = "{prefix}.tmp.js"

	Promise.new do |resolve,reject|
		console.log "calling", cmd
		cp.exec(cmd, cwd: __dirname) do |e,stdout,stderr|
			if stdout:length == 0
				process:stdout.write("Error from {cmd}")
				process:stdout.write(stderr)		
				reject(stderr)
				return process.exit(0)

			let body = fs.readFileSync(out,"utf8")
			resolve(body)


def run
	try
		var body = await test('es6','imbapack')
		assert body.indexOf("await asyncTrim") >= 0, "not compiled with es6"

		# webpack
		var body = await test('es6','webpack')
		assert body.indexOf("await asyncTrim") >= 0, "not compiled with es6"

	catch e
		console.log "error from webpack",e
run