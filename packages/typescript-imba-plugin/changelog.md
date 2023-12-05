# Changelog

## 1.3

* Now treating all compiled imba files as typescript internally. Should make the tooling more robust.
* Improved typings for classes, mixins, class extensions etc across files.
* Optimizations

## 1.2.14

* Improve generated typings for `extend class` statements
* Improve reloading after js/tsconfig.json changes

## 1.2.12

* Resolve `.d.ts` files before `.imba` files to allow supplying local type declarations for imba files

## 1.2.8

* Make lexer more fault tolerant