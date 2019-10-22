module.exports = {
	entry: "./index.imba",
	output: {  path: __dirname, filename: "bundle.js" },
	resolve: {
		extensions: [".imba",".js", ".json",".css"]
	},
	module: {
		rules: [
			{
				test: /\.imba$/,
				loader: 'imba/loader'
			},
			{
              test: /\.css$/,
              use: ['style-loader','css-loader','imba/loader']
            },
			{
              test: /\.less$/,
              use: ['style-loader','css-loader','imba/loader','less-loader']
            }

		]
	}
}