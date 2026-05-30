#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

import * as compiler from "../src/compiler/compiler.mjs";

const packageRoot = path.resolve(new URL("..", import.meta.url).pathname);

const selectedLetsFiles = [
  "models/org.imba",
  "models/app-home.imba",
  "models/app-pages.imba",
  "models/app.imba",
  "client/views/collection.imba",
  "client/views/tile.imba",
  "space/group.imba",
  "models/user.imba",
  "models/checkout-flow.imba",
  "models/stripe-elements.imba",
  "models/quality-feedback.imba",
  "models/editable.imba",
  "models/session.imba",
  "models/notifications.imba",
  "models/views.imba",
  "models/entity.imba",
  "models/membership.imba",
  "models/voice-preferences.imba",
  "models/org-invite.imba",
  "models/auth.imba",
];

function parseArgs(argv) {
  let args = {
    root: process.env.LETSDEV_APP_ROOT || "/Users/sindre/repos/letsdev/app",
    all: false,
    runs: 15,
    warmup: 3,
    batches: 5,
    minBatchMs: 0,
  };

  for (let i = 0; i < argv.length; i++) {
    let key = argv[i];
    let next = argv[i + 1];
    if (key == "--root") {
      args.root = next;
      i++;
    } else if (key == "--runs") {
      args.runs = Number(next);
      i++;
    } else if (key == "--warmup") {
      args.warmup = Number(next);
      i++;
    } else if (key == "--batches") {
      args.batches = Number(next);
      i++;
    } else if (key == "--min-batch-ms") {
      args.minBatchMs = Number(next);
      i++;
    } else if (key == "--all") {
      args.all = true;
    } else if (key == "--help" || key == "-h") {
      console.log(`Usage: node profiling/benchmark-lets-compile.mjs [options]

Options:
  --root <path>     Lets app root (default: LETSDEV_APP_ROOT or /Users/sindre/repos/letsdev/app)
  --all             Compile every .imba file under root, excluding runner artifacts
  --runs <n>        Corpus passes per batch (default: 15)
  --warmup <n>      Warmup corpus passes before timing (default: 3)
  --batches <n>     Timed batches (default: 5)
  --min-batch-ms <n>
                    Keep adding corpus passes until each timed batch reaches n ms
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  if (!Number.isFinite(args.runs) || args.runs <= 0) {
    throw new Error(`Invalid --runs: ${args.runs}`);
  }
  if (!Number.isFinite(args.warmup) || args.warmup < 0) {
    throw new Error(`Invalid --warmup: ${args.warmup}`);
  }
  if (!Number.isFinite(args.batches) || args.batches <= 0) {
    throw new Error(`Invalid --batches: ${args.batches}`);
  }
  if (!Number.isFinite(args.minBatchMs) || args.minBatchMs < 0) {
    throw new Error(`Invalid --min-batch-ms: ${args.minBatchMs}`);
  }

  return args;
}

function collectAllFiles(root) {
  let files = [];

  function walk(dir) {
    for (let ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name == ".runner" || ent.name.startsWith(".runner-")) continue;
      let file = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(file);
      } else if (ent.isFile() && file.endsWith(".imba")) {
        files.push(file);
      }
    }
  }

  walk(root);
  return files.sort();
}

function loadInputs(args) {
  let root = path.resolve(args.root);
  let files = args.all
    ? collectAllFiles(root)
    : selectedLetsFiles.map((file) => path.join(root, file));

  return files.map((file) => ({
    file,
    rel: path.relative(packageRoot, file).split(path.sep).join("/"),
    code: fs.readFileSync(file, "utf8"),
  }));
}

function compile(input) {
  return compiler.compile(input.code, {
    sourcePath: input.rel,
    raiseErrors: true,
    config: {},
  });
}

function runCorpus(inputs, passes) {
  let diagnostics = 0;
  let jsBytes = 0;
  let cssBytes = 0;
  let failures = [];

  let started = performance.now();
  for (let pass = 0; pass < passes; pass++) {
    for (let input of inputs) {
      try {
        let result = compile(input);
        diagnostics += result.diagnostics?.length || 0;
        jsBytes += Buffer.byteLength(result.js || "");
        cssBytes += Buffer.byteLength(result.css || "");
      } catch (err) {
        failures.push({
          file: input.file,
          message: err.message,
        });
      }
    }
  }

  return {
    totalMs: performance.now() - started,
    compiles: inputs.length * passes,
    diagnostics,
    jsBytes,
    cssBytes,
    failures,
  };
}

function runBatch(inputs, passes, minBatchMs) {
  let total = {
    totalMs: 0,
    compiles: 0,
    passes: 0,
    diagnostics: 0,
    jsBytes: 0,
    cssBytes: 0,
    failures: [],
  };

  do {
    let result = runCorpus(inputs, passes);
    total.totalMs += result.totalMs;
    total.compiles += result.compiles;
    total.passes += passes;
    total.diagnostics += result.diagnostics;
    total.jsBytes += result.jsBytes;
    total.cssBytes += result.cssBytes;
    total.failures.push(...result.failures);
    if (result.failures.length || result.diagnostics) break;
  } while (minBatchMs > 0 && total.totalMs < minBatchMs);

  return total;
}

function stats(values) {
  let sorted = values.slice().sort((a, b) => a - b);
  let sum = values.reduce((total, value) => total + value, 0);
  let mean = sum / values.length;
  let variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) /
    values.length;
  let trim = Math.floor(values.length * 0.1);
  let trimmed =
    trim > 0 && trim * 2 < sorted.length
      ? sorted.slice(trim, sorted.length - trim)
      : sorted;
  let trimmedSum = trimmed.reduce((total, value) => total + value, 0);
  return {
    mean,
    median:
      sorted.length % 2
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2,
    trimmedMean: trimmedSum / trimmed.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stddev: Math.sqrt(variance),
    relativeStddev: mean ? Math.sqrt(variance) / Math.abs(mean) : 0,
  };
}

function main() {
  let args = parseArgs(process.argv.slice(2));
  let inputs = loadInputs(args);

  runCorpus(inputs, args.warmup);

  let batches = [];
  for (let i = 0; i < args.batches; i++) {
    let result = runBatch(inputs, args.runs, args.minBatchMs);
    batches.push(result);
    if (result.failures.length || result.diagnostics) {
      break;
    }
  }

  let msPerCompile = batches.map((batch) => batch.totalMs / batch.compiles);
  let summary = {
    root: path.resolve(args.root),
    mode: args.all ? "all" : "selected",
    files: inputs.length,
    runs: args.runs,
    warmup: args.warmup,
    batches: batches.length,
    minBatchMs: args.minBatchMs,
    compilesPerBatch: stats(batches.map((batch) => batch.compiles)),
    passesPerBatch: stats(batches.map((batch) => batch.passes)),
    msPerCompile: stats(msPerCompile),
    samples: msPerCompile,
    totalMs: stats(batches.map((batch) => batch.totalMs)),
    diagnostics: batches.reduce((total, batch) => total + batch.diagnostics, 0),
    failures: batches.reduce((total, batch) => total + batch.failures.length, 0),
    jsBytesPerBatch: Math.round(
      batches.reduce((total, batch) => total + batch.jsBytes, 0) /
        batches.length,
    ),
    cssBytesPerBatch: Math.round(
      batches.reduce((total, batch) => total + batch.cssBytes, 0) /
        batches.length,
    ),
  };

  console.log(JSON.stringify(summary, null, 2));

  if (summary.failures || summary.diagnostics) {
    console.error(JSON.stringify(batches[batches.length - 1].failures, null, 2));
    process.exit(1);
  }
}

main();
