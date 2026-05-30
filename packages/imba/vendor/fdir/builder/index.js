const APIBuilder = require("./apiBuilder");
var globCache = {};

function globToRegex(pattern) {
  let source = "^";
  for (let i = 0; i < pattern.length; i++) {
    const chr = pattern[i];
    if (chr === "*") {
      if (pattern[i + 1] === "*") {
        i++;
        if (pattern[i + 1] === "/") {
          i++;
          source += "(?:.*\\/)?";
        } else {
          source += ".*";
        }
      } else {
        source += "[^\\/]*";
      }
    } else if (chr === "?") {
      source += "[^\\/]";
    } else if (chr === "/") {
      source += "\\/";
    } else {
      source += chr.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
    }
  }
  return new RegExp(source + "$");
}

function compileGlob(patterns) {
  const regexes = patterns.map((pattern) => globToRegex(String(pattern)));
  return (path) => regexes.some((regex) => regex.test(path));
}

function Builder() {
  this.maxDepth = Infinity;
  this.suppressErrors = true;
  this.filters = [];
}

Builder.prototype.crawl = function(path) {
  return new APIBuilder(path, this);
};

Builder.prototype.crawlWithOptions = function(path, options) {
  if (!options.maxDepth) options.maxDepth = Infinity;
  options.groupVar = options.group;
  options.onlyCountsVar = options.onlyCounts;
  options.excludeFn = options.exclude;
  options.filters = options.filters || [];
  return new APIBuilder(path, options);
};

Builder.prototype.withBasePath = function() {
  this.includeBasePath = true;
  return this;
};

Builder.prototype.withDirs = function() {
  this.includeDirs = true;
  return this;
};

Builder.prototype.withMaxDepth = function(depth) {
  this.maxDepth = depth;
  return this;
};

Builder.prototype.withFullPaths = function() {
  this.resolvePaths = true;
  this.includeBasePath = true;
  return this;
};

Builder.prototype.withErrors = function() {
  this.suppressErrors = false;
  return this;
};

Builder.prototype.group = function() {
  this.groupVar = true;
  return this;
};

Builder.prototype.normalize = function() {
  this.normalizePath = true;
  return this;
};

Builder.prototype.filter = function(filterFn) {
  this.filters.push(filterFn);
  return this;
};

Builder.prototype.glob = function(...patterns) {
  var isMatch = globCache[patterns.join()];
  if (!isMatch) {
    isMatch = compileGlob(patterns);
    globCache[patterns.join()] = isMatch;
  }
  this.filters.push((path) => isMatch(path));
  return this;
};

Builder.prototype.exclude = function(excludeFn) {
  this.excludeFn = excludeFn;
  return this;
};

Builder.prototype.onlyCounts = function() {
  this.onlyCountsVar = true;
  return this;
};

module.exports = Builder;
