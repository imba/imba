# <a href="https://github.com/imba/imba.io/edit/master/content/docs/undocumented.md">Undocumented</a>

> [tip box yellow] Many of these are considered to be [experimental](/experimental) features.

Imba is moving extremely quickly and documenting every feature
becomes challenging. We intend to continually revise the
documentation as much as possible, but instead of not documenting
features *at all* until we have time, it's better to at least
expose them to power users who want to learn as much as possible
at the cost of reading something slightly less structured and
polished as the rest of the docs.

This also serves as a list of things that need to be documented
more formally, which is better than having all of them in our
personal notes. Contributions are highly appreciated, especially:

- Polishing any of these examples or creating your own examples.
- Moving examples to a relevant location on the documentation.
- Coming up with proper names for ambiguous features.

If you have questions about any of these, don't hesitate to reach
out on [Discord](https://discord.gg/mkcbkRw).

## isa

`instanceof` is shortened to `isa` in imba:

```imba
[] isa Array
```

But we've added more functionality. If the right hand side is a string,
it will check `typeof`:

```imba
let s = 'hello'
typeof s is 'string' # true
s isa 'string' # true
```

It also works similarly to `is`:

```
7 isa ('string' or 'number') # true
```

## Awaits

You can await desired changes to observable properties with `imba.awaits`,
which takes a callback that will be called every time the property is changed until the callback returns a truthy value.

```imba
let user = new class User
	@observable first_name = 'first'

setTimeout(&,100ms) do
	user.first_name = 'updated'

setTimeout(&,200ms) do
	user.first_name = 'again'

await imba.awaits do
	console.log user.first_name
	user.first_name is 'updated'
```

## No Hashing

If you want to bundle with no hashing, for now you need to use Vite as a bundler and specify the output filename:

```
export default defineConfig({
  ...
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
```

## General code events

In Imba you can emit and listen to events without needing the DOM:

```
imba.emit 'hello'
imba.listen 'hello'
```

## Emitting events on elements

`Element` is extended with an `emit` function.

```
some_element.emit('event_name')
```

## Circles

```
rd:full
```

compiles to

```
border-radius:9999px
```

## Platform Imports

If you name a file `os.node.imba` and another `os.imba` and import `os` it will import the one for the relevant platform.

## Generic Media Queries

```
@media(hover: hover)
```

## .env

Imba will automatically traverse up the file tree starting from
**the dirname of the file you ran with imba** in search for a `.env` file.
The contents will be accessable from `process.env`.

The `.env` file has the following syntax:

```
S3_BUCKET="YOURS3BUCKET"
SECRET_KEY="YOURSECRETKEYGOESHERE"
```

Accessing these variables in an imba file is as simple as `process.env.S3_BUCKET`. No configuration necessary.

Note that, unlike the dotenv library, Imba will not use the cwd to search for the `.env` file,
but rather the dirname of the file you ran.

## `arguments` shorthand

In line with `$1`, `$2`, etc. positional params, `$0` refers to [the arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#arguments_is_an_array-like_object).

## Spread Shorthand
```imba
# [preview=console]
let x = [1, 2, 3]
console.log(*x)
console.log(...x)
```

## Letting Branch Results

This is a common pattern:

```imba
# [preview=console]
def example
	let obj
	try
		obj = JSON.parse("this will error")
	catch e
		obj = {}
	console.log obj

example!
```

Instead we can do:

```imba
# [preview=console]
def example
	let obj =
		try
			JSON.parse("this will error")
		catch e
			{}
	console.log obj

example!
```

Or with less lines:

```imba
# [preview=console]
def example
	let obj =
		try JSON.parse("this will error")
		catch e {}
	console.log obj

example!
```

Or in one line:

```imba
# [preview=console]
def example
	let obj = try JSON.parse("this will error") catch e {}
	console.log obj

example!
```

Or without a catch:

```imba
# [preview=console]
def example
	let obj = try JSON.parse("this will error")
	console.log obj

example!
```

This can also be done with if/else statements.

## Platform

```imba
if $node$
	'Node'
if $browser$
	'Browser'
if $worker$
	'Worker'
if $web$
	'Web'
```

## Dataset Props

```imba
tag app
	def mount
		dataset.payload = "test" # sets the `data-payload` attribute on <app>
```

## Cooldown Flag

The cooldown event modifier will flag the `cooldown` class on the target element.

```imba
<button @click.cooldown(1s)=handler>
	css @.cooldown bg:blue
	"On click, will flash blue and not be clickable for 1s"
```

## Resize CSS Modifier

The `css` modifier for the `@resize` event will set the units `elw` and `elh` on the element on resize:

```imba
tag app
	<self @resize.css>
		css s:50px bg:rose4
```

If you inspect `<app>`:

```css
    --u_elw: 50;
    --u_elh: 50;
```

You can use them in css as units:

```imba
css w:1elw h:1elh
```

You can also pass in custom element names:

```imba
tag app
	<self @resize.css(1sectionwidth,1sectionheight)>
		css s:50px bg:rose4
```

Results in:

```css
    --u_sectionwidth: 50;
    --u_sectionheight: 50;
```

## Class Constructors

You can pass an object to class constructors to set instance properties:

```imba
# [preview=console]
global.L = console.log

class Note
	content = 'hello'

let note = new Note({content:'world'})

L note

let obj = JSON.parse(JSON.stringify(note))

L new Note(obj)
```

## Custom Events

```imba
# [preview=console]
global.L = console.log

tag app-button < button

	def on$click mods, context, handler, o
		L "self", self
		L "mods", mods
		L "context", context
		L "handler", handler
		L "o", o
		self.addEventListener('click',handler,o)

tag app

	<self>
		<app-button @click.log('clicked')> "log"

imba.mount <app>
```

`o` refers to `options`/`useCapture`: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters

## Autorun Reactions

```imba
@observable one = ''
@observable two = ''
@autorun def my-function stop-observing
	one
	stop-observing! if stop-observing
	two # this will not trigger this autorun function even though it is observable
```

## Autorun Order

Autorun functions will run in the order they are declared.

## `def` In Objects

If you want to add a function to an object, you don't have to do:

```imba
let obj =
	add: do(a, b)
		a + b
```

You can just use the normal `def` syntax:

```imba
let obj =
	def add a, b
		a+ b
```

## Flex Layouts

Imba supports flex layouts that follow a 3-character pattern: `vh` `tbcs` `lrcs`.

`v` and `h` stand for `vertical` and `horizontal` respectively.

`t` and `b` stand for `top` and `bottom` respectively.

`l` and `r` stand for `left` and `right` respectively.

`c` and `s` stand for `center` and `stretch`/`space-between` (depending on the flex-direction) respectively.

It sounds a bit complicated but it's much more intuitive once you get a feel for it.
For example, to create a container whose content is centered, you can use `d:vcc` or `d:hcc`.
If you want the content to be to the top left, you can do `d:vtl` or `d:htl`.

## Accessors

Imba allows you to delegate an object as the accessor for a field. Accessors
must conform to an interface. Namely, they must have a `$get`
method and a `$set` method.

```imba
class Uppercase

	def $set value, target, key
		target[key] = value

	def $get target, key
		target[key].toUpperCase!

let upcase = new Uppercase

class User
	name as upcase

let user = new User
user.name = "sindre"
console.log user.name
# SINDRE
```

Here, we are essentially delegating the `upcase` object as the
manager for getting and setting `name`.

## CSS value aliases

We've started to implement some value aliases, such as `pos:abs` and `pos:rel`. One caveat is that these shorthands can't be interpolated since
they're determined at compile time.

## CSS variables and durations

You can't use css variables to dynamically assign durations, you can either use custom units (`1animtime:10s`) or an interpolated value (`ease:{10}s`).

## Semantic Div Naming

Because Imba's css is so quick to write and flexible, the majority of the time it makes sense
to put css directly under elements as opposed to making a class or separate stylesheet:

```imba
tag app
	<self>
		<div>
			css bg:blue
```

But then everything that's not a custom element ends up being named `div`.
So you might put a semantic class name there that doesn't actually have any styles:

```imba
tag app
	<self>
		<.blue-thing>
			css bg:blue
```

It's nice because it's much easier to see what a certain layout is by reading an actual name.
The issue with this is that you have to worry about `.blue-thing` being defined somewhere else.

At Scrimba we've adopted the convention of using `%`:

```imba
tag app
	<self>
		<%blue-thing>
			css bg:blue
```

## PWAs With Imba

This assumes you're using the Vite bundler.
You can create an imba project that uses the vite bundler with `npx imba create`.

It's insanely easy to get caching with service workers using Vite.
Literally all you have to do is install a vite plugin and add it to the plugin list:

```sh
npm i vite-plugin-pwa -D
```

vite.config.js:

```imba
import { imba } from 'vite-plugin-imba';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	base: '',
	plugins: [imba(),VitePWA()],
});

```

When you run `vite build`, it'll automatically create a service worker for you
and cache requests so your page will load offline and instantly.

## Any @ Selector Gets Collapsed

```imba
css @hover @focus @checked
```

The above essentially gets compiled to

```imba
css @hover@focus@checked
```

The same with `@.collapsed @.show-more`

If you want to nest them you'd do

```imba
css @hover
	*@focus
```

This is usually what you want with psuedo selectors.

## Super

In any inheritor class or tag, calling `super!` will call the inherited object's function.

```imba
tag modal
	def test
		console.log "hello"
		
tag my-modal < modal
	def test
		super!
		console.log "hello again"
```

Writing `super` without `()` or `!` will essentially call the super function with `...args`

You can also call other functions by using `super`:

```imba
super.setup!
```

## Swallowing all hotkeys

If, for example, you have a modal, and want to prevent all hotkeys:

```imba
@hotkey('*').global
```

## Specific Parent Selector

You can select a specific parent up the chain:

```imba
css ^.collapsed # if the direct parent has class .collapsed
css ^^^.collapsed # if the parent's parent's parent has class .collapsed
```

This is most useful for pseudo states:

```imba
css c^@hover:blue
```

## Parent Selector

This will apply opacity 0 if the `.collapsed` class is found *anywhere*
in the parent heirarchy chain, all the way to root.

```imba
css o..collapsed:0
```

## Color Precision

```imba
css c:blue4
css c:blue440
css c:blue450
css c:blue465
css c:blue5
```

## Tip: Globals & console.log

Writing `console.log` all the time feels quite verbose.
You might fancy writing `global.L = console.log` in your main/shared file.
This way you expose `L` to your entire app and can just do:

```imba
L "hello"
```

instead of

```imba
console.log "hello"
```

We use a capital name because lowercase names in Imba imply `self`.

## Font Size

```imba
fs:md-
```

## CSS Color Variables

```
css #site-bg:gray85
css bg:#site-bg
```

## &. and @.

If the current element has class `.blue`:
```imba
css &.blue bg:blue
```

If parent element has class use existing rich selector:
```imba
css @.blue bg:blue
```

## Error events

```
@error.trap
```

## Custom Event Modifiers

```imba
const p = console.log

import * as fui from '@floating-ui/dom'

extend class Event

	def @confirm msg
		let view = <app-confirm anchor=target template=msg>
		p target
		imba.mount view
		view.promise

tag app-confirm

	anchor
	template
	promise = new Promise do #resolve = $1

	def confirm
		#resolve yes
		hide!

	def mount
		{ x, y } = await fui.computePosition(anchor, self)

	def reject
		#resolve no
		hide!

	def hide
		imba.unmount self
		self

	<self>
		css pos:absolute w:max-content top:{y}px left:{x}px
		<button @click=reject> 'Cancel'
		<button @click=confirm> 'OK'

tag app

	<self>
		<button@click.confirm.log('Confirmed!')> 'Click to confirm'

imba.mount <app>
```

## Style flags

```imba
global css .dark bg:black c:white

tag app
	def mount
		self.flags.add('dark')
	<self> 'manual flags'

imba.mount <app>
```

## Adjusting HSL

```
css bg:blue3-3
```

## Class.inherited hook

Imba provides a way of interacting with a class when it is declared as the parent of another class. If your parent class has a static `inherited` method, it will be called with the subclass as an argument whenever some class inherits from it.

```imba
class Base
	static def inherited subclass
		console.log 'was inherited by',subclass

class User < Base

# => was inherited by [User]
```

## Define min/max width/height with shorthand

This is in undocumented because it is _very likely_ be removed for the final release. Currently it is possible to declare both min and max width/height with `>val` and `<val` in css props.

```imba
css div w:100px <80vw # width:100px max-width:80vw
css div h:80% >100px # height:80% min-height:100px
```

## Custom css modifiers

When you use an undefined `@modifier` in styles, it defaults to check for a `mod-nameofmodifier` class on the root element. So it is easy to use / add your own.

```imba
if state.user
	document.flags.add('mod-logged-in')

css div
	# you can use the @logged-in modifier anywhere in your app
	# it is true when html.mod-logged-in matches
	d:block @logged-in:none
```

Let's say you have a PWA and want specific styles when the app is opened outside of browser:
```imba
# set mod-standalone if we match that displayMode
document.flags.toggle('mod-standalone',
	window.matchMedia('(display-mode: standalone)').matches
)

global css body
	# different background when opening in standalone mode
	bg:white @standalone:gray
```

Add a modifier whenever a certain element is opened

```imba
tag base-page
	get ref do nodeName.toLowerCase!
	def mount do document.flags.add("mod-{ref}")
	def mount do document.flags.remove("mod-{ref}")

tag home-page < base-page
tag about-page < base-page

# Whenever a page is mounted the tag-name of the page
# can be used as a modifier globally in your styles
global css
	body hue:blue @home-page:indigo
	header d:hflex @home-page:none

```

## Preventing multiple events

```
@click.cooldown.confirm
```

If you don't provide a time for the cooldown, it will not allow any more events through until the promise of the callback has finished.

## Time Units

You can append certain time units to numeric literals. The compiler converts them to milliseconds.

```imba
Date.now! - 3days
```

`3days` compiles to `3 * 24 * 60 * 60 * 1000`, or three days in milliseconds. Units like `minutes`, `hours` and `fps` work the same way.
