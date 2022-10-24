import express from 'express'
import index from './app/index.html'

# A simple state that exists until the server stops
const state = {
	count: 0,
}

# Using Imba with Express as the server is quick to set up:
const app = express()
const port = process.env.PORT or 3000

# Express works like usual, so we can allow JSON in the POST request:
const jsonBody = express.json({ limit: '1kb' })

app.post('/increment', jsonBody) do(req,res)
	# A good exercise here is to add validation for the request body.
	# For example, what would happen if you send a string instead of a number?
	state.count += req.body.increment

	# Sending the state back to the client lets us update it right away:
	res.send({
		count: state.count
	})

app.get('/count') do(req,res)
	res.send({
		count: state.count
	})

# catch-all route that returns our index.html
app.get(/.*/) do(req,res)
	# only render the html for requests that prefer an html response
	unless req.accepts(['image/*', 'html']) == 'html'
		return res.sendStatus(404)

	res.send(index.body)

# Express is set up and ready to go!
imba.serve(app.listen(port))
