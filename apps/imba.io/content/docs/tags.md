# Elements

In Imba, DOM elements are a first-class part of the language. Imba does not use a virtual DOM, instead it compiles declarative tag trees into an extremely efficient [memoized dom](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52), which is orders of magnitude faster than virtual DOM approaches, yet conceptually simpler.

## Constructing Elements

```imba
let div = <div#main.note.sticky title='Welcome'> 'Hello'
```

The code above creates an actual HTMLDivElement. It will be helpful to understand what happens behind the scenes when creating an element using the literal syntax. Imba breaks up each part of the node, and applies them one after the other. The code above roughly compiles to:

```imba
let div = document.createElement('div') # create div
div.id = 'main' # set id
div.classList.add('note') # add .note
div.classList.add('sticky') # add .sticky
div.title = 'Welcome' # set title
div.textContent = 'Hello' # set textContent
```

## Setting Classes

You can add classes to your elements by adding one or more identifiers preceded by `.`

```imba
# add note and editorial classes
<div.note.editorial> "Hello"
```

Set a class only when a certain condition is met can be done using `.class=condition`.

```imba
<div.note.editorial .resolved=data.isResolved> "Hello"
```

To add dynamic classes based on data use `{}` for interpolation inside class names:

```imba
let marks = 'rounded important'
let state = 'done'
let color = 'blue'
# ---
<div.item .{marks} .{state} .bg-{color}-200> "Hello"
```

These interpolated classes can also be toggled by a condition:

```imba
<div.item .theme-{user.theme}=app.loggedIn> "Hello"
```

Classes are set and updated in an optimised way which means that updating the raw `el.className` or `el.classList` directly will yield unexpected results. When you want to add and remove classes directly from the elements outside of rendering trees you need to use `el.flags` which works just like [Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

```imba
# add example for el.flags here
```

## Setting Properties

As you've already seen you can add properties to the elements just like you would in HTML. You can set arbitrary properties on the elements. Just remember that you are setting properties, **not attributes**. They are for the most part mapped 1-to-1, but attributes like `tabindex` must be set using the `tabIndex` property.

```imba
<div lang="en" title=data.title tabIndex=0> "Hello"
```

In addition to all the regular properties supported in the JS DOM, Imba introduces a few special properties that are useful to know about:

<api-list>Element.own.setters.custom</api-list>

## Setting Attributes

By default you are setting properties on elements, NOT attributes. The reason `<div title='Hello'>` works is that Element.title is defined as an IDL property that proxies to `setAttribute('title',...)`. So setting `somename` on an element won't automatically show up as attributes on the element. To set raw custom attributes you can use the html namespace prefix:

```imba
<div somename='hello'> # sets property on div
<div html:someproperty='hello'> # sets html attribute on div
```
You can also declare attributes on your components using the `attr` keyword.
```imba
tag app-panel
    attr desc
```
Then you can use `desc` as any other standard IDL property.
```imba
<app-panel desc="Some description">
```

## Adding Inline Styles
See [Styling Documentation](/docs/css) for in-depth documentation about styling, both via selectors and inline on elements.

```imba
<div[color:red bg:blue padding:8px]> "Hello"
```

Just like classes, styles can be conditionally applied

```imba
<div[color:red bg:blue] [display:none]=app.loggedIn> "Hello"
```

## Adding Event Listeners

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered. See [Events Documentation](/docs/events).

```imba
let counter = 0
<button @click=(counter++)> "Increment to {counter + 1}"
```

## Rendering Children

Indentation is significant in Imba, and tags follow the same principles. We never explicitly close our tags. Instead, tags are closed implicitly by indentation. So, to add children to an element you simply indent them below:

```imba
<div> <ul>
	<li> <span> 'one'
	<li> <span> 'two'
	<li> <span> 'three'
```

Tags can also be included inside string interpolations, so that templates like this:

```imba
<div>
    "This is "
    <b> "very"
    " important"
```

Can be written like on a single line

```imba
<div> "This is {<b> "very"} important"
```

Also, if you explicitly close your elements using `/>` at the end, you can add multiple elements after one another without problem:

```imba
<label> <input type='checkbox'/> 'Dark Mode'
```

## Conditionals & Loops

There isn't really a difference between templating syntax and other code in Imba. Tag trees are just code, so logic and control flow statements work as you would expect. To render dynamic lists of items you simply write a `for` loop where you want the children to be:

```imba
<div>
    if items
        <h1> "List of items:"
        <ul> for item in items
            <li> <span> item
    else
        <span> "No items found"
```

You can use break, continue and other control flow concepts as well:

```imba
# ~preview=xl
import {movies} from 'imdb'

css .heading c:blue7 fs:xs fw:bold p:2 bc:gray3 bbw:1 pos:sticky t:0 bg:white
css .item mx:2 d:flex px:2 py:3 bc:gray2 bbw:1 bg.hover:gray1
css .title px:1 t:truncate
css .number rd:3 px:2 bg:blue2 mr:1 fs:xs c:blue7 d:grid pc:center

# ---
imba.mount do <div.list> for movie,i in movies
    if i % 10 == 0
        # Add a heading for every 10th item
        <div.heading> "{i + 1} to {i + 10}"
    <div.item>
        <span.number> i + 1
        <span.title> movie.title
    # break out of the loop early
    break if movie.title == 'The Usual Suspects'
```

## Dynamic Element Type [advanced]

The first part of your tag literal should be the node name. So, to create a section you write `<section>`, for a list item you write `<li>` and so forth. You can use `{}` interpolation in the node name to spawn custom tags:

```imba
# ~preview
import 'util/styles'
# ---
let data = {type: 'button', label: 'Hello'}
imba.mount do
    <div.group>
        <section> "A section"
        <{data.type}> data.label
```

If you create an element without a node name it will always be created as a `div`.

## Fragments [advanced]

Fragments allow grouping elements together in a parent tag, without actually adding the parent tag to the DOM. Fragments can be created using empty tag literals `<>`.


```imba fragment.imba
tag app-dialog
	def render
		<self>
			<header> "Dialog header"
			<.body> body!

	def body
		<> # Returns all elements without any wrapping element
			<h3> "Body text"
			<p> "With some adjecent content"

	# Because imba returns the last statement
    # this function would only return the <p> element
	def bad-body
		<h3> "Body text"
		<p> "With some adjecent content"

```