# Inheritance

[data](https://github.com/mdn/data/blob/master/api/inheritance.json) |
[schema](https://github.com/mdn/data/blob/master/api/inheritance.schema.json)

Interfaces of Web APIs can inherit from other interfaces or implement [mixins](https://developer.mozilla.org/en-US/docs/Glossary/Mixin). For each interface, this data informs about the inherited (parent) interface and the implemented mixins.

## Structure for inheritance data of a specific name

The overall inheritance data is an object with one property per interface.
Each interface entry looks like the following example (E.g. for the DocumentFragment interface).

```json
"DocumentFragment": {
  "inherits": "Node",
  "implements": [
    "ParentNode",
    "LegacyQueryInterface"
  ]
}
```

The 2 properties are both required.
* `inherits` (a string or null): the name of the interface it inherits properties and methods from. If null, it means it doesn't inherit from any interface.
* `implements` (array of strings): the list of mixins the interface implements. The array can be empty.
