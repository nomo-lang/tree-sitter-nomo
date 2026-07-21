const assert = require("node:assert");
const { test } = require("node:test");

const Parser = require("tree-sitter");

test("can load grammar", () => {
  const parser = new Parser();
  const Nomo = require(".");

  assert.equal(Nomo.name, "nomo");
  assert.doesNotThrow(() => parser.setLanguage(Nomo));

  const tree = parser.parse("fn main() {}");
  assert.equal(tree.rootNode.type, "source_file");
  assert.equal(tree.rootNode.namedChild(0).type, "function_declaration");
});
