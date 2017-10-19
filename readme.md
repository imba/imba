# Imba

[![Join the chat at https://gitter.im/somebee/imba](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/somebee/imba?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*if ruby and react had an indentation-based child, what would it look like?*
Imba is a new programming language for the web that compiles
to performant and readable JavaScript. It has language level 
support for defining, extending, subclassing, instantiating 
and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than **[20 times faster than React](https://github.com/somebee/todomvc-render-benchmark)**
with less code, and a much smaller library.

## Documentation

To get started with Imba, we recommend reading through the [official guide](http://imba.io/guides).

## Questions

For questions and support please use our [community chat](https://gitter.im/somebee/imba).

## Plugins

* Sublime Text: [sublime-imba](http://github.com/somebee/sublime-imba) can be installed through Sublime Package Manager.
* VSCode: [vscode-imba](http://github.com/somebee/vscode-imba) can be installed through VSCode / Marketplace.

## Installation
Get [Node.js](http://nodejs.org) and [npm](http://npmjs.org), then:

- `npm install -g imba`

## Usage

### imba

Imba ships with a basic node wrapper for running imba-scripts. Use `imba` the same way you would use `node`. Call `imba` without arguments to see available options.

> `imba app.imba` will compile and execute app.imba

### imbapack

The `imbapack` utility is a convenient wrapper around `webpack`, which preprocesses your config to include the necessary configurations for loading .imba files. It supports all the same options as `webpack` and will work with `webpack.config.js` files directly. When you use `imbapack` you do not need to declare an imba-loader and resolveExtensions in your configs.

> `imbapack app.imba bundle.js` compiles the file app.imba, **and all required files** into a webpack bundle named bundle.js. This file can be included in a html page like any other js-file. See [webpack](https://webpack.github.io) for more details. 

> `imbapack --watch app.imba bundle.js` same as above, but recompiles whenever app.imba or any related files change.

### imbac

The `imbac` utility is for compiling your scripts to js. When working on client-side projects you should rather use `imbapack` (see above). Call `imbac` without arguments to see available options. If you are not able to use `imba` to run your project, or you really need to precompile the code (for running on node), you can use `imbac`.

## License

[MIT](http://opensource.org/licenses/MIT)
