import express from 'express'
import index from 'html/index.html'

const app = express!

global css html
	$from-server: "from-server"

import entries from './entries'

# catch-all route that returns our index.html
app.get(/.*/) do(req,res)
	console.log 'get something!',index.body
	# only render the html for requests that prefer an html response
	unless req.accepts(['image/*', 'html']) == 'html'
		return res.sendStatus(404)

	res.send index.body

imba.serve app.listen process.env.PORT or 3003