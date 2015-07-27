# Imba
*if ruby and react had an indentation-based child, what would it look like?*
Imba is a new programming language for the web that compiles to performant
and readable JavaScript.

## Why
Imba started out several years ago as a fork of CoffeeScript, with a plan to add native syntax for creating, traversing, and manipulating DOM tags. It quickly changed into something quite different. The syntax is very close to Ruby (but with indentation). 

## Principles
- Ultra-readable compiled js (keeping comments, indentation, style).
  Making the technological investment minimal - as it is easy to move on with js codebase at any time.
- Everything is an expression.
  Without wrapping things in huge ugly anonymous functions everywhere
- Respect JS semantics and idioms.
- Implement syntactic sugar like in CS, but with clean and performant code.

## Installation
Get [Node.js](http://nodejs.org) and [npm](http://npmjs.org), then:

- `npm install -g imba`

## Usage
After installying you can call `imba --help` to see our options.
For information about the commands you call `imba compile --help`, `imba watch --help`, etc.


## Plugins
We currently recommend Sublime Text 3 for Imba, since this is the only editor with a plugin so far. The [sublime-plugin](http://github.com/somebee/sublime-imba) can be installed through Sublime Package Manager.

## Contribute
Contributors are always welcome. To start with, you should clone the repository and try to get somewhat familiar with the codebase. Please shoot me a message on github if you have any comments or questions, and I will try to get back to you asap.

## Quirks
Even though Imba has been used in production on several large commercial applications for 2+ years, it is still quite rough around the egdes. Some of the more esoteric language features still have some quirks, and don't be surprised if you run into some of them. When you do, please file an issue so that we can fix and improve it asap.

## Roadmap
- Support for svg and arbitrarily namespaced tags
- full await / defer support even in complex nested codeblocks 