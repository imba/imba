const { promise, callback } = require("../api/async.js");
const sync = require("../api/sync");

function APIBuilder(path, options) {
  this.dir = path;
  this.options = options;
}

APIBuilder.prototype.withPromise = function() {
  return promise(this.dir, this.options);
};

APIBuilder.prototype.withCallback = function(cb) {
  callback(this.dir, this.options, cb);
};

APIBuilder.prototype.sync = function() {
  return sync(this.dir, this.options);
};

module.exports = APIBuilder;
