#!/usr/bin/env node
import fs from "node:fs";
import inspector from "node:inspector";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";

import * as compiler from "../src/compiler/compiler.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  let args = {
    file: path.join("profiling", "sample1.imba"),
    runs: 1200,
    warmup: 200,
    top: 30,
    writeProfile: null,
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
    } else if (key == "--top") {
      args.top = Number(next);
      i++;
    } else if (key == "--write-profile") {
      args.writeProfile = next;
      i++;
    } else if (key == "--help" || key == "-h") {
      console.log(`Usage: node profiling/profile-parse-cpu.mjs [options]

Options:
  --file <path>            Imba file to parse (default: profiling/sample1.imba)
  --runs <n>               profiled parse runs (default: 1200)
  --warmup <n>             warmup parse runs before profiling (default: 200)
  --top <n>                number of rows to print per table (default: 30)
  --write-profile <path>   write raw .cpuprofile JSON
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  return args;
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

function parseOnce(input) {
  return compiler.parse(input.code, {
    sourcePath: input.rel,
    raiseErrors: true,
    config: {},
  });
}

function post(session, method, params = {}) {
  return new Promise((resolve, reject) => {
    session.post(method, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function sourceLine(url, lineNumber) {
  if (!url.startsWith("file://")) return "";
  let file = fileURLToPath(url);
  try {
    let line = fs.readFileSync(file, "utf8").split(/\r\n|\r|\n/)[lineNumber];
    return line ? line.trim().slice(0, 120) : "";
  } catch {
    return "";
  }
}

function shortUrl(url) {
  if (!url) return "(native)";
  if (url.startsWith("file://")) {
    let file = fileURLToPath(url);
    return path.relative(packageRoot, file).split(path.sep).join("/");
  }
  return url;
}

function summarizeProfile(profile, top) {
  let nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  let parents = new Map();
  for (let node of profile.nodes) {
    for (let child of node.children || []) {
      parents.set(child, node.id);
    }
  }

  let selfUs = new Map();
  let inclusiveUs = new Map();
  let totalUs = 0;
  let samples = profile.samples || [];
  let deltas = profile.timeDeltas || [];

  for (let i = 0; i < samples.length; i++) {
    let id = samples[i];
    let delta = deltas[i] || 0;
    totalUs += delta;
    selfUs.set(id, (selfUs.get(id) || 0) + delta);

    let curr = id;
    while (curr) {
      inclusiveUs.set(curr, (inclusiveUs.get(curr) || 0) + delta);
      curr = parents.get(curr);
    }
  }

  function rowFor([id, us], type) {
    let node = nodes.get(id);
    let frame = node.callFrame;
    let url = shortUrl(frame.url);
    let line = frame.lineNumber + 1;
    return {
      id,
      type,
      ms: us / 1000,
      percent: totalUs ? (us / totalUs) * 100 : 0,
      functionName: frame.functionName || "(anonymous)",
      location: `${url}:${line}`,
      source: sourceLine(frame.url, frame.lineNumber),
    };
  }

  let self = [...selfUs.entries()]
    .map((entry) => rowFor(entry, "self"))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, top);

  let inclusive = [...inclusiveUs.entries()]
    .map((entry) => rowFor(entry, "inclusive"))
    .sort((a, b) => b.ms - a.ms)
    .filter((row) => row.location.includes("src/compiler/"))
    .slice(0, top);

  let byFile = new Map();
  for (let [id, us] of selfUs) {
    let node = nodes.get(id);
    let file = shortUrl(node.callFrame.url);
    if (!file.includes("src/compiler/")) continue;
    byFile.set(file, (byFile.get(file) || 0) + us);
  }

  let files = [...byFile.entries()]
    .map(([file, us]) => ({
      file,
      ms: us / 1000,
      percent: totalUs ? (us / totalUs) * 100 : 0,
    }))
    .sort((a, b) => b.ms - a.ms);

  return {
    totalMs: totalUs / 1000,
    sampleCount: samples.length,
    self,
    inclusive,
    files,
  };
}

function printRows(title, rows) {
  console.log(`\n${title}`);
  console.log("ms".padStart(9), "%".padStart(7), "function".padEnd(28), "location");
  for (let row of rows) {
    console.log(
      row.ms.toFixed(3).padStart(9),
      `${row.percent.toFixed(1)}%`.padStart(7),
      row.functionName.slice(0, 27).padEnd(28),
      row.location,
    );
    if (row.source) {
      console.log(" ".repeat(47) + row.source);
    }
  }
}

async function main() {
  let args = parseArgs(process.argv.slice(2));
  let input = resolveInput(args.file);

  for (let i = 0; i < args.warmup; i++) {
    parseOnce(input);
  }

  let session = new inspector.Session();
  session.connect();
  await post(session, "Profiler.enable");
  await post(session, "Profiler.start");

  let started = performance.now();
  for (let i = 0; i < args.runs; i++) {
    parseOnce(input);
  }
  let elapsedMs = performance.now() - started;

  let { profile } = await post(session, "Profiler.stop");
  session.disconnect();

  if (args.writeProfile) {
    let output = path.resolve(packageRoot, args.writeProfile);
    fs.writeFileSync(output, JSON.stringify(profile));
  }

  let summary = summarizeProfile(profile, args.top);
  console.log(`Input: ${input.rel}`);
  console.log(`Runs: ${args.runs}; warmup: ${args.warmup}`);
  console.log(`Wall time: ${elapsedMs.toFixed(3)} ms (${(elapsedMs / args.runs).toFixed(3)} ms/parse)`);
  console.log(`Profile samples: ${summary.sampleCount}; sampled CPU: ${summary.totalMs.toFixed(3)} ms`);

  console.log("\nSelf time by compiler file");
  console.log("ms".padStart(9), "%".padStart(7), "file");
  for (let row of summary.files.slice(0, args.top)) {
    console.log(
      row.ms.toFixed(3).padStart(9),
      `${row.percent.toFixed(1)}%`.padStart(7),
      row.file,
    );
  }

  printRows("Top self-time locations", summary.self);
  printRows("Top inclusive compiler locations", summary.inclusive);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
