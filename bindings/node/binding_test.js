const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
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

test("parses structured async task syntax without errors", () => {
  const parser = new Parser();
  const Nomo = require(".");
  parser.setLanguage(Nomo);

  const tree = parser.parse(`
    suspend fn main() {
      task.scope {
        task.deadline(time.duration_millis(5)) {
          task.yield_now()
        }
        task.select {
          task.receive(messages) => message {
            consume(message)
          }
          task.sleep(time.duration_millis(50)) => timeout {
            consume(timeout)
          }
        }
      }
    }
  `);

  assert.equal(tree.rootNode.hasError, false);
  assert.equal(tree.rootNode.descendantsOfType("task_scope_statement").length, 1);
  assert.equal(tree.rootNode.descendantsOfType("task_deadline_statement").length, 1);
  assert.equal(tree.rootNode.descendantsOfType("task_select_statement").length, 1);
  assert.equal(tree.rootNode.descendantsOfType("task_select_arm").length, 2);
});

test("highlights callable task functions without dropping their return type", () => {
  const parser = new Parser();
  const Nomo = require(".");
  parser.setLanguage(Nomo);
  const tree = parser.parse(
    "fn register(callback: task fn(string) -> void) -> Result<void, string> {}",
  );
  const query = new Parser.Query(
    Nomo,
    fs.readFileSync(
      path.join(__dirname, "..", "..", "queries", "highlights.scm"),
      "utf8",
    ),
  );
  const captures = query.captures(tree.rootNode);

  assert.equal(tree.rootNode.hasError, false);
  assert.ok(
    captures.some(
      (capture) => capture.name === "keyword" && capture.node.text === "task",
    ),
  );
  assert.equal(
    captures.filter(
      (capture) =>
        capture.name === "type.builtin" && capture.node.text === "void",
    ).length,
    2,
  );
});
