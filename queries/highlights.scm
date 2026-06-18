; Keywords
[
  "package"
  "import"
  "pub"
  "fn"
  "struct"
  "enum"
  "impl"
  "let"
  "mut"
  "return"
  "defer"
  "break"
  "continue"
  "for"
  "in"
  "as"
] @keyword

[
  "if"
  "else"
  "match"
] @keyword.control.conditional

"panic" @keyword.control

; Operators
[
  "+"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "="
  "?"
  "->"
  "=>"
] @operator

; Punctuation
[ "(" ")" "{" "}" "<" ">" ] @punctuation.bracket
[ "," ":" "." ] @punctuation.delimiter

; Types
(primitive_type) @type.builtin
(type_identifier) @type

; Literals
(string_literal) @string
(char_literal) @string
(escape_sequence) @string.escape
(number_literal) @number
(boolean_literal) @boolean

; Comments
(line_comment) @comment

; Functions
(function_declaration name: (identifier) @function)
(call_expression
  function: (field_access (identifier) @function.call .))

; Parameters and fields
(parameter name: (identifier) @variable.parameter)
(field_declaration name: (identifier) @property)
(field_initializer name: (identifier) @property)

; Variants like Option.Some
(pattern (field_access (type_identifier) @type (type_identifier) @constant))

; self
"self" @variable.builtin

; Variables
(identifier) @variable
