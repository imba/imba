Visit [imba.io](http://imba.io) for more information!

# Imba
*if ruby and react had an indentation-based child, what would it look like?*
Imba is a new programming language for the web that compiles
to performant and readable JavaScript. It has language level 
support for defining, extending, subclassing, instantiating 
and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than **[20 times faster than React](https://github.com/somebee/todomvc-render-benchmark)**
with less code, and a much smaller library.

## Origin

Imba was first started more than 6 years ago, with the goal of making Ruby run in the browser. Then came CoffeeScript, which for a while satisfied our need for a better JavaScript. In early 2012 we started over by forking CoffeeScript to make it look and behave more like the language we had long abandoned.
Today, Imba is truly a solid language on its own, with its own syntax, unique features and quirks. It has been developed alongside several commercial applications, and is very much formed by real needs from real cases.

## Highlights
- Readable compiled js (keeping comments, indentation, style).
- Everything is an expression, including cases missing from CoffeeScript ( returning from loops, break/continue with arguments etc) without wrapping everything in anonymous functions all over the place. 
- Implement syntactic sugar like in CS, but with clean and performant code.
- Tags and query-selectors as native language constructs
- *Extremely* performant rendering of web-applications using tags.

## Installation
Get [Node.js](http://nodejs.org) and [npm](http://npmjs.org), then:

- `npm install -g imba`

Regular code will run fine without any dependencies, but if you intend to use tags and selectors, remember to include the Imba library. On the server (or with browserify++) you should do `npm install imba --save` in your project, and `require 'imba'` in your application. If you intend to use it in the browser without browserify (or similar) - make sure to include [imba.js](https://raw.githubusercontent.com/somebee/imba/master/lib/browser/imba.js) into the head of your document. For a simple example see [hello-world](https://github.com/somebee/hello-world-imba)

## Usage
After installing you can call `imba --help` to see our options.
For information about the commands you call `imba compile --help`, `imba watch --help`, etc.

## Plugins
We currently recommend Sublime Text 3 for Imba, since this is the only editor with a plugin so far. The [sublime-plugin](http://github.com/somebee/sublime-imba) can be installed through Sublime Package Manager.

It is highly recommended to use [Sublime Text 3 Dev](http://sublimetext.com/3dev) (latest version) for best highlighting and annotations.

## Contribute
Contributors are always welcome. To start with, you should clone the repository and try to get somewhat familiar with the codebase. Please shoot me a message on github if you have any comments or questions, and I will try to get back to you asap.
