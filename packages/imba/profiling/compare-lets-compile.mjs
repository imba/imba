#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  let args = {
    a: null,
    b: null,
    labelA: "A",
    labelB: "B",
    root: process.env.LETSDEV_APP_ROOT || "/Users/sindre/repos/letsdev/app",
    all: false,
    rounds: 5,
    runs: 8,
    warmup: 3,
    batches: 3,
    minBatchMs: 0,
    metric: "mean",
    benchmark: "profiling/benchmark-lets-compile.mjs",
    details: false,
  };

  for (let i = 0; i < argv.length; i++) {
    let key = argv[i];
    let next = argv[i + 1];
    if (key == "--a") {
      args.a = next;
      i++;
    } else if (key == "--b") {
      args.b = next;
      i++;
    } else if (key == "--label-a") {
      args.labelA = next;
      i++;
    } else if (key == "--label-b") {
      args.labelB = next;
      i++;
    } else if (key == "--root") {
      args.root = next;
      i++;
    } else if (key == "--rounds") {
      args.rounds = Number(next);
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
    } else if (key == "--metric") {
      args.metric = next;
      i++;
    } else if (key == "--benchmark") {
      args.benchmark = next;
      i++;
    } else if (key == "--all") {
      args.all = true;
    } else if (key == "--details") {
      args.details = true;
    } else if (key == "--help" || key == "-h") {
      console.log(`Usage: node profiling/compare-lets-compile.mjs --a <repo> --b <repo> [options]

Options:
  --a <path>          Baseline checkout/package root
  --b <path>          Candidate checkout/package root
  --label-a <name>    Label for baseline (default: A)
  --label-b <name>    Label for candidate (default: B)
  --root <path>       Lets app root (default: LETSDEV_APP_ROOT or /Users/sindre/repos/letsdev/app)
  --all               Compile every .imba file under root
  --rounds <n>        Alternating A/B rounds (default: 5)
  --runs <n>          Corpus passes per benchmark batch (default: 8)
  --warmup <n>        Warmup corpus passes per child process (default: 3)
  --batches <n>       Timed batches per child process (default: 3)
  --min-batch-ms <n>  Keep each timed batch running for at least n ms
  --metric <name>     msPerCompile field to compare: mean, median, trimmedMean, min (default: mean)
  --benchmark <path>  Benchmark script path inside each checkout
  --details           Include each child benchmark summary in the JSON output
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  if (!args.a || !args.b) {
    throw new Error("Both --a and --b are required");
  }
  for (let key of ["rounds", "runs", "warmup", "batches", "minBatchMs"]) {
    let positive = key == "rounds" || key == "runs" || key == "batches";
    if (!Number.isFinite(args[key]) || args[key] < (positive ? 1 : 0)) {
      throw new Error(`Invalid --${key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${args[key]}`);
    }
  }
  if (!["mean", "median", "trimmedMean", "min"].includes(args.metric)) {
    throw new Error(`Unsupported --metric: ${args.metric}`);
  }

  args.a = path.resolve(args.a);
  args.b = path.resolve(args.b);
  args.root = path.resolve(args.root);
  return args;
}

function stats(values) {
  let sorted = values.slice().sort((a, b) => a - b);
  let sum = values.reduce((total, value) => total + value, 0);
  let mean = sum / values.length;
  let variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) /
    values.length;
  return {
    mean,
    median:
      sorted.length % 2
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stddev: Math.sqrt(variance),
    relativeStddev: mean ? Math.sqrt(variance) / Math.abs(mean) : 0,
  };
}

function runBenchmark(side, repo, args) {
  let script = path.resolve(repo, args.benchmark);
  let childArgs = [
    script,
    "--root",
    args.root,
    "--runs",
    String(args.runs),
    "--warmup",
    String(args.warmup),
    "--batches",
    String(args.batches),
  ];

  if (args.minBatchMs > 0) {
    childArgs.push("--min-batch-ms", String(args.minBatchMs));
  }
  if (args.all) {
    childArgs.push("--all");
  }

  let started = Date.now();
  let result = spawnSync(process.execPath, childArgs, {
    cwd: repo,
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
    },
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.status !== 0) {
    let message = result.stderr || result.stdout || `exit ${result.status}`;
    throw new Error(`${side} benchmark failed in ${repo}:\n${message}`);
  }

  let summary;
  try {
    summary = JSON.parse(result.stdout);
  } catch (err) {
    throw new Error(`${side} benchmark did not emit JSON:\n${result.stdout}`);
  }

  return {
    side,
    repo,
    elapsedMs: Date.now() - started,
    metric: summary.msPerCompile[args.metric],
    summary,
  };
}

function main() {
  let args = parseArgs(process.argv.slice(2));
  let rounds = [];

  for (let round = 0; round < args.rounds; round++) {
    let order =
      round % 2 == 0
        ? [
            ["a", args.a],
            ["b", args.b],
          ]
        : [
            ["b", args.b],
            ["a", args.a],
          ];
    let results = [];
    for (let [side, repo] of order) {
      results.push(runBenchmark(side, repo, args));
    }
    let a = results.find((result) => result.side == "a");
    let b = results.find((result) => result.side == "b");
    let report = {
      round: round + 1,
      order: order.map(([side]) => side),
      a: a.metric,
      b: b.metric,
      bOverA: b.metric / a.metric,
      bSpeedup: 1 - b.metric / a.metric,
      elapsedMs: {
        a: a.elapsedMs,
        b: b.elapsedMs,
      },
    };

    if (args.details) {
      report.summaries = {
        a: a.summary,
        b: b.summary,
      };
    }

    rounds.push(report);
  }

  let aValues = rounds.map((round) => round.a);
  let bValues = rounds.map((round) => round.b);
  let ratios = rounds.map((round) => round.bOverA);
  let speedups = rounds.map((round) => round.bSpeedup);

  console.log(
    JSON.stringify(
      {
        labels: {
          a: args.labelA,
          b: args.labelB,
        },
        repos: {
          a: args.a,
          b: args.b,
        },
        metric: args.metric,
        root: args.root,
        mode: args.all ? "all" : "selected",
        rounds: args.rounds,
        runs: args.runs,
        warmup: args.warmup,
        batches: args.batches,
        minBatchMs: args.minBatchMs,
        msPerCompile: {
          a: stats(aValues),
          b: stats(bValues),
        },
        bOverA: stats(ratios),
        bSpeedup: stats(speedups),
        results: rounds,
      },
      null,
      2,
    ),
  );
}

main();
