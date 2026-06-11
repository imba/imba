# Components

Components are reusable elements with functionality and children
attached to them. Components are _just like regular classes_ and use
all the same syntax to declare properties, methods, getters and
setters. To create a component, use the keyword `tag` followed by a
component name.

```imba app.imba
# [preview=md]
tag Box
	css pos:relative d:flex ja:center
		rd:md bg:hue3 c:gray9/70
		w:24 h:10 m:1 px:4 fs:sm cursor:grab
	x = 0
	y = 0
	<self[x:{x}px y:{y}px] @touch.moved.sync(self)> <slot> "box"

tag app
	<self[inset:0 d:hflex ja:center]>
		<Box[hue:blue]> 'One'
		<Box[hue:sky]> 'Two'
		<Box[hue:indigo]> 'Three'
		<Box[hue:purple]> 'Four'

imba.mount <app>
```

### Local Components

If a component's name begins with an uppercase letter, it will be
defined as a local component. This means that it will act just like a
web component, but will not be registered globally, and must be
explicitly exported and imported from other files to be used in your
project.

```imba
export tag Box
	<self>
		...
```

### Global Components

If a component's name begins with a lowercase letter, it will be
compiled directly to a native
[Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
These components are registered globally and are available anywhere in
your project as long as the file has been imported at least once.

Global component names must contain a dash, so it is common to
prefix them with `app-`.

```imba
tag app-box
	<self>
		...
```

## Named Elements [preview=md]

It can be useful to keep references to certain child elements inside a
component. This can be done using `<node$reference>` syntax.

```imba
import 'util/styles'

# ---
tag app-panel
    <self.group>
        <button @click=($name.value += 'Hi')> "Write"
        <input$name type='text'>
# ---

imba.mount <app-panel>
```

In the code above, `$name` is available everywhere inside `app-panel`
component, but also from outside the app-panel as a property of the
component.
