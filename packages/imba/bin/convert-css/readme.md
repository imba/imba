# convert-css

This is a script that takes a string of css on stdin
and outputs imba css on stdout.

## Installation

```
npm link
```

The binary will be available as `css`.

## Usage

Until this is integrated into tooling,
on MacOS you can pipe the output to your clipboard:

```sh
pbpaste | css | pbcopy
```

## Todo

- Convert px to imba units?
- Convert colors to imba colors?
- Convert `p:0 8px` to `py:0 px:2`?
- Convert `w:1 h:1` to `s:1`
- If there are repeat values (such as `p:10 pr:5`), preserve order.
