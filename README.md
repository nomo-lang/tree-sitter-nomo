# tree-sitter-nomo

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar, highlight
query, generated parser, and Node binding for the early-preview
[Nomo language](https://www.nomo-lang.org).

## Status and compatibility

This repository supplies incremental syntax structure for editors. It is
intentionally more permissive than the compiler and is not an authoritative
type checker, module resolver, formatter, or diagnostic engine. Use
[`nomo-lsp`](https://github.com/nomo-lang/nomo-lsp) and the compiler for those
services.

Current package:
[`0.0.0-20260723110700`](https://www.npmjs.com/package/tree-sitter-nomo/v/0.0.0-20260723110700).
The canonical syntax contract is recorded by grammar commit
[`90565b1`](https://github.com/nomo-lang/tree-sitter-nomo/commit/90565b1b33b213ce97bfda1a4f9c79440e692c0e)
and compiler commit
[`6acff2b`](https://github.com/nomo-lang/nomo/commit/6acff2bba0113efa3d49254ec2b9c72e1d442b33).
Zed pins the grammar by commit rather than following an npm tag.

Nomo has no stable `v0.1.0` language release. Timestamp versions are
development snapshots and must be pinned when reproducibility matters.

## Install and parse

Use Node.js 22, the version exercised by CI:

```sh
npm install tree-sitter@^0.25.0 tree-sitter-nomo@0.0.0-20260723110700
```

```js
const Parser = require("tree-sitter");
const Nomo = require("tree-sitter-nomo");

const parser = new Parser();
parser.setLanguage(Nomo);
const tree = parser.parse(`
package hello_world

fn main() {
}
`);

console.log(tree.rootNode.toString());
```

## Canonical syntax coverage

The grammar and corpus cover:

- package declarations, imports, declarations, expressions, and layout;
- ordinary functions, methods, `suspend fn`, interfaces, and extern blocks;
- canonical omission of `-> void` for no-return declarations;
- parser compatibility for explicit `-> void` during the documented migration
  window;
- callable types that keep a complete return type, such as
  `task fn(string) -> void`;
- `Result<void, E>` and other value-position uses of the `void` type;
- structured task constructs, including scope, deadlines, and selection;
- highlight captures for declaration keywords, callable `task`, primitive
  `void`, and other language tokens.

Optional return-type syntax was already part of the grammar; the current
snapshot adds regression and query coverage rather than a second syntax model.
See
[RFC 0041](https://github.com/nomo-lang/rfcs/blob/main/en/0041-implicit-void-return-omission.md)
for the language contract.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `grammar.js` | Editable Tree-sitter grammar |
| `src/` | Committed generated C parser and metadata |
| `queries/highlights.scm` | Editor highlight captures |
| `test/corpus/` | Parse trees and compatibility cases |
| `bindings/node/` | Native Node binding and query contract tests |
| `scripts/test-package.mjs` | Clean packed-module acceptance test |

Generated parser sources stay committed so Zed and other consumers can build a
pinned revision without installing the Tree-sitter CLI.

## Development and validation

```sh
npm ci
npm run generate
git diff --exit-code -- src tree-sitter.json
npm test
npm run test:package
```

`npm test` runs the grammar corpus and Node binding tests. `test:package`
packs the module, installs it into a clean fixture, and checks the public
consumer path. CI runs the complete sequence on Node.js 22.

If a syntax change is proposed, update `grammar.js`, generated sources, corpus,
queries, Node query tests, and affected editor fixtures in the same delivery
chain. Compiler acceptance remains the source of truth.

## Release

The Release workflow requires a signed `v<package.json version>` tag. It
regenerates and tests the parser, validates the packed module, creates a
checksum and GitHub artifact attestation, and publishes timestamp versions to
the npm `snapshot` dist-tag when trusted publishing is enabled.

Before a release:

```sh
npm ci
npm run generate
npm test
npm run test:package
npm pack
```

GitHub Release is the artifact-of-record. npm publishing uses Actions OIDC and
provenance; no long-lived npm token should be configured.

## Boundaries

- A successful parse does not mean a Nomo program type-checks or resolves.
- Highlight queries are a presentation contract, not semantic classification.
- The Node binding exercises the CI baseline; untested Node/toolchain
  combinations are not implied compatible.
- Grammar snapshot versions do not promise cross-snapshot language stability.

For normative behavior, consult the
[English specification](https://github.com/nomo-lang/rfcs/blob/main/en/SPEC.md),
[中文规范](https://github.com/nomo-lang/rfcs/blob/main/zh-CN/SPEC.md), and
[RFC index](https://github.com/nomo-lang/rfcs). Contributions follow the
[shared guide](https://github.com/nomo-lang/.github/blob/main/CONTRIBUTING.md).

## License

See [LICENSE](LICENSE).
