import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = await mkdtemp(join(tmpdir(), "tree-sitter-nomo-package-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
    },
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `${command} ${args.join(" ")} failed with status ${result.status}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return result.stdout.trim();
}

try {
  const packOutput = run(
    npm,
    ["pack", "--json", "--pack-destination", temporaryRoot],
    packageRoot,
  );
  const [packed] = JSON.parse(packOutput);
  assert.equal(packed.name, "@nomo-lang/tree-sitter-nomo");

  const consumer = join(temporaryRoot, "consumer");
  await mkdir(consumer);
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({ name: "tree-sitter-nomo-smoke", private: true }, null, 2),
  );

  run(
    npm,
    ["install", join(temporaryRoot, packed.filename), "tree-sitter@^0.25.0"],
    consumer,
  );

  run(
    process.execPath,
    [
      "-e",
      [
        'const assert = require("node:assert/strict");',
        'const Parser = require("tree-sitter");',
        'const Nomo = require("@nomo-lang/tree-sitter-nomo");',
        'assert.equal(Nomo.name, "nomo");',
        "const parser = new Parser();",
        "parser.setLanguage(Nomo);",
        'const tree = parser.parse("fn main() {}");',
        'assert.equal(tree.rootNode.type, "source_file");',
      ].join(" "),
    ],
    consumer,
  );

  console.log(`Packed npm module smoke passed: ${packed.filename}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
