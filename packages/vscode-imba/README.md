# Visual Studio Code Language Support for Imba

Imba is programming language for building amazing full-stack webapps. You can
use it on the server and client. To learn more about Imba visit [https://imba.io](https://imba.io)

For the best experience, install the [typescript nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) extension for vscode. The imba languageserver utilizes functionality from the latest version of typescript for auto imports++

This extension provides you with

- Contextual Syntax highlighting, discover errors easier.
- A Scrimba theme that a good default look if you want.
- Better autocompletion, it even works for CSS blocks.

# Usage with legacy (imba 1) files

To make the extension play nice with legacy code you can add project-specific vscode settings in *project*/.vscode/settings.json and add:
```json
{
    "files.associations": {
        "*.imba": "imba1"
    }
}
```

## Known issues

- Slow startup
- Occasional slowdowns
- Missing import completions
- Missing completions for import paths
- Missing previews for style completions
- Many refactoring actions are broken
- Completions broken for dashed variables names (ie. `my-var-name`)
- Needs a jsconfig/tsconfig in your project folder