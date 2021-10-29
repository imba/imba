const { sep, normalize } = require("path");

function cleanPath(dirPath) {
  let normalized = normalize(dirPath);

  // to account for / path
  if (normalized.length > 1 && normalized[normalized.length - 1] === sep)
    normalized = normalized.substring(0, normalized.length - 1);
  return normalized;
}

module.exports = { cleanPath };
