var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __exportStar = (target, module3, desc) => {
  __markAsModule(target);
  if (module3 && typeof module3 === "object" || typeof module3 === "function") {
    for (let key of __getOwnPropNames(module3))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module3[key], enumerable: !(desc = __getOwnPropDesc(module3, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module3) => {
  if (module3 && module3.__esModule)
    return module3;
  return __exportStar(__defProp(module3 != null ? __create(__getProtoOf(module3)) : {}, "default", {value: module3, enumerable: true}), module3);
};

// register.imba
var path = __toModule(require("path"));
var fs = __toModule(require("fs"));
var module2 = __toModule(require("module"));

// src/imba/utils.imba
var sys$1 = Symbol.for("#type");
var sys$18 = Symbol.for("#__listeners__");
function deserializeData(data, reviver = null) {
  var $0$1;
  let objects = {};
  let reg = /\$\$\d+\$\$/;
  let parser = function(key, value) {
    if (typeof value == "string") {
      if (value[0] == "$" && reg.test(value)) {
        return objects[value] || (objects[value] = reviver ? reviver(value) : {});
      }
      ;
    }
    ;
    return value;
  };
  let parsed = JSON.parse(data, parser);
  if (parsed.$$) {
    for (let sys$4 = parsed.$$, sys$2 = 0, sys$3 = Object.keys(sys$4), sys$5 = sys$3.length, k, v, obj; sys$2 < sys$5; sys$2++) {
      k = sys$3[sys$2];
      v = sys$4[k];
      if (obj = objects[k]) {
        Object.assign(obj, v);
      }
      ;
    }
    ;
    $0$1 = parsed.$$, delete parsed.$$, $0$1;
  }
  ;
  return parsed;
}

// register.imba
var _resolveFilename = module2.Module._resolveFilename;
var cwd = process.cwd();
var manifest = null;
if (process.env.IMBA_MANIFEST_PATH) {
  manifest = deserializeData(fs.default.readFileSync(process.env.IMBA_MANIFEST_PATH, "utf-8"));
  manifest.outdir = path.default.dirname(process.env.IMBA_MANIFEST_PATH);
}
var originalJSLoader = module2.Module._extensions[".js"];
var oldLoaders = {};
var exts = [".imba", ".js", ".ts"];
manifest && exts.map(function(ext) {
  const oldLoader = oldLoaders[ext] = module2.Module._extensions[ext] || originalJSLoader;
  return module2.Module._extensions[ext] = function(mod, filename) {
    let input, src;
    let rel = path.default.relative(cwd, filename);
    if (input = manifest.inputs.node[rel]) {
      rel = input.js.path;
    }
    ;
    if (src = manifest.outputs[rel]) {
      let raw = fs.default.readFileSync(path.default.resolve(manifest.outdir, src.path), "utf-8");
      return mod._compile(raw, filename);
    }
    ;
    return oldLoader(mod, filename);
  };
});
module2.Module._resolveFilename = function(name, from) {
  if (name == "imba") {
    return path.default.resolve(__dirname, "dist", "node", "imba.js");
  }
  ;
  let res = _resolveFilename.apply(module2.Module, arguments);
  return res;
};
