(class_declaration
  "class" @context
  name: (class_name) @name) @item

(tag_declaration
  "tag" @context
  name: (identifier) @name) @item

(mixin_declaration
  "mixin" @context
  name: (identifier) @name) @item

(function_declaration
  "def" @context
  name: (identifier) @name) @item

(method_definition
  "def" @context
  name: (_) @name) @item

(getter
  "get" @context
  name: (_) @name) @item

(setter
  "set" @context
  name: (_) @name) @item

(field_definition
  property: (_) @name) @item
