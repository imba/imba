// src/imba/utils.imba
function iter$(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
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
function patchManifest(prev, curr) {
  var $0$3, $0$2, $0$4, $0$5;
  let origs = {};
  let diff = {
    added: [],
    changed: [],
    removed: [],
    all: [],
    urls: {}
  };
  if (prev.assets) {
    for (let sys$6 = 0, sys$7 = iter$(prev.assets), sys$8 = sys$7.length; sys$6 < sys$8; sys$6++) {
      let item = sys$7[sys$6];
      let ref = item.originalPath || item.path;
      origs[ref] = item;
      if (item.url) {
        ($0$3 = curr.urls)[$0$2 = item.url] || ($0$3[$0$2] = item);
      }
      ;
    }
    ;
  }
  ;
  for (let sys$9 = 0, sys$10 = iter$(curr.assets || []), sys$11 = sys$10.length; sys$9 < sys$11; sys$9++) {
    let item = sys$10[sys$9];
    let ref = item.originalPath || item.path;
    let orig = origs[ref];
    if (item.url && prev.urls) {
      prev.urls[item.url] = item;
    }
    ;
    if (orig) {
      if (orig.hash != item.hash) {
        orig.invalidated = Date.now();
        orig.replacedBy = item;
        item.replaces = orig;
        diff.changed.push(item);
        diff.all.push(item);
        if (orig == prev.main) {
          diff.main = item;
        }
        ;
      }
      ;
      $0$4 = origs[ref], delete origs[ref], $0$4;
    } else {
      diff.added.push(item);
      diff.all.push(item);
    }
    ;
  }
  ;
  for (let sys$12 = 0, sys$13 = Object.keys(origs), sys$14 = sys$13.length, path, item; sys$12 < sys$14; sys$12++) {
    path = sys$13[sys$12];
    item = origs[path];
    item.removed = Date.now();
    diff.all.push(item);
  }
  ;
  for (let sys$15 = 0, sys$16 = iter$(diff.all), sys$17 = sys$16.length; sys$15 < sys$17; sys$15++) {
    let item = sys$16[sys$15];
    let typ = diff[$0$5 = item.type] || (diff[$0$5] = []);
    typ.push(item);
  }
  ;
  diff.removed = Object.values(origs);
  curr.changes = diff;
  return curr;
}

// src/devtools/client.imba
function iter$2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var doc = globalThis.document;
var Manifest = class {
  constructor() {
    this.data = {};
  }
  get assetsDir() {
    return this.data.assetsDir;
  }
  get assetsUrl() {
    return this.data.assetsUrl;
  }
  get changes() {
    return this.data.changes || {};
  }
  get inputs() {
    return this.data.inputs;
  }
  get urls() {
    return this.data.urls;
  }
  get main() {
    return this.data.main;
  }
  init(raw) {
    return this.update(raw);
  }
  update(raw) {
    if (typeof raw == "string") {
      raw = deserializeData(raw);
    }
    ;
    this.data = patchManifest(this.data, raw);
    return this.data.changes;
  }
};
var DevTools = class {
  constructor() {
    this.start();
    this.manifest = new Manifest({});
    this;
  }
  refresh(changes) {
    let dirty = {
      css: [],
      js: []
    };
    for (let sheet of iter$2(doc.styleSheets)) {
      let asset;
      let url = sheet.ownerNode.getAttribute("href");
      if (asset = this.manifest.urls[url]) {
        if (asset.replacedBy) {
          sheet.ownerNode.href = asset.replacedBy.url;
        }
        ;
      }
      ;
    }
    ;
    for (let el of iter$2(doc.querySelectorAll("script[src]"))) {
      let asset1;
      if (asset1 = this.manifest.urls[el.getAttribute("src")]) {
        if (asset1.replacedBy) {
          dirty.js.push(asset1);
        }
        ;
      }
      ;
    }
    ;
    if (dirty.js.length) {
      console.log("js changed - reload?", dirty.js);
      doc.location.reload();
    }
    ;
    return this;
  }
  start() {
    var self = this;
    if (this.socket) {
      return;
    }
    ;
    this.socket = new EventSource("/__hmr__");
    this.socket.onmessage = function(e) {
      return console.log("sse.onmessage", e);
    };
    this.socket.addEventListener("paused", function(e) {
      return console.log("server paused");
    });
    this.socket.addEventListener("state", function(e) {
      let json = JSON.parse(e.data);
      return console.log("server state", json);
    });
    this.socket.addEventListener("init", function(e) {
      let json = JSON.parse(e.data);
      return self.manifest.init(json);
    });
    this.socket.addEventListener("manifest", function(e) {
      let json = JSON.parse(e.data);
      let changes = self.manifest.update(json);
      console.log("Changes for manifest", changes);
      return self.refresh(changes);
    });
    this.socket.addEventListener("invalidate", function(e) {
      let origin = globalThis.window.location.origin;
      let data = JSON.parse(e.data).map(function(_0) {
        return new URL(_0, origin);
      });
      let dirty = {css: [], js: []};
      for (let sheet of iter$2(doc.styleSheets)) {
        let url = new URL(sheet.href, origin);
        let match = data.find(function(_0) {
          return _0.pathname == url.pathname;
        });
        if (match) {
          console.log("reloading stylesheet " + url.pathname);
          sheet.ownerNode.href = match.toString();
          dirty.css.push([sheet, match]);
        }
        ;
      }
      ;
      for (let item of iter$2(doc.getElementsByTagName("script"))) {
        if (!item.src) {
          continue;
        }
        ;
        let url = new URL(item.src, origin);
        let match = data.find(function(_0) {
          return _0.pathname == url.pathname;
        });
        if (match) {
          dirty.js.push([item, match]);
        }
        ;
      }
      ;
      if (dirty.js.length) {
        console.log("js changed - reload?", dirty.js);
        doc.location.reload();
      }
      ;
      return;
    });
    this.socket.addEventListener("reload", function(e) {
      console.log("asked to reload by server");
      return doc.location.reload();
    });
    return this.socket.onerror = function(e) {
      return console.log("hmr disconnected", e);
    };
  }
};
globalThis.imba_devtools = new DevTools();
