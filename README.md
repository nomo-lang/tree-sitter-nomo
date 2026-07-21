# tree-sitter-nomo

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the
[Nomo](https://github.com/nomo-lang) programming language. Used for syntax
highlighting in editors such as Zed.

The grammar is intentionally permissive (newlines are treated as whitespace) and
exists for highlighting only. Authoritative diagnostics are produced by the Nomo
compiler through the [`nomo-lsp`](https://github.com/nomo-lang/nomo-lsp) language
server.

## Installation

```bash
npm install tree-sitter @nomo-lang/tree-sitter-nomo
```

```js
const Parser = require("tree-sitter");
const Nomo = require("@nomo-lang/tree-sitter-nomo");

const parser = new Parser();
parser.setLanguage(Nomo);
const tree = parser.parse("fn main() {}");
```

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
regenerates and tests the parser, verifies a clean installation of the packed
module, and produces a `nomo-lang-tree-sitter-nomo-<version>.tgz` artifact with a
SHA-256 checksum and GitHub artifact attestation. GitHub Release is the default
distribution channel. npm publication to
[`@nomo-lang/tree-sitter-nomo`](https://www.npmjs.com/package/@nomo-lang/tree-sitter-nomo)
uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) with
GitHub Actions OIDC, so no long-lived npm token is stored in GitHub. Configure
the package's trusted publisher for GitHub organization `nomo-lang`, repository
`tree-sitter-nomo`, workflow filename `release.yml`, and the `npm publish`
action. Because that setting belongs to an existing npm package, bootstrap the
first signed release once with an interactive organization-maintainer publish,
then configure the trusted publisher and disallow token-based publishing. Set
the repository variable `PUBLISH_NPM` to `true` only after that configuration is
active. Trusted publishing automatically attaches npm provenance for public
packages from public repositories. Zed consumes a pinned Git commit directly,
so generated parser sources remain committed even when npm is not used.
