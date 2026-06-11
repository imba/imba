# Syntaxes

[data](https://github.com/mdn/data/blob/master/css/syntaxes.json) |
[schema](https://github.com/mdn/data/blob/master/css/syntaxes.schema.json)

[CSS value definition syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax) is used for the formal syntax of CSS properties. The syntaxes.json file defines many of these CSS syntaxes.

For example, the `background-attachment` property has the following syntax where `<attachment>` is referring to a syntax that is defined in syntaxes.json.

Definition of `background-attachment` in properties.json:

```json
"background-attachment": {
  "syntax": "<attachment>#"
}
```

Definition of `<attachment>` in syntaxes.json:

```json
"attachment": {
  "syntax": "scroll | fixed | local"
},

```

CSS syntaxes might be more complex than just keywords separated by a pipe (`|`). For example, the syntax might contain values that are referencing
[CSS types](https://github.com/mdn/data/blob/master/css/types.md):

```json
"alpha-value": {
  "syntax": "<number> | <percentage>"
},
```

Or, syntaxes might reference other syntaxes that are also defined in syntaxes.json:

```json
"length-percentage": {
  "syntax": "<length> | <percentage>"
},
"shape-radius": {
    "syntax": "<length-percentage> | closest-side | farthest-side"
},
```

For more information about the formal grammar of CSS syntaxes, see [CSS value definition syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax).
