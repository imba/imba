module.exports = {
	entry: "./index.imba",
	output: { path: __dirname, filename: "es6.imbapack.tmp.js" },
	loader: {imba: {es6: true}}
}