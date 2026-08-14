# Command Line

> ! Run `npm -g install imba@latest` to get access to the CLI. Imba requires Node v20.19 or later.

Once installed, you have access to the `imba` command, which can execute scripts, serve files for development, and build projects for production. If you are starting from templates you might never be exposed to the underlying cli, and instead use commands like `npm run build` etc. But imba is a very capable language for writing everything from small scripts to large fullstack applications.

## imba _&#91;options&#93; script &#91;arguments&#93;_ [cli] [ultable] [h2]

The `imba` command is globally available and can be thought of as `node` on steroids. Just like you run your node scripts with `node script.js`, you run your imba scripts with `imba script.imba`. Behind the scenes Imba uses esbuild to compile _and_ resolve all the dependencies when running. If a `.env` file exists in your project root it is picked up automatically.

-   `-w, --watch`

    Watch for changes, rerunning the specified command when any related file changes. If you are fiddling with a script and want to rerun it after changes, all you need is `imba -w myscript.imba`.

-   `-d, --development`

    Use defaults for development: no minification, sourcemaps, watching with HMR, and `NODE_ENV="development"`.

-   `-p, --production`

    Use defaults for production: minified output, no sourcemaps, no HMR.

-   `-m, --minify`

    Enable minification of js and css files. Enabled by default for `imba build` and `--production`.

-   `-M, --no-minify`

    Disable minification. This is useful for configurations where minification is enabled by default, like for `imba build`.

-   `-s, --sourcemap`

    Include sourcemaps. Enabled by default unless building for production.

-   `-S, --no-sourcemap`

    Disable sourcemaps. This is useful for configurations where sourcemaps are enabled by default, like for `imba serve`.

-   `-f, --force`

    Disregard previously cached imba compilations and other optimizations and make sure all files are compiled now. Should only be needed for debugging.

-   `-v, --verbose`

    Increase log verbosity. Repeat to increase further — `-v` is equivalent to `--loglevel info`, `-vv` to `--loglevel debug`.

-   `--loglevel [level]`

    Set the log level explicitly: `debug`, `info`, `success`, `warning`, `error` or `silent`.

-   `-o, --outdir [dir]`

    Directory to output files. Defaults to `dist` for `imba build`; other commands write to a temporary directory.

-   `-k, --keep`

    Keep existing files in the output directory instead of clearing it.

-   `--base [prefix]`

    If you are deploying your project under a nested public path, specify the `base` option and all asset paths will be rewritten accordingly. Defaults to `/`.

-   `--assets-dir [dir]`

    Directory (relative to the output directory) where generated assets are written. Defaults to `assets`.

-   `--web`

    Build/run the script for clients. If you run an imba file with the `--web` argument it will automatically generate an accompanying html file and serve it up for your browser.

-   `--esm`

    Output ES module files. Since Imba bundles and resolves dependencies using esbuild this will not be needed in most cases.

-   `--bundle`

    Try to bundle all external dependencies into the output instead of resolving them from `node_modules` at runtime.

-   `--br`

    Also compress generated assets with brotli.

-   `-i, --instances [n]`

    If you specify n > 1, imba will run the script as a cluster and spawn _n_ instances. In development mode it will gracefully reload instances when the code has changed. Not applicable for `build`.

-   `--fork`

    Run instances as plain forks instead of a node cluster.

-   `--inspect`

    Start node with the inspector enabled so you can attach a debugger.

-   `--skipReloadingFor [glob]`

    While watching, skip reloading server code when files matching these globs change.

## imba build _&#91;options&#93; script_ [cli] [ultable] [h2]

The `imba build` command takes care of building your project for production. It builds an imba/js/html entrypoint and all of its dependencies, with production defaults (minified, no sourcemaps) unless overridden. In addition to the shared options above, `imba build` takes the following options:

-   `--platform [platform]`

    Platform for the entry. Defaults to `browser`.

## imba serve _&#91;options&#93; entry.imba | entry.html_ [cli] [ultable] [h2]

Convenience command for quickly serving up a script or an html page with an accompanying dev server with HMR and automatic reloading — equivalent to running an entry with `--web --watch`. Unless you specify a port it will pick a free port between 3000 and 3100.

-   `--port [port]`

    Specify the port to listen on.

-   `--host [host]`

    Specify the host to bind to. Pass `--host` without a value to bind to `0.0.0.0`.

-   `-i, --instances [n]`

    Run the server as a cluster with _n_ instances.

## npm create imba _&#91;options&#93; &#91;name&#93;_ [cli] [ultable] [h2]

Creates a new Imba project from a template. This is not part of the `imba` command itself — the scaffolder lives in the standalone [create-imba](https://www.npmjs.com/package/create-imba) package, run with `npm create imba@latest` (or `pnpm create imba` / `bun create imba` / `npx create-imba`). Run it without arguments for an interactive setup, or pass a project name (use `.` for the current directory).

-   `-t, --template [template]`

    Use a specific template instead of selecting one interactively: `default` (client only application), `express` (full stack application), `module` (a module usable from any JavaScript project) or `cli` (a CLI tool ready for npm publishing).

-   `-y, --yes`

    Say yes to any confirmation prompts.

-   `--fast`

    Generate a random project name, choose the default response for all prompts, and only print out the resulting directory name — useful for shell scripts.

## imba fmt _&#91;options&#93; &#91;formatters...&#93;_ [cli] [ultable] [h2]

Removes extra whitespace, debug logs, and commented logs from `**/*.imba` in your project.

-   `-f, --force`

    Format without checking git status first.

## imba info [cli] [ultable] [h2]

Prints helpful information about your imba installation and environment.
