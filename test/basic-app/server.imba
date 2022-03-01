import express from 'express'
import index from './index.html'

const app = express!

# catch-all route that returns our index.html
app.get(/.*/) do(req,res)
	# only render the html for requests that prefer an html response
	unless req.accepts(['image/*', 'html']) == 'html'
		return res.sendStatus(404)

	res.send index.body

imba.serve app.listen process.env.PORT or 3003