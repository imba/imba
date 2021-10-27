const { lstat, lstatSync, readdir, readdirSync, Dirent } = require("fs");
const { sep } = require("path");

/* istanbul ignore next */
if (!Dirent) {
  module.exports.readdir = function(dir, _, callback) {
    readdir(dir, (err, files) => {
      if (err) return process.nextTick(callback, err, null);
      if (!files.length) return process.nextTick(callback, null, []);

      let dirents = [];

      for (let i = 0; i < files.length; ++i) {
        let name = files[i];
        let path = `${dir}${sep}${name}`;
        lstat(path, (err, stat) => {
          if (err) return process.nextTick(callback, err, null);
          dirents[dirents.length] = getDirent(name, stat);
          if (dirents.length === files.length) {
            process.nextTick(callback, null, dirents);
          }
        });
      }
    });
  };

  module.exports.readdirSync = function(dir) {
    const files = readdirSync(dir);
    let dirents = [];
    for (let i = 0; i < files.length; ++i) {
      let name = files[i];
      let path = `${dir}${sep}${name}`;
      const stat = lstatSync(path);
      dirents[dirents.length] = getDirent(name, stat);
    }
    return dirents;
  };

  function getDirent(name, stat) {
    return {
      name,
      isFile: () => stat.isFile(),
      isDirectory: () => stat.isDirectory(),
    };
  }
} else {
  module.exports = { readdirSync, readdir };
}
