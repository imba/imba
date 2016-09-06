module.exports = [{
	debug: true,
	entry: "./app/index.imba",
	output: { filename: "./js/app.web.dev.js" }
},{
	entry: "./app/index.imba",
	output: { filename: "./js/app.web.prod.js" },
	loader: { env: {production: true} }
},{
	debug: true,
	target: 'node',
	entry: "./app/index.imba",
	loader: { env: {production: true} },
	output: { filename: "./js/app.node.dev.js" }
},{
	target: 'node',
	entry: "./app/index.imba",
	loader: { env: {production: true} },
	output: { filename: "./js/app.node.prod.js" }
}]