# create-imba

Scaffold a new [Imba](https://imba.io/) project.

```sh
npm create imba@latest
```

Also works with `pnpm create imba`, `bun create imba`, or `npx create-imba`.

## Usage

```
create-imba [name] [options]
```

Run without arguments for an interactive setup, or pass a project name (use `.` for the current directory).

| Option | Description |
| --- | --- |
| `-t, --template [template]` | Use a specific template: `default`, `express`, `module` or `cli` |
| `-y, --yes` | Say yes to any confirmation prompts |
| `--fast` | Random project name, default answers, print only the resulting directory (for shell scripts) |
| `-v, --version` | Print the create-imba version |
| `-h, --help` | Show help |

## Templates

- **default** — client only application
- **express** — full stack application with an Express server
- **module** — a module that can be used in any JavaScript project
- **cli** — a CLI tool ready for npm publishing
