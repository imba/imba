# <img width="50" style="margin-bottom:-6.5px" src="https://raw.githubusercontent.com/imba/branding-imba/master/yellow-wing-logo/imba.svg"> Imba

[![Join the chat at https://discord.gg/mkcbkRw](https://img.shields.io/badge/discord-chat-7289da.svg?style=flat-square)](https://discord.gg/mkcbkRw)
[![install size](https://packagephobia.now.sh/badge?p=imba)](https://packagephobia.now.sh/result?p=imba)
[![Downloads](https://img.shields.io/npm/dm/imba.svg)](https://npmcharts.com/compare/imba?minimal=true) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![License](https://img.shields.io/npm/l/imba.svg)](https://www.npmjs.com/package/imba)

Imba is a friendly full-stack programming language for the web that compiles to performant JavaScript.
It has language-level support for defining, extending, subclassing, instantiating and rendering DOM nodes.

---

## Get started

```sh
npx imba create
```

## Documentation

To get started with Imba, we recommend reading through the [official guide](https://imba.io/).

## Why Imba?

### Minimal syntax

Imba's syntax is minimal, beautiful, and packed with clever features. It combines logic, markup and styling in a powerful way. Fewer keystrokes and less switching files mean you'll be able to build things fast.

```imba
import './util/reset.css'

global css html,body m:0 p:0 w:100% h:100%

tag login-form < form

	css input rd:md bc:gray3 h:20px fs:md
	css button rd:md c:white bg:gray4 @hover:blue4

	<self @submit.prevent=api.login(name,secret)>
		<input.username type='text' bind=name>
		<input.password type='password' bind=secret>
		<button> "Login as {name}"

imba.mount <login-form[pos:abs d:grid ja:center]>
```

### Runs on both server and client

Imba powers both the frontend and the backend of Scrimba.com, our learning platform with 100K+ monthly active users. On the frontend, Imba replaces e.g., Vue or React, and on the backend, it works with the Node ecosystem (e.g., npm).

```imba
import express from 'express'
import services from './services.ts'
import html from './index.html'
import image from './confused-cat.png'

const app = express!

app.get '/404' do (req,res)
	res.send String <html> <body>
		<img src=image>
		<h1> "We could not find this page!"

app.get '/' do (req,res)
	res.send html.body
```

### Integrated styling

Inspired by Tailwind, Imba brings styles directly into your code. Styles can be scoped to files, components, and even parts of your tag trees. Style modifiers like @hover, @lg, @landscape and @dark can be used for extremely concise yet powerful styling.

```imba
# global styles
global css button
	position: relative
	display: block
	background: #b2f5ea
	@hover background: #b2f9ea

# tailwind-inspired shorthands
global css button
	pos:relative d:block bg:blue5 bg@hover:blue6

tag App
	# scoped styles
	css item bg:blue4 m:2

	<self[d:grid pos:relative]> # inline styles
		<ul> for {type,title} in items
			<li.item is-{type}> title
```

### Blazing fast, Zero config

Imba comes with a built-in bundler based on the blazing fast esbuild. Import stylesheets, images, typescript, html, workers and more without any configuration. Bundling is so fast that there is no difference between production and development mode - it all happens on-demand.

```imba
# importing a worker
const worker = import.worker './analyzer'
const analyzer = new Worker(worker.url)
# import an image
const logo = import './images/logo.png'
console.log "logo size: {logo.width}x{logo.height} - at {logo.url}"
```

When you run your app with the `imba` command, it automatically bundles and compiles your imba code, along with typescript, css and many other file types. It provides automatic reloading of both the server and client.

### Typing and tooling

The tooling is implemented as a typescript server plugin giving us great intellisense, diagnostics, and even cross-file refactorings that works with js/ts files in the same project. You can import types just like in typescript, and annotate variables, parameters and expressions. Like the language, the tooling is still in alpha, but improving every day.

```imba
import type { CookieOptions } from 'express-serve-static-core'

def flash res\Response, body\string, settings = {}
	let options\CookieOptions = {
		...settings
		maxAge: 86400
		secure: true
		httpOnly: false
	}

	res.cookie('flash',body,options)
```

## Community

For questions and support, please use our community chat on
[Discord](https://discord.gg/mkcbkRw).

## License

[MIT](./LICENSE)

Copyright (c) 2015-present, Sindre Aarsaether
