import * as path from "path";
import * as os from "os";
// eslint-disable-next-line node/no-missing-import
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

let timeout = process.env.DEBUG
  ? 500000000
  : process.env.CI
  ? 50000
  : 30000;

const __dir = path.dirname(fileURLToPath(import.meta.url));
const utilsPath = path.resolve(__dir, "./testUtils");

// too many threads cause vite-ssr tests to fail randomly, limit to at most 33%
const fractionOfAvailableThreads = (f: number) =>
  Math.max(1, Math.floor((os.cpus()?.length || 1) * f));
const numThreads = fractionOfAvailableThreads(1 / 3);
const nodeVersion = parseInt(
  process.versions.node.substring(0, process.versions.node.indexOf(".")),
  10,
);

// start with vitest default excludes
const exclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/cypress/**",
  "**/.{idea,git,cache,output,temp}/**",
];
// if (nodeVersion < 16) {
// 	// e2e projects starting with kit- or ending with -kit may require node16
// 	exclude.push('packages/e2e-tests/kit-*/**', 'packages/e2e-tests/*-kit/**');
// }
export default defineConfig({
  resolve: {
    alias: {
      "~utils": utilsPath,
    },
  },
  test: {
    include: ["./**/*.spec.[tj]s"],
    exclude,
    setupFiles: ["./vitestSetup.ts"],
    globalSetup: ["./vitestGlobalSetup.ts"],
    testTimeout: +timeout,
    hookTimeout: +timeout,
    globals: true,
    reporters: "dot",
    onConsoleLog(log) {
      if (log.match(/experimental|jit engine|emitted file/i)) return false;
    },
    minThreads: numThreads,
    maxThreads: numThreads,
  },
  esbuild: {
    target: "node16",
  },
});
