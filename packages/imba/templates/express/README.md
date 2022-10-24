_Bootstrapped with [imba-base-template](https://github.com/imba/imba-base-template)._

Welcome to the Imba base template! Let's get you set up and ready to code!

This codebase has both backend and frontend code, all written in [Imba](https://imba.io).

**NOTE:** If all you need is a simple static website with no server logic, you can use [static hosting template](https://github.com/imba/imba-vite-template) instead.

The files are named `server.imba` and `client.imba` for simplicity. You can call them anything you want, and organize the code any way you like. As long as your `package.json` [uses your server file](https://github.com/imba/imba-base-template/blob/main/package.json#L4-L6) and your `index.html` [uses your client file](https://github.com/imba/imba-base-template/blob/main/app/index.html#L12), it will work.


## Available Scripts

In the project directory, you can run:

### `npm dev`

Runs the server and website in the development mode with hot reloading, linting and detailed error output in the console, and source maps.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. When you change your code, it will live reload.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run start`

Quickly fire up the website in production mode through NPM, like `npm run dev` but without any development settings. Will also run on [http://localhost:3000](http://localhost:3000), and can be a quick way to get started with running this site on your server.

However, [to run Imba in production](https://imba.io/guide/run-in-production) it is recommended to use [PM2](https://github.com/Unitech/pm2) to manage the Node process(es).
