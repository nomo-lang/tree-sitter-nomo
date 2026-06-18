/**
 * @file Tree-sitter grammar for the Nomo programming language.
 * @license MIT
 *
 * This grammar is intentionally permissive: newlines are treated as ordinary
 * whitespace so the grammar stays small. Its purpose is syntax highlighting in
 * editors such as Zed; authoritative diagnostics come from the nomo compiler via
 * the language server.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "nomo",

  extras: ($) => [/\s/, $.line_comment],

  word: ($) => $.identifier,

  conflicts: ($) => [],

  rules: {
    source_file: ($) => repeat($._declaration),

    _declaration: ($) =>
      choice(
        $.package_declaration,
        $.import_declaration,
        $.struct_declaration,
        $.enum_declaration,
        $.impl_block,
        $.function_declaration,
      ),

    package_declaration: ($) => seq("package", field("name", $.dotted_path)),

    import_declaration: ($) => seq("import", field("path", $.dotted_path)),

    dotted_path: ($) => sep1(choice($.identifier, $.type_identifier), "."),

    struct_declaration: ($) =>
      seq(
        optional("pub"),
        "struct",
        field("name", $.type_identifier),
        optional($.type_parameters),
        field("body", $.struct_body),
      ),

    struct_body: ($) => seq("{", repeat($.field_declaration), "}"),

    field_declaration: ($) =>
      seq(
        optional("pub"),
        field("name", $.identifier),
        ":",
        field("type", $.type),
      ),

    enum_declaration: ($) =>
      seq(
        optional("pub"),
        "enum",
        field("name", $.type_identifier),
        optional($.type_parameters),
        field("body", $.enum_body),
      ),

    enum_body: ($) => seq("{", repeat($.enum_variant), "}"),

    enum_variant: ($) =>
      seq(
        field("name", $.type_identifier),
        optional(seq("(", sep1($.type, ","), ")")),
      ),

    impl_block: ($) =>
      seq(
        "impl",
        field("type", $.type_identifier),
        "{",
        repeat($.function_declaration),
        "}",
      ),

    function_declaration: ($) =>
      seq(
        optional("pub"),
        "fn",
        field("name", $.identifier),
        optional($.type_parameters),
        field("parameters", $.parameters),
        optional(seq("->", field("return_type", $.type))),
        field("body", $.block),
      ),

    type_parameters: ($) => seq("<", sep1($.type_identifier, ","), ">"),

    parameters: ($) => seq("(", optional(sep1($.parameter, ",")), ")"),

    parameter: ($) =>
      seq(
        optional("mut"),
        field("name", choice($.identifier, "self")),
        optional(seq(":", field("type", $.type))),
      ),

    type: ($) =>
      prec.right(
        seq(choice($.primitive_type, $.type_identifier), optional($.type_arguments)),
      ),

    type_arguments: ($) => prec(2, seq("<", sep1($.type, ","), ">")),

    primitive_type: ($) =>
      choice("bool", "i32", "i64", "u32", "u64", "f64", "char", "string", "void"),

    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.let_statement,
        $.assignment_statement,
        $.return_statement,
        $.defer_statement,
        $.break_statement,
        $.continue_statement,
        $.for_statement,
        $.expression_statement,
      ),

    let_statement: ($) =>
      seq(
        "let",
        optional("mut"),
        field("name", $.identifier),
        optional(seq(":", field("type", $.type))),
        "=",
        field("value", $._expression),
      ),

    assignment_statement: ($) =>
      prec(1, seq(field("left", $.field_access), "=", field("right", $._expression))),

    return_statement: ($) => prec.right(seq("return", optional($._expression))),

    defer_statement: ($) => prec.right(seq("defer", $._expression)),

    break_statement: (_) => "break",

    continue_statement: (_) => "continue",

    for_statement: ($) =>
      seq(
        "for",
        optional(choice(seq($.identifier, "in", $._expression), $._expression)),
        $.block,
      ),

    expression_statement: ($) => $._expression,

    _expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_postfix,
        $.call_expression,
        $.struct_literal,
        $.match_expression,
        $.if_expression,
        $.panic_expression,
        $.cast_expression,
        $.field_access,
        $.parenthesized_expression,
        $.string_literal,
        $.char_literal,
        $.number_literal,
        $.boolean_literal,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    binary_expression: ($) =>
      prec.left(
        seq(
          field("left", $._expression),
          field("operator", choice("+", "==", "!=", "<", "<=", ">", ">=")),
          field("right", $._expression),
        ),
      ),

    unary_postfix: ($) => prec(3, seq($._expression, "?")),

    cast_expression: ($) => prec(2, seq($._expression, "as", field("type", $.type))),

    call_expression: ($) =>
      prec(
        4,
        seq(field("function", $.field_access), field("arguments", $.arguments)),
      ),

    arguments: ($) => seq("(", optional(sep1($._expression, ",")), ")"),

    struct_literal: ($) =>
      prec(
        1,
        seq(
          field("type", $.type_identifier),
          "{",
          optional(sep1($.field_initializer, ",")),
          "}",
        ),
      ),

    field_initializer: ($) =>
      seq(field("name", $.identifier), ":", field("value", $._expression)),

    match_expression: ($) =>
      seq("match", field("value", $._expression), "{", repeat($.match_arm), "}"),

    match_arm: ($) =>
      seq(field("pattern", $.pattern), "=>", field("value", $._match_body)),

    _match_body: ($) => choice($.block, $._expression),

    pattern: ($) =>
      seq($.field_access, optional(seq("(", sep1($.identifier, ","), ")"))),

    if_expression: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        field("consequence", $.block),
        optional(seq("else", field("alternative", choice($.block, $.if_expression)))),
      ),

    panic_expression: ($) => seq("panic", "(", $._expression, ")"),

    field_access: ($) => sep1(choice($.identifier, $.type_identifier), "."),

    boolean_literal: (_) => choice("true", "false"),

    string_literal: ($) =>
      seq('"', repeat(choice($.escape_sequence, /[^"\\]+/)), '"'),

    char_literal: ($) => seq("'", choice($.escape_sequence, /[^'\\]/), "'"),

    escape_sequence: (_) => token.immediate(/\\./),

    number_literal: (_) => /[0-9]+(\.[0-9]+)?/,

    type_identifier: (_) => /[A-Z][A-Za-z0-9_]*/,

    identifier: (_) => /[a-z_][A-Za-z0-9_]*/,

    line_comment: (_) => token(seq("//", /.*/)),
  },
});

/**
 * Comma/dot separated list of at least one `rule`.
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
