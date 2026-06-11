# Declarative Rendering

The virtual DOM was a fantastic innovation. It brought about a much more productive way of writing web applications by allowing us to write our views in a declarative manner. Declarative rendering is only possible if the process of re-rendering is fast enough. To do this, virtual DOMs essentially render a lightweight representation of your view, compares it to the previous lightweight representation, and only *patch* the real DOM with the changes.

This process is still quite slow, and to work around these inherent challenges we've resorted to complex state management frameworks that carefully track the changing data, making sure that only specific views need to re-render. Even with this in place, rendering complex lists and very dynamic views can often become sluggish. What if we could get better performance in a world where the data layer and view layer don’t really know or care about each other?

Imba introduces a *revolutionary* new way of reconciling your dom which is orders of magnitudes faster than existing virtual DOM approaches. Understanding the basic concepts is invaluable to get a deep understanding of how to make things with Imba.

## How it Works

DOM nodes in Imba are *not* virtual, they are in fact real elements:

```imba
let el = <div.large title="Item">
console.log el # HTMLDivElement
console.log el.outerHTML # <div class='large' title='Item'>
```

Let's look at a simple component and go through the generated code line by line. 

```imba
let number = 1
let bool = false

tag App
	<self .ready=bool>
		<h1.header> "Number is {number}"

```

The component above will roughly compile to something like the following. Feel free to skip this part if it seems hard to understand, but please get back to it. Once you get a deep understand the simple yet powerful way Imba does rendering it will make you a much more powerful developer.

```js
/*
This is handcrafted pseudocode – the real imba output is
more optimised and compact, making it a little harder to
understand.
*/
let number = 1;
let bool = false;

class App extends HTMLImbaElement {
	render(){
		var $ = (this.cache || this.cache = {});
		
		// toggle the class name on the App element - based on
		// value of bool, and cache the valua for later checks
		if($.val != bool) this.classList.toggle('ready',$.val = bool)

		if(!$.rendered){
			$.h1 = this.appendChild('h1') // add h1 and cache element
			$.h1.className = "header"; // only on first render
			$.h1.insertText("Number is "); // only on first render
			$.t1 = h1.insertText(number); // add text and cache textnode
		} else {
			// has been rendered previously, not much to do!
			$.t1.textContent = number; // update the text of the textnode
		}		
		$.rendered = true; // mark App as rendered
		// nothing is returned from render
	}
};
```

Try to read this code, and figure out what will happen the first time `app.render()` is called, and what will happen the second time.

In a framework like react, the idea is that the render method creates a virtual dom tree *and returns it*. Every time you call render it will generate a new tree. This tree will be taken by the dom reconciler to compare to some previously cached version, create a diff, and patch the real DOM with the changes.

In Imba, calling render will *actually* create and then later modify the *real* DOM elements to make sure they appear the way you have declared. So after the first render, calling render on the `App` element above will only run a minimal number of instructions. The result is that re-rendering in Imba is so fast that you can literally render your whole application, from root, regularly.

### Basic example

```imba main.imba
global css body d:flex ja:center
# ---
let number = 1
tag App
	<self>
		<h1.header> "Number is {number}"

document.body.appendChild <App>
```

Here we created an `<App>` element and added it to the body. As you can see, it prints the text as it should, but if the number changes, it will still read "Number is 1" in the DOM. Now let's add some methods to see if we can re-render:

```imba main.imba
# [footer] [preview=md]
global css body d:flex ja:center
# ---
let number = 1
tag App
	<self>
		<h1.header> "Number is {number}"

let el = <App>
document.body.appendChild el

export def update
	number = Math.random!
	el.render! # call render manually
# ---
export const actionzs = {
	"number += 1": do
		number += 1
		console.log "incremented number to {number}"
	"el.render()": do el.render!
}
```

As you can see, whenever we call `render` on the element it makes sure to update the dom if anything has changed. Also, when render is called on an element, all the custom children will also be re-rendered:

