module.exports = {
	entry: "./index.imba",
	output: {  path: __dirname, filename: "es6.webpack.tmp.js" },
	resolve: {
		extensions: [".imba",".js", ".json"]
	},
	module: {
		rules: [
			{
				test: /\.imba$/,
				loader: 'imba/loader',
				options: {es6: true}
			}
		]
	}
}