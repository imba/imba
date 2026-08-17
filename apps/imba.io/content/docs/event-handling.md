# Event Handling

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, Imba will call that handler, with the event as the only argument.

```imba
<div @click=console.log> 'Will log the event'
```

Inside of these lazy handlers you can also refer to the event itself as `e`.

```imba
let x = 0
<button @click=console.log(e.type,e.x,e.y)> "Click"
<button @mousemove=(x = e.x)> "Mouse at {x}"
```

Remember that the expression will be called as is, so you never need to bind functions to their context and/or arguments.

```imba
import {todos} from './data.imba'

const handler = console.log.bind(console)

# ---
<ul> for item,i in todos
	<li @click=handler(e.type,item,i)> item.title
```

## Adding Modifiers

Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

```imba
# Call preventDefault on submit event before handling
<form @submit.prevent=handler>
# Handle only if condition is true
<button @click.if(condition)=handler>
# Handle scroll events once every 500ms at most
<section @scroll.throttle(500ms)=handler>
```

These modifiers can be chained:

```imba
<div @click.ctrl.stop=handler>
```

## Listening to global events

Sometimes a component needs to react to events that happen outside of its own elements — keyboard shortcuts, mouse movement, scrolling, or resizing at the window level. Instead of manually calling `window.addEventListener` and remembering to clean up, render a [`<global>`](/docs/components/teleports) element inside your component. Its event listeners are attached to `window`, and they are automatically added and removed when the component is mounted and unmounted:

```imba
# [preview=lg]
# ---
tag app-root
    pos = {x: 0, y: 0}

    <self[d:block p:3]>
        <global @pointermove=(pos = e)>
        <div> "Pointer is at {pos.x}, {pos.y}"
# ---
imba.mount do <app-root>
```

All the regular modifiers work here too, so things like `<global @keydown.esc=close>` or `<global @click.outside=dismiss>` are common patterns for dialogs and dropdowns.
