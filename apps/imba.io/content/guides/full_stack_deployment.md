# Full Stack Deployment

On the server, the recommended way is to use [Express](https://expressjs.com/), but anything in the JavaScript ecosystem is available to you.

There's a whole world of advice about how to structure Express applications, how to run Node.js in production, and keeping a website stable. From our experience of using Imba in production at [Scrimba](https://scrimba.com), we recommend using [PM2](https://github.com/Unitech/pm2). 

The [PM2 quick start](https://pm2.keymetrics.io/docs/usage/quick-start/) is a great way to get familiar with PM2. To keep this production Imba guide complete, we'll repeat some of that here. Always look to PM2's own documentation for the most up to date details.

Starting an Imba application with PM2 is as simple as `pm2 start app.js`, but we need to build the application first. Optionally, we can use a `ecosystem.config.js` file to configure PM2, for example using multiple processes, and where to write the server logs.

## Preparing the server

Setting up an entire server is beyond the scope of this guide. This is exactly the kind of thing you'll want to set up: [How To Set Up a Node.js Application for Production on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)

If you've followed that guide, the server is ready to go with Node.js!

If not, you'll need to at least install and set up the following so you can run a Node.js script on your server:

- [Node.js and NPM](https://nodejs.org/). We currenly recommend v18 for full stack Imba, or v16 for static sites. Some static site hosts don't have v18 support yet.
- [PM2](https://pm2.keymetrics.io/). We strongly recommend using a process manager for Node, and PM2 is great.
- [nginx](https://nginx.org/en/docs/).

## Preparing your project for production

Although you can run Imba code directly with `imba your-imba-file.imba`, we strongly recommend building the files for production and using PM2 to run them.

The [Full stack starter](https://github.com/imba/imba-base-template) already comes with these settings configured, but if you're setting your project up by hand, you will need:

- A `ecosystem.config.js` file to configure PM2 to run the way you want: [Example ecosystem.config.js file](https://github.com/imba/imba-base-template/blob/main/ecosystem.config.js).
- A command to build the application for production mode: Add `"build": "imba build --production server.imba"` to your `package.json`.
- A way to start your application **the first time**: Add `"start": "pm2 start ecosystem.config.js --env=production"` to your `package.json`.
- A way to reload your application when the code has been updated: Add `"reload": "npm run build && pm2 reload ecosystem.config.js"` to your `package.json`.

Now you have a `package.json` file that has at least these scripts:

```json
  "scripts": {
    "dev": "imba -wMS src/server.imba",
    "build": "imba build --production src/server.imba",
    "reload": "npm run build && pm2 reload ecosystem.config.js",
    "start": "pm2 start ecosystem.config.js",
  }
```

And an `ecosystem.config.js` file that looks like this:

```js
module.exports = {
  apps : [{
    name   : "imba-base-template",
    script: "./dist/src/server.loader.js",
  }]
}
```

With this set up, you're ready to start your application: 

1. Upload your code to your server, for example using [GitHub Actions](https://docs.github.com/en/actions).
2. Run `npm install` in your project.
3. Run `npm run build` to build your application.
4. Run `npm start` to start up PM2 for the first time. If you get a `command not found` error, make sure you've installed PM2 globally on your server with `npm i -g pm2`.
5. All done! From now on, whenever you update the code of your project, you can run `npm run reload` to build your application again, and have PM2 use the new version of the code.

Congratulations on setting up your Imba application! You can now inspect your application with `pm2 logs` and update it with `npm run reload`.
