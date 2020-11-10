# imba$runtime=global

import '../../src/imba/index'

const chokidar = require 'chokidar'
const path = require 'path'
const fs = require 'fs'

# const express = require 'express'

# const root = path.resolve(__dirname,'..','test','hello')
const root = path.resolve(__dirname,'samples')
const dest = path.resolve(__dirname,'files.js')

const includes = {}

const watcher = chokidar.watch(root)

let ready? = no

def bundle src
	# sort(child) for child in data.children
	let json = JSON.stringify(Object.values(includes),null,2)
	let js = "export const files = {json}"
	fs.writeFileSync(dest,js)

watcher.on 'all' do(event,abs)
	let dir? = event.indexOf('Dir') >= 0
	let rel = path.relative(root,abs)
	let name = path.basename(rel)
	let dirname = path.dirname(rel)

	return unless name.indexOf('.imba') >= 0

	console.log 'watcher',$1,abs

	if event == 'add' or event == 'change'
		let body = fs.readFileSync(abs,'utf8')
		includes[rel] = {
			path: rel
			content: body
		}

	bundle! if ready?

watcher.on 'ready' do
	ready? = yes
	bundle!
	if process.env.RUN_ONCE
		process.exit(0)

# const srv = express!
# 
# srv.get(/.*/) do(req,res)
# 	let html = <html>
# 		<head> <title> "Application"
# 		<body> <App>
# 
# 	res.end(String(html))
# 
# srv.listen(8006) do
# 	console.log "Server started - listening on port {8006}"