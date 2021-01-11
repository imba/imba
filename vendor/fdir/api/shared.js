const { sep, resolve: pathResolve } = require("path");
const { cleanPath } = require("../utils");
const fns = require("./fns");
const readdirOpts = { withFileTypes: true };

function init(dir, options, callback, isSync) {
  if (options.resolvePaths) dir = pathResolve(dir);
  if (options.normalizePath) dir = cleanPath(dir);

  /* We use a local state object instead of direct global variables so that each function
   * execution is independent of each other.
   */
  const state = {
    // Perf: we explicitly tell the compiler to optimize for String arrays
    paths: [""].slice(0, 0),
    queue: 0,
    counts: { files: 0, dirs: 0 },
    options,
    callback,
  };

  /*
   * Perf: We conditionally change functions according to options. This gives a slight
   * performance boost. Since these functions are so small, they are automatically inlined
   * by the engine so there's no function call overhead (in most cases).
   */
  buildFunctions(options, isSync);

  return { state, callbackInvoker, dir };
}

function walkSingleDir(walk, state, dir, dirents, currentDepth, callback) {
  pushDir(dir, state.paths);
  // in cases where we have / as path
  if (dir === sep) dir = "";

  const files = getArray(state);

  for (var i = 0; i < dirents.length; ++i) {
    const dirent = dirents[i];

    if (dirent.isFile()) {
      const filename = joinPath(dirent.name, dir);
      pushFile(filename, files, dir, state);
    } else if (dirent.isDirectory()) {
      let dirPath = `${dir}${sep}${dirent.name}`;
      walkDir(walk, state, dirPath, dirent.name, currentDepth - 1, callback);
    }
  }

  groupFiles(dir, files, state);
}

function buildFunctions(options, isSync) {
  const {
    filters,
    onlyCountsVar,
    includeBasePath,
    includeDirs,
    groupVar,
    excludeFn,
  } = options;

  buildPushFile(filters, onlyCountsVar);

  pushDir = includeDirs ? fns.pushDir : fns.empty;

  // build function for joining paths
  joinPath = includeBasePath ? fns.joinPathWithBasePath : fns.joinPath;

  // build recursive walk directory function
  walkDir = excludeFn ? fns.walkDirExclude(excludeFn) : fns.walkDir;

  // build groupFiles function for grouping files
  groupFiles = groupVar ? fns.groupFiles : fns.empty;
  getArray = groupVar ? fns.getArrayGroup : fns.getArray;

  buildCallbackInvoker(onlyCountsVar, isSync);
}

module.exports = { buildFunctions, init, walkSingleDir, readdirOpts };

function buildPushFile(filters, onlyCountsVar) {
  if (filters.length && onlyCountsVar) {
    pushFile = fns.pushFileFilterAndCount(filters);
  } else if (filters.length) {
    pushFile = fns.pushFileFilter(filters);
  } else if (onlyCountsVar) {
    pushFile = fns.pushFileCount;
  } else {
    pushFile = fns.pushFile;
  }
}

function buildCallbackInvoker(onlyCountsVar, isSync) {
  if (onlyCountsVar) {
    callbackInvoker = isSync
      ? fns.callbackInvokerOnlyCountsSync
      : fns.callbackInvokerOnlyCountsAsync;
  } else {
    callbackInvoker = isSync
      ? fns.callbackInvokerDefaultSync
      : fns.callbackInvokerDefaultAsync;
  }
}

/* Dummies that will be filled later conditionally based on options */
var pushFile = fns.empty;
var pushDir = fns.empty;
var walkDir = fns.empty;
var joinPath = fns.empty;
var groupFiles = fns.empty;
var callbackInvoker = fns.empty;
var getArray = fns.empty;
