<a href="http://imba.io" target="_blank">
<img width="300" src="https://raw.githubusercontent.com/imba/brand/master/images/logo/png/logo-black.png"></a>

# Imba

[![Knowledge Base & New Chat](https://img.shields.io/badge/knowledgebase_and_chat-spectrum-blueviolet.svg)](https://spectrum.chat/imba) [![Join the chat at https://gitter.im/somebee/imba](https://img.shields.io/badge/old_chat-gitter-fb0061.svg)](https://gitter.im/imba/Lobby) 

*if ruby and react had an indentation-based child, what would it look like?*
Imba is a new programming language for the web that compiles
to performant and readable JavaScript. It has language level
support for defining, extending, subclassing, instantiating
and rendering dom nodes.

## Documentation

To get started with Imba, we recommend reading through the [official guide](http://imba.io/guides). If you just want to get going, clone [hello-world-imba](https://github.com/somebee/hello-world-imba) and follow the readme. Check out the [awesome-imba](https://github.com/koolamusic/awesome-imba) list for more resources.

## Community

### Bi-Weekly Imba Community Meeting

Everyone is welcome! The developer meetings are usually on Monday's every 2
weeks. This is a great place to report your issues, hangout and talk about your
project using Imba. If you have an open pull request which has not seen
attention, you can ping during the meeting.

- Attend physically at the Scrimba [office](https://www.meetup.com/Imba-Oslo-Meetup/events/chnlhryzmbdb/).
- Join via [Zoom](https://us04web.zoom.us/j/230170873)
- [Meeting notes](https://docs.google.com/document/d/1ABGjOJut9eXrajYjdN4G4-UGGU4gvKznLk5CAaXYjso/edit?usp=sharing)

### Chat

For questions and support please use our [community chat](https://gitter.im/somebee/imba).

## Plugins

* Atom: **[language-imba](http://github.com/somebee/language-imba)** can be installed through Atom Package Manager. File icon support is available via the [File Icons package](https://github.com/file-icons/atom).
* Sublime Text: **[sublime-imba](http://github.com/somebee/sublime-imba)** can be installed through Sublime Package Manager.
* VSCode: **[vscode-imba](http://github.com/somebee/vscode-imba)** can be installed through VSCode / Marketplace.

## Installation
Get **[Node.js](http://nodejs.org)** and **[npm](http://npmjs.org)**, or **[Yarn](http://yarnpkg.org)**, then:

- `npm install -g imba`
- `yarn global add imba`

## Usage

### imba

Imba ships with a basic node wrapper for running imba-scripts. Use `imba` the same way you would use `node`. Call `imba` without arguments to see available options.

> `imba app.imba` will compile and execute app.imba

### imbapack

The `imbapack` utility is a convenient wrapper around `webpack`, which preprocesses your config to include the necessary configurations for loading .imba files. It supports all the same options as `webpack` and will work with `webpack.config.js` files directly. When you use `imbapack` you do not need to declare an imba-loader and resolveExtensions in your configs.

> `imbapack app.imba bundle.js` compiles the file app.imba, **and all required files** into a webpack bundle named bundle.js. This file can be included in a html page like any other js-file. See [webpack](https://webpack.github.io) for more details.

> `imbapack --watch app.imba bundle.js` same as above, but recompiles whenever app.imba or any related files change.

### Webpack Config

The following should be sufficient in most cases:
```js
{
  test: /\.imba$/,
  loader: 'imba/loader'
}
```

### imbac

The `imbac` utility is for compiling your scripts to js. When working on client-side projects you should rather use `imbapack` (see above). Call `imbac` without arguments to see available options. If you are not able to use `imba` to run your project, or you really need to precompile the code (for running on node), you can use `imbac`.

## License

[MIT](http://opensource.org/licenses/MIT)
