const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	//specify which file to place at the top of the render DOM tree
	entry: "./src/index.js",

	//specify to create bundle.js file at path /dist/bundle.js
	output: {
		path: path.join(__dirname, "build"),
		filename: "bundle.js",
	},

	//specify that the webpack render index.html with bundle.js at the top of the render DOM tree
	plugins: [
		new HTMLWebpackPlugin({
			template: path.join(__dirname, "/src/index.html"),
		}),
	],

	//transpiler loader specs
	module: {
		rules: [
			{
				// transpile files ending with .js
				test: /\.(js|jsx)$/i,

				// node_modules from transpilation
				exclude: /node_modules/,
				use: {
					// use the babel-loader package to transpile
					loader: "babel-loader",
					options: {
						//use these presets
						presets: ["@babel/preset-env", "@babel/preset-react"],
					},
				},
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				// transpile image files
				test: /\.(png|svg|jpg|jpeg|gif)$/i,

				// resource asset module in webpack 5+ to replace image-loader etc
				type: "asset/resource",
			},
			{
				// transpile font files
				test: /\.(woff|woff2|eot|ttf|otf)$/i,

				// resource asset module in webpack 5+
				type: "asset/resource",
			},
		],
	},
};
