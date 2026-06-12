; ; Special identifiers
; ;--------------------
; Avoid letting recovery nodes wash out useful nested captures in large Imba files.
; The grammar is still intentionally permissive while we fill in the language surface.

([
    (identifier)
    (shorthand_property_identifier)
    (shorthand_property_identifier_pattern)
 ] @constant
 (#match? @constant "^[A-Z_][A-Z\\d_]+$"))


((identifier) @constructor
 (#match? @constructor "^[A-Z]"))

((identifier) @variable.builtin
 (#match? @variable.builtin "^(describe|test|expect|arguments|global|module|console|window|document|self|imba|\\$\\d+)$")
 ;(#is-not? local)
 )

(private_property_identifier) @variable.builtin

; ((identifier) @function.builtin
;  (#eq? @function.builtin "require")
;  (#is-not? local))

; ; Function and method definitions
; ;--------------------------------

(function_declaration
  name: (identifier) @function)
(method_definition
  name: (property_identifier) @function.method)
(getter
  name: (property_identifier) @function.method)
(setter
  name: (property_identifier) @function.method)
(mixin_declaration
  name: (identifier) @type)

(field_definition
  property: (property_identifier) @property)
(leading_decorated_field_definition
  property: (property_identifier) @property)
(decorated_field_statement
  property: (property_identifier) @property)

(formal_parameters
  (identifier) @variable.parameter)
(typed_parameter
  name: (identifier) @variable.parameter)
(assignment_pattern
  left: (identifier) @variable.parameter)


(pair
	key: (property_identifier) @function.method
	value: [(arrow_function) (function_declaration)]
)

(assignment_expression
  left: (identifier) @function.method
  right: [(function_declaration) (arrow_function)]
)
  
(variable_declarator
  name: (identifier) @function
  value: [(function_declaration) (arrow_function)])


; ; Function and method calls
; ;--------------------------

; (call_expression
;   function: (identifier) @function)

; (call_expression
;   function: (member_expression
;     property: (property_identifier) @function.method))

; ; Variables
; ;----------

(identifier) @variable
(class_modifier) @keyword
(method_modifier) @attribute
(binary_operator) @operator
(decorator
  "@" @operator)
(decorator_identifier) @function.special
(shorthand_function) @function

(tag_name) @tag
(tag_modifier name: (tag_modifier_name) @attribute)
(tag_event name: (tag_modifier_name) @attribute)
(tag_style_modifier name: (tag_modifier_name) @attribute)
(tag_reference name: (tag_modifier_name) @variable.special)
(tag_id name: (tag_modifier_name) @constant)
(tag_attribute name: (tag_attribute_name) @property)
(tag_style_property name: (tag_style_property_name) @property)
(tag_style_value) @string.special
(tag_value (tag_value_identifier) @variable)
(tag_call (tag_value_identifier) @variable)
(tag_interpolation (tag_value_identifier) @variable)
(tag_style_property value: (tag_value_identifier) @string.special)
(tag_string) @string
(tag_number_value) @constant.numeric.integer
(tag_unit) @type
(tag_expr_operator) @operator
(tag_expr_raw) @variable
(tag_value_raw) @string.special
(tag_raw) @tag
(tag_element ["<" ">" "/"] @punctuation.bracket)
(tag_call ["(" ")"] @punctuation.bracket)
(tag_style_block ["[" "]"] @punctuation.bracket)
(tag_interpolation ["{" "}"] @punctuation.special)
(tag_modifier ["." "!" "="] @operator)
(tag_event ["@" ":" "!" "="] @operator)
(tag_attribute "=" @operator)
(tag_style_property ":" @operator)
(tag_style_modifier ["@" "." "!"] @operator)
(tag_reference ["$" "%"] @variable.special)
(tag_id "#" @operator)
(parenless_call_raw_tail) @string.special

(css_statement ["global" "css"] @keyword)
(css_property name: (css_property_name) @property)
(css_selector) @tag
(css_value) @string.special
(css_function name: (css_value) @function)
(css_function name: (css_selector) @function)
(css_string) @string
(css_number_value) @constant.numeric.integer
(css_unit) @type
(css_operator) @operator
(css_property ":" @operator)
(css_arguments ["(" ")"] @punctuation.bracket)

; ; Properties
; ;-----------

(property_identifier) @variable.other.member
(shorthand_property_identifier) @variable.other.member
(shorthand_property_identifier_pattern) @variable.other.member

(class_declaration
  name: (class_name
    (identifier) @type)
  (#set! "priority" 105))

(class_name
  (identifier) @type
  (#set! "priority" 105))

(tag_declaration
  name: (identifier) @type
  (#set! "priority" 105))

(class_heritage
  (type_reference) @type
  (#set! "priority" 105))

(type_reference) @type

(type_parameters) @type

((identifier) @constant
  (#match? @constant "^[A-Z_][A-Z\\d_]+$")
  (#set! "priority" 115))

((identifier) @type
  (#match? @type "^[A-Z][A-Za-z\\d_]*[a-z][A-Za-z\\d_]*$")
  (#set! "priority" 105))

(bang_expression
  "!" @punctuation.bracket)

; ; Literals
; ;---------

(this) @variable.builtin
(super) @variable.builtin

[
  (yes)
  (no)
  (true)
  (false)
  (null)
  (undefined)
] @constant.builtin

(comment) @comment

(string ["\"" "'" "\"\"\"" "'''"] @string)
(template_string ["`" "```"] @string)
(string_fragment) @string
(escape_sequence) @string.escape
(string_interpolation ["{" "}"] @punctuation.special
  (#set! "priority" 115))

(regex) @string.regexp
(number) @constant.numeric.integer

; ; Tokens
; ;-------

; (template_substitution
;   "${" @punctuation.special
;   "}" @punctuation.special) @embedded

; [
;   ";"
;   ".."
;   "."
;   ","
; ] @punctuation.delimiter

[
  ; "-"
  ; "--"
  "-="
  ; "+"
  ; "++"
  "+="
  ; "*"
  "*="
  ; "**"
  "**="
  ; "/"
  "/="
  ; "%"
  "%="
  "<"
  ; "<="
  ; "<<"
  ; "<<="
  "="
  ; "=="
  ; "==="
  ; "!"
  ; "!="
  ; "!=="
  ; "=>"
  ; ">"
  ; ">="
  ; ">>"
  ; ">>="
  ; ">>>"
  ; ">>>="
  ; "~"
  ; "^"
  ; "&"
  ; "|"
  ; "^="
  ; "&="
  ; "|="
  ; "&&"
  ; "||"
  ; "??"
  "&&="
  "||="
  "??="
  "..."
] @operator

; (ternary_expression ["?" ":"] @operator)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

[
;   "as"
;   "async"
  "await"
  "catch"
  ; "debugger"
  "delete"
;   "extends"
  "elif"
  "else"
  "extend"
  "finally"
  "for"
  "from"
  "def"
  "global"
  "get"
  "do"
  "in"
  "isa"
  "mixin"
  "new"
  "of"
  "set"
  "prop"
;   "instanceof"
;   "set"
  "static"
;   "target"
  "throw"
  "try"
  "typeof"
;   "void"
;   "with"
  "when"
  "while"
] @keyword

[
  "class"
  "let"
  "const"
  "var"
] @keyword.storage.type

[
;   "switch"
;   "case"
;   "default"
  "if"
  "unless"
;   "yield"
  "return"
  ; "continue"
;   "break"
  ; "do"
] @keyword.control

[
  "import"
  "export"
] @keyword.control.import 
