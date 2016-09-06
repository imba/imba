This is the readme for v1.0.0-beta. For other versions, see [npmjs.com](https://www.npmjs.com/package/imba). Visit [imba.io](http://imba.io) for more information!

# Imba

[![Join the chat at https://gitter.im/somebee/imba](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/somebee/imba?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*if ruby and react had an indentation-based child, what would it look like?*
Imba is a new programming language for the web that compiles
to performant and readable JavaScript. It has language level 
support for defining, extending, subclassing, instantiating 
and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than **[20 times faster than React](https://github.com/somebee/todomvc-render-benchmark)**
with less code, and a much smaller library.

## Learn

To get started with Imba, we recommend reading through the [official guide](http://imba.io/guides). All snippets are editable and executable. If you have any questions, please join our [gitter channel](https://gitter.im/somebee/imba).

## Installation
Get [Node.js](http://nodejs.org) and [npm](http://npmjs.org), then:

- `npm install -g imba`

Regular code will run fine without any dependencies, but if you intend to use tags and selectors, remember to include the Imba library. On the server you should do `npm install imba --save` in your project, and `require 'imba'` in your application. For a simple example see [hello-world](https://github.com/somebee/hello-world-imba)

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

## Plugins
We currently recommend Sublime Text for Imba, since this is the only editor with a solid plugin so far. The [sublime-plugin](http://github.com/somebee/sublime-imba) can be installed through Sublime Package Manager. It is highly recommended to use [Sublime Text 3](http://sublimetext.com/3) for best highlighting and annotations.

## Contribute
Contributors are always welcome. To start with, you should clone the repository and try to get somewhat familiar with the codebase. Please shoot me a message on github if you have any comments or questions, and I will try to get back to you asap.
