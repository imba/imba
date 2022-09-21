import {execSync, spawn, exec} from 'child_process'
import np from 'path'
import fs from 'fs'
# tiny library for testing the bundler
import assert from 'assert'
import Build,{serve, cleanup} from './build'
import configs from './checks'


def run
	try
		let errors = []
		for own cmd,checks of configs
			let build = await Build(cmd).run!

			for own rel,test of checks
				for check of [].concat(test)
					if check isa RegExp
						try
							build.check(rel,check)
						catch e
							errors.push(e)
			if errors.length
				for err in errors
					console.log err.message,err

				process.exit(1)
			
			build.cleanup!

		# testing 
		# await serve("imba -o dist app/server/plain-text.imba") do(page,body)
		#	assert(body.indexOf("Hello there") > 0)

		# Testing the about page in several different ways
		await serve("imba -o dist app/about.ssr.imba") do(srv,page,build)
			assert(page.body.indexOf("Hello from about page!") > 0)
			assert(page.css.about == 1)
			assert(page.css.shared == 1)
			assert(page.css.ssr == 1)

		# Serving straight from an html page
		await serve("imba -o dist app/about.html") do(srv,page,build)
			assert(page.body.indexOf("Hello from about page!") > 0)
			assert(page.css.about == 1)

		await serve("imba --web -o dist app/about.html") do(srv,page,build)
			assert(page.body.indexOf("Hello from about page!") > 0)
			assert(page.css.about == 1)
			assert(page.css.static == 1)

		# Running with the --web option will create a webserver to serve
		# an html file importing the input .imba file
		await serve("imba --web -o dist app/about.imba") do(srv,page,build)
			assert(page.body.indexOf("Hello from about page!") > 0)
			assert(page.css.about == 1)

		await serve("imba -o dist app/routed.ssr.imba") do(srv,page,build)
			page = await srv.goto("/home")
			assert(page.body.indexOf("Page: Home") > 0)

			page = await srv.goto("/about")
			assert(page.body.indexOf("Page: About") > 0)

		await serve("imba --web -o dist app/routed.imba") do(srv,page,build)
			page = await srv.goto("/home")
			assert(page.body.indexOf("Page: Home") > 0)

			page = await srv.goto("/about")
			assert(page.body.indexOf("Page: About") > 0)

			page = await srv.goto("/home",true)
			assert(page.body.indexOf("Page: Home") > 0)
			assert(page.body.indexOf("Page: About") == -1)

		console.log "all tests passed"
	catch e
		console.log 'errored',e
		await cleanup!
		console.log 'assert error?',e
		process.exit(1)

	await cleanup!
	process.exit(0)

run!
