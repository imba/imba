const cached = {};

function resolvePaths(obj, cwd) {
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = resolvePaths(obj[i], cwd);
    }
  } else if (typeof obj == "string") {
    return obj.replace(/^\.\//, cwd + "/");
  } else if (obj && typeof obj == "object") {
    for (let [key, value] of Object.entries(obj)) {
      let alt = key.replace(/^\.\//, cwd + "/");
      obj[alt] = resolvePaths(value, cwd);
      if (alt != key) {
        delete obj[key];
      }
    }
  }
  return obj;
}

export function resolveConfigFile(dir, { path, fs }) {
  if (!path || !fs || !dir || dir == path.dirname(dir)) {
    return null;
  }

  let src = path.resolve(dir, "package.json");
  if (cached[src]) {
    return cached[src];
  }

  if (cached[src] !== null && fs.existsSync(src)) {
    let pkg = JSON.parse(fs.readFileSync(src, "utf8"));
    let config = (pkg.imba ||= {});

    resolvePaths(config, dir);
    config.package = pkg;
    config.cwd ||= dir;
    return (cached[src] = config);
  } else {
    cached[src] = null;
  }

  return resolveConfigFile(path.dirname(dir), { path, fs });
}
