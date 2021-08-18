<p align="center">
<a href="https://imba.io" target="_blank">
<img width="300" src="https://github.com/imba/brand/blob/master/imba-web-logo.png"></a>
</p>

[![install size](https://packagephobia.now.sh/badge?p=imba)](https://packagephobia.now.sh/result?p=imba)
[![Build Status](https://travis-ci.org/imba/imba.svg?branch=master)](https://travis-ci.org/imba/imba) [![Downloads](https://img.shields.io/npm/dm/imba.svg)](https://npmcharts.com/compare/imba?minimal=true) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![License](https://img.shields.io/npm/l/imba.svg)](https://www.npmjs.com/package/imba)

Imba is a friendly full-stack programming language for the web that compiles to performant JavaScript.
It has language level support for defining, extending, subclassing, instantiating and rendering DOM nodes.

## Get started

```
npx imba create hello-world
cd hello-world
npm start
```

## Documentation

To get started with Imba, we recommend reading through the [official guide](https://imba.io/).


## Why Imba?

### Minimal syntax

Imba's syntax is minimal, beautiful, and packed with clever features. It combines logic, markup and styling in a powerful way. Less keystrokes, and less switching files means you'll be able to build things fast.

![ "basics"](https://user-images.githubusercontent.com/8467/121170829-074a8900-c856-11eb-88d9-d4a922c24893.png)

### Runs on both server and client

Imba powers both the frontend and the backend of Scrimba.com, our learning platform with 100K+ monthly active users. On the frontend, Imba replaces e.g. Vue or React, and on the backend, it works with the Node ecosystem (e.g. npm).

![ "server"](https://user-images.githubusercontent.com/8467/121170852-0fa2c400-c856-11eb-8aab-322d4b6a875d.png)

### Integrated styling

Inspired by tailwind, Imba brings styles directly into your code. Styles can be scoped to files, components, and even parts of your tag trees. Style modifiers like @hover, @lg, @landscape and @dark can be used for extremely concise yet powerful styling.

![ "styles"](https://user-images.githubusercontent.com/8467/121170905-1e897680-c856-11eb-8b67-2014f0c508e6.png)

### Blazing fast, Zero config

Imba comes with a built-in bundler based on the blazing fast esbuild. Import stylesheets, images, typescript, html, workers and more without any configuration. Bundling is so fast that there is no difference between production and development mode - it all happens on-demand.

![ "bundling"](https://user-images.githubusercontent.com/8467/121170927-247f5780-c856-11eb-95bf-fa09ca5f8cff.png)

When you run your app with the `imba` command it automatically bundles and compiles your imba code, along with typescript, css and many other file types. It provides automatic reloading of both the server and client.

### Typing and tooling

The tooling is implemented as a typescript server plugin giving us great intellisense, diagnostics, and even cross-file refactorings that works with js/ts files in the same project. You can import types just like in typescript, and annotate variables, parameters and expressions. Like the language, the tooling is still in alpha, but improving every day.

![ "types"](https://user-images.githubusercontent.com/8467/121170940-29440b80-c856-11eb-82bb-ac821d0d0c36.png)

## Community

 [![Forum](https://img.shields.io/badge/discourse-forum-brightgreen.svg?style=flat-square)](https://users.imba.io) [![Join the chat at https://discord.gg/mkcbkRw](https://img.shields.io/badge/discord-chat-7289da.svg?style=flat-square)](https://discord.gg/mkcbkRw)

### Imba Community Meeting

Everyone is welcome! This is a great place to report your issues, hangout and talk about your project using Imba. If you have an open pull request which has not seen attention, you can ping during the meeting.

For the exact meeting times please use the Meetup group [Imba Oslo Meetup](https://www.meetup.com/Imba-Oslo-Meetup), this is where you can see the timezone, cancellations, etc.

You can join us remotely via [Zoom](https://us04web.zoom.us/j/230170873).

Did you miss a meeting? No worries, catch up via the [meeting notes](https://bit.ly/2JyjGM1) or [video recordings](https://www.youtube.com/playlist?list=PLf1a9PYKGPdl3OMBHV72Oz23eFy9q51jJ).

### Chat

For questions and support please use our community chat on
[Discord](https://discord.gg/mkcbkRw).

## License

[MIT](./LICENSE)

Copyright (c) 2015-present, Sindre Aarsaether
