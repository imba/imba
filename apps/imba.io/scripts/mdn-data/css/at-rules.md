# At-rules

[data](https://github.com/mdn/data/blob/master/css/at-rules.json) |
[schema](https://github.com/mdn/data/blob/master/css/at-rules.schema.json)

An [at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule) is a CSS statement beginning with an at sign (@) that instructs CSS how to behave. There are several available identifiers defining what CSS should do in certain situations.

## Structure for simple at-rules

A simple at-rule object might look like this:

```json
"@myRule": {
  "syntax": "@myRule <myRule-condition> {\n <myRule-body> \n};",
  "groups": [
    "CSS myGroup"
  ],
  "status": "standard"
},
```

The 3 properties seen above are all required:

* `syntax` (string): This is the formal syntax of the at-rule and is usually found in the specification.
* `groups` (array of strings): CSS is organized in modules like "CSS Fonts" or "CSS Animations". MDN organizes features in these groups as well — `groups` should contain the name of the module(s) the at-rule is defined in.
* `status` (enum string): This is either `standard`, `nonstandard`, or `experimental` depending on the standardization status of the feature.

There are 3 more properties that are optional:
* `mdn_url` (string): a URL linking to the at-rule's page on MDN. This URL must omit the localization part of the URL (such as `en-US/`).
* `interfaces` (array of strings): These are the [CSSOM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model) interfaces that belong to the at-rule.
* `descriptors` (object): see below

## Structure for at-rules with descriptors

The `descriptors` object (when included) contains one or more objects that describe the different descriptors available on the at-rule. Look at `@font-face`, for example:

```json
"@font-face": {
  "syntax": "...",
  "interfaces": [],
  "groups": [],
  "descriptors": {
    "font-display": {
      "syntax": "[ auto | block | swap | fallback | optional ]",
      "media": "visual",
      "percentages": "no",
      "initial": "auto",
      "computed": "asSpecified",
      "order": "uniqueOrder",
      "status": "experimental"
    },
    "font-family": {
      "syntax": "<family-name>",
      "media": "all",
      "initial": "n/a (required)",
      "percentages": "no",
      "computed": "asSpecified",
      "order": "uniqueOrder",
      "status": "standard"
    }
  },
  "status": "standard"
}
```

Each `descriptors` object consists of 7 required properties:
* `syntax` (string): The syntax / possible values of the descriptor.
* `media` (string): The media groups the descriptor applies to, e.g. "all, visual" (multiple values are comma-separated).
* `percentages` (string or array of strings):
  * If it is an array, the elements are the other descriptors this descriptor is taking the percentages from (array elements must be in a descriptors list).
  * If it is a string, it indicates the percentage value of the descriptor.
* `initial` (string or array of strings):
  * If it is an array, the elements are the other descriptors this descriptor is taking the initial values from (array elements must be in a descriptors list).
  * If it is a string, it indicates the initial value of the descriptor.
* `computed` (string or array of strings):
  * If it is an array, the elements are the other descriptors this descriptor is computed from (array elements must be in a descriptors list).
  * If it is a string, it indicates the computed value of the descriptor.
* `order` (enum string): Either `orderOfAppearance` or `uniqueOrder`.
