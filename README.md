# tree-sitter-nomo

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the
[Nomo](https://github.com/nomo-lang) programming language. Used for syntax
highlighting in editors such as Zed.

The grammar is intentionally permissive (newlines are treated as whitespace) and
exists for highlighting only. Authoritative diagnostics are produced by the Nomo
compiler through the [`nomo-lsp`](https://github.com/nomo-lang/nomo-lsp) language
server.

## Development

```bash
npm install
npm run generate   # regenerate src/parser.c from grammar.js
npm test           # run grammar corpus tests
```

The generated `src/` is committed so consumers (e.g. Zed) can build the parser
without running the tree-sitter CLI.

## Highlight queries

`queries/highlights.scm` contains the highlight captures.

## Distribution

The release workflow validates a `v<version>` tag against `package.json`,
regenerates and tests the parser, and produces a `tree-sitter-nomo-<version>.tgz`
artifact with a SHA-256 checksum and GitHub artifact attestation. GitHub Release
is the default distribution channel. npm publication is opt-in: configure the
`NPM_TOKEN` repository secret and set the `PUBLISH_NPM` repository variable to
`true` before pushing a release tag. Zed consumes a pinned Git commit directly,
so generated parser sources remain committed even when npm is not used.
