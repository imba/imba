# import './app/system.css'
import express from 'express'
import index from './app/index.html'

console.log "server.imba",__filename,__realname,require.main.filename,import.meta.url,imba.manifest
console.log process.env

const app = express!

# const sw = import.iife('./app/sw')

import img from './assets/thumb.png'
import HEAD from './app/base?iife'
const client = import.web('./app/client')

console.log "HEAD",HEAD
global css @root
	body bg:blue2

# catch-all route that returns our index.html
app.get(/.*/) do(req,res)
	# only render the html for requests that prefer an html response
	unless req.accepts(['image/*', 'html']) == 'html'
		return res.sendStatus(404)

	res.send index.body

imba.serve app.listen(process.env.PORT or 3000)