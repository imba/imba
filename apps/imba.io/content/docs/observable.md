# Observable

> [tip box yellow] This is considered an [experimental](/experimental) feature.

### TLDR

Imba provides MobX-like reactivity implemented as decorators.

- Properties decorated with `@observable` will be marked as
	observable, changing the way they interact with other
	properties as follows:

- Methods decorated with `@autorun` will be automatically invoked
	when any observable properties used by them change.

- Getters decorated with `@computed` will have their value cached
	on first use and will only recompute when any observable
	properties used by them change.

See the following guide for a holistic explanation of
`@observable` or jump to [reference information](#reference).

### Guide

In Imba, it's important to keep in mind that
[commit](/api/imba/commit) is called after every handled event.
This means that state changes which occur inside of event
handlers will be reflected in the next render. We can apply this
knowledge to implement a simplistic search:

#### The Inefficient Approach

```imba
# [preview=lg]
css body d:flex fld:column jc:start ai:center p:5
css input bg:blue0 mb:1 rd:2 outline:none p:1 3 bd:1px solid blue3
	caret-color:blue4 bxs:sm bg@focus:blue1 transition:background 300ms
css div bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs
# ---
let query = ""
let words = ["apple", "orange", "strawberry"]
tag app
	<self>
		<input bind=query> # bind implicitly handles input events
		for word in words.filter(do $1.includes(query))
			<div> word
# ---
imba.mount <app>
```

There are some problems with this first approach:

- `words` is being filtered on every single render, even though
	it only needs to be updated when our query actually changes.

	If you were to implement everything this way, with multiple
	computation-heavy methods running on every render in multiple
	nested components, eventually your app would start to feel
	slow.

- Semantically, `words` being filtered has nothing to do with
	`render`. Regardless of performance, it doesn't really make
	sense for the filtering logic to live in the render method,
	since the two are not related.

We can implement a less wasteful pattern manually:

#### The Manual Approach

```imba
# [preview=lg]
css body d:flex fld:column jc:start ai:center p:5
css input bg:blue0 mb:1 rd:2 outline:none p:1 3 bd:1px solid blue3
	caret-color:blue4 bxs:sm bg@focus:blue1 transition:background 300ms
css div bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs
# ---
let query = ""
let words = ["apple", "orange", "strawberry"]
let filtered_words = words
tag app
	def search
		filtered_words = words.filter do $1.includes(query)
	<self>
		<input bind=query @input=search>
		for word in filtered_words
			<div> word
# ---
imba.mount <app>
```

Now we are only filtering every time our `query` changes. This
addresses the issues listed above; it is now more efficient and
more semantic.

However, with our new approach there are some new problems:

- In situations where multiple sources can modify `query`, we
	have to manually call `search` after every modification or else
	`filtered_words` will be out of sync.

- We are forced to use an event listener (`@input`), a method
	(`search`), and an extra variable (`filtered_words`).

We can address some of these issues with `@autorun` and
`@observable`:

#### The Autorun Approach

```imba
# [preview=lg]
css body d:flex fld:column jc:start ai:center p:5
css input bg:blue0 mb:1 rd:2 outline:none p:1 3 bd:1px solid blue3
	caret-color:blue4 bxs:sm bg@focus:blue1 transition:background 300ms
css div bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs
# ---
let words = ["apple", "orange", "strawberry"]
let filtered_words = words
tag app
	@observable query = ""
	@autorun def search
		filtered_words = words.filter do $1.includes(query)
	<self>
		<input bind=query>
		for word in filtered_words
			<div> word
# ---
imba.mount <app>
```

A method decorated with `@autorun` will be reactively invoked
whenever any `@observable` properties used by it change.

This example effectively works the same as the manual approach,
except now if we modify `query` from some other part of the code,
we don't have to remember to call search manually, which is
especially helpful when the code becomes more complex and
interrelated. We also don't need `@input` anymore.

For example, if the search bar were to double as an input to add
new entries upon clicking a button, typically we'd want to clear
the input after adding a new entry. In doing so, we'd have to
*remember* to call `search` after clearing `query`. If we forget,
our app may not behave the way we want, or it may even lead to
erroneous behavior in more complex situations.

#### Adding Words

```imba
# [preview=lg]
css body d:flex fld:column jc:start ai:center p:5
css input bg:blue0 mb:1 rd:2 outline:none p:1 3 bd:1px solid blue3
	caret-color:blue4 bxs:sm bg@focus:blue1 transition:background 300ms
css div bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs
css button px:2 cursor:pointer c:blue5 outline:none c@active:gray4
# ---
let words = ["apple", "orange", "strawberry"]
let filtered_words = words
tag app
	@observable query = ""
	@autorun def search
		filtered_words = words.filter do $1.includes(query)
	def add_word
		words.push(query) if query
		query = ""
	<self>
		<input bind=query @keydown.enter=add_word>
		<button @click=add_word> "ADD"
		for word in filtered_words
			<div> word
# ---
imba.mount <app>
```

Notice how we don't have to call `search` after `query = ""`, we
can just change `query` freely and `search` gets invoked
automagically. When there are many different methods that can
change `query`, this becomes quite convenient.

It's also worth noting that if clearing `query` every time
`words` is changed were also part of our specification, we could
easily implement that with `@observable` and `@autorun` as well.
Feel free to try that out as an exercise!

#### The Computed Approach

`@autorun` is nice for calling functions, but in this example we
really only need a value, the computed array. If we want to get a
*value* rather than call a function, we can use `@computed`.
Let's simplify our running example a bit:

```imba
# [preview=lg]
css body d:flex fld:column jc:start ai:center p:5
css input bg:blue0 mb:1 rd:2 outline:none p:1 3 bd:1px solid blue3
	caret-color:blue4 bxs:sm bg@focus:blue1 transition:background 300ms
css div bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs
# ---
let words = ["apple", "orange", "strawberry"]
tag app
	@observable query = ""
	@computed get filtered_words
		words.filter do $1.includes(query)
	<self>
		<input bind=query>
		for word in filtered_words
			<div> word
# ---
imba.mount <app>
```

A getter decorated with `@computed` will be cached on first use
and will only be recomputed whenever any `@observable` properties
used by it change.

Notice how our `search` method and `filtered_words` variable
have been merged into one getter.

### Reference

#### @autorun

- Methods decorated with `@autorun` will be automatically invoked
	when any observable properties used by them change.
- Autorun in classes:
	- Will run immediately after instantiation.
	- Does not call `imba.commit` automatically.
- Autorun in tags:
	- Will run immediately after mount.
	- Automatically dispose on unmount.
- `@autorun` also accepts modifiers passed as an object, currently:
	- `@autorun(delay: 100ms)` will debounce invocations by the
		specified amount of time.

#### @computed

- Getters decorated with `@computed` will have their value cached
	on first use and will only recompute when any observable
	properties used by them change.

#### @lazy

- Getters decorated with `@lazy` will only be evaluated once and
	then return the resulting value forever after.

#### @action

- Methods prefixed with `@action` can update multiple observables
	without causing multiple `@autorun` calls or `@computed` cache
	invalidations.

#### Differences from MobX

- Imba doesn't do comparisons on the output of `@computed` values
	since rendering is already memoized.
- Since Imba integrates MobX at the language-level it supports
	features that are not possible in plain JS, currently:
	- Observable subclasses.
	- Autorunning methods that automatically dispose.

#### Misc

- These features are tree-shaken out of your built imba projects
	when they are not used.
