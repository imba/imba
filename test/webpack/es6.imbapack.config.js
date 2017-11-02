module.exports = {
	entry: "./index.imba",
	output: { filename: "./es6.imbapack.tmp.js" },
	loader: {imba: {es6: true}}
}