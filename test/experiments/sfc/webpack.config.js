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
              use: ['style-loader','css-loader']
            },
			{
              test: /\.less$/,
              use: ['style-loader','css-loader','less-loader']
            }
            ,
			{
              test: /\.sass$/,
              use: ['style-loader','css-loader','sass-loader']
            }

		]
	}
}