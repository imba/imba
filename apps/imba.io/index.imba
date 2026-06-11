import express from 'express'
import np from 'path'
import nfs from 'fs'
import esbuild from 'esbuild?external'

const app = express!

const imbac = require 'imba/compiler'

import {rewriteImports} from './src/compiler'

import examples from './data/examples.json'

const ResolveMap = {
	'imba': 'https://unpkg.com/imba@2.0.0-alpha.243/dist/imba.mjs'
	'imba/runtime': 'https://unpkg.com/imba@2.0.0-alpha.243/src/imba/runtime.mjs'
	'imdb': '/imdb.js'
}

const importMap = {
	imports: ResolveMap
}

if process.env.LOG_REQUESTS
	app.use do(req,res,next)
		console.log "REQ {req.method} {req.url} dest={req.headers['sec-fetch-dest'] or '-'} ref={req.headers.referer or '-'}"
		next!

app.get(/__sw(_\d+)?__\.js/) do(req,res)
	const asset = import('./src/sw/worker.imba?worker')
	res.sendFile asset.path

# monaco is served straight from the npm package instead of being vendored
const monacoRoot = np.dirname(require.resolve('monaco-editor/package.json'))
app.use('/monaco',express.static(monacoRoot,maxAge:'7d'))

# the imba runtime for live examples - must match the compiler version.
# resolve at runtime through node - aliased so the bundler leaves it alone
const nodeRequire = require
const imbaRoot = np.resolve(nodeRequire.resolve('imba/compiler'),'..','..')
const runtimeAssets = {
	'/vendor/imba.mjs': nfs.readFileSync(np.join(imbaRoot,'dist/imba.mjs'),'utf8')
	'/vendor/imba-runtime.mjs': nfs.readFileSync(np.join(imbaRoot,'src/imba/runtime.mjs'),'utf8')
}

app.get(['/vendor/imba.mjs','/vendor/imba-runtime.mjs']) do(req,res)
	res.type('application/javascript').send(runtimeAssets[req.path])

app.use(express.static('dist/public',maxAge:'1m'))
# static files that are not part of the bundle (preflight.css, imdb.js, images)
app.use(express.static('public',maxAge:'1h'))

app.get(/__blank__\.html/) do(req,res)
	res.send String <div>

