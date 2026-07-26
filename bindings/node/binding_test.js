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

test("parses structured async task syntax without errors", () => {
  const parser = new Parser();
  const Nomo = require(".");
  parser.setLanguage(Nomo);

  const tree = parser.parse(`
    suspend fn main() -> void {
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
