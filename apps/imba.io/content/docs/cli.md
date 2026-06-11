# Command Line

> ! Run `npm -g install imba@latest` to get access to the CLI

Once installed, you have access to the `imba` command, which can execute scripts, serve files for development, and build projects for production. If you are starting from templates you might never be exposed to the underlying cli, and instead use commands like `npm run build` etc. But imba is a very capable language for writing everything from small scripts to large fullstack applications.

## imba _&#91;options&#93; script &#91;arguments&#93;_ [cli] [ultable] [h2]

The `imba` command is globally available and can be thought of as `node` on steroids. Just like you run your node scripts with `node script.js`, you run your imba scripts with `imba script.imba`. Behind the scenes Imba uses esbuild to compile _and_ resolve all the dependencies when running.

-   `-m, --minify`

    Enable minification of js and css files. Defaults to false for `--development`,Defaults to `true` unless `--development` is set.

-   `-s, --sourcemap`

    Include sourcemaps. Defaults to `true` unless `--production` is set.

-   `-w, --watch`

    Watch for changes, rerunning the specified command when any related file changes. If you are fiddling with a script and want to rerun it after changes, all you need is `imba -w myscript.imba`.

-   `-f, --force`

    Disregard previously cached imba compilations and other optimizations and make sure all files are compiled now. Should only be needed for debugging.

-   `-v, --verbose`

    Disregard previously cached imba compilations and other optimizations and make sure all files are compiled now. Should only be needed for debugging.

-   `--base [prefix]`

    If you are deploying your project under a nested public path, specify the `base` option and all asset paths will be rewritten accordingly.

-   `-M, --no-minifiy`

    Disable minification. This is useful for configurations where minification is enabled by default, like for `imba build`.

-   `-S, --no-sourcemap`

    Disable sourcemaps. This is useful for configurations where sourcemaps are enabled by default, like for `imba serve`, `imba-dev`.

-   `-d, --development`

    Builds file with the `NODE_ENV="development"`, as well as including additional code to make debugging your imba projects easier.

-   `-p, --production`

    Build/run the script for clients. If you run an imba file with the `--web` argument it will automatically generate an accompanying html file and serve it up for your browser.

-   `-i, --instances [n]`

    If you specify n > 1, imba will run the script as a cluster and spawn _n_ instances. In development mode it will gracefully reload instances when the
    code has changed. Currently not applicable for `build`.

-   `--esm`

    Executes the script as a module. Only supported on Node v14.13+. Since Imba bundles and resolves dependencies using esbuild this will not be needed in most cases.

-   `--web`

    Build/run the script for clients. If you run an imba file with the `--web` argument it will automatically generate an accompanying html file and serve it up for your browser.

-   `--target [targets]`

    Specify the target environment(s). When running, imba will automatically target your local node version.

## imba build _&#91;options&#93; &#91; script &#93;_ [cli] [ultable] [h2]

The `imba build` command takes care of building your project for production. In addition to all options from `imba`, `imba build` takes the following options:

-   `-o, --outdir [dir]`

    Specify the output directory (relative to project root). Defaults to `dist`

-   `-k, --keep`

    Once installed, you have access to the `imba` command, which can execute scripts, serve files for development, and build projects for production.

## imba serve _&#91;options&#93; &#91; entry.imba | entry.html &#93;_ [cli] [ultable] [h2]

Convenieve command for quickly serving up a script or an html page with an accompanying dev server with HMR and automatic reloading. It is an alias for `imba --web --watch --development entry`.

## imba create _&#91; project-name &#93;_ [cli] [ultable]

Command for quickly creating a new imba project based on a template.
