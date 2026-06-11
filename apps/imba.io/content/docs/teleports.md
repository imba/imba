# Teleports

The `<teleport>` is a special kind of element that allows you to add event handlers and content to a different element.

## The Global Tag

You can use the special `<global>` tag within your elements for two main purposes:

#### 1. Global Event Handlers [preview=md]

If your element needs to attach a global event handler, do it on the `<global>` tag. This is useful for things like keyboard shortcuts, or listening for mouse events that happen outside of the element. Event listeners on the `<global>` tag will be removed when the element is unmounted.

There is an event modifier called `outside` that can be used in conjunction with mouse events on the global tag. This will limit the event to firing when it happens outside of the element. It's demonstrated below.

```imba
import 'util/styles'

# ---
tag my-menu
	css .menu-container shadow:0 0 0 1px black/10, lg rd:5px mt:5px o:0 ml:10px of:hidden tween:all 300ms ease
		.menu-item p:5px 10px bdb:1px solid cooler2 @last:none bgc:white @hover: blue5 c:gray8 @hover:white cursor:pointer

	showMenu = false

	<self>

		<global
			@click.outside=(showMenu = false)
			@keydown=(showMenu = false if e.key === 'Escape')
		>

		<div[d:flex]>
			<button @click=(showMenu = !showMenu)> "Toggle Menu"
			<div.menu-container [opacity:1]=showMenu>
				<div.menu-item> "Click Outside"
				<div.menu-item> "Or Press Escape"
# ---

imba.mount <my-menu>
```

#### 2. Appending to Body [preview=md]

Content nested within the `<global>` tag will be appended to the document's `<body>`. You can think of it like a slot, or portal. This can be useful for things such as modal windows with should appear above everything else.

When your element unmounts, content added to `<global>` will also be unmounted.

```imba
import 'util/styles'

# ---
tag my-menu

	css .modal-window zi:10 c:white pos:absolute t:50% l:50% x:-50% y:-50% bgc:black/70 p:30px rd:10px

	showModal = false

	<self>
		<button @click=(showModal = !showModal)> "Toggle Modal"
		<global>
			if showModal
				<div.modal-window @click=(showModal = false)>
					<h1> "This is appended to the body tag"

# ---

imba.mount <my-menu>
```