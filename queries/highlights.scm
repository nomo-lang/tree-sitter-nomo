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
  "for"
  "in"
  "as"
  "if"
  "else"
  "match"
  "panic"
] @keyword

(break_statement) @keyword
(continue_statement) @keyword

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
[ "(" ")" "{" "}" ] @punctuation.bracket
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
(line_comment) @comment

; Functions
(function_declaration name: (identifier) @function)
(call_expression
  function: (field_access (identifier) @function .))

; Parameters and fields
(parameter name: (identifier) @variable.parameter)
(field_declaration name: (identifier) @property)
(field_initializer name: (identifier) @property)

; Enum variant in patterns, e.g. Option.Some
(pattern
  (field_access (type_identifier) @type (type_identifier) @constant))

; Built-in value
"self" @variable.special

; Variables (fallback)
(identifier) @variable
