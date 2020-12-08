const { sep } = require("path");

/* GET ARRAY */
module.exports.getArray = function(state) {
  return state.paths;
};
module.exports.getArrayGroup = function() {
  return [""].slice(0, 0);
};

/** PUSH FILE */
module.exports.pushFileFilterAndCount = function(filters) {
  return function(filename, _files, _dir, state) {
    if (filters.some((f) => f(filename))) state.counts.files++;
  };
};

module.exports.pushFileFilter = function(filters) {
  return function(filename, files) {
    if (filters.some((f) => f(filename))) files.push(filename);
  };
};

module.exports.pushFileCount = function(_filename, _files, _dir, state) {
  state.counts.files++;
};
module.exports.pushFile = function(filename, files) {
  files.push(filename);
};

/** PUSH DIR */
module.exports.pushDir = function(dirPath, paths) {
  paths.push(dirPath);
};

/** JOIN PATH */
module.exports.joinPathWithBasePath = function(filename, dir) {
  return `${dir}${sep}${filename}`;
};
module.exports.joinPath = function(filename) {
  return filename;
};

/** WALK DIR */
module.exports.walkDirExclude = function(exclude) {
  return function(walk, state, path, dir, currentDepth, callback) {
    if (!exclude(dir,path,currentDepth)) {
      module.exports.walkDir(walk, state, path, dir, currentDepth, callback);
    }
  };
};

module.exports.walkDir = function(
  walk,
  state,
  path,
  _dir,
  currentDepth,
  callback
) {
  state.queue++;
  state.counts.dirs++;
  walk(state, path, currentDepth, callback);
};

/** GROUP FILES */
module.exports.groupFiles = function(dir, files, state) {
  state.counts.files += files.length;
  state.paths.push({ dir, files });
};
module.exports.empty = function() {};

/** CALLBACK INVOKER */
module.exports.callbackInvokerOnlyCountsSync = function(state) {
  return state.counts;
};
module.exports.callbackInvokerDefaultSync = function(state) {
  return state.paths;
};

module.exports.callbackInvokerOnlyCountsAsync = callbackInvokerBuilder(
  "counts"
);
module.exports.callbackInvokerDefaultAsync = callbackInvokerBuilder("paths");

function report(err, callback, output, suppressErrors) {
  if (err) {
    if (!suppressErrors) callback(err, null);
    return;
  }
  callback(null, output);
}

function callbackInvokerBuilder(output) {
  return function(err, state) {
    report(err, state.callback, state[output], state.options.suppressErrors);
  };
}
