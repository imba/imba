# Selectors

[data](https://github.com/mdn/data/blob/master/css/selectors.json) |
[schema](https://github.com/mdn/data/blob/master/css/selectors.schema.json)

[CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) define which elements CSS rulesets will be applied to.

## Structure for selectors

A selector object looks like this:

```json
"General sibling selectors": {
  "syntax": "A ~ B",
  "groups": [
    "Combinators"
  ],
  "status": "standard"
}
```

The three properties shown above are all required:
* `syntax` (string): The syntax of the selector (e.g. `::after` with two colons indicating a [pseudo-element](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Pseudo-classes_and_pseudo-elements#Pseudo-elements), `:hover` with one colon indicating a [pseudo-class](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Pseudo-classes_and_pseudo-elements#Pseudo-classes), or `A ~ B` indicating a [combinator](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Combinators_and_multiple_selectors#Combinators)).
* `groups` (array of strings): CSS is organized in modules like "CSS Units" or "CSS Lengths". MDN organizes features in these groups as well — `groups` should contain the name of the module(s) the selector is defined in.
* `status` (enum string): This is either `standard`, `nonstandard`, or `experimental` depending on the standardization status of the feature.

There is another property that is optional:
* `mdn_url` (string): a URL linking to the selector's page on MDN. This URL must omit the localization part of the URL (such as `en-US/`).
