#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const SYNTAX_ONLY = process.argv.includes("--syntax-only");

const JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
const SKIP_DIRS = new Set(["node_modules", ".git"]);

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(join(dir, entry.name), out);
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (JS_EXTENSIONS.has(extname(fullPath))) {
      out.push(fullPath);
    }
  }

  return out;
}

function checkSyntax(file) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const errorText = (result.stderr || result.stdout || "").trim();
    throw new Error(`Syntax error in ${file}\n${errorText}`);
  }
}

async function main() {
  const files = await walk(SRC_DIR);
  if (files.length === 0) {
    throw new Error("No source files found under src/");
  }

  for (const file of files) {
    checkSyntax(file);
  }

  if (!SYNTAX_ONLY) {
    console.log(`CI smoke checks passed (${files.length} files).`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
