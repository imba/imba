import express from 'express'
import passport from 'passport'
import index from './index.html'
import image from './confused-cat.png'

const app = express()

app.get '/404' do(req,res)
	res.send String <html> <body>
		<h1> "We could not find this page!"
		<img src=image>
		<a href='/'> "Go home!"

app.get '/:page' do(req,res)
	res.send index.body

app.get '/' do(req,res)
	res.redirect('/top')

imba.serve app.listen(8001)
# ~import express|18,5.7,0.1,65,16,-1,50,31.8,3.8/18,7.2,0.3,14,17,20,36,29.8,1.8~ import any javascript library
# ~body|16,7.2,-1.1,24,12,12,50,1.5,0/16,-0.6,-1.3,24,12,46,82,1.5,0~ server-side rendering
# ~./confused-cat.png|16,5.3,0.9,22,35,9,49,4.1,2.5/16,4.8,1.1,22,18,2,35,16,2.8~ images are resolved and bundled
# ~imba.serve|18,7,0.5,26,41,6,54,6,2.3/18,7.5,-0.8,9,38,2,51,6.3,0~ serve with live reloading, asset bundling++