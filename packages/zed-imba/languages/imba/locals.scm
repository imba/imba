; Scopes
;-------

[
  (program)
  (statement_block)
  (arrow_function)
  (function_declaration)
  (method_definition)
  (getter)
  (setter)
] @local.scope

; Definitions
;------------

(function_declaration
  name: (identifier) @local.definition)

(variable_declarator
  name: (identifier) @local.definition)

(variable_declarator
  name: (typed_identifier
    name: (identifier) @local.definition))

(formal_parameters
  (identifier) @local.definition)

(typed_parameter
  name: (identifier) @local.definition)

(assignment_pattern
  left: (identifier) @local.definition)

(for_statement
  left: (identifier) @local.definition)

(catch_clause
  parameter: (identifier) @local.definition)

(shorthand_property_identifier_pattern) @local.definition

(rest_pattern
  (identifier) @local.definition)

; References
;------------

(identifier) @local.reference
