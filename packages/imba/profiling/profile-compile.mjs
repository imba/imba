#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

import * as compiler from "../src/compiler/compiler.mjs";
import { Lexer } from "../src/compiler/lexer.mjs";
import { Rewriter } from "../src/compiler/rewriter.mjs";
import { SourceMapper } from "../src/compiler/sourcemapper.mjs";
import { StyleSheet } from "../src/compiler/styler.mjs";
import * as ast from "../src/compiler/nodes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

let activeRun = null;

function parseArgs(argv) {
  let args = {
    file: path.join("profiling", "sample1.imba"),
    runs: 80,
    warmup: 20,
    attributionRuns: 3,
    attributionWarmup: 1,
    top: 18,
    json: false,
    attribution: true,
  };

  for (let i = 0; i < argv.length; i++) {
    let key = argv[i];
    let next = argv[i + 1];
    if (key == "--file") {
      args.file = next;
      i++;
    } else if (key == "--runs") {
      args.runs = Number(next);
      i++;
    } else if (key == "--warmup") {
      args.warmup = Number(next);
      i++;
    } else if (key == "--attribution-runs") {
      args.attributionRuns = Number(next);
      i++;
    } else if (key == "--attribution-warmup") {
      args.attributionWarmup = Number(next);
      i++;
    } else if (key == "--top") {
      args.top = Number(next);
      i++;
    } else if (key == "--json") {
      args.json = true;
    } else if (key == "--no-attribution") {
      args.attribution = false;
    } else if (key == "--help" || key == "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node profiling/profile-compile.mjs [options]

Options:
  --file <path>                 Imba file to compile (default: profiling/sample1.imba)
  --runs <n>                    measured baseline/phase runs (default: 80)
  --warmup <n>                  warmup runs before measuring (default: 20)
  --attribution-runs <n>        measured method-attribution runs (default: 3)
  --attribution-warmup <n>      warmup runs after installing attribution probes (default: 1)
  --top <n>                     rows per hotspot table (default: 18)
  --json                        emit the full result as JSON
  --no-attribution              skip method-level probes
`);
}

function resolveInput(file) {
  let absolute = path.resolve(packageRoot, file);
  let code = fs.readFileSync(absolute, "utf8");
  let rel = path.relative(packageRoot, absolute).split(path.sep).join("/");
  return {
    absolute,
    rel,
    code,
    bytes: Buffer.byteLength(code),
    chars: code.length,
    lines: (code.match(/\n/g) || []).length + (code.endsWith("\n") ? 0 : 1),
  };
}

function freshOptions(input) {
  return {
    sourcePath: input.rel,
    raiseErrors: true,
    config: {},
  };
}

function compileOnce(input, extraOptions = {}) {
  return compiler.compile(input.code, {
    ...freshOptions(input),
    ...extraOptions,
  });
}

function addTiming(label, ms) {
  if (!activeRun || !label) return;
  let item = activeRun.get(label);
  if (!item) {
    item = { ms: 0, count: 0 };
    activeRun.set(label, item);
  }
  item.ms += ms;
  item.count++;
}

function withTiming(label, fn) {
  let t0 = performance.now();
  try {
    return fn();
  } finally {
    addTiming(label, performance.now() - t0);
  }
}

function patch(obj, method, labeler) {
  let hadOwn = Object.prototype.hasOwnProperty.call(obj, method);
  let original = obj[method];
  if (typeof original != "function") return () => {};

  obj[method] = function (...args) {
    let label =
      typeof labeler == "function" ? labeler.call(this, args) : labeler;
    return withTiming(label, () => original.apply(this, args));
  };

  return () => {
    if (hadOwn) {
      obj[method] = original;
    } else {
      delete obj[method];
    }
  };
}

function installPhaseProbes() {
  let restores = [];
  restores.push(
    patch(Lexer.prototype, "reset", "lexer.reset"),
    patch(Lexer.prototype, "tokenize", function (args) {
      return args[1]?.inline ? "lexer.tokenize.inline" : "lexer.tokenize.main";
    }),
    patch(Lexer.prototype, "parse", function () {
      return this._opts?.inline ? "lexer.scan.inline" : "lexer.scan.main";
    }),
    patch(Rewriter.prototype, "rewrite", "rewrite.total"),
    patch(Rewriter.prototype, "step", function (args) {
      return `rewrite.${args[0]}`;
    }),
    patch(compiler.parser, "parse", "parser.total"),
    patch(ast.Root.prototype, "compile", "ast.compile.total"),
    patch(ast.Root.prototype, "traverse", "ast.traverse"),
    patch(ast.Root.prototype, "c", "to-js.root.c"),
    patch(ast.Root.prototype, "js", "to-js.root.js"),
    patch(ast.RootScope.prototype, "c", "to-js.root-scope.c"),
    patch(StyleSheet.prototype, "toString", "css.toString"),
    patch(SourceMapper, "strip", function (args) {
      return args[0]?.length > 30000
        ? "postprocess.strip.js"
        : "postprocess.strip.css";
    }),
  );
  return () => restores.reverse().forEach((restore) => restore());
}

function installAttributionProbes() {
  let restores = [];
  let seen = new Set();
  let methods = ["traverse", "visit", "c", "js"];

  for (let value of Object.values(ast)) {
    if (typeof value != "function" || !value.prototype) continue;
    let proto = value.prototype;
    for (let method of methods) {
      if (!Object.prototype.hasOwnProperty.call(proto, method)) continue;
      let key = `${value.name || "anonymous"}:${method}`;
      if (seen.has(key)) continue;
      seen.add(key);
      restores.push(
        patch(proto, method, function () {
          return `node.${method}.${this.constructor.name || value.name}`;
        }),
      );
    }
  }

  let symbolNames = {};
  for (let [name, id] of Object.entries(compiler.parser.symbols_ || {})) {
    symbolNames[id] = name;
  }
  restores.push(
    patch(compiler.parser, "performAction", function (args) {
      let state = args[3];
      let production = compiler.parser.productions_?.[state];
      let lhs = production ? symbolNames[production[0]] : null;
      return lhs ? `parser.reduce.${lhs}` : "parser.reduce.unknown";
    }),
  );

  return () => restores.reverse().forEach((restore) => restore());
}

function measureOne(input) {
  activeRun = new Map();
  let t0 = performance.now();
  let compilation;
  try {
    compilation = compileOnce(input);
  } finally {
    addTiming("compile.total", performance.now() - t0);
  }
  let timings = activeRun;
  activeRun = null;
  return { compilation, timings };
}

function runWarmup(input, n) {
  for (let i = 0; i < n; i++) {
    compileOnce(input);
  }
}

function runMeasured(input, runs) {
  let runMaps = [];
  let lastCompilation = null;
  for (let i = 0; i < runs; i++) {
    let { compilation, timings } = measureOne(input);
    lastCompilation = compilation;
    runMaps.push(timings);
  }
  return { runMaps, lastCompilation };
}

function runBaseline(input, warmup, runs) {
  runWarmup(input, warmup);
  let values = [];
  let lastCompilation = null;
  for (let i = 0; i < runs; i++) {
    let t0 = performance.now();
    lastCompilation = compileOnce(input);
    values.push(performance.now() - t0);
  }
  return { values, lastCompilation };
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  let idx = (sorted.length - 1) * p;
  let lo = Math.floor(idx);
  let hi = Math.ceil(idx);
  if (lo == hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function summarizeValues(values) {
  let sorted = values.slice().sort((a, b) => a - b);
  let total = values.reduce((sum, value) => sum + value, 0);
  return {
    runs: values.length,
    total,
    mean: values.length ? total / values.length : 0,
    median: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
  };
}

function aggregateRunMaps(runMaps) {
  let byLabel = new Map();
  for (let run of runMaps) {
    for (let [label, value] of run) {
      let item = byLabel.get(label);
      if (!item) {
        item = { values: [], count: 0 };
        byLabel.set(label, item);
      }
      item.values.push(value.ms);
      item.count += value.count;
    }
  }

  return [...byLabel.entries()]
    .map(([label, item]) => ({
      label,
      count: item.count,
      countPerRun: item.count / runMaps.length,
      ...summarizeValues(item.values),
    }))
    .sort((a, b) => b.mean - a.mean);
}

function tokenSummary(compilation, limit = 15) {
  let tokens = compilation?.tokens || [];
  let counts = new Map();
  for (let token of tokens) {
    let type = token?._type || String(token);
    counts.set(type, (counts.get(type) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function fmtMs(ms) {
  return ms.toFixed(3).padStart(9);
}

function fmtPct(value) {
  return `${value.toFixed(1)}%`.padStart(7);
}

function printRows(title, rows, { total = null, limit = 18 } = {}) {
  console.log(`\n${title}`);
  console.log("label".padEnd(36), "mean ms", "median", "p95", "calls/run", "share");
  for (let row of rows.slice(0, limit)) {
    let share = total ? (row.mean / total.mean) * 100 : 0;
    console.log(
      row.label.padEnd(36),
      fmtMs(row.mean),
      fmtMs(row.median),
      fmtMs(row.p95),
      row.countPerRun.toFixed(1).padStart(9),
      total ? fmtPct(share) : "       ",
    );
  }
}

function resultObject(input, args, baseline, phase, attribution) {
  let baselineStats = summarizeValues(baseline.values);
  let phaseRows = aggregateRunMaps(phase.runMaps);
  let attributionRows = attribution ? aggregateRunMaps(attribution.runMaps) : [];
  let last = phase.lastCompilation || baseline.lastCompilation;

  return {
    input: {
      file: input.rel,
      lines: input.lines,
      chars: input.chars,
      bytes: input.bytes,
    },
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    options: {
      runs: args.runs,
      warmup: args.warmup,
      attributionRuns: args.attribution ? args.attributionRuns : 0,
      attributionWarmup: args.attribution ? args.attributionWarmup : 0,
    },
    output: {
      jsBytes: Buffer.byteLength(last.js || ""),
      cssBytes: Buffer.byteLength(last.css || ""),
      tokens: last.tokens?.length || 0,
      diagnostics: last.diagnostics?.length || 0,
      tokenTop: tokenSummary(last),
    },
    baseline: baselineStats,
    phases: phaseRows,
    attribution: attributionRows,
  };
}

function printResult(result, args) {
  console.log(`Input: ${result.input.file}`);
  console.log(
    `Size: ${result.input.lines} lines, ${result.input.bytes} bytes; tokens: ${result.output.tokens}`,
  );
  console.log(
    `Output: ${result.output.jsBytes} JS bytes, ${result.output.cssBytes} CSS bytes; diagnostics: ${result.output.diagnostics}`,
  );
  console.log(
    `Node: ${result.environment.node} (${result.environment.platform}/${result.environment.arch})`,
  );
  console.log(
    `\nBaseline compile: mean ${result.baseline.mean.toFixed(3)} ms, median ${result.baseline.median.toFixed(3)} ms, p95 ${result.baseline.p95.toFixed(3)} ms over ${result.baseline.runs} runs`,
  );

  let total = result.phases.find((row) => row.label == "compile.total");
  printRows("Phase timing", result.phases, { total, limit: args.top });

  let rewrite = result.phases.filter((row) => row.label.startsWith("rewrite."));
  printRows("Rewrite steps", rewrite, { total, limit: args.top });

  if (result.attribution.length) {
    let parser = result.attribution.filter((row) =>
      row.label.startsWith("parser.reduce."),
    );
    let visits = result.attribution.filter((row) =>
      row.label.startsWith("node.visit."),
    );
    let codegen = result.attribution.filter(
      (row) => row.label.startsWith("node.c.") || row.label.startsWith("node.js."),
    );
    printRows("Parser reduction attribution", parser, {
      total: result.attribution.find((row) => row.label == "compile.total"),
      limit: args.top,
    });
    printRows("Traversal visit attribution", visits, {
      total: result.attribution.find((row) => row.label == "compile.total"),
      limit: args.top,
    });
    printRows("Codegen attribution", codegen, {
      total: result.attribution.find((row) => row.label == "compile.total"),
      limit: args.top,
    });
  }

  console.log("\nTop tokens");
  for (let item of result.output.tokenTop) {
    console.log(`${item.type.padEnd(16)} ${String(item.count).padStart(5)}`);
  }
}

function main() {
  let args = parseArgs(process.argv.slice(2));
  let input = resolveInput(args.file);

  let baseline = runBaseline(input, args.warmup, args.runs);

  let restorePhase = installPhaseProbes();
  runWarmup(input, args.warmup);
  let phase = runMeasured(input, args.runs);
  restorePhase();

  let attribution = null;
  if (args.attribution && args.attributionRuns > 0) {
    let restoreAttribution = installAttributionProbes();
    runWarmup(input, args.attributionWarmup);
    attribution = runMeasured(input, args.attributionRuns);
    restoreAttribution();
  }

  let result = resultObject(input, args, baseline, phase, attribution);
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result, args);
  }
}

main();
