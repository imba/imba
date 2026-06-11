# [Imba.io](https://imba.io/)
Imba's official website and documentation.

# Contributing

Contributions are highly appreciated. The easiest way to
contribute to the documentation is by editing
[/content/docs/undocumented.md](/content/docs/undocumented.md).

This includes:

- Polishing any of the undocumented examples or creating your own
	examples.

- Moving examples from undocumented to a relevant location on the
	documentation.

- Coming up with proper names for undocumented features with
	ambiguous names.

For big changes it's best to ask first. You can reach out to us
on [Discord](https://discord.gg/mkcbkRw) or create an issue here
on Github. We don't bite!

## Installation

Fork the repository, then:

```bash
git clone https://github.com/your-fork/imba.io
cd imba.io
npm i
npm run dev
```

## Contributing Guide

### Adding Documentation
You can find the main documentation in [`/content/docs/`](/content/docs/).

See our proprietary markdown syntax guide [below](#markdown-syntax).

### Adding API Reference Examples
To add your own example, add it to [`/content/examples/api/`](/content/examples/api/).

The API docs are unique in that they are automatically included
as examples for any of the language constructs they use.

So, if you add an example that contains `@intersect.in`,
you don't have to do anything special, the build scripts
will automatically include your example on the `@intersect.in`
API reference page, and on the pages of any other constructs
your example uses.

### Editing The Navbar
The navbar is parsed from the markdown in [`/content/nav.md`](/content/nav.md).
Just copy the formatting used for other documents.
Your markdown page must start with an h1 such as `# Hello`.

### Markdown Syntax
We've added some proprietary markdown syntax,
especially to help with code snippets.
The code that parses snippets and related options can be found
in [`src/components/app-code.imba`](src/components/app-code.imba)

#### Options
You can specify options by placing a comment
on the first line of an imba snippet.
Multiple options can be specified.

````
```imba
# [preview=md] [windowed] [titlebar] [title=Test]
console.log "code goes here"
```
````

Available options are:

- App previews

	```
	# [preview=md]
	```
	This will show a preview of the app under your snippet.
	Available preview sizes are `sm`, `md`, `lg`, and `xl`.

- Console previews
	```
	# [preview=console]
	```
	This will show a preview of any values logged by the snippet.

- Style previews
	```
	# [preview=styles]
	```
	This will show a preview like the one at the top of the
	[color page](https://imba.io/docs/css/values/color).

- Windowed previews
	```
	# [preview=md] [windowed]
	```
	This will show your code in a floating window rather than
	directly under your snippet.

- Hiding parts of a snippet

	You can hide the beginning and end of a snippet with `# ---`:
	````
	```imba
	global css body bg:blue2 # This code will be hidden
	# ---
	tag app
		<self>
			"lol"
	# ---
	imba.mount <app> # This code will be hidden
	```
	````

	The hidden code will still affect any preview,
	and will still be included in the code when users click `open` on a snippet.

- Tabs & Multiple Files

	You can assign a filename to snippets by writing it after
	the start of a snippet:
	````
	```imba main.imba
	console.log "lol"
	```
	````

	If you create two named snippets in succession,
	it will create a snippet with tabs where the files can
	import from and export to eachother and whatnot.

	If you name a snippet `main.imba`
	it automatically shows a medium preview window.

- Snippet From Folder With `[demo]`

	You can also create a folder and refer to it with:
	```
	[demo](/path/to/folder)
	```

	You can supply options in the URL:
	```
	[demo](/examples/simple-clock?&windowed=1&title=Clocks&ar=1)
	```

- Tip boxes
	```
	> [tip box yellow]
	```
	This will show a yellow tip box, useful for "experimental" warnings
	and whatnot.

- Misc

	If you have questions about any of these, reach out to us.
	```
	[title=sync( data, xname = 'x', yname = 'y' )]
	[example=ImbaTouch.@moved-x]
	[titlebar]
	[route=/home]
	[dir]
	[footer]
	[url=https://example.com]
	```
