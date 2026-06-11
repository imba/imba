# Incremental Adoption

> If you have any questions or even information that you feel
should be added to this guide, please don't hesitate to reach out
on [Discord](https://discord.gg/mkcbkRw) or [Github](https://github.com/imba/imba). We want to save prospective
users time.

Since Imba compiles to readable JavaScript, including arbitrary
Imba code in your existing project is very easy. Moreover, since
Imba components are actual custom elements, you can use them with
both plain HTML projects and most JavaScript UI framework
projects (React, Vue, Svelte, etc.)

## Step 1: Importing Imba Files To Non-Imba Projects

Choose one of the following methods depending on the
configuration of your existing non-Imba project and your
preference.

### With Vite

The easiest way to use Imba in your existing non-Imba project is
with [Vite](https://vitejs.dev/). If your existing project
doesn't use Vite, try
[#with-npm](#step-1-importing-imba-files-to-nonimba-projects-with-npm)
instead (or consider switching to Vite 😝).

- Add `imba` and `vite-plugin-imba` to your existing project:
	```bash
	npm i -D imba vite-plugin-imba
	```

- In `vite.config.js` import the Imba plugin:

	```js
	import { imba } from 'vite-plugin-imba'
	```

- And add `imba()` to the list of plugins:

	```js
		plugins: [vue(),imba()],
	```

That's it. Just by adding the Vite plugin to your existing app,
you can now import from Imba files just as you would from
JavaScript files, without any additional configuration:

### With NPM

- Run:

	```bash
	cd non-imba-project
	npx imba create imba-project
	# choose the module template
	npm i ./imba-project
	npm pkg set scripts.build-imba='cd ./imba-project && npm run build'
	npm run build-imba
	```

	> Note that the `./` in `npm i ./imba-project` is required to tell `npm` that we are
	installing a local package.

- Anywhere in your non-Imba project, import the Imba package as
	you would any npm package with

	```js
	import 'imba-project'
	```

	> Note that this import is not using the folder
	name `imba-project`, it's using the `"name"`
	field from the `./imba-project/package.json` file.

### With Modules

If you use eslint, this option may not work without disabling
some rules, which is why
[#with-npm](#step-1-importing-imba-files-to-nonimba-projects-with-npm)
is recommended.

- In your non-Imba project, run:

	```bash
	npx imba create imba-project
	# choose the module template
	npm pkg set scripts.build-imba='cd ./imba-project && npm run build'
	npm run build-imba
	```

	> Note that you should replace `./imba-project` with the actual
	relative path to your Imba project from your non-Imba project
	root.

- Import the Imba project into your non-Imba project as a module via:

	```js
	import './imba-project'
	```

### With Script Tags

- In your non-Imba project, run:

	```bash
	npx imba create imba-project
	# choose the module template
	cd imba-project
	npm run build
	```

- In your non-Imba project's `index.html` file, source the
Imba project's bundle with a script tag:

	```html
	<script src="imba-project/dist/index.js"></script>
	```

### With Imbac

This approach is most fitting for single files and simple use
cases, but It's a good option to be aware of if you're
considering adopting Imba.

You can compile Imba files individually by using `imbac`:

```bash
npx -p imba imbac file.imba
# results in file.js
```

Or if you've installed Imba globally with `npm i -g imba`, you
can just do:

```bash
imbac file.imba
```

The resulting JavaScript file may depend on importing `imba` to
your project, in which case you'll need to add the dependency:

```bash
npm i -D imba
```

## Step 2: Component Development Workflow

### With Vite

If your non-Imba project uses Vite, you don't need to do anything
special. Everything works out of the box; develop both Imba and
non-Imba files as you normally would with the Vite dev server.

### Without Vite

If your non-Imba project doesn't use Vite, you'll have to build
your Imba app every time you make changes to it. Luckily, the
Imba module template can just watch for changes:

```bash
cd ./imba-project
npm run watch
```

That's all you need to do.

If you instead want to develop your Imba component separately and
include it in your app later, you can just use the module
template's dev server:

```
cd ./imba-project
npm run dev
```

Once you're done developing the Imba component, just run `npm run
build` and go back to developing your non-Imba app.

## Step 3: Using Imba Exports And Components

### Exports

Since Imba compiles to JavaScript, you can import from Imba
files/projects the same way you would from JavaScript
files/projects depending on your configuration:

```imba
# main.imba
export let state = { count: 0 }
export def increment
	state.count++
```

```js
// js

// If you used Vite
import { state, increment } from './main.imba'

// If you used NPM
import { state, increment } from 'imba-project'

// If you used Modules
import { state, increment } from './imba-project'

// If you used `imbac`
import { state, increment } from './main.js'
```

### Components

Once your Imba file is imported, using its components is as
simple as appending their names with `-tag`. **You don't need to
explicitly import or export the tags**, as long as an Imba file
containing tags gets imported, its custom elements will be
registered.

For example, the default Imba module template has a
tag `app` in its `main.imba` file. To use it, we'd import the
Imba file and then do:

```js
// React, Vue, Svelte, etc.
<app-tag/>
```

Or, if the tag name already has a dash in it, you don't need to append
`-tag`:

```js
// React, Vue, Svelte, etc.
<hello-world/>
```

## Step 4: Interacting With Imba Components

This step may not be necessary if your Imba component only uses
its own state, but in situations where your non-Imba app needs to
interact with Imba components, you'll need to know how to render
changes and share state.

> If you have any suggestions for this guide, including both practical
and framework-specific, please don't hesitate to reach out on
[Discord](https://discord.gg/mkcbkRw) or [Github](https://github.com/imba/imba).

### Rendering Changes

#### Updating Imba Components

Updating *all* Imba components to reflect *any* state change is
as simple as calling `imba.commit`. You don't need to use special
`setState` functions or single out specific changes or
components, just use `imba.commit` whenever any Imba components
need to be updated.

Normally, Imba calls `commit` for you after every handled event.
However, In the case where an event is triggered by a non-Imba
component, you can call it manually:

```js
// js
import { state } from 'imba-project'
state.count += 1
globalThis.imba.commit()
```

`imba` is automatically defined on the `globalThis` object
whenever an Imba tag is registered. So as long as you import an
Imba file that contains a tag, `globalThis.imba` will be defined.

#### Updating Non-Imba Components

If your non-Imba app's state is changed by an Imba component, you
may want to reflect that in your non-Imba views. You'll likely
have to do so in accordance with whatever state management system
your app is using. Whether that involves using a `setState`
method or something else, you can expose functions and variables
to your Imba projects through one of the following methods.

### Sharing State

State local to Imba files and tags will function as you would
expect out of the box. However, in some cases we may want our
Imba component to reflect the state of our non-Imba app. As such,
we need a good way to pass data to our Imba components.

#### Imports With Vite

As usual, if you're using Vite this works out of the box;
you can just export a state variable from a JavaScript file
and import that to an Imba file, and vice-versa.

Just remember to call `imba.commit` whenever a state change
that affects an Imba component is caused by a non-Imba component.

#### Imports Without Vite

In your Imba module or compiled file you can import from
JavaScript files.

```imba
# imba
import state from '../../src/main.js'
```

#### Attributes

You can declare attributes with `attr`:

```imba
# imba
tag app
	attr count
	<self@click=count++> "count is {count}"
```

Then in your non-Imba app you can pass data with the attribute:

```js
// js
<app-tag count={20} />
```

> To pass objects as attributes
you can use `JSON.stringify` and `JSON.parse`.

#### Props

If you're able to get a reference to an element,
you can set the props directly:

```js
// js
// <app-tag id='my-app'>
let el = document.getElementById('my-app')
el.count += 1
```

#### Global

Another option is using the `globalThis` object.
In Imba, `global` compiles to `globalThis`:

```imba
# imba
global.count = 0
tag app
	<self@click=global.count++> "count is {global.count}"
```

Then in your non-Imba app you can read and write to `globalThis`:

```js
// js
globalThis.count += 1
```

**No named imports or exports required.**

Though, you may not want to have a property as unspecific as
`count` on `globalThis`. We can use something like `imba_state`
instead:

```imba
# imba
global.imba_state = { count: 0 }
tag app
	<self@click=global.imba_state.count++> "count is {global.imba_state.count}"
```

But typing that over and over will get old fast.
Let's assign it to a variable:

```imba
# imba
global.imba_state = { count: 0 }
let state = global.imba_state

tag app
	<self@click=state.count++> "count is {state.count}"
```

In our non-Imba app:

```js
// js
let state = globalThis.imba_state
state.count += 1
```

See our state management guide (TBA) for more general state
management tips.
