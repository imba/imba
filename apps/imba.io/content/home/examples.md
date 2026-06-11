# Smart, Beautiful, Minimal

Imba's syntax is minimal, beautiful, and packed with clever features. Less keystrokes, and less switching files means you'll be able to build things fast.

[demo](/examples/paint/app.imba?preview=md&dir=1&titlebar=1&windowed=1&title=Paint%20Demo)

> There is no hidden code or stylesheets here. What you see is what you get.

# Full-stack language

Imba is neither an academic exercise or a toy project. We've built Imba over many years to build the frontend *and* backend of scrimba.com. Our goal has always been to create the most fun and powerful language for creating rich web applications.

[demo](/examples/express/app.imba?dir=1&preview=md&windowed=1&title=HN%20Clone&url=https://simple-hn.imba.io/top)

Imba works just as well on the server as on the client. It interoperates fully with the npm + node ecosystem. The whole stack of [Scrimba](https://scrimba.com) is written in Imba.

# Styling Evolved

Inspired by tailwind, Imba brings styles directly into your code. Styles can be scoped to files, components, and even parts of your tag trees. [Style modifiers](/docs/css/modifiers) like `@hover`, `@lg`, `@landscape` and `@dark` can be used for extremely concise yet powerful styling.

[demo](/examples/simple-clock?&windowed=1&title=Clocks&ar=1)

Styles can also be set directly on elements. Inline styles works with all modifiers.

[demo](/examples/clock?&windowed=1&title=Clocks&ar=1)


# Blazing fast, Zero config

Imba comes with a built-in bundler based on the blazing fast [esbuild](https://esbuild.github.io/). Import stylesheets, images, typescript, html, workers and more without any configuration. Bundling is so fast that there is no difference between production and development mode - it all happens on-demand.

[demo](/examples/tic-tac-toe?windowed=1&title=Tic-tac-toe)

# Getting Started

Getting started with Imba is as simple as running `npx imba create` in
your terminal. See our
[getting started](docs/start)
page for more information about learning Imba, getting help, and
tooling.

# Basic Syntax [quick-tour]

```imba
let number = 42
let bool = yes

# strings
let string = 'the answer is 42'
let dynamic = "the answer is {number}"
let template = `the answer is {number}`

# dimensions
let length = 20px
let duration = 150ms

let regex = /answer is (\d+)/
let array = [1,2,3]
let object = {name: 'Imba', type: 'language'}
```

```imba
class Todo
    # properties
    title
    completed = no
    due = null

    # methods
    def complete
        completed = yes

    # getters
    get overdue
        due and due < new Date

let todo = new Todo title: 'Read introduction'
```

```imba
# elements are first class citizens
const list = <ul title="reminders">
    <li> "Remember milk"
    <li> "Greet visitor"

# setting classes on elements
<div.panel.large> "Hello world"
# setting dynamic and conditional classes
<div.panel.state-{state} .hidden=condition> "Panel"
# binding handlers (with modifiers)
<div.panel @click.prevent=handler> "Panel"
```

```imba
# looping over iterables
for {id,name} of iterable
    "{name} has id {id}"

# looping over Object.keys/values pairs
for own key,value of object
    [key,value]

# fast looping over arrays
for member,index in array
    member
```

# Join us!

We are a small but active community of early Imba users. Jump on our [Discord](https://discord.gg/mkcbkRw) to say hi! Recordings of all our community meetings can be found on the official Imba [YouTube Channel](https://www.youtube.com/playlist?list=PLf1a9PYKGPdl3OMBHV72Oz23eFy9q51jJ).

Imba has been under active development for 6+ years now, and activity is only ramping up. We're looking for contributors who would like to help improve documentation and the ecosystem around Imba.

Everyone is welcome to the community meetings (via Zoom)! This is a great place to report your issues, hangout and talk about your project using Imba. For the exact meeting times please use the [Meetup group](https://www.meetup.com/Imba-Oslo-Meetup), this is where you can see the timezone, cancellations, etc.
