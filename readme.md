


<a href="https://imba.io" target="_blank">
  <img width="200" src="https://github.com/imba/branding-imba/blob/555b21940fa796fbf0eed44df48160d450ca894b/mascot/mascot-full-yellow.png">
</a>

# Imba

[![Join the chat at https://discord.gg/mkcbkRw](https://img.shields.io/badge/discord-chat-7289da.svg?style=flat-square)](https://discord.gg/mkcbkRw)
[![install size](https://packagephobia.now.sh/badge?p=imba)](https://packagephobia.now.sh/result?p=imba)
[![Downloads](https://img.shields.io/npm/dm/imba.svg)](https://npmcharts.com/compare/imba?minimal=true) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![License](https://img.shields.io/npm/l/imba.svg)](https://www.npmjs.com/package/imba)

Imba is a friendly full-stack programming language for the web that compiles to performant JavaScript.
It has language-level support for defining, extending, subclassing, instantiating and rendering DOM nodes.

---

## Get started

```sh
npx imba create
```

## Documentation

To get started with Imba, we recommend reading through the [official guide](https://imba.io/).

## Why Imba?

### Minimal syntax

Imba's syntax is minimal, beautiful, and packed with clever features. It combines logic, markup and styling in a powerful way. Fewer keystrokes and less switching files mean you'll be able to build things fast.

![ "basics"](https://user-images.githubusercontent.com/8467/121170829-074a8900-c856-11eb-88d9-d4a922c24893.png)

### Runs on both server and client

Imba powers both the frontend and the backend of Scrimba.com, our learning platform with 100K+ monthly active users. On the frontend, Imba replaces e.g., Vue or React, and on the backend, it works with the Node ecosystem (e.g., npm).

![ "server"](https://user-images.githubusercontent.com/8467/121170852-0fa2c400-c856-11eb-8aab-322d4b6a875d.png)

### Integrated styling

Inspired by Tailwind, Imba brings styles directly into your code. Styles can be scoped to files, components, and even parts of your tag trees. Style modifiers like @hover, @lg, @landscape and @dark can be used for extremely concise yet powerful styling.

![ "styles"](https://user-images.githubusercontent.com/8467/121170905-1e897680-c856-11eb-8b67-2014f0c508e6.png)

### Blazing fast, Zero config

Imba comes with a built-in bundler based on the blazing fast esbuild. Import stylesheets, images, typescript, html, workers and more without any configuration. Bundling is so fast that there is no difference between production and development mode - it all happens on-demand.

![ "bundling"](https://user-images.githubusercontent.com/8467/121170927-247f5780-c856-11eb-95bf-fa09ca5f8cff.png)

When you run your app with the `imba` command, it automatically bundles and compiles your imba code, along with typescript, css and many other file types. It provides automatic reloading of both the server and client.

### Typing and tooling

The tooling is implemented as a typescript server plugin giving us great intellisense, diagnostics, and even cross-file refactorings that works with js/ts files in the same project. You can import types just like in typescript, and annotate variables, parameters and expressions. Like the language, the tooling is still in alpha, but improving every day.

![ "types"](https://user-images.githubusercontent.com/8467/121170940-29440b80-c856-11eb-82bb-ac821d0d0c36.png)

## Community

For questions and support, please use our community chat on
[Discord](https://discord.gg/mkcbkRw).

## License

[MIT](./LICENSE)

Copyright (c) 2015-present, Sindre Aarsaether
