# Types

[data](https://github.com/mdn/data/blob/master/css/types.json) |
[schema](https://github.com/mdn/data/blob/master/css/types.schema.json)

[CSS basic data types](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Types) define the kinds of values (keywords and units) accepted by CSS properties and functions.

## Structure for types

A type object looks like the following example.

```json
"length": {
  "groups": [
    "CSS Types"
  ],
  "status": "standard"
},
```

The 2 properties are both required.
* `groups` (array of strings): CSS is organized in modules like "CSS Types" or "CSS Color". MDN organizes features in these groups as well — `groups` should contain the name of the module(s) the type is defined in.
* `status` (enum string): This is either `standard`, `nonstandard`, or `experimental` depending on the standardization status of the feature.

There is another property that is optional:
* `mdn_url` (string): a URL linking to the type's page on MDN. This URL must omit the localization part of the URL (such as `en-US/`).