```imba main.imba
# [footer] [preview=lg]
global css body d:flex ja:center
# ---
tag Item
	css d:block px:1 m:1 bg:blue2 fs:sm rd:md
	<self> "Changes on every render: {Math.random!}"
		
tag App
	<self>
		<Item>
		<Item>

document.body.appendChild let el = <App>
# ---
export const actions = {
	"el.render": do el.render!
}
```

## Automatic rendering

Calling render manually on your elements is cumbersome and doesn't really scale. Instead, imba automatically calls render on your mounted elements whenever an event has been triggered *and* handled by a listener. The only thing you need to do is to add your root element using `imba.mount` instead of `document.body.appendChild`.

```imba
# [preview=xl]
import 'util/styles'

css div pos:absolute d:block inset:0 p:4
css mark pos:absolute
css li d:inline-block px:1 m:1 rd:2 fs:xs bg:gray1 @hover:blue2
# ---
let x = 20
let y = 20
let title = "Hey"
# mount our elements via imba.mount
imba.mount do
    <main @mousemove=(x=e.x,y=e.y)>
        <input bind=title>
        <label> "Mouse is at {x} {y}"
        <mark[x:{x} y:{y} rotate:{x / 360}]> "Item"
        <ul> for nr in [0 ... y]
            <li> nr % 12 and nr or title
```
Move your mouse around and see how everything updates instantly. This is just a tiny preview of how fast and powerful the declarative rendering in Imba is. Because we listen to a `@mousemove` event, Imba will automatically call render on the mounted element.

## Manual rendering

The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using await or returning a promise), Imba will also re-render after the promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you can call `imba.commit`. This is also what the event handlers are using under the hood. It schedules an update for the next animation frame. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something. Things will only be rerendered once even if you call `imba.commit` a thousand times.

Manually calling `imba.commit` is usually only needed when dealing with receiving data asynchronously (not as a result of a user interaction / event). So, if you receive data via a websocket, the only thing you need to make your whole application magically stay in sync with your data is to call imba.commit whenever you receive data from your socket.

```imba
websocket.addEventListener('message',imba.commit)
```

Or, if you fetch some data via window.fetch, and it doesnt happen asynchronously as part of an event handler, just make sure to call `imba.commit` afterwards:

```imba
def load
    let res = await window.fetch("/items")
    state.items = await res.json!
    imba.commit!
```

## Custom scheduling

Let's say you have a clock, or some other element that needs to re-render at specific intervals, or more often than the rest of your app. Remember, the only thing that really happens when we render is that `.render()` is called on elements. So, manually you could add an interval to specific elements:

```imba
# [preview=md]
import 'util/styles'
# ---
tag Clock
    css d:block p:2 bd:1px solid gray4 m:2 ta:center
    def mount   do #interval = setInterval(render.bind(self),1000)
    def unmount do clearInterval(#interval)
    def render  do <self> <span> (new Date).toLocaleString!

imba.mount do
    <div @click.log('clicked')>
        <span> "Rendered on click {Math.random!}"
        <Clock>
```
As you can see, the clock is actually updating every second. It is a little cumbersome to setup and teardown the intervals though, and since this is a pretty common pattern, Imba has a better way to do this, using the `autorender` property.

```imba
# [preview=md]
import 'util/styles'
# ---
tag Clock
    css d:block p:2 bd:1px solid gray4 m:2 ta:center
    <self> <span> (new Date).toLocaleString!

imba.mount do
    <div @click.log('clicked')>
        <span> "Rendered on click {Math.random!}"
        <Clock autorender=1s>
```

Let's create some proper clocks, and show a few autorender values:

```imba
# [preview=xl]
import 'util/styles'
global css body d:block
# ---
tag app-clock
	utc
	
	def render
		let ts = Date.now! / 60000 + utc * 60
		<self.clock>
			<div.dial.h[rotate:{ts / 720}]> <i>
			<div.dial.m[rotate:{ts / 60}]> <i>
			<div.dial.s[rotate:{ts}]> <i/> <b>

imba.mount do
    <div.clocks>
        <app-clock autorender=1s title='New York' utc=-5>
        <app-clock autorender=500ms title='San Fran' utc=-8>
        <app-clock autorender=10fps title='London' utc=0>
        <app-clock autorender=60fps title='Tokyo' utc=9>
```