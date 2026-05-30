#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as compiler from "../src/compiler/compiler.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

const defaultFiles = [
  "profiling/sample-logic-heavy.imba",
  "profiling/sample-style-heavy.imba",
  "profiling/sample-tag-heavy.imba",
];

function usage() {
  console.log(`Usage: node profiling/verify-compile-output.mjs [options]

Options:
  --file <path>       File to verify. May be repeated.
  --write <path>      Write the current output summary as JSON.
  --compare <path>    Compare the current output summary with a JSON baseline.
  --help, -h          Show this help.
`);
}

function parseArgs(argv) {
  let args = {
    files: [],
    write: null,
    compare: null,
  };

  for (let i = 0; i < argv.length; i++) {
    let key = argv[i];
    let next = argv[i + 1];
    if (key == "--file") {
      args.files.push(next);
      i++;
    } else if (key == "--write") {
      args.write = next;
      i++;
    } else if (key == "--compare") {
      args.compare = next;
      i++;
    } else if (key == "--help" || key == "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  if (!args.files.length) {
    args.files = defaultFiles;
  }

  return args;
}

function hash(value) {
  return crypto.createHash("sha256").update(value || "").digest("hex");
}

function resolveInput(file) {
  let absolute = path.resolve(packageRoot, file);
  let rel = path.relative(packageRoot, absolute).split(path.sep).join("/");
  return {
    absolute,
    rel,
    code: fs.readFileSync(absolute, "utf8"),
  };
}

function diagnosticSummary(compilation) {
  return compilation.diagnostics.map((diagnostic) => ({
    severity: diagnostic.severity,
    message: diagnostic.message,
    range: diagnostic.range && {
      start: diagnostic.range.start && diagnostic.range.start.offset,
      end: diagnostic.range.end && diagnostic.range.end.offset,
    },
  }));
}

function tokenSignature(tokens) {
  return tokens
    .map((token) => `${token?._type || ""}\u0000${token?._value || ""}`)
    .join("\u0001");
}

function summarizeFile(file) {
  let input = resolveInput(file);
  let compilation = compiler.compile(input.code, {
    sourcePath: input.rel,
    raiseErrors: true,
    config: {},
  });

  let js = compilation.js || "";
  let css = compilation.css || "";
  let diagnostics = diagnosticSummary(compilation);
  let tokens = compilation.tokens || [];

  return {
    file: input.rel,
    tokens: tokens.length,
    tokenHash: hash(tokenSignature(tokens)),
    diagnostics,
    jsBytes: Buffer.byteLength(js),
    jsHash: hash(js),
    cssBytes: Buffer.byteLength(css),
    cssHash: hash(css),
  };
}

function summarize(args) {
  return {
    files: args.files.map((file) => summarizeFile(file)),
  };
}

function readBaseline(file) {
  return JSON.parse(fs.readFileSync(path.resolve(packageRoot, file), "utf8"));
}

function writeSummary(file, summary) {
  fs.writeFileSync(
    path.resolve(packageRoot, file),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
}

function diffSummary(expected, actual) {
  let diffs = [];
  let expectedFiles = new Map(expected.files.map((item) => [item.file, item]));
  let actualFiles = new Map(actual.files.map((item) => [item.file, item]));

  for (let [file, before] of expectedFiles) {
    let after = actualFiles.get(file);
    if (!after) {
      diffs.push(`${file}: missing from actual output`);
      continue;
    }

    for (let key of [
      "tokens",
      "tokenHash",
      "jsBytes",
      "jsHash",
      "cssBytes",
      "cssHash",
    ]) {
      if (before[key] !== after[key]) {
        diffs.push(`${file}: ${key} changed from ${before[key]} to ${after[key]}`);
      }
    }

    let beforeDiagnostics = JSON.stringify(before.diagnostics);
    let afterDiagnostics = JSON.stringify(after.diagnostics);
    if (beforeDiagnostics !== afterDiagnostics) {
      diffs.push(`${file}: diagnostics changed`);
    }
  }

  for (let file of actualFiles.keys()) {
    if (!expectedFiles.has(file)) {
      diffs.push(`${file}: missing from baseline`);
    }
  }

  return diffs;
}

function printSummary(summary) {
  console.log("file".padEnd(36), "tokens", "diags", "js", "css");
  for (let item of summary.files) {
    console.log(
      item.file.padEnd(36),
      String(item.tokens).padStart(6),
      String(item.diagnostics.length).padStart(5),
      String(item.jsBytes).padStart(7),
      String(item.cssBytes).padStart(7),
    );
  }
}

function main() {
  let args = parseArgs(process.argv.slice(2));
  let summary = summarize(args);
  printSummary(summary);

  if (args.write) {
    writeSummary(args.write, summary);
    console.log(`Wrote ${args.write}`);
  }

  if (args.compare) {
    let baseline = readBaseline(args.compare);
    let diffs = diffSummary(baseline, summary);
    if (diffs.length) {
      console.error("\nOutput changed:");
      for (let diff of diffs) {
        console.error(`- ${diff}`);
      }
      process.exit(1);
    }
    console.log(`Matched ${args.compare}`);
  }
}

main();