app.get(/^\/repl-\d+\//) do(req,res)
	return res.sendStatus(404)

const indexTemplate = "
<!DOCTYPE html>
<html>
	<head>
		<meta charset='UTF-8'>
		<title>Playground</title>
		<script>try \{ window.frameElement.replify(this) \} catch(e)\{\}</script>
		<link href='/preflight.css' rel='stylesheet'>
		<script type='importmap'>{JSON.stringify(importMap)}</script>
	</head>
	<body>
		<script type='module' src='/examples/helpers.imba'></script>
		<script type='module'>
			import * as example from './index.imba';
			try \{ window.expose(example || \{\});\} catch(e)\{\}
		</script>
	</body>
</html>"



def compileImba file
	try
		# console.log 'compile imba!!',file.path
		let body = file.body
		body = body.replace(/[ ]{4}/g,'\t')
		# rewrite certain special things
		body = body.replace(/# @(show|log)( .*)?\n(\t*)/g) do(m,typ,text,tabs)
			m + "${typ} '{(text or '').trim!}', "
		# body = body.replace(/from 'imdb'/g,'from "/imdb.js"')
		body = body.replace(/(import [^\n]*')(\w[^']*)(?=')/g) do(m,start,path)
			# console.log 'rewrite',path,'to',"/repl/examples/{path}"
			start + "/examples/{path}"

		let result = imbac.compile(body,{
			platform: 'web',
			sourcePath: file.path,
			format: 'esm'
		})

		# now use esbuild
		let js = result.js

		let transformed = esbuild.transformSync(js,{
			platform: 'browser', target: ['safari15']
		})

		js = transformed.code
		file.js = rewriteImports(js)
	catch e
		console.log 'error compiling',e,file.path
		return
	return file.js

app.get('/examples/*') do(req,res)
	let path = req.url
	let file = examples[path]
	let nohtml = path.replace(/\.html$/,'')
	let ext = np.extname(path)

	if !file and examples[nohtml]
		res.type('html')
		return res.send indexTemplate.replace("index.imba",np.basename(nohtml))

	if !file and examples[path + '.imba']
		file = examples[path = (path + (ext = '.imba'))]

	if file
		let body = file.body
		
		if ext == '.imba'
			# console.log 'compile imba file',path
			unless file.js
				file.path ||= path
				compileImba(file)
			
			body = file.js
			res.type('js')

		return res.send(body)
	
	return res.sendStatus(404)



# app.get('/__sw__.html') do(req,res)
# 	let js = assets['__sw__bridge.js']
# 	let html = <div>
# 		<script type='text/javascript' innerHTML=js.body>
# 	res.send html.toString!
# catch-all should always render the index
app.get(/\.*/) do(req,res)
	# console.log 'handling',req.url,req.accepts(['image/*', 'html'])
	# only render the html for requests that prefer an html response
	unless req.accepts(['image/*', 'html']) == 'html'
		return res.sendStatus(404)

	# never serve the app shell to iframes/embeds - a stray iframe url would
	# otherwise mount the entire site recursively inside itself
	let dest = req.headers['sec-fetch-dest']
	if dest and dest != 'document'
		return res.sendStatus(404)

	res.send String <html>
		<head>
			<meta charset="UTF-8">
			<title> "Imba - The friendly full-stack language!"
			<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
			<meta name="description" content="Imba is a programming language for building web applications with insane performance. You can use it both for the server and client.">
			# this is the documentation / content generated by npm run build-content
			# loaders for asynchronously loading the monaco code editor
			<script src="/monaco/min/vs/loader.js">
			<script innerHTML='''
				require.config({ paths: { vs: "/monaco/min/vs" } });
				window.loadMonaco = function (cb) { require(["vs/editor/editor.main"], cb) };
			'''>
			# <!-- Favicon -->
			<link rel="apple-touch-icon" sizes="57x57" href="/images/apple-icon-57x57.png">
			<link rel="apple-touch-icon" sizes="60x60" href="/images/apple-icon-60x60.png">
			<link rel="apple-touch-icon" sizes="72x72" href="/images/apple-icon-72x72.png">
			<link rel="apple-touch-icon" sizes="76x76" href="/images/apple-icon-76x76.png">
			<link rel="apple-touch-icon" sizes="114x114" href="/images/apple-icon-114x114.png">
			<link rel="apple-touch-icon" sizes="144x144" href="/images/apple-icon-144x144.png">
			<link rel="apple-touch-icon" sizes="152x152" href="/images/apple-icon-152x152.png">
			<link rel="icon" type="image/png" sizes="144x144" href="/images/android-icon-144x144.png">
			<link rel="icon" type="image/png" sizes="192x192" href="/images/android-icon-192x192.png">
			<link rel="icon" type="image/png" sizes="152x152" href="/images/android-icon-152x152.png">
			<link rel="icon" type="image/png" sizes="36x36" href="/images/android-icon-36x36.png">
			<link rel="icon" type="image/png" sizes="48x48" href="/images/android-icon-48x48.png">
			<link rel="icon" type="image/png" sizes="72x72" href="/images/android-icon-72x72.png">
			<link rel="icon" type="image/png" sizes="96x96" href="/images/android-icon-96x96.png">
			<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
			<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
			<link rel="icon" type="image/png" sizes="64x64" href="/images/favicon-64x64.png">
			<link rel="icon" type="image/png" sizes="96x96" href="/images/favicon-96x96.png">

			# <!-- <link rel="manifest" href="/manifest.json"> -->
			<meta name="msapplication-TileColor" content="#ffffff">
			<meta name="msapplication-TileImage" content="/images/ms-icon-144x144.png">
			<meta name="theme-color" content="#ffffff">


			# <!-- Google / Search Engine Tags -->
			<meta itemprop="name" content="Imba - The friendly full-stack language">
			<meta itemprop="description" content="Imba is a programming language for building web applications with insane performance. You can use it both for the server and client.">
			<meta itemprop="image" content="/images/social-card-preview.jpg">

			# <!-- Facebook Meta Tags -->
			<meta property="og:url" content="https://imba.io">
			<meta property="og:type" content="website">
			<meta property="og:title" content="Imba - The friendly full-stack language">
			<meta property="og:description" content="Imba is a programming language for building web applications with insane performance. You can use it both for the server and client.">
			<meta property="og:image" content="/images/social-card-preview.jpg">

			# <!-- Twitter Meta Tags -->
			<meta name="twitter:card" content="summary_large_image">
			<meta name="twitter:title" content="Imba - The friendly full-stack language">
			<meta name="twitter:description" content="Imba is a programming language for building web applications with insane performance. You can use it both for the server and client.">
			<meta name="twitter:image" content="/images/social-card-preview.jpg">

			# <!-- Work Sans font -->
			<link rel="preconnect" href="https://fonts.gstatic.com">
			<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@900&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
			# <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap" rel="stylesheet">
			<style src='*'>
		<body tabIndex='-1'>
		# <script src="./public/content.json.js?as=iife">
		<script src="./data/reference.js?iife">
		<script type="module" src="./src/index.imba">

# pass through imba serve to automatically
# serve assets in an optimised manner

imba.serve app.listen(process.env.PORT or 3187)
