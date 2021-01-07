var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  __markAsModule(target);
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", {value: module2, enumerable: true}), module2);
};

// src/compiler/token.imba1
var require_token = __commonJS((exports2) => {
  var self2 = {};
  var TOK = exports2.TOK = {};
  var TTERMINATOR = TOK.TERMINATOR = 1;
  var TIDENTIFIER = TOK.IDENTIFIER = TOK.IVAR = 2;
  var CONST = TOK.CONST = 3;
  var VAR = TOK.VAR = 4;
  var IF = TOK.IF = 5;
  var ELSE = TOK.ELSE = 6;
  var DEF = TOK.DEF = 7;
  function Token2(type, value, loc, len) {
    this._type = type;
    this._value = value;
    this._loc = loc != null ? loc : -1;
    this._len = len != null ? len : this._value.length;
    this._meta = null;
    this.generated = false;
    this.newLine = false;
    this.spaced = false;
    this.call = false;
    return this;
  }
  exports2.Token = Token2;
  Token2.prototype.type = function() {
    return this._type;
  };
  Token2.prototype.value = function() {
    return this._value;
  };
  Token2.prototype.traverse = function() {
    return;
  };
  Token2.prototype.c = function() {
    return "" + this._value;
  };
  Token2.prototype.prepend = function(str) {
    this._value = str + this._value;
    return this;
  };
  Token2.prototype.toString = function() {
    return this._value;
  };
  Token2.prototype.charAt = function(i) {
    return this._value.charAt(i);
  };
  Token2.prototype.slice = function(i) {
    return this._value.slice(i);
  };
  Token2.prototype.cloneSlice = function(i) {
    return new Token2(this._type, this.slice(i), this._loc, this._len);
  };
  Token2.prototype.region = function() {
    return [this._loc, this._loc + this._len];
  };
  Token2.prototype.startLoc = function() {
    return this._loc;
  };
  Token2.prototype.endLoc = function() {
    return this._loc + this._len;
  };
  exports2.lex = self2.lex = function() {
    var token3 = this.tokens[this.pos++];
    var ttag;
    if (token3) {
      ttag = token3._type;
      this.yytext = token3;
    } else {
      ttag = "";
    }
    ;
    return ttag;
  };
  exports2.token = self2.token = function(typ, val) {
    return new Token2(typ, val, -1, 0);
  };
  exports2.typ = self2.typ = function(tok) {
    return tok._type;
  };
  exports2.val = self2.val = function(tok) {
    return tok._value;
  };
  exports2.line = self2.line = function(tok) {
    return tok._line;
  };
  exports2.loc = self2.loc = function(tok) {
    return tok._loc;
  };
  exports2.setTyp = self2.setTyp = function(tok, v) {
    return tok._type = v;
  };
  exports2.setVal = self2.setVal = function(tok, v) {
    return tok._value = v;
  };
  exports2.setLine = self2.setLine = function(tok, v) {
    return tok._line = v;
  };
  exports2.setLoc = self2.setLoc = function(tok, v) {
    return tok._loc = v;
  };
  var LBRACKET = exports2.LBRACKET = new Token2("{", "{", 0, 0, 0);
  var RBRACKET = exports2.RBRACKET = new Token2("}", "}", 0, 0, 0);
  var LPAREN = exports2.LPAREN = new Token2("(", "(", 0, 0, 0);
  var RPAREN = exports2.RPAREN = new Token2(")", ")", 0, 0, 0);
  LBRACKET.generated = true;
  RBRACKET.generated = true;
  LPAREN.generated = true;
  RPAREN.generated = true;
  var INDENT = exports2.INDENT = new Token2("INDENT", "2", 0, 0, 0);
  var OUTDENT = exports2.OUTDENT = new Token2("OUTDENT", "2", 0, 0, 0);
});

// vendor/sha1.js
var require_sha1 = __commonJS((exports, module) => {
  /*
   * [js-sha1]{@link https://github.com/emn178/js-sha1}
   *
   * @version 0.6.0
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2017
   * @license MIT
   */
  (function() {
    "use strict";
    var root = typeof window === "object" ? window : {};
    var NODE_JS = !root.JS_SHA1_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
    if (NODE_JS) {
      root = global;
    }
    var COMMON_JS = !root.JS_SHA1_NO_COMMON_JS && typeof module === "object" && module.exports;
    var AMD = typeof define === "function" && define.amd;
    var HEX_CHARS = "0123456789abcdef".split("");
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];
    var OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"];
    var blocks = [];
    var createOutputMethod = function(outputType) {
      return function(message) {
        return new Sha1(true).update(message)[outputType]();
      };
    };
    var createMethod = function() {
      var method = createOutputMethod("hex");
      if (NODE_JS) {
      }
      method.create = function() {
        return new Sha1();
      };
      method.update = function(message) {
        return method.create().update(message);
      };
      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
        var type = OUTPUT_TYPES[i];
        method[type] = createOutputMethod(type);
      }
      return method;
    };
    var nodeWrap = function(method) {
      var crypto = eval("require('crypto')");
      var Buffer = eval("require('buffer').Buffer");
      var nodeMethod = function(message) {
        if (typeof message === "string") {
          return crypto.createHash("sha1").update(message, "utf8").digest("hex");
        } else if (message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (message.length === void 0) {
          return method(message);
        }
        return crypto.createHash("sha1").update(new Buffer(message)).digest("hex");
      };
      return nodeMethod;
    };
    function Sha1(sharedMemory) {
      if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
      } else {
        this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
      this.h0 = 1732584193;
      this.h1 = 4023233417;
      this.h2 = 2562383102;
      this.h3 = 271733878;
      this.h4 = 3285377520;
      this.block = this.start = this.bytes = this.hBytes = 0;
      this.finalized = this.hashed = false;
      this.first = true;
    }
    Sha1.prototype.update = function(message) {
      if (this.finalized) {
        return;
      }
      var notString = typeof message !== "string";
      if (notString && message.constructor === root.ArrayBuffer) {
        message = new Uint8Array(message);
      }
      var code, index = 0, i, length = message.length || 0, blocks = this.blocks;
      while (index < length) {
        if (this.hashed) {
          this.hashed = false;
          blocks[0] = this.block;
          blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        if (notString) {
          for (i = this.start; index < length && i < 64; ++index) {
            blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
          }
        } else {
          for (i = this.start; index < length && i < 64; ++index) {
            code = message.charCodeAt(index);
            if (code < 128) {
              blocks[i >> 2] |= code << SHIFT[i++ & 3];
            } else if (code < 2048) {
              blocks[i >> 2] |= (192 | code >> 6) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else if (code < 55296 || code >= 57344) {
              blocks[i >> 2] |= (224 | code >> 12) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else {
              code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
              blocks[i >> 2] |= (240 | code >> 18) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code >> 12 & 63) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            }
          }
        }
        this.lastByteIndex = i;
        this.bytes += i - this.start;
        if (i >= 64) {
          this.block = blocks[16];
          this.start = i - 64;
          this.hash();
          this.hashed = true;
        } else {
          this.start = i;
        }
      }
      if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
      }
      return this;
    };
    Sha1.prototype.finalize = function() {
      if (this.finalized) {
        return;
      }
      this.finalized = true;
      var blocks = this.blocks, i = this.lastByteIndex;
      blocks[16] = this.block;
      blocks[i >> 2] |= EXTRA[i & 3];
      this.block = blocks[16];
      if (i >= 56) {
        if (!this.hashed) {
          this.hash();
        }
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }
      blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
      blocks[15] = this.bytes << 3;
      this.hash();
    };
    Sha1.prototype.hash = function() {
      var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4;
      var f, j, t, blocks = this.blocks;
      for (j = 16; j < 80; ++j) {
        t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
        blocks[j] = t << 1 | t >>> 31;
      }
      for (j = 0; j < 20; j += 5) {
        f = b & c | ~b & d;
        t = a << 5 | a >>> 27;
        e = t + f + e + 1518500249 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a & b | ~a & c;
        t = e << 5 | e >>> 27;
        d = t + f + d + 1518500249 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e & a | ~e & b;
        t = d << 5 | d >>> 27;
        c = t + f + c + 1518500249 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d & e | ~d & a;
        t = c << 5 | c >>> 27;
        b = t + f + b + 1518500249 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c & d | ~c & e;
        t = b << 5 | b >>> 27;
        a = t + f + a + 1518500249 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      for (; j < 40; j += 5) {
        f = b ^ c ^ d;
        t = a << 5 | a >>> 27;
        e = t + f + e + 1859775393 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a ^ b ^ c;
        t = e << 5 | e >>> 27;
        d = t + f + d + 1859775393 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e ^ a ^ b;
        t = d << 5 | d >>> 27;
        c = t + f + c + 1859775393 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d ^ e ^ a;
        t = c << 5 | c >>> 27;
        b = t + f + b + 1859775393 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c ^ d ^ e;
        t = b << 5 | b >>> 27;
        a = t + f + a + 1859775393 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      for (; j < 60; j += 5) {
        f = b & c | b & d | c & d;
        t = a << 5 | a >>> 27;
        e = t + f + e - 1894007588 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a & b | a & c | b & c;
        t = e << 5 | e >>> 27;
        d = t + f + d - 1894007588 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e & a | e & b | a & b;
        t = d << 5 | d >>> 27;
        c = t + f + c - 1894007588 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d & e | d & a | e & a;
        t = c << 5 | c >>> 27;
        b = t + f + b - 1894007588 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c & d | c & e | d & e;
        t = b << 5 | b >>> 27;
        a = t + f + a - 1894007588 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      for (; j < 80; j += 5) {
        f = b ^ c ^ d;
        t = a << 5 | a >>> 27;
        e = t + f + e - 899497514 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a ^ b ^ c;
        t = e << 5 | e >>> 27;
        d = t + f + d - 899497514 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e ^ a ^ b;
        t = d << 5 | d >>> 27;
        c = t + f + c - 899497514 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d ^ e ^ a;
        t = c << 5 | c >>> 27;
        b = t + f + b - 899497514 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c ^ d ^ e;
        t = b << 5 | b >>> 27;
        a = t + f + a - 899497514 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      this.h0 = this.h0 + a << 0;
      this.h1 = this.h1 + b << 0;
      this.h2 = this.h2 + c << 0;
      this.h3 = this.h3 + d << 0;
      this.h4 = this.h4 + e << 0;
    };
    Sha1.prototype.hex = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
      return HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15];
    };
    Sha1.prototype.toString = Sha1.prototype.hex;
    Sha1.prototype.digest = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
      return [
        h0 >> 24 & 255,
        h0 >> 16 & 255,
        h0 >> 8 & 255,
        h0 & 255,
        h1 >> 24 & 255,
        h1 >> 16 & 255,
        h1 >> 8 & 255,
        h1 & 255,
        h2 >> 24 & 255,
        h2 >> 16 & 255,
        h2 >> 8 & 255,
        h2 & 255,
        h3 >> 24 & 255,
        h3 >> 16 & 255,
        h3 >> 8 & 255,
        h3 & 255,
        h4 >> 24 & 255,
        h4 >> 16 & 255,
        h4 >> 8 & 255,
        h4 & 255
      ];
    };
    var alphabet = "0123456789abcdefghjkmnpqrtuvwxyz";
    var alias = {o: 0, i: 1, l: 1, s: 5};
    Sha1.prototype.b32 = function() {
      var bytes = this.digest();
      var skip = 0;
      var bits = 0;
      var out = "";
      for (var i = 0; i < bytes.length; ) {
        var byte = bytes[i];
        if (skip < 0) {
          bits |= byte >> -skip;
        } else {
          bits = byte << skip & 248;
        }
        if (skip > 3) {
          skip -= 8;
          i += 1;
          continue;
        }
        if (skip < 4) {
          out += alphabet[bits >> 3];
          skip += 5;
        }
      }
      out = out + (skip < 0 ? alphabet[bits >> 3] : "");
      return out;
    };
    Sha1.prototype.array = Sha1.prototype.digest;
    Sha1.prototype.arrayBuffer = function() {
      this.finalize();
      var buffer = new ArrayBuffer(20);
      var dataView = new DataView(buffer);
      dataView.setUint32(0, this.h0);
      dataView.setUint32(4, this.h1);
      dataView.setUint32(8, this.h2);
      dataView.setUint32(12, this.h3);
      dataView.setUint32(16, this.h4);
      return buffer;
    };
    var exports = createMethod();
    if (COMMON_JS) {
      module.exports = exports;
    } else {
      root.sha1 = exports;
      if (AMD) {
        define(function() {
          return exports;
        });
      }
    }
  })();
});

// src/compiler/helpers.imba1
var require_helpers = __commonJS((exports2) => {
  function iter$7(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  var self2 = {};
  var sha1 = require_sha1();
  var ansiMap = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  };
  var ansi = exports2.ansi = {
    bold: function(text) {
      return "[1m" + text + "[22m";
    },
    red: function(text) {
      return "[31m" + text + "[39m";
    },
    green: function(text) {
      return "[32m" + text + "[39m";
    },
    yellow: function(text) {
      return "[33m" + text + "[39m";
    },
    blue: function(text) {
      return "[94m" + text + "[39m";
    },
    gray: function(text) {
      return "[90m" + text + "[39m";
    },
    white: function(text) {
      return "[37m" + text + "[39m";
    },
    f: function(name, text) {
      let pair = ansiMap[name];
      return "[" + pair[0] + "m" + text + "[" + pair[1] + "m";
    }
  };
  ansi.warn = ansi.yellow;
  ansi.error = ansi.red;
  exports2.brace = self2.brace = function(str) {
    var lines = str.match(/\n/);
    if (lines) {
      return "{" + str + "\n}";
    } else {
      return "{\n" + str + "\n}";
    }
    ;
  };
  exports2.normalizeIndentation = self2.normalizeIndentation = function(str) {
    var m;
    var reg = /\n+([^\n\S]*)/g;
    var ind = null;
    var length_;
    while (m = reg.exec(str)) {
      var attempt = m[1];
      if (ind === null || 0 < (length_ = attempt.length) && length_ < ind.length) {
        ind = attempt;
      }
      ;
    }
    ;
    if (ind) {
      str = str.replace(RegExp("\\n" + ind, "g"), "\n");
    }
    ;
    return str;
  };
  exports2.flatten = self2.flatten = function(arr) {
    var out = [];
    arr.forEach(function(v) {
      return v instanceof Array ? out.push.apply(out, self2.flatten(v)) : out.push(v);
    });
    return out;
  };
  exports2.clearLocationMarkers = self2.clearLocationMarkers = function(str) {
    return str.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
  };
  exports2.pascalCase = self2.pascalCase = function(str) {
    return str.replace(/(^|[\-\_\s])(\w)/g, function(m, v, l) {
      return l.toUpperCase();
    });
  };
  exports2.camelCase = self2.camelCase = function(str) {
    str = String(str);
    return str.replace(/([\-\_\s])(\w)/g, function(m, v, l) {
      return l.toUpperCase();
    });
  };
  exports2.dashToCamelCase = self2.dashToCamelCase = function(str) {
    str = String(str);
    if (str.indexOf("-") >= 0) {
      str = str.replace(/([\-\s])(\w)/g, function(m, v, l) {
        return l.toUpperCase();
      });
    }
    ;
    return str;
  };
  exports2.snakeCase = self2.snakeCase = function(str) {
    var str = str.replace(/([\-\s])(\w)/g, "_");
    return str.replace(/()([A-Z])/g, "_$1", function(m, v, l) {
      return l.toUpperCase();
    });
  };
  exports2.dasherize = self2.dasherize = function(str) {
    return str.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
  };
  exports2.setterSym = self2.setterSym = function(sym) {
    return self2.dashToCamelCase("set-" + sym);
  };
  exports2.quote = self2.quote = function(str) {
    return '"' + str + '"';
  };
  exports2.singlequote = self2.singlequote = function(str) {
    return "'" + str + "'";
  };
  exports2.symbolize = self2.symbolize = function(str) {
    str = String(str);
    var end = str.charAt(str.length - 1);
    if (end == "=") {
      str = "set" + str[0].toUpperCase() + str.slice(1, -1);
    } else if (end == "?") {
      str = "is" + str[0].toUpperCase() + str.slice(1, -1);
    } else if (end == "!") {
      str = "do" + str[0].toUpperCase() + str.slice(1, -1);
    }
    ;
    if (str.indexOf("-") >= 0) {
      str = str.replace(/([\-\s])(\w)/g, function(m, v, l) {
        return l.toUpperCase();
      });
    }
    ;
    return str;
  };
  exports2.indent = self2.indent = function(str) {
    return String(str).replace(/^/g, "	").replace(/\n/g, "\n	").replace(/\n\t$/g, "\n");
  };
  exports2.bracketize = self2.bracketize = function(str, ind) {
    if (ind === void 0)
      ind = true;
    if (ind) {
      str = "\n" + self2.indent(str) + "\n";
    }
    ;
    return "{" + str + "}";
  };
  exports2.parenthesize = self2.parenthesize = function(str) {
    return "(" + String(str) + ")";
  };
  exports2.unionOfLocations = self2.unionOfLocations = function() {
    var $0 = arguments, i = $0.length;
    var locs = new Array(i > 0 ? i : 0);
    while (i > 0)
      locs[i - 1] = $0[--i];
    var a = Infinity;
    var b = -Infinity;
    for (let i2 = 0, items = iter$7(locs), len = items.length, loc; i2 < len; i2++) {
      loc = items[i2];
      if (loc && loc._loc != void 0) {
        loc = loc._loc;
      }
      ;
      if (loc && loc.loc instanceof Function) {
        loc = loc.loc();
      }
      ;
      if (loc instanceof Array) {
        if (a > loc[0]) {
          a = loc[0];
        }
        ;
        if (b < loc[0]) {
          b = loc[1];
        }
        ;
      } else if (typeof loc == "number" || loc instanceof Number) {
        if (a > loc) {
          a = loc;
        }
        ;
        if (b < loc) {
          b = loc;
        }
        ;
      }
      ;
    }
    ;
    return [a, b];
  };
  exports2.locationToLineColMap = self2.locationToLineColMap = function(code) {
    var lines = code.split(/\n/g);
    var map = [];
    var chr;
    var loc = 0;
    var col = 0;
    var line = 0;
    while (chr = code[loc]) {
      map[loc] = [line, col];
      if (chr == "\n") {
        line++;
        col = 0;
      } else {
        col++;
      }
      ;
      loc++;
    }
    ;
    map[loc] = [line, col];
    map[loc + 1] = [line, col];
    return map;
  };
  exports2.markLineColForTokens = self2.markLineColForTokens = function(tokens, code) {
    return self2;
  };
  exports2.parseArgs = self2.parseArgs = function(argv, o) {
    var env_;
    if (o === void 0)
      o = {};
    var aliases = o.alias || (o.alias = {});
    var groups = o.group || (o.group = []);
    var schema = o.schema || {};
    schema.main = {};
    var options = {};
    var explicit = {};
    argv = argv || process.argv.slice(2);
    var curr = null;
    var i = 0;
    var m;
    while (i < argv.length) {
      var arg = argv[i];
      i++;
      if (m = arg.match(/^\-([a-zA-Z]+)(\=\S+)?$/)) {
        curr = null;
        let chars = m[1].split("");
        for (let i2 = 0, items = iter$7(chars), len = items.length, item; i2 < len; i2++) {
          item = items[i2];
          var key = aliases[item] || item;
          chars[i2] = key;
          options[key] = true;
        }
        ;
        if (chars.length == 1) {
          curr = chars;
        }
        ;
        continue;
      } else if (m = arg.match(/^\-\-([a-z0-9\-\_A-Z]+)(\=\S+)?$/)) {
        var val = true;
        key = m[1];
        if (key.indexOf("no-") == 0) {
          key = key.substr(3);
          val = false;
        }
        ;
        key = self2.dashToCamelCase(key);
        if (m[2]) {
          val = m[2].slice(1);
        }
        ;
        options[key] = val;
        curr = key;
        continue;
      } else {
        var desc = schema[curr];
        if (!(curr && schema[curr])) {
          curr = "main";
        }
        ;
        if (arg.match(/^\d+$/)) {
          arg = parseInt(arg);
        }
        ;
        val = options[curr];
        if (val == true || val == false) {
          options[curr] = arg;
        } else if (typeof val == "string" || val instanceof String || (typeof val == "number" || val instanceof Number)) {
          options[curr] = [val].concat(arg);
        } else if (val instanceof Array) {
          val.push(arg);
        } else {
          options[curr] = arg;
        }
        ;
        if (!(desc && desc.multi)) {
          curr = "main";
        }
        ;
      }
      ;
    }
    ;
    for (let j = 0, items = iter$7(groups), len = items.length; j < len; j++) {
      let name = self2.dashToCamelCase(items[j]);
      for (let v, i_ = 0, keys = Object.keys(options), l = keys.length, k; i_ < l; i_++) {
        k = keys[i_];
        v = options[k];
        if (k.indexOf(name) == 0) {
          let key2 = k.substr(name.length).replace(/^\w/, function(m2) {
            return m2.toLowerCase();
          });
          if (key2) {
            options[name] || (options[name] = {});
            options[name][key2] = v;
          } else {
            options[name] || (options[name] = {});
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if (typeof (env_ = options.env) == "string" || env_ instanceof String) {
      options["ENV_" + options.env] = true;
    }
    ;
    return options;
  };
  exports2.printExcerpt = self2.printExcerpt = function(code, loc, pars) {
    if (!pars || pars.constructor !== Object)
      pars = {};
    var hl = pars.hl !== void 0 ? pars.hl : false;
    var gutter = pars.gutter !== void 0 ? pars.gutter : true;
    var type = pars.type !== void 0 ? pars.type : "warn";
    var pad = pars.pad !== void 0 ? pars.pad : 2;
    var lines = code.split(/\n/g);
    var locmap = self2.locationToLineColMap(code);
    var lc = locmap[loc[0]] || [0, 0];
    var ln = lc[0];
    var col = lc[1];
    var line = lines[ln];
    var ln0 = Math.max(0, ln - pad);
    var ln1 = Math.min(ln0 + pad + 1 + pad, lines.length);
    let lni = ln - ln0;
    var l = ln0;
    var res1 = [];
    while (l < ln1) {
      res1.push(lines[l++]);
    }
    ;
    var out = res1;
    if (gutter) {
      out = out.map(function(line2, i) {
        let prefix = "" + (ln0 + i + 1);
        let str;
        while (prefix.length < String(ln1).length) {
          prefix = " " + prefix;
        }
        ;
        if (i == lni) {
          str = "   -> " + prefix + " | " + line2;
          if (hl) {
            str = ansi.f(hl, str);
          }
          ;
        } else {
          str = "      " + prefix + " | " + line2;
          if (hl) {
            str = ansi.f("gray", str);
          }
          ;
        }
        ;
        return str;
      });
    }
    ;
    let res = out.join("\n");
    return res;
  };
  exports2.printWarning = self2.printWarning = function(code, warn) {
    let msg = warn.message;
    let excerpt = self2.printExcerpt(code, warn.loc, {hl: "whiteBright", type: "warn", pad: 1});
    return msg + "\n" + excerpt;
  };
  exports2.identifierForPath = self2.identifierForPath = function(str) {
    var hash = sha1.create();
    hash.update(str);
    var id = hash.b32().replace(/^\d+/, "");
    return id.slice(0, 6);
  };
});

// src/compiler/constants.imba1
var require_constants = __commonJS((exports2) => {
  function iter$7(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  var BALANCED_PAIRS = exports2.BALANCED_PAIRS = [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
    ["{{", "}}"],
    ["INDENT", "OUTDENT"],
    ["CALL_START", "CALL_END"],
    ["PARAM_START", "PARAM_END"],
    ["INDEX_START", "INDEX_END"],
    ["TAG_START", "TAG_END"],
    ["STYLE_START", "STYLE_END"],
    ["BLOCK_PARAM_START", "BLOCK_PARAM_END"]
  ];
  var INVERSES = exports2.INVERSES = {};
  for (let i = 0, len = BALANCED_PAIRS.length, pair; i < len; i++) {
    pair = BALANCED_PAIRS[i];
    left = pair[0];
    rite = pair[1];
    INVERSES[rite] = left;
    INVERSES[left] = rite;
    BALANCED_PAIRS[left] = rite;
  }
  var left;
  var rite;
  var ALL_KEYWORDS = exports2.ALL_KEYWORDS = [
    "true",
    "false",
    "null",
    "this",
    "delete",
    "typeof",
    "in",
    "instanceof",
    "throw",
    "break",
    "continue",
    "debugger",
    "if",
    "else",
    "switch",
    "for",
    "while",
    "do",
    "try",
    "catch",
    "finally",
    "class",
    "extends",
    "super",
    "return",
    "undefined",
    "then",
    "unless",
    "until",
    "loop",
    "of",
    "by",
    "when",
    "def",
    "tag",
    "do",
    "elif",
    "begin",
    "var",
    "let",
    "self",
    "await",
    "import",
    "and",
    "or",
    "is",
    "isnt",
    "not",
    "yes",
    "no",
    "isa",
    "case",
    "nil",
    "require"
  ];
  var TOK = exports2.TOK = {
    TERMINATOR: "TERMINATOR",
    INDENT: "INDENT",
    OUTDENT: "OUTDENT",
    DEF_BODY: "DEF_BODY",
    THEN: "THEN",
    CATCH: "CATCH"
  };
  var OPERATOR_ALIASES = exports2.OPERATOR_ALIASES = {
    and: "&&",
    or: "||",
    is: "==",
    isnt: "!=",
    isa: "instanceof"
  };
  var HEREGEX_OMIT = exports2.HEREGEX_OMIT = /\s+(?:#.*)?/g;
  var HEREGEX = exports2.HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;
  var TAG_TYPES = exports2.TAG_TYPES = {
    "": [-1, {id: 1, className: "class", slot: 1, part: 1, elementTiming: "elementtiming"}],
    HTML: [-1, {title: 1, lang: 1, translate: 1, dir: 1, accessKey: "accesskey", draggable: 1, spellcheck: 1, autocapitalize: 1, inputMode: "inputmode", style: 1, tabIndex: "tabindex", enterKeyHint: "enterkeyhint"}],
    HTMLAnchor: [1, {target: 1, download: 1, ping: 1, rel: 1, relList: "rel", hreflang: 1, type: 1, referrerPolicy: "referrerpolicy", coords: 1, charset: 1, name: 1, rev: 1, shape: 1, href: 1}],
    HTMLArea: [1, {alt: 1, coords: 1, download: 1, shape: 1, target: 1, ping: 1, rel: 1, relList: "rel", referrerPolicy: "referrerpolicy", href: 1}],
    HTMLMedia: [1, {src: 1, crossOrigin: "crossorigin", preload: 1, controlsList: "controlslist"}],
    HTMLAudio: [4, {}],
    HTMLBase: [1, {href: 1, target: 1}],
    HTMLQuote: [1, {cite: 1}],
    HTMLBody: [1, {text: 1, link: 1, vLink: "vlink", aLink: "alink", bgColor: "bgcolor", background: 1}],
    HTMLBR: [1, {clear: 1}],
    HTMLButton: [1, {formAction: "formaction", formEnctype: "formenctype", formMethod: "formmethod", formTarget: "formtarget", name: 1, type: 1, value: 1}],
    HTMLCanvas: [1, {width: 1, height: 1}],
    HTMLTableCaption: [1, {align: 1}],
    HTMLTableCol: [1, {span: 1, align: 1, ch: "char", chOff: "charoff", vAlign: "valign", width: 1}],
    HTMLData: [1, {value: 1}],
    HTMLDataList: [1, {}],
    HTMLMod: [1, {cite: 1, dateTime: "datetime"}],
    HTMLDetails: [1, {}],
    HTMLDialog: [1, {}],
    HTMLDiv: [1, {align: 1}],
    HTMLDList: [1, {}],
    HTMLEmbed: [1, {src: 1, type: 1, width: 1, height: 1, align: 1, name: 1}],
    HTMLFieldSet: [1, {name: 1}],
    HTMLForm: [1, {acceptCharset: "accept-charset", action: 1, autocomplete: 1, enctype: 1, encoding: "enctype", method: 1, name: 1, target: 1}],
    HTMLHeading: [1, {align: 1}],
    HTMLHead: [1, {}],
    HTMLHR: [1, {align: 1, color: 1, size: 1, width: 1}],
    HTMLHtml: [1, {version: 1}],
    HTMLIFrame: [1, {src: 1, srcdoc: 1, name: 1, sandbox: 1, width: 1, height: 1, referrerPolicy: "referrerpolicy", csp: 1, allow: 1, align: 1, scrolling: 1, frameBorder: "frameborder", longDesc: "longdesc", marginHeight: "marginheight", marginWidth: "marginwidth", loading: 1}],
    HTMLImage: [1, {alt: 1, src: 1, srcset: 1, sizes: 1, crossOrigin: "crossorigin", useMap: "usemap", width: 1, height: 1, referrerPolicy: "referrerpolicy", decoding: 1, name: 1, lowsrc: 1, align: 1, hspace: 1, vspace: 1, longDesc: "longdesc", border: 1, loading: 1}],
    HTMLInput: [1, {accept: 1, alt: 1, autocomplete: 1, dirName: "dirname", formAction: "formaction", formEnctype: "formenctype", formMethod: "formmethod", formTarget: "formtarget", height: 1, max: 1, maxLength: "maxlength", min: 1, minLength: "minlength", name: 1, pattern: 1, placeholder: 1, src: 1, step: 1, type: 1, defaultValue: "value", width: 1, align: 1, useMap: "usemap"}],
    HTMLLabel: [1, {htmlFor: "for"}],
    HTMLLegend: [1, {align: 1}],
    HTMLLI: [1, {value: 1, type: 1}],
    HTMLLink: [1, {href: 1, crossOrigin: "crossorigin", rel: 1, relList: "rel", media: 1, hreflang: 1, type: 1, as: 1, referrerPolicy: "referrerpolicy", sizes: 1, imageSrcset: "imagesrcset", imageSizes: "imagesizes", charset: 1, rev: 1, target: 1, integrity: 1}],
    HTMLMap: [1, {name: 1}],
    HTMLMenu: [1, {}],
    HTMLMeta: [1, {name: 1, httpEquiv: "http-equiv", content: 1, scheme: 1}],
    HTMLMeter: [1, {value: 1, min: 1, max: 1, low: 1, high: 1, optimum: 1}],
    HTMLObject: [1, {data: 1, type: 1, name: 1, useMap: "usemap", width: 1, height: 1, align: 1, archive: 1, code: 1, hspace: 1, standby: 1, vspace: 1, codeBase: "codebase", codeType: "codetype", border: 1}],
    HTMLOList: [1, {start: 1, type: 1}],
    HTMLOptGroup: [1, {label: 1}],
    HTMLOption: [1, {label: 1, value: 1}],
    HTMLOutput: [1, {htmlFor: "for", name: 1}],
    HTMLParagraph: [1, {align: 1}],
    HTMLParam: [1, {name: 1, value: 1, type: 1, valueType: "valuetype"}],
    HTMLPicture: [1, {}],
    HTMLPre: [1, {width: 1}],
    HTMLProgress: [1, {value: 1, max: 1}],
    HTMLScript: [1, {src: 1, type: 1, charset: 1, crossOrigin: "crossorigin", referrerPolicy: "referrerpolicy", event: 1, htmlFor: "for", integrity: 1}],
    HTMLSelect: [1, {autocomplete: 1, name: 1, size: 1}],
    HTMLSlot: [1, {name: 1}],
    HTMLSource: [1, {src: 1, type: 1, srcset: 1, sizes: 1, media: 1}],
    HTMLSpan: [1, {}],
    HTMLStyle: [1, {media: 1, type: 1}],
    HTMLTable: [1, {align: 1, border: 1, frame: 1, rules: 1, summary: 1, width: 1, bgColor: "bgcolor", cellPadding: "cellpadding", cellSpacing: "cellspacing"}],
    HTMLTableSection: [1, {align: 1, ch: "char", chOff: "charoff", vAlign: "valign"}],
    HTMLTableCell: [1, {colSpan: "colspan", rowSpan: "rowspan", headers: 1, align: 1, axis: 1, height: 1, width: 1, ch: "char", chOff: "charoff", vAlign: "valign", bgColor: "bgcolor", abbr: 1, scope: 1}],
    HTMLTemplate: [1, {}],
    HTMLTextArea: [1, {autocomplete: 1, cols: 1, dirName: "dirname", maxLength: "maxlength", minLength: "minlength", name: 1, placeholder: 1, rows: 1, wrap: 1}],
    HTMLTime: [1, {dateTime: "datetime"}],
    HTMLTitle: [1, {}],
    HTMLTableRow: [1, {align: 1, ch: "char", chOff: "charoff", vAlign: "valign", bgColor: "bgcolor"}],
    HTMLTrack: [1, {kind: 1, src: 1, srclang: 1, label: 1}],
    HTMLUList: [1, {type: 1}],
    HTMLVideo: [4, {width: 1, height: 1, poster: 1}],
    SVG: [-1, {}],
    SVGGraphics: [66, {transform: 1}],
    SVGA: [67, {}],
    SVGAnimation: [66, {}],
    SVGAnimate: [69, {}],
    SVGAnimateMotion: [69, {}],
    SVGAnimateTransform: [69, {}],
    SVGGeometry: [67, {}],
    SVGCircle: [73, {cx: 1, cy: 1, r: 1}],
    SVGClipPath: [67, {clipPathUnits: 1}],
    SVGDefs: [67, {}],
    SVGDesc: [66, {}],
    SVGDiscard: [66, {}],
    SVGEllipse: [73, {cx: 1, cy: 1, rx: 1, ry: 1}],
    SVGFEBlend: [66, {mode: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEColorMatrix: [66, {type: 1, values: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEComponentTransfer: [66, {x: 1, y: 1, width: 1, height: 1}],
    SVGFEComposite: [66, {operator: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEConvolveMatrix: [66, {orderX: 1, orderY: 1, kernelMatrix: 1, divisor: 1, edgeMode: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEDiffuseLighting: [66, {surfaceScale: 1, diffuseConstant: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEDisplacementMap: [66, {xChannelSelector: 1, yChannelSelector: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEDistantLight: [66, {}],
    SVGFEDropShadow: [66, {dx: 1, dy: 1, stdDeviationX: 1, stdDeviationY: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEFlood: [66, {x: 1, y: 1, width: 1, height: 1}],
    SVGComponentTransferFunction: [66, {type: 1, tableValues: 1, slope: 1, amplitude: 1, exponent: 1}],
    SVGFEFuncA: [90, {}],
    SVGFEFuncB: [90, {}],
    SVGFEFuncG: [90, {}],
    SVGFEFuncR: [90, {}],
    SVGFEGaussianBlur: [66, {x: 1, y: 1, width: 1, height: 1}],
    SVGFEImage: [66, {preserveAspectRatio: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEMerge: [66, {x: 1, y: 1, width: 1, height: 1}],
    SVGFEMergeNode: [66, {}],
    SVGFEMorphology: [66, {operator: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFEOffset: [66, {x: 1, y: 1, width: 1, height: 1}],
    SVGFEPointLight: [66, {}],
    SVGFESpecularLighting: [66, {surfaceScale: 1, specularConstant: 1, specularExponent: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFESpotLight: [66, {specularExponent: 1}],
    SVGFETile: [66, {x: 1, y: 1, width: 1, height: 1}],
    SVGFETurbulence: [66, {numOctaves: 1, stitchTiles: 1, type: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGFilter: [66, {filterUnits: 1, primitiveUnits: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGForeignObject: [67, {x: 1, y: 1, width: 1, height: 1}],
    SVGG: [67, {}],
    SVGImage: [67, {x: 1, y: 1, width: 1, height: 1, preserveAspectRatio: 1}],
    SVGLine: [73, {x1: 1, y1: 1, x2: 1, y2: 1}],
    SVGGradient: [66, {gradientUnits: 1, gradientTransform: 1, spreadMethod: 1}],
    SVGLinearGradient: [111, {x1: 1, y1: 1, x2: 1, y2: 1}],
    SVGMarker: [66, {refX: 1, refY: 1, markerUnits: 1, markerWidth: 1, markerHeight: 1, orientType: 1, orientAngle: 1, viewBox: 1, preserveAspectRatio: 1}],
    SVGMask: [66, {maskUnits: 1, maskContentUnits: 1, x: 1, y: 1, width: 1, height: 1}],
    SVGMetadata: [66, {}],
    SVGMPath: [66, {}],
    SVGPath: [73, {}],
    SVGPattern: [66, {patternUnits: 1, patternContentUnits: 1, patternTransform: 1, x: 1, y: 1, width: 1, height: 1, viewBox: 1, preserveAspectRatio: 1}],
    SVGPolygon: [73, {}],
    SVGPolyline: [73, {}],
    SVGRadialGradient: [111, {cx: 1, cy: 1, r: 1, fx: 1, fy: 1, fr: 1}],
    SVGRect: [73, {x: 1, y: 1, width: 1, height: 1, rx: 1, ry: 1}],
    SVGScript: [66, {}],
    SVGSet: [69, {}],
    SVGStop: [66, {}],
    SVGStyle: [66, {}],
    SVGSVG: [67, {x: 1, y: 1, width: 1, height: 1, viewBox: 1, preserveAspectRatio: 1}],
    SVGSwitch: [67, {}],
    SVGSymbol: [66, {viewBox: 1, preserveAspectRatio: 1}],
    SVGTextContent: [67, {textLength: 1, lengthAdjust: 1}],
    SVGTextPositioning: [130, {x: 1, y: 1, dx: 1, dy: 1, rotate: 1}],
    SVGText: [131, {}],
    SVGTextPath: [130, {startOffset: 1, method: 1, spacing: 1}],
    SVGTitle: [66, {}],
    SVGTSpan: [131, {}],
    SVGUse: [67, {x: 1, y: 1, width: 1, height: 1}],
    SVGView: [66, {viewBox: 1, preserveAspectRatio: 1}]
  };
  var TAG_NAMES = exports2.TAG_NAMES = {
    a: 2,
    abbr: 1,
    address: 1,
    area: 3,
    article: 1,
    aside: 1,
    audio: 5,
    b: 1,
    base: 6,
    bdi: 1,
    bdo: 1,
    blockquote: 7,
    body: 8,
    br: 9,
    button: 10,
    canvas: 11,
    caption: 12,
    cite: 1,
    code: 1,
    col: 13,
    colgroup: 13,
    data: 14,
    datalist: 15,
    dd: 1,
    del: 16,
    details: 17,
    dfn: 1,
    dialog: 18,
    div: 19,
    dl: 20,
    dt: 1,
    em: 1,
    embed: 21,
    fieldset: 22,
    figcaption: 1,
    figure: 1,
    footer: 1,
    form: 23,
    h1: 24,
    h2: 24,
    h3: 24,
    h4: 24,
    h5: 24,
    h6: 24,
    head: 25,
    header: 1,
    hgroup: 1,
    hr: 26,
    html: 27,
    i: 1,
    iframe: 28,
    img: 29,
    input: 30,
    ins: 16,
    kbd: 1,
    label: 31,
    legend: 32,
    li: 33,
    link: 34,
    main: 1,
    map: 35,
    mark: 1,
    menu: 36,
    meta: 37,
    meter: 38,
    nav: 1,
    noscript: 1,
    object: 39,
    ol: 40,
    optgroup: 41,
    option: 42,
    output: 43,
    p: 44,
    param: 45,
    picture: 46,
    pre: 47,
    progress: 48,
    q: 7,
    rp: 1,
    rt: 1,
    ruby: 1,
    s: 1,
    samp: 1,
    script: 49,
    section: 1,
    select: 50,
    slot: 51,
    small: 1,
    source: 52,
    span: 53,
    strike: 1,
    strong: 1,
    style: 54,
    sub: 1,
    summary: 1,
    sup: 1,
    table: 55,
    tbody: 56,
    td: 57,
    template: 58,
    textarea: 59,
    tfoot: 56,
    th: 57,
    thead: 56,
    time: 60,
    title: 61,
    tr: 62,
    track: 63,
    u: 1,
    ul: 64,
    var: 1,
    video: 65,
    wbr: 1,
    svg_a: 68,
    svg_animate: 70,
    svg_animateMotion: 71,
    svg_animateTransform: 72,
    svg_audio: 66,
    svg_canvas: 66,
    svg_circle: 74,
    svg_clipPath: 75,
    svg_defs: 76,
    svg_desc: 77,
    svg_discard: 78,
    svg_ellipse: 79,
    svg_feBlend: 80,
    svg_feColorMatrix: 81,
    svg_feComponentTransfer: 82,
    svg_feComposite: 83,
    svg_feConvolveMatrix: 84,
    svg_feDiffuseLighting: 85,
    svg_feDisplacementMap: 86,
    svg_feDistantLight: 87,
    svg_feDropShadow: 88,
    svg_feFlood: 89,
    svg_feFuncA: 91,
    svg_feFuncB: 92,
    svg_feFuncG: 93,
    svg_feFuncR: 94,
    svg_feGaussianBlur: 95,
    svg_feImage: 96,
    svg_feMerge: 97,
    svg_feMergeNode: 98,
    svg_feMorphology: 99,
    svg_feOffset: 100,
    svg_fePointLight: 101,
    svg_feSpecularLighting: 102,
    svg_feSpotLight: 103,
    svg_feTile: 104,
    svg_feTurbulence: 105,
    svg_filter: 106,
    svg_foreignObject: 107,
    svg_g: 108,
    svg_iframe: 66,
    svg_image: 109,
    svg_line: 110,
    svg_linearGradient: 112,
    svg_marker: 113,
    svg_mask: 114,
    svg_metadata: 115,
    svg_mpath: 116,
    svg_path: 117,
    svg_pattern: 118,
    svg_polygon: 119,
    svg_polyline: 120,
    svg_radialGradient: 121,
    svg_rect: 122,
    svg_script: 123,
    svg_set: 124,
    svg_stop: 125,
    svg_style: 126,
    svg_svg: 127,
    svg_switch: 128,
    svg_symbol: 129,
    svg_text: 132,
    svg_textPath: 133,
    svg_title: 134,
    svg_tspan: 135,
    svg_unknown: 66,
    svg_use: 136,
    svg_video: 66,
    svg_view: 137
  };
  var keys = Object.keys(TAG_TYPES);
  for (let i = 0, items = iter$7(keys), len = items.length, typ; i < len; i++) {
    typ = items[i];
    let item = TAG_TYPES[typ];
    item.up = TAG_TYPES[keys[item[0]]];
    item.name = typ + "Element";
  }
  for (let ref, i = 0, keys1 = Object.keys(TAG_NAMES), l = keys1.length, name; i < l; i++) {
    name = keys1[i];
    ref = TAG_NAMES[name];
    TAG_NAMES[name] = TAG_TYPES[keys[ref]];
  }
});

// src/compiler/sourcemapper.imba
var require_sourcemapper = __commonJS((exports2) => {
  __export(exports2, {
    SourceMapper: () => SourceMapper
  });
  var SourceMapper = class {
    static strip(input) {
      return input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
    }
    static run(input, o = {}) {
      let output = input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
      return {
        code: output,
        map: null,
        toString: function() {
          return this.code;
        }
      };
    }
  };
});

// src/compiler/compilation.imba
var require_compilation = __commonJS((exports2) => {
  __export(exports2, {
    Compilation: () => Compilation2,
    CompilationResult: () => CompilationResult
  });
  var path2 = __toModule(require("path"));
  var sourcemapper = __toModule(require_sourcemapper());
  var sys$14 = Symbol.for("#init");
  var sys$22 = Symbol.for("#doc");
  var STEPS = {
    TOKENIZE: 1,
    REWRITE: 2,
    PARSE: 4,
    TRAVERSE: 8,
    COMPILE: 16
  };
  var weakCache = new WeakMap();
  var CompilationResult = class {
  };
  var Compilation2 = class {
    static [sys$14]() {
      this.current = void 0;
      return this;
    }
    static error(opts) {
      var _a, _b;
      return (_b = (_a = this.current) == null ? void 0 : _a.addDiagnostic) == null ? void 0 : _b.call(_a, "error", opts);
    }
    static warn(opts) {
      var _a, _b;
      return (_b = (_a = this.current) == null ? void 0 : _a.addDiagnostic) == null ? void 0 : _b.call(_a, "warning", opts);
    }
    static info(opts) {
      var _a, _b;
      return (_b = (_a = this.current) == null ? void 0 : _a.addDiagnostic) == null ? void 0 : _b.call(_a, "info", opts);
    }
    static deserialize(data, o = {}) {
      let item = new Compilation2("", o);
      return item.deserialize(data);
    }
    constructor(code, options) {
      this.sourceCode = code;
      this.sourcePath = options.sourcePath;
      this.options = options;
      this.flags = 0;
      this.js = "";
      this.css = "";
      this.result = {};
      this.diagnostics = [];
      this.tokens = null;
      this.ast = null;
    }
    deserialize(input) {
      let val;
      try {
        val = JSON.parse(input);
      } catch (e) {
        console.log("failed", input, this.options);
        throw e;
      }
      ;
      this.rawResult = val;
      this.deserialized = val;
      return this;
    }
    serialize() {
      if (this.rawResult) {
        return JSON.stringify(this.rawResult, null, 2);
      }
      ;
    }
    tokenize() {
      var $0$1;
      if ((this.flags & ($0$1 = STEPS.TOKENIZE)) == 0 ? (this.flags |= $0$1, true) : false) {
        try {
          Compilation2.current = this;
          this.lexer.reset();
          this.tokens = this.lexer.tokenize(this.sourceCode, this.options, this);
          this.tokens = this.rewriter.rewrite(this.tokens, this.options, this);
        } catch (e) {
          true;
        }
        ;
      }
      ;
      return this.tokens;
    }
    parse() {
      var $0$2;
      this.tokenize();
      if ((this.flags & ($0$2 = STEPS.PARSE)) == 0 ? (this.flags |= $0$2, true) : false) {
        if (!this.isErrored) {
          Compilation2.current = this;
          try {
            this.ast = this.parser.parse(this.tokens, this);
          } catch (e) {
          }
          ;
        }
        ;
      }
      ;
      return this;
    }
    compile() {
      var $0$3;
      this.parse();
      if ((this.flags & ($0$3 = STEPS.COMPILE)) == 0 ? (this.flags |= $0$3, true) : false) {
        if (!this.isErrored) {
          Compilation2.current = this;
          this.result = this.ast.compile(this.options, this);
        }
        ;
        if (this.options.raiseErrors) {
          this.raiseErrors();
        }
        ;
      }
      ;
      return this;
    }
    recompile(o = {}) {
      if (this.deserialized) {
        let js = this.deserialized.js;
        let res = {};
        res.js = sourcemapper.SourceMapper.run(js, o);
        res.css = sourcemapper.SourceMapper.run(this.deserialized.css || "", o);
        if (o.styles == "import" && res.css.code) {
          res.js.code += "\nimport './" + path2.default.basename(this.sourcePath) + ".css'";
        }
        ;
        return res;
      }
      ;
      return {js: this.js};
    }
    addDiagnostic(severity, params) {
      params.severity || (params.severity = severity);
      let item = new Diagnostic(params, this);
      this.diagnostics.push(item);
      return item;
    }
    get isErrored() {
      return this.errors.length > 0;
    }
    get errors() {
      return this.diagnostics.filter(function(_0) {
        return _0.severity == DiagnosticSeverity.Error;
      });
    }
    get warnings() {
      return this.diagnostics.filter(function(_0) {
        return _0.severity == DiagnosticSeverity.Warning;
      });
    }
    get info() {
      return this.diagnostics.filter(function(_0) {
        return _0.severity == DiagnosticSeverity.Information;
      });
    }
    get doc() {
      return this[sys$22] || (this[sys$22] = new ImbaDocument(null, "imba", 0, this.sourceCode));
    }
    positionAt(offset) {
      return this.doc.positionAt(offset);
    }
    offsetAt(position) {
      return this.doc.offsetAt(position);
    }
    rangeAt(a, b) {
      return this.doc.rangeAt(a, b);
    }
    toString() {
      return this.js;
    }
    raiseErrors() {
      if (this.errors.length) {
        throw this.errors[0].toError();
      }
      ;
      return this;
    }
  };
  Compilation2[sys$14]();
});

// src/compiler/errors.imba1
var require_errors = __commonJS((exports2) => {
  function subclass$(obj, sup) {
    for (var k in sup) {
      if (sup.hasOwnProperty(k))
        obj[k] = sup[k];
    }
    ;
    obj.prototype = Object.create(sup.prototype);
    obj.__super__ = obj.prototype.__super__ = sup.prototype;
    obj.prototype.initialize = obj.prototype.constructor = obj;
  }
  var util4 = require_helpers();
  var meta = new WeakMap();
  function ImbaParseError2(e, o) {
    var m;
    this.error = e;
    this._options = o || {};
    this.severity = this._options.severity || "error";
    let msg = e.message;
    if (m = msg.match(/Unexpected '([\w\-]+)'/)) {
      if (m[1] == "TERMINATOR") {
        msg = "Unexpected newline";
      }
      ;
    }
    ;
    this.message = msg;
    this.sourcePath = e.sourcePath;
    this.line = e.line;
    this;
  }
  subclass$(ImbaParseError2, Error);
  exports2.ImbaParseError = ImbaParseError2;
  ImbaParseError2.wrap = function(err) {
    return new this(err);
  };
  Object.defineProperty(ImbaParseError2.prototype, "_options", {get: function() {
    return meta.get(this);
  }, configurable: true});
  Object.defineProperty(ImbaParseError2.prototype, "_options", {set: function(value) {
    return meta.set(this, value);
  }, configurable: true});
  ImbaParseError2.prototype.set = function(opts) {
    this._options || (this._options = {});
    for (let v, i = 0, keys = Object.keys(opts), l = keys.length, k; i < l; i++) {
      k = keys[i];
      v = opts[k];
      this._options[k] = v;
    }
    ;
    return this;
  };
  ImbaParseError2.prototype.start = function() {
    var o = this._options;
    var idx = o.pos - 1;
    var tok = o.tokens && o.tokens[idx];
    while (tok && (tok._loc == -1 || tok._loc == 0 || tok._len == 0)) {
      tok = o.tokens[--idx];
    }
    ;
    return tok;
  };
  Object.defineProperty(ImbaParseError2.prototype, "token", {get: function() {
    if (this._token) {
      return this._token;
    }
    ;
    var o = this._options;
    var idx = o.pos - 1;
    var tok = o.tokens && o.tokens[idx];
    while (tok && (tok._loc == -1 || tok._loc == 0 || tok._len == 0)) {
      tok = o.tokens[--idx];
    }
    ;
    return this._token = tok;
  }, configurable: true});
  ImbaParseError2.prototype.desc = function() {
    var o = this._options;
    let msg = this.message;
    if (o.token && o.token._loc == -1) {
      return "Syntax Error";
    } else {
      return msg;
    }
    ;
  };
  ImbaParseError2.prototype.loc = function() {
    var start_;
    return this._loc || (start_ = this.start()) && start_.region && start_.region();
  };
  ImbaParseError2.prototype.toJSON = function() {
    var o = this._options;
    var tok = this.start();
    return {warn: true, message: this.desc(), loc: this.loc()};
  };
  ImbaParseError2.prototype.toNativeError = function() {
    let err = new SyntaxError("hello");
    err.fileName = this._sourcePath;
    err.message = this.message;
    err.stack = this.excerpt({colors: false, details: true});
    err.lineNumber = this.lineNumber;
    err.columnNumber = this.columnNumber;
    return err;
  };
  ImbaParseError2.prototype.excerpt = function(pars) {
    if (!pars || pars.constructor !== Object)
      pars = {};
    var gutter = pars.gutter !== void 0 ? pars.gutter : true;
    var colors2 = pars.colors !== void 0 ? pars.colors : false;
    var details = pars.details !== void 0 ? pars.details : true;
    var code = this._code;
    var loc = this.loc();
    var lines = code.split(/\n/g);
    var locmap = util4.locationToLineColMap(code);
    var lc = locmap[loc[0]] || [0, 0];
    var ln = lc[0];
    var col = lc[1];
    var line = lines[ln];
    this.lineNumber = ln + 1;
    this.columnNumber = col;
    var ln0 = Math.max(0, ln - 2);
    var ln1 = Math.min(ln0 + 5, lines.length);
    let lni = ln - ln0;
    var l = ln0;
    var colorize = function(_0) {
      return _0;
    };
    if (colors2) {
      let color = this.severity == "warn" ? "yellow" : "red";
      if (typeof colors2 == "string" || colors2 instanceof String) {
        color = colors2;
      }
      ;
      colorize = function(_0) {
        return util4.ansi[color](util4.ansi.bold(_0));
      };
    }
    ;
    var res = [];
    while (l < ln1) {
      res.push(line = lines[l++]);
    }
    ;
    var out = res;
    if (gutter) {
      out = out.map(function(line2, i) {
        let prefix = "" + (ln0 + i + 1);
        while (prefix.length < String(ln1).length) {
          prefix = " " + prefix;
        }
        ;
        if (i == lni) {
          return "   -> " + prefix + " | " + line2;
        } else {
          return "      " + prefix + " | " + line2;
        }
        ;
      });
    }
    ;
    out[lni] = colorize(out[lni]);
    if (details) {
      out.unshift(colorize(this.message));
    }
    ;
    return out.join("\n") + "\n";
  };
  ImbaParseError2.prototype.prettyMessage = function() {
    var excerpt;
    return excerpt = this.excerpt();
  };
  function ImbaTraverseError() {
    return ImbaParseError2.apply(this, arguments);
  }
  subclass$(ImbaTraverseError, ImbaParseError2);
  exports2.ImbaTraverseError = ImbaTraverseError;
  ImbaTraverseError.prototype.loc = function() {
    return this._loc;
  };
  ImbaTraverseError.prototype.excerpt = function() {
    var excerpt = ImbaTraverseError.prototype.__super__.excerpt.apply(this, arguments);
    return excerpt + "\n---\n" + this.error.stack;
  };
});

// src/compiler/lexer.imba1
var require_lexer = __commonJS((exports2) => {
  function len$(a) {
    return a && (a.len instanceof Function ? a.len() : a.length) || 0;
  }
  function idx$(a, b) {
    return b && b.indexOf ? b.indexOf(a) : [].indexOf.call(a, b);
  }
  function iter$7(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  function subclass$(obj, sup) {
    for (var k in sup) {
      if (sup.hasOwnProperty(k))
        obj[k] = sup[k];
    }
    ;
    obj.prototype = Object.create(sup.prototype);
    obj.__super__ = obj.prototype.__super__ = sup.prototype;
    obj.prototype.initialize = obj.prototype.constructor = obj;
  }
  var T2 = require_token();
  var Token2 = T2.Token;
  var INVERSES = require_constants().INVERSES;
  var Compilation2 = require_compilation().Compilation;
  var ERR = require_errors();
  var helpers2 = require_helpers();
  var JS_KEYWORDS = [
    "true",
    "false",
    "null",
    "this",
    "delete",
    "typeof",
    "in",
    "instanceof",
    "throw",
    "break",
    "continue",
    "debugger",
    "if",
    "else",
    "switch",
    "for",
    "while",
    "do",
    "try",
    "catch",
    "finally",
    "class",
    "extends",
    "super",
    "return"
  ];
  var IMBA_CONTEXTUAL_KEYWORDS = ["extend", "local", "global", "prop", "lazy"];
  var ALL_KEYWORDS = exports2.ALL_KEYWORDS = [
    "true",
    "false",
    "null",
    "this",
    "delete",
    "typeof",
    "in",
    "instanceof",
    "throw",
    "break",
    "continue",
    "debugger",
    "if",
    "else",
    "switch",
    "for",
    "while",
    "do",
    "try",
    "catch",
    "finally",
    "class",
    "extends",
    "super",
    "return",
    "undefined",
    "then",
    "unless",
    "until",
    "loop",
    "of",
    "by",
    "when",
    "def",
    "tag",
    "do",
    "elif",
    "begin",
    "var",
    "let",
    "const",
    "self",
    "await",
    "import",
    "and",
    "or",
    "is",
    "isnt",
    "not",
    "yes",
    "no",
    "isa",
    "case",
    "nil",
    "require",
    "module",
    "export",
    "static"
  ];
  var RESERVED = ["case", "default", "function", "void", "with", "const", "enum", "native"];
  var JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED);
  var IDENTIFIER = /^((\$|##|#|@|\%)[\$\wA-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*[\?]?|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*[\?]?)([^\n\S]*:)?/;
  var IMPORTS = /^import\s+(\{?[^\"\'\}]+\}?)(?=\s+from\s+)/;
  var TAG = /^(\<)(?=[A-Za-z\#\.\%\$\[\{\@\>])/;
  var TAG_TYPE = /^(\w[\w\d]*:)?(\w[\w\d]*)(-[\w\d]+)*/;
  var TAG_ID = /^#((\w[\w\d]*)(-[\w\d]+)*)/;
  var SELECTOR = /^([%\$]{1,2})([\(])/;
  var SYMBOL = /^\:((([\*\@$\w\x7f-\uffff]+)+([\-\\\:][\w\x7f-\uffff]+)*)|==|\<=\>)/;
  var STYLE_HEX = /^\#[0-9a-fA-F]{3,6}/;
  var STYLE_NUMERIC = /^(\-?\d*\.?\d+)([A-Za-z]+|\%)?(?![\d\w])/;
  var STYLE_IDENTIFIER = /^[\w\-\$]*\w[\w\-\$]*/;
  var STYLE_URL = /^url\(([^\)]*)\)/;
  var STYLE_PROPERTY2 = /^([\w\-\$\@\.\!]+)(?=\:([^\:]|$))/;
  var NUMBER = /^0x[\da-f_]+|^0b[01_]+|^0o[\d_]+|^(?:\d[_\d]*)\.?\d[_\d]*(?:e[+-]?\d+)?|^\d*\.?\d+(?:e[+-]?\d+)?/i;
  var HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;
  var OPERATOR = /^(?:[-=]=>|!&|[&|~^]?=\?|[&|~^]=|\?\?=|===|---|->|=>|\/>|!==|\*\*=?|[-+*\/%<>&|^!?=]=|=<|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\?\?|\.{2,3}|\*(?=[a-zA-Z\_]))/;
  var WHITESPACE = /^[^\n\S]+/;
  var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)/;
  var JS_COMMENT = /^\/\*([\s\S]*?)\*\//;
  var INLINE_COMMENT = /^(\s*)((#[ \t\!]|\/\/(?!\/))(.*)|#[ \t]?(?=\n|$))+/;
  var CODE = /^[-=]=>/;
  var MULTI_DENT = /^(?:\n[^\n\S]*)+/;
  var SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;
  var REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;
  var HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;
  var MULTILINER = /\n/g;
  var HEREDOC_INDENT = /\n+([^\n\S]*)/g;
  var HEREDOC_ILLEGAL = /\*\//;
  var LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d]))/;
  var ENV_FLAG = /^\$\w+\$/;
  var ARGVAR = /^\$\d$/;
  var COMPOUND_ASSIGN = [
    "-=",
    "+=",
    "/=",
    "*=",
    "%=",
    "||=",
    "&&=",
    "?=",
    "??=",
    "<<=",
    ">>=",
    ">>>=",
    "&=",
    "^=",
    "|=",
    "~=",
    "=<",
    "**=",
    "=?",
    "~=?",
    "|=?",
    "&=?",
    "^=?"
  ];
  var UNARY = ["!", "~", "NEW", "TYPEOF", "DELETE"];
  var LOGIC = ["&&", "||", "??", "and", "or"];
  var SHIFT = ["<<", ">>", ">>>"];
  var COMPARE = ["===", "!==", "==", "!=", "<", ">", "<=", ">=", "===", "!==", "&", "|", "^", "!&"];
  var MATH = ["*", "/", "%", "\u222A", "\u2229", "\u221A"];
  var RELATION = ["IN", "OF", "INSTANCEOF", "ISA"];
  var NOT_REGEX = ["NUMBER", "REGEX", "BOOL", "TRUE", "FALSE", "++", "--", "]"];
  var NOT_SPACED_REGEX = ["NUMBER", "REGEX", "BOOL", "TRUE", "FALSE", "++", "--", "]", ")", "}", "THIS", "SELF", "IDENTIFIER", "STRING"];
  var UNFINISHED = ["\\", ".", "UNARY", "MATH", "EXP", "+", "-", "SHIFT", "RELATION", "COMPARE", "COMPOUND_ASSIGN", "THROW", "EXTENDS"];
  var CALLABLE = ["IDENTIFIER", "SYMBOLID", "STRING", "REGEX", ")", "]", "INDEX_END", "THIS", "SUPER", "TAG_END", "IVAR", "SELF", "NEW", "ARGVAR", "SYMBOL", "RETURN", "INDEX_END", "CALL_END"];
  var INDEXABLE = [
    "IDENTIFIER",
    "SYMBOLID",
    "STRING",
    "REGEX",
    ")",
    "]",
    "THIS",
    "SUPER",
    "TAG_END",
    "IVAR",
    "SELF",
    "NEW",
    "ARGVAR",
    "SYMBOL",
    "RETURN",
    "NUMBER",
    "BOOL",
    "TAG_SELECTOR",
    "ARGUMENTS",
    "}",
    "TAG_TYPE",
    "TAG_REF",
    "INDEX_END",
    "CALL_END"
  ];
  var LINE_BREAK = ["INDENT", "OUTDENT", "TERMINATOR"];
  function LexerError(message, file, line) {
    this.message = message;
    this.file = file;
    this.line = line;
    return this;
  }
  subclass$(LexerError, SyntaxError);
  exports2.LexerError = LexerError;
  var last = function(array, back) {
    if (back === void 0)
      back = 0;
    return array[array.length - back - 1];
  };
  var count = function(str, substr) {
    return str.split(substr).length - 1;
  };
  var repeatString = function(str, times) {
    var res = "";
    while (times > 0) {
      if (times % 2 == 1) {
        res += str;
      }
      ;
      str += str;
      times >>= 1;
    }
    ;
    return res;
  };
  var tT = T2.typ;
  var tV = T2.val;
  var tTs = T2.setTyp;
  var tVs = T2.setVal;
  function Lexer() {
    this.reset();
    this;
  }
  exports2.Lexer = Lexer;
  Lexer.prototype.reset = function() {
    this._code = null;
    this._chunk = null;
    this._opts = null;
    this._state = {};
    this._indent = 0;
    this._indebt = 0;
    this._outdebt = 0;
    this._indents = [];
    this._ends = [];
    this._contexts = [];
    this._scopes = [];
    this._nextScope = null;
    this._context = null;
    this._indentStyle = "	";
    this._inTag = false;
    this._inStyle = 0;
    this._tokens = [];
    this._seenFor = false;
    this._loc = 0;
    this._locOffset = 0;
    this._end = null;
    this._char = null;
    this._bridge = null;
    this._last = null;
    this._lastTyp = "";
    this._lastVal = null;
    this._script = null;
    return this;
  };
  Lexer.prototype.jisonBridge = function(jison) {
    return this._bridge = {
      lex: T2.lex,
      setInput: function(tokens) {
        this.tokens = tokens;
        return this.pos = 0;
      },
      upcomingInput: function() {
        return "";
      }
    };
  };
  Lexer.prototype.tokenize = function(code, o, script) {
    var m;
    if (script === void 0)
      script = null;
    if (code.length == 0) {
      return [];
    }
    ;
    if (!o.inline) {
      if (WHITESPACE.test(code)) {
        code = "\n" + code;
        if (code.match(/^\s*$/g)) {
          return [];
        }
        ;
      }
      ;
      code = code.replace(/\r/g, "").replace(/[\t ]+$/g, "");
    }
    ;
    this._last = null;
    this._lastTyp = null;
    this._lastVal = null;
    this._script = script;
    this._code = code;
    this._opts = o;
    this._locOffset = o.loc || 0;
    this._platform = o.platform || o.target;
    this._indentStyle = "	";
    if (m = code.match(/^([\ \t]*)[^\n\s\t]/)) {
      this._state.gutter = m[1];
    }
    ;
    if (o.gutter !== void 0) {
      this._state.gutter = o.gutter;
    }
    ;
    if (this._script && !o.inline) {
      this._script.tokens = this._tokens;
    }
    ;
    this.parse(code);
    if (!o.inline)
      this.closeIndentation();
    if (this._ends.length) {
      this.error("missing " + this._ends.pop());
    }
    ;
    return this._tokens;
  };
  Lexer.prototype.parse = function(code) {
    var i = 0;
    var pi = 0;
    this._loc = this._locOffset + i;
    while (this._chunk = code.slice(i)) {
      let ctx = this._context;
      if (ctx && ctx.pop) {
        if (ctx.pop.test(this._chunk)) {
          this.popEnd();
        }
        ;
      }
      ;
      pi = ctx && ctx.lexer && ctx.lexer.call(this) || this._end == "TAG" && this.tagDefContextToken() || this._inTag && this.tagContextToken() || this._inStyle2 && this.lexStyleBody() || this.basicContext();
      i += pi;
      this._loc = this._locOffset + i;
    }
    ;
    return;
  };
  Lexer.prototype.basicContext = function() {
    return this.selectorToken() || this.symbolToken() || this.identifierToken() || this.whitespaceToken() || this.lineToken() || this.commentToken() || this.heredocToken() || this.tagToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.literalToken() || 0;
  };
  Lexer.prototype.moveCaret = function(i) {
    return this._loc += i;
  };
  Lexer.prototype.context = function() {
    return this._ends[this._ends.length - 1];
  };
  Lexer.prototype.inContext = function(key) {
    var o = this._contexts[this._contexts.length - 1];
    return o && o[key];
  };
  Lexer.prototype.pushEnd = function(val, ctx) {
    let prev = this._context;
    this._ends.push(val);
    this._contexts.push(this._context = ctx || {});
    this._end = val;
    this.refreshScope();
    if (ctx && (ctx.closeType == "STYLE_END" || ctx.style)) {
      ctx.lexer = this.lexStyleBody;
      ctx.style = true;
      this._inStyle++;
    }
    ;
    if (prev && prev.style && val != "}") {
      ctx.lexer = this.lexStyleBody;
      ctx.style = true;
    }
    ;
    if (ctx && ctx.id) {
      ctx.start = new Token2(ctx.id + "_START", val, this._last.region()[1], 0);
      this._tokens.push(ctx.start);
    }
    ;
    return this;
  };
  Lexer.prototype.popEnd = function(val) {
    var popped = this._ends.pop();
    this._end = this._ends[this._ends.length - 1];
    var ctx = this._context;
    if (ctx && ctx.start) {
      ctx.end = new Token2(ctx.closeType || ctx.id + "_END", popped, this._last.region()[1], 0);
      ctx.end._start = ctx.start;
      ctx.start._end = ctx.end;
      this._tokens.push(ctx.end);
    }
    ;
    if (ctx && (ctx.closeType == "STYLE_END" || ctx.style)) {
      this._inStyle--;
    }
    ;
    this._contexts.pop();
    this._context = this._contexts[this._contexts.length - 1];
    this.refreshScope();
    return [popped, ctx];
  };
  Lexer.prototype.refreshScope = function() {
    var ctx0 = this._ends[this._ends.length - 1];
    var ctx1 = this._ends[this._ends.length - 2];
    return this._inTag = ctx0 == "TAG_END" || ctx1 == "TAG_END" && ctx0 == "OUTDENT";
  };
  Lexer.prototype.queueScope = function(val) {
    this._scopes[this._indents.length] = val;
    return this;
  };
  Lexer.prototype.popScope = function(val) {
    this._scopes.pop();
    return this;
  };
  Lexer.prototype.getScope = function() {
    return this._scopes[this._indents.length - 1];
  };
  Lexer.prototype.scope = function(sym, opts) {
    var len = this._ends.push(this._end = sym);
    this._contexts.push(opts || null);
    return sym;
  };
  Lexer.prototype.closeSelector = function() {
    if (this._end == "%") {
      this.token("SELECTOR_END", "%", 0);
      return this.pair("%");
    }
    ;
  };
  Lexer.prototype.openDef = function() {
    return this.pushEnd("DEF");
  };
  Lexer.prototype.closeDef = function() {
    if (this.context() == "DEF") {
      var prev = last(this._tokens);
      if (tT(prev) == "TERMINATOR") {
        let n = this._tokens.pop();
        this.token("DEF_BODY", "DEF_BODY", 0);
        this._tokens.push(n);
      } else {
        this.token("DEF_BODY", "DEF_BODY", 0);
      }
      ;
      this.pair("DEF");
    }
    ;
    return;
  };
  Lexer.prototype.tagContextToken = function() {
    let chr = this._chunk[0];
    let chr2 = this._chunk[1];
    let m = /^([A-Za-z\_\-\$\%][\w\-\$]*(\:[A-Za-z\_\-\$]+)*)/.exec(this._chunk);
    if (m) {
      let tok = m[1];
      let typ = "TAG_LITERAL";
      let len = m[0].length;
      if (tok == "self" && this._lastVal == "<") {
        typ = "SELF";
      }
      ;
      if (chr == "$" && (this._lastTyp == "TAG_TYPE" || this._lastTyp == "TAG_START")) {
        typ = "TAG_REF";
      }
      ;
      if (chr == "%") {
        typ = "MIXIN";
      }
      ;
      this.token(typ, tok, len);
      return len;
    }
    ;
    if (chr == "/" && chr2 == ">") {
      this.token("TAG_END", "/>", 2);
      this.pair("TAG_END");
      return 2;
    }
    ;
    if (chr == "%" || chr == ":" || chr == "." || chr == "@") {
      this.token("T" + chr, chr, 1);
      return 1;
    } else if (chr == " " || chr == "\n" || chr == "	") {
      let m2 = /^[\n\s\t]+/.exec(this._chunk);
      this.token("TAG_WS", m2[0], m2[0].length);
      return m2[0].length;
    } else if (chr == "=" && this._chunk[1] != ">") {
      this.token("=", "=", 1);
      this.pushEnd("TAG_ATTR", {id: "VALUE", pop: /^([\s\n\>]|\/\>)/});
      return 1;
    }
    ;
    return 0;
  };
  Lexer.prototype.tagDefContextToken = function() {
    var match;
    if (match = TAG_TYPE.exec(this._chunk)) {
      this.token("TAG_TYPE", match[0], match[0].length);
      return match[0].length;
    }
    ;
    if (match = TAG_ID.exec(this._chunk)) {
      var input = match[0];
      this.token("TAG_ID", input, input.length);
      return input.length;
    }
    ;
    if (this._chunk[0] == "\n") {
      this.pair("TAG");
    }
    ;
    return 0;
  };
  Lexer.prototype.findTypeAnnotation = function(str) {
    var stack = [];
    var i = 0;
    var replaces = [];
    var ending = /[\=\n\ \t\.\,\:\+]/;
    while (i < str.length) {
      var chr = str.charAt(i);
      let end = stack[0];
      let instr = end == '"' || end == "'";
      if (chr && chr == end) {
        stack.shift();
      } else if (!end && (chr == ")" || chr == "]" || chr == "}" || chr == ">")) {
        break;
      } else if (chr == "(") {
        stack.unshift(")");
      } else if (chr == "[") {
        stack.unshift("]");
      } else if (chr == "{") {
        stack.unshift("}");
      } else if (chr == "<") {
        stack.unshift(">");
      } else if (chr == '"') {
        stack.unshift('"');
      } else if (chr == "'") {
        stack.unshift("'");
      } else if (!end && ending.test(chr)) {
        break;
      }
      ;
      i++;
    }
    ;
    if (i == 0) {
      return null;
    }
    ;
    return str.slice(0, i);
  };
  Lexer.prototype.findBalancedSelector = function(str) {
    var stack = [];
    var i = 0;
    var replaces = [];
    while (i < str.length - 1) {
      var letter = str.charAt(i);
      let end = stack[0];
      let instr = end == '"' || end == "'";
      if (letter && letter == end) {
        stack.shift();
      } else if (!instr && (letter == ")" || letter == "]" || letter == "}")) {
        console.log("out of balance!!");
        break;
      } else if (letter == "/") {
        replaces.unshift([i, 1, ":"]);
      } else if (letter == "(" && !instr) {
        stack.unshift(")");
      } else if (letter == "[" && !instr) {
        stack.unshift("]");
      } else if (letter == '"') {
        stack.unshift('"');
      } else if (letter == "'") {
        stack.unshift("'");
      }
      ;
      if (!end && (letter == "=" || letter == "\n" || letter == "{")) {
        break;
      }
      ;
      if (!end && letter == " " && STYLE_PROPERTY2.exec(str.slice(i + 1))) {
        break;
      }
      ;
      i++;
    }
    ;
    if (i == 0) {
      return null;
    }
    ;
    let sel = str.slice(0, i);
    if (replaces.length) {
      sel = sel.split("");
      for (let j = 0, len = replaces.length; j < len; j++) {
        sel.splice.apply(sel, replaces[j]);
      }
      ;
      sel = sel.join("");
    }
    ;
    return sel;
  };
  Lexer.prototype.lexStyleRule = function(offset, force) {
    if (offset === void 0)
      offset = 0;
    if (force === void 0)
      force = false;
    let chunk = offset ? this._chunk.slice(offset) : this._chunk;
    let sel = this.findBalancedSelector(chunk);
    if (sel || force) {
      let len = sel ? sel.length : 0;
      this.token("CSS_SEL", sel || "", len, offset);
      let seltoken = this._last;
      let next = chunk[len];
      if (next == "=") {
        len++;
      }
      ;
      this._indents.push(1);
      this._outdebt = this._indebt = 0;
      this.token("INDENT", "1", 0, 1);
      this.pushEnd("OUTDENT", {lexer: this.lexStyleBody, opener: seltoken, style: true});
      this._indent++;
      return len;
    }
    ;
    return 0;
  };
  Lexer.prototype.lexStyleBody = function() {
    if (this._end == "%") {
      return 0;
    }
    ;
    let chr = this._chunk[0];
    var m;
    let styleprop = STYLE_PROPERTY2.exec(this._chunk);
    let ltyp = this._lastTyp;
    if (!styleprop && this._chunk.match(/^([\%\*\w\&\$\>\/\.\[\@\!]|\#[\w\-]|\:\:)/) && (ltyp == "TERMINATOR" || ltyp == "INDENT")) {
      let sel = this.findBalancedSelector(this._chunk);
      if (sel) {
        return this.lexStyleRule(0);
      }
      ;
    }
    ;
    if (styleprop) {
      this.token("CSSPROP", styleprop[0], styleprop[0].length);
      return styleprop[0].length;
    }
    ;
    if (chr[0] == "#" && (m = STYLE_HEX.exec(this._chunk))) {
      this.token("COLOR", m[0], m[0].length);
      return m[0].length;
    }
    ;
    if (chr == "/" && !this._last.spaced) {
      this.token("/", chr, 1);
      return 1;
    }
    ;
    if (m = STYLE_NUMERIC.exec(this._chunk)) {
      let len = m[0].length;
      let typ = "NUMBER";
      if (m[2] == "%") {
        typ = "PERCENTAGE";
      } else if (m[2]) {
        typ = "DIMENSION";
      }
      ;
      if (this._lastTyp == "COMPARE" && !this._last.spaced) {
        true;
      }
      ;
      this.token(typ, m[0], len);
      return len;
    } else if (m = STYLE_URL.exec(this._chunk)) {
      let len = m[0].length;
      this.token("CSSURL", m[0], len);
      return m[0].length;
    } else if (m = STYLE_IDENTIFIER.exec(this._chunk)) {
      let id = "CSSIDENTIFIER";
      let val = m[0];
      let len = val.length;
      if (m[0].match(/^\-\-/)) {
        id = "CSSVAR";
      } else if (this._last && !this._last.spaced && ltyp == "}") {
        id = "CSSUNIT";
      }
      ;
      this.token(id, val, len);
      return len;
    } else if (this._last && !this._last.spaced && ltyp == "}" && chr == "%") {
      this.token("CSSUNIT", chr, 1);
      return 1;
    }
    ;
    return 0;
  };
  Lexer.prototype.importsToken = function() {
    var match;
    if (match = IMPORTS.exec(this._chunk)) {
      this.token("IMPORTS", match[1], match[1].length, 7);
      return match[0].length;
    }
    ;
    return 0;
  };
  Lexer.prototype.tagToken = function() {
    var match, ary;
    if (!(match = TAG.exec(this._chunk))) {
      return 0;
    }
    ;
    var ary = iter$7(match);
    var input = ary[0], type = ary[1], identifier = ary[2];
    if (type == "<") {
      this.token("TAG_START", "<", 1);
      this.pushEnd(INVERSES.TAG_START);
      if (match = TAG_TYPE.exec(this._chunk.substr(1, 40))) {
        let next = this._chunk[match[0].length + 1];
        if (match[0] != "self" && (next != "{" && next != "-")) {
          this.token("TAG_TYPE", match[0], match[0].length, 1);
          return input.length + match[0].length;
        }
        ;
      } else if (this._chunk[1] == ">") {
        this.token("TAG_TYPE", "fragment", 0, 0);
      }
      ;
      if (identifier) {
        if (identifier.substr(0, 1) == "{") {
          return type.length;
        } else {
          this.token("TAG_NAME", input.substr(1), 0);
        }
        ;
      }
      ;
    }
    ;
    return input.length;
  };
  Lexer.prototype.selectorToken = function() {
    var ary;
    var match;
    if (this._end == "%") {
      var chr = this._chunk[0];
      var ctx = this._context;
      var i = 0;
      var part = "";
      var ending = false;
      while (chr = this._chunk[i++]) {
        if (chr == ")" && ctx.parens == 0) {
          ending = true;
          break;
        } else if (chr == "(") {
          ctx.parens++;
          part += "(";
        } else if (chr == ")") {
          ctx.parens--;
          part += ")";
        } else if (chr == "{") {
          break;
        } else {
          part += chr;
        }
        ;
      }
      ;
      if (part) {
        this.token("SELECTOR_PART", part, i - 1);
      }
      ;
      if (ending) {
        this.token("SELECTOR_END", ")", 1, i - 1);
        this.pair("%");
        return i;
      }
      ;
      return i - 1;
    }
    ;
    if (!(match = SELECTOR.exec(this._chunk))) {
      return 0;
    }
    ;
    var ary = iter$7(match);
    var input = ary[0], id = ary[1], kind = ary[2];
    if (kind == "(") {
      this.token("SELECTOR_START", id, id.length + 1);
      this.pushEnd("%", {parens: 0});
      return id.length + 1;
    } else if (id == "%") {
      if (this.context() == "%") {
        return 1;
      }
      ;
      this.token("SELECTOR_START", id, id.length);
      this.pushEnd("%", {open: true});
      return id.length;
    } else {
      return 0;
    }
    ;
  };
  Lexer.prototype.inTag = function() {
    var len = this._ends.length;
    if (len > 0) {
      var ctx0 = this._ends[len - 1];
      var ctx1 = len > 1 ? this._ends[len - 2] : ctx0;
      return ctx0 == "TAG_END" || ctx1 == "TAG_END" && ctx0 == "OUTDENT";
    }
    ;
    return false;
  };
  Lexer.prototype.isKeyword = function(id) {
    var m;
    if (this._lastTyp == "ATTR" || this._lastTyp == "PROP" || this._lastTyp == "DEF") {
      return false;
    }
    ;
    if (id == "get" || id == "set") {
      if (m = this._chunk.match(/^[gs]et ([\$\w\-]+)/)) {
        let ctx = this._contexts[this._contexts.length - 1] || {};
        let before = ctx.opener && this._tokens[this._tokens.indexOf(ctx.opener) - 1];
        if (idx$(this._lastTyp, ["TERMINATOR", "INDENT"]) >= 0) {
          if (before && (before._type == "=" || before._type == "{")) {
            return true;
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if ((id == "guard" || id == "alter" || id == "watch") && this.getScope() == "PROP") {
      return true;
    }
    ;
    if (id == "css") {
      if (!this._context && (idx$(this._lastTyp, ["TERMINATOR"]) >= 0 || !this._lastTyp)) {
        return true;
      }
      ;
      if (idx$(this._lastVal, ["global", "local", "export", "default"]) >= 0) {
        return true;
      }
      ;
      if (idx$(this._lastTyp, ["="]) >= 0) {
        return true;
      }
      ;
    }
    ;
    if (id == "attr" || id == "prop" || id == "get" || id == "set" || id == "lazy" || id == "css" || id == "constructor") {
      var scop = this.getScope();
      var incls = scop == "CLASS" || scop == "TAG";
      if (id == "lazy") {
        return incls && idx$(this._lastTyp, ["INDENT", "TERMINATOR", "DECORATOR"]) >= 0;
      }
      ;
      if (id == "constructor") {
        return incls && idx$(this._lastTyp, ["INDENT", "TERMINATOR", "DECORATOR"]) >= 0;
      }
      ;
      if (incls) {
        return true;
      }
      ;
    }
    ;
    return ALL_KEYWORDS.indexOf(id) >= 0;
  };
  Lexer.prototype.identifierToken = function() {
    var ary;
    var match;
    var ctx0 = this._ends.length > 0 ? this._ends[this._ends.length - 1] : null;
    var ctx1 = this._ends.length > 1 ? this._ends[this._ends.length - 2] : null;
    var innerctx = ctx0;
    var typ;
    var reserved = false;
    var addLoc = false;
    var inTag = ctx0 == "TAG_END" || ctx1 == "TAG_END" && ctx0 == "OUTDENT";
    if (!(match = IDENTIFIER.exec(this._chunk))) {
      return 0;
    }
    ;
    var ary = iter$7(match);
    var input = ary[0], id = ary[1], typ = ary[2], m3 = ary[3], m4 = ary[4], colon = ary[5];
    var idlen = id.length;
    if (id === "own" && this.lastTokenType() == "FOR") {
      this.token("OWN", id, id.length);
      return id.length;
    }
    ;
    var prev = last(this._tokens);
    var lastTyp = this._lastTyp;
    if (lastTyp == "#") {
      this.token("IDENTIFIER", id, idlen);
      return idlen;
    }
    ;
    var forcedIdentifier = colon || lastTyp == "." || lastTyp == "?.";
    if (colon && lastTyp == "?") {
      forcedIdentifier = false;
    }
    ;
    if (id == "tag" && this._chunk.indexOf("tag(") == 0) {
      forcedIdentifier = true;
    }
    ;
    var isKeyword = false;
    if (typ == "$" && ARGVAR.test(id)) {
      if (id == "$0") {
        typ = "ARGUMENTS";
      } else {
        typ = "ARGVAR";
        id = id.substr(1);
      }
      ;
    } else if (typ == "$" && ENV_FLAG.test(id)) {
      typ = "ENV_FLAG";
      id = id.toUpperCase();
    } else if (typ == "@") {
      typ = "DECORATOR";
    } else if (typ == "#") {
      typ = "SYMBOLID";
    } else if (typ == "##") {
      typ = "SYMBOLID";
    } else if (typ == "%") {
      typ = "MIXIN";
    } else if (typ == "$" && !colon) {
      typ = "IDENTIFIER";
    } else if (id == "elif" && !forcedIdentifier) {
      this.token("ELSE", "elif", id.length);
      this.token("IF", "if");
      return id.length;
    } else {
      typ = "IDENTIFIER";
    }
    ;
    if (!forcedIdentifier && (isKeyword = this.isKeyword(id))) {
      if (typeof isKeyword == "string") {
        typ = isKeyword;
      } else {
        typ = id.toUpperCase();
      }
      ;
      addLoc = true;
      if (typ == "MODULE") {
        if (!/^module [a-zA-Z]/.test(this._chunk) || ctx0 == "TAG_ATTR") {
          typ = "IDENTIFIER";
        }
        ;
      }
      ;
      if (typ == "YES") {
        typ = "TRUE";
      } else if (typ == "NO") {
        typ = "FALSE";
      } else if (typ == "NIL") {
        typ = "NULL";
      } else if (typ == "VAR" || typ == "CONST" || typ == "LET") {
        let ltyp = this._lastTyp;
      } else if (typ == "IF" || typ == "ELSE" || typ == "TRUE" || typ == "FALSE" || typ == "NULL") {
        true;
      } else if (typ == "TAG") {
        this.pushEnd("TAG");
      } else if (typ == "DEF" || typ == "GET" || typ == "SET") {
        typ = "DEF";
        this.openDef();
      } else if (typ == "CONSTRUCTOR") {
        this.token("DEF", "", 0);
        typ = "IDENTIFIER";
        this.openDef();
      } else if (typ == "DO") {
        if (this.context() == "DEF")
          this.closeDef();
      } else if (typ === "WHEN" && LINE_BREAK.indexOf(this.lastTokenType()) >= 0) {
        typ = "LEADING_WHEN";
      } else if (typ === "FOR") {
        this._seenFor = true;
      } else if (typ === "UNLESS") {
        typ = "IF";
      } else if (UNARY.indexOf(typ) >= 0) {
        typ = "UNARY";
      } else if (RELATION.indexOf(typ) >= 0) {
        if (typ != "INSTANCEOF" && typ != "ISA" && this._seenFor) {
          typ = "FOR" + typ;
          this._seenFor = false;
        } else {
          typ = "RELATION";
          if (prev._type == "UNARY") {
            prev._type = "NOT";
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if (!forcedIdentifier) {
      if (this._lastVal == "export" && id == "default") {
        tTs(prev, "EXPORT");
        typ = "DEFAULT";
      }
      ;
      switch (id) {
        case "!":
        case "not": {
          typ = "UNARY";
          break;
        }
        case "==":
        case "!=":
        case "===":
        case "!==":
        case "is":
        case "isnt": {
          typ = "COMPARE";
          break;
        }
        case "&&":
        case "||":
        case "and":
        case "or":
        case "??": {
          typ = "LOGIC";
          break;
        }
        case "super":
        case "break":
        case "continue":
        case "debugger":
        case "arguments": {
          typ = id.toUpperCase();
          break;
        }
      }
      ;
    }
    ;
    var len = input.length;
    if (typ == "CLASS" || typ == "DEF" || typ == "TAG" || typ == "PROP" || typ == "CSS") {
      this.queueScope(typ);
      var i = this._tokens.length;
      while (i) {
        prev = this._tokens[--i];
        var ctrl = "" + tV(prev);
        if (idx$(ctrl, IMBA_CONTEXTUAL_KEYWORDS) >= 0) {
          tTs(prev, ctrl.toUpperCase());
        } else {
          break;
        }
        ;
      }
      ;
    } else if (typ == "IF") {
      this.queueScope(typ);
    } else if (typ == "IMPORT") {
      if (lastTyp == "AWAIT" || this._chunk[idlen] == "(") {
        typ = "IDENTIFIER";
      } else {
        this.pushEnd("IMPORT");
        this.token(typ, id, idlen);
        return len;
      }
      ;
    } else if (id == "type" && lastTyp == "IMPORT") {
      this.token("TYPEIMPORT", id, idlen);
      return len;
    } else if (typ == "EXPORT") {
      this.pushEnd("EXPORT");
      this.token(typ, id, idlen);
      return len;
    } else if (id == "from" && ctx0 == "IMPORT") {
      typ = "FROM";
      this.pair("IMPORT");
    } else if (id == "from" && ctx0 == "EXPORT") {
      typ = "FROM";
      this.pair("EXPORT");
    } else if (id == "as" && (ctx0 == "IMPORT" || this._lastTyp == "IDENTIFIER" || ctx0 == "EXPORT")) {
      typ = "AS";
    }
    ;
    if (id == "new" && (this._lastTyp != "." && this._chunk.match(/^new\s+[\w\$\(]/))) {
      typ = "NEW";
    }
    ;
    if (typ == "IDENTIFIER") {
      if (lastTyp == "CATCH") {
        typ = "CATCH_VAR";
      }
      ;
    }
    ;
    if ((lastTyp == "NUMBER" || lastTyp == ")") && !prev.spaced && (typ == "IDENTIFIER" || id == "%")) {
      typ = "UNIT";
    }
    ;
    if (colon) {
      this.token(typ, id, idlen);
      var colonOffset = colon.indexOf(":");
      this.moveCaret(idlen + colonOffset);
      this.token(":", ":", 1);
      this.moveCaret(-(idlen + colonOffset));
    } else {
      this.token(typ, id, idlen);
    }
    ;
    if (typ == "CSS") {
      return len + this.lexStyleRule(len, true);
    }
    ;
    return len;
  };
  Lexer.prototype.numberToken = function() {
    var binaryLiteral;
    var match, number, lexedLength;
    if (!(match = NUMBER.exec(this._chunk))) {
      return 0;
    }
    ;
    number = match[0];
    lexedLength = number.length;
    if (binaryLiteral = /0b([01_]+)/.exec(number)) {
      number = "" + parseInt(binaryLiteral[1].replace(/_/g, ""), 2);
    }
    ;
    var prev = last(this._tokens);
    if (match[0][0] == "." && prev && !prev.spaced && ["IDENTIFIER", ")", "}", "]", "NUMBER"].indexOf(tT(prev)) >= 0) {
      this.token(".", ".");
      number = number.substr(1);
    }
    ;
    this.token("NUMBER", number, lexedLength);
    return lexedLength;
  };
  Lexer.prototype.symbolToken = function() {
    var match, symbol3, prev;
    if (!(match = SYMBOL.exec(this._chunk))) {
      return 0;
    }
    ;
    symbol3 = match[0];
    prev = last(this._tokens);
    if (!prev || prev.spaced || idx$(this._prevVal, ["(", "[", "="]) >= 0) {
      let sym = helpers2.dashToCamelCase(symbol3.slice(1));
      this.token("STRING", '"' + sym + '"', match[0].length);
      return match[0].length;
    }
    ;
    return 0;
  };
  Lexer.prototype.escapeStr = function(str, heredoc, q) {
    str = str.replace(MULTILINER, heredoc ? "\\n" : "");
    if (q) {
      var r = RegExp("\\\\[" + q + "]", "g");
      str = str.replace(r, q);
      str = str.replace(RegExp("" + q, "g"), "\\$&");
    }
    ;
    return str;
  };
  Lexer.prototype.stringToken = function() {
    var match, string2;
    switch (this._chunk.charAt(0)) {
      case "'": {
        if (!(match = SIMPLESTR.exec(this._chunk))) {
          return 0;
        }
        ;
        string2 = match[0];
        this.token("STRING", this.escapeStr(string2), string2.length);
        break;
      }
      case '"': {
        if (!(string2 = this.balancedString(this._chunk, '"'))) {
          return 0;
        }
        ;
        if (string2.indexOf("{") >= 0) {
          var len = string2.length;
          this.token("STRING_START", string2.charAt(0), 1);
          this.interpolateString(string2.slice(1, -1));
          this.token("STRING_END", string2.charAt(len - 1), 1, string2.length - 1);
        } else {
          len = string2.length;
          this.token("STRING", this.escapeStr(string2), len);
        }
        ;
        break;
      }
      case "`": {
        if (!(string2 = this.balancedString(this._chunk, "`"))) {
          return 0;
        }
        ;
        if (string2.indexOf("{") >= 0) {
          len = string2.length;
          this.token("STRING_START", string2.charAt(0), 1);
          this.interpolateString(string2.slice(1, -1), {heredoc: true});
          this.token("STRING_END", string2.charAt(len - 1), 1, string2.length - 1);
        } else {
          len = string2.length;
          this.token("STRING", this.escapeStr(string2, true), len);
        }
        ;
        break;
      }
      default:
        return 0;
    }
    ;
    this.moveHead(string2);
    return string2.length;
  };
  Lexer.prototype.heredocToken = function() {
    var match, heredoc, quote, doc;
    if (!(match = HEREDOC.exec(this._chunk))) {
      return 0;
    }
    ;
    heredoc = match[0];
    quote = heredoc.charAt(0);
    var opts = {quote, indent: null, offset: 0};
    doc = this.sanitizeHeredoc(match[2], opts);
    if (quote == '"' && doc.indexOf("{") >= 0) {
      var open = match[1];
      this.token("STRING_START", open, open.length);
      this.interpolateString(doc, {heredoc: true, offset: open.length + opts.offset, quote, indent: opts.realIndent});
      this.token("STRING_END", open, open.length, heredoc.length - open.length);
    } else {
      this.token("STRING", this.makeString(doc, quote, true), 0);
    }
    ;
    this.moveHead(heredoc);
    return heredoc.length;
  };
  Lexer.prototype.parseMagicalOptions = function(str) {
    var self2 = this;
    if (str.indexOf("imba$") >= 0) {
      str.replace(/imba\$(\w+)\=(\S*)\b/g, function(m, name, val) {
        if (/^\d+$/.test(val)) {
          val = parseInt(val);
        }
        ;
        return self2._opts[name] = val;
      });
    }
    ;
    return self2;
  };
  Lexer.prototype.commentToken = function() {
    var match, length, comment, indent, prev;
    var typ = "HERECOMMENT";
    if (match = JS_COMMENT.exec(this._chunk)) {
      this.token("HERECOMMENT", match[1], match[1].length);
      this.token("TERMINATOR", "\n");
      return match[0].length;
    }
    ;
    if (match = INLINE_COMMENT.exec(this._chunk)) {
      length = match[0].length;
      indent = match[1];
      comment = match[2];
      let commentBody = match[4] || "";
      if (comment[0] == "#") {
        commentBody = " " + commentBody;
      }
      ;
      prev = last(this._tokens);
      var pt = prev && tT(prev);
      var note = "//" + commentBody;
      this.parseMagicalOptions(note);
      if (this._last && this._last.spaced) {
        note = " " + note;
      }
      ;
      if (note.match(/^\/\/ \@(type|param)/)) {
        note = "/**" + commentBody + "*/";
      } else if (note.match(/^\/\/ \<(reference)/)) {
        note = "///" + commentBody;
      }
      ;
      if (pt && pt != "INDENT" && pt != "TERMINATOR" || !pt) {
        this.token("TERMINATOR", note, length);
      } else {
        if (pt == "TERMINATOR") {
          tVs(prev, tV(prev) + note);
        } else if (pt == "INDENT") {
          this.addLinebreaks(1, note);
        } else {
          this.token(typ, comment.substr(2), length);
        }
        ;
      }
      ;
      return length;
    }
    ;
    if (!(match = COMMENT.exec(this._chunk))) {
      return 0;
    }
    ;
    comment = match[0];
    var here = match[1];
    if (here) {
      this.token("HERECOMMENT", this.sanitizeHeredoc(here, {herecomment: true, indent: Array(this._indent + 1).join(" ")}), comment.length);
      this.token("TERMINATOR", "\n");
    } else {
      this.token("HERECOMMENT", comment, comment.length);
      this.token("TERMINATOR", "\n");
    }
    ;
    this.moveHead(comment);
    return comment.length;
  };
  Lexer.prototype.regexToken = function() {
    var ary;
    var match, length, prev;
    if (this._chunk.charAt(0) != "/") {
      return 0;
    }
    ;
    if (match = HEREGEX.exec(this._chunk)) {
      length = this.heregexToken(match);
      this.moveHead(match[0]);
      return length;
    }
    ;
    prev = last(this._tokens);
    if (prev && idx$(tT(prev), prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX) >= 0) {
      return 0;
    }
    ;
    if (!(match = REGEX.exec(this._chunk))) {
      return 0;
    }
    ;
    var ary = iter$7(match);
    var m = ary[0], regex = ary[1], flags = ary[2];
    this.token("REGEX", "" + regex + flags, m.length);
    return m.length;
  };
  Lexer.prototype.heregexToken = function(match) {
    var ary;
    var ary = iter$7(match);
    var heregex = ary[0], body = ary[1], flags = ary[2];
    this.token("REGEX", heregex, heregex.length);
    return heregex.length;
  };
  Lexer.prototype.lineToken = function() {
    var gutter;
    var match;
    if (!(match = MULTI_DENT.exec(this._chunk))) {
      return 0;
    }
    ;
    var indent = match[0];
    var brCount = this.moveHead(indent);
    this._seenFor = false;
    var prev = last(this._tokens, 1);
    let whitespace = indent.substr(indent.lastIndexOf("\n") + 1);
    var noNewlines = this.unfinished();
    if (/^\n#\s/.test(this._chunk)) {
      this.addLinebreaks(1);
      return 0;
    }
    ;
    if (this._state.gutter == void 0) {
      this._state.gutter = whitespace;
    }
    ;
    if (gutter = this._state.gutter || this._opts.gutter) {
      if (whitespace.indexOf(gutter) == 0) {
        whitespace = whitespace.slice(gutter.length);
      } else if (this._chunk[indent.length] === void 0) {
        true;
      } else {
        this.error("incorrect indentation");
      }
      ;
    }
    ;
    var size = whitespace.length;
    if (this._opts.dropIndentation) {
      return size;
    }
    ;
    if (size > 0) {
      if (!this._indentStyle) {
        this._opts.indent = this._indentStyle = whitespace;
        this._indentRegex = new RegExp(whitespace, "g");
      }
      ;
      let indentSize = 0;
      let offset = 0;
      let offsetLoc = this._loc;
      while (true) {
        let idx = whitespace.indexOf(this._indentStyle, offset);
        if (idx == offset) {
          indentSize++;
          offset += this._indentStyle.length;
        } else if (offset == whitespace.length) {
          break;
        } else {
          this._loc += indent.length - whitespace.length;
          let start = this._loc;
          this.token("INDENT", whitespace, whitespace.length);
          this.error("Use tabs for indentation", {
            offset: start + offset,
            length: whitespace.length - offset
          });
        }
        ;
      }
      ;
      size = indentSize;
    }
    ;
    if (size - this._indebt == this._indent) {
      if (noNewlines) {
        this.suppressNewlines();
      } else {
        this.newlineToken(brCount, indent);
      }
      ;
      return indent.length;
    }
    ;
    if (size > this._indent) {
      if (noNewlines) {
        this._indebt = size - this._indent;
        this.suppressNewlines();
        return indent.length;
      }
      ;
      if (this.inTag()) {
        return indent.length;
      }
      ;
      var diff = size - this._indent + this._outdebt;
      this.closeDef();
      var expectScope = this._scopes[this._indents.length];
      var immediate = last(this._tokens);
      if (immediate && tT(immediate) == "TERMINATOR") {
        tTs(immediate, "INDENT");
        immediate._meta || (immediate._meta = {pre: tV(immediate), post: ""});
        immediate.scope = expectScope;
      } else {
        this.token("INDENT", "" + diff, 0);
        this._last.scope = expectScope;
      }
      ;
      this._indents.push(diff);
      this.pushEnd("OUTDENT", {opener: this._last});
      this._outdebt = this._indebt = 0;
      this.addLinebreaks(brCount);
    } else if (true) {
      this._indebt = 0;
      let moveOut = this._indent - size;
      let currIndent = this._indent;
      let useTabs = this._indentStyle == "	";
      let lines = indent.replace().split("\n");
      let levels = [];
      let k = lines.length;
      let lvl = 0;
      while (k > 0) {
        let ln = lines[--k];
        let lnlvl = useTabs ? ln.length : ln.replace(this._indentRegex, "	").length;
        if (lnlvl > lvl) {
          lvl = lnlvl;
        }
        ;
        levels[k] = lvl;
      }
      ;
      levels[0] = currIndent;
      let i = 0;
      let toks = [];
      let pre = "";
      for (let idx = 0, items = iter$7(lines), len = items.length; idx < len; idx++) {
        let lvl2 = levels[idx];
        while (currIndent > lvl2) {
          if (pre) {
            this.terminatorToken(pre);
            pre = "";
          } else {
            this.terminatorToken("");
          }
          ;
          moveOut--;
          this.outdentToken(1, true);
          currIndent--;
        }
        ;
        pre += "\n" + items[idx];
      }
      ;
      if (pre) {
        this.terminatorToken(pre);
      }
      ;
      while (moveOut > 0) {
        this.outdentToken(1, true);
        moveOut--;
      }
      ;
    }
    ;
    this._indent = size;
    return indent.length;
  };
  Lexer.prototype.outdentToken = function(moveOut, noNewlines, newlineCount) {
    var dent = 0;
    while (moveOut > 0) {
      var len = this._indents.length - 1;
      if (this._indents[len] == void 0) {
        moveOut = 0;
      } else if (this._indents[len] == this._outdebt) {
        moveOut -= this._outdebt;
        this._outdebt = 0;
      } else if (this._indents[len] < this._outdebt) {
        this._outdebt -= this._indents[len];
        moveOut -= this._indents[len];
      } else {
        dent = this._indents.pop() - this._outdebt;
        moveOut -= dent;
        this._outdebt = 0;
        if (!noNewlines) {
          this.addLinebreaks(1);
        }
        ;
        let paired = this.pair("OUTDENT");
        this.token("OUTDENT", "" + dent, 0);
        if (paired[1] && paired[1].opener) {
          let opener = paired[1].opener;
          this._last._opener = opener;
          opener._closer = this._last;
          if (opener._type == "CSS_SEL") {
            this.token("CSS_END", "", 0);
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if (dent) {
      this._outdebt -= moveOut;
    }
    ;
    while (this.lastTokenValue() == ";") {
      this._tokens.pop();
    }
    ;
    if (!(this.lastTokenType() == "TERMINATOR" || noNewlines)) {
      this.token("TERMINATOR", "\n", 0);
    }
    ;
    this._scopes.length = this._indents.length;
    this.closeDef();
    var ctx = this.context();
    if (ctx == "%" || ctx == "TAG" || ctx == "IMPORT" || ctx == "EXPORT") {
      this.pair(ctx);
    }
    ;
    return this;
  };
  Lexer.prototype.whitespaceToken = function(type) {
    var match, nline, prev;
    if (!((match = WHITESPACE.exec(this._chunk)) || (nline = this._chunk.charAt(0) === "\n"))) {
      return 0;
    }
    ;
    prev = last(this._tokens);
    if (prev) {
      if (match) {
        prev.spaced = true;
        return match[0].length;
      } else {
        prev.newLine = true;
        return 0;
      }
      ;
    }
    ;
  };
  Lexer.prototype.moveHead = function(str) {
    var br = count(str, "\n");
    return br;
  };
  Lexer.prototype.terminatorToken = function(content, loc) {
    if (this._lastTyp == "TERMINATOR") {
      return this._last._value += content;
    } else {
      return this.token("TERMINATOR", content, loc);
    }
    ;
  };
  Lexer.prototype.addLinebreaks = function(count2, raw) {
    var br;
    if (!raw && count2 == 0) {
      return this;
    }
    ;
    var prev = this._last;
    if (!raw) {
      if (count2 == 1) {
        br = "\n";
      } else if (count2 == 2) {
        br = "\n\n";
      } else if (count2 == 3) {
        br = "\n\n\n";
      } else {
        br = repeatString("\n", count2);
      }
      ;
    }
    ;
    if (prev) {
      var t = prev._type;
      var v = tV(prev);
      if (t == "INDENT") {
        var meta = prev._meta || (prev._meta = {pre: "", post: ""});
        meta.post += raw || br;
        return this;
      } else if (t == "TERMINATOR") {
        tVs(prev, v + (raw || br));
        return this;
      }
      ;
    }
    ;
    this.token("TERMINATOR", raw || br, 0);
    return;
  };
  Lexer.prototype.newlineToken = function(lines, raw) {
    this.addLinebreaks(lines, raw);
    this.closeDef();
    var ctx = this.context();
    if (ctx == "TAG" || ctx == "IMPORT" || ctx == "EXPORT") {
      this.pair(ctx);
    }
    ;
    return this;
  };
  Lexer.prototype.suppressNewlines = function() {
    if (this.value() === "\\") {
      this._tokens.pop();
    }
    ;
    return this;
  };
  Lexer.prototype.literalToken = function() {
    var match, value;
    if (match = OPERATOR.exec(this._chunk)) {
      value = match[0];
      if (CODE.test(value))
        this.tagParameters();
    } else {
      value = this._chunk.charAt(0);
    }
    ;
    var end1 = this._ends[this._ends.length - 1];
    var end2 = this._ends[this._ends.length - 2];
    var inTag = end1 == "TAG_END" || end1 == "OUTDENT" && end2 == "TAG_END";
    var tokid = value;
    var prev = last(this._tokens);
    var pt = prev && tT(prev);
    var pv = prev && tV(prev);
    var length = value.length;
    if (value == "=" && prev) {
      if (pv == "||" || pv == "&&") {
        tTs(prev, "COMPOUND_ASSIGN");
        tVs(prev, pv + "=");
        prev._len = this._loc - prev._loc + value.length;
        return value.length;
      }
      ;
    }
    ;
    if (value == "\u0192") {
      tokid = "DO";
    }
    ;
    if (value == "|") {
      if (pv == "(") {
        this.token("DO", "DO", 0);
        this.pushEnd("|");
        this.token("BLOCK_PARAM_START", value, 1);
        return length;
      } else if (pt == "DO") {
        this.pushEnd("|");
        this.token("BLOCK_PARAM_START", value, 1);
        return length;
      } else if (end1 == "|") {
        this.token("BLOCK_PARAM_END", value, 1);
        this.pair("|");
        return length;
      }
      ;
    }
    ;
    if (value === ";") {
      this._seenFor = false;
      tokid = "TERMINATOR";
    }
    ;
    if (value == "(" && pt == "T.") {
      tokid = "STYLE_START";
    } else if (value == "[" && inTag) {
      tokid = "STYLE_START";
    } else if (value === "(" && inTag && pt != "=" && prev.spaced) {
      this.token(",", ",");
    } else if (value === "->" && inTag) {
      tokid = "TAG_END";
      this.pair("TAG_END");
    } else if (value === "=>" && inTag) {
      tokid = "TAG_END";
      this.pair("TAG_END");
    } else if (value === "/>" && inTag) {
      tokid = "TAG_END";
      this.pair("TAG_END");
    } else if (value === ">" && inTag) {
      tokid = "TAG_END";
      this.pair("TAG_END");
    } else if (value === "TERMINATOR" && end1 === "DEF") {
      this.closeDef();
    } else if (value === "&" && this.context() == "DEF") {
      tokid = "BLOCK_ARG";
    } else if (value == "---") {
      tokid = "SEPARATOR";
    } else if (value == "-" && pt == "TERMINATOR" && this._chunk.match(/^\-\s*\n/)) {
      tokid = "SEPARATOR";
    } else if (value == "*" && this._chunk.charAt(1).match(/[A-Za-z\_\@\[]/) && (prev.spaced || [",", "(", "[", "{", "|", "\n", "	"].indexOf(pv) >= 0)) {
      tokid = "SPLAT";
    } else if (value == "*" && (this.context() == "IMPORT" || this.context() == "EXPORT")) {
      tokid = "" + this.context() + "_ALL";
    } else if (value == "," && this.context() == "IMPORT") {
      tokid = "IMPORT_COMMA";
    } else if (value == "!" && prev && !prev.spaced && (["]", ")"].indexOf(pv) >= 0 || (pt == "IDENTIFIER" || pt == "SYMBOLID" || pt == "SUPER"))) {
      tokid = "BANG";
    } else if (value == "&" && this._chunk.match(/^\&\s*[,\)\}\]]/)) {
      tokid = "DO_PLACEHOLDER";
    } else if (value == "**") {
      tokid = "EXP";
    } else if (value == "%" && (pt == "NUMBER" || pt == ")") && !prev.spaced) {
      tokid = "UNIT";
    } else if (idx$(value, MATH) >= 0) {
      tokid = "MATH";
    } else if (idx$(value, COMPARE) >= 0) {
      tokid = "COMPARE";
    } else if (idx$(value, COMPOUND_ASSIGN) >= 0) {
      tokid = "COMPOUND_ASSIGN";
    } else if (idx$(value, UNARY) >= 0) {
      tokid = "UNARY";
    } else if (idx$(value, SHIFT) >= 0) {
      tokid = "SHIFT";
    } else if (idx$(value, LOGIC) >= 0) {
      tokid = "LOGIC";
    } else if (prev && !prev.spaced) {
      if (value == "{" && pt == "IDENTIFIER") {
        tokid = "{{";
      }
      ;
      if (value === "(" && idx$(pt, CALLABLE) >= 0) {
        tokid = "CALL_START";
      } else if (value === "(" && pt == "DO") {
        tokid = "BLOCK_PARAM_START";
      } else if (value === "[" && idx$(pt, INDEXABLE) >= 0) {
        tokid = "INDEX_START";
        if (pt == "?") {
          tTs(prev, "INDEX_SOAK");
        }
        ;
      }
      ;
    }
    ;
    let opener = null;
    switch (value) {
      case "(":
      case "{":
      case "[": {
        this.pushEnd(INVERSES[value], {closeType: INVERSES[tokid], i: this._tokens.length});
        break;
      }
      case ")":
      case "}":
      case "]": {
        let paired = this.pair(value);
        if (paired && paired[1].closeType) {
          tokid = paired[1].closeType;
          let other = this._tokens[paired[1].i];
          opener = this._tokens[paired[1].i];
        }
        ;
        break;
      }
    }
    ;
    if (value == "\\") {
      tokid = "TYPE";
      let annotation = this.findTypeAnnotation(this._chunk.slice(1));
      if (annotation) {
        value = value + annotation;
      }
      ;
    }
    ;
    if (value == ".." && !prev.spaced) {
      tokid = "?.";
      value = "?.";
    }
    ;
    if (value == ":" && end1 == "TAG_RULE") {
      tokid = "T:";
    }
    ;
    if (tokid == "-" || tokid == "+") {
      if (/\w|\(|\$/.test(this._chunk[1]) && (!prev || prev.spaced)) {
        tokid = tokid + tokid + tokid;
      }
      ;
    }
    ;
    this.token(tokid, value, value.length);
    if (opener) {
      opener._closer = this._last;
    }
    ;
    if (this._platform == "tsc") {
      let next = this._chunk[1] || "";
      if (value == "." && (next == " " || next == "\n" || !next)) {
        this.token("IDENTIFIER", "$CARET$", 0, 1);
      } else if (value == "@" && (!next || /[^\$\@\-\.\w]/.test(next))) {
        this.token("IDENTIFIER", "$CARET$", 0, 1);
      }
      ;
    }
    ;
    return value.length;
  };
  Lexer.prototype.sanitizeHeredoc = function(doc, options) {
    var match;
    var indent = options.indent;
    var herecomment = options.herecomment;
    if (herecomment) {
      if (HEREDOC_ILLEGAL.test(doc)) {
        this.error("block comment cannot contain '*/' starting");
      }
      ;
      if (doc.indexOf("\n") <= 0) {
        return doc;
      }
      ;
    } else {
      var length_;
      while (match = HEREDOC_INDENT.exec(doc)) {
        var attempt = match[1];
        if (indent === null || 0 < (length_ = attempt.length) && length_ < indent.length) {
          indent = attempt;
        }
        ;
      }
      ;
    }
    ;
    if (indent) {
      doc = doc.replace(RegExp("\\n" + indent, "g"), "\n");
    }
    ;
    if (!herecomment) {
      if (doc[0] == "\n") {
        options.offset = indent.length + 1;
      }
      ;
      doc = doc.replace(/^\n/, "");
    }
    ;
    options.realIndent = indent;
    return doc;
  };
  Lexer.prototype.tagParameters = function() {
    var tok;
    if (this.lastTokenType() != ")") {
      return this;
    }
    ;
    var stack = [];
    var tokens = this._tokens;
    var i = tokens.length;
    tTs(tokens[--i], "PARAM_END");
    while (tok = tokens[--i]) {
      var t = tT(tok);
      switch (t) {
        case ")": {
          stack.push(tok);
          break;
        }
        case "(":
        case "CALL_START": {
          if (stack.length) {
            stack.pop();
          } else if (t === "(") {
            tTs(tok, "PARAM_START");
            return this;
          } else {
            return this;
          }
          ;
          break;
        }
      }
      ;
    }
    ;
    return this;
  };
  Lexer.prototype.closeIndentation = function() {
    if (this.context() == "IMPORT" || this.context() == "EXPORT") {
      this.pair(this.context());
    }
    ;
    this.closeDef();
    this.closeSelector();
    return this.outdentToken(this._indent, false, 0);
  };
  Lexer.prototype.balancedString = function(str, end) {
    var match, letter, prev;
    var stack = [end];
    var i = 0;
    while (i < str.length - 1) {
      i++;
      letter = str.charAt(i);
      switch (letter) {
        case "\\": {
          i++;
          continue;
          break;
        }
        case end: {
          stack.pop();
          if (!stack.length) {
            var v = str.slice(0, i + 1);
            return v;
          }
          ;
          end = stack[stack.length - 1];
          continue;
          break;
        }
      }
      ;
      if (end === "}" && (letter == '"' || letter == "'")) {
        stack.push(end = letter);
      } else if (end === "}" && letter === "/" && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
        i += match[0].length - 1;
      } else if (end === "}" && letter === "{") {
        stack.push(end = "}");
      } else if (end === '"' && letter === "{") {
        stack.push(end = "}");
      }
      ;
      prev = letter;
    }
    ;
    return this.error("missing " + stack.pop() + ", starting");
  };
  Lexer.prototype.interpolateString = function(str, options) {
    if (options === void 0)
      options = {};
    var heredoc = options.heredoc;
    var quote = options.quote;
    var regex = options.regex;
    var prefix = options.prefix;
    var indent = options.indent;
    var startLoc = this._loc;
    var tokens = [];
    var pi = 0;
    var i = -1;
    var locOffset = options.offset || 1;
    var strlen = str.length;
    var letter;
    var expr;
    var isInterpolated = false;
    while (letter = str[i += 1]) {
      if (letter === "\\") {
        i += 1;
        continue;
      }
      ;
      if (letter === "\n" && indent) {
        locOffset += indent.length;
      }
      ;
      if (!(str[i] == "{" && (expr = this.balancedString(str.slice(i), "}")))) {
        continue;
      }
      ;
      isInterpolated = true;
      if (pi < i) {
        var tok = new Token2("NEOSTRING", this.escapeStr(str.slice(pi, i), heredoc, quote), this._loc + pi + locOffset, i - pi);
        tokens.push(tok);
      }
      ;
      tokens.push(new Token2("{{", "{", this._loc + i + locOffset, 1));
      var inner = expr.slice(1, -1);
      inner = inner.replace(/^[^\n\S]+/, "");
      if (inner.length) {
        var spaces = 0;
        var offset = this._loc + i + (expr.length - inner.length) - 1;
        var nested = new Lexer().tokenize(inner, {inline: true, rewrite: false, loc: offset + locOffset}, this._script);
        if (nested[0] && tT(nested[0]) == "TERMINATOR") {
          nested.shift();
        }
        ;
        if (nested.length) {
          tokens.push.apply(tokens, nested);
        }
        ;
      }
      ;
      i += expr.length - 1;
      tokens.push(new Token2("}}", "}", this._loc + i + locOffset, 1));
      pi = i + 1;
    }
    ;
    if (i >= pi && pi < str.length) {
      tokens.push(new Token2("NEOSTRING", this.escapeStr(str.slice(pi), heredoc, quote), this._loc + pi + locOffset, str.length - pi));
    }
    ;
    if (regex) {
      return tokens;
    }
    ;
    if (!tokens.length) {
      return this.token("NEOSTRING", '""');
    }
    ;
    for (let j = 0, len = tokens.length; j < len; j++) {
      this._tokens.push(tokens[j]);
    }
    ;
    return tokens;
  };
  Lexer.prototype.balancedSelector = function(str, end) {
    var prev;
    var letter;
    var stack = [end];
    for (let len = str.length, i = 1, rd = len - i; rd > 0 ? i < len : i > len; rd > 0 ? i++ : i--) {
      switch (letter = str.charAt(i)) {
        case "\\": {
          i++;
          continue;
          break;
        }
        case end: {
          stack.pop();
          if (!stack.length) {
            return str.slice(0, i + 1);
          }
          ;
          end = stack[stack.length - 1];
          continue;
          break;
        }
      }
      ;
      if (end === "}" && letter === ")") {
        stack.push(end = letter);
      } else if (end === "}" && letter === "{") {
        stack.push(end = "}");
      } else if (end === ")" && letter === "{") {
        stack.push(end = "}");
      }
      ;
      prev = letter;
    }
    ;
    return this.error("missing " + stack.pop() + ", starting");
  };
  Lexer.prototype.pair = function(tok) {
    var wanted = last(this._ends);
    if (tok != wanted) {
      if (!(wanted === "OUTDENT")) {
        this.error("unmatched " + tok, {length: tok.length});
      }
      ;
      var size = last(this._indents);
      this._indent -= size;
      this.outdentToken(size, true, 0);
      return this.pair(tok);
    }
    ;
    return this.popEnd();
  };
  Lexer.prototype.token = function(id, value, len, offset) {
    this._lastTyp = id;
    this._lastVal = value;
    var tok = this._last = new Token2(id, value, this._loc + (offset || 0), len || 0);
    this._tokens.push(tok);
    return;
  };
  Lexer.prototype.lastTokenType = function() {
    var token3 = this._tokens[this._tokens.length - 1];
    return token3 ? tT(token3) : "NONE";
  };
  Lexer.prototype.lastTokenValue = function() {
    var token3 = this._tokens[this._tokens.length - 1];
    return token3 ? token3._value : "";
  };
  Lexer.prototype.tokid = function(index, val) {
    var tok;
    if (tok = last(this._tokens, index)) {
      if (val) {
        tTs(tok, val);
      }
      ;
      return tT(tok);
    } else {
      return null;
    }
    ;
  };
  Lexer.prototype.value = function(index, val) {
    var tok;
    if (tok = last(this._tokens, index)) {
      if (val) {
        tVs(tok, val);
      }
      ;
      return tV(tok);
    } else {
      return null;
    }
    ;
  };
  Lexer.prototype.unfinished = function() {
    if (LINE_CONTINUER.test(this._chunk) && (!this._context || !this._context.style)) {
      return true;
    }
    ;
    return UNFINISHED.indexOf(this._lastTyp) >= 0 && this._platform != "tsc";
  };
  Lexer.prototype.escapeLines = function(str, heredoc) {
    return str.replace(MULTILINER, heredoc ? "\\n" : "");
  };
  Lexer.prototype.makeString = function(body, quote, heredoc) {
    if (!body) {
      return quote + quote;
    }
    ;
    body = body.replace(/\\([\s\S])/g, function(match, contents) {
      return contents == "\n" || contents == quote ? contents : match;
    });
    body = body.replace(RegExp("" + quote, "g"), "\\$&");
    return quote + this.escapeLines(body, heredoc) + quote;
  };
  Lexer.prototype.error = function(message, params) {
    if (params === void 0)
      params = {};
    let loc = params.offset || this._loc;
    let err = this._script.addDiagnostic("error", {
      message,
      source: params.source || "imba-lexer",
      range: params.range || this._script.rangeAt(loc, loc + (params.length || len$(this)))
    });
    throw err.toError();
  };
});

// src/compiler/rewriter.imba1
var require_rewriter = __commonJS((exports2) => {
  function idx$(a, b) {
    return b && b.indexOf ? b.indexOf(a) : [].indexOf.call(a, b);
  }
  function iter$7(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  var T2 = require_token();
  var Token2 = T2.Token;
  var constants$ = require_constants();
  var INVERSES = constants$.INVERSES;
  var BALANCED_PAIRS = constants$.BALANCED_PAIRS;
  var TOK = constants$.TOK;
  var TERMINATOR = "TERMINATOR";
  var INDENT = "INDENT";
  var OUTDENT = "OUTDENT";
  var THEN = "THEN";
  var CATCH = "CATCH";
  var EOF = {_type: "EOF", _value: ""};
  var arrayToHash2 = function(ary) {
    var hash = {};
    for (let i = 0, items = iter$7(ary), len = items.length; i < len; i++) {
      hash[items[i]] = 1;
    }
    ;
    return hash;
  };
  var EXPRESSION_CLOSE = [")", "]", "}", "STYLE_END", "OUTDENT", "CALL_END", "PARAM_END", "INDEX_END", "BLOCK_PARAM_END", "STRING_END", "}}", "TAG_END", "CATCH", "WHEN", "ELSE", "FINALLY"];
  var EXPRESSION_CLOSE_HASH = arrayToHash2(EXPRESSION_CLOSE);
  var EXPRESSION_START = {
    "(": 1,
    "[": 1,
    "{": 1,
    "{{": 1,
    INDENT: 1,
    CALL_START: 1,
    PARAM_START: 1,
    INDEX_START: 1,
    BLOCK_PARAM_START: 1,
    STRING_START: 1,
    TAG_START: 1
  };
  var EXPRESSION_END = {
    ")": 1,
    "]": 1,
    "}": 1,
    "}}": 1,
    OUTDENT: 1,
    CALL_END: 1,
    PARAM_END: 1,
    INDEX_END: 1,
    BLOCK_PARAM_END: 1,
    STRING_END: 1,
    TAG_END: 1
  };
  var NO_IMPLICIT_PARENS = ["STYLE_START"];
  var NO_IMPLICIT_BRACES = ["STYLE_START"];
  var SINGLE_LINERS = {
    ELSE: 1,
    TRY: 1,
    FINALLY: 1,
    THEN: 1,
    BLOCK_PARAM_END: 1,
    DO: 1,
    BEGIN: 1,
    CATCH_VAR: 1
  };
  var SINGLE_CLOSERS_MAP = {
    TERMINATOR: true,
    CATCH: true,
    FINALLY: true,
    ELSE: true,
    OUTDENT: true,
    LEADING_WHEN: true
  };
  var IMPLICIT_FUNC_MAP = {
    IDENTIFIER: 1,
    SYMBOLID: 1,
    SUPER: 1,
    THIS: 1,
    SELF: 1,
    TAG_END: 1,
    IVAR: 1,
    CVAR: 1,
    ARGVAR: 1,
    BREAK: 1,
    CONTINUE: 1,
    RETURN: 1,
    INDEX_END: 1,
    "]": 1,
    BANG: 1
  };
  var IMPLICIT_CALL_MAP = {
    SELECTOR: 1,
    IDENTIFIER: 1,
    SYMBOLID: 1,
    NUMBER: 1,
    STRING: 1,
    SYMBOL: 1,
    JS: 1,
    REGEX: 1,
    NEW: 1,
    CLASS: 1,
    IF: 1,
    UNLESS: 1,
    TRY: 1,
    SWITCH: 1,
    THIS: 1,
    BOOL: 1,
    TRUE: 1,
    FALSE: 1,
    NULL: 1,
    UNDEFINED: 1,
    UNARY: 1,
    SUPER: 1,
    IVAR: 1,
    ARGVAR: 1,
    SELF: 1,
    "[": 1,
    "(": 1,
    "{": 1,
    "--": 1,
    "++": 1,
    "---": 1,
    "+++": 1,
    "#": 1,
    TAG_START: 1,
    PARAM_START: 1,
    SELECTOR_START: 1,
    STRING_START: 1,
    IDREF: 1,
    SPLAT: 1,
    DO: 1,
    BLOCK_ARG: 1,
    FOR: 1,
    CONTINUE: 1,
    BREAK: 1,
    LET: 1,
    VAR: 1,
    CONST: 1
  };
  var IMPLICIT_UNSPACED_CALL = ["+", "-"];
  var IMPLICIT_BLOCK = ["{", "[", ",", "BLOCK_PARAM_END", "DO"];
  var IMPLICIT_BLOCK_MAP = arrayToHash2(IMPLICIT_BLOCK);
  var NO_CALL_TAG = ["CLASS", "IF", "UNLESS", "TAG", "WHILE", "FOR", "UNTIL", "CATCH", "FINALLY", "MODULE", "LEADING_WHEN", "STRUCT"];
  var NO_CALL_TAG_MAP = arrayToHash2(NO_CALL_TAG);
  var IMPLICIT_END_MAP = {
    POST_IF: true,
    POST_UNLESS: true,
    POST_FOR: true,
    WHILE: true,
    UNTIL: true,
    WHEN: true,
    BY: true,
    LOOP: true,
    TERMINATOR: true,
    DEF_BODY: true
  };
  var CALLCOUNT = 0;
  function Rewriter2() {
    this._tokens = [];
    this._options = {};
    this._len = 0;
    this._starter = null;
    this;
  }
  exports2.Rewriter = Rewriter2;
  Rewriter2.prototype.reset = function() {
    this._starter = null;
    this._len = 0;
    return this;
  };
  Rewriter2.prototype.tokens = function() {
    return this._tokens;
  };
  Rewriter2.prototype.rewrite = function(tokens, opts) {
    if (opts === void 0)
      opts = {};
    this.reset();
    this._tokens = tokens;
    this._options = opts;
    this._platform = opts.platform || opts.target;
    var i = 0;
    var k = tokens.length;
    while (i < k - 1) {
      var token3 = tokens[i];
      if (token3._type == "DEF_BODY") {
        var next = tokens[i + 1];
        if (next && next._type == TERMINATOR) {
          token3._type = "DEF_EMPTY";
        }
        ;
      }
      ;
      i++;
    }
    ;
    this.step("all");
    if (CALLCOUNT) {
      console.log(CALLCOUNT);
    }
    ;
    return this._tokens;
  };
  Rewriter2.prototype.all = function() {
    this.step("ensureFirstLine");
    this.step("removeLeadingNewlines");
    if (this._platform == "tsc") {
      this.step("addPlaceholderIdentifiers");
    }
    ;
    this.step("removeMidExpressionNewlines");
    this.step("tagDefArguments");
    this.step("closeOpenTags");
    this.step("addImplicitIndentation");
    this.step("tagPostfixConditionals");
    this.step("addImplicitBraces");
    return this.step("addImplicitParentheses");
  };
  Rewriter2.prototype.step = function(fn) {
    this[fn]();
    return;
  };
  Rewriter2.prototype.scanTokens = function(block) {
    var tokens = this._tokens;
    var i = 0;
    while (i < tokens.length) {
      i += block.call(this, tokens[i], i, tokens);
    }
    ;
    return true;
  };
  Rewriter2.prototype.detectEnd = function(i, condition, action, state) {
    if (state === void 0)
      state = {};
    var tokens = this._tokens;
    var levels = 0;
    var token3;
    var t, v;
    while (i < tokens.length) {
      token3 = tokens[i];
      if (levels == 0 && condition.call(this, token3, i, tokens, state)) {
        return action.call(this, token3, i, tokens, state);
      }
      ;
      if (!token3 || levels < 0) {
        return action.call(this, token3, i - 1, tokens, state);
      }
      ;
      t = token3._type;
      if (EXPRESSION_START[t]) {
        levels += 1;
      } else if (EXPRESSION_END[t]) {
        levels -= 1;
      }
      ;
      i += 1;
    }
    ;
    return i - 1;
  };
  Rewriter2.prototype.ensureFirstLine = function() {
    var token3 = this._tokens[0];
    if (!token3 || token3._type === TERMINATOR) {
      this._tokens.unshift(T2.token("BODYSTART", "BODYSTART"));
    }
    ;
    return;
  };
  Rewriter2.prototype.addPlaceholderIdentifiers = function() {
    let nextTest = /^([\,\]\)\}]|\}\})$/;
    return this.scanTokens(function(token3, i, tokens) {
      var prev = tokens[i - 1] || EOF;
      var next = tokens[i + 1] || EOF;
      if (prev._type == "=" || prev._type == ":") {
        if (token3._type === TERMINATOR && next._type != "INDENT" || token3._type == "," || token3._type == "DEF_BODY") {
          tokens.splice(i, 0, new Token2("IDENTIFIER", "$CARET$", token3._loc, 0));
          return 2;
        }
        ;
      } else if (prev._type == ".") {
        if (token3._type === TERMINATOR && next._type != "INDENT" || nextTest.test(token3._value)) {
          tokens.splice(i, 0, new Token2("IDENTIFIER", "$CARET$", token3._loc, 0));
          return 2;
        }
        ;
      }
      ;
      return 1;
    });
  };
  Rewriter2.prototype.removeLeadingNewlines = function() {
    var at = 0;
    var i = 0;
    var tokens = this._tokens;
    var token3;
    var l = tokens.length;
    while (i < l) {
      token3 = tokens[i];
      if (token3._type !== TERMINATOR) {
        at = i;
        break;
      }
      ;
      i++;
    }
    ;
    if (at) {
      tokens.splice(0, at);
    }
    ;
    return;
  };
  Rewriter2.prototype.removeMidExpressionNewlines = function() {
    return this.scanTokens(function(token3, i, tokens) {
      var next = tokens.length > i + 1 ? tokens[i + 1] : null;
      if (!(token3._type === TERMINATOR && next && EXPRESSION_CLOSE_HASH[next._type])) {
        return 1;
      }
      ;
      if (next && next._type == OUTDENT) {
        return 1;
      }
      ;
      tokens.splice(i, 1);
      return 0;
    });
  };
  Rewriter2.prototype.tagDefArguments = function() {
    return true;
  };
  Rewriter2.prototype.closeOpenTags = function() {
    var self2 = this;
    var condition = function(token3, i) {
      return token3._type == ">" || token3._type == "TAG_END";
    };
    var action = function(token3, i) {
      return token3._type = "TAG_END";
    };
    return self2.scanTokens(function(token3, i, tokens) {
      if (token3._type === "TAG_START") {
        self2.detectEnd(i + 1, condition, action);
      }
      ;
      return 1;
    });
  };
  Rewriter2.prototype.addImplicitBlockCalls = function() {
    var i = 1;
    var tokens = this._tokens;
    while (i < tokens.length) {
      var token3 = tokens[i];
      var t = token3._type;
      var v = token3._value;
      if (t == "DO" && (v == "INDEX_END" || v == "IDENTIFIER" || v == "NEW")) {
        tokens.splice(i + 1, 0, T2.token("CALL_END", ")"));
        tokens.splice(i + 1, 0, T2.token("CALL_START", "("));
        i++;
      }
      ;
      i++;
    }
    ;
    return;
  };
  Rewriter2.prototype.addLeftBrace = function() {
    return this;
  };
  Rewriter2.prototype.addImplicitBraces = function() {
    var self2 = this;
    var stack = [];
    var prevStack = null;
    var start = null;
    var startIndent = 0;
    var startIdx = null;
    var baseCtx = ["ROOT", 0];
    var defType = "DEF";
    var noBraceContext = ["IF", "TERNARY", "FOR", defType];
    var noBrace = false;
    var action = function(token3, i) {
      return self2._tokens.splice(i, 0, T2.RBRACKET);
    };
    var open = function(token3, i, scope2) {
      let tok = new Token2("{", "{", 0, 0, 0);
      tok.generated = true;
      tok.scope = scope2;
      return self2._tokens.splice(i, 0, tok);
    };
    var close = function(token3, i, scope2) {
      let tok = new Token2("}", "}", 0, 0, 0);
      tok.generated = true;
      tok.scope = scope2;
      return self2._tokens.splice(i, 0, tok);
    };
    var stackToken = function(a, b) {
      return [a, b];
    };
    var indents = [];
    var balancedStack = [];
    return self2.scanTokens(function(token3, i, tokens) {
      var type = token3._type;
      var v = token3._value;
      if (type == "CSS_SEL" && token3._closer) {
        let idx2 = tokens.indexOf(token3._closer);
        return idx2 - i + 1;
      }
      ;
      if (type == "STYLE_START" && token3._closer) {
        return tokens.indexOf(token3._closer) - i;
      }
      ;
      if (BALANCED_PAIRS[type]) {
        balancedStack.unshift(type);
      } else if (INVERSES[type] && INVERSES[type] == balancedStack[0]) {
        balancedStack.shift();
      }
      ;
      if (NO_IMPLICIT_BRACES.indexOf(balancedStack[0]) >= 0) {
        return 1;
      }
      ;
      var ctx = stack.length ? stack[stack.length - 1] : baseCtx;
      var idx;
      if (type == "INDENT") {
        indents.unshift(token3.scope);
      } else if (type == "OUTDENT") {
        indents.shift();
      }
      ;
      if (noBraceContext.indexOf(type) >= 0 && type != defType) {
        stack.push(stackToken(type, i));
        return 1;
      }
      ;
      if (v == "?") {
        stack.push(stackToken("TERNARY", i));
        return 1;
      }
      ;
      if (EXPRESSION_START[type]) {
        if (type === INDENT && noBraceContext.indexOf(ctx[0]) >= 0) {
          stack.pop();
        }
        ;
        let tt = self2.tokenType(i - 1);
        if (type === INDENT && (tt == "{" || tt == "STYLE_START")) {
          stack.push(stackToken("{", i));
        } else {
          stack.push(stackToken(type, i));
        }
        ;
        return 1;
      }
      ;
      if (EXPRESSION_END[type]) {
        if (ctx[0] == "TERNARY") {
          stack.pop();
        }
        ;
        start = stack.pop();
        start[2] = i;
        if (start[0] == "{" && start.generated) {
          close(token3, i);
          return 1;
        }
        ;
        return 1;
      }
      ;
      if (ctx[0] == "TERNARY" && (type === TERMINATOR || type === OUTDENT)) {
        stack.pop();
        return 1;
      }
      ;
      if (noBraceContext.indexOf(ctx[0]) >= 0 && type === INDENT) {
        stack.pop();
        return 1;
      }
      ;
      if (type == ",") {
        if (ctx[0] == "{" && ctx.generated) {
          close(token3, i, stack.pop());
          return 2;
        } else {
          return 1;
        }
        ;
        true;
      }
      ;
      let isDefInObject = type == defType && idx$(indents[0], ["CLASS", "DEF", "MODULE", "TAG", "STRUCT"]) == -1;
      if ((type == ":" || isDefInObject) && ctx[0] != "{" && ctx[0] != "TERNARY" && (noBraceContext.indexOf(ctx[0]) == -1 || ctx[0] == defType)) {
        var tprev = tokens[i - 2];
        let autoClose = false;
        if (type == defType) {
          idx = i - 1;
          tprev = tokens[idx];
        } else if (start && start[2] == i - 1) {
          idx = start[1] - 1;
        } else {
          idx = i - 2;
        }
        ;
        while (self2.tokenType(idx - 1) === "HERECOMMENT") {
          idx -= 2;
        }
        ;
        var t0 = tokens[idx - 1];
        var t1 = tokens[idx];
        if (!tprev || idx$(tprev._type, ["INDENT", "TERMINATOR"]) == -1) {
          autoClose = true;
        }
        ;
        if (indents[0] && idx$(indents[0], ["CLASS", "DEF", "MODULE", "TAG", "STRUCT"]) >= 0) {
          autoClose = true;
        }
        ;
        if (t0 && T2.typ(t0) == "}" && t0.generated && (t1._type == "," && !t1.generated || !(t0.scope && t0.scope.autoClose))) {
          tokens.splice(idx - 1, 1);
          var s = stackToken("{", i - 1);
          s.generated = true;
          stack.push(s);
          if (type == defType) {
            stack.push(stackToken(defType, i));
            return 1;
          }
          ;
          return 0;
        } else if (t0 && T2.typ(t0) == "," && self2.tokenType(idx - 2) == "}") {
          tokens.splice(idx - 2, 1);
          s = stackToken("{");
          s.generated = true;
          stack.push(s);
          if (type == defType) {
            stack.push(stackToken(defType, i));
            return 1;
          }
          ;
          return 0;
        } else {
          if (type == defType && (!t0 || t0._type != "=")) {
            stack.push(stackToken(defType, i));
            return 1;
          }
          ;
          s = stackToken("{");
          s.generated = true;
          s.autoClose = autoClose;
          stack.push(s);
          open(token3, idx + 1);
          if (type == defType) {
            stack.push(stackToken(defType, i));
            return 3;
          }
          ;
          return 2;
        }
        ;
      }
      ;
      if (type == "DO") {
        var prev = T2.typ(tokens[i - 1]);
        if (["NUMBER", "STRING", "REGEX", "SYMBOL", "]", "}", ")", "STRING_END"].indexOf(prev) >= 0) {
          var tok = T2.token(",", ",");
          tok.generated = true;
          tokens.splice(i, 0, tok);
          if (ctx.generated) {
            close(token3, i);
            stack.pop();
            return 2;
          }
          ;
        }
        ;
      }
      ;
      if (ctx.generated && (type === TERMINATOR || type === OUTDENT || type === "DEF_BODY")) {
        prevStack = stack.pop();
        close(token3, i, prevStack);
        return 2;
      }
      ;
      return 1;
    });
  };
  Rewriter2.prototype.addImplicitParentheses = function() {
    var self2 = this;
    var tokens = self2._tokens;
    var noCall = false;
    var seenFor = false;
    var endCallAtTerminator = false;
    var seenSingle = false;
    var seenControl = false;
    var callObject = false;
    var callIndent = false;
    var parensAction = function(token4, i2, tokens2) {
      return tokens2.splice(i2, 0, T2.token("CALL_END", ")"));
    };
    var parensCond = function(token4, i2, tokens2) {
      var type2 = token4._type;
      if (!seenSingle && token4.fromThen) {
        return true;
      }
      ;
      var ifelse = type2 == "IF" || type2 == "UNLESS" || type2 == "ELSE";
      if (ifelse || type2 === "CATCH") {
        seenSingle = true;
      }
      ;
      if (ifelse || type2 === "SWITCH" || type2 == "TRY") {
        seenControl = true;
      }
      ;
      var prev2 = self2.tokenType(i2 - 1);
      if ((type2 == "." || type2 == "?." || type2 == "::") && prev2 === OUTDENT) {
        return true;
      }
      ;
      if (endCallAtTerminator && (type2 === INDENT || type2 === TERMINATOR)) {
        return true;
      }
      ;
      if ((type2 == "WHEN" || type2 == "BY") && !seenFor) {
        return false;
      }
      ;
      var post = tokens2.length > i2 + 1 ? tokens2[i2 + 1] : null;
      var postTyp = post && post._type;
      if (token4.generated || prev2 === ",") {
        return false;
      }
      ;
      var cond1 = IMPLICIT_END_MAP[type2] || type2 == INDENT && !seenControl || type2 == "DOS" && prev2 != "=";
      if (!cond1) {
        return false;
      }
      ;
      if (type2 !== INDENT) {
        return true;
      }
      ;
      if (!IMPLICIT_BLOCK_MAP[prev2] && self2.tokenType(i2 - 2) != "CLASS" && !(post && (post.generated && postTyp == "{" || IMPLICIT_CALL_MAP[postTyp]))) {
        return true;
      }
      ;
      return false;
    };
    var i = 0;
    let stack = [];
    let currPair = null;
    while (tokens.length > i + 1) {
      var token3 = tokens[i];
      var type = token3._type;
      if ((type == "STYLE_START" || type == "CSS_SEL") && token3._closer) {
        i = tokens.indexOf(token3._closer) + 1;
        continue;
      }
      ;
      if (BALANCED_PAIRS[type]) {
        stack.push(currPair = type);
      } else if (INVERSES[type] && INVERSES[type] == currPair) {
        stack.pop();
        currPair = stack[stack.length - 1];
      }
      ;
      if (NO_IMPLICIT_PARENS.indexOf(currPair) >= 0) {
        i++;
        continue;
      }
      ;
      var prev = i > 0 ? tokens[i - 1] : null;
      var next = tokens[i + 1];
      var pt = prev && prev._type;
      var nt = next && next._type;
      if (type === INDENT && (pt == ")" || pt == "]")) {
        noCall = true;
      }
      ;
      if (NO_CALL_TAG_MAP[pt]) {
        endCallAtTerminator = true;
        noCall = true;
        if (pt == "FOR") {
          seenFor = true;
        }
        ;
      }
      ;
      callObject = false;
      callIndent = false;
      if (!noCall && type == INDENT && next) {
        var prevImpFunc = pt && IMPLICIT_FUNC_MAP[pt];
        var nextImpCall = nt && IMPLICIT_CALL_MAP[nt];
        callObject = (next.generated && nt == "{" || nextImpCall) && prevImpFunc;
        callIndent = nextImpCall && prevImpFunc;
      }
      ;
      seenSingle = false;
      seenControl = false;
      if (type == TERMINATOR || type == OUTDENT || type == INDENT) {
        endCallAtTerminator = false;
        noCall = false;
      }
      ;
      if (type == "?" && prev && !prev.spaced) {
        token3.call = true;
      }
      ;
      if (token3.fromThen) {
        i += 1;
        continue;
      }
      ;
      if (!(callObject || callIndent || prev && prev.spaced && (prev.call || IMPLICIT_FUNC_MAP[pt]) && (IMPLICIT_CALL_MAP[type] || !(token3.spaced || token3.newLine) && IMPLICIT_UNSPACED_CALL.indexOf(type) >= 0))) {
        i += 1;
        continue;
      }
      ;
      tokens.splice(i, 0, T2.token("CALL_START", "("));
      self2.detectEnd(i + 1, parensCond, parensAction);
      if (prev._type == "?") {
        prev._type = "FUNC_EXIST";
      }
      ;
      i += 2;
      endCallAtTerminator = false;
      noCall = false;
      seenFor = false;
    }
    ;
    return;
  };
  Rewriter2.prototype.indentCondition = function(token3, i, tokens) {
    var t = token3._type;
    return SINGLE_CLOSERS_MAP[t] && token3._value !== ";" && !(t == "ELSE" && this._starter != "IF" && this._starter != "THEN");
  };
  Rewriter2.prototype.indentAction = function(token3, i, tokens) {
    var idx = this.tokenType(i - 1) === "," ? i - 1 : i;
    tokens.splice(idx, 0, T2.OUTDENT);
    return;
  };
  Rewriter2.prototype.addImplicitIndentation = function() {
    var lookup1 = {
      OUTDENT: 1,
      TERMINATOR: 1,
      FINALLY: 1
    };
    var i = 0;
    var tokens = this._tokens;
    var starter;
    while (i < tokens.length) {
      var token3 = tokens[i];
      var type = token3._type;
      var next = this.tokenType(i + 1);
      if (type === TERMINATOR && next === THEN) {
        tokens.splice(i, 1);
        continue;
      }
      ;
      if (type === CATCH && lookup1[this.tokenType(i + 2)]) {
        tokens.splice(i + 2, 0, T2.token(INDENT, "2"), T2.token(OUTDENT, "2"));
        i += 4;
        continue;
      }
      ;
      if (SINGLE_LINERS[type] && (next != INDENT && next != "BLOCK_PARAM_START") && !(type == "ELSE" && next == "IF") && type != "ELIF") {
        this._starter = starter = type;
        var indent = T2.token(INDENT, "2");
        if (starter === THEN) {
          indent.fromThen = true;
        }
        ;
        indent.generated = true;
        tokens.splice(i + 1, 0, indent);
        this.detectEnd(i + 2, this.indentCondition, this.indentAction);
        if (type === THEN) {
          tokens.splice(i, 1);
        }
        ;
      }
      ;
      i++;
    }
    ;
    return;
  };
  Rewriter2.prototype.tagPostfixConditionals = function() {
    var self2 = this;
    var condition = function(token3, i, tokens) {
      return token3._type === TERMINATOR || token3._type === INDENT;
    };
    var action = function(token3, i, tokens, s) {
      if (token3._type != INDENT) {
        if (s.unfinished) {
          return tokens.splice(i, 0, T2.token("EMPTY_BLOCK", ""));
        } else {
          return T2.setTyp(s.original, "POST_" + s.original._type);
        }
        ;
      }
      ;
    };
    return self2.scanTokens(function(token3, i, tokens) {
      var typ = token3._type;
      if (!(typ == "IF" || typ == "FOR")) {
        return 1;
      }
      ;
      let unfinished = tokens[i - 1] && condition(tokens[i - 1]);
      self2.detectEnd(i + 1, condition, action, {original: token3, unfinished});
      return 1;
    });
  };
  Rewriter2.prototype.type = function(i) {
    throw "deprecated";
    var tok = this._tokens[i];
    return tok && tok._type;
  };
  Rewriter2.prototype.injectToken = function(index, token3) {
    return this;
  };
  Rewriter2.prototype.tokenType = function(i) {
    if (i < 0 || i >= this._tokens.length) {
      return null;
    }
    ;
    var tok = this._tokens[i];
    return tok && tok._type;
  };
});

// build/parser.js
var require_parser = __commonJS((exports2) => {
  var parser3 = function() {
    var o = function(k, v, o2, l) {
      for (o2 = o2 || {}, l = k.length; l--; o2[k[l]] = v)
        ;
      return o2;
    }, $V0 = [1, 4], $V1 = [1, 6], $V2 = [1, 7], $V3 = [1, 37], $V4 = [1, 38], $V5 = [1, 39], $V6 = [1, 40], $V7 = [1, 42], $V8 = [1, 120], $V9 = [1, 41], $Va = [1, 122], $Vb = [1, 101], $Vc = [1, 128], $Vd = [1, 129], $Ve = [1, 126], $Vf = [1, 132], $Vg = [1, 96], $Vh = [1, 121], $Vi = [1, 133], $Vj = [1, 89], $Vk = [1, 90], $Vl = [1, 91], $Vm = [1, 92], $Vn = [1, 93], $Vo = [1, 94], $Vp = [1, 95], $Vq = [1, 83], $Vr = [1, 100], $Vs = [1, 79], $Vt = [1, 43], $Vu = [1, 16], $Vv = [1, 17], $Vw = [1, 65], $Vx = [1, 64], $Vy = [1, 99], $Vz = [1, 97], $VA = [1, 77], $VB = [1, 119], $VC = [1, 33], $VD = [1, 34], $VE = [1, 105], $VF = [1, 104], $VG = [1, 103], $VH = [1, 125], $VI = [1, 80], $VJ = [1, 81], $VK = [1, 82], $VL = [1, 106], $VM = [1, 87], $VN = [1, 44], $VO = [1, 50], $VP = [1, 118], $VQ = [1, 98], $VR = [1, 127], $VS = [1, 71], $VT = [1, 84], $VU = [1, 113], $VV = [1, 114], $VW = [1, 115], $VX = [1, 130], $VY = [1, 131], $VZ = [1, 75], $V_ = [1, 112], $V$ = [1, 59], $V01 = [1, 60], $V11 = [1, 61], $V21 = [1, 62], $V31 = [1, 63], $V41 = [1, 66], $V51 = [1, 67], $V61 = [1, 135], $V71 = [1, 6, 14], $V81 = [1, 6, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 280, 281, 285, 286, 287, 291, 293, 294, 302, 306, 309, 310, 311, 319, 320, 321, 322], $V91 = [1, 143], $Va1 = [1, 140], $Vb1 = [1, 141], $Vc1 = [1, 145], $Vd1 = [1, 146], $Ve1 = [1, 149], $Vf1 = [1, 150], $Vg1 = [1, 142], $Vh1 = [1, 144], $Vi1 = [1, 147], $Vj1 = [1, 148], $Vk1 = [1, 153], $Vl1 = [1, 154], $Vm1 = [1, 161], $Vn1 = [1, 162], $Vo1 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $Vp1 = [2, 401], $Vq1 = [1, 170], $Vr1 = [1, 172], $Vs1 = [1, 173], $Vt1 = [1, 166], $Vu1 = [1, 171], $Vv1 = [1, 178], $Vw1 = [1, 6, 13, 14, 26, 27, 33, 56, 81, 83, 91, 92, 120, 159, 160, 161, 162, 163, 164, 165, 167, 168, 169, 172, 173, 174, 175, 176, 201, 202], $Vx1 = [1, 6, 14, 285, 287, 293, 294, 310], $Vy1 = [1, 186], $Vz1 = [1, 188], $VA1 = [1, 204], $VB1 = [1, 203], $VC1 = [1, 6, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $VD1 = [2, 331], $VE1 = [1, 207], $VF1 = [1, 6, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 176, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $VG1 = [2, 327], $VH1 = [6, 26, 81, 83, 91, 120, 158, 159, 161, 162, 163, 164, 165, 167, 168, 169, 172, 173, 174, 176, 201, 202], $VI1 = [1, 242], $VJ1 = [1, 241], $VK1 = [31, 79, 174], $VL1 = [1, 245], $VM1 = [1, 249], $VN1 = [1, 254], $VO1 = [1, 251], $VP1 = [1, 255], $VQ1 = [1, 259], $VR1 = [1, 257], $VS1 = [1, 6, 12, 13, 14, 26, 27, 31, 33, 56, 82, 92, 104, 116, 117, 138, 142, 143, 144, 157, 159, 160, 170, 175, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $VT1 = [1, 6, 11, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 176, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 263, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 317, 318, 319, 320, 321, 322], $VU1 = [1, 288], $VV1 = [1, 290], $VW1 = [2, 345], $VX1 = [1, 304], $VY1 = [1, 299], $VZ1 = [1, 298], $V_1 = [1, 295], $V$1 = [1, 318], $V02 = [1, 317], $V12 = [31, 79, 174, 298], $V22 = [1, 6, 12, 13, 14, 26, 27, 33, 56, 82, 92, 100, 102, 103, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $V32 = [2, 8], $V42 = [79, 81], $V52 = [1, 6, 14, 176], $V62 = [1, 353], $V72 = [1, 357], $V82 = [1, 358], $V92 = [1, 367], $Va2 = [1, 369], $Vb2 = [1, 371], $Vc2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 322], $Vd2 = [1, 6, 11, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $Ve2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 320, 322], $Vf2 = [1, 383], $Vg2 = [1, 388], $Vh2 = [6, 26, 81, 83, 91, 120, 159, 161, 162, 163, 164, 165, 167, 168, 169, 172, 173, 174, 176, 201, 202], $Vi2 = [1, 411], $Vj2 = [1, 410], $Vk2 = [6, 26, 31, 81, 83, 91, 120, 158, 159, 161, 162, 163, 164, 165, 167, 168, 169, 171, 172, 173, 174, 176, 201, 202], $Vl2 = [6, 13], $Vm2 = [2, 278], $Vn2 = [1, 416], $Vo2 = [6, 13, 14, 56, 92], $Vp2 = [2, 420], $Vq2 = [1, 6, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 175, 176, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 300, 301, 302, 310, 311, 319, 320, 321, 322], $Vr2 = [1, 423], $Vs2 = [6, 13, 14, 27, 56, 92, 160, 175], $Vt2 = [2, 282], $Vu2 = [1, 432], $Vv2 = [1, 433], $Vw2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 294, 302, 310], $Vx2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 286, 294, 302, 310], $Vy2 = [300, 301], $Vz2 = [56, 300, 301], $VA2 = [1, 6, 12, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $VB2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 218, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $VC2 = [1, 456], $VD2 = [1, 463], $VE2 = [1, 464], $VF2 = [1, 468], $VG2 = [6, 13, 14, 33, 56], $VH2 = [6, 13, 14, 33, 56, 138], $VI2 = [6, 13, 14, 33, 56, 138, 176], $VJ2 = [56, 219, 220], $VK2 = [1, 480], $VL2 = [2, 275], $VM2 = [172, 218], $VN2 = [26, 31, 56, 79, 172, 174, 186, 218, 219, 220, 230], $VO2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 320, 322], $VP2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 286, 302], $VQ2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310], $VR2 = [1, 497], $VS2 = [6, 14, 130, 140, 166], $VT2 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 291, 293, 294, 302, 309, 310, 311, 319, 320, 321, 322], $VU2 = [14, 291, 306], $VV2 = [1, 6, 12, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $VW2 = [6, 13, 14], $VX2 = [2, 279], $VY2 = [1, 556], $VZ2 = [24, 25, 28, 29, 31, 53, 61, 79, 81, 87, 89, 91, 96, 99, 105, 106, 107, 108, 109, 110, 111, 112, 115, 118, 131, 132, 143, 144, 172, 174, 190, 191, 206, 207, 211, 212, 233, 234, 235, 238, 244, 245, 247, 253, 270, 271, 277, 283, 285, 287, 289, 293, 294, 303, 308, 312, 313, 314, 315, 316, 317, 318], $V_2 = [1, 561], $V$2 = [1, 562], $V03 = [1, 566], $V13 = [27, 56, 210, 219, 220], $V23 = [27, 56, 176, 210, 219, 220], $V33 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 285, 287, 293, 294, 302, 310], $V43 = [6, 14], $V53 = [6, 14, 79, 81, 82, 211, 212, 264, 265], $V63 = [6, 14, 82, 170], $V73 = [6, 11, 14, 82, 170, 176, 263], $V83 = [1, 601], $V93 = [79, 81, 82, 174], $Va3 = [1, 612], $Vb3 = [1, 613], $Vc3 = [219, 220], $Vd3 = [1, 619], $Ve3 = [1, 627], $Vf3 = [1, 628], $Vg3 = [1, 652], $Vh3 = [1, 646], $Vi3 = [1, 642], $Vj3 = [1, 643], $Vk3 = [1, 644], $Vl3 = [1, 645], $Vm3 = [1, 649], $Vn3 = [1, 650], $Vo3 = [1, 651], $Vp3 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 280, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $Vq3 = [12, 13, 56], $Vr3 = [1, 665], $Vs3 = [1, 667], $Vt3 = [1, 669], $Vu3 = [1, 722], $Vv3 = [1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 130, 138, 140, 142, 143, 144, 157, 160, 166, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], $Vw3 = [1, 734], $Vx3 = [6, 14, 56, 92, 130, 140, 166], $Vy3 = [1, 738], $Vz3 = [1, 739], $VA3 = [1, 740], $VB3 = [1, 737], $VC3 = [6, 14, 31, 53, 56, 92, 96, 130, 140, 142, 143, 144, 147, 151, 152, 153, 154, 155, 156, 157, 166], $VD3 = [1, 750], $VE3 = [6, 13, 14, 27, 56], $VF3 = [6, 14, 31, 53, 56, 92, 96, 130, 140, 142, 143, 144, 147, 150, 151, 152, 153, 154, 155, 156, 157, 166], $VG3 = [1, 780], $VH3 = [1, 781];
    var parser4 = {
      trace: function trace() {
      },
      yy: {},
      symbols_: {error: 2, Root: 3, Body: 4, Block: 5, TERMINATOR: 6, BODYSTART: 7, Line: 8, Terminator: 9, Type: 10, TYPE: 11, EMPTY_BLOCK: 12, INDENT: 13, OUTDENT: 14, CSSDeclaration: 15, Expression: 16, VarDecl: 17, Comment: 18, Statement: 19, ImportDeclaration: 20, ExportDeclaration: 21, Return: 22, Throw: 23, STATEMENT: 24, BREAK: 25, CALL_START: 26, CALL_END: 27, CONTINUE: 28, DEBUGGER: 29, EXPORT: 30, "{": 31, ImportSpecifierList: 32, "}": 33, FROM: 34, String: 35, EXPORT_ALL: 36, AS: 37, Identifier: 38, Exportable: 39, DEFAULT: 40, DefaultExportable: 41, MethodDeclaration: 42, Class: 43, TagDeclaration: 44, VarAssign: 45, ImportOrExport: 46, IMPORT: 47, ImportDefaultSpecifier: 48, TYPEIMPORT: 49, ImportNamespaceSpecifier: 50, IMPORT_COMMA: 51, ImportFrom: 52, STRING: 53, IMPORT_ALL: 54, ImportSpecifier: 55, ",": 56, OptComma: 57, DecoratorIdentifier: 58, MixinIdentifier: 59, Require: 60, REQUIRE: 61, RequireArg: 62, Literal: 63, Parenthetical: 64, Await: 65, Value: 66, Code: 67, Operation: 68, Assign: 69, If: 70, Ternary: 71, Try: 72, While: 73, For: 74, Switch: 75, Tag: 76, ExpressionBlock: 77, Outdent: 78, IDENTIFIER: 79, SymbolIdentifier: 80, SYMBOLID: 81, DECORATOR: 82, MIXIN: 83, Key: 84, KEY: 85, Argvar: 86, ARGVAR: 87, Symbol: 88, SYMBOL: 89, Decorator: 90, "(": 91, ")": 92, ArgList: 93, Decorators: 94, AlphaNumeric: 95, NUMBER: 96, UNIT: 97, InterpolatedString: 98, STRING_START: 99, NEOSTRING: 100, Interpolation: 101, STRING_END: 102, "{{": 103, "}}": 104, JS: 105, REGEX: 106, BOOL: 107, TRUE: 108, FALSE: 109, NULL: 110, UNDEFINED: 111, RETURN: 112, Arguments: 113, Selector: 114, SELECTOR_START: 115, SELECTOR_PART: 116, SELECTOR_END: 117, TAG_START: 118, TagOptions: 119, TAG_END: 120, TagBody: 121, TagTypeName: 122, Self: 123, TAG_TYPE: 124, TagIdentifier: 125, StyleBlockDeclaration: 126, CSS: 127, CSS_SEL: 128, StyleBody: 129, CSS_END: 130, GLOBAL: 131, LOCAL: 132, StyleBlockBody: 133, OptStyleBody: 134, StyleNode: 135, StyleDeclaration: 136, StyleProperty: 137, ":": 138, StyleExpressions: 139, CSSPROP: 140, StyleOperator: 141, MATH: 142, "+": 143, "-": 144, StyleExpression: 145, StyleTerm: 146, "/": 147, StyleOperation: 148, StyleTermPlaceholder: 149, CSSUNIT: 150, CSSVAR: 151, DIMENSION: 152, COLOR: 153, PERCENTAGE: 154, CSSURL: 155, CSSIDENTIFIER: 156, COMPARE: 157, TAG_REF: 158, INDEX_START: 159, INDEX_END: 160, TAG_ID: 161, TAG_FLAG: 162, TAG_ATTR: 163, TAG_ON: 164, STYLE_START: 165, STYLE_END: 166, "T.": 167, "T:": 168, "T@": 169, "@": 170, TAG_LITERAL: 171, "#": 172, TAG_WS: 173, "[": 174, "]": 175, "=": 176, TagAttrValue: 177, TagFlag: 178, "%": 179, TagPartIdentifier: 180, VALUE_START: 181, VALUE_END: 182, TagBodyList: 183, TagBodyItem: 184, SEPARATOR: 185, "...": 186, Splat: 187, LOGIC: 188, TagDeclarationBlock: 189, EXTEND: 190, TAG: 191, TagType: 192, ClassBody: 193, TagDeclKeywords: 194, TagId: 195, Assignable: 196, AssignObj: 197, ObjAssignable: 198, SimpleObjAssignable: 199, ObjRestValue: 200, HERECOMMENT: 201, COMMENT: 202, Method: 203, Do: 204, Begin: 205, BEGIN: 206, DO: 207, BLOCK_PARAM_START: 208, ParamList: 209, BLOCK_PARAM_END: 210, STATIC: 211, DEF: 212, MethodScope: 213, MethodScopeType: 214, MethodIdentifier: 215, MethodParams: 216, MethodBody: 217, ".": 218, DEF_BODY: 219, DEF_EMPTY: 220, This: 221, OptSemicolon: 222, ";": 223, Param: 224, ParamExpression: 225, ParamValue: 226, Object: 227, Array: 228, ParamVar: 229, BLOCK_ARG: 230, SPLAT: 231, VarKeyword: 232, VAR: 233, LET: 234, CONST: 235, VarAssignable: 236, SimpleAssignable: 237, ENV_FLAG: 238, Access: 239, SoakableOp: 240, IndexValue: 241, "?.": 242, Super: 243, SUPER: 244, AWAIT: 245, Range: 246, ARGUMENTS: 247, Invocation: 248, BANG: 249, AssignList: 250, ExpressionList: 251, ClassStart: 252, CLASS: 253, ClassName: 254, ClassBodyBlock: 255, ClassBodyLine: 256, ClassDeclLine: 257, ClassFieldDeclaration: 258, ClassField: 259, ClassFieldOp: 260, WatchBody: 261, ClassFieldDecoration: 262, COMPOUND_ASSIGN: 263, PROP: 264, ATTR: 265, ClassFieldBody: 266, WATCH: 267, OptFuncExist: 268, FUNC_EXIST: 269, THIS: 270, SELF: 271, RangeDots: 272, "..": 273, Arg: 274, DO_PLACEHOLDER: 275, SimpleArgs: 276, TRY: 277, Catch: 278, Finally: 279, FINALLY: 280, CATCH: 281, CATCH_VAR: 282, THROW: 283, WhileSource: 284, WHILE: 285, WHEN: 286, UNTIL: 287, Loop: 288, LOOP: 289, ForBody: 290, ELSE: 291, ForKeyword: 292, FOR: 293, POST_FOR: 294, ForStart: 295, ForSource: 296, ForVariables: 297, OWN: 298, ForValue: 299, FORIN: 300, FOROF: 301, BY: 302, SWITCH: 303, Whens: 304, When: 305, LEADING_WHEN: 306, IfBlock: 307, IF: 308, ELIF: 309, POST_IF: 310, "?": 311, NEW: 312, UNARY: 313, SQRT: 314, "---": 315, "+++": 316, "--": 317, "++": 318, EXP: 319, SHIFT: 320, NOT: 321, RELATION: 322, $accept: 0, $end: 1},
      terminals_: {2: "error", 6: "TERMINATOR", 7: "BODYSTART", 11: "TYPE", 12: "EMPTY_BLOCK", 13: "INDENT", 14: "OUTDENT", 24: "STATEMENT", 25: "BREAK", 26: "CALL_START", 27: "CALL_END", 28: "CONTINUE", 29: "DEBUGGER", 30: "EXPORT", 31: "{", 33: "}", 34: "FROM", 36: "EXPORT_ALL", 37: "AS", 40: "DEFAULT", 47: "IMPORT", 49: "TYPEIMPORT", 51: "IMPORT_COMMA", 53: "STRING", 54: "IMPORT_ALL", 56: ",", 61: "REQUIRE", 79: "IDENTIFIER", 81: "SYMBOLID", 82: "DECORATOR", 83: "MIXIN", 85: "KEY", 87: "ARGVAR", 89: "SYMBOL", 91: "(", 92: ")", 96: "NUMBER", 97: "UNIT", 99: "STRING_START", 100: "NEOSTRING", 102: "STRING_END", 103: "{{", 104: "}}", 105: "JS", 106: "REGEX", 107: "BOOL", 108: "TRUE", 109: "FALSE", 110: "NULL", 111: "UNDEFINED", 112: "RETURN", 115: "SELECTOR_START", 116: "SELECTOR_PART", 117: "SELECTOR_END", 118: "TAG_START", 120: "TAG_END", 124: "TAG_TYPE", 127: "CSS", 128: "CSS_SEL", 130: "CSS_END", 131: "GLOBAL", 132: "LOCAL", 138: ":", 140: "CSSPROP", 142: "MATH", 143: "+", 144: "-", 147: "/", 150: "CSSUNIT", 151: "CSSVAR", 152: "DIMENSION", 153: "COLOR", 154: "PERCENTAGE", 155: "CSSURL", 156: "CSSIDENTIFIER", 157: "COMPARE", 158: "TAG_REF", 159: "INDEX_START", 160: "INDEX_END", 161: "TAG_ID", 162: "TAG_FLAG", 163: "TAG_ATTR", 164: "TAG_ON", 165: "STYLE_START", 166: "STYLE_END", 167: "T.", 168: "T:", 169: "T@", 170: "@", 171: "TAG_LITERAL", 172: "#", 173: "TAG_WS", 174: "[", 175: "]", 176: "=", 179: "%", 180: "TagPartIdentifier", 181: "VALUE_START", 182: "VALUE_END", 185: "SEPARATOR", 186: "...", 188: "LOGIC", 190: "EXTEND", 191: "TAG", 201: "HERECOMMENT", 202: "COMMENT", 206: "BEGIN", 207: "DO", 208: "BLOCK_PARAM_START", 210: "BLOCK_PARAM_END", 211: "STATIC", 212: "DEF", 218: ".", 219: "DEF_BODY", 220: "DEF_EMPTY", 223: ";", 230: "BLOCK_ARG", 231: "SPLAT", 233: "VAR", 234: "LET", 235: "CONST", 238: "ENV_FLAG", 242: "?.", 244: "SUPER", 245: "AWAIT", 247: "ARGUMENTS", 249: "BANG", 253: "CLASS", 263: "COMPOUND_ASSIGN", 264: "PROP", 265: "ATTR", 267: "WATCH", 269: "FUNC_EXIST", 270: "THIS", 271: "SELF", 273: "..", 275: "DO_PLACEHOLDER", 277: "TRY", 280: "FINALLY", 281: "CATCH", 282: "CATCH_VAR", 283: "THROW", 285: "WHILE", 286: "WHEN", 287: "UNTIL", 289: "LOOP", 291: "ELSE", 293: "FOR", 294: "POST_FOR", 298: "OWN", 300: "FORIN", 301: "FOROF", 302: "BY", 303: "SWITCH", 306: "LEADING_WHEN", 308: "IF", 309: "ELIF", 310: "POST_IF", 311: "?", 312: "NEW", 313: "UNARY", 314: "SQRT", 315: "---", 316: "+++", 317: "--", 318: "++", 319: "EXP", 320: "SHIFT", 321: "NOT", 322: "RELATION"},
      productions_: [0, [3, 0], [3, 1], [3, 2], [4, 1], [4, 1], [4, 3], [4, 2], [9, 1], [10, 1], [5, 1], [5, 2], [5, 3], [5, 4], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [19, 1], [19, 1], [19, 1], [19, 1], [19, 4], [19, 1], [19, 4], [19, 1], [21, 4], [21, 6], [21, 4], [21, 6], [21, 2], [21, 3], [39, 1], [39, 1], [39, 1], [39, 1], [39, 1], [41, 1], [46, 1], [46, 1], [48, 1], [20, 2], [20, 4], [20, 5], [20, 4], [20, 5], [20, 6], [20, 7], [20, 6], [20, 8], [52, 1], [50, 3], [32, 1], [32, 3], [32, 4], [32, 4], [32, 5], [32, 6], [55, 1], [55, 1], [55, 1], [55, 3], [55, 1], [55, 3], [60, 2], [62, 1], [62, 1], [62, 0], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [77, 1], [77, 3], [38, 1], [80, 1], [58, 1], [59, 1], [84, 1], [86, 1], [88, 1], [90, 1], [90, 3], [90, 4], [94, 1], [94, 2], [95, 2], [95, 1], [95, 1], [95, 1], [95, 1], [35, 1], [98, 1], [98, 2], [98, 2], [98, 2], [101, 2], [101, 3], [63, 1], [63, 1], [63, 1], [63, 1], [63, 1], [63, 1], [63, 1], [63, 1], [22, 2], [22, 2], [22, 1], [114, 1], [114, 2], [114, 4], [114, 2], [76, 3], [76, 4], [122, 1], [122, 1], [122, 1], [122, 1], [122, 0], [126, 4], [15, 1], [15, 2], [15, 2], [133, 3], [134, 0], [134, 1], [129, 1], [129, 2], [129, 3], [129, 3], [135, 1], [135, 3], [136, 3], [137, 1], [141, 1], [141, 1], [141, 1], [139, 1], [139, 3], [145, 1], [145, 2], [145, 2], [145, 3], [148, 3], [149, 3], [149, 2], [146, 1], [146, 1], [146, 1], [146, 1], [146, 1], [146, 1], [146, 1], [146, 1], [146, 4], [146, 1], [146, 2], [119, 2], [119, 1], [119, 4], [119, 2], [119, 2], [119, 2], [119, 2], [119, 2], [119, 3], [119, 4], [119, 5], [119, 2], [119, 3], [119, 3], [119, 4], [119, 3], [119, 3], [119, 3], [119, 3], [119, 4], [119, 3], [119, 4], [119, 4], [119, 2], [119, 2], [119, 2], [119, 3], [125, 1], [125, 3], [125, 2], [125, 4], [178, 1], [178, 2], [177, 3], [121, 2], [121, 3], [121, 3], [121, 1], [183, 1], [183, 3], [183, 4], [183, 6], [183, 4], [183, 6], [184, 1], [184, 2], [184, 1], [184, 1], [184, 1], [44, 1], [44, 2], [44, 2], [44, 2], [189, 2], [189, 3], [189, 4], [189, 5], [194, 0], [194, 1], [192, 1], [195, 2], [69, 1], [69, 3], [69, 5], [197, 1], [197, 1], [197, 1], [197, 3], [197, 5], [197, 3], [197, 5], [197, 1], [199, 1], [199, 1], [199, 1], [198, 1], [198, 3], [198, 3], [198, 1], [200, 2], [18, 1], [18, 1], [67, 1], [67, 1], [67, 1], [205, 2], [204, 2], [204, 5], [203, 1], [203, 2], [203, 2], [42, 6], [42, 4], [216, 1], [216, 3], [214, 1], [214, 1], [215, 1], [215, 1], [215, 1], [215, 3], [217, 2], [217, 3], [217, 1], [213, 1], [213, 1], [213, 1], [57, 0], [57, 1], [222, 0], [222, 1], [209, 0], [209, 1], [209, 3], [225, 1], [225, 1], [225, 1], [225, 1], [225, 1], [225, 1], [226, 1], [224, 1], [224, 1], [224, 1], [224, 2], [224, 2], [224, 3], [224, 3], [224, 3], [224, 1], [229, 1], [229, 2], [187, 2], [232, 1], [232, 1], [232, 1], [236, 1], [236, 2], [236, 1], [236, 1], [17, 2], [45, 3], [45, 5], [237, 1], [237, 1], [237, 1], [237, 1], [237, 1], [237, 1], [237, 2], [239, 3], [239, 3], [239, 4], [240, 1], [240, 1], [243, 1], [196, 1], [196, 1], [196, 1], [65, 2], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 2], [241, 1], [227, 4], [250, 0], [250, 1], [250, 3], [250, 4], [250, 6], [251, 1], [251, 3], [251, 4], [251, 4], [251, 6], [43, 1], [43, 2], [43, 2], [43, 2], [252, 3], [252, 2], [252, 2], [252, 4], [252, 5], [252, 4], [254, 1], [254, 1], [254, 3], [254, 3], [193, 2], [193, 3], [193, 4], [255, 1], [255, 3], [255, 2], [256, 1], [256, 1], [256, 2], [256, 1], [256, 1], [256, 1], [257, 2], [257, 1], [257, 1], [258, 3], [258, 1], [258, 3], [258, 3], [262, 3], [261, 1], [261, 1], [260, 1], [260, 1], [259, 1], [259, 1], [259, 2], [259, 2], [259, 2], [266, 3], [248, 3], [248, 2], [268, 0], [268, 1], [113, 2], [113, 4], [221, 1], [123, 1], [228, 2], [228, 4], [272, 1], [272, 1], [246, 5], [93, 1], [93, 3], [93, 4], [93, 6], [93, 4], [93, 6], [78, 2], [78, 1], [274, 1], [274, 2], [274, 1], [274, 1], [274, 1], [276, 1], [276, 3], [72, 2], [72, 3], [72, 3], [72, 4], [279, 2], [278, 3], [278, 2], [23, 2], [64, 3], [64, 4], [64, 2], [284, 2], [284, 4], [284, 2], [284, 4], [73, 2], [73, 2], [73, 2], [73, 1], [288, 2], [288, 2], [74, 2], [74, 2], [74, 2], [74, 4], [292, 1], [292, 1], [290, 2], [290, 2], [295, 2], [295, 3], [299, 1], [299, 1], [299, 1], [297, 1], [297, 3], [297, 5], [296, 2], [296, 2], [296, 4], [296, 4], [296, 4], [296, 6], [296, 6], [75, 5], [75, 7], [75, 4], [75, 6], [304, 1], [304, 2], [305, 3], [305, 4], [307, 3], [307, 5], [307, 4], [307, 3], [70, 1], [70, 3], [70, 3], [71, 5], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 2], [68, 3], [68, 3], [68, 3], [68, 3], [68, 3], [68, 3], [68, 3], [68, 4], [68, 3], [68, 3], [68, 5]],
      performAction: function performAction(self2, yytext, yy, yystate, $$) {
        var $0 = $$.length - 1;
        switch (yystate) {
          case 1:
            return self2.$ = new yy.Root([]);
            break;
          case 2:
            return self2.$ = new yy.Root($$[$0]);
            break;
          case 3:
            return self2.$ = $$[$0 - 1];
            break;
          case 4:
          case 10:
            self2.$ = new yy.Block([]);
            break;
          case 5:
            self2.$ = new yy.Block([$$[$0]]);
            break;
          case 6:
          case 373:
            self2.$ = $$[$0 - 2].break($$[$0 - 1]).add($$[$0]);
            break;
          case 7:
          case 374:
            self2.$ = $$[$0 - 1].break($$[$0]);
            break;
          case 8:
            self2.$ = new yy.Terminator($$[$0]);
            break;
          case 9:
            self2.$ = new yy.TypeAnnotation($$[$0]);
            break;
          case 11:
            self2.$ = new yy.Block([]).indented($$[$0 - 1], $$[$0]);
            break;
          case 12:
          case 86:
          case 137:
          case 143:
          case 206:
          case 370:
            self2.$ = $$[$0 - 1].indented($$[$0 - 2], $$[$0]);
            break;
          case 13:
          case 371:
            self2.$ = $$[$0 - 1].prebreak($$[$0 - 2]).indented($$[$0 - 3], $$[$0]);
            break;
          case 14:
          case 15:
          case 17:
          case 18:
          case 19:
          case 20:
          case 21:
          case 22:
          case 35:
          case 36:
          case 37:
          case 38:
          case 39:
          case 40:
          case 41:
          case 42:
          case 53:
          case 68:
          case 69:
          case 70:
          case 71:
          case 72:
          case 73:
          case 74:
          case 75:
          case 76:
          case 77:
          case 78:
          case 79:
          case 80:
          case 81:
          case 82:
          case 83:
          case 84:
          case 85:
          case 102:
          case 103:
          case 111:
          case 128:
          case 139:
          case 144:
          case 148:
          case 149:
          case 150:
          case 165:
          case 166:
          case 215:
          case 217:
          case 218:
          case 219:
          case 220:
          case 228:
          case 232:
          case 242:
          case 243:
          case 244:
          case 245:
          case 246:
          case 249:
          case 253:
          case 254:
          case 255:
          case 259:
          case 264:
          case 268:
          case 269:
          case 270:
          case 272:
          case 273:
          case 275:
          case 276:
          case 277:
          case 278:
          case 279:
          case 280:
          case 281:
          case 285:
          case 286:
          case 287:
          case 288:
          case 289:
          case 290:
          case 291:
          case 294:
          case 304:
          case 305:
          case 306:
          case 307:
          case 309:
          case 310:
          case 315:
          case 316:
          case 319:
          case 327:
          case 328:
          case 329:
          case 331:
          case 332:
          case 333:
          case 334:
          case 335:
          case 337:
          case 338:
          case 339:
          case 340:
          case 341:
          case 355:
          case 375:
          case 376:
          case 378:
          case 379:
          case 380:
          case 382:
          case 383:
          case 385:
          case 389:
          case 390:
          case 419:
          case 420:
          case 422:
          case 424:
          case 425:
          case 445:
          case 452:
          case 453:
          case 458:
          case 459:
          case 460:
          case 475:
          case 483:
            self2.$ = $$[$0];
            break;
          case 16:
            self2.$ = $$[$0].option("block", true);
            break;
          case 23:
          case 112:
            self2.$ = new yy.Literal($$[$0]);
            break;
          case 24:
            self2.$ = new yy.BreakStatement($$[$0]);
            break;
          case 25:
            self2.$ = new yy.BreakStatement($$[$0 - 3], $$[$0 - 1]);
            break;
          case 26:
            self2.$ = new yy.ContinueStatement($$[$0]);
            break;
          case 27:
            self2.$ = new yy.ContinueStatement($$[$0 - 3], $$[$0 - 1]);
            break;
          case 28:
            self2.$ = new yy.DebuggerStatement($$[$0]);
            break;
          case 29:
            self2.$ = new yy.ExportNamedDeclaration($$[$0 - 3], [$$[$0 - 1]]);
            break;
          case 30:
            self2.$ = new yy.ExportNamedDeclaration($$[$0 - 5], [$$[$0 - 3]], $$[$0]);
            break;
          case 31:
            self2.$ = new yy.ExportAllDeclaration($$[$0 - 3], [new yy.ExportAllSpecifier($$[$0 - 2])], $$[$0]);
            break;
          case 32:
            self2.$ = new yy.ExportAllDeclaration($$[$0 - 5], [new yy.ExportAllSpecifier($$[$0 - 4], $$[$0 - 2])], $$[$0]);
            break;
          case 33:
            self2.$ = new yy.Export($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 34:
            self2.$ = new yy.Export($$[$0]).set({keyword: $$[$0 - 2], default: $$[$0 - 1]});
            break;
          case 43:
            self2.$ = new yy.ImportDefaultSpecifier($$[$0]);
            break;
          case 44:
            self2.$ = new yy.ImportDeclaration($$[$0 - 1], null, $$[$0]);
            break;
          case 45:
          case 47:
            self2.$ = new yy.ImportDeclaration($$[$0 - 3], [$$[$0 - 2]], $$[$0]);
            break;
          case 46:
            self2.$ = new yy.ImportTypeDeclaration($$[$0 - 4], [$$[$0 - 2]], $$[$0]);
            break;
          case 48:
            self2.$ = new yy.ImportDeclaration($$[$0 - 4], null, $$[$0]);
            break;
          case 49:
            self2.$ = new yy.ImportDeclaration($$[$0 - 5], [$$[$0 - 3]], $$[$0]);
            break;
          case 50:
            self2.$ = new yy.ImportTypeDeclaration($$[$0 - 6], [$$[$0 - 3]], $$[$0]);
            break;
          case 51:
            self2.$ = new yy.ImportDeclaration($$[$0 - 5], [$$[$0 - 4], $$[$0 - 2]], $$[$0]);
            break;
          case 52:
            self2.$ = new yy.ImportDeclaration($$[$0 - 7], [$$[$0 - 6], $$[$0 - 3]], $$[$0]);
            break;
          case 54:
            self2.$ = new yy.ImportNamespaceSpecifier(new yy.Literal($$[$0 - 2]), $$[$0]);
            break;
          case 55:
            self2.$ = new yy.ESMSpecifierList([]).add($$[$0]);
            break;
          case 56:
          case 142:
          case 152:
          case 210:
          case 347:
          case 351:
          case 413:
            self2.$ = $$[$0 - 2].add($$[$0]);
            break;
          case 57:
            self2.$ = $$[$0 - 3].add($$[$0]);
            break;
          case 58:
          case 179:
            self2.$ = $$[$0 - 2];
            break;
          case 59:
            self2.$ = $$[$0 - 3];
            break;
          case 60:
          case 214:
          case 354:
          case 417:
            self2.$ = $$[$0 - 5].concat($$[$0 - 2]);
            break;
          case 61:
          case 62:
          case 63:
            self2.$ = new yy.ImportSpecifier($$[$0]);
            break;
          case 64:
            self2.$ = new yy.ImportSpecifier($$[$0 - 2], $$[$0]);
            break;
          case 65:
            self2.$ = new yy.ImportSpecifier(new yy.Literal($$[$0]));
            break;
          case 66:
            self2.$ = new yy.ImportSpecifier(new yy.Literal($$[$0 - 2]), $$[$0]);
            break;
          case 67:
            self2.$ = new yy.Require($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 87:
          case 91:
            self2.$ = new yy.Identifier($$[$0]);
            break;
          case 88:
            self2.$ = new yy.SymbolIdentifier($$[$0]);
            break;
          case 89:
            self2.$ = new yy.DecoratorIdentifier($$[$0]);
            break;
          case 90:
            self2.$ = new yy.MixinIdentifier($$[$0]);
            break;
          case 92:
            self2.$ = new yy.Argvar($$[$0]);
            break;
          case 93:
            self2.$ = new yy.Symbol($$[$0]);
            break;
          case 94:
            self2.$ = new yy.Decorator($$[$0]);
            break;
          case 95:
            self2.$ = new yy.Decorator($$[$0 - 2]);
            break;
          case 96:
            self2.$ = new yy.Decorator($$[$0 - 3]).set({params: $$[$0 - 1]});
            break;
          case 97:
          case 283:
          case 461:
            self2.$ = [$$[$0]];
            break;
          case 98:
          case 476:
            self2.$ = $$[$0 - 1].concat($$[$0]);
            break;
          case 99:
            self2.$ = new yy.NumWithUnit($$[$0 - 1], $$[$0]);
            break;
          case 100:
            self2.$ = new yy.Num($$[$0]);
            break;
          case 101:
          case 104:
            self2.$ = new yy.Str($$[$0]);
            break;
          case 105:
            self2.$ = new yy.InterpolatedString([], {open: $$[$0]});
            break;
          case 106:
          case 123:
          case 141:
          case 154:
          case 155:
          case 200:
          case 203:
            self2.$ = $$[$0 - 1].add($$[$0]);
            break;
          case 107:
            self2.$ = $$[$0] ? $$[$0 - 1].add($$[$0]) : $$[$0 - 1];
            break;
          case 108:
          case 125:
            self2.$ = $$[$0 - 1].option("close", $$[$0]);
            break;
          case 109:
            self2.$ = null;
            break;
          case 110:
          case 195:
          case 196:
          case 204:
          case 207:
          case 248:
          case 265:
          case 418:
            self2.$ = $$[$0 - 1];
            break;
          case 113:
            self2.$ = new yy.RegExp($$[$0]);
            break;
          case 114:
            self2.$ = new yy.Bool($$[$0]);
            break;
          case 115:
            self2.$ = new yy.True($$[$0]);
            break;
          case 116:
            self2.$ = new yy.False($$[$0]);
            break;
          case 117:
            self2.$ = new yy.Nil($$[$0]);
            break;
          case 118:
            self2.$ = new yy.Undefined($$[$0]);
            break;
          case 119:
          case 120:
            self2.$ = new yy.Return($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 121:
            self2.$ = new yy.Return().set({keyword: $$[$0]});
            break;
          case 122:
            self2.$ = new yy.Selector([], {type: $$[$0], open: $$[$0]});
            break;
          case 124:
          case 201:
            self2.$ = $$[$0 - 3].add($$[$0 - 1]);
            break;
          case 126:
            self2.$ = $$[$0 - 1].set({open: $$[$0 - 2], close: $$[$0]});
            break;
          case 127:
            self2.$ = $$[$0 - 2].set({body: $$[$0], open: $$[$0 - 3], close: $$[$0 - 1]});
            break;
          case 129:
          case 130:
          case 230:
            self2.$ = new yy.TagTypeIdentifier($$[$0]);
            break;
          case 131:
            self2.$ = new yy.ExpressionNode($$[$0]);
            break;
          case 132:
            self2.$ = new yy.TagTypeIdentifier("div");
            break;
          case 133:
          case 145:
            self2.$ = new yy.StyleRuleSet($$[$0 - 2], $$[$0 - 1]);
            break;
          case 134:
            self2.$ = $$[$0].set({toplevel: true});
            break;
          case 135:
          case 223:
          case 260:
          case 358:
            self2.$ = $$[$0].set({global: $$[$0 - 1]});
            break;
          case 136:
          case 357:
            self2.$ = $$[$0].set({local: $$[$0 - 1]});
            break;
          case 138:
            self2.$ = new yy.StyleBody([]);
            break;
          case 140:
            self2.$ = new yy.StyleBody([$$[$0]]);
            break;
          case 146:
            self2.$ = new yy.StyleDeclaration($$[$0 - 2], $$[$0]);
            break;
          case 147:
            self2.$ = new yy.StyleProperty([$$[$0]]);
            break;
          case 151:
            self2.$ = new yy.StyleExpressions([$$[$0]]);
            break;
          case 153:
            self2.$ = new yy.StyleExpression().add($$[$0]);
            break;
          case 156:
          case 157:
            self2.$ = $$[$0 - 2].addParam($$[$0], $$[$0 - 1]);
            break;
          case 158:
            self2.$ = new yy.StyleInterpolationExpression($$[$0 - 1]);
            break;
          case 159:
            self2.$ = $$[$0 - 1].set({unit: $$[$0]});
            break;
          case 160:
            self2.$ = new yy.StyleVar($$[$0]);
            break;
          case 161:
          case 163:
            self2.$ = new yy.StyleDimension($$[$0]);
            break;
          case 162:
            self2.$ = new yy.StyleColor($$[$0]);
            break;
          case 164:
            self2.$ = new yy.StyleNumber($$[$0]);
            break;
          case 167:
            self2.$ = new yy.StyleURL($$[$0]);
            break;
          case 168:
            self2.$ = new yy.StyleFunction($$[$0 - 3], $$[$0 - 1]);
            break;
          case 169:
            self2.$ = new yy.StyleIdentifier($$[$0]);
            break;
          case 170:
            self2.$ = $$[$0].set({op: $$[$0 - 1]});
            break;
          case 171:
            self2.$ = new yy.Tag({type: $$[$0 - 1], reference: $$[$0]});
            break;
          case 172:
            self2.$ = new yy.Tag({type: $$[$0]});
            break;
          case 173:
          case 193:
            self2.$ = $$[$0 - 3].addPart($$[$0 - 1], yy.TagData);
            break;
          case 174:
            self2.$ = $$[$0 - 1].addPart($$[$0], yy.TagId);
            break;
          case 175:
            self2.$ = $$[$0 - 1].addPart(new yy.IdentifierExpression($$[$0].cloneSlice(1)), yy.TagId);
            break;
          case 176:
            self2.$ = $$[$0 - 1].addPart($$[$0], yy.TagFlag);
            break;
          case 177:
            self2.$ = $$[$0 - 1].addPart($$[$0], yy.TagAttr);
            break;
          case 178:
            self2.$ = $$[$0 - 1].addPart($$[$0], yy.TagHandler);
            break;
          case 180:
            self2.$ = $$[$0 - 3].addPart(new yy.StyleRuleSet(null, $$[$0 - 1]), yy.TagFlag);
            break;
          case 181:
            self2.$ = $$[$0 - 4].addPart(new yy.StyleRuleSet(null, $$[$0 - 1]), yy.TagFlag);
            break;
          case 182:
            self2.$ = $$[$0 - 1].addPart(new yy.MixinIdentifier($$[$0]), yy.TagFlag);
            break;
          case 183:
          case 184:
            self2.$ = $$[$0 - 2].addPart($$[$0], yy.TagHandler);
            break;
          case 185:
            self2.$ = $$[$0 - 3].addPart($$[$0].prepend("_"), yy.TagFlag);
            break;
          case 186:
            self2.$ = $$[$0 - 2].addPart($$[$0], yy.TagFlag);
            break;
          case 187:
            self2.$ = $$[$0 - 2].addPart($$[$0], yy.TagId);
            break;
          case 188:
            self2.$ = $$[$0 - 2].addPart($$[$0 - 1], yy.TagSep).addPart($$[$0], yy.TagAttr);
            break;
          case 189:
          case 191:
            self2.$ = $$[$0 - 2].addPart(null, yy.TagArgList);
            break;
          case 190:
          case 192:
            self2.$ = $$[$0 - 3].addPart($$[$0 - 1], yy.TagArgList);
            break;
          case 194:
            self2.$ = $$[$0 - 1].addPart($$[$0], yy.TagSep);
            break;
          case 197:
            self2.$ = $$[$0 - 2].addPart($$[$0], yy.TagAttrValue, $$[$0 - 1]);
            break;
          case 198:
            self2.$ = new yy.IdentifierExpression($$[$0]);
            break;
          case 199:
          case 247:
            self2.$ = new yy.IdentifierExpression($$[$0 - 1]);
            break;
          case 202:
            self2.$ = new yy.TagFlag();
            break;
          case 205:
            self2.$ = new yy.TagBody([]).indented($$[$0 - 1], $$[$0]);
            break;
          case 208:
            self2.$ = new yy.TagBody([$$[$0]]);
            break;
          case 209:
            self2.$ = new yy.TagBody([]).add($$[$0]);
            break;
          case 211:
          case 348:
          case 352:
          case 414:
            self2.$ = $$[$0 - 3].add($$[$0 - 1]).add($$[$0]);
            break;
          case 212:
          case 415:
            self2.$ = $$[$0 - 5].add($$[$0 - 1]).add($$[$0]);
            break;
          case 213:
          case 353:
          case 416:
            self2.$ = $$[$0 - 2].indented($$[$0 - 3], $$[$0]);
            break;
          case 216:
          case 250:
          case 421:
            self2.$ = new yy.Splat($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 221:
            self2.$ = $$[$0].set({extension: true});
            break;
          case 222:
            self2.$ = $$[$0].set({local: true});
            break;
          case 224:
            self2.$ = new yy.TagDeclaration($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 225:
            self2.$ = new yy.TagDeclaration($$[$0 - 1], null, $$[$0]).set({keyword: $$[$0 - 2]});
            break;
          case 226:
            self2.$ = new yy.TagDeclaration($$[$0 - 2], $$[$0]).set({keyword: $$[$0 - 3]});
            break;
          case 227:
            self2.$ = new yy.TagDeclaration($$[$0 - 3], $$[$0 - 1], $$[$0]).set({keyword: $$[$0 - 4]});
            break;
          case 229:
            self2.$ = ["yy.extend"];
            break;
          case 231:
            self2.$ = new yy.TagIdRef($$[$0]);
            break;
          case 233:
          case 312:
            self2.$ = new yy.Assign($$[$0 - 1], $$[$0 - 2], $$[$0]);
            break;
          case 234:
          case 313:
            self2.$ = new yy.Assign($$[$0 - 3], $$[$0 - 4], $$[$0 - 1].indented($$[$0 - 2], $$[$0]));
            break;
          case 235:
            self2.$ = $$[$0].set({inObject: true});
            break;
          case 236:
            self2.$ = new yy.ObjAttr($$[$0]);
            break;
          case 237:
            self2.$ = new yy.ObjRestAttr($$[$0]);
            break;
          case 238:
            self2.$ = new yy.ObjAttr($$[$0 - 2], $$[$0]);
            break;
          case 239:
            self2.$ = new yy.ObjAttr($$[$0 - 4], $$[$0 - 1].indented($$[$0 - 2], $$[$0]));
            break;
          case 240:
            self2.$ = new yy.ObjAttr($$[$0 - 2], null, $$[$0]);
            break;
          case 241:
            self2.$ = new yy.ObjAttr($$[$0 - 4], null, $$[$0 - 1].indented($$[$0 - 2], $$[$0]));
            break;
          case 251:
            self2.$ = new yy.Comment($$[$0], true);
            break;
          case 252:
            self2.$ = new yy.Comment($$[$0], false);
            break;
          case 256:
            self2.$ = new yy.Begin($$[$0]);
            break;
          case 257:
            self2.$ = new yy.Lambda([], $$[$0], null, null, {bound: true, keyword: $$[$0 - 1]});
            break;
          case 258:
            self2.$ = new yy.Lambda($$[$0 - 2], $$[$0], null, null, {bound: true, keyword: $$[$0 - 4]});
            break;
          case 261:
          case 381:
            self2.$ = $$[$0].set({static: $$[$0 - 1]});
            break;
          case 262:
            self2.$ = new yy.MethodDeclaration($$[$0 - 1], $$[$0], $$[$0 - 2], $$[$0 - 4], $$[$0 - 3]).set({def: $$[$0 - 5], keyword: $$[$0 - 5]});
            break;
          case 263:
            self2.$ = new yy.MethodDeclaration($$[$0 - 1], $$[$0], $$[$0 - 2], null).set({def: $$[$0 - 3], keyword: $$[$0 - 3]});
            break;
          case 266:
            self2.$ = {static: true};
            break;
          case 267:
            self2.$ = {};
            break;
          case 271:
            self2.$ = new yy.InterpolatedIdentifier($$[$0 - 1]);
            break;
          case 274:
            self2.$ = new yy.Block([]).set({end: $$[$0]._loc});
            break;
          case 282:
            self2.$ = [];
            break;
          case 284:
            self2.$ = $$[$0 - 2].concat($$[$0]);
            break;
          case 292:
          case 293:
          case 301:
            self2.$ = new yy.Param($$[$0]);
            break;
          case 295:
            self2.$ = $$[$0].set({splat: $$[$0 - 1]});
            break;
          case 296:
            self2.$ = $$[$0].set({blk: $$[$0 - 1]});
            break;
          case 297:
            self2.$ = new yy.Param($$[$0 - 2].value(), $$[$0]).set({datatype: $$[$0 - 2].option("datatype")});
            break;
          case 298:
          case 299:
            self2.$ = new yy.Param($$[$0 - 2], $$[$0]);
            break;
          case 300:
            self2.$ = new yy.RestParam($$[$0]);
            break;
          case 302:
            self2.$ = new yy.Param($$[$0 - 1]).set({datatype: $$[$0]});
            break;
          case 303:
            self2.$ = yy.SPLAT($$[$0]);
            break;
          case 308:
          case 320:
          case 397:
          case 437:
            self2.$ = $$[$0 - 1].set({datatype: $$[$0]});
            break;
          case 311:
            self2.$ = new yy.VarReference($$[$0], $$[$0 - 1]);
            break;
          case 314:
            self2.$ = new yy.EnvFlag($$[$0]);
            break;
          case 317:
          case 365:
            self2.$ = new yy.VarOrAccess($$[$0]);
            break;
          case 318:
          case 366:
            self2.$ = new yy.Access(".", null, $$[$0]);
            break;
          case 321:
          case 367:
          case 500:
          case 501:
          case 502:
          case 503:
          case 504:
          case 506:
          case 507:
            self2.$ = yy.OP($$[$0 - 1], $$[$0 - 2], $$[$0]);
            break;
          case 322:
          case 368:
            self2.$ = new yy.IndexAccess($$[$0 - 1], $$[$0 - 2], $$[$0]);
            break;
          case 323:
            self2.$ = new yy.IndexAccess(".", $$[$0 - 3], $$[$0 - 1]);
            break;
          case 326:
            self2.$ = new yy.Super($$[$0]);
            break;
          case 330:
            self2.$ = new yy.Await($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 336:
            self2.$ = yy.ARGUMENTS;
            break;
          case 342:
            self2.$ = new yy.BangCall($$[$0 - 1]).set({keyword: $$[$0]});
            break;
          case 343:
            self2.$ = new yy.Index($$[$0]);
            break;
          case 344:
            self2.$ = new yy.Obj($$[$0 - 2], $$[$0 - 3].generated).setEnds($$[$0 - 3], $$[$0]);
            break;
          case 345:
            self2.$ = new yy.AssignList([]);
            break;
          case 346:
            self2.$ = new yy.AssignList([$$[$0]]);
            break;
          case 349:
            self2.$ = $$[$0 - 5].concat($$[$0 - 2].indented($$[$0 - 3], $$[$0]));
            break;
          case 350:
            self2.$ = new yy.ExpressionList([]).add($$[$0]);
            break;
          case 356:
            self2.$ = $$[$0].set({extension: $$[$0 - 1]});
            break;
          case 359:
            self2.$ = new yy.ClassDeclaration($$[$0 - 1], null, $$[$0]).set({keyword: $$[$0 - 2]});
            break;
          case 360:
            self2.$ = new yy.ClassDeclaration($$[$0], null, []).set({keyword: $$[$0 - 1]});
            break;
          case 361:
            self2.$ = new yy.ClassDeclaration(null, null, $$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 362:
            self2.$ = new yy.ClassDeclaration($$[$0 - 2], $$[$0], []).set({keyword: $$[$0 - 3]});
            break;
          case 363:
            self2.$ = new yy.ClassDeclaration($$[$0 - 3], $$[$0 - 1], $$[$0]).set({keyword: $$[$0 - 4]});
            break;
          case 364:
            self2.$ = new yy.ClassDeclaration(null, $$[$0 - 1], $$[$0]).set({keyword: $$[$0 - 3]});
            break;
          case 369:
            self2.$ = new yy.ClassBody([]).indented($$[$0 - 1], $$[$0]);
            break;
          case 372:
            self2.$ = new yy.ClassBody([]).add($$[$0]);
            break;
          case 377:
            self2.$ = $$[$0 - 1].concat([$$[$0]]);
            break;
          case 384:
            self2.$ = $$[$0 - 2].set({value: $$[$0], op: $$[$0 - 1]});
            break;
          case 386:
          case 387:
          case 388:
            self2.$ = $$[$0 - 2].set({watch: $$[$0]});
            break;
          case 393:
          case 394:
            self2.$ = new yy.ClassField($$[$0]);
            break;
          case 395:
            self2.$ = new yy.ClassField($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 396:
            self2.$ = new yy.ClassAttribute($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 398:
            self2.$ = [$$[$0 - 2], $$[$0 - 1]];
            break;
          case 399:
            self2.$ = new yy.Call($$[$0 - 2], $$[$0], $$[$0 - 1]);
            break;
          case 400:
            self2.$ = $$[$0 - 1].addBlock($$[$0]);
            break;
          case 401:
            self2.$ = false;
            break;
          case 402:
            self2.$ = true;
            break;
          case 403:
            self2.$ = new yy.ArgList([]).setEnds($$[$0 - 1], $$[$0]);
            break;
          case 404:
            self2.$ = $$[$0 - 2].setEnds($$[$0 - 3], $$[$0]);
            break;
          case 405:
            self2.$ = new yy.This($$[$0]);
            break;
          case 406:
            self2.$ = new yy.Self($$[$0]);
            break;
          case 407:
            self2.$ = new yy.Arr(new yy.ArgList([])).setEnds($$[$0 - 1], $$[$0]);
            break;
          case 408:
            self2.$ = new yy.Arr($$[$0 - 2]).setEnds($$[$0 - 3], $$[$0 - 2]);
            break;
          case 409:
            self2.$ = "..";
            break;
          case 410:
            self2.$ = "...";
            break;
          case 411:
            self2.$ = yy.OP($$[$0 - 2], $$[$0 - 3], $$[$0 - 1]);
            break;
          case 412:
            self2.$ = new yy.ArgList([$$[$0]]);
            break;
          case 423:
            self2.$ = new yy.DoPlaceholder($$[$0]);
            break;
          case 426:
            self2.$ = [].concat($$[$0 - 2], $$[$0]);
            break;
          case 427:
            self2.$ = new yy.Try($$[$0]);
            break;
          case 428:
            self2.$ = new yy.Try($$[$0 - 1], $$[$0]);
            break;
          case 429:
            self2.$ = new yy.Try($$[$0 - 1], null, $$[$0]);
            break;
          case 430:
            self2.$ = new yy.Try($$[$0 - 2], $$[$0 - 1], $$[$0]);
            break;
          case 431:
            self2.$ = new yy.Finally($$[$0]);
            break;
          case 432:
            self2.$ = new yy.Catch($$[$0], $$[$0 - 1]);
            break;
          case 433:
            self2.$ = new yy.Catch($$[$0], null);
            break;
          case 434:
            self2.$ = new yy.Throw($$[$0]);
            break;
          case 435:
            self2.$ = new yy.Parens($$[$0 - 1], $$[$0 - 2], $$[$0]);
            break;
          case 436:
            self2.$ = new yy.ExpressionWithUnit(new yy.Parens($$[$0 - 2], $$[$0 - 3], $$[$0 - 1]), $$[$0]);
            break;
          case 438:
            self2.$ = new yy.While($$[$0], {keyword: $$[$0 - 1]});
            break;
          case 439:
            self2.$ = new yy.While($$[$0 - 2], {guard: $$[$0], keyword: $$[$0 - 3]});
            break;
          case 440:
            self2.$ = new yy.While($$[$0], {invert: true, keyword: $$[$0 - 1]});
            break;
          case 441:
            self2.$ = new yy.While($$[$0 - 2], {invert: true, guard: $$[$0], keyword: $$[$0 - 3]});
            break;
          case 442:
          case 450:
            self2.$ = $$[$0 - 1].addBody($$[$0]);
            break;
          case 443:
          case 444:
            self2.$ = $$[$0].addBody(yy.Block.wrap([$$[$0 - 1]]));
            break;
          case 446:
            self2.$ = new yy.While(new yy.Literal("true", {keyword: $$[$0 - 1]})).addBody($$[$0]);
            break;
          case 447:
            self2.$ = new yy.While(new yy.Literal("true", {keyword: $$[$0 - 1]})).addBody(yy.Block.wrap([$$[$0]]));
            break;
          case 448:
          case 449:
            self2.$ = $$[$0].addBody([$$[$0 - 1]]);
            break;
          case 451:
            self2.$ = $$[$0 - 3].addBody($$[$0 - 2]).addElse($$[$0]);
            break;
          case 454:
            self2.$ = {source: new yy.ValueNode($$[$0])};
            break;
          case 455:
            self2.$ = $$[$0].configure({own: $$[$0 - 1].own, name: $$[$0 - 1][0], index: $$[$0 - 1][1], keyword: $$[$0 - 1].keyword});
            break;
          case 456:
            self2.$ = ($$[$0].keyword = $$[$0 - 1]) && $$[$0];
            break;
          case 457:
            self2.$ = ($$[$0].own = true) && ($$[$0].keyword = $$[$0 - 2]) && $$[$0];
            break;
          case 462:
            self2.$ = [$$[$0 - 2], $$[$0]];
            break;
          case 463:
            self2.$ = [$$[$0 - 4], $$[$0 - 2], $$[$0]];
            break;
          case 464:
            self2.$ = new yy.ForIn({source: $$[$0]});
            break;
          case 465:
            self2.$ = new yy.ForOf({source: $$[$0], object: true});
            break;
          case 466:
            self2.$ = new yy.ForIn({source: $$[$0 - 2], guard: $$[$0]});
            break;
          case 467:
            self2.$ = new yy.ForOf({source: $$[$0 - 2], guard: $$[$0], object: true});
            break;
          case 468:
            self2.$ = new yy.ForIn({source: $$[$0 - 2], step: $$[$0]});
            break;
          case 469:
            self2.$ = new yy.ForIn({source: $$[$0 - 4], guard: $$[$0 - 2], step: $$[$0]});
            break;
          case 470:
            self2.$ = new yy.ForIn({source: $$[$0 - 4], step: $$[$0 - 2], guard: $$[$0]});
            break;
          case 471:
            self2.$ = new yy.Switch($$[$0 - 3], $$[$0 - 1]);
            break;
          case 472:
            self2.$ = new yy.Switch($$[$0 - 5], $$[$0 - 3], $$[$0 - 1]);
            break;
          case 473:
            self2.$ = new yy.Switch(null, $$[$0 - 1]);
            break;
          case 474:
            self2.$ = new yy.Switch(null, $$[$0 - 3], $$[$0 - 1]);
            break;
          case 477:
            self2.$ = [new yy.SwitchCase($$[$0 - 1], $$[$0])];
            break;
          case 478:
            self2.$ = [new yy.SwitchCase($$[$0 - 2], $$[$0 - 1])];
            break;
          case 479:
            self2.$ = new yy.If($$[$0 - 1], $$[$0], {type: $$[$0 - 2]});
            break;
          case 480:
            self2.$ = $$[$0 - 4].addElse(new yy.If($$[$0 - 1], $$[$0], {type: $$[$0 - 2]}));
            break;
          case 481:
            self2.$ = $$[$0 - 3].addElse(new yy.If($$[$0 - 1], $$[$0], {type: $$[$0 - 2]}));
            break;
          case 482:
            self2.$ = $$[$0 - 2].addElse($$[$0].set({keyword: $$[$0 - 1]}));
            break;
          case 484:
            self2.$ = new yy.If($$[$0], new yy.Block([$$[$0 - 2]]), {type: $$[$0 - 1], statement: true});
            break;
          case 485:
            self2.$ = new yy.If($$[$0], new yy.Block([$$[$0 - 2]]), {type: $$[$0 - 1]});
            break;
          case 486:
            self2.$ = yy.If.ternary($$[$0 - 4], $$[$0 - 2], $$[$0]);
            break;
          case 487:
            self2.$ = new yy.Instantiation($$[$0]).set({keyword: $$[$0 - 1]});
            break;
          case 488:
          case 489:
          case 490:
          case 491:
          case 492:
          case 493:
            self2.$ = yy.OP($$[$0 - 1], $$[$0]);
            break;
          case 494:
          case 495:
            self2.$ = new yy.UnaryOp($$[$0 - 1], null, $$[$0]);
            break;
          case 496:
          case 497:
            self2.$ = new yy.UnaryOp($$[$0], $$[$0 - 1], null, true);
            break;
          case 498:
          case 499:
            self2.$ = new yy.Op($$[$0 - 1], $$[$0 - 2], $$[$0]);
            break;
          case 505:
            self2.$ = yy.OP($$[$0 - 1], $$[$0 - 3], $$[$0]).invert($$[$0 - 2]);
            break;
          case 508:
            self2.$ = yy.OP($$[$0 - 3], $$[$0 - 4], $$[$0 - 1].indented($$[$0 - 2], $$[$0]));
            break;
        }
      },
      table: [{1: [2, 1], 3: 1, 4: 2, 5: 3, 7: $V0, 8: 5, 12: $V1, 13: $V2, 15: 8, 16: 9, 17: 10, 18: 11, 19: 12, 20: 13, 21: 14, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 30: $V7, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 47: $V9, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 126: 15, 127: $Vt, 131: $Vu, 132: $Vv, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {1: [3]}, {1: [2, 2], 6: $V61, 9: 134}, {6: [1, 136]}, o($V71, [2, 4]), o($V71, [2, 5]), o($V81, [2, 10]), {4: 138, 6: [1, 139], 7: $V0, 8: 5, 14: [1, 137], 15: 8, 16: 9, 17: 10, 18: 11, 19: 12, 20: 13, 21: 14, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 30: $V7, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 47: $V9, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 126: 15, 127: $Vt, 131: $Vu, 132: $Vv, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($V71, [2, 14]), o($V71, [2, 15], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($V71, [2, 16], {176: $Vk1}), o($V71, [2, 17]), o($V71, [2, 18], {292: 116, 295: 117, 284: 155, 290: 156, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Vl1}), o($V71, [2, 19]), o($V71, [2, 20]), o($V71, [2, 134]), {15: 157, 42: 160, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1, 189: 159, 191: $VB, 212: $VH, 252: 158, 253: $VP}, {15: 163, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1, 189: 165, 191: $VB, 252: 164, 253: $VP}, o($Vo1, [2, 71]), o($Vo1, [2, 72], {268: 167, 204: 168, 240: 169, 26: $Vp1, 159: $Vq1, 207: $VF, 218: $Vr1, 242: $Vs1, 249: $Vt1, 269: $Vu1}), o($Vo1, [2, 73]), o($Vo1, [2, 74]), o($Vo1, [2, 75]), o($Vo1, [2, 76]), o($Vo1, [2, 77]), o($Vo1, [2, 78]), o($Vo1, [2, 79]), o($Vo1, [2, 80]), o($Vo1, [2, 81]), o($Vo1, [2, 82]), o($Vo1, [2, 83]), o($Vo1, [2, 84]), {31: $V8, 38: 175, 79: $Vc, 174: $Vv1, 227: 177, 228: 176, 236: 174}, o($Vw1, [2, 251]), o($Vw1, [2, 252]), o($Vx1, [2, 21]), o($Vx1, [2, 22]), o($Vx1, [2, 23]), o($Vx1, [2, 24], {26: [1, 179]}), o($Vx1, [2, 26], {26: [1, 180]}), o($Vx1, [2, 28]), {31: [1, 185], 35: 181, 38: 187, 48: 182, 49: [1, 183], 50: 184, 53: $Vy1, 54: $Vz1, 79: $Vc}, {15: 195, 17: 199, 31: [1, 189], 36: [1, 190], 39: 191, 40: [1, 192], 42: 193, 43: 194, 44: 196, 45: 197, 126: 15, 127: $Vt, 131: [1, 198], 132: $Vv, 189: 78, 190: $VA, 191: $VB, 212: $VH, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 252: 76, 253: $VP}, {128: [1, 200]}, {16: 201, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VC1, $VD1, {176: [1, 205]}), o($VC1, [2, 332]), o($VC1, [2, 333]), o($VC1, [2, 334], {10: 206, 11: $VE1}), o($VC1, [2, 335]), o($VC1, [2, 336]), o($VC1, [2, 337]), o($VC1, [2, 338]), o($VC1, [2, 339], {31: [1, 209], 116: [1, 208], 117: [1, 210]}), o($VC1, [2, 340]), o($VC1, [2, 341]), o($Vo1, [2, 253]), o($Vo1, [2, 254]), o($Vo1, [2, 255]), {16: 211, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 212, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 213, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 214, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 215, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 216, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 217, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {31: $V8, 38: 109, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 66: 219, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 114: 53, 115: $Vr, 123: 108, 172: $Vy, 174: $Vz, 195: 52, 196: 220, 221: 51, 227: 86, 228: 85, 237: 218, 238: $VL, 239: 111, 243: 46, 244: $VM, 246: 49, 247: $VO, 248: 54, 270: $VQ, 271: $VR}, {31: $V8, 38: 109, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 66: 219, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 114: 53, 115: $Vr, 123: 108, 172: $Vy, 174: $Vz, 195: 52, 196: 220, 221: 51, 227: 86, 228: 85, 237: 221, 238: $VL, 239: 111, 243: 46, 244: $VM, 246: 49, 247: $VO, 248: 54, 270: $VQ, 271: $VR}, o($VF1, $VG1, {10: 225, 11: $VE1, 263: [1, 224], 317: [1, 222], 318: [1, 223]}), o($Vo1, [2, 232]), o($Vo1, [2, 483], {291: [1, 226], 309: [1, 227]}), {5: 228, 12: $V1, 13: $V2}, {5: 229, 12: $V1, 13: $V2}, o($Vo1, [2, 445]), {5: 230, 12: $V1, 13: $V2}, {13: [1, 232], 16: 231, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 355]), {189: 234, 191: $VB, 252: 233, 253: $VP}, o($Vo1, [2, 220]), o($VH1, [2, 132], {119: 235, 122: 236, 123: 237, 125: 240, 31: $VI1, 79: [1, 238], 124: [1, 239], 171: $VJ1, 271: $VR}), o($VK1, [2, 304]), o($VK1, [2, 305]), o($VK1, [2, 306]), o($Vx1, [2, 121], {65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 43: 29, 44: 30, 76: 31, 232: 32, 22: 35, 23: 36, 196: 45, 243: 46, 63: 47, 64: 48, 246: 49, 221: 51, 195: 52, 114: 53, 248: 54, 60: 55, 203: 56, 204: 57, 205: 58, 237: 68, 45: 69, 307: 70, 284: 72, 288: 73, 290: 74, 252: 76, 189: 78, 228: 85, 227: 86, 95: 88, 42: 102, 86: 107, 123: 108, 38: 109, 80: 110, 239: 111, 292: 116, 295: 117, 88: 123, 98: 124, 17: 199, 19: 202, 16: 243, 113: 244, 24: $V3, 25: $V4, 26: $VL1, 28: $V5, 29: $V6, 31: $V8, 53: $Va, 61: $Vb, 79: $Vc, 81: $Vd, 87: $Ve, 89: $Vf, 91: $Vg, 96: $Vh, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 115: $Vr, 118: $Vs, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 190: $VA, 191: $VB, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 233: $VI, 234: $VJ, 235: $VK, 238: $VL, 244: $VM, 245: $VN, 247: $VO, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 289: $VW, 303: $VZ, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}), {16: 246, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VF1, [2, 328]), o($VF1, [2, 329]), o($VC1, [2, 326]), o($VC1, [2, 111]), o($VC1, [2, 112]), o($VC1, [2, 113]), o($VC1, [2, 114]), o($VC1, [2, 115]), o($VC1, [2, 116]), o($VC1, [2, 117]), o($VC1, [2, 118]), {13: $VM1, 16: 248, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 251: 247, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: $VN1, 16: 250, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 252, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 175: $VO1, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([1, 6, 12, 13, 14, 26, 27, 33, 56, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 172, 175, 182, 186, 188, 207, 210, 218, 219, 220, 242, 249, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 319, 320, 321, 322], [2, 405]), {79: [1, 260]}, o($VS1, [2, 122]), o($VC1, [2, 70], {95: 88, 88: 123, 98: 124, 62: 261, 63: 262, 64: 263, 53: $Va, 89: $Vf, 91: $Vg, 96: $Vh, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp}), o($Vo1, [2, 259]), {42: 264, 212: $VH}, {5: 265, 12: $V1, 13: $V2, 208: [1, 266]}, {5: 267, 12: $V1, 13: $V2}, o($VT1, [2, 314]), o($VT1, [2, 315]), o($VT1, [2, 316]), o($VT1, [2, 317]), o($VT1, [2, 318]), o($VT1, [2, 319]), {16: 268, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 269, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 270, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {5: 271, 12: $V1, 13: $V2, 16: 272, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {31: $V8, 38: 277, 79: $Vc, 174: $Vz, 227: 279, 228: 278, 246: 273, 297: 274, 298: [1, 275], 299: 276}, {296: 280, 300: [1, 281], 301: [1, 282]}, {13: $VU1, 38: 286, 79: $Vc, 80: 287, 81: $Vd, 157: [1, 285], 193: 284, 254: 283}, {124: $VV1, 192: 289}, o([6, 13, 33, 56], $VW1, {88: 123, 98: 124, 250: 291, 197: 292, 42: 293, 198: 294, 199: 296, 18: 297, 95: 300, 38: 301, 80: 302, 84: 303, 53: $Va, 79: $Vc, 81: $Vd, 85: $VX1, 89: $Vf, 91: $VY1, 96: $Vh, 99: $Vi, 174: $VZ1, 186: $V_1, 201: $VC, 202: $VD, 212: $VH}), o($VC1, [2, 100], {97: [1, 305]}), o($VC1, [2, 101]), o($VC1, [2, 102]), o($VC1, [2, 103], {101: 307, 100: [1, 306], 102: [1, 308], 103: [1, 309]}), {38: 314, 58: 315, 79: $Vc, 80: 316, 81: $Vd, 82: $V$1, 123: 313, 174: $V02, 213: 310, 215: 311, 221: 312, 270: $VQ, 271: $VR}, o($VT1, [2, 92]), o([1, 6, 11, 12, 13, 14, 26, 27, 33, 56, 81, 82, 83, 91, 92, 104, 120, 138, 142, 143, 144, 157, 158, 159, 160, 161, 162, 163, 164, 165, 167, 168, 169, 170, 172, 173, 174, 175, 176, 182, 186, 188, 201, 202, 207, 210, 218, 219, 220, 242, 249, 263, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 317, 318, 319, 320, 321, 322], [2, 406]), o([1, 6, 11, 12, 13, 14, 26, 27, 31, 33, 34, 37, 51, 56, 79, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 172, 174, 175, 176, 182, 186, 188, 207, 210, 218, 219, 220, 230, 242, 249, 263, 269, 273, 285, 286, 287, 293, 294, 300, 301, 302, 310, 311, 317, 318, 319, 320, 321, 322], [2, 87]), o([1, 6, 11, 12, 13, 14, 26, 27, 31, 33, 56, 79, 82, 92, 104, 138, 142, 143, 144, 157, 159, 160, 170, 172, 174, 175, 176, 182, 186, 188, 207, 210, 218, 219, 220, 230, 242, 249, 263, 269, 273, 285, 286, 287, 293, 294, 302, 310, 311, 317, 318, 319, 320, 321, 322], [2, 88]), o($V12, [2, 452]), o($V12, [2, 453]), o($VC1, [2, 93]), o($V22, [2, 105]), o($V71, [2, 7], {15: 8, 16: 9, 17: 10, 18: 11, 19: 12, 20: 13, 21: 14, 126: 15, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 43: 29, 44: 30, 76: 31, 232: 32, 22: 35, 23: 36, 196: 45, 243: 46, 63: 47, 64: 48, 246: 49, 221: 51, 195: 52, 114: 53, 248: 54, 60: 55, 203: 56, 204: 57, 205: 58, 237: 68, 45: 69, 307: 70, 284: 72, 288: 73, 290: 74, 252: 76, 189: 78, 228: 85, 227: 86, 95: 88, 42: 102, 86: 107, 123: 108, 38: 109, 80: 110, 239: 111, 292: 116, 295: 117, 88: 123, 98: 124, 8: 319, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 30: $V7, 31: $V8, 47: $V9, 53: $Va, 61: $Vb, 79: $Vc, 81: $Vd, 87: $Ve, 89: $Vf, 91: $Vg, 96: $Vh, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 115: $Vr, 118: $Vs, 127: $Vt, 131: $Vu, 132: $Vv, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 190: $VA, 191: $VB, 201: $VC, 202: $VD, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 233: $VI, 234: $VJ, 235: $VK, 238: $VL, 244: $VM, 245: $VN, 247: $VO, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 285: $VU, 287: $VV, 289: $VW, 293: $VX, 294: $VY, 303: $VZ, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}), o([1, 6, 14, 24, 25, 28, 29, 30, 31, 47, 53, 61, 79, 81, 82, 85, 87, 89, 91, 96, 99, 105, 106, 107, 108, 109, 110, 111, 112, 115, 118, 127, 128, 131, 132, 140, 143, 144, 172, 174, 186, 188, 190, 191, 201, 202, 206, 207, 211, 212, 231, 233, 234, 235, 238, 244, 245, 247, 253, 264, 265, 270, 271, 275, 277, 283, 285, 287, 289, 293, 294, 303, 308, 312, 313, 314, 315, 316, 317, 318], $V32), {1: [2, 3]}, o($V81, [2, 11]), {6: $V61, 9: 134, 14: [1, 320]}, {4: 321, 7: $V0, 8: 5, 15: 8, 16: 9, 17: 10, 18: 11, 19: 12, 20: 13, 21: 14, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 30: $V7, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 47: $V9, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 126: 15, 127: $Vt, 131: $Vu, 132: $Vv, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 322, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 323, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 324, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 325, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 326, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 327, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 328, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {322: [1, 329]}, {16: 330, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 331, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 332, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 444]), o($Vo1, [2, 449]), {13: [1, 334], 16: 333, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 335, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 443]), o($Vo1, [2, 448]), o($V71, [2, 135]), o($Vo1, [2, 358]), o($Vo1, [2, 223]), o($Vo1, [2, 260]), {15: 157, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1}, {15: 163, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1}, o($V71, [2, 136]), o($Vo1, [2, 357]), o($Vo1, [2, 222]), o($VC1, [2, 342]), {26: $VL1, 113: 336}, o($VC1, [2, 400]), {38: 337, 79: $Vc, 80: 338, 81: $Vd}, {16: 340, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 241: 339, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {26: [2, 402]}, o($V42, [2, 324]), o($V42, [2, 325]), o($V52, [2, 311]), o($V52, [2, 307], {10: 341, 11: $VE1}), o($V52, [2, 309]), o($V52, [2, 310]), {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 252, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 175: $VO1, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 343, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 344, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($V71, [2, 44]), {34: [1, 345], 51: [1, 346]}, {31: [1, 348], 38: 187, 48: 347, 79: $Vc}, {34: [1, 349]}, {13: $V62, 32: 351, 33: [1, 350], 38: 354, 40: $V72, 55: 352, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, o([1, 6, 14, 31, 53, 56, 92, 96, 130, 140, 142, 143, 144, 147, 151, 152, 153, 154, 155, 156, 157, 166], [2, 104]), o([34, 51], [2, 43]), {37: [1, 359]}, {13: $V62, 32: 360, 38: 354, 40: $V72, 55: 352, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, {34: [1, 361], 37: [1, 362]}, o($V71, [2, 33]), {16: 364, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 41: 363, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($V71, [2, 35]), o($V71, [2, 36]), o($V71, [2, 37]), o($V71, [2, 38]), o($V71, [2, 39]), {15: 157, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1, 189: 159, 191: $VB, 252: 158, 253: $VP}, {176: $Vk1}, {13: $V92, 128: $Va2, 129: 365, 135: 366, 136: 368, 137: 370, 140: $Vb2}, o($Vc2, [2, 330], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), {284: 155, 285: $VU, 287: $VV, 290: 156, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Vl1}, {189: 165, 191: $VB, 252: 164, 253: $VP}, {42: 160, 189: 159, 191: $VB, 212: $VH, 252: 158, 253: $VP}, {13: [1, 373], 16: 372, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vd2, [2, 437]), o($VT1, [2, 9]), o($VS1, [2, 123]), {16: 374, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VS1, [2, 125]), o($Vc2, [2, 487], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), o($Vc2, [2, 488], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), o($Vc2, [2, 489], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), o($Ve2, [2, 490], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 319: $Vg1, 321: $Vi1}), o($Ve2, [2, 491], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 319: $Vg1, 321: $Vi1}), o($Vc2, [2, 492], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), o($Vc2, [2, 493], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), o($Vo1, [2, 494], {10: 225, 11: $VE1, 26: $VG1, 159: $VG1, 207: $VG1, 218: $VG1, 242: $VG1, 249: $VG1, 269: $VG1}), {26: $Vp1, 159: $Vq1, 204: 168, 207: $VF, 218: $Vr1, 240: 169, 242: $Vs1, 249: $Vt1, 268: 167, 269: $Vu1}, o([26, 159, 207, 218, 242, 249, 269], $VD1), o($Vo1, [2, 495], {10: 225, 11: $VE1, 26: $VG1, 159: $VG1, 207: $VG1, 218: $VG1, 242: $VG1, 249: $VG1, 269: $VG1}), o($Vo1, [2, 496]), o($Vo1, [2, 497]), {13: [1, 376], 16: 375, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VT1, [2, 320]), {5: 378, 12: $V1, 13: $V2, 308: [1, 377]}, {16: 379, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 427], {278: 380, 279: 381, 280: $Vf2, 281: [1, 382]}), o($Vo1, [2, 442]), o($Vo1, [2, 450], {291: [1, 384]}), {13: [1, 385], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {304: 386, 305: 387, 306: $Vg2}, o($Vo1, [2, 356]), o($Vo1, [2, 221]), {6: [1, 407], 18: 406, 26: [1, 404], 81: [1, 392], 83: [1, 398], 91: [1, 403], 120: [1, 389], 159: [1, 390], 161: [1, 391], 162: [1, 393], 163: [1, 394], 164: [1, 395], 165: [1, 396], 167: [1, 397], 168: [1, 399], 169: [1, 400], 172: [1, 401], 173: [1, 402], 174: [1, 405], 176: [1, 408], 201: $VC, 202: $VD}, o($Vh2, [2, 172], {158: [1, 409]}), o($VH1, [2, 128]), o($VH1, [2, 129]), o($VH1, [2, 130]), o($VH1, [2, 131], {31: $Vi2, 171: $Vj2}), o($Vk2, [2, 198]), {16: 412, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vx1, [2, 119], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vx1, [2, 120]), {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 27: [1, 413], 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 414, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vx1, [2, 434], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vl2, $Vm2, {57: 417, 56: $Vn2, 92: [1, 415]}), o($Vo2, [2, 350], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {13: $VM1, 16: 248, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 251: 418, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([6, 13, 56, 175], $Vp2, {292: 116, 295: 117, 284: 151, 290: 152, 272: 419, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 186: [1, 421], 188: $Vd1, 273: [1, 420], 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vq2, [2, 407]), o([6, 13, 175], $Vm2, {57: 422, 56: $Vr2}), o($Vs2, [2, 412]), {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 424, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 425, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vs2, [2, 422]), o($Vs2, [2, 423]), o($Vs2, [2, 424]), {16: 426, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VC1, [2, 231]), o($VC1, [2, 67]), o($VC1, [2, 68]), o($VC1, [2, 69], {10: 206, 11: $VE1}), o($Vo1, [2, 261]), o($VC1, [2, 257]), o([56, 210], $Vt2, {209: 427, 224: 428, 227: 429, 228: 430, 229: 431, 38: 434, 31: $V8, 79: $Vc, 174: $Vv1, 186: $Vu2, 230: $Vv2}), o($Vo1, [2, 256]), {5: 435, 12: $V1, 13: $V2, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($Vw2, [2, 438], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 286: [1, 436], 287: $VV, 293: $VX, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vw2, [2, 440], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 286: [1, 437], 287: $VV, 293: $VX, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 446]), o($Vx2, [2, 447], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 454]), o($Vy2, [2, 456]), {31: $V8, 38: 277, 79: $Vc, 174: $Vv1, 227: 279, 228: 278, 297: 438, 299: 276}, o($Vy2, [2, 461], {56: [1, 439]}), o($Vz2, [2, 458]), o($Vz2, [2, 459]), o($Vz2, [2, 460]), o($Vo1, [2, 455]), {16: 440, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 441, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VA2, [2, 360], {193: 442, 13: $VU1, 157: [1, 443], 218: [1, 444]}), o($Vo1, [2, 361]), {16: 445, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VB2, [2, 365]), o($VB2, [2, 366]), {6: [1, 448], 14: [1, 446], 15: 452, 18: 453, 38: 461, 42: 457, 58: 459, 76: 454, 79: $Vc, 80: 462, 81: $Vd, 82: $V$1, 90: 455, 94: 450, 118: $Vs, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1, 201: $VC, 202: $VD, 211: $VC2, 212: $VH, 255: 447, 256: 449, 257: 451, 258: 458, 259: 460, 264: $VD2, 265: $VE2}, o($VA2, [2, 224], {193: 465, 13: $VU1, 157: [1, 466]}), o($Vo1, [2, 230]), o([6, 13, 33], $Vm2, {57: 467, 56: $VF2}), o($VG2, [2, 346]), o($VG2, [2, 235]), o($VG2, [2, 236], {138: [1, 469]}), o($VG2, [2, 237]), o($VH2, [2, 246], {176: [1, 470]}), o($VG2, [2, 242]), {16: 471, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 472, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VH2, [2, 249]), o($VI2, [2, 243]), o($VI2, [2, 244]), o($VI2, [2, 245]), o($VI2, [2, 91]), o($VC1, [2, 99]), o($V22, [2, 106]), o($V22, [2, 107]), o($V22, [2, 108]), {16: 474, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 104: [1, 473], 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {172: [1, 477], 214: 475, 218: [1, 476]}, o($VJ2, $Vt2, {224: 428, 227: 429, 228: 430, 229: 431, 38: 434, 216: 478, 209: 479, 26: $VK2, 31: $V8, 79: $Vc, 172: $VL2, 218: $VL2, 174: $Vv1, 186: $Vu2, 230: $Vv2}), o($VM2, [2, 276]), o($VM2, [2, 277]), o($VN2, [2, 268]), o($VN2, [2, 269]), o($VN2, [2, 270]), {16: 481, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([6, 13, 14, 26, 31, 33, 56, 79, 81, 82, 91, 172, 174, 186, 211, 212, 218, 219, 220, 230, 264, 265], [2, 89]), o($V71, [2, 6]), o($V81, [2, 12]), {6: $V61, 9: 134, 14: [1, 482]}, o($Ve2, [2, 498], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 319: $Vg1, 321: $Vi1}), o($Ve2, [2, 499], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 319: $Vg1, 321: $Vi1}), o($VO2, [2, 500], {292: 116, 295: 117, 284: 151, 290: 152, 319: $Vg1, 321: $Vi1}), o($VO2, [2, 501], {292: 116, 295: 117, 284: 151, 290: 152, 319: $Vg1, 321: $Vi1}), o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 320, 322], [2, 502], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 319: $Vg1, 321: $Vi1}), o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311], [2, 503], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311], [2, 504], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 483, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 157, 160, 170, 175, 182, 186, 188, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311, 322], [2, 506], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 319: $Vg1, 320: $Vh1, 321: $Vi1}), o($VP2, [2, 485], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {138: [1, 484], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($VQ2, [2, 312], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 485, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VP2, [2, 484], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($VC1, [2, 399]), o($VT1, [2, 321]), o($VT1, [2, 322]), {160: [1, 486]}, {142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 160: [2, 343], 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($V52, [2, 308]), o($Vs2, $Vp2, {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {27: [1, 487], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {27: [1, 488], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {35: 489, 53: $Vy1}, {31: [1, 491], 50: 490, 54: $Vz1}, {34: [1, 492]}, {13: $V62, 32: 493, 38: 354, 40: $V72, 55: 352, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, {35: 494, 53: $Vy1}, {34: [1, 495]}, o($Vl2, $Vm2, {57: 498, 33: [1, 496], 56: $VR2}), o($VG2, [2, 55]), {13: $V62, 32: 499, 38: 354, 40: $V72, 55: 352, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, o($VG2, [2, 61], {37: [1, 500]}), o($VG2, [2, 62]), o($VG2, [2, 63]), o($VG2, [2, 65], {37: [1, 501]}), o($VG2, [2, 90]), {38: 502, 79: $Vc}, o($Vl2, $Vm2, {57: 498, 33: [1, 503], 56: $VR2}), {35: 504, 53: $Vy1}, {38: 505, 79: $Vc}, o($V71, [2, 34]), o($V71, [2, 40], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {6: $V61, 9: 508, 130: [1, 506], 136: 507, 137: 370, 140: $Vb2}, o($VS2, [2, 140]), {13: $V92, 128: $Va2, 129: 509, 135: 366, 136: 368, 137: 370, 140: $Vb2}, o($VS2, [2, 144]), {13: [1, 511], 133: 510}, {138: [1, 512]}, {138: [2, 147]}, o($VQ2, [2, 233], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 513, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {33: [1, 514], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($VQ2, [2, 507], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 515, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 516, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VT2, [2, 482]), {5: 517, 12: $V1, 13: $V2, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($Vo1, [2, 428], {279: 518, 280: $Vf2}), o($Vo1, [2, 429]), {5: 520, 12: $V1, 13: $V2, 282: [1, 519]}, {5: 521, 12: $V1, 13: $V2}, {5: 522, 12: $V1, 13: $V2}, {304: 523, 305: 387, 306: $Vg2}, {14: [1, 524], 291: [1, 525], 305: 526, 306: $Vg2}, o($VU2, [2, 475]), {16: 528, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 276: 527, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VV2, [2, 126], {121: 529, 76: 532, 13: [1, 530], 26: [1, 531], 118: $Vs}), {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 533, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vh2, [2, 174]), o($Vh2, [2, 175]), o($Vh2, [2, 176]), o($Vh2, [2, 177]), o($Vh2, [2, 178]), {13: $V92, 128: $Va2, 129: 535, 135: 366, 136: 368, 137: 370, 140: $Vb2, 166: [1, 534]}, {31: $VI1, 125: 538, 165: [1, 536], 170: [1, 537], 171: $VJ1}, o($Vh2, [2, 182]), {31: $VI1, 125: 539, 171: $VJ1}, {31: $VI1, 125: 540, 171: $VJ1}, {31: $VI1, 125: 541, 171: $VJ1}, o($Vh2, [2, 194], {125: 542, 31: $VI1, 171: $VJ1}), {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 92: [1, 543], 93: 544, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 27: [1, 545], 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 546, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 547, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vh2, [2, 195]), o($Vh2, [2, 196]), {177: 548, 181: [1, 549]}, o($Vh2, [2, 171]), o($Vk2, [2, 200]), {16: 550, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {33: [1, 551], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($VC1, [2, 403]), o([6, 13, 27], $Vm2, {57: 552, 56: $Vr2}), o($Vd2, [2, 435], {97: [1, 553]}), o($VW2, $VX2, {65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 43: 29, 44: 30, 76: 31, 232: 32, 22: 35, 23: 36, 196: 45, 243: 46, 63: 47, 64: 48, 246: 49, 221: 51, 195: 52, 114: 53, 248: 54, 60: 55, 203: 56, 204: 57, 205: 58, 237: 68, 45: 69, 307: 70, 284: 72, 288: 73, 290: 74, 252: 76, 189: 78, 228: 85, 227: 86, 95: 88, 42: 102, 86: 107, 123: 108, 38: 109, 80: 110, 239: 111, 292: 116, 295: 117, 88: 123, 98: 124, 17: 199, 19: 202, 16: 554, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 53: $Va, 61: $Vb, 79: $Vc, 81: $Vd, 87: $Ve, 89: $Vf, 91: $Vg, 96: $Vh, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 115: $Vr, 118: $Vs, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 190: $VA, 191: $VB, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 233: $VI, 234: $VJ, 235: $VK, 238: $VL, 244: $VM, 245: $VN, 247: $VO, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 285: $VU, 287: $VV, 289: $VW, 293: $VX, 294: $VY, 303: $VZ, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}), {6: $V61, 9: 555, 13: $VY2}, o($VW2, $Vm2, {57: 557, 56: $Vn2}), {16: 558, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VZ2, [2, 409]), o($VZ2, [2, 410]), {6: $V_2, 9: 560, 13: $V$2, 175: [1, 559]}, o([6, 13, 14, 27, 175], $VX2, {65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 43: 29, 44: 30, 76: 31, 232: 32, 22: 35, 23: 36, 196: 45, 243: 46, 63: 47, 64: 48, 246: 49, 221: 51, 195: 52, 114: 53, 248: 54, 60: 55, 203: 56, 204: 57, 205: 58, 237: 68, 45: 69, 307: 70, 284: 72, 288: 73, 290: 74, 252: 76, 189: 78, 228: 85, 227: 86, 95: 88, 42: 102, 86: 107, 123: 108, 38: 109, 80: 110, 239: 111, 292: 116, 295: 117, 88: 123, 98: 124, 17: 199, 19: 202, 187: 256, 18: 258, 16: 342, 274: 563, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 53: $Va, 61: $Vb, 79: $Vc, 81: $Vd, 87: $Ve, 89: $Vf, 91: $Vg, 96: $Vh, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 115: $Vr, 118: $Vs, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 190: $VA, 191: $VB, 201: $VC, 202: $VD, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 231: $VQ1, 233: $VI, 234: $VJ, 235: $VK, 238: $VL, 244: $VM, 245: $VN, 247: $VO, 253: $VP, 270: $VQ, 271: $VR, 275: $VR1, 277: $VS, 283: $VT, 285: $VU, 287: $VV, 289: $VW, 293: $VX, 294: $VY, 303: $VZ, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}), o($VW2, $Vm2, {57: 564, 56: $Vr2}), o($Vs2, [2, 421], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vs2, [2, 303], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {56: $V03, 210: [1, 565]}, o($V13, [2, 283]), o($V13, [2, 292], {176: [1, 567]}), o($V13, [2, 293], {176: [1, 568]}), o($V13, [2, 294], {176: [1, 569]}), o($V13, [2, 300], {38: 434, 229: 570, 79: $Vc}), {38: 434, 79: $Vc, 229: 571}, o($V23, [2, 301], {10: 572, 11: $VE1}), o($VT2, [2, 479]), {16: 573, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 574, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vy2, [2, 457]), {31: $V8, 38: 277, 79: $Vc, 174: $Vv1, 227: 279, 228: 278, 299: 575}, o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 285, 287, 293, 294, 310], [2, 464], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 286: [1, 576], 302: [1, 577], 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($V33, [2, 465], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 286: [1, 578], 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 359]), {16: 579, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {38: 580, 79: $Vc, 80: 581, 81: $Vd}, {13: $VU1, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 193: 582, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($Vo1, [2, 369]), {6: $V61, 9: 584, 14: [1, 583]}, {15: 452, 18: 453, 38: 461, 42: 457, 58: 459, 76: 454, 79: $Vc, 80: 462, 81: $Vd, 82: $V$1, 90: 455, 94: 450, 118: $Vs, 126: 15, 127: $Vt, 131: $Vm1, 132: $Vn1, 201: $VC, 202: $VD, 211: $VC2, 212: $VH, 255: 585, 256: 449, 257: 451, 258: 458, 259: 460, 264: $VD2, 265: $VE2}, o($V43, [2, 372]), o($V43, [2, 375], {42: 457, 258: 458, 58: 459, 259: 460, 38: 461, 80: 462, 257: 586, 90: 587, 79: $Vc, 81: $Vd, 82: $V$1, 211: $VC2, 212: $VH, 264: $VD2, 265: $VE2}), o($V43, [2, 376]), o($V43, [2, 378]), o($V43, [2, 379]), o($V43, [2, 380]), o($V53, [2, 97]), {38: 461, 42: 457, 79: $Vc, 80: 462, 81: $Vd, 211: $VC2, 212: $VH, 257: 588, 258: 458, 259: 460, 264: $VD2, 265: $VE2}, o($V43, [2, 382]), o($V43, [2, 383], {82: [1, 590], 170: [1, 589]}), o($V53, [2, 94], {91: [1, 591]}), o($V63, [2, 385], {260: 592, 10: 593, 11: $VE1, 176: [1, 594], 263: [1, 595]}), o($V73, [2, 393]), o($V73, [2, 394]), {38: 596, 79: $Vc}, {38: 597, 79: $Vc}, o($Vo1, [2, 225]), {124: $VV1, 192: 598}, {6: $V61, 9: 600, 13: $V83, 33: [1, 599]}, o([6, 13, 14, 33], $VX2, {88: 123, 98: 124, 42: 293, 198: 294, 199: 296, 18: 297, 95: 300, 38: 301, 80: 302, 84: 303, 197: 602, 53: $Va, 79: $Vc, 81: $Vd, 85: $VX1, 89: $Vf, 91: $VY1, 96: $Vh, 99: $Vi, 174: $VZ1, 186: $V_1, 201: $VC, 202: $VD, 212: $VH}), {13: [1, 604], 16: 603, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: [1, 606], 16: 605, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 175: [1, 607], 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {92: [1, 608], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($V22, [2, 109]), {104: [1, 609], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {38: 314, 58: 315, 79: $Vc, 80: 316, 81: $Vd, 82: $V$1, 174: $V02, 215: 610}, o($V93, [2, 266]), o($V93, [2, 267]), {217: 611, 219: $Va3, 220: $Vb3}, o($Vc3, [2, 264], {56: $V03}), o([27, 56], $Vt2, {224: 428, 227: 429, 228: 430, 229: 431, 38: 434, 209: 614, 31: $V8, 79: $Vc, 174: $Vv1, 186: $Vu2, 230: $Vv2}), {142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 175: [1, 615], 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($V81, [2, 13]), o($Vc2, [2, 505], {292: 116, 295: 117, 284: 151, 290: 152, 321: $Vi1}), {16: 616, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {6: $V61, 9: 618, 14: $Vd3, 78: 617, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($VT1, [2, 323]), o($Vx1, [2, 25]), o($Vx1, [2, 27]), o($V71, [2, 45]), {34: [1, 620]}, {13: $V62, 32: 621, 38: 354, 40: $V72, 55: 352, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, {35: 622, 53: $Vy1}, o($Vl2, $Vm2, {57: 498, 33: [1, 623], 56: $VR2}), o($V71, [2, 47]), {35: 624, 53: $Vy1}, {34: [1, 625]}, o($VW2, $VX2, {38: 354, 58: 355, 59: 356, 55: 626, 40: $V72, 79: $Vc, 82: $V$1, 83: $V82}), {6: $Ve3, 13: $Vf3}, o($VW2, $Vm2, {57: 629, 56: $VR2}), {38: 630, 79: $Vc}, {38: 631, 79: $Vc}, {34: [2, 54]}, o($V71, [2, 29], {34: [1, 632]}), o($V71, [2, 31]), {34: [1, 633]}, o($V71, [2, 133]), o($VS2, [2, 141]), {128: $Va2, 135: 634, 136: 368, 137: 370, 140: $Vb2}, {6: $V61, 9: 636, 14: $Vd3, 78: 635, 136: 507, 137: 370, 140: $Vb2}, {130: [1, 637]}, {13: $V92, 128: $Va2, 129: 638, 135: 366, 136: 368, 137: 370, 140: $Vb2}, {31: $Vg3, 35: 647, 53: $Vy1, 96: $Vh3, 139: 639, 145: 640, 146: 641, 149: 648, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}, {6: $V61, 9: 618, 14: $Vd3, 78: 653, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($VS1, [2, 124]), {6: $V61, 9: 618, 14: $Vd3, 78: 654, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {5: 655, 12: $V1, 13: $V2, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($VT2, [2, 481]), o($Vo1, [2, 430]), {5: 656, 12: $V1, 13: $V2}, o($Vp3, [2, 433]), o($Vo1, [2, 431]), o($Vo1, [2, 451]), {14: [1, 657], 291: [1, 658], 305: 526, 306: $Vg2}, o($Vo1, [2, 473]), {5: 659, 12: $V1, 13: $V2}, o($VU2, [2, 476]), {5: 660, 12: $V1, 13: $V2, 56: [1, 661]}, o($Vq3, [2, 425], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 127]), {13: $Vr3, 14: [1, 662], 16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 183: 663, 184: 664, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: $Vr3, 16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 183: 671, 184: 664, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 208]), o($Vl2, $Vm2, {57: 673, 56: $Vr2, 160: [1, 672]}), o($Vh2, [2, 179]), {6: $V61, 9: 508, 136: 507, 137: 370, 140: $Vb2, 166: [1, 674]}, {13: $V92, 128: $Va2, 129: 675, 135: 366, 136: 368, 137: 370, 140: $Vb2}, {171: [1, 676]}, o($Vh2, [2, 186], {31: $Vi2, 171: $Vj2}), o($Vh2, [2, 183], {31: $Vi2, 171: $Vj2}), o($Vh2, [2, 184], {31: $Vi2, 171: $Vj2}), o($Vh2, [2, 187], {31: $Vi2, 171: $Vj2}), o($Vh2, [2, 188], {31: $Vi2, 171: $Vj2}), o($Vh2, [2, 189]), o($Vl2, $Vm2, {57: 673, 56: $Vr2, 92: [1, 677]}), o($Vh2, [2, 191]), o($Vl2, $Vm2, {57: 673, 27: [1, 678], 56: $Vr2}), o($Vl2, $Vm2, {57: 673, 56: $Vr2, 175: [1, 679]}), o($Vh2, [2, 197]), {16: 680, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {33: [1, 681], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($Vk2, [2, 199]), {6: $V_2, 9: 560, 13: $V$2, 27: [1, 682]}, o($Vd2, [2, 436]), o($Vo2, [2, 351], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 683, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: $VM1, 16: 248, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 251: 684, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {6: $V61, 9: 686, 13: $VY2, 14: $Vd3, 78: 685}, {142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 175: [1, 687], 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($Vq2, [2, 408]), {16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 688, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([14, 24, 25, 28, 29, 31, 53, 61, 79, 81, 87, 89, 91, 96, 99, 105, 106, 107, 108, 109, 110, 111, 112, 115, 118, 131, 132, 143, 144, 172, 174, 186, 190, 191, 201, 202, 206, 207, 211, 212, 231, 233, 234, 235, 238, 244, 245, 247, 253, 270, 271, 275, 277, 283, 285, 287, 289, 293, 294, 303, 308, 312, 313, 314, 315, 316, 317, 318], $V32, {185: [1, 689]}), {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 93: 690, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vs2, [2, 413]), {6: $V_2, 9: 692, 13: $V$2, 14: $Vd3, 78: 691}, {5: 693, 12: $V1, 13: $V2}, {31: $V8, 38: 434, 79: $Vc, 174: $Vv1, 186: $Vu2, 224: 694, 227: 429, 228: 430, 229: 431, 230: $Vv2}, {16: 696, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 226: 695, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 696, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 226: 697, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 696, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 226: 698, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($V13, [2, 295]), o($V13, [2, 296]), o($V23, [2, 302]), o($Vx2, [2, 439], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vx2, [2, 441], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vy2, [2, 462], {56: [1, 699]}), {16: 700, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 701, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 702, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([1, 6, 12, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 286, 294, 302, 310], [2, 362], {292: 116, 295: 117, 284: 151, 290: 152, 193: 703, 13: $VU1, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($VB2, [2, 367]), o($VB2, [2, 368]), o($Vo1, [2, 364]), o($Vo1, [2, 370]), o($V43, [2, 374], {126: 15, 94: 450, 257: 451, 15: 452, 18: 453, 76: 454, 90: 455, 42: 457, 258: 458, 58: 459, 259: 460, 38: 461, 80: 462, 256: 704, 79: $Vc, 81: $Vd, 82: $V$1, 118: $Vs, 127: $Vt, 131: $Vm1, 132: $Vn1, 201: $VC, 202: $VD, 211: $VC2, 212: $VH, 264: $VD2, 265: $VE2}), {6: $V61, 9: 584, 14: [1, 705]}, o($V43, [2, 377]), o($V53, [2, 98]), o($V43, [2, 381]), {5: 707, 12: $V1, 13: $V2, 16: 708, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 261: 706, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {5: 707, 12: $V1, 13: $V2, 16: 708, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 261: 709, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {13: $VN1, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 92: [1, 710], 93: 711, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 253, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 712, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($V73, [2, 397]), o($VZ2, [2, 391]), o($VZ2, [2, 392]), o($V73, [2, 395]), o($V73, [2, 396]), o($VV2, [2, 226], {193: 713, 13: $VU1}), o($Vq2, [2, 344]), {18: 297, 38: 301, 42: 293, 53: $Va, 79: $Vc, 80: 302, 81: $Vd, 84: 303, 85: $VX1, 88: 123, 89: $Vf, 91: $VY1, 95: 300, 96: $Vh, 98: 124, 99: $Vi, 174: $VZ1, 186: $V_1, 197: 714, 198: 294, 199: 296, 201: $VC, 202: $VD, 212: $VH}, o([6, 13, 14, 56], $VW1, {88: 123, 98: 124, 197: 292, 42: 293, 198: 294, 199: 296, 18: 297, 95: 300, 38: 301, 80: 302, 84: 303, 250: 715, 53: $Va, 79: $Vc, 81: $Vd, 85: $VX1, 89: $Vf, 91: $VY1, 96: $Vh, 99: $Vi, 174: $VZ1, 186: $V_1, 201: $VC, 202: $VD, 212: $VH}), o($VG2, [2, 347]), o($VG2, [2, 238], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 716, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VG2, [2, 240], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 717, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VH2, [2, 247]), o($VH2, [2, 248]), o($V22, [2, 110]), o($VJ2, $Vt2, {224: 428, 227: 429, 228: 430, 229: 431, 38: 434, 209: 479, 216: 718, 26: $VK2, 31: $V8, 79: $Vc, 174: $Vv1, 186: $Vu2, 230: $Vv2}), o($Vo1, [2, 263]), {5: 719, 12: $V1, 13: $V2, 207: [1, 720]}, o($Vo1, [2, 274]), {27: [1, 721], 56: $V03}, o($VN2, [2, 271]), o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 285, 286, 287, 293, 294, 302, 310, 311], [2, 486], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 313]), {14: $Vu3}, o($Vv3, [2, 419]), {35: 723, 53: $Vy1}, o($Vl2, $Vm2, {57: 498, 33: [1, 724], 56: $VR2}), o($V71, [2, 46]), {34: [1, 725]}, o($V71, [2, 48]), {35: 726, 53: $Vy1}, o($VG2, [2, 56]), {38: 354, 40: $V72, 55: 727, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, {13: $V62, 32: 728, 38: 354, 40: $V72, 55: 352, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, {6: [1, 730], 13: $Vf3, 14: [1, 729]}, o($VG2, [2, 64]), o($VG2, [2, 66]), {35: 731, 53: $Vy1}, {35: 732, 53: $Vy1}, o($VS2, [2, 142]), o($VS2, [2, 143]), {14: $Vu3, 128: $Va2, 135: 634, 136: 368, 137: 370, 140: $Vb2}, o($VS2, [2, 145]), {6: $V61, 9: 636, 14: $Vd3, 78: 733, 136: 507, 137: 370, 140: $Vb2}, o($VS2, [2, 146], {56: $Vw3}), o($Vx3, [2, 151], {35: 647, 149: 648, 141: 735, 146: 736, 31: $Vg3, 53: $Vy1, 96: $Vh3, 142: $Vy3, 143: $Vz3, 144: $VA3, 147: $VB3, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}), o($VC3, [2, 153]), o($VC3, [2, 160]), o($VC3, [2, 161]), o($VC3, [2, 162]), o($VC3, [2, 163]), o($VC3, [2, 164]), o($VC3, [2, 165]), o($VC3, [2, 166], {150: [1, 741]}), o($VC3, [2, 167]), o($VC3, [2, 169], {91: [1, 742]}), {31: $Vg3, 35: 647, 53: $Vy1, 96: $Vh3, 146: 743, 149: 648, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}, {16: 744, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 234]), o($Vo1, [2, 508]), o($VT2, [2, 480]), o($Vp3, [2, 432]), o($Vo1, [2, 471]), {5: 745, 12: $V1, 13: $V2}, {14: [1, 746]}, o($VU2, [2, 477], {6: [1, 747]}), {16: 748, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($Vo1, [2, 205]), o($Vl2, $Vm2, {57: 751, 14: [1, 749], 56: $VD3}), o($VE3, [2, 209]), {13: $Vr3, 16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 183: 752, 184: 664, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VE3, [2, 215], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), {16: 753, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VE3, [2, 217]), o($VE3, [2, 218]), o($VE3, [2, 219]), o($Vl2, $Vm2, {57: 751, 27: [1, 754], 56: $VD3}), o($Vh2, [2, 173]), {6: $V_2, 9: 560, 13: $V$2}, o($Vh2, [2, 180]), {6: $V61, 9: 508, 136: 507, 137: 370, 140: $Vb2, 166: [1, 755]}, o($Vh2, [2, 185]), o($Vh2, [2, 190]), o($Vh2, [2, 192]), o($Vh2, [2, 193]), {142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 182: [1, 756], 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, o($Vk2, [2, 201]), o($VC1, [2, 404]), o($Vo2, [2, 352], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($VW2, $Vm2, {57: 757, 56: $Vn2}), o($Vo2, [2, 353]), {14: $Vu3, 16: 683, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VC1, [2, 411]), o($Vs2, [2, 414]), {6: $V61, 9: 758}, o($VW2, $Vm2, {57: 759, 56: $Vr2}), o($Vs2, [2, 416]), {14: $Vu3, 16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 688, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($VC1, [2, 258]), o($V13, [2, 284]), o($V13, [2, 298]), o($V13, [2, 291], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($V13, [2, 299]), o($V13, [2, 297]), {31: $V8, 38: 277, 79: $Vc, 174: $Vv1, 227: 279, 228: 278, 299: 760}, o([1, 6, 12, 13, 14, 27, 33, 56, 82, 92, 104, 138, 160, 170, 175, 182, 186, 210, 219, 220, 273, 285, 286, 287, 293, 294, 310], [2, 466], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 302: [1, 761], 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($V33, [2, 468], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 286: [1, 762], 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($VQ2, [2, 467], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 363]), o($V43, [2, 373]), o($Vo1, [2, 371]), o($V63, [2, 386]), o($V63, [2, 389]), o($V63, [2, 390], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($V63, [2, 387]), o($V53, [2, 95]), o($Vl2, $Vm2, {57: 673, 56: $Vr2, 92: [1, 763]}), o($V63, [2, 384], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 227]), o($VG2, [2, 348]), o($VW2, $Vm2, {57: 764, 56: $VF2}), {6: $V61, 9: 618, 14: $Vd3, 78: 765, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {6: $V61, 9: 618, 14: $Vd3, 78: 766, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {217: 767, 219: $Va3, 220: $Vb3}, o($Vo1, [2, 272]), {5: 768, 12: $V1, 13: $V2}, o($Vc3, [2, 265]), o($Vv3, [2, 418]), o($V71, [2, 51]), {34: [1, 769]}, {35: 770, 53: $Vy1}, o($V71, [2, 49]), o($VG2, [2, 57]), o($VW2, $Vm2, {57: 771, 56: $VR2}), o($VG2, [2, 58]), {14: [1, 772], 38: 354, 40: $V72, 55: 727, 58: 355, 59: 356, 79: $Vc, 82: $V$1, 83: $V82}, o($V71, [2, 30]), o($V71, [2, 32]), {130: [2, 137]}, {31: $Vg3, 35: 647, 53: $Vy1, 96: $Vh3, 145: 773, 146: 641, 149: 648, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}, o($VC3, [2, 154]), o($VC3, [2, 155]), {31: $Vg3, 35: 647, 53: $Vy1, 96: $Vh3, 146: 774, 149: 648, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}, o($VC3, [2, 148]), o($VC3, [2, 149]), o($VC3, [2, 150]), o($VF3, [2, 159]), {31: $Vg3, 35: 647, 53: $Vy1, 96: $Vh3, 139: 775, 145: 640, 146: 641, 149: 648, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}, o($VC3, [2, 170]), {33: [1, 776], 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 284: 151, 285: $VU, 287: $VV, 290: 152, 292: 116, 293: $VX, 294: $VY, 295: 117, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}, {6: $V61, 9: 618, 14: $Vd3, 78: 777}, o($Vo1, [2, 474]), o($VU2, [2, 478]), o($Vq3, [2, 426], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 206]), o($VW2, $VX2, {65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 43: 29, 44: 30, 76: 31, 232: 32, 22: 35, 23: 36, 196: 45, 243: 46, 63: 47, 64: 48, 246: 49, 221: 51, 195: 52, 114: 53, 248: 54, 60: 55, 203: 56, 204: 57, 205: 58, 237: 68, 45: 69, 307: 70, 284: 72, 288: 73, 290: 74, 252: 76, 189: 78, 228: 85, 227: 86, 95: 88, 42: 102, 86: 107, 123: 108, 38: 109, 80: 110, 239: 111, 292: 116, 295: 117, 88: 123, 98: 124, 17: 199, 19: 202, 16: 666, 187: 668, 18: 670, 184: 778, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 53: $Va, 61: $Vb, 79: $Vc, 81: $Vd, 87: $Ve, 89: $Vf, 91: $Vg, 96: $Vh, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 115: $Vr, 118: $Vs, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $Vs3, 188: $Vt3, 190: $VA, 191: $VB, 201: $VC, 202: $VD, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 231: $VQ1, 233: $VI, 234: $VJ, 235: $VK, 238: $VL, 244: $VM, 245: $VN, 247: $VO, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 285: $VU, 287: $VV, 289: $VW, 293: $VX, 294: $VY, 303: $VZ, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}), {6: $VG3, 9: 779, 13: $VH3}, o($VW2, $Vm2, {57: 782, 56: $VD3}), o($VE3, [2, 216], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 285: $VU, 287: $VV, 293: $VX, 294: $VY, 310: $Ve1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($Vo1, [2, 207]), o($Vh2, [2, 181]), o($Vh2, [2, 204]), {6: $V61, 9: 686, 13: $VY2, 14: $Vd3, 78: 783}, {16: 342, 17: 199, 18: 258, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 186: $VP1, 187: 256, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 274: 784, 275: $VR1, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {6: $V_2, 9: 692, 13: $V$2, 14: $Vd3, 78: 785}, o($Vy2, [2, 463]), {16: 786, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 787, 17: 199, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o($V53, [2, 96]), {6: $V61, 9: 789, 13: $V83, 14: $Vd3, 78: 788}, o($VG2, [2, 239]), o($VG2, [2, 241]), o($Vo1, [2, 262]), o($Vo1, [2, 273]), {35: 790, 53: $Vy1}, o($V71, [2, 50]), {6: $Ve3, 13: $Vf3, 14: [1, 791]}, o($VG2, [2, 59]), o($Vx3, [2, 152], {35: 647, 149: 648, 141: 735, 146: 736, 31: $Vg3, 53: $Vy1, 96: $Vh3, 142: $Vy3, 143: $Vz3, 144: $VA3, 147: $VB3, 151: $Vi3, 152: $Vj3, 153: $Vk3, 154: $Vl3, 155: $Vm3, 156: $Vn3, 157: $Vo3}), o($VC3, [2, 156]), {56: $Vw3, 92: [1, 792]}, o($VF3, [2, 158]), o($Vo1, [2, 472]), o($VE3, [2, 210]), {16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 184: 793, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, o([14, 24, 25, 28, 29, 31, 53, 61, 79, 81, 87, 89, 91, 96, 99, 105, 106, 107, 108, 109, 110, 111, 112, 115, 118, 131, 132, 143, 144, 172, 174, 186, 188, 190, 191, 201, 202, 206, 207, 211, 212, 231, 233, 234, 235, 238, 244, 245, 247, 253, 270, 271, 277, 283, 285, 287, 289, 293, 294, 303, 308, 312, 313, 314, 315, 316, 317, 318], $V32, {185: [1, 794]}), {13: $Vr3, 16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 183: 795, 184: 664, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {6: $VG3, 9: 797, 13: $VH3, 14: $Vd3, 78: 796}, o($Vo2, [2, 354]), o($Vs2, [2, 415]), o($Vs2, [2, 417]), o($VQ2, [2, 469], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($VQ2, [2, 470], {292: 116, 295: 117, 284: 151, 290: 152, 142: $V91, 143: $Va1, 144: $Vb1, 157: $Vc1, 188: $Vd1, 311: $Vf1, 319: $Vg1, 320: $Vh1, 321: $Vi1, 322: $Vj1}), o($VG2, [2, 349]), {14: $Vu3, 18: 297, 38: 301, 42: 293, 53: $Va, 79: $Vc, 80: 302, 81: $Vd, 84: 303, 85: $VX1, 88: 123, 89: $Vf, 91: $VY1, 95: 300, 96: $Vh, 98: 124, 99: $Vi, 174: $VZ1, 186: $V_1, 197: 714, 198: 294, 199: 296, 201: $VC, 202: $VD, 212: $VH}, o($V71, [2, 52]), o($VG2, [2, 60]), o($VC3, [2, 168]), o($VE3, [2, 211]), {6: $V61, 9: 798}, o($VW2, $Vm2, {57: 799, 56: $VD3}), o($VE3, [2, 213]), {14: $Vu3, 16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 184: 793, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {16: 666, 17: 199, 18: 670, 19: 202, 22: 35, 23: 36, 24: $V3, 25: $V4, 28: $V5, 29: $V6, 31: $V8, 38: 109, 42: 102, 43: 29, 44: 30, 45: 69, 53: $Va, 60: 55, 61: $Vb, 63: 47, 64: 48, 65: 18, 66: 19, 67: 20, 68: 21, 69: 22, 70: 23, 71: 24, 72: 25, 73: 26, 74: 27, 75: 28, 76: 31, 79: $Vc, 80: 110, 81: $Vd, 86: 107, 87: $Ve, 88: 123, 89: $Vf, 91: $Vg, 95: 88, 96: $Vh, 98: 124, 99: $Vi, 105: $Vj, 106: $Vk, 107: $Vl, 108: $Vm, 109: $Vn, 110: $Vo, 111: $Vp, 112: $Vq, 114: 53, 115: $Vr, 118: $Vs, 123: 108, 131: $VA1, 132: $VB1, 143: $Vw, 144: $Vx, 172: $Vy, 174: $Vz, 184: 800, 186: $Vs3, 187: 668, 188: $Vt3, 189: 78, 190: $VA, 191: $VB, 195: 52, 196: 45, 201: $VC, 202: $VD, 203: 56, 204: 57, 205: 58, 206: $VE, 207: $VF, 211: $VG, 212: $VH, 221: 51, 227: 86, 228: 85, 231: $VQ1, 232: 32, 233: $VI, 234: $VJ, 235: $VK, 237: 68, 238: $VL, 239: 111, 243: 46, 244: $VM, 245: $VN, 246: 49, 247: $VO, 248: 54, 252: 76, 253: $VP, 270: $VQ, 271: $VR, 277: $VS, 283: $VT, 284: 72, 285: $VU, 287: $VV, 288: 73, 289: $VW, 290: 74, 292: 116, 293: $VX, 294: $VY, 295: 117, 303: $VZ, 307: 70, 308: $V_, 312: $V$, 313: $V01, 314: $V11, 315: $V21, 316: $V31, 317: $V41, 318: $V51}, {6: $VG3, 9: 797, 13: $VH3, 14: $Vd3, 78: 801}, o($VE3, [2, 212]), o($VE3, [2, 214])],
      defaultActions: {136: [2, 3], 171: [2, 402], 371: [2, 147], 502: [2, 54], 733: [2, 137]},
      parseError: function parseError(str, hash) {
        if (hash.recoverable) {
          this.trace(str);
        } else {
          throw new Error(str);
        }
      },
      parse: function parse3(input, script = null) {
        var self2 = this, stack = [0], tstack2 = [], vstack = [null], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF2 = 1;
        var lexer22 = Object.create(this.lexer);
        var yy = this.yy;
        lexer22.setInput(input, yy);
        if (typeof yy.parseError === "function") {
          this.parseError = yy.parseError;
        } else {
          this.parseError = Object.getPrototypeOf(this).parseError;
        }
        function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
        }
        var symbol3, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
        function handleError() {
          var error_rule_depth;
          var errStr = "";
          function locateNearestErrorRecoveryRule(state2) {
            var stack_probe = stack.length - 1;
            var depth = 0;
            for (; ; ) {
              if (TERROR.toString() in table[state2]) {
                return depth;
              }
              if (state2 === 0 || stack_probe < 2) {
                return false;
              }
              stack_probe -= 2;
              state2 = stack[stack_probe];
              ++depth;
            }
          }
          if (!recovering) {
            error_rule_depth = locateNearestErrorRecoveryRule(state);
            expected = [];
            var tsym = lexer22.yytext;
            var tok = self2.terminals_[symbol3] || symbol3;
            var tloc = tsym ? tsym._loc : -1;
            var tend = tloc > -1 ? tloc + tsym._len : -1;
            var tpos = tloc != -1 ? "[" + tsym._loc + ":" + tsym._len + "]" : "[0:0]";
            if (lexer22.showPosition) {
              errStr = "Parse error at " + tpos + ":\n" + lexer22.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + tok + "'";
            } else {
              errStr = "Unexpected " + (symbol3 == EOF2 ? "end of input" : "'" + tok + "'");
            }
            if (script) {
              let err = script.addDiagnostic("error", {
                message: errStr,
                source: "imba-parser",
                range: script.rangeAt(tloc, tend)
              });
              err.raise();
            }
            self2.parseError(errStr, {
              lexer: lexer22,
              text: lexer22.match,
              token: tok,
              offset: tloc,
              length: tend - tloc,
              start: {offset: tloc},
              end: {offset: tend},
              line: lexer22.yylineno,
              expected,
              recoverable: error_rule_depth !== false
            });
          } else if (preErrorSymbol !== EOF2) {
            error_rule_depth = locateNearestErrorRecoveryRule(state);
          }
          if (recovering == 3) {
            if (symbol3 === EOF2 || preErrorSymbol === EOF2) {
              throw new Error(errStr || "Parsing halted while starting to recover from another error.");
            }
            yytext = lexer22.yytext;
          }
          if (error_rule_depth === false) {
            throw new Error(errStr || "Parsing halted. No suitable error recovery rule available.");
          }
          popStack(error_rule_depth);
          preErrorSymbol = symbol3 == TERROR ? null : symbol3;
          symbol3 = TERROR;
          state = stack[stack.length - 1];
          action = table[state] && table[state][TERROR];
          recovering = 3;
        }
        var __sym = this.symbols_;
        var __prod = this.productions_;
        while (true) {
          state = stack[stack.length - 1];
          if (symbol3 === null || typeof symbol3 == "undefined") {
            symbol3 = __sym[lexer22.lex()] || EOF2;
          }
          action = table[state] && table[state][symbol3];
          _handle_error:
            if (typeof action === "undefined" || !action.length || !action[0]) {
              handleError();
            }
          switch (action[0]) {
            case 1:
              stack.push(symbol3);
              stack.push(action[1]);
              vstack.push(lexer22.yytext);
              symbol3 = null;
              if (!preErrorSymbol) {
                yytext = lexer22.yytext;
                if (recovering > 0) {
                  recovering--;
                }
              } else {
                symbol3 = preErrorSymbol;
                preErrorSymbol = null;
              }
              break;
            case 2:
              len = __prod[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              r = this.performAction(yyval, yytext, yy, action[1], vstack);
              if (typeof r !== "undefined") {
                return r;
              }
              while (len > 0) {
                stack.pop();
                stack.pop();
                vstack.pop();
                len--;
              }
              stack.push(__prod[action[1]][0]);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              vstack.push(yyval.$);
              break;
            case 3:
              return true;
          }
        }
        return true;
      }
    };
    function Parser() {
      this.yy = {};
    }
    Parser.prototype = parser4;
    parser4.Parser = Parser;
    return new Parser();
  }();
  if (typeof exports2 !== "undefined") {
    exports2.parser = parser3;
    exports2.Parser = parser3.Parser;
    exports2.parse = function() {
      return parser3.parse.apply(parser3, arguments);
    };
  }
});

// src/compiler/transformers.imba
var require_transformers = __commonJS((exports2) => {
  __export(exports2, {
    extractDependencies: () => extractDependencies,
    resolveDependencies: () => resolveDependencies
  });
  var path = __toModule(require("path"));
  function iter$7(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var sys$14 = Symbol.for("#locations");
  function extractDependencies(code, replacer = null) {
    let deps = {};
    let offset = 0;
    let pre = "/*$path$*/";
    let post = "/*$*/";
    let locs = deps[sys$14] = [];
    while (true) {
      let index = code.indexOf(pre, offset);
      if (index == -1) {
        break;
      }
      ;
      offset = index + pre.length;
      let url = code.substr(offset, 4) == "url(";
      let end = code.indexOf(post, offset);
      let [loff, roff] = url ? [4, 1] : [1, 1];
      if (url) {
        let q = code[offset + loff];
        if (q == '"' || q == "'" && q == code[end - roff]) {
          loff += 1;
          roff += 1;
        }
        ;
      }
      ;
      let part = code.slice(offset, end);
      part = part.slice(loff, -roff);
      locs.push([offset + loff, end - roff, part]);
      deps[part] = part;
    }
    ;
    return deps;
  }
  function resolveDependencies(importer, code, resolver, context = {}) {
    let imp = context.importer || (context.importer = importer);
    context.resolveDir || (context.resolveDir = imp.slice(0, imp.lastIndexOf("/") + 1));
    let outcode = code;
    let deps = extractDependencies(code);
    let locs = deps[sys$14].slice(0).reverse();
    let resolved = Object.assign({}, deps);
    for (let sys$22 = 0, sys$32 = Object.keys(deps), sys$4 = sys$32.length, key, dep; sys$22 < sys$4; sys$22++) {
      key = sys$32[sys$22];
      dep = deps[key];
      let res = null;
      if (resolver instanceof Function) {
        res = resolver(Object.assign({path: key}, context));
      } else if (resolver[key]) {
        res = resolver[key];
      }
      ;
      if (res != null) {
        resolved[key] = res;
      }
      ;
    }
    ;
    for (let sys$5 = 0, sys$6 = iter$7(locs), sys$7 = sys$6.length; sys$5 < sys$7; sys$5++) {
      let [start, end, part] = sys$6[sys$5];
      let replacement = resolved[part];
      outcode = outcode.slice(0, start) + replacement + outcode.slice(end);
    }
    ;
    return outcode;
  }
});

// src/compiler/sourcemap.imba1
var require_sourcemap = __commonJS((exports2) => {
  function iter$7(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  var path = require("path");
  var util4 = require_helpers();
  var VLQ_SHIFT = 5;
  var VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT;
  var VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;
  var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function SourceMap(script, options, file) {
    this._script = script;
    this._options = options || {};
    this._sourcePath = file.sourcePath;
    this._sourceRoot = file.sourceRoot;
    this._targetPath = file.targetPath;
    this._maps = [];
    this._map = "";
    this._js = "";
  }
  exports2.SourceMap = SourceMap;
  SourceMap.prototype.result = function(v) {
    return this._result;
  };
  SourceMap.prototype.setResult = function(v) {
    this._result = v;
    return this;
  };
  SourceMap.prototype.source = function() {
    return this._source;
  };
  SourceMap.prototype.options = function() {
    return this._options;
  };
  SourceMap.prototype.sourceCode = function() {
    return this._script.sourceCode;
  };
  SourceMap.prototype.sourceName = function() {
    return path.basename(this._sourcePath);
  };
  SourceMap.prototype.targetName = function() {
    return path.basename(this._targetPath);
  };
  SourceMap.prototype.sourceFiles = function() {
    return [this.sourceName()];
  };
  SourceMap.prototype.parse = function() {
    var self2 = this;
    var matcher = /\/\*\%([\w\|]*)?\$\*\//;
    var replacer = /^(.*?)\/\*\%([\w\|]*)\$\*\//;
    var prejs = self2._script.js;
    var lines = self2._script.js.split(/\n/g);
    var verbose = self2._options.debug;
    var sourceCode = self2.sourceCode();
    var locmap = util4.locationToLineColMap(sourceCode);
    var append = "";
    self2._locs = [];
    self2._maps = [];
    var pairs = [];
    var groups = {};
    var uniqueGroups = {};
    var match;
    var jsloc = 0;
    for (let i = 0, items = iter$7(lines), len = items.length, line; i < len; i++) {
      line = items[i];
      var col = 0;
      var caret = -1;
      self2._maps[i] = [];
      while (line.match(matcher)) {
        line = line.replace(replacer, function(m, pre, meta) {
          var grp;
          if (meta == "") {
            return pre;
          }
          ;
          let pars = meta.split("|");
          let loc = parseInt(pars[0]);
          let gid = pars[1] && parseInt(pars[1]);
          var lc = locmap[loc];
          if (!lc) {
            return pre;
          }
          ;
          let srcline = lc[0] + 1;
          let srccol = lc[1] + 1;
          if (caret != pre.length) {
            caret = pre.length;
            var mapping = [[srcline, srccol], [i + 1, caret + 1]];
            self2._maps[i].push(mapping);
          }
          ;
          let locpair = [jsloc + caret, loc];
          self2._locs.push(locpair);
          if (gid) {
            if (grp = groups[gid]) {
              grp[1] = locpair[0];
              grp[3] = locpair[1];
              let gstr = grp.join("|");
              if (uniqueGroups[gstr]) {
                groups[gid] = [];
              } else {
                uniqueGroups[gstr] = true;
              }
              ;
            } else {
              groups[gid] = [locpair[0], null, locpair[1], null];
            }
            ;
          }
          ;
          return pre;
        });
      }
      ;
      jsloc += line.length + 1;
      lines[i] = line;
    }
    ;
    self2._script.js = lines.join("\n");
    self2._script.locs = {
      map: locmap,
      generated: self2._locs,
      spans: Object.values(groups)
    };
    if (verbose) {
      for (let i = 0, items = iter$7(self2._script.locs.spans), len = items.length, pair; i < len; i++) {
        pair = items[i];
        if (pair[1] != null) {
          let jsstr = self2._script.js.slice(pair[0], pair[1]).split("\n");
          let imbastr = sourceCode.slice(pair[2], pair[3]).split("\n");
          pair.push(jsstr[0]);
          pair.push(imbastr[0]);
        }
        ;
      }
      ;
      let superMap = {
        0: "\u2080",
        1: "\u2081",
        2: "\u2082",
        3: "\u2083",
        4: "\u2084",
        5: "\u2085",
        6: "\u2086",
        7: "\u2087",
        8: "\u2088",
        9: "\u2089",
        "|": "\u208C"
      };
      let repSuper = function(m, str) {
        return "[" + str + "]";
        let o = "";
        let l = str.length;
        let i = 0;
        while (i < l) {
          o += superMap[str[i++]];
        }
        ;
        return "\u208D" + o + "\u208E";
      };
      self2._script.js = self2._script.js + "\n/*\n" + prejs.replace(/\/\*\%([\w\|]*)?\$\*\//g, repSuper) + "\n*/";
    }
    ;
    return self2;
  };
  SourceMap.prototype.generate = function() {
    this.parse();
    var lastColumn = 1;
    var lastSourceLine = 1;
    var lastSourceColumn = 1;
    var buffer = "";
    for (let lineNumber = 0, items = iter$7(this._maps), len = items.length, line; lineNumber < len; lineNumber++) {
      line = items[lineNumber];
      lastColumn = 1;
      for (let nr = 0, ary = iter$7(line), len2 = ary.length, map2; nr < len2; nr++) {
        map2 = ary[nr];
        if (nr != 0) {
          buffer += ",";
        }
        ;
        var src = map2[0];
        var dest = map2[1];
        buffer += this.encodeVlq(dest[1] - lastColumn);
        lastColumn = dest[1];
        buffer += this.encodeVlq(0);
        buffer += this.encodeVlq(src[0] - lastSourceLine);
        lastSourceLine = src[0];
        buffer += this.encodeVlq(src[1] - lastSourceColumn);
        lastSourceColumn = src[1];
      }
      ;
      buffer += ";";
    }
    ;
    var rel = this._targetPath && path.relative(path.dirname(this._targetPath), this._sourcePath);
    var map = {
      version: 3,
      file: this.sourceName().replace(/\.imba/, ".js") || "",
      sourceRoot: this._sourceRoot || "",
      sources: [rel || this._sourcePath],
      sourcesContent: [this.sourceCode()],
      names: [],
      mappings: buffer,
      maps: this._maps
    };
    this._result = map;
    return this;
  };
  SourceMap.prototype.inlined = function() {
    var str = JSON.stringify(this._result);
    if (typeof btoa == "function") {
      str = btoa(str);
    } else {
      str = new Buffer(str).toString("base64");
    }
    ;
    return "\n/*# sourceMappingURL=data:application/json;base64," + str + "*/";
  };
  SourceMap.prototype.encodeVlq = function(value) {
    var answer = "";
    var signBit = value < 0 ? 1 : 0;
    var nextChunk;
    var valueToEncode = (Math.abs(value) << 1) + signBit;
    while (valueToEncode || !answer) {
      nextChunk = valueToEncode & VLQ_VALUE_MASK;
      valueToEncode = valueToEncode >> VLQ_SHIFT;
      if (valueToEncode) {
        nextChunk |= VLQ_CONTINUATION_BIT;
      }
      ;
      answer += this.encodeBase64(nextChunk);
    }
    ;
    return answer;
  };
  SourceMap.prototype.toJSON = function() {
    return this._result;
  };
  SourceMap.prototype.encodeBase64 = function(value) {
    return BASE64_CHARS[value];
  };
});

// vendor/colors.js
var require_colors = __commonJS((exports2, module2) => {
  var convert = {
    rgb: {channels: 3, labels: "rgb"},
    hsl: {channels: 3, labels: "hsl"},
    hsv: {channels: 3, labels: "hsv"},
    hwb: {channels: 3, labels: "hwb"},
    cmyk: {channels: 4, labels: "cmyk"},
    xyz: {channels: 3, labels: "xyz"},
    lab: {channels: 3, labels: "lab"},
    lch: {channels: 3, labels: "lch"},
    hex: {channels: 1, labels: ["hex"]},
    ansi16: {channels: 1, labels: ["ansi16"]},
    ansi256: {channels: 1, labels: ["ansi256"]},
    hcg: {channels: 3, labels: ["h", "c", "g"]},
    apple: {channels: 3, labels: ["r16", "g16", "b16"]},
    gray: {channels: 1, labels: ["gray"]}
  };
  module2.exports = {conv: convert};
  for (const model of Object.keys(convert)) {
    if (!("channels" in convert[model])) {
      throw new Error("missing channels property: " + model);
    }
    if (!("labels" in convert[model])) {
      throw new Error("missing channel labels property: " + model);
    }
    if (convert[model].labels.length !== convert[model].channels) {
      throw new Error("channel and label counts mismatch: " + model);
    }
    const {channels, labels} = convert[model];
    delete convert[model].channels;
    delete convert[model].labels;
    Object.defineProperty(convert[model], "channels", {value: channels});
    Object.defineProperty(convert[model], "labels", {value: labels});
  }
  convert.rgb.hsl = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let h;
    let s;
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    const l = (min + max) / 2;
    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }
    return [h, s * 100, l * 100];
  };
  convert.rgb.hsv = function(rgb) {
    let rdif;
    let gdif;
    let bdif;
    let h;
    let s;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = 0;
      s = 0;
    } else {
      s = diff / v;
      rdif = diffc(r);
      gdif = diffc(g);
      bdif = diffc(b);
      if (r === v) {
        h = bdif - gdif;
      } else if (g === v) {
        h = 1 / 3 + rdif - bdif;
      } else if (b === v) {
        h = 2 / 3 + gdif - rdif;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return [
      h * 360,
      s * 100,
      v * 100
    ];
  };
  convert.rgb.hwb = function(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    let b = rgb[2];
    const h = convert.rgb.hsl(rgb)[0];
    const w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };
  convert.rgb.cmyk = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const k = Math.min(1 - r, 1 - g, 1 - b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  convert.rgb.xyz = function(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
    g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
    b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
    return [x * 100, y * 100, z * 100];
  };
  convert.rgb.lab = function(rgb) {
    const xyz = convert.rgb.xyz(rgb);
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  };
  convert.hsl.rgb = function(hsl) {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    let t2;
    let t3;
    let val;
    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    const t1 = 2 * l - t2;
    const rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      rgb[i] = val * 255;
    }
    return rgb;
  };
  convert.hsl.hsv = function(hsl) {
    const h = hsl[0];
    let s = hsl[1] / 100;
    let l = hsl[2] / 100;
    let smin = s;
    const lmin = Math.max(l, 0.01);
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    const v = (l + s) / 2;
    const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };
  convert.hsv.rgb = function(hsv) {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;
    const f = h - Math.floor(h);
    const p = 255 * v * (1 - s);
    const q = 255 * v * (1 - s * f);
    const t = 255 * v * (1 - s * (1 - f));
    v *= 255;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };
  convert.hsv.hsl = function(hsv) {
    const h = hsv[0];
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const vmin = Math.max(v, 0.01);
    let sl;
    let l;
    l = (2 - s) * v;
    const lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  };
  convert.hwb.rgb = function(hwb) {
    const h = hwb[0] / 360;
    let wh = hwb[1] / 100;
    let bl = hwb[2] / 100;
    const ratio = wh + bl;
    let f;
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    const i = Math.floor(6 * h);
    const v = 1 - bl;
    f = 6 * h - i;
    if ((i & 1) !== 0) {
      f = 1 - f;
    }
    const n = wh + f * (v - wh);
    let r;
    let g;
    let b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  };
  convert.cmyk.rgb = function(cmyk) {
    const c = cmyk[0] / 100;
    const m = cmyk[1] / 100;
    const y = cmyk[2] / 100;
    const k = cmyk[3] / 100;
    const r = 1 - Math.min(1, c * (1 - k) + k);
    const g = 1 - Math.min(1, m * (1 - k) + k);
    const b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.rgb = function(xyz) {
    const x = xyz[0] / 100;
    const y = xyz[1] / 100;
    const z = xyz[2] / 100;
    let r;
    let g;
    let b;
    r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    g = x * -0.969266 + y * 1.8760108 + z * 0.041556;
    b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
    r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
    g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
    b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.lab = function(xyz) {
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  };
  convert.lab.xyz = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let x;
    let y;
    let z;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;
    const y2 = y ** 3;
    const x2 = x ** 3;
    const z2 = z ** 3;
    y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z *= 108.883;
    return [x, y, z];
  };
  convert.lab.lch = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let h;
    const hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    const c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };
  convert.lch.lab = function(lch) {
    const l = lch[0];
    const c = lch[1];
    const h = lch[2];
    const hr = h / 360 * 2 * Math.PI;
    const a = c * Math.cos(hr);
    const b = c * Math.sin(hr);
    return [l, a, b];
  };
  convert.rgb.ansi16 = function(args, saturation = null) {
    const [r, g, b] = args;
    let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
    value = Math.round(value / 50);
    if (value === 0) {
      return 30;
    }
    let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
    if (value === 2) {
      ansi += 60;
    }
    return ansi;
  };
  convert.hsv.ansi16 = function(args) {
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };
  convert.rgb.ansi256 = function(args) {
    const r = args[0];
    const g = args[1];
    const b = args[2];
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round((r - 8) / 247 * 24) + 232;
    }
    const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi;
  };
  convert.ansi16.rgb = function(args) {
    let color = args % 10;
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }
      color = color / 10.5 * 255;
      return [color, color, color];
    }
    const mult = (~~(args > 50) + 1) * 0.5;
    const r = (color & 1) * mult * 255;
    const g = (color >> 1 & 1) * mult * 255;
    const b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };
  convert.ansi256.rgb = function(args) {
    if (args >= 232) {
      const c = (args - 232) * 10 + 8;
      return [c, c, c];
    }
    args -= 16;
    let rem;
    const r = Math.floor(args / 36) / 5 * 255;
    const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    const b = rem % 6 / 5 * 255;
    return [r, g, b];
  };
  convert.rgb.hex = function(args) {
    const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
    const string2 = integer.toString(16).toUpperCase();
    return "000000".substring(string2.length) + string2;
  };
  convert.hex.rgb = function(args) {
    const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }
    let colorString = match[0];
    if (match[0].length === 3) {
      colorString = colorString.split("").map((char) => {
        return char + char;
      }).join("");
    }
    const integer = parseInt(colorString, 16);
    const r = integer >> 16 & 255;
    const g = integer >> 8 & 255;
    const b = integer & 255;
    return [r, g, b];
  };
  convert.hex.hsl = function(args) {
    return convert.rgb.hsl(convert.hex.rgb(args));
  };
  convert.rgb.hcg = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(Math.max(r, g), b);
    const min = Math.min(Math.min(r, g), b);
    const chroma = max - min;
    let grayscale;
    let hue;
    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }
    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma;
    }
    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };
  convert.hsl.hcg = function(hsl) {
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
    let f = 0;
    if (c < 1) {
      f = (l - 0.5 * c) / (1 - c);
    }
    return [hsl[0], c * 100, f * 100];
  };
  convert.hsv.hcg = function(hsv) {
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const c = s * v;
    let f = 0;
    if (c < 1) {
      f = (v - c) / (1 - c);
    }
    return [hsv[0], c * 100, f * 100];
  };
  convert.hcg.rgb = function(hcg) {
    const h = hcg[0] / 360;
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    if (c === 0) {
      return [g * 255, g * 255, g * 255];
    }
    const pure = [0, 0, 0];
    const hi = h % 1 * 6;
    const v = hi % 1;
    const w = 1 - v;
    let mg = 0;
    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;
      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;
      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;
      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;
      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;
      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }
    mg = (1 - c) * g;
    return [
      (c * pure[0] + mg) * 255,
      (c * pure[1] + mg) * 255,
      (c * pure[2] + mg) * 255
    ];
  };
  convert.hcg.hsv = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    let f = 0;
    if (v > 0) {
      f = c / v;
    }
    return [hcg[0], f * 100, v * 100];
  };
  convert.hcg.hsl = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const l = g * (1 - c) + 0.5 * c;
    let s = 0;
    if (l > 0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1) {
      s = c / (2 * (1 - l));
    }
    return [hcg[0], s * 100, l * 100];
  };
  convert.hcg.hwb = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };
  convert.hwb.hcg = function(hwb) {
    const w = hwb[1] / 100;
    const b = hwb[2] / 100;
    const v = 1 - b;
    const c = v - w;
    let g = 0;
    if (c < 1) {
      g = (v - c) / (1 - c);
    }
    return [hwb[0], c * 100, g * 100];
  };
  convert.apple.rgb = function(apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };
  convert.rgb.apple = function(rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };
  convert.gray.rgb = function(args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };
  convert.gray.hsl = function(args) {
    return [0, 0, args[0]];
  };
  convert.gray.hsv = convert.gray.hsl;
  convert.gray.hwb = function(gray) {
    return [0, 100, gray[0]];
  };
  convert.gray.cmyk = function(gray) {
    return [0, 0, 0, gray[0]];
  };
  convert.gray.lab = function(gray) {
    return [gray[0], 0, 0];
  };
  convert.gray.hex = function(gray) {
    const val = Math.round(gray[0] / 100 * 255) & 255;
    const integer = (val << 16) + (val << 8) + val;
    const string2 = integer.toString(16).toUpperCase();
    return "000000".substring(string2.length) + string2;
  };
  convert.rgb.gray = function(rgb) {
    const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

// src/compiler/styler.imba
var require_styler = __commonJS((exports2) => {
  __export(exports2, {
    Calc: () => Calc,
    Color: () => Color,
    Length: () => Length,
    StyleRule: () => StyleRule,
    StyleTheme: () => StyleTheme,
    TransformMixin: () => TransformMixin,
    Var: () => Var,
    abbreviations: () => abbreviations,
    aliases: () => aliases,
    layouts: () => layouts,
    validTypes: () => validTypes
  });
  var colors2 = __toModule(require_colors());
  function iter$7(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var ThemeInstance = null;
  var ThemeCache = new WeakMap();
  var layouts = {
    group: function(o) {
      o.display = "flex";
      o.jc = "flex-start";
      o.flw = "wrap";
      o["--u_sx"] = "calc(var(--u_cg,0) * 0.5)";
      o["--u_sy"] = "calc(var(--u_rg,0) * 0.5)";
      o.margin = "calc(var(--u_sy) * -1) calc(var(--u_sx) * -1)";
      return o["&>*"] = {margin: "var(--u_sy) var(--u_sx)"};
    },
    vflex: function(o) {
      o.display = "flex";
      return o.fld = "column";
    },
    hflex: function(o) {
      o.display = "flex";
      return o.fld = "row";
    },
    hgrid: function(o) {
      o.display = "grid";
      o.gaf = "column";
      return o.gac = "1fr";
    },
    vgrid: function(o) {
      o.display = "grid";
      return o.gaf = "row";
    }
  };
  var validTypes = {
    ease: "linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|steps\u0192|cubic-bezier\u0192"
  };
  for (let sys$14 = 0, sys$22 = Object.keys(validTypes), sys$6 = sys$22.length, k, v; sys$14 < sys$6; sys$14++) {
    k = sys$22[sys$14];
    v = validTypes[k];
    let o = {};
    for (let sys$32 = 0, sys$4 = iter$7(v.split("|")), sys$5 = sys$4.length; sys$32 < sys$5; sys$32++) {
      let item = sys$4[sys$32];
      o[item] = 1;
    }
    ;
    validTypes[k] = o;
  }
  var aliases = {
    c: "color",
    d: "display",
    pos: "position",
    p: "padding",
    pl: "padding-left",
    pr: "padding-right",
    pt: "padding-top",
    pb: "padding-bottom",
    px: ["pl", "pr"],
    py: ["pt", "pb"],
    m: "margin",
    ml: "margin-left",
    mr: "margin-right",
    mt: "margin-top",
    mb: "margin-bottom",
    mx: ["ml", "mr"],
    my: ["mt", "mb"],
    w: "width",
    h: "height",
    t: "top",
    b: "bottom",
    l: "left",
    r: "right",
    size: ["width", "height"],
    ji: "justify-items",
    jc: "justify-content",
    js: "justify-self",
    j: ["justify-content", "justify-items"],
    ai: "align-items",
    ac: "align-content",
    as: "align-self",
    a: ["align-content", "align-items"],
    jai: ["justify-items", "align-items"],
    jac: ["justify-content", "align-content"],
    jas: ["justify-self", "align-self"],
    ja: ["justify-content", "align-content", "justify-items", "align-items"],
    fl: "flex",
    flf: "flex-flow",
    fld: "flex-direction",
    flb: "flex-basis",
    flg: "flex-grow",
    fls: "flex-shrink",
    flw: "flex-wrap",
    ff: "font-family",
    fs: "font-size",
    fw: "font-weight",
    ts: "text-shadow",
    td: "text-decoration",
    tdl: "text-decoration-line",
    tdc: "text-decoration-color",
    tds: "text-decoration-style",
    tdt: "text-decoration-thickness",
    tdsi: "text-decoration-skip-ink",
    te: "text-emphasis",
    tec: "text-emphasis-color",
    tes: "text-emphasis-style",
    tep: "text-emphasis-position",
    tet: "text-emphasis-thickness",
    tt: "text-transform",
    ta: "text-align",
    va: "vertical-align",
    ls: "letter-spacing",
    lh: "line-height",
    bd: "border",
    bdr: "border-right",
    bdl: "border-left",
    bdt: "border-top",
    bdb: "border-bottom",
    bs: "border-style",
    bsr: "border-right-style",
    bsl: "border-left-style",
    bst: "border-top-style",
    bsb: "border-bottom-style",
    bw: "border-width",
    bwr: "border-right-width",
    bwl: "border-left-width",
    bwt: "border-top-width",
    bwb: "border-bottom-width",
    bc: "border-color",
    bcr: "border-right-color",
    bcl: "border-left-color",
    bct: "border-top-color",
    bcb: "border-bottom-color",
    rd: "border-radius",
    rdtl: "border-top-left-radius",
    rdtr: "border-top-right-radius",
    rdbl: "border-bottom-left-radius",
    rdbr: "border-bottom-right-radius",
    rdt: ["border-top-left-radius", "border-top-right-radius"],
    rdb: ["border-bottom-left-radius", "border-bottom-right-radius"],
    rdl: ["border-top-left-radius", "border-bottom-left-radius"],
    rdr: ["border-top-right-radius", "border-bottom-right-radius"],
    bg: "background",
    bgp: "background-position",
    bgc: "background-color",
    bgr: "background-repeat",
    bgi: "background-image",
    bga: "background-attachment",
    bgs: "background-size",
    bgo: "background-origin",
    bgclip: "background-clip",
    g: "gap",
    rg: "row-gap",
    cg: "column-gap",
    gtr: "grid-template-rows",
    gtc: "grid-template-columns",
    gta: "grid-template-areas",
    gar: "grid-auto-rows",
    gac: "grid-auto-columns",
    gaf: "grid-auto-flow",
    gcg: "grid-column-gap",
    grg: "grid-row-gap",
    ga: "grid-area",
    gr: "grid-row",
    gc: "grid-column",
    gt: "grid-template",
    grs: "grid-row-start",
    gcs: "grid-column-start",
    gre: "grid-row-end",
    gce: "grid-column-end",
    bxs: "box-shadow",
    shadow: "box-shadow",
    of: "overflow",
    ofx: "overflow-x",
    ofy: "overflow-y",
    ofa: "overflow-anchor",
    prefix: "content@before",
    suffix: "content@after",
    x: "x",
    y: "y",
    z: "z",
    rotate: "rotate",
    scale: "scale",
    "scale-x": "scale-x",
    "scale-y": "scale-y",
    "skew-x": "skew-x",
    "skew-y": "skew-y",
    origin: "transform-origin",
    ws: "white-space",
    zi: "z-index",
    pe: "pointer-events",
    us: "user-select",
    o: "opacity",
    tween: "transition"
  };
  var abbreviations = {};
  for (let sys$7 = 0, sys$8 = Object.keys(aliases), sys$9 = sys$8.length, k, v; sys$7 < sys$9; sys$7++) {
    k = sys$8[sys$7];
    v = aliases[k];
    if (typeof v == "string") {
      abbreviations[v] = k;
    }
    ;
  }
  function isNumber(val) {
    if (val._value && val._value._type == "NUMBER" && !val._unit) {
      return true;
    }
    ;
    return false;
  }
  var Color = class {
    constructor(name, h, s, l, a = "100%") {
      this.name = name;
      this.h = h;
      this.s = s;
      this.l = l;
      this.a = a;
    }
    alpha(a = "100%") {
      return new Color(this.name, this.h, this.s, this.l, a);
    }
    clone() {
      return new Color(this.name, this.h, this.s, this.l, this.a);
    }
    mix(other, hw = 0.5, sw = 0.5, lw = 0.5) {
      let h1 = this.h + (other.h - this.h) * hw;
      let s1 = this.s + (other.s - this.s) * sw;
      let l1 = this.l + (other.l - this.l) * lw;
      return new Color(this.name + other.name, h1, s1, l1);
    }
    toString() {
      return "hsla(" + this.h.toFixed(2) + "," + this.s.toFixed(2) + "%," + this.l.toFixed(2) + "%," + this.a + ")";
    }
    c() {
      return this.toString();
    }
  };
  var Length = class {
    static parse(value) {
      let m = String(value).match(/^(\-?[\d\.]+)(\w+|%)?$/);
      if (!m) {
        return null;
      }
      ;
      return new this(parseFloat(m[1]), m[2]);
    }
    constructor(number, unit) {
      this.number = number;
      this.unit = unit;
    }
    valueOf() {
      return this.number;
    }
    toString() {
      return this.number + (this.unit || "");
    }
    clone(num = this.number, u = this.unit) {
      return new Length(num, u);
    }
    rounded() {
      return this.clone(Math.round(this.number));
    }
    c() {
      return this.toString();
    }
    get _unit() {
      return this.unit;
    }
    get _number() {
      return this.number;
    }
  };
  var Var = class {
    constructor(name, fallback) {
      this.name = name;
      this.fallback = fallback;
    }
    c() {
      return this.fallback ? "var(--" + this.name + "," + (this.fallback.c ? this.fallback.c() : String(this.fallback)) + ")" : "var(--" + this.name + ")";
    }
  };
  var Calc = class {
    constructor(expr) {
      this.expr = expr;
    }
    cpart(parts) {
      let out = "(";
      for (let sys$10 = 0, sys$11 = iter$7(parts), sys$122 = sys$11.length; sys$10 < sys$122; sys$10++) {
        let part = sys$11[sys$10];
        if (typeof part == "string") {
          out += " " + part + " ";
        } else if (typeof part == "number") {
          out += part;
        } else if (part.c instanceof Function) {
          out += part.c();
        } else if (part instanceof Array) {
          out += this.cpart(part);
        }
        ;
      }
      ;
      out += ")";
      return out;
    }
    c() {
      return "calc" + this.cpart(this.expr);
    }
  };
  var defaultPalette = {
    current: {string: "currentColor"},
    transparent: new Color("transparent", 0, 0, 100, "0%"),
    clear: new Color("transparent", 100, 100, 100, "0%"),
    black: new Color("black", 0, 0, 0, "100%"),
    white: new Color("white", 0, 0, 100, "100%")
  };
  function parseColorString(str) {
    let m;
    if (m = str.match(/hsl\((\d+), *(\d+\%), *(\d+\%?)/)) {
      let h = parseInt(m[1]);
      let s = parseInt(m[2]);
      let l = parseInt(m[3]);
      return [h, s, l];
    } else if (str[0] == "#") {
      return colors2.conv.rgb.hsl(colors2.conv.hex.rgb(str));
    }
    ;
  }
  function parseColors(palette, colors3) {
    for (let sys$132 = 0, sys$14 = Object.keys(colors3), sys$18 = sys$14.length, name, variations; sys$132 < sys$18; sys$132++) {
      name = sys$14[sys$132];
      variations = colors3[name];
      for (let sys$15 = 0, sys$16 = Object.keys(variations), sys$17 = sys$16.length, subname, raw; sys$15 < sys$17; sys$15++) {
        subname = sys$16[sys$15];
        raw = variations[subname];
        let path = name + subname;
        if (palette[raw]) {
          palette[path] = palette[raw];
        } else {
          let [h, s, l] = parseColorString(raw);
          let color = palette[path] = new Color(path, h, s, l, "100%");
        }
        ;
      }
      ;
    }
    ;
    return palette;
  }
  parseColors(defaultPalette, colors);
  var VALID_CSS_UNITS = "cm mm Q in pc pt px em ex ch rem vw vh vmin vmax % s ms fr deg rad grad turn Hz kHz".split(" ");
  var StyleTheme = class {
    static instance() {
      return ThemeInstance || (ThemeInstance = new this());
    }
    static propAbbr(name) {
      return abbreviations[name] || name;
    }
    static wrap(config) {
      if (!config) {
        return this.instance();
      }
      ;
      let theme3 = ThemeCache.get(config);
      if (!theme3) {
        ThemeCache.set(config, theme3 = new this(config));
      }
      ;
      return theme3;
    }
    constructor(ext = {}) {
      this.options = theme_exports;
      this.palette = Object.assign({}, defaultPalette);
      if (ext.theme && ext.theme.colors) {
        parseColors(this.palette, ext.theme.colors);
      }
      ;
    }
    expandProperty(name) {
      return aliases[name] || void 0;
    }
    expandValue(value, config) {
      if (value == void 0) {
        value = config.default;
      }
      ;
      if (config.hasOwnProperty(value)) {
        value = config[value];
      }
      ;
      if (typeof value == "number" && config.NUMBER) {
        let [step, num, unit] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/);
        return value * parseFloat(num) + unit;
      }
      ;
      return value;
    }
    paddingX([l, r = l]) {
      return {"padding-left": l, "padding-right": r};
    }
    paddingY([t, b = t]) {
      return {"padding-top": t, "padding-bottom": b};
    }
    marginX([l, r = l]) {
      return {"margin-left": l, "margin-right": r};
    }
    marginY([t, b = t]) {
      return {"margin-top": t, "margin-bottom": b};
    }
    inset([t, r = t, b = t, l = r]) {
      return {top: t, right: r, bottom: b, left: l};
    }
    size([w, h = w]) {
      return {width: w, height: h};
    }
    grid(params) {
      let m;
      if (m = this.$varFallback("grid", params)) {
        return m;
      }
      ;
      return;
    }
    animation(...params) {
      let valids = {
        normal: 1,
        reverse: 1,
        alternate: 1,
        "alternate-reverse": 1,
        infinite: 2,
        none: 3,
        forwards: 3,
        backwards: 3,
        both: 3,
        running: 4,
        paused: 4
      };
      let used = {};
      for (let k = 0, sys$19 = iter$7(params), sys$22 = sys$19.length; k < sys$22; k++) {
        let anim = sys$19[k];
        let name = null;
        let ease = null;
        for (let i = 0, sys$20 = iter$7(anim), sys$21 = sys$20.length; i < sys$21; i++) {
          let part = sys$20[i];
          let str = String(part);
          let typ = valids[str];
          if (validTypes.ease[str] && !ease) {
            ease = true;
          } else if (typ) {
            if (used[typ]) {
              name = [i, str];
            }
            ;
            used[typ] = true;
          } else if (str.match(/^[^\d\.]/) && str.indexOf("(") == -1) {
            if (name) {
              ease = [i, str];
            } else {
              name = [i, str];
            }
            ;
          }
          ;
        }
        ;
        if (name) {
          anim[name[0]] = new Var("animation-" + name[1], name[1]);
        }
        ;
        if (ease instanceof Array) {
          let fallback = this.options.variants.easings[ease[1]];
          anim[ease[0]] = new Var("ease-" + ease[1], fallback);
        }
        ;
      }
      ;
      return {animation: params};
    }
    animationTimingFunction(...params) {
      for (let i = 0, sys$23 = iter$7(params), sys$24 = sys$23.length; i < sys$24; i++) {
        let param = sys$23[i];
        let fb = this.$varFallback("ease", param);
        if (fb) {
          params[i] = fb;
        }
        ;
      }
      ;
      return params;
    }
    animationName(...params) {
      let m;
      for (let i = 0, sys$25 = iter$7(params), sys$26 = sys$25.length; i < sys$26; i++) {
        let param = sys$25[i];
        let fb = this.$varFallback("animation", param);
        if (fb) {
          params[i] = fb;
        }
        ;
      }
      ;
      return params;
      if (m = this.$varFallback("animation", params)) {
        return m;
      }
      ;
      return;
    }
    display(params) {
      let out = {display: params};
      for (let sys$27 = 0, sys$28 = iter$7(params), sys$29 = sys$28.length, layout; sys$27 < sys$29; sys$27++) {
        let par = sys$28[sys$27];
        if (layout = layouts[String(par)]) {
          layout.call(this, out, par, params);
        }
        ;
      }
      ;
      return out;
    }
    width([...params]) {
      let o = {};
      for (let sys$30 = 0, sys$31 = iter$7(params), sys$32 = sys$31.length; sys$30 < sys$32; sys$30++) {
        let param = sys$31[sys$30];
        let opts = param._options || {};
        let u = param._unit;
        if (u == "c" || u == "col" || u == "cols") {
          o["grid-column-end"] = "span " + param._number;
        } else if (opts.op && String(opts.op) == ">") {
          o["min-width"] = param;
        } else if (opts.op && String(opts.op) == "<") {
          o["max-width"] = param;
        } else {
          o.width = param;
        }
        ;
      }
      ;
      return o;
    }
    height([...params]) {
      let o = {};
      for (let sys$33 = 0, sys$34 = iter$7(params), sys$35 = sys$34.length; sys$33 < sys$35; sys$33++) {
        let param = sys$34[sys$33];
        let opts = param._options || {};
        let u = param._unit;
        if (u == "r" || u == "row" || u == "rows") {
          o["grid-row-end"] = "span " + param._number;
        } else if (opts.op && String(opts.op) == ">") {
          o["min-height"] = param;
        } else if (opts.op && String(opts.op) == "<") {
          o["max-height"] = param;
        } else {
          o.height = param;
        }
        ;
      }
      ;
      return o;
    }
    transition(...parts) {
      let out = {};
      let add = {};
      let signatures = [
        "name | duration",
        "name | duration | delay",
        "name | duration | ease",
        "name | duration | ease | delay"
      ];
      let groups = {
        styles: ["background-color", "border-color", "color", "fill", "stroke", "opacity", "box-shadow", "transform"],
        sizes: ["width", "height", "left", "top", "right", "bottom", "margin", "padding"],
        colors: ["background-color", "border-color", "color", "fill", "stroke"]
      };
      let i = 0;
      while (i < parts.length) {
        let part = parts[i];
        let name = String(part[0]);
        if (name.match(/^[\-\+]?\d?(\.?\d+)(s|ms)?$/)) {
          part.unshift(name = "styles");
        }
        ;
        let ease = part[2];
        let group = groups[name];
        if (group && parts.length == 1) {
          part[0] = "none";
          Object.assign(add, {"transition-property": group.join(",")});
        } else if (group && parts.length > 1) {
          let subparts = group.map(function(_0) {
            return [_0].concat(part.slice(1));
          });
          parts.splice(i, 1, ...subparts);
          continue;
        }
        ;
        i++;
      }
      ;
      Object.assign(out, {transition: parts}, add);
      return out;
    }
    font(params, ...rest) {
      for (let i = 0, sys$36 = iter$7(params), sys$37 = sys$36.length; i < sys$37; i++) {
        let param = sys$36[i];
        true;
      }
      ;
      return;
    }
    fontFamily(params) {
      let m;
      if (m = this.$varFallback("font", params)) {
        return m;
      }
      ;
      return;
    }
    textShadow(params) {
      let m;
      if (m = this.$varFallback("text-shadow", params)) {
        return m;
      }
      ;
      return;
    }
    gridTemplate(params) {
      for (let i = 0, sys$38 = iter$7(params), sys$39 = sys$38.length; i < sys$39; i++) {
        let param = sys$38[i];
        if (isNumber(param)) {
          param._resolvedValue = "repeat(" + param._value + ",1fr)";
        }
        ;
      }
      ;
      return;
    }
    gridTemplateColumns(params) {
      return this.gridTemplate(params);
    }
    gridTemplateRows(params) {
      return this.gridTemplate(params);
    }
    fontSize([v]) {
      let sizes = this.options.variants.fontSize;
      let raw = String(v);
      let size = v;
      let lh;
      let out = {};
      if (sizes[raw]) {
        [size, lh] = sizes[raw];
        size = Length.parse(size);
        lh = Length.parse(lh || "");
      }
      ;
      if (v.param && v.param) {
        lh = v.param;
      }
      ;
      out["font-size"] = size;
      if (lh) {
        let lhu = lh._unit;
        let lhn = lh._number;
        out.lh = lh;
        if (lhu == "fs") {
          out.lh = new Length(lhn);
        } else if (lhu) {
          out.lh = lh;
        } else if (lhn == 0) {
          out.lh = "inherit";
        } else if (lhn && size._unit == "px") {
          let rounded = Math.round(size._number * lhn);
          if (rounded % 2 == 1) {
            rounded++;
          }
          ;
          out.lh = new Length(rounded, "px");
        }
        ;
      }
      ;
      return out;
    }
    lineHeight([v]) {
      let uvar = v;
      if (v._number && !v._unit) {
        uvar = v.clone(v._number, "em");
      }
      ;
      return {
        "line-height": v,
        "--u_lh": uvar
      };
    }
    textDecoration(params) {
      for (let i = 0, sys$40 = iter$7(params), sys$41 = sys$40.length; i < sys$41; i++) {
        let param = sys$40[i];
        let str = String(param);
        if (str == "u") {
          param._resolvedValue = "underline";
        } else if (str == "s") {
          param._resolvedValue = "line-through";
        }
        ;
      }
      ;
      return [params];
    }
    border([...params]) {
      if (params.length == 1 && this.$parseColor(params[0])) {
        return [["1px", "solid", params[0]]];
      }
      ;
      return;
    }
    borderLeft(params) {
      return this.border(params);
    }
    borderRight(params) {
      return this.border(params);
    }
    borderTop(params) {
      return this.border(params);
    }
    borderBottom(params) {
      return this.border(params);
    }
    borderX(params) {
      return {"border-left": this.border(params) || params, "border-right": this.border(params) || params};
    }
    borderY(params) {
      return {"border-top": this.border(params) || params, "border-bottom": this.border(params) || params};
    }
    borderXWidth([l, r = l]) {
      return {blw: l, brw: r};
    }
    borderYWidth([t, b = t]) {
      return {btw: t, bbw: b};
    }
    borderXStyle([l, r = l]) {
      return {bls: l, brs: r};
    }
    borderYStyle([t, b = t]) {
      return {bts: t, bbs: b};
    }
    borderXColor([l, r = l]) {
      return {blc: l, brc: r};
    }
    borderYColor([t, b = t]) {
      return {btc: t, bbc: b};
    }
    gap([v]) {
      return {gap: v, "--u_rg": v, "--u_cg": v};
    }
    rowGap([v]) {
      return {"row-gap": v, "--u_rg": v};
    }
    columnGap([v]) {
      return {"column-gap": v, "--u_cg": v};
    }
    $color(name) {
      let m;
      if (this.palette[name]) {
        return this.palette[name];
      }
      ;
      if (m = name.match(/^(\w+)(\d)(?:\-(\d+))?$/)) {
        let ns = m[1];
        let nr = parseInt(m[2]);
        let fraction = parseInt(m[3]) || 0;
        let from = null;
        let to = null;
        let n0 = nr + 1;
        let n1 = nr;
        while (n0 > 1 && !from) {
          from = this.palette[ns + --n0];
        }
        ;
        while (n1 < 9 && !to) {
          to = this.palette[ns + ++n1];
        }
        ;
        let weight = (nr - n0 + fraction / 10) / (n1 - n0);
        let hw = weight;
        let sw = weight;
        let lw = weight;
        if (!to) {
          to = this.palette.blue9;
          hw = 0;
        }
        ;
        if (!from) {
          from = this.palette.blue1;
          hw = 1;
        }
        ;
        if (from && to) {
          return this.palette[name] = from.mix(to, hw, sw, lw);
        }
        ;
      }
      ;
      return null;
    }
    $u(number, part) {
      let [step, num, unit] = this.config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/);
      return this.value * parseFloat(num) + unit;
    }
    $parseColor(identifier) {
      let color;
      let key = String(identifier);
      if (color = this.$color(key)) {
        return color;
      }
      ;
      if (key.match(/^#[a-fA-F0-9]{3,8}/)) {
        return identifier;
      } else if (key.match(/^(rgb|hsl)/)) {
        return identifier;
      } else if (key == "currentColor") {
        return identifier;
      }
      ;
      return null;
    }
    $varFallback(name, params, exclude = []) {
      if (params.length == 1) {
        let str = String(params[0]);
        let fallback = params[0];
        exclude.push("none", "initial", "unset", "inherit");
        if (!exclude.indexOf(str) >= 0 && str.match(/^[\w\-]+$/)) {
          if (name == "font" && fonts[str]) {
            fallback = fonts[str];
          }
          ;
          if (name == "ease" && this.options.variants.easings[str]) {
            fallback = this.options.variants.easings[str];
          }
          ;
          return [new Var("" + name + "-" + str, fallback)];
        }
        ;
      }
      ;
      return;
    }
    $value(value, index, config) {
      let color;
      let key = config;
      let orig = value;
      let raw = value && value.toRaw ? value.toRaw() : String(value);
      let str = String(value);
      let fallback = false;
      let result = null;
      let unit = orig._unit;
      if (typeof config == "string") {
        if (aliases[config]) {
          config = aliases[config];
          if (config instanceof Array) {
            config = config[0];
          }
          ;
        }
        ;
        if (config.match(/^((min-|max-)?(width|height)|top|left|bottom|right|padding|margin|sizing|inset|spacing|sy$|s$|\-\-s[xy])/)) {
          config = "sizing";
        } else if (config.match(/^\-\-[gs][xy]_/)) {
          config = "sizing";
        } else if (config.match(/^(row-|column-)?gap/)) {
          config = "sizing";
        } else if (config.match(/^[mps][trblxy]?$/)) {
          config = "sizing";
        } else if (config.match(/^[trblwh]$/)) {
          config = "sizing";
        } else if (config.match(/^border-.*radius/) || config.match(/^rd[tlbr]{0,2}$/)) {
          config = "radius";
          fallback = "border-radius";
        } else if (config.match(/^box-shadow/)) {
          fallback = config = "box-shadow";
        } else if (config.match(/^tween|transition/) && this.options.variants.easings[raw]) {
          return this.options.variants.easings[raw];
        }
        ;
        config = this.options.variants[config] || {};
      }
      ;
      if (value == void 0) {
        value = config.default;
      }
      ;
      if (config.hasOwnProperty(raw)) {
        value = config[value];
      }
      ;
      if (typeof raw == "number" && config.NUMBER) {
        let [step, num, unit2] = config.NUMBER.match(/^(\-?[\d\.]+)(\w+|%)?$/);
        return value * parseFloat(num) + unit2;
      } else if (typeof raw == "string") {
        if (color = this.$parseColor(raw)) {
          return color;
        }
        ;
      }
      ;
      if (fallback) {
        let okstr = str.match(/^[a-zA-Z\-][\w\-]*$/) && !str.match(/^(none|inherit|unset|initial)$/);
        let oknum = unit && VALID_CSS_UNITS.indexOf(unit) == -1;
        if ((okstr || oknum) && value.alone) {
          return new Var("" + fallback + "-" + str, orig != value ? value : raw);
        }
        ;
      }
      ;
      return value;
    }
  };
  var TransformMixin = "--t_x:0;--t_y:0;--t_z:0;--t_rotate:0;--t_scale:1;--t_scale-x:1;--t_scale-y:1;--t_skew-x:0;--t_skew-y:0;\ntransform: translate3d(var(--t_x),var(--t_y),var(--t_z)) rotate(var(--t_rotate)) skewX(var(--t_skew-x)) skewY(var(--t_skew-y)) scaleX(var(--t_scale-x)) scaleY(var(--t_scale-y)) scale(var(--t_scale));";
  var StyleRule = class {
    constructor(parent, selector, content, options = {}) {
      this.parent = parent;
      this.selector = selector;
      this.content = content;
      this.options = options;
      this.isKeyFrames = !!selector.match(/\@keyframes \w/);
      this.isKeyFrame = parent && parent.isKeyFrames;
      this.meta = {};
    }
    root() {
      return this.parent ? this.parent.root : this;
    }
    toString(o = {}) {
      let parts = [];
      let subrules = [];
      if (this.isKeyFrames) {
        let [context, name] = this.selector.split(/\s*\@keyframes\s*/);
        context = context.trim();
        name = name.trim();
        let path = [name, context, this.options.ns].filter(function(_0) {
          return _0;
        }).join("-");
        this.meta.name = name;
        this.meta.uniqueName = path.replace(/[\s\.\,]+/g, "").replace(/[^\w\-]/g, "_");
        if (this.options.global && !context) {
          this.meta.uniqueName = this.meta.name;
        }
        ;
        let subprops = {};
        subprops["--animation-" + name] = "" + this.meta.uniqueName;
        if (context) {
          subrules.push(new StyleRule(null, context, subprops, this.options));
        } else if (this.options.ns && !this.options.global) {
          subrules.push(new StyleRule(null, "." + this.options.ns, subprops, {}));
        }
        ;
      }
      ;
      for (let sys$44 = this.content, sys$42 = 0, sys$43 = Object.keys(sys$44), sys$45 = sys$43.length, key, value; sys$42 < sys$45; sys$42++) {
        key = sys$43[sys$42];
        value = sys$44[key];
        if (value == void 0) {
          continue;
        }
        ;
        let subsel = null;
        if (key.indexOf("&") >= 0) {
          if (this.isKeyFrames) {
            let keyframe = key.replace(/&/g, "");
            let rule = new StyleRule(this, keyframe, value, this.options);
            parts.push(rule.toString({indent: true}));
            continue;
          }
          ;
          let subsel2 = unwrap(this.selector, key);
          subrules.push(new StyleRule(this, subsel2, value, this.options));
          continue;
        } else if (key.indexOf("\xA7") >= 0) {
          let keys = key.split("\xA7");
          let subsel2 = unwrap(this.selector, keys.slice(1).join(" "));
          let obj = {};
          obj[keys[0]] = value;
          subrules.push(new StyleRule(this, subsel2, obj, this.options));
          continue;
        } else if (key[0] == "[") {
          console.warn("DEPRECATED", key, this);
          let o2 = JSON.parse(key);
          subrules.push(new StyleRule(this, this.selector, value, this.options));
          continue;
        } else if (key.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)) {
          if (!this.meta.transform) {
            this.meta.transform = true;
            parts.unshift(TransformMixin);
          }
          ;
          parts.push("--t_" + key + ": " + value + " !important;");
        } else {
          parts.push("" + key + ": " + value + ";");
        }
        ;
      }
      ;
      let content = parts.join("\n");
      let out = "";
      if (o.indent || this.isKeyFrames) {
        content = "\n" + content + "\n";
      }
      ;
      if (this.isKeyFrame) {
        out = "" + this.selector + " {" + content + "}";
      } else if (this.isKeyFrames) {
        out = "@keyframes " + this.meta.uniqueName + " {" + content + "}";
      } else {
        let sel = this.isKeyFrame ? this.selector : parse2(this.selector, this.options);
        out = content.match(/[^\n\s]/) ? render2(sel, content, this.options) : "";
      }
      ;
      for (let sys$46 = 0, sys$47 = iter$7(subrules), sys$48 = sys$47.length; sys$46 < sys$48; sys$46++) {
        let subrule = sys$47[sys$46];
        out += "\n" + subrule.toString();
      }
      ;
      return out;
    }
  };
});

// src/compiler/assets.imba
var require_assets = __commonJS((exports2) => {
  __export(exports2, {
    parseAsset: () => parseAsset
  });
  function iter$7(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  function parseAsset(raw, name) {
    var $0$1, $0$2;
    let text = raw.body;
    let xml2 = Monarch.getTokenizer("xml");
    let state = xml2.getInitialState();
    let out = xml2.tokenize(text, state, 0);
    let attrs = {};
    let desc = {attributes: attrs, flags: []};
    let currAttr;
    let contentStart = 0;
    for (let sys$14 = 0, sys$22 = iter$7(out.tokens), sys$32 = sys$22.length; sys$14 < sys$32; sys$14++) {
      let tok = sys$22[sys$14];
      let val = tok.value;
      if (tok.type == "attribute.name.xml") {
        currAttr = tok;
        attrs[val] = true;
      }
      ;
      if (tok.type == "attribute.value.xml") {
        let len = val.length;
        if (len > 2 && val[0] == val[len - 1] && (val[0] == '"' || val[0] == "'")) {
          val = val.slice(1, -1);
        }
        ;
        attrs[currAttr.value] = val;
      }
      ;
      if (tok.type == "delimiter.xml" && val == ">") {
        contentStart = tok.offset + 1;
        break;
      }
      ;
    }
    ;
    desc.content = text.slice(contentStart).replace("</svg>", "");
    if (attrs.class) {
      desc.flags = attrs.class.split(/\s+/g);
      $0$1 = attrs.class, delete attrs.class, $0$1;
    }
    ;
    if (name) {
      desc.flags.push("asset-" + name.toLowerCase());
    }
    ;
    $0$2 = attrs.xmlns, delete attrs.xmlns, $0$2;
    return desc;
  }
});

// src/compiler/nodes.imba1
var require_nodes = __commonJS((exports2) => {
  function len$(a) {
    return a && (a.len instanceof Function ? a.len() : a.length) || 0;
  }
  function idx$(a, b) {
    return b && b.indexOf ? b.indexOf(a) : [].indexOf.call(a, b);
  }
  function subclass$(obj, sup) {
    for (var k in sup) {
      if (sup.hasOwnProperty(k))
        obj[k] = sup[k];
    }
    ;
    obj.prototype = Object.create(sup.prototype);
    obj.__super__ = obj.prototype.__super__ = sup.prototype;
    obj.prototype.initialize = obj.prototype.constructor = obj;
  }
  function iter$7(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  var self2 = {};
  var helpers2 = require_helpers();
  var constants = require_constants();
  var fspath = require("path");
  var transformers2 = require_transformers();
  var errors$ = require_errors();
  var ImbaParseError2 = errors$.ImbaParseError;
  var ImbaTraverseError = errors$.ImbaTraverseError;
  var Token2 = require_token().Token;
  var SourceMap = require_sourcemap().SourceMap;
  var imba$ = require_styler();
  var StyleRule = imba$.StyleRule;
  var StyleTheme = imba$.StyleTheme;
  var Color = imba$.Color;
  var parseAsset = require_assets().parseAsset;
  var Compilation2 = require_compilation().Compilation;
  var SourceMapper = require_sourcemapper().SourceMapper;
  var TAG_NAMES = constants.TAG_NAMES;
  var TAG_TYPES = {};
  var TAG_ATTRS = {};
  TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong strike style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
  TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
  TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";
  TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";
  var CUSTOM_EVENTS = {
    intersect: "events_intersect",
    selection: "events_selection",
    resize: "events_resize",
    touch: "events_pointer",
    pointer: "events_pointer",
    pointerdown: "events_pointer",
    pointermove: "events_pointer",
    pointerover: "events_pointer",
    pointerout: "events_pointer",
    pointerup: "events_pointer",
    pointercancel: "events_pointer",
    lostpointercapture: "events_pointer"
  };
  var AST = exports2.AST = {};
  var F = exports2.F = {
    TAG_INITED: 2 ** 0,
    TAG_BUILT: 2 ** 1,
    TAG_CUSTOM: 2 ** 2,
    TAG_AWAKENED: 2 ** 3,
    TAG_MOUNTED: 2 ** 4,
    TAG_SCHEDULE: 2 ** 5,
    TAG_SCHEDULED: 2 ** 6,
    TAG_FIRST_CHILD: 2 ** 7,
    TAG_LAST_CHILD: 2 ** 8,
    TAG_HAS_DYNAMIC_FLAGS: 2 ** 9,
    TAG_HAS_BRANCHES: 2 ** 10,
    TAG_HAS_LOOPS: 2 ** 11,
    TAG_HAS_DYNAMIC_CHILDREN: 2 ** 12,
    TAG_IN_BRANCH: 2 ** 13,
    TAG_BIND_MODEL: 2 ** 14,
    TAG_INDEXED: 2 ** 15,
    TAG_KEYED: 2 ** 16,
    EL_INITED: 2 ** 0,
    EL_HYDRATED: 2 ** 1,
    EL_HYDRATING: 2 ** 2,
    EL_AWAKENED: 2 ** 3,
    EL_MOUNTING: 2 ** 4,
    EL_MOUNTED: 2 ** 5,
    EL_SCHEDULE: 2 ** 6,
    EL_SCHEDULED: 2 ** 7,
    EL_RENDERING: 2 ** 8,
    EL_RENDERED: 2 ** 9,
    EL_SSR: 2 ** 10,
    DIFF_BUILT: 2 ** 0,
    DIFF_FLAGS: 2 ** 1,
    DIFF_ATTRS: 2 ** 2,
    DIFF_CHILDREN: 2 ** 3
  };
  var OP = exports2.OP = function(op, l, r) {
    var o = String(op);
    if (o == "-" && !r && (l instanceof Num || l instanceof NumWithUnit)) {
      l.negate();
      return l;
    } else if (o == "+" && !r && (l instanceof Num || l instanceof NumWithUnit)) {
      return l;
    }
    ;
    switch (o) {
      case ".":
      case "?.": {
        if (l instanceof Super) {
          l.setMember(r);
          return l;
        }
        ;
        if (typeof r == "string" || r instanceof String) {
          r = new Identifier(r);
        }
        ;
        return new Access(op, l, r);
        break;
      }
      case "=": {
        return new Assign(op, l, r);
        break;
      }
      case "~=": {
        return OP("&=", l, OP("~", r));
        break;
      }
      case "?=":
      case "||=":
      case "&&=":
      case "??=": {
        return new ConditionalAssign(op, l, r);
        break;
      }
      case "+=":
      case "-=":
      case "*=":
      case "/=":
      case "^=":
      case "%=":
      case "**=": {
        return new CompoundAssign(op, l, r);
        break;
      }
      case "instanceof":
      case "isa": {
        return new InstanceOf(op, l, r);
        break;
      }
      case "in": {
        return new In(op, l, r);
        break;
      }
      case "typeof": {
        return new TypeOf(op, l, r);
        break;
      }
      case "delete": {
        return new Delete(op, l, r);
        break;
      }
      case "--":
      case "++":
      case "!":
      case "\u221A":
      case "not":
      case "!!": {
        return new UnaryOp(op, l, r);
        break;
      }
      case ">":
      case "<":
      case ">=":
      case "<=":
      case "==":
      case "===":
      case "!=":
      case "!==": {
        return new ComparisonOp(op, l, r);
        break;
      }
      case "..":
      case "...": {
        return new Range2(op, l, r);
        break;
      }
      default:
        return new Op(op, l, r);
    }
    ;
  };
  var PATHIFY = function(val) {
    if (val instanceof TagAttrValue) {
      val = val.value();
    }
    ;
    if (val instanceof ArgList) {
      val = val.values()[0];
    }
    ;
    while (val instanceof Parens) {
      val = val.value();
    }
    ;
    if (val instanceof VarOrAccess) {
      val = val._variable || val.value();
    }
    ;
    if (val instanceof Access) {
      let left = val.left();
      let right = val.right() instanceof Index ? val.right().value() : val.right();
      if (left instanceof VarOrAccess) {
        left = left._variable || left.value();
      }
      ;
      if (right instanceof VarOrAccess) {
        right = right._variable || right.value();
      }
      ;
      if (val instanceof IvarAccess) {
        left || (left = val.scope__().context());
      }
      ;
      if (right instanceof Identifier) {
        right = helpers2.singlequote(String(right.js()));
        right = new Str(right);
      }
      ;
      return [left, right];
    }
    ;
    return val;
  };
  var OPTS = {};
  var ROOT = null;
  var NODES = exports2.NODES = [];
  var C = function(node, opts) {
    return typeof node == "string" || typeof node == "number" ? node : node.c(opts);
  };
  var MP = function(val, typ) {
    if (typ === void 0)
      typ = "path";
    return "/*$" + typ + "$*/" + val + "/*$*/";
  };
  var M2 = function(val, mark, o) {
    if (mark == void 0) {
      mark = val;
    }
    ;
    if (mark && mark.startLoc) {
      val = C(val, o);
      let ref = STACK.incr("sourcePair");
      let start = mark.startLoc();
      let end = mark.endLoc();
      let m0 = "";
      let m1 = "";
      if (start == 0 || start > 0) {
        m0 = end >= start ? "/*%" + start + "|" + ref + "$*/" : "/*%" + start + "$*/";
      }
      ;
      if (end == 0 || end > 0) {
        m1 = start >= 0 ? "/*%" + end + "|" + ref + "$*/" : "/*%" + end + "$*/";
      }
      ;
      if (o && o.locRef) {
        val = MP(val, o.locRef);
      }
      ;
      return m0 + val + m1;
    }
    ;
    return C(val, o);
  };
  var MSTART = function() {
    var $0 = arguments, i = $0.length;
    var params = new Array(i > 0 ? i : 0);
    while (i > 0)
      params[i - 1] = $0[--i];
    for (let i2 = 0, items = iter$7(params), len = items.length, item; i2 < len; i2++) {
      item = items[i2];
      if (typeof item == "number" || item instanceof Number) {
        return item;
      }
      ;
      if (item && item.startLoc instanceof Function) {
        return item.startLoc();
      }
      ;
    }
    ;
    return null;
  };
  var MEND = function() {
    var $0 = arguments, i = $0.length;
    var params = new Array(i > 0 ? i : 0);
    while (i > 0)
      params[i - 1] = $0[--i];
    for (let i2 = 0, items = iter$7(params), len = items.length, item; i2 < len; i2++) {
      item = items[i2];
      if (typeof item == "number" || item instanceof Number) {
        return item;
      }
      ;
      if (item && item.endLoc instanceof Function) {
        return item.endLoc();
      }
      ;
    }
    ;
    return null;
  };
  var LIT = function(val) {
    return new RawScript(val);
  };
  var KEY = function(val) {
    if (val instanceof Token2) {
      val = val.value();
    }
    ;
    if (typeof val == "string" || val instanceof String) {
      if (val.match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/)) {
        val = new Identifier(val);
      } else {
        val = new Str(helpers2.singlequote(String(val)));
      }
      ;
    }
    ;
    return val;
  };
  var STR = function(val) {
    if (val instanceof Str) {
      return val;
    }
    ;
    return new Str(helpers2.singlequote(String(val)));
  };
  var IF = function(cond, body, alt, o) {
    if (o === void 0)
      o = {};
    var node = new If(cond, body, o);
    if (alt) {
      node.addElse(alt);
    }
    ;
    return node;
  };
  var NODIFY = function(val) {
    if (val == null) {
      return new Nil();
    } else if (val == false) {
      return new False();
    } else if (val == true) {
      return new True();
    } else if (typeof val == "string" || val instanceof String) {
      return STR(val);
    } else if (typeof val == "number" || val instanceof Number) {
      return new Num(val);
    } else {
      return val;
    }
    ;
  };
  var FN = function(pars, body, scope2) {
    let fn = new Func(pars, body);
    if (scope2) {
      fn._scope._systemscope = scope2;
    }
    ;
    return fn;
  };
  var METH = function(pars, body) {
    return new ClosedFunc(pars, body);
  };
  var CALL = function(callee, pars) {
    if (pars === void 0)
      pars = [];
    return new Call(callee, pars);
  };
  var GET = function(left, right) {
    return OP(".", left, right);
  };
  var SPLAT = exports2.SPLAT = function(value) {
    return new Splat(value);
  };
  var SEMICOLON_TEST = /;(\s*\/\/.*)?[\n\s\t]*$/;
  var RESERVED_TEST = /^(default|char|for)$/;
  exports2.parseError = self2.parseError = function(str, o) {
    var err = Compilation2.error({
      category: "parser",
      severity: "error",
      offset: o.offset,
      length: o.length,
      message: str
    });
    return err.raise();
  };
  AST.c = function(obj) {
    return typeof obj == "string" ? obj : obj.c();
  };
  AST.compileRaw = function(item) {
    let o = "";
    if (item instanceof Array) {
      o = "[";
      for (let i = 0, items = iter$7(item), len = items.length; i < len; i++) {
        o += AST.compileRaw(items[i]) + ",";
      }
      ;
      o = o.slice(0, -1) + "]";
    } else if (item instanceof Object) {
      o = "{";
      for (let v, i = 0, keys = Object.keys(item), l = keys.length, k; i < l; i++) {
        k = keys[i];
        v = item[k];
        o = +("" + k + ":" + AST.compileRaw(v) + ",");
      }
      ;
      o = o.slice(0, -1) + "}";
    } else {
      o = JSON.stringify(item);
    }
    ;
    return o;
  };
  AST.blk = function(obj) {
    return obj instanceof Array ? Block.wrap(obj) : obj;
  };
  AST.sym = function(obj) {
    return helpers2.symbolize(String(obj));
  };
  AST.cary = function(ary, params) {
    if (params === void 0)
      params = null;
    return ary.map(function(v) {
      if (typeof v == "string") {
        return v;
      } else if (v && v.c) {
        return params ? v.c(params) : v.c();
      } else {
        console.warn("could not compile", v);
        return String(v);
      }
      ;
    });
  };
  AST.dump = function(obj, key) {
    if (obj instanceof Array) {
      return obj.map(function(v) {
        return v && v.dump ? v.dump(key) : v;
      });
    } else if (obj && obj.dump) {
      return obj.dump();
    }
    ;
  };
  AST.compact = function(ary) {
    if (ary instanceof ListNode) {
      return ary.compact();
    }
    ;
    return ary.filter(function(v) {
      return v != void 0 && v != null;
    });
  };
  AST.reduce = function(res, ary) {
    for (let i = 0, items = iter$7(ary), len = items.length, v; i < len; i++) {
      v = items[i];
      v instanceof Array ? AST.reduce(res, v) : res.push(v);
    }
    ;
    return;
  };
  AST.flatten = function(ary, compact) {
    if (compact === void 0)
      compact = false;
    var out = [];
    for (let i = 0, items = iter$7(ary), len = items.length, v; i < len; i++) {
      v = items[i];
      v instanceof Array ? AST.reduce(out, v) : out.push(v);
    }
    ;
    return out;
  };
  AST.loc = function(item) {
    if (!item) {
      return [0, 0];
    } else if (item instanceof Token2) {
      return item.region();
    } else if (item instanceof Node2) {
      return item.loc();
    }
    ;
  };
  AST.parse = function(str, opts) {
    if (opts === void 0)
      opts = {};
    var indent = str.match(/\t+/)[0];
    return Imbac.parse(str, opts);
  };
  AST.inline = function(str, opts) {
    if (opts === void 0)
      opts = {};
    return this.parse(str, opts).body();
  };
  AST.node = function(typ, pars) {
    if (typ == "call") {
      if (pars[0].c() == "return") {
        pars[0] = "tata";
      }
      ;
      return new Call(pars[0], pars[1], pars[2]);
    }
    ;
  };
  AST.escapeComments = function(str) {
    if (!str) {
      return "";
    }
    ;
    return str;
  };
  var shortRefCache = [];
  AST.counterToShortRef = function(nr) {
    var base = "A".charCodeAt(0);
    while (shortRefCache.length <= nr) {
      var num = shortRefCache.length + 1;
      var str = "";
      while (true) {
        num -= 1;
        str = String.fromCharCode(base + num % 26) + str;
        num = Math.floor(num / 26);
        if (num <= 0) {
          break;
        }
        ;
      }
      ;
      shortRefCache.push(str.toLowerCase());
    }
    ;
    return shortRefCache[nr];
  };
  AST.truthy = function(node) {
    if (node instanceof True) {
      return true;
    }
    ;
    if (node instanceof False) {
      return false;
    }
    ;
    if (node.isTruthy) {
      return node.isTruthy();
    }
    ;
    return void 0;
  };
  function Indentation(a, b) {
    this._open = a;
    this._close = b;
    this;
  }
  exports2.Indentation = Indentation;
  Indentation.prototype.open = function(v) {
    return this._open;
  };
  Indentation.prototype.setOpen = function(v) {
    this._open = v;
    return this;
  };
  Indentation.prototype.close = function(v) {
    return this._close;
  };
  Indentation.prototype.setClose = function(v) {
    this._close = v;
    return this;
  };
  Indentation.prototype.isGenerated = function() {
    return this._open && this._open.generated;
  };
  Indentation.prototype.aloc = function() {
    return this._open && this._open._loc || 0;
  };
  Indentation.prototype.bloc = function() {
    return this._close && this._close._loc || 0;
  };
  Indentation.prototype.startLoc = function() {
    return this.aloc();
  };
  Indentation.prototype.endLoc = function() {
    return this.bloc();
  };
  Indentation.prototype.wrap = function(str) {
    var om = this._open && this._open._meta;
    var pre = om && om.pre || "";
    var post = om && om.post || "";
    var esc = AST.escapeComments;
    var out = this._close;
    str = post.replace(/^\n/, "") + str;
    str = str.replace(/^/g, "	").replace(/\n/g, "\n	").replace(/\n\t$/g, "\n");
    str = pre + "\n" + str;
    if (out instanceof Terminator) {
      str += out.c();
    }
    ;
    if (str[str.length - 1] != "\n") {
      str = str + "\n";
    }
    ;
    return str;
  };
  var INDENT = new Indentation({}, {});
  function Stash() {
    this._entities = [];
  }
  Stash.prototype.add = function(item) {
    this._entities.unshift(item);
    return this;
  };
  Stash.prototype.pluck = function(item) {
    var match = null;
    for (let i = 0, items = iter$7(this._entities), len = items.length, entity; i < len; i++) {
      entity = items[i];
      if (entity == item || entity instanceof item) {
        match = entity;
        this._entities.splice(i, 1);
        return match;
      }
      ;
    }
    ;
    return null;
  };
  function Stack() {
    this.reset();
  }
  exports2.Stack = Stack;
  Stack.prototype.loglevel = function(v) {
    return this._loglevel;
  };
  Stack.prototype.setLoglevel = function(v) {
    this._loglevel = v;
    return this;
  };
  Stack.prototype.nodes = function(v) {
    return this._nodes;
  };
  Stack.prototype.setNodes = function(v) {
    this._nodes = v;
    return this;
  };
  Stack.prototype.scopes = function(v) {
    return this._scopes;
  };
  Stack.prototype.setScopes = function(v) {
    this._scopes = v;
    return this;
  };
  Stack.prototype.root = function(v) {
    return this._root;
  };
  Stack.prototype.setRoot = function(v) {
    this._root = v;
    return this;
  };
  Stack.prototype.state = function(v) {
    return this._state;
  };
  Stack.prototype.setState = function(v) {
    this._state = v;
    return this;
  };
  Stack.prototype.semanticTokens = function(v) {
    return this._semanticTokens;
  };
  Stack.prototype.setSemanticTokens = function(v) {
    this._semanticTokens = v;
    return this;
  };
  Stack.prototype.meta = function(v) {
    return this._meta;
  };
  Stack.prototype.setMeta = function(v) {
    this._meta = v;
    return this;
  };
  Stack.prototype.theme = function(v) {
    return this._theme;
  };
  Stack.prototype.setTheme = function(v) {
    this._theme = v;
    return this;
  };
  Stack.prototype.css = function(v) {
    return this._css;
  };
  Stack.prototype.setCss = function(v) {
    this._css = v;
    return this;
  };
  Stack.prototype.reset = function() {
    this._nodes = [];
    this._scoping = [];
    this._scopes = [];
    this._stash = new Stash(this);
    this._loglevel = 3;
    this._counter = 0;
    this._counters = {};
    this._options = {};
    this._state = {};
    this._tag = null;
    this._sourceId = null;
    this._semanticTokens = [];
    this._symbols = {};
    this._theme = null;
    this._meta = {};
    this._css = "";
    this._runtime;
    return this;
  };
  Stack.prototype.runtime = function() {
    return this._root.runtime();
  };
  Stack.prototype.registerSemanticToken = function(token3, kind, modifiers2) {
    if (token3 instanceof Node2) {
      kind || (kind = token3._variable);
      token3 = token3._value;
    }
    ;
    if (typeof token3 != "string") {
      if (kind instanceof Variable) {
        token3._kind = kind.type();
        token3._level = kind.scope().level();
        token3._scope = kind.scope().kind();
      } else {
        token3._kind = kind;
      }
      ;
    }
    ;
    return this._semanticTokens.push(token3);
  };
  Stack.prototype.use = function(item) {
    return this._root.use(item);
  };
  Stack.prototype.incr = function(name) {
    this._counters[name] || (this._counters[name] = 0);
    return this._counters[name] += 1;
  };
  Stack.prototype.decr = function(name) {
    this._counters[name] || (this._counters[name] = 0);
    return this._counters[name] -= 1;
  };
  Stack.prototype.generateId = function(ns) {
    if (ns === void 0)
      ns = "oid";
    return AST.counterToShortRef(STACK.incr(ns));
  };
  Stack.prototype.getSymbol = function(ref) {
    ref || (ref = this.incr("symbols"));
    return this._symbols[ref] || (this._symbols[ref] = this._root.declare(ref, LIT("Symbol()"), {system: true}).resolve().c());
  };
  Stack.prototype.getAsset = function(name) {
    let assets = this.config().assets;
    return assets ? assets[name] : null;
  };
  Stack.prototype.sourceId = function() {
    if (this._sourceId || (this._sourceId = this._options.sourceId)) {
      return this._sourceId;
    }
    ;
    let src = this.sourcePath();
    let cwd = this.cwd();
    if (this._options.path && cwd) {
      src = this._options.path.relative(cwd, src);
    }
    ;
    this._sourceId = helpers2.identifierForPath(src);
    return this._sourceId;
  };
  Stack.prototype.theme = function() {
    return this._theme || (this._theme = StyleTheme.wrap(this._options.config));
  };
  Stack.prototype.stash = function() {
    return this._stash;
  };
  Stack.prototype.set = function(obj) {
    this._options || (this._options = {});
    for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++) {
      k = keys[i];
      v = obj[k];
      this._options[k] = v;
    }
    ;
    return this;
  };
  Stack.prototype.option = function(key, val) {
    if (val != void 0) {
      this._options || (this._options = {});
      this._options[key] = val;
      return this;
    }
    ;
    return this._options && this._options[key];
  };
  Stack.prototype.platform = function() {
    return this._options.platform || "browser";
  };
  Stack.prototype.format = function() {
    return this._options.format;
  };
  Stack.prototype.sourcePath = function() {
    return this._options.sourcePath;
  };
  Stack.prototype.imbaPath = function() {
    return this._options.imbaPath;
  };
  Stack.prototype.config = function() {
    return this._options.config || {};
  };
  Stack.prototype.cwd = function() {
    return this.config() && this.config().cwd;
  };
  Stack.prototype.tsc = function() {
    return this.platform() == "tsc" || this._options.tsc;
  };
  Stack.prototype.hmr = function() {
    return !!this._options.hmr;
  };
  Stack.prototype.isWeb = function() {
    return this.platform() == "browser" || this.platform() == "web";
  };
  Stack.prototype.isWorker = function() {
    return this.platform() == "worker";
  };
  Stack.prototype.isNode = function() {
    return this.platform() == "node";
  };
  Stack.prototype.cjs = function() {
    return this.format() == "cjs" || !this.format() && this.isNode();
  };
  Stack.prototype.esm = function() {
    return !this.cjs();
  };
  Stack.prototype.env = function(key) {
    var e;
    var val = this._options["ENV_" + key];
    if (val != void 0) {
      return val;
    }
    ;
    if (F[key] !== void 0) {
      return F[key];
    }
    ;
    var lowercased = key.toLowerCase();
    if (this._options[lowercased] != void 0) {
      return this._options[lowercased];
    }
    ;
    if (key == "WEB" || key == "BROWSER") {
      this._meta.universal = false;
      return this.isWeb();
    } else if (key == "NODE") {
      this._meta.universal = false;
      return this.isNode();
    } else if (key == "WORKER" || key == "WEBWORKER") {
      this._meta.universal = false;
      return this.isWorker();
    } else if (key == "HMR") {
      return !!this._options.hmr;
    }
    ;
    if (e = this._options.env) {
      if (e.hasOwnProperty(key)) {
        return e[key];
      } else if (e.hasOwnProperty(key.toLowerCase())) {
        return e[key.toLowerCase()];
      }
      ;
    }
    ;
    if (typeof process != "undefined" && process.env) {
      val = process.env[key.toUpperCase()];
      if (val != void 0) {
        return val;
      }
      ;
      return null;
    }
    ;
    return void 0;
  };
  Stack.prototype.addScope = function(scope2) {
    this._scopes.push(scope2);
    return this;
  };
  Stack.prototype.traverse = function(node) {
    return this;
  };
  Stack.prototype.push = function(node) {
    this._nodes.push(node);
    return this;
  };
  Stack.prototype.pop = function(node) {
    this._nodes.pop();
    return this;
  };
  Stack.prototype.parent = function() {
    return this._nodes[this._nodes.length - 2];
  };
  Stack.prototype.current = function() {
    return this._nodes[this._nodes.length - 1];
  };
  Stack.prototype.up = function(test) {
    test || (test = function(v) {
      return !(v instanceof VarOrAccess);
    });
    if (typeof test == "number") {
      return this._nodes[this._nodes.length - (1 + test)];
    }
    ;
    var i = this._nodes.length - 2;
    if (test.prototype instanceof Node2) {
      while (i >= 0) {
        var node = this._nodes[i--];
        if (node instanceof test) {
          return node;
        }
        ;
      }
      ;
      return null;
    }
    ;
    while (i >= 0) {
      node = this._nodes[i];
      if (test(node)) {
        return node;
      }
      ;
      i -= 1;
    }
    ;
    return null;
  };
  Stack.prototype.relative = function(node, offset) {
    if (offset === void 0)
      offset = 0;
    var idx = this._nodes.indexOf(node);
    return idx >= 0 ? this._nodes[idx + offset] : null;
  };
  Stack.prototype.scope = function(lvl) {
    if (lvl === void 0)
      lvl = 0;
    if (this._withScope) {
      return this._withScope;
    }
    ;
    var i = this._nodes.length - 1 - lvl;
    while (i >= 0) {
      var node = this._nodes[i];
      if (node._scope) {
        return node._scope;
      }
      ;
      i -= 1;
    }
    ;
    return null;
  };
  Stack.prototype.withScope = function(scop, cb) {
    let prev = this._withScope;
    this._withScope = scop;
    cb();
    this._withScope = prev;
    return;
  };
  Stack.prototype.scopes = function() {
    var scopes = [];
    var i = this._nodes.length - 1;
    while (i >= 0) {
      var node = this._nodes[i];
      if (node._scope) {
        scopes.push(node._scope);
      }
      ;
      i -= 1;
    }
    ;
    return scopes;
  };
  Stack.prototype.method = function() {
    return this.up(MethodDeclaration);
  };
  Stack.prototype.block = function() {
    return this.up(Block);
  };
  Stack.prototype.blockpart = function() {
    let i = this._nodes.length - 1;
    while (i) {
      if (this._nodes[i - 1] instanceof Block) {
        return this._nodes[i];
      }
      ;
      i--;
    }
    ;
    return;
  };
  Stack.prototype.isExpression = function() {
    var i = this._nodes.length - 1;
    while (i >= 0) {
      var node = this._nodes[i];
      if (node instanceof Code || node instanceof Loop) {
        return false;
      }
      ;
      if (node.isExpression()) {
        return true;
      }
      ;
      i -= 1;
    }
    ;
    return false;
  };
  Stack.prototype.toString = function() {
    return "Stack(" + this._nodes.join(" -> ") + ")";
  };
  Stack.prototype.isAnalyzing = function() {
    return this._analyzing;
  };
  Stack.prototype.scoping = function() {
    return this._nodes.filter(function(n) {
      return n._scope;
    }).map(function(n) {
      return n._scope;
    });
  };
  Stack.prototype.currentRegion = function() {
    let l = this._nodes.length;
    let node = this._nodes[--l];
    return node && [node.startLoc(), node.endLoc()];
  };
  var STACK = exports2.STACK = new Stack();
  function Node2() {
    this.setup();
    this;
  }
  exports2.Node = Node2;
  Node2.prototype.o = function(v) {
    return this._o;
  };
  Node2.prototype.setO = function(v) {
    this._o = v;
    return this;
  };
  Node2.prototype.options = function(v) {
    return this._options;
  };
  Node2.prototype.setOptions = function(v) {
    this._options = v;
    return this;
  };
  Node2.prototype.traversed = function(v) {
    return this._traversed;
  };
  Node2.prototype.setTraversed = function(v) {
    this._traversed = v;
    return this;
  };
  Node2.prototype.script = function() {
    return Compilation2.current;
  };
  Node2.prototype.safechain = function() {
    return false;
  };
  Node2.prototype.oid = function() {
    return this._oid || (this._oid = STACK.generateId(""));
  };
  Node2.prototype.osym = function(ns) {
    if (ns === void 0)
      ns = "";
    return STACK.getSymbol(this.oid() + ns);
  };
  Node2.prototype.symbolRef = function(name) {
    return STACK.root().symbolRef(name);
  };
  Node2.prototype.gsym = function(name) {
    return this.scope__().root().symbolRef(name);
  };
  Node2.prototype.sourceId = function() {
    return STACK.sourceId();
  };
  Node2.prototype.slf = function() {
    return this.scope__().context();
  };
  Node2.prototype.p = function() {
    if (STACK.loglevel() > 0) {
      console.log.apply(console, arguments);
    }
    ;
    return this;
  };
  Node2.prototype.runtime = function() {
    return STACK.runtime();
  };
  Node2.prototype.typeName = function() {
    return this.constructor.name;
  };
  Node2.prototype.namepath = function() {
    return this.typeName();
  };
  Node2.prototype.setup = function() {
    this._expression = false;
    this._traversed = false;
    this._parens = false;
    this._cache = null;
    this._value = null;
    return this;
  };
  Node2.prototype.setStartLoc = function(loc) {
    this._startLoc = loc;
    return this;
  };
  Node2.prototype.setEndLoc = function(loc) {
    this._endLoc = loc;
    return this;
  };
  Node2.prototype.setRegion = function(loc) {
    if (loc instanceof Node2) {
      loc = loc.region();
    }
    ;
    if (loc instanceof Array) {
      this._startLoc = loc[0];
      this._endLoc = loc[1];
    }
    ;
    return this;
  };
  Node2.prototype.setEnds = function(start, end) {
    if (end && end.endLoc) {
      this._endLoc = end.endLoc();
    }
    ;
    if (start && start.startLoc) {
      this._startLoc = start.startLoc();
    }
    ;
    return this;
  };
  Node2.prototype.startLoc = function() {
    return this._startLoc;
  };
  Node2.prototype.endLoc = function() {
    return this._endLoc;
  };
  Node2.prototype.set = function(obj) {
    this._options || (this._options = {});
    for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++) {
      k = keys[i];
      v = obj[k];
      this._options[k] = v;
    }
    ;
    return this;
  };
  Node2.prototype.option = function(key, val) {
    if (val != void 0) {
      this._options || (this._options = {});
      this._options[key] = val;
      return this;
    }
    ;
    return this._options && this._options[key];
  };
  Node2.prototype.o = function() {
    return this._options || (this._options = {});
  };
  Node2.prototype.keyword = function() {
    return this._keyword || this._options && this._options.keyword;
  };
  Node2.prototype.datatype = function() {
    return this._options ? this._options.datatype : null;
  };
  Node2.prototype.configure = function(obj) {
    return this.set(obj);
  };
  Node2.prototype.region = function() {
    return [0, 0];
  };
  Node2.prototype.loc = function() {
    return [0, 0];
  };
  Node2.prototype.token = function() {
    return null;
  };
  Node2.prototype.compile = function() {
    return this;
  };
  Node2.prototype.visit = function() {
    return this;
  };
  Node2.prototype.stack = function() {
    return STACK;
  };
  Node2.prototype.isString = function() {
    return false;
  };
  Node2.prototype.isPrimitive = function(deep) {
    return false;
  };
  Node2.prototype.isReserved = function() {
    return false;
  };
  Node2.prototype.traverse = function(o) {
    if (this._traversed) {
      return this;
    }
    ;
    this._traversed = true;
    let prev;
    if (o) {
      prev = STACK.state();
      STACK.setState(o);
    }
    ;
    STACK.push(this);
    this.visit(STACK, STACK.state());
    STACK.pop(this);
    if (o) {
      STACK.setState(prev);
    }
    ;
    return this;
  };
  Node2.prototype.inspect = function() {
    return {type: this.constructor.toString()};
  };
  Node2.prototype.js = function(o) {
    return "NODE";
  };
  Node2.prototype.toString = function() {
    return "" + this.constructor.name;
  };
  Node2.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      return node.register(this);
    }
    ;
    if (node instanceof PushAssign) {
      node.register(this);
      return new PushAssign(node.op(), node.left(), this);
    }
    ;
    if (node instanceof Assign) {
      return OP(node.op(), node.left(), this);
    } else if (node instanceof VarDeclaration) {
      return OP("=", node.left(), this);
    } else if (node instanceof Op) {
      return OP(node.op(), node.left(), this);
    } else if (node instanceof Return) {
      return new Return(this);
    }
    ;
    return this;
  };
  Node2.prototype.toExpression = function() {
    this._expression = true;
    return this;
  };
  Node2.prototype.forceExpression = function() {
    this._expression = true;
    return this;
  };
  Node2.prototype.isExpressable = function() {
    return true;
  };
  Node2.prototype.isExpression = function() {
    return this._expression || false;
  };
  Node2.prototype.hasSideEffects = function() {
    return true;
  };
  Node2.prototype.isUsed = function() {
    return true;
  };
  Node2.prototype.shouldParenthesize = function() {
    return false;
  };
  Node2.prototype.shouldParenthesizeInTernary = function() {
    return true;
  };
  Node2.prototype.block = function() {
    return Block.wrap([this]);
  };
  Node2.prototype.node = function() {
    return this;
  };
  Node2.prototype.scope__ = function() {
    return STACK.scope();
  };
  Node2.prototype.up = function() {
    return STACK.parent();
  };
  Node2.prototype.util = function() {
    return Util;
  };
  Node2.prototype.receiver = function() {
    return this;
  };
  Node2.prototype.indented = function(a, b) {
    if (a instanceof Indentation) {
      this._indentation = a;
      return this;
    }
    ;
    if (b instanceof Array) {
      this.add(b[0]);
      b = b[1];
    }
    ;
    this._indentation || (this._indentation = a && b ? new Indentation(a, b) : INDENT);
    return this;
  };
  Node2.prototype.prebreak = function(term) {
    if (term === void 0)
      term = "\n";
    return this;
  };
  Node2.prototype.invert = function() {
    return OP("!", this);
  };
  Node2.prototype.cache = function(o) {
    if (o === void 0)
      o = {};
    this._cache = o;
    o.var = (o.scope || this.scope__()).temporary(this, o);
    o.lookups = 0;
    return this;
  };
  Node2.prototype.cachevar = function() {
    return this._cache && this._cache.var;
  };
  Node2.prototype.decache = function() {
    if (this._cache) {
      this.cachevar().free();
      this._cache = null;
    }
    ;
    return this;
  };
  Node2.prototype.alias = function() {
    return null;
  };
  Node2.prototype.warn = function(message, opts) {
    if (opts === void 0)
      opts = {};
    let loc = opts.loc || this.loc() || [0, 0];
    console.log("loc warn", loc, this.script().rangeAt(loc[0], loc[1]));
    return this.script().addDiagnostic(opts.severity || "warning", {
      message,
      range: this.script().rangeAt(loc[0], loc[1])
    });
  };
  Node2.prototype.error = function(message, opts) {
    if (opts === void 0)
      opts = {};
    opts.severity = "error";
    return this.warn(message, opts);
  };
  Node2.prototype.c = function(o) {
    var indent;
    var s = STACK;
    var ch = this._cache;
    if (ch && ch.cached) {
      return this.c_cached(ch);
    }
    ;
    s.push(this);
    if (o && o.expression)
      this.forceExpression();
    if (o && o.indent) {
      this._indentation || (this._indentation = INDENT);
    }
    ;
    var out = this.js(s, o);
    var paren = this.shouldParenthesize();
    s.pop(this);
    if (out == void 0) {
      return out;
    }
    ;
    if (indent = this._indentation) {
      out = indent.wrap(out, o);
      this;
    }
    ;
    if (paren) {
      out = "(" + out + ")";
    }
    ;
    if (o && o.braces || this._options && this._options.braces) {
      if (indent) {
        out = "{" + out + "}";
      } else {
        out = "{ " + out + " }";
      }
      ;
    }
    ;
    if (ch = this._cache) {
      if (!ch.manual) {
        out = "" + ch.var.c() + " = " + out;
      }
      ;
      var par = s.current();
      if (par instanceof ValueNode2) {
        par = par.node();
      }
      ;
      if (par instanceof Access || par instanceof Op) {
        out = "(" + out + ")";
      }
      ;
      ch.cached = true;
    }
    ;
    if (OPTS.sourceMap && (!o || o.mark !== false)) {
      out = M2(out, this);
    }
    ;
    return out;
  };
  Node2.prototype.c_cached = function(cache) {
    cache.lookups++;
    if (cache.uses == cache.lookups) {
      cache.var.free();
    }
    ;
    return cache.var.c();
  };
  function ValueNode2(value) {
    this.setup();
    this._value = this.load(value);
  }
  subclass$(ValueNode2, Node2);
  exports2.ValueNode = ValueNode2;
  ValueNode2.prototype.value = function(v) {
    return this._value;
  };
  ValueNode2.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  ValueNode2.prototype.startLoc = function() {
    return this._value && this._value.startLoc && this._value.startLoc();
  };
  ValueNode2.prototype.endLoc = function() {
    return this._value && this._value.endLoc && this._value.endLoc();
  };
  ValueNode2.prototype.load = function(value) {
    return value;
  };
  ValueNode2.prototype.js = function(o) {
    return typeof this._value == "string" ? this._value : this._value.c();
  };
  ValueNode2.prototype.visit = function() {
    if (this._value instanceof Node2) {
      this._value.traverse();
    }
    ;
    return this;
  };
  ValueNode2.prototype.region = function() {
    return [this._value._loc, this._value._loc + this._value._len];
  };
  function ExpressionNode() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(ExpressionNode, ValueNode2);
  exports2.ExpressionNode = ExpressionNode;
  function AssertionNode() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(AssertionNode, ValueNode2);
  exports2.AssertionNode = AssertionNode;
  AssertionNode.prototype.js = function(o) {
    let op = this._value;
    let out = [];
    if (op instanceof Op && !(op instanceof Access)) {
      let l = op.left();
      let r = op.right();
      out.push(l.cache().c(o));
      out.push(helpers2.singlequote(op._op));
      out.push(r.cache().c(o));
      out = ["imba.$a=[" + out.join(",") + "]"];
      out.push(op.c(o));
    } else {
      out.push("imba.$a=null");
      out.push(op.c(o));
    }
    ;
    return "(" + out.join(",") + ")";
  };
  function Statement() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Statement, ValueNode2);
  exports2.Statement = Statement;
  Statement.prototype.isExpressable = function() {
    return false;
  };
  function Meta() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Meta, ValueNode2);
  exports2.Meta = Meta;
  Meta.prototype.isPrimitive = function(deep) {
    return true;
  };
  function Comment() {
    return Meta.apply(this, arguments);
  }
  subclass$(Comment, Meta);
  exports2.Comment = Comment;
  Comment.prototype.visit = function() {
    var block, next;
    if (block = this.up()) {
      var idx = block.indexOf(this) + 1;
      if (block.index(idx) instanceof Terminator) {
        idx += 1;
      }
      ;
      if (next = block.index(idx)) {
        next._desc = this;
      }
      ;
    }
    ;
    return this;
  };
  Comment.prototype.toDoc = function() {
    return helpers2.normalizeIndentation("" + this._value._value);
  };
  Comment.prototype.toJSON = function() {
    return helpers2.normalizeIndentation("" + this._value._value);
  };
  Comment.prototype.c = function(o) {
    if (STACK.option("comments") == false) {
      return "";
    }
    ;
    var v = this._value._value;
    if (o && o.expression || v.match(/\n/) || this._value.type() == "HERECOMMENT") {
      var out = v.replace(/\*\//g, "\\*\\/").replace(/\/\*/g, "\\/\\*");
      return "/*" + out + "*/";
    } else if (v.match(/\@(type|param)/)) {
      return "/** " + v + " */";
    } else {
      return "// " + v;
    }
    ;
  };
  function Terminator(v) {
    this._value = v;
    this;
  }
  subclass$(Terminator, Meta);
  exports2.Terminator = Terminator;
  Terminator.prototype.traverse = function() {
    return this;
  };
  Terminator.prototype.loc = function() {
    return [this._value._loc, this._value._loc + this._value._value.length];
  };
  Terminator.prototype.startLoc = function() {
    return this._value.startLoc ? this._value.startLoc() : -1;
  };
  Terminator.prototype.endLoc = function() {
    return this._value._value ? this.startLoc() + this._value._value.length : -1;
  };
  Terminator.prototype.c = function() {
    let val = this._value.c();
    if (STACK.option("comments") == false) {
      val = val.replace(/\/\/.*$/gm, "");
    }
    ;
    if (STACK.tsc() && (val.length > 1 || this._first)) {
      return M2(val.replace(/^[\t ]+/gm, ""), this);
    }
    ;
    return val.replace(/^[\t ]+/gm, "");
  };
  function Newline(v) {
    this._traversed = false;
    this._value = v || "\n";
  }
  subclass$(Newline, Terminator);
  exports2.Newline = Newline;
  Newline.prototype.c = function() {
    return this._value;
  };
  function Index() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Index, ValueNode2);
  exports2.Index = Index;
  Index.prototype.cache = function(o) {
    if (o === void 0)
      o = {};
    return this._value.cache(o);
  };
  Index.prototype.js = function(o) {
    return this._value.c();
  };
  function ListNode(list) {
    this.setup();
    this._nodes = this.load(list || []);
    this._indentation = null;
  }
  subclass$(ListNode, Node2);
  exports2.ListNode = ListNode;
  ListNode.prototype.nodes = function(v) {
    return this._nodes;
  };
  ListNode.prototype.setNodes = function(v) {
    this._nodes = v;
    return this;
  };
  ListNode.prototype.list = function() {
    return this._nodes;
  };
  ListNode.prototype.compact = function() {
    this._nodes = AST.compact(this._nodes);
    return this;
  };
  ListNode.prototype.load = function(list) {
    return list;
  };
  ListNode.prototype.concat = function(other) {
    this._nodes = this.nodes().concat(other instanceof Array ? other : other.nodes());
    return this;
  };
  ListNode.prototype.swap = function(item, other) {
    var idx = this.indexOf(item);
    if (idx >= 0) {
      this.nodes()[idx] = other;
    }
    ;
    return this;
  };
  ListNode.prototype.push = function(item) {
    this._nodes.push(item);
    return this;
  };
  ListNode.prototype.pop = function() {
    var end = this._nodes.pop();
    return end;
  };
  ListNode.prototype.add = function(item, o) {
    let idx = null;
    if (o && o.before) {
      idx = this._nodes.indexOf(o.before);
      if (idx == -1) {
        idx = null;
      }
      ;
    } else if (o && o.after) {
      idx = this._nodes.indexOf(o.after) + 1;
      if (idx == 0) {
        idx = null;
      }
      ;
      if (idx >= 1) {
        while (this._nodes[idx] instanceof Meta) {
          idx++;
        }
        ;
      }
      ;
    } else if (typeof o == "number" || o instanceof Number) {
      idx = o;
    }
    ;
    if (idx !== null) {
      item instanceof Array ? this._nodes.splice.apply(this._nodes, [].concat([idx, 0], Array.from(item))) : this._nodes.splice(idx, 0, item);
    } else {
      item instanceof Array ? this._nodes.push.apply(this._nodes, item) : this._nodes.push(item);
    }
    ;
    return this;
  };
  ListNode.prototype.unshift = function(item, br) {
    if (br) {
      this._nodes.unshift(BR);
    }
    ;
    this._nodes.unshift(item);
    return this;
  };
  ListNode.prototype.slice = function(a, b) {
    return new this.constructor(this._nodes.slice(a, b));
  };
  ListNode.prototype.break = function(br, pre) {
    if (pre === void 0)
      pre = false;
    if (typeof br == "string") {
      br = new Terminator(br);
    }
    ;
    pre ? this.unshift(br) : this.push(br);
    return this;
  };
  ListNode.prototype.some = function(cb) {
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (cb(node)) {
        return true;
      }
      ;
    }
    ;
    return false;
  };
  ListNode.prototype.every = function(cb) {
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (!cb(node)) {
        return false;
      }
      ;
    }
    ;
    return true;
  };
  ListNode.prototype.values = function() {
    return this._nodes.filter(function(item) {
      return !(item instanceof Meta);
    });
  };
  ListNode.prototype.filter = function(cb) {
    return this._nodes.filter(cb);
  };
  ListNode.prototype.pluck = function(cb) {
    var item = this.filter(cb)[0];
    if (item) {
      this.remove(item);
    }
    ;
    return item;
  };
  ListNode.prototype.indexOf = function(item) {
    return this._nodes.indexOf(item);
  };
  ListNode.prototype.index = function(i) {
    return this._nodes[i];
  };
  ListNode.prototype.remove = function(item) {
    var idx = this._nodes.indexOf(item);
    if (idx >= 0) {
      this._nodes.splice(idx, 1);
    }
    ;
    return this;
  };
  ListNode.prototype.removeAt = function(idx) {
    var item = this._nodes[idx];
    if (idx >= 0) {
      this._nodes.splice(idx, 1);
    }
    ;
    return item;
  };
  ListNode.prototype.replace = function(original, replacement) {
    var idx = this._nodes.indexOf(original);
    if (idx >= 0) {
      if (replacement instanceof Array) {
        this._nodes.splice.apply(this._nodes, [].concat([idx, 1], Array.from(replacement)));
      } else {
        this._nodes[idx] = replacement;
      }
      ;
    }
    ;
    return this;
  };
  ListNode.prototype.first = function() {
    return this._nodes[0];
  };
  ListNode.prototype.last = function() {
    var i = this._nodes.length;
    while (i) {
      i = i - 1;
      var v = this._nodes[i];
      if (!(v instanceof Meta)) {
        return v;
      }
      ;
    }
    ;
    return null;
  };
  ListNode.prototype.map = function(fn) {
    return this._nodes.map(fn);
  };
  ListNode.prototype.forEach = function(fn) {
    return this._nodes.forEach(fn);
  };
  ListNode.prototype.remap = function(fn) {
    this._nodes = this.map(fn);
    return this;
  };
  ListNode.prototype.count = function() {
    return this._nodes.length;
  };
  ListNode.prototype.len = function() {
    return this._nodes.length;
  };
  ListNode.prototype.realCount = function() {
    var k = 0;
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node && !(node instanceof Meta)) {
        k++;
      }
      ;
    }
    ;
    return k;
  };
  ListNode.prototype.isEmpty = function() {
    return this.realCount() == 0;
  };
  ListNode.prototype.visit = function() {
    let items = this._nodes;
    let i = 0;
    while (i < items.length) {
      let item = items[i];
      if (item.traverse) {
        let res = item.traverse();
        if (res != item) {
          if (res instanceof Array) {
            items.splice.apply(items, [].concat([i, 1], Array.from(res)));
            continue;
          }
          ;
        }
        ;
      }
      ;
      i++;
    }
    ;
    return this;
  };
  ListNode.prototype.isExpressable = function() {
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node && !node.isExpressable()) {
        return false;
      }
      ;
    }
    ;
    return true;
  };
  ListNode.prototype.toArray = function() {
    return this._nodes;
  };
  ListNode.prototype.delimiter = function() {
    return this._delimiter || ",";
  };
  ListNode.prototype.js = function(o, pars) {
    if (!pars || pars.constructor !== Object)
      pars = {};
    var nodes = pars.nodes !== void 0 ? pars.nodes : this._nodes;
    var delim = ",";
    var express = delim != ";";
    var last = this.last();
    var i = 0;
    var l = nodes.length;
    var str = "";
    for (let j = 0, items = iter$7(nodes), len = items.length, arg; j < len; j++) {
      arg = items[j];
      var part = typeof arg == "string" ? arg : arg ? arg.c({expression: express}) : "";
      str += part;
      if (part && (!express || arg != last) && !(arg instanceof Meta)) {
        str += delim;
      }
      ;
    }
    ;
    return str;
  };
  ListNode.prototype.indented = function(a, b) {
    if (a instanceof Indentation) {
      this._indentation = a;
      return this;
    }
    ;
    this._indentation || (this._indentation = a && b ? new Indentation(a, b) : INDENT);
    return this;
  };
  ListNode.prototype.endLoc = function() {
    var $1;
    if (this._endLoc) {
      return this._endLoc;
    }
    ;
    var i = this._nodes.length;
    let last = this._nodes[i - 1];
    return ($1 = last) && $1.endLoc && $1.endLoc();
  };
  function ArgList() {
    return ListNode.apply(this, arguments);
  }
  subclass$(ArgList, ListNode);
  exports2.ArgList = ArgList;
  ArgList.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      this._nodes = this._nodes.map(function(child) {
        if (!(child instanceof Meta)) {
          return child.consume(node);
        } else {
          return child;
        }
        ;
      });
      return this;
    }
    ;
    return ArgList.prototype.__super__.consume.apply(this, arguments);
  };
  function AssignList() {
    return ArgList.apply(this, arguments);
  }
  subclass$(AssignList, ArgList);
  exports2.AssignList = AssignList;
  AssignList.prototype.concat = function(other) {
    if (this._nodes.length == 0 && other instanceof AssignList) {
      return other;
    } else {
      AssignList.prototype.__super__.concat.call(this, other);
    }
    ;
    return this;
  };
  function Block(list) {
    this.setup();
    this._nodes = list || [];
    this._head = null;
    this._indentation = null;
  }
  subclass$(Block, ListNode);
  exports2.Block = Block;
  Block.prototype.head = function(v) {
    return this._head;
  };
  Block.prototype.setHead = function(v) {
    this._head = v;
    return this;
  };
  Block.prototype.startLoc = function() {
    return this._indentation ? this._indentation.startLoc() : Block.prototype.__super__.startLoc.apply(this, arguments);
  };
  Block.prototype.endLoc = function() {
    return this._indentation ? this._indentation.endLoc() : Block.prototype.__super__.endLoc.apply(this, arguments);
  };
  Block.wrap = function(ary) {
    if (!(ary instanceof Array)) {
      throw new SyntaxError("what");
    }
    ;
    return ary.length == 1 && ary[0] instanceof Block ? ary[0] : new Block(ary);
  };
  Block.prototype.visit = function(stack) {
    if (this._scope) {
      this._scope.visit();
    }
    ;
    if (stack && stack._tag) {
      this._tag = stack._tag;
    }
    ;
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      node && node.traverse();
    }
    ;
    return this;
  };
  Block.prototype.block = function() {
    return this;
  };
  Block.prototype.collectDecorators = function() {
    var decorators;
    if (decorators = this._decorators) {
      this._decorators = null;
      return decorators;
    }
    ;
  };
  Block.prototype.loc = function() {
    var opt, ind;
    if (opt = this.option("ends")) {
      var a = opt[0].loc();
      var b = opt[1].loc();
      if (!a) {
        this.p("no loc for " + opt[0]);
      }
      ;
      if (!b) {
        this.p("no loc for " + opt[1]);
      }
      ;
      return [a[0], b[1]];
    }
    ;
    if (ind = this._indentation) {
      if (ind.aloc() != -1) {
        return [ind.aloc(), ind.bloc()];
      }
      ;
    }
    ;
    a = this._nodes[0];
    b = this._nodes[this._nodes.length - 1];
    return [a && a.loc()[0] || 0, b && b.loc()[1] || 0];
  };
  Block.prototype.unwrap = function() {
    var ary = [];
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node instanceof Block) {
        ary.push.apply(ary, node.unwrap());
      } else {
        ary.push(node);
      }
      ;
    }
    ;
    return ary;
  };
  Block.prototype.compile = function(o) {
    if (o === void 0)
      o = {};
    var root = new Root2(this, o);
    return root.compile(o);
  };
  Block.prototype.analyze = function(o) {
    if (o === void 0)
      o = {};
    return this;
  };
  Block.prototype.cpart = function(node) {
    if (node === BR0) {
      return "";
    }
    ;
    var out = typeof node == "string" ? node : node ? node.c() : "";
    if (out == null || out == void 0 || out == "") {
      return "";
    }
    ;
    if (out instanceof Array) {
      var str = "";
      var l = out.length;
      var i = 0;
      while (i < l) {
        str += this.cpart(out[i++]);
      }
      ;
      return str;
    }
    ;
    var hasSemiColon = SEMICOLON_TEST.test(out);
    if (!(hasSemiColon || node instanceof Meta)) {
      out += this.delimiter();
    }
    ;
    return out;
  };
  Block.prototype.delimiter = function() {
    return this._delimiter == void 0 ? ";" : this._delimiter;
  };
  Block.prototype.js = function(o, opts) {
    var ast2 = this._nodes;
    var l = ast2.length;
    var express = this.isExpression() || o.isExpression() || this.option("express") && this.isExpressable();
    if (ast2.length == 0 && (!this._head || this._head.length == 0)) {
      return "";
    }
    ;
    if (express) {
      return Block.prototype.__super__.js.call(this, o, {nodes: ast2});
    }
    ;
    var str = "";
    let empty2 = false;
    for (let i = 0, items = iter$7(ast2), len = items.length; i < len; i++) {
      let vs = this.cpart(items[i]);
      if (vs[0] == "\n" && /^\n+$/.test(vs)) {
        if (empty2) {
          continue;
        }
        ;
        empty2 = true;
      } else if (vs) {
        empty2 = false;
      }
      ;
      str += vs;
    }
    ;
    if (this._head && this._head.length > 0) {
      var prefix = "";
      for (let i = 0, items = iter$7(this._head), len = items.length; i < len; i++) {
        var hv = this.cpart(items[i]);
        if (hv) {
          prefix += hv + "\n";
        }
        ;
      }
      ;
      str = prefix + str;
    }
    ;
    if (this.option("strict")) {
      str = this.cpart('"use strict";\n') + str;
    }
    ;
    return str;
  };
  Block.prototype.defers = function(original, replacement) {
    var idx = this._nodes.indexOf(original);
    if (idx >= 0) {
      this._nodes[idx] = replacement;
    }
    ;
    var rest = this._nodes.splice(idx + 1);
    return rest;
  };
  Block.prototype.expressions = function() {
    var expressions = [];
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, node; i < len; i++) {
      node = items[i];
      if (!(node instanceof Terminator)) {
        expressions.push(node);
      }
      ;
    }
    ;
    return expressions;
  };
  Block.prototype.consume = function(node) {
    var before;
    if (node instanceof TagLike) {
      let real = this.expressions();
      this._nodes = this._nodes.map(function(child) {
        if (idx$(child, real) >= 0 && !(child instanceof Assign)) {
          return child.consume(node);
        } else {
          return child;
        }
        ;
      });
      return this;
    }
    ;
    if (before = this.last()) {
      var after = before.consume(node);
      if (after != before) {
        if (after instanceof Block) {
          after = after.nodes();
        }
        ;
        this.replace(before, after);
      }
      ;
    }
    ;
    return this;
  };
  Block.prototype.isExpressable = function() {
    if (!this._nodes.every(function(v) {
      return v.isExpressable();
    })) {
      return false;
    }
    ;
    return true;
  };
  Block.prototype.isExpression = function() {
    return this.option("express") || this._expression;
  };
  Block.prototype.shouldParenthesizeInTernary = function() {
    if (this.count() == 1) {
      return this.first().shouldParenthesizeInTernary();
    }
    ;
    return true;
  };
  Block.prototype.indented = function(a, b) {
    var post;
    Block.prototype.__super__.indented.apply(this, arguments);
    if (a instanceof Token2 && a._type == "INDENT") {
      if (post = a._meta && a._meta.post) {
        let br = new Token2("TERMINATOR", post);
        this._nodes.unshift(new Terminator(br));
        a._meta.post = "";
      }
      ;
    }
    ;
    return this;
  };
  function ClassInitBlock() {
    return Block.apply(this, arguments);
  }
  subclass$(ClassInitBlock, Block);
  function InstanceInitBlock() {
    return Block.apply(this, arguments);
  }
  subclass$(InstanceInitBlock, Block);
  function ClassField(name) {
    ClassField.prototype.__super__.constructor.apply(this, arguments);
    this._name = name;
  }
  subclass$(ClassField, Node2);
  exports2.ClassField = ClassField;
  ClassField.prototype.name = function(v) {
    return this._name;
  };
  ClassField.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  ClassField.prototype.visit = function() {
    var up_;
    this._decorators = (up_ = this.up()) && up_.collectDecorators && up_.collectDecorators();
    this._classdecl = STACK.up(ClassDeclaration);
    if (this._name && this._name.traverse) {
      this._name.traverse();
    }
    ;
    if (this.value()) {
      this.value()._scope = this._vscope = new FieldScope(this.value());
      this.value()._scope._parent = this.scope__();
      this.value().traverse();
    }
    ;
    if (this.watchBody()) {
      this._descriptor = STACK.root().declare("" + this.oid() + "$Prop", this.util().watcher(this.storageSymbol(), this.watcherSymbol()), {type: "const", system: true});
    }
    ;
    return this;
  };
  ClassField.prototype.value = function() {
    return this.option("value");
  };
  ClassField.prototype.target = function() {
    return this.option("static") ? LIT("this") : LIT("this.prototype");
  };
  ClassField.prototype.storageSymbol = function() {
    return this.symbolRef("#" + this.name().c({as: "symbolpart"}));
  };
  ClassField.prototype.watcherSymbol = function() {
    return this.symbolRef("#" + this.name().c({as: "symbolpart"}) + "DidSet");
  };
  ClassField.prototype.storageKey = function() {
    return this._storageKey || (this._storageKey = STR(this.name().c() + "$$"));
  };
  ClassField.prototype.storageMap = function() {
    return this._storageMap || (this._storageMap = this.scope__().root().declare(null, LIT("new WeakMap()")));
  };
  ClassField.prototype.isPlain = function() {
    return !this._decorators && (!this._value || this._value.isPrimitive());
  };
  ClassField.prototype.isLazy = function() {
    return false;
  };
  ClassField.prototype.hasStaticInits = function() {
    return this.isStatic() || this._decorators;
  };
  ClassField.prototype.hasConstructorInits = function() {
    return !this.isStatic();
  };
  ClassField.prototype.isStatic = function() {
    return this.option("static");
  };
  ClassField.prototype.watchBody = function() {
    return this.option("watch");
  };
  ClassField.prototype.loc = function() {
    return [this._name._loc, this._name.region()[1]];
  };
  ClassField.prototype.c = function() {
    var fn, fn1;
    if (this.option("struct")) {
      return;
    }
    ;
    let up = STACK.current();
    let out;
    if (up instanceof ClassBody) {
      let prefix = this.isStatic() ? "" + M2("static", this.option("static")) + " " : "";
      let name = this.name() instanceof IdentifierExpression ? this.name().asObjectKey() : this.name().c();
      if (STACK.tsc()) {
        out = "" + prefix + M2(name, this._name);
        if (this.value()) {
          out += " = " + this.value().c();
        }
        ;
        let typ = this.datatype();
        if (typ) {
          out = "" + typ.c() + " " + out;
        }
        ;
      } else if (this instanceof ClassAttribute || this._decorators && this._decorators.length > 0) {
        let setter = "" + prefix + "set " + name + this.setter().c({keyword: ""});
        let getter = "" + prefix + "get " + name + this.getter().c({keyword: ""});
        let delim = this._classdecl && this._classdecl.isExtension() ? ",\n" : "\n";
        out = "" + setter + delim + getter;
      }
      ;
      return out;
    }
    ;
    if (STACK.tsc()) {
      return;
    }
    ;
    if (this.isStatic() && up instanceof ClassInitBlock) {
      if (this._vscope) {
        if (fn = STACK.up(Func)) {
          this._vscope.mergeScopeInto(fn._scope);
        }
        ;
      }
      ;
      out = OP("=", OP(".", THIS, this.name()), this.value() || UNDEFINED).c() + ";\n";
    } else if (!this.isStatic() && up instanceof ClassInitBlock) {
      return "";
      let key = this.name();
      if (this.name() instanceof Identifier) {
        key = this.name().toStr();
      }
      ;
      let tpl = "Object.defineProperty(this.prototype," + key.c() + ",{\n	enumerable: true,\n	set" + this.setter().c({keyword: ""}) + ",\n	get" + this.getter().c({keyword: ""}) + "\n})";
      return tpl;
    } else if (!this.isStatic() && up instanceof InstanceInitBlock) {
      if (this._vscope) {
        if (fn1 = STACK.up(Func)) {
          this._vscope.mergeScopeInto(fn1._scope);
        }
        ;
      }
      ;
      let key = this.name();
      if (this.name() instanceof Identifier) {
        key = this.name().toStr();
      }
      ;
      let ctor = up.option("ctor");
      let opts = up.option("opts");
      let val = this.value() || UNDEFINED;
      let paramIndex = this.option("paramIndex");
      let restIndex = this.option("restIndex");
      let access;
      if (paramIndex != void 0) {
        let name = this.option("paramName");
        access = ctor._params.at(paramIndex, true, name);
        if (this.value()) {
          val = If.ternary(OP("!==", access, UNDEFINED), access, val);
        } else {
          val = access;
        }
        ;
      } else if (restIndex != void 0) {
        let rest = ctor._params.at(restIndex, true, "$$", LIT("null"));
        access = OP(".", rest, this.name());
        if (this.value()) {
          access.cache({reuse: true, name: "v"});
          val = If.ternary(OP("&&", rest, OP("!==", access, UNDEFINED)), access, val);
        } else {
          val = If.ternary(rest, access, UNDEFINED);
        }
        ;
      }
      ;
      if (this instanceof ClassAttribute && !this.value()) {
        return;
      }
      ;
      out = OP("=", OP(".", THIS, this.name()), val).c() + ";\n";
      if (this.watchBody()) {
        this._descriptor || (this._descriptor = STACK.root().declare("" + this.oid() + "$Prop", this.util().watcher(this.storageSymbol(), this.watcherSymbol()), {type: "const", system: true}));
        out = "Object.defineProperty(this," + key.c() + "," + this._descriptor.c() + ");\n" + out;
      }
      ;
    }
    ;
    return out;
  };
  ClassField.prototype.getter = function() {
    if (!this._getter) {
      if (true) {
        return this.parseTemplate("(){ return $get$; }");
        let op = GET(THIS, this.storageSymbol());
        return FN([], [op]);
        op = CALL(GET(this.storageMap(), "get"), [THIS]);
        let getter = op;
        if (this.value() && false) {
          let inlined = this.value() instanceof Num || this.value() instanceof Str || this.value() instanceof Bool;
          let has = CALL(GET(this.storageMap(), "has"), [THIS]);
          if (inlined) {
            op = METH([], [If.ternary(has, op, this.value())]);
          } else {
            let setter = CALL(GET(this.storageMap(), "set"), [THIS, this.value()]);
            op = IF(OP("!", has), setter);
            op = METH([], [op, BR, getter]);
          }
          ;
          op.traverse();
          return op;
        } else {
          return FN([], [op]);
        }
        ;
      }
    } else {
      return this._getter;
    }
    ;
  };
  ClassField.prototype.setterForValue = function(value) {
    return OP("=", OP(".", THIS, this.storageKey()), value);
  };
  ClassField.prototype.parseTemplate = function(tpl) {
    var self3 = this;
    tpl = tpl.replace(/\$(\w+)\$/g, function(m, key) {
      if (key == "get") {
        return GET(THIS, self3.storageSymbol()).c();
      } else if (key == "set") {
        return OP("=", GET(THIS, self3.storageSymbol()), LIT("value")).c();
      } else if (key == "watcher") {
        return GET(THIS, self3.watcherSymbol()).c();
      } else {
        return "";
      }
      ;
    });
    return LIT(tpl);
  };
  ClassField.prototype.setter = function() {
    return this._setter || (this._setter = this.parseTemplate("(value){ $set$; }"));
  };
  ClassField.prototype.decorater = function() {
    return this._decorater || (this._decorater = this.util().decorate(new Arr(this._decorators), this.target(), this.name(), LIT("null")));
  };
  function ClassAttribute() {
    return ClassField.apply(this, arguments);
  }
  subclass$(ClassAttribute, ClassField);
  exports2.ClassAttribute = ClassAttribute;
  ClassAttribute.prototype.getter = function() {
    var op;
    return this._getter || (this._getter = (op = CALL(GET(THIS, "getAttribute"), [this.name().toAttrString()]), FN([], [op])));
  };
  ClassAttribute.prototype.setter = function() {
    var op;
    return this._setter || (this._setter = (op = CALL(GET(THIS, "setAttribute"), [this.name().toAttrString(), LIT("value")]), FN([LIT("value")], [op]).set({noreturn: true})));
  };
  function ClassBody() {
    return Block.apply(this, arguments);
  }
  subclass$(ClassBody, Block);
  exports2.ClassBody = ClassBody;
  ClassBody.prototype.setup = function() {
    ClassBody.prototype.__super__.setup.apply(this, arguments);
    this._fields = [];
    return this._staticFields = [];
  };
  ClassBody.prototype.visit = function(stack) {
    if (this._scope) {
      this._scope.visit();
    }
    ;
    if (stack && stack._tag) {
      this._tag = stack._tag;
    }
    ;
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node instanceof Tag) {
        let meth = new MethodDeclaration([], [node], new Identifier("render"), null, {});
        this._nodes[i] = node = meth;
      }
      ;
      node && node.traverse();
    }
    ;
    return this;
  };
  function ExpressionList() {
    return Block.apply(this, arguments);
  }
  subclass$(ExpressionList, Block);
  exports2.ExpressionList = ExpressionList;
  function VarDeclList() {
    return Block.apply(this, arguments);
  }
  subclass$(VarDeclList, Block);
  exports2.VarDeclList = VarDeclList;
  VarDeclList.prototype.type = function() {
    return this.option("type") || "var";
  };
  VarDeclList.prototype.add = function(part) {
    if (this._nodes.length) {
      this.push(BR);
    }
    ;
    let node = new VarDeclaration(part[0], part[1], this.type()).set({decl: this, datatype: part[0].option("datatype")});
    if (!this._firstDeclaration) {
      this._firstDeclaration = node;
      node.set({keyword: this.keyword()});
    }
    ;
    this.push(node);
    return this;
  };
  VarDeclList.prototype.consume = function(node) {
    if (this._nodes.length == 1) {
      return this._nodes[0].consume(node);
    }
    ;
    return this;
  };
  function Parens(value, open, close) {
    this.setup();
    this._open = open;
    this._close = close;
    this._value = this.load(value);
  }
  subclass$(Parens, ValueNode2);
  exports2.Parens = Parens;
  Parens.prototype.load = function(value) {
    this._noparen = false;
    return value instanceof Block && value.count() == 1 ? value.first() : value;
  };
  Parens.prototype.isString = function() {
    return this._open && String(this._open) == '("' || this.value().isString();
  };
  Parens.prototype.js = function(o) {
    var par = this.up();
    var v = this._value;
    var str = null;
    if (v instanceof Func) {
      this._noparen = true;
    }
    ;
    if (par instanceof Block) {
      if (!o.isExpression()) {
        this._noparen = true;
      }
      ;
      str = v instanceof Array ? AST.cary(v) : v.c({expression: o.isExpression()});
    } else {
      str = v instanceof Array ? AST.cary(v) : v.c({expression: true});
    }
    ;
    if (this.datatype() && STACK.tsc()) {
      str = this.datatype().c() + "(" + str + ")";
    }
    ;
    return str;
  };
  Parens.prototype.set = function(obj) {
    return Parens.prototype.__super__.set.call(this, obj);
  };
  Parens.prototype.shouldParenthesize = function() {
    if (this._noparen) {
      return false;
    }
    ;
    return true;
  };
  Parens.prototype.prebreak = function(br) {
    Parens.prototype.__super__.prebreak.call(this, br);
    console.log("PREBREAK");
    if (this._value) {
      this._value.prebreak(br);
    }
    ;
    return this;
  };
  Parens.prototype.isExpressable = function() {
    return this._value.isExpressable();
  };
  Parens.prototype.consume = function(node) {
    return this._value.consume(node);
  };
  function PureExpression() {
    return Parens.apply(this, arguments);
  }
  subclass$(PureExpression, Parens);
  exports2.PureExpression = PureExpression;
  function ExpressionBlock() {
    return ListNode.apply(this, arguments);
  }
  subclass$(ExpressionBlock, ListNode);
  exports2.ExpressionBlock = ExpressionBlock;
  ExpressionBlock.prototype.c = function(o) {
    return this.map(function(item) {
      return item.c(o);
    }).join(",");
  };
  ExpressionBlock.prototype.consume = function(node) {
    return this.value().consume(node);
  };
  function Return(v) {
    this._traversed = false;
    this._value = v instanceof ArgList && v.count() == 1 ? v.last() : v;
    return this;
  }
  subclass$(Return, Statement);
  exports2.Return = Return;
  Return.prototype.value = function(v) {
    return this._value;
  };
  Return.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  Return.prototype.visit = function() {
    if (this._value instanceof VarReference) {
      this._value.option("virtualize", true);
    }
    ;
    if (this._value && this._value.traverse) {
      return this._value.traverse();
    }
    ;
  };
  Return.prototype.startLoc = function() {
    let l = this.keyword() || this._value;
    return l ? l.startLoc() : null;
  };
  Return.prototype.js = function(o) {
    var v = this._value;
    let k = M2("return", this.keyword());
    if (v instanceof ArgList) {
      return "" + k + " [" + v.c({expression: true}) + "]";
    } else if (v) {
      return "" + k + " " + v.c({expression: true});
    } else {
      return k;
    }
    ;
  };
  Return.prototype.c = function() {
    if (!this.value() || this.value().isExpressable()) {
      return Return.prototype.__super__.c.apply(this, arguments);
    }
    ;
    return this.value().consume(this).c();
  };
  Return.prototype.consume = function(node) {
    return this;
  };
  function ImplicitReturn() {
    return Return.apply(this, arguments);
  }
  subclass$(ImplicitReturn, Return);
  exports2.ImplicitReturn = ImplicitReturn;
  function GreedyReturn() {
    return ImplicitReturn.apply(this, arguments);
  }
  subclass$(GreedyReturn, ImplicitReturn);
  exports2.GreedyReturn = GreedyReturn;
  function Throw() {
    return Statement.apply(this, arguments);
  }
  subclass$(Throw, Statement);
  exports2.Throw = Throw;
  Throw.prototype.js = function(o) {
    return "throw " + this.value().c();
  };
  Throw.prototype.consume = function(node) {
    return this;
  };
  function LoopFlowStatement(lit, expr) {
    this.setLiteral(lit);
    this.setExpression(expr);
  }
  subclass$(LoopFlowStatement, Statement);
  exports2.LoopFlowStatement = LoopFlowStatement;
  LoopFlowStatement.prototype.literal = function(v) {
    return this._literal;
  };
  LoopFlowStatement.prototype.setLiteral = function(v) {
    this._literal = v;
    return this;
  };
  LoopFlowStatement.prototype.expression = function(v) {
    return this._expression;
  };
  LoopFlowStatement.prototype.setExpression = function(v) {
    this._expression = v;
    return this;
  };
  LoopFlowStatement.prototype.visit = function() {
    if (this.expression()) {
      return this.expression().traverse();
    }
    ;
  };
  LoopFlowStatement.prototype.consume = function(node) {
    return this;
  };
  LoopFlowStatement.prototype.c = function() {
    if (!this.expression()) {
      return LoopFlowStatement.prototype.__super__.c.apply(this, arguments);
    }
    ;
    var _loop = STACK.up(Loop);
    var expr = this.expression();
    if (_loop.catcher()) {
      expr = expr.consume(_loop.catcher());
      var copy = new this.constructor(this.literal());
      return new Block([expr, copy]).c();
    } else if (expr) {
      copy = new this.constructor(this.literal());
      return new Block([expr, copy]).c();
    } else {
      return LoopFlowStatement.prototype.__super__.c.apply(this, arguments);
    }
    ;
  };
  function BreakStatement() {
    return LoopFlowStatement.apply(this, arguments);
  }
  subclass$(BreakStatement, LoopFlowStatement);
  exports2.BreakStatement = BreakStatement;
  BreakStatement.prototype.js = function(o) {
    return "break";
  };
  function ContinueStatement() {
    return LoopFlowStatement.apply(this, arguments);
  }
  subclass$(ContinueStatement, LoopFlowStatement);
  exports2.ContinueStatement = ContinueStatement;
  ContinueStatement.prototype.js = function(o) {
    return "continue";
  };
  function DebuggerStatement() {
    return Statement.apply(this, arguments);
  }
  subclass$(DebuggerStatement, Statement);
  exports2.DebuggerStatement = DebuggerStatement;
  function Param(value, defaults, typ) {
    if (typeof value == "string") {
      value = new Identifier(value);
    }
    ;
    this._traversed = false;
    this._name = value;
    this._value = value;
    this._defaults = defaults;
    this._typ = typ;
    this._variable = null;
  }
  subclass$(Param, Node2);
  exports2.Param = Param;
  Param.prototype.name = function(v) {
    return this._name;
  };
  Param.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  Param.prototype.index = function(v) {
    return this._index;
  };
  Param.prototype.setIndex = function(v) {
    this._index = v;
    return this;
  };
  Param.prototype.defaults = function(v) {
    return this._defaults;
  };
  Param.prototype.setDefaults = function(v) {
    this._defaults = v;
    return this;
  };
  Param.prototype.splat = function(v) {
    return this._splat;
  };
  Param.prototype.setSplat = function(v) {
    this._splat = v;
    return this;
  };
  Param.prototype.variable = function(v) {
    return this._variable;
  };
  Param.prototype.setVariable = function(v) {
    this._variable = v;
    return this;
  };
  Param.prototype.value = function(v) {
    return this._value;
  };
  Param.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  Param.prototype.varname = function() {
    return this._variable ? this._variable.c() : this.name();
  };
  Param.prototype.datatype = function() {
    return Param.prototype.__super__.datatype.apply(this, arguments) || this._value.datatype();
  };
  Param.prototype.type = function() {
    return "param";
  };
  Param.prototype.jsdoc = function() {
    let typ = this.datatype();
    if (typ && this.name()) {
      return typ.asParam(this.name());
    } else {
      return "";
    }
    ;
  };
  Param.prototype.js = function(stack, params) {
    if (!params || params.as != "declaration") {
      return "" + this._value.c();
    }
    ;
    if (this._defaults) {
      return "" + this._value.c() + " = " + this._defaults.c();
    } else if (this.option("splat")) {
      return "..." + this._value.c();
    } else {
      return this._value.c();
    }
    ;
  };
  Param.prototype.visit = function(stack) {
    if (this._defaults) {
      this._defaults.traverse();
    }
    ;
    if (this._value) {
      this._value.traverse({declaring: "param"});
    }
    ;
    if (this._value instanceof Identifier) {
      this._value._variable || (this._value._variable = this.scope__().register(this._value.symbol(), this._value, {type: this.type()}));
      stack.registerSemanticToken(this._value);
    }
    ;
    return this;
  };
  Param.prototype.assignment = function() {
    return OP("=", this.variable().accessor(), this.defaults());
  };
  Param.prototype.isExpressable = function() {
    return !this.defaults() || this.defaults().isExpressable();
  };
  Param.prototype.dump = function() {
    return {loc: this.loc()};
  };
  Param.prototype.loc = function() {
    return this._name && this._name.region();
  };
  Param.prototype.toJSON = function() {
    return {
      type: this.typeName(),
      name: this.name(),
      defaults: this.defaults()
    };
  };
  function RestParam() {
    return Param.apply(this, arguments);
  }
  subclass$(RestParam, Param);
  exports2.RestParam = RestParam;
  function BlockParam() {
    return Param.apply(this, arguments);
  }
  subclass$(BlockParam, Param);
  exports2.BlockParam = BlockParam;
  BlockParam.prototype.c = function() {
    return "blockparam";
  };
  BlockParam.prototype.loc = function() {
    var r = this.name().region();
    return [r[0] - 1, r[1]];
  };
  function OptionalParam() {
    return Param.apply(this, arguments);
  }
  subclass$(OptionalParam, Param);
  exports2.OptionalParam = OptionalParam;
  function NamedParam() {
    return Param.apply(this, arguments);
  }
  subclass$(NamedParam, Param);
  exports2.NamedParam = NamedParam;
  function RequiredParam() {
    return Param.apply(this, arguments);
  }
  subclass$(RequiredParam, Param);
  exports2.RequiredParam = RequiredParam;
  function ParamList() {
    return ListNode.apply(this, arguments);
  }
  subclass$(ParamList, ListNode);
  exports2.ParamList = ParamList;
  ParamList.prototype.splat = function(v) {
    return this._splat;
  };
  ParamList.prototype.setSplat = function(v) {
    this._splat = v;
    return this;
  };
  ParamList.prototype.block = function(v) {
    return this._block;
  };
  ParamList.prototype.setBlock = function(v) {
    this._block = v;
    return this;
  };
  ParamList.prototype.at = function(index, force, name, value) {
    if (force === void 0)
      force = false;
    if (name === void 0)
      name = null;
    if (value === void 0)
      value = null;
    if (force) {
      while (index >= this.count()) {
        let curr = this.count() == index;
        let val = curr ? value : null;
        this.add(new Param(curr && name || "_" + this.count(), val));
      }
      ;
    }
    ;
    return this.list()[index];
  };
  ParamList.prototype.metadata = function() {
    return this.filter(function(par) {
      return !(par instanceof Meta);
    });
  };
  ParamList.prototype.toJSON = function() {
    return this.metadata();
  };
  ParamList.prototype.jsdoc = function() {
    let out = [];
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, item; i < len; i++) {
      item = items[i];
      if (!(item instanceof Param)) {
        continue;
      }
      ;
      if (item.datatype()) {
        out.push(item.jsdoc());
      }
      ;
    }
    ;
    let doc = out.join("\n");
    return doc ? "/**\n" + doc + "\n*/\n" : "";
  };
  ParamList.prototype.visit = function() {
    var blk = this.filter(function(par) {
      return par instanceof BlockParam;
    });
    if (blk.length > 1) {
      blk[1].warn("a method can only have one &block parameter");
    } else if (blk[0] && blk[0] != this.last()) {
      blk[0].warn("&block must be the last parameter of a method");
    }
    ;
    return ParamList.prototype.__super__.visit.apply(this, arguments);
  };
  ParamList.prototype.js = function(stack) {
    if (this.count() == 0) {
      return EMPTY;
    }
    ;
    if (stack.parent() instanceof Block) {
      return this.head(stack);
    }
    ;
    if (stack.parent() instanceof Code) {
      let inline = !(stack.parent() instanceof MethodDeclaration);
      var pars = this.nodes();
      var opts = {as: "declaration", typed: inline};
      return AST.compact(this.nodes().map(function(param) {
        let part = param.c(opts);
        let typ = inline && param.datatype();
        if (typ) {
          part = typ.c() + part;
        }
        ;
        return part;
      })).join(",");
    } else {
      throw "not implemented paramlist js";
      return "ta" + AST.compact(this.map(function(arg) {
        return arg.c();
      })).join(",");
    }
    ;
  };
  ParamList.prototype.head = function(o) {
    var reg = [];
    var opt = [];
    var blk = null;
    var splat = null;
    var named = null;
    var arys = [];
    var signature = [];
    var idx = 0;
    this.nodes().forEach(function(par, i) {
      if (par instanceof RawScript) {
        return;
      }
      ;
      par.setIndex(idx);
      if (par instanceof OptionalParam) {
        signature.push("opt");
        opt.push(par);
      } else if (par instanceof BlockParam) {
        signature.push("blk");
        blk = par;
      } else {
        signature.push("reg");
        reg.push(par);
      }
      ;
      return idx++;
    });
    if (named) {
      var namedvar = named.variable();
    }
    ;
    var ast2 = [];
    var isFunc = function(js) {
      return "typeof " + js + " == 'function'";
    };
    var isObj = function(js) {
      return "" + js + ".constructor === Object";
    };
    var isntObj = function(js) {
      return "" + js + ".constructor !== Object";
    };
    if (!named && !splat && !blk && opt.length > 0 && signature.join(" ").match(/opt$/)) {
      for (let i = 0, len_ = opt.length, par; i < len_; i++) {
        par = opt[i];
        ast2.push("if(" + par.name().c() + " === undefined) " + par.name().c() + " = " + par.defaults().c());
      }
      ;
    } else if (named && !splat && !blk && opt.length == 0) {
      ast2.push("if(!" + namedvar.c() + "||" + isntObj(namedvar.c()) + ") " + namedvar.c() + " = {}");
    } else if (blk && opt.length == 1 && !splat && !named) {
      var op = opt[0];
      var opn = op.name().c();
      var bn = blk.name().c();
      ast2.push("if(" + bn + "==undefined && " + isFunc(opn) + ") " + bn + " = " + opn + "," + opn + " = " + op.defaults().c());
      ast2.push("if(" + opn + "==undefined) " + opn + " = " + op.defaults().c());
    } else if (blk && named && opt.length == 0 && !splat) {
      bn = blk.name().c();
      ast2.push("if(" + bn + "==undefined && " + isFunc(namedvar.c()) + ") " + bn + " = " + namedvar.c() + "," + namedvar.c() + " = {}");
      ast2.push("else if(!" + namedvar.c() + "||" + isntObj(namedvar.c()) + ") " + namedvar.c() + " = {}");
    } else if (opt.length > 0 || splat) {
      var argvar = this.scope__().temporary(this, {pool: "arguments"}).predeclared().c();
      var len = this.scope__().temporary(this, {pool: "counter"}).predeclared().c();
      var last = "" + argvar + "[" + len + "-1]";
      var pop = "" + argvar + "[--" + len + "]";
      ast2.push("var " + argvar + " = arguments, " + len + " = " + argvar + ".length");
      if (blk) {
        bn = blk.name().c();
        if (splat) {
          ast2.push("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null");
        } else if (reg.length > 0) {
          ast2.push("var " + bn + " = " + len + " > " + reg.length + " && " + isFunc(last) + " ? " + pop + " : null");
        } else {
          ast2.push("var " + bn + " = " + isFunc(last) + " ? " + pop + " : null");
        }
        ;
      }
      ;
      if (named) {
        ast2.push("var " + namedvar.c() + " = " + last + "&&" + isObj(last) + " ? " + pop + " : {}");
      }
      ;
      for (let i = 0, len_ = opt.length, par; i < len_; i++) {
        par = opt[i];
        ast2.push("if(" + len + " < " + (par.index() + 1) + ") " + par.name().c() + " = " + par.defaults().c());
      }
      ;
      if (splat) {
        var sn = splat.name().c();
        var si = splat.index();
        if (si == 0) {
          ast2.push("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + " : 0)");
          ast2.push("while(" + len + ">" + si + ") " + sn + "[" + len + "-1] = " + pop);
        } else {
          ast2.push("var " + sn + " = new Array(" + len + ">" + si + " ? " + len + "-" + si + " : 0)");
          ast2.push("while(" + len + ">" + si + ") " + sn + "[--" + len + " - " + si + "] = " + argvar + "[" + len + "]");
        }
        ;
      }
      ;
    } else if (opt.length > 0) {
      for (let i = 0, len_ = opt.length, par; i < len_; i++) {
        par = opt[i];
        ast2.push("if(" + par.name().c() + " === undefined) " + par.name().c() + " = " + par.defaults().c());
      }
      ;
    }
    ;
    if (named) {
      for (let i = 0, items = iter$7(named.nodes()), len_ = items.length, k; i < len_; i++) {
        k = items[i];
        op = OP(".", namedvar, k.c()).c();
        ast2.push("var " + k.c() + " = " + op + " !== undefined ? " + op + " : " + k.defaults().c());
      }
      ;
    }
    ;
    if (arys.length) {
      for (let i = 0, len_ = arys.length; i < len_; i++) {
        arys[i].head(o, ast2, this);
      }
      ;
    }
    ;
    return ast2.length > 0 ? ast2.join(";\n") + ";" : EMPTY;
  };
  function ScopeVariables() {
    return ListNode.apply(this, arguments);
  }
  subclass$(ScopeVariables, ListNode);
  exports2.ScopeVariables = ScopeVariables;
  ScopeVariables.prototype.kind = function(v) {
    return this._kind;
  };
  ScopeVariables.prototype.setKind = function(v) {
    this._kind = v;
    return this;
  };
  ScopeVariables.prototype.split = function(v) {
    return this._split;
  };
  ScopeVariables.prototype.setSplit = function(v) {
    this._split = v;
    return this;
  };
  ScopeVariables.prototype.add = function(name, init, pos) {
    if (pos === void 0)
      pos = -1;
    var vardec = new VariableDeclarator(name, init);
    if (name instanceof Variable) {
      vardec.setVariable(name), name;
    }
    ;
    pos == 0 ? this.unshift(vardec) : this.push(vardec);
    return vardec;
  };
  ScopeVariables.prototype.load = function(list) {
    return list.map(function(par) {
      return new VariableDeclarator(par.name(), par.defaults(), par.splat());
    });
  };
  ScopeVariables.prototype.isExpressable = function() {
    return this.nodes().every(function(item) {
      return item.isExpressable();
    });
  };
  ScopeVariables.prototype.js = function(o) {
    if (this.count() == 0) {
      return EMPTY;
    }
    ;
    if (this.count() == 1 && !this.isExpressable()) {
      this.first().variable().autodeclare();
      return this.first().assignment().c();
    }
    ;
    var keyword = "var";
    var groups = {};
    this.nodes().forEach(function(item) {
      let variable = item._variable || item;
      let typ = variable instanceof Variable && variable.type();
      if (typ) {
        groups[typ] || (groups[typ] = []);
        return groups[typ].push(item);
      }
      ;
    });
    if (groups.let && (groups.var || groups.const)) {
      groups.let.forEach(function(item) {
        return (item._variable || item)._virtual = true;
      });
    } else if (groups.let) {
      keyword = "let";
    }
    ;
    if (this.split() && true) {
      let out2 = [];
      for (let v, i = 0, keys = Object.keys(groups), l = keys.length, k; i < l; i++) {
        k = keys[i];
        v = groups[k];
        out2.push("" + k + " " + AST.cary(v, {as: "declaration"}).join(", ") + ";");
      }
      ;
      return out2.join("\n");
    }
    ;
    var out = AST.compact(AST.cary(this.nodes(), {as: "declaration"})).join(", ");
    return out ? "" + keyword + " " + out : "";
  };
  function VariableDeclarator() {
    return Param.apply(this, arguments);
  }
  subclass$(VariableDeclarator, Param);
  exports2.VariableDeclarator = VariableDeclarator;
  VariableDeclarator.prototype.type = function(v) {
    return this._type;
  };
  VariableDeclarator.prototype.setType = function(v) {
    this._type = v;
    return this;
  };
  VariableDeclarator.prototype.visit = function() {
    var variable_, v_;
    (variable_ = this.variable()) || (this.setVariable(v_ = this.scope__().register(this.name(), null, {type: this._type || "var"})), v_);
    if (this.defaults()) {
      this.defaults().traverse();
    }
    ;
    this.variable().setDeclarator(this);
    this.variable().addReference(this.name());
    return this;
  };
  VariableDeclarator.prototype.js = function(o) {
    if (this.variable()._proxy) {
      return null;
    }
    ;
    var defs = this.defaults();
    let typ = this.variable().datatype();
    if (defs != null && defs != void 0) {
      if (defs instanceof Node2) {
        defs = defs.c({expression: true});
      }
      ;
      if (typ) {
        defs = "" + typ.c() + "(" + defs + ")";
      }
      ;
      return "" + this.variable().c() + " = " + defs;
    } else if (typ) {
      return "" + this.variable().c() + " = " + typ.c() + "(undefined)";
    } else {
      return "" + this.variable().c();
    }
    ;
  };
  VariableDeclarator.prototype.accessor = function() {
    return this;
  };
  function VarDeclaration(left, right, kind, op) {
    if (op === void 0)
      op = "=";
    this._op = op;
    this._left = left;
    this._right = right;
    this._kind = kind;
  }
  subclass$(VarDeclaration, Node2);
  exports2.VarDeclaration = VarDeclaration;
  VarDeclaration.prototype.kind = function(v) {
    return this._kind;
  };
  VarDeclaration.prototype.setKind = function(v) {
    this._kind = v;
    return this;
  };
  VarDeclaration.prototype.left = function(v) {
    return this._left;
  };
  VarDeclaration.prototype.setLeft = function(v) {
    this._left = v;
    return this;
  };
  VarDeclaration.prototype.right = function(v) {
    return this._right;
  };
  VarDeclaration.prototype.setRight = function(v) {
    this._right = v;
    return this;
  };
  VarDeclaration.prototype.op = function() {
    return this._op;
  };
  VarDeclaration.prototype.type = function() {
    return this._kind;
  };
  VarDeclaration.prototype.visit = function(stack) {
    if (!(this._left instanceof Identifier && this._right instanceof Func)) {
      if (this._right) {
        this._right.traverse();
      }
      ;
    }
    ;
    if (this._left) {
      this._left.traverse({declaring: this.type()});
    }
    ;
    if (this._left instanceof Identifier) {
      this._left._variable || (this._left._variable = this.scope__().register(this._left.symbol(), this._left, {type: this.type()}));
      stack.registerSemanticToken(this._left);
    }
    ;
    if (this._right) {
      this._right.traverse();
    }
    ;
    return this;
  };
  VarDeclaration.prototype.isExpressable = function() {
    return false;
  };
  VarDeclaration.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      return this;
    }
    ;
    if (node instanceof PushAssign || node instanceof Return) {
      let ast2 = this;
      if (this.right() && !this.right().isExpressable()) {
        let temp = this.scope__().temporary(this);
        let ast3 = this.right().consume(OP("=", temp, NULL));
        this.setRight(temp);
        return new Block([ast3, BR, this.consume(node)]);
      }
      ;
      return new Block([ast2, BR, this._left.consume(node)]);
    }
    ;
    if (node instanceof Return) {
      return new Block([this, BR, this._left.consume(node)]);
    }
    ;
    return VarDeclaration.prototype.__super__.consume.call(this, node);
  };
  VarDeclaration.prototype.c = function(o) {
    if (this.right() && !this.right().isExpressable()) {
      let temp = this.scope__().temporary(this);
      let ast2 = this.right().consume(OP("=", temp, NULL));
      this.setRight(temp);
      return new Block([ast2, BR, this]).c(o);
    }
    ;
    return VarDeclaration.prototype.__super__.c.call(this, o);
  };
  VarDeclaration.prototype.js = function() {
    var typ;
    let out = "" + M2(this.kind(), this.keyword()) + " " + this.left().c();
    if (this.right()) {
      out += " = " + this.right().c({expression: true});
    }
    ;
    if (this.option("export")) {
      if (STACK.cjs()) {
        out = "" + out + ";\nexports." + this.left().c() + " = " + this.left().c();
      } else {
        out = M2("export", this.option("export")) + (" " + out);
      }
      ;
    }
    ;
    if (typ = this.datatype()) {
      out = typ.c() + "\n" + out;
    }
    ;
    return out;
  };
  function VarName(a, b) {
    VarName.prototype.__super__.constructor.apply(this, arguments);
    this._splat = b;
  }
  subclass$(VarName, ValueNode2);
  exports2.VarName = VarName;
  VarName.prototype.variable = function(v) {
    return this._variable;
  };
  VarName.prototype.setVariable = function(v) {
    this._variable = v;
    return this;
  };
  VarName.prototype.splat = function(v) {
    return this._splat;
  };
  VarName.prototype.setSplat = function(v) {
    this._splat = v;
    return this;
  };
  VarName.prototype.visit = function() {
    var variable_, v_;
    (variable_ = this.variable()) || (this.setVariable(v_ = this.scope__().register(this.value().c(), null)), v_);
    this.variable().setDeclarator(this);
    this.variable().addReference(this.value());
    return this;
  };
  VarName.prototype.js = function(o) {
    return this.variable().c();
  };
  VarName.prototype.c = function() {
    return this.variable().c();
  };
  function Code() {
    return Node2.apply(this, arguments);
  }
  subclass$(Code, Node2);
  exports2.Code = Code;
  Code.prototype.head = function(v) {
    return this._head;
  };
  Code.prototype.setHead = function(v) {
    this._head = v;
    return this;
  };
  Code.prototype.body = function(v) {
    return this._body;
  };
  Code.prototype.setBody = function(v) {
    this._body = v;
    return this;
  };
  Code.prototype.scope = function(v) {
    return this._scope;
  };
  Code.prototype.setScope = function(v) {
    this._scope = v;
    return this;
  };
  Code.prototype.params = function(v) {
    return this._params;
  };
  Code.prototype.setParams = function(v) {
    this._params = v;
    return this;
  };
  Code.prototype.scopetype = function() {
    return Scope2;
  };
  Code.prototype.visit = function() {
    if (this._scope) {
      this._scope.visit();
    }
    ;
    return this;
  };
  function Root2(body, opts) {
    this._traversed = false;
    this._body = AST.blk(body);
    this._scope = new RootScope(this, null);
    this._options = {};
  }
  subclass$(Root2, Code);
  exports2.Root = Root2;
  Root2.prototype.loc = function() {
    return this._body.loc();
  };
  Root2.prototype.visit = function() {
    ROOT = STACK.ROOT = this._scope;
    try {
      this.scope().visit();
      this.body().traverse();
      if (this.body().first() instanceof Terminator) {
        return this.body().first()._first = true;
      }
      ;
    } catch (e) {
      let err = ImbaTraverseError.wrap(e);
      err._sourcePath = OPTS.sourcePath;
      err._loc = STACK.currentRegion();
      throw err;
    }
    ;
  };
  Root2.prototype.compile = function(o, script) {
    if (script === void 0)
      script = {};
    STACK.reset();
    this._scope.setOptions(OPTS = STACK._options = this._options = o || {});
    STACK.setRoot(this._scope);
    this._scope._imba.configure(o);
    this.traverse();
    STACK.setRoot(this._scope);
    if (o.bundle) {
      if (o.cwd && STACK.isNode()) {
        let abs = fspath.resolve(o.cwd, o.sourcePath);
        let rel = fspath.relative(o.cwd, abs);
        let np = this._scope.importProxy("path").proxy();
        this._scope.lookup("__filename").c = function() {
          return LIT("" + np.resolve + "(" + STR(rel).c() + ")").c();
        };
        this._scope.lookup("__dirname").c = function() {
          return LIT("" + np.dirname + "(" + np.resolve + "(" + STR(rel).c() + "))").c();
        };
      } else {
        this._scope.lookup("__filename")._c = STR(o.sourcePath).c();
        this._scope.lookup("__dirname")._c = STR(fspath.dirname(o.sourcePath)).c();
      }
      ;
    }
    ;
    if (o.onTraversed instanceof Function) {
      o.onTraversed(this, STACK);
    }
    ;
    if (STACK.css() && (!o.styles || o.styles == "inline")) {
      this.runtime().styles;
    }
    ;
    var out = this.c(o);
    if (STACK.tsc()) {
      out = "import 'imba/index';\n" + out;
    }
    ;
    script.rawResult = {
      js: out,
      css: STACK.css()
    };
    script.js = out;
    script.css = STACK.css() || "";
    script.sourceId = this.sourceId();
    script.assets = this.scope().assets();
    script.dependencies = Object.keys(this.scope()._dependencies);
    script.universal = STACK.meta().universal !== false;
    script.imports = transformers2.extractDependencies(script.js);
    if (o.resolve) {
      script.js = transformers2.resolveDependencies(o.sourcePath, script.js, o.resolve);
    }
    ;
    if (false) {
    }
    ;
    if (!STACK.tsc()) {
      if (script.css && (!o.styles || o.styles == "inline")) {
        script.js = "" + script.js + "\n" + this.runtime().styles + ".register('" + script.sourceId + "'," + JSON.stringify(script.css) + ");";
        if (o.debug) {
          script.js += "\n/*\n" + script.css + "\n*/\n";
        }
        ;
      }
      ;
    }
    ;
    if (o.sourceMap || STACK.tsc()) {
      let map = new SourceMap(script, o.sourceMap, o).generate();
      script.sourcemap = map.result();
    }
    ;
    if (!o.raw) {
      script.css && (script.css = SourceMapper.strip(script.css));
      script.js = SourceMapper.strip(script.js);
    }
    ;
    return script;
  };
  Root2.prototype.js = function(o) {
    var out = this.scope().c();
    var shebangs = [];
    out = out.replace(/^[ \t]*\/\/(\!.+)$/mg, function(m, shebang) {
      shebang = shebang.replace(/\bimba\b/g, "node");
      shebangs.push("#" + shebang + "\n");
      return "";
    });
    out = shebangs.join("") + out;
    return out;
  };
  Root2.prototype.analyze = function(o) {
    if (o === void 0)
      o = {};
    STACK.setLoglevel(o.loglevel || 0);
    STACK._analyzing = true;
    ROOT = STACK.ROOT = this._scope;
    OPTS = STACK._options = {
      platform: o.platform,
      loglevel: o.loglevel || 0,
      analysis: {
        entities: o.entities || false,
        scopes: o.scopes == null ? o.scopes = true : o.scopes
      }
    };
    this.traverse();
    STACK._analyzing = false;
    return this.scope().dump();
  };
  Root2.prototype.inspect = function() {
    return true;
  };
  function ClassDeclaration(name, superclass, body) {
    this._traversed = false;
    if (name instanceof VarOrAccess) {
      name = name._value;
    }
    ;
    this._name = name;
    this._superclass = superclass;
    this._scope = this.isTag() ? new TagScope(this) : new ClassScope(this);
    this._body = AST.blk(body) || new ClassBody([]);
    this._entities = {};
    this;
  }
  subclass$(ClassDeclaration, Code);
  exports2.ClassDeclaration = ClassDeclaration;
  ClassDeclaration.prototype.name = function(v) {
    return this._name;
  };
  ClassDeclaration.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  ClassDeclaration.prototype.superclass = function(v) {
    return this._superclass;
  };
  ClassDeclaration.prototype.setSuperclass = function(v) {
    this._superclass = v;
    return this;
  };
  ClassDeclaration.prototype.initor = function(v) {
    return this._initor;
  };
  ClassDeclaration.prototype.setInitor = function(v) {
    this._initor = v;
    return this;
  };
  ClassDeclaration.prototype.consume = function(node) {
    if (node instanceof Return) {
      this.option("return", node);
      return this;
    }
    ;
    return ClassDeclaration.prototype.__super__.consume.apply(this, arguments);
  };
  ClassDeclaration.prototype.namepath = function() {
    return this._namepath || (this._namepath = "" + (this.name() ? this.name().c() : "--"));
  };
  ClassDeclaration.prototype.metadata = function() {
    var superclass_;
    return {
      type: "class",
      namepath: this.namepath(),
      inherits: (superclass_ = this.superclass()) && superclass_.namepath && superclass_.namepath(),
      path: this.name() && this.name().c().toString(),
      desc: this._desc,
      loc: this.loc(),
      symbols: this._scope.entities()
    };
  };
  ClassDeclaration.prototype.loc = function() {
    var d;
    if (d = this.option("keyword")) {
      return [d._loc, this.body().loc()[1]];
    } else {
      return ClassDeclaration.prototype.__super__.loc.apply(this, arguments);
    }
    ;
  };
  ClassDeclaration.prototype.startLoc = function() {
    return this._startLoc == null ? this._startLoc = MSTART(this.option("export"), this.option("keyword")) : this._startLoc;
  };
  ClassDeclaration.prototype.endLoc = function() {
    return this._endLoc == null ? this._endLoc = MEND(this.body()) : this._endLoc;
  };
  ClassDeclaration.prototype.toJSON = function() {
    return this.metadata();
  };
  ClassDeclaration.prototype.isStruct = function() {
    return this.keyword() && String(this.keyword()) == "struct";
  };
  ClassDeclaration.prototype.isExtension = function() {
    return this.option("extension");
  };
  ClassDeclaration.prototype.isTag = function() {
    return false;
  };
  ClassDeclaration.prototype.staticInit = function() {
    return this._staticInit || (this._staticInit = this.addMethod(this.initKey(), [], "this").set({static: true}));
  };
  ClassDeclaration.prototype.initKey = function() {
    return this._initKey || (this._initKey = new SymbolIdentifier("#init"));
  };
  ClassDeclaration.prototype.initPath = function() {
    return this._initPath || (this._initPath = OP(".", LIT("super"), this.initKey()));
  };
  ClassDeclaration.prototype.instanceInit = function() {
    if (this._instanceInit) {
      return this._instanceInit;
    }
    ;
    let call = Super.callOp(this.initKey());
    if (this._superclass) {
      call = OP("&&", OP(".", LIT("super"), this.initKey()), call);
    }
    ;
    let fn = this.addMethod(this.initKey(), [], this.isTag() || this._superclass ? [call, BR] : "", {}, function(fun) {
      return true;
    });
    fn.set({noreturn: true});
    return this._instanceInit = fn;
  };
  ClassDeclaration.prototype.isInitingFields = function() {
    return this._inits || this._supernode && this._supernode.isInitingFields && this._supernode.isInitingFields();
  };
  ClassDeclaration.prototype.visit = function() {
    this._body._delimiter = "";
    STACK.pop(this);
    let sup = this._superclass;
    if (sup) {
      sup.traverse();
      if (sup instanceof VarOrAccess) {
        if (sup._variable) {
          let val = sup._variable.value();
          if (val instanceof ClassDeclaration) {
            this._supernode = val;
          }
          ;
        } else if (sup.symbol() == "Object") {
          if (!STACK.tsc()) {
            sup = this._superclass = null;
          } else {
            this._autosuper = true;
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if (this.option("extension") && this._name) {
      this._name.traverse();
      if (this._name instanceof Identifier) {
        this._name.resolveVariable();
      }
      ;
    } else if (this._name instanceof Identifier) {
      this._name.registerVariable("const");
      this._name._variable.setValue(this);
    } else if (this._name && !(this._name instanceof Access)) {
      this._name.traverse({declaring: this});
    } else if (this._name) {
      this._name.traverse();
    }
    ;
    STACK.push(this);
    ROOT.entities().add(this.namepath(), this);
    this.scope().visit();
    var separateInitChain = true;
    var fields = [];
    var signature = [];
    var params = [];
    var declaredFields = {};
    var restIndex = void 0;
    for (let i = 0, items = iter$7(this.body()), len = items.length, node; i < len; i++) {
      node = items[i];
      if (!(node instanceof ClassField)) {
        continue;
      }
      ;
      if (!node.isStatic()) {
        let name = String(node.name());
        declaredFields[name] = node;
        if (separateInitChain) {
          node.set({restIndex: 0});
        }
        ;
      }
      ;
    }
    ;
    if (this.option("params")) {
      let add = [];
      for (let index = 0, items = iter$7(this.option("params")), len = items.length, param; index < len; index++) {
        param = items[index];
        if (param instanceof RestParam) {
          restIndex = index;
          continue;
        }
        ;
        let name = String(param.name());
        let field = declaredFields[name];
        let dtyp = param.option("datatype");
        if (!field) {
          field = fields[name] = new ClassField(param.name()).set({
            datatype: dtyp,
            value: param.defaults()
          });
          add.push(field);
          params.push(param);
        } else {
          if (dtyp && !field.datatype()) {
            field.set({datatype: dtyp});
          }
          ;
          if (param.defaults() && !field.value()) {
            field.set({value: param.defaults()});
          }
          ;
        }
        ;
        if (field) {
          field.set({paramIndex: index, paramName: name});
        }
        ;
      }
      ;
      for (let i = 0, items = iter$7(add.reverse()), len = items.length; i < len; i++) {
        this.body().unshift(items[i]);
      }
      ;
    }
    ;
    this.body().traverse();
    var ctor = this.body().option("ctor");
    let tsc = STACK.tsc();
    var inits = new InstanceInitBlock();
    var staticInits = new ClassInitBlock();
    ctor = this.body().option("ctor");
    let fieldNodes = this.body().filter(function(node) {
      return node instanceof ClassField;
    });
    for (let i = 0, items = iter$7(fieldNodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node.watchBody()) {
        this.addMethod(node.watcherSymbol(), [], [node.watchBody()], {}, function(fn) {
          node._watchMethod = fn;
          return node._watchParam = fn.params().at(0, true, "e");
        });
      }
      ;
      if (node.hasStaticInits()) {
        staticInits.add(node);
      }
      ;
      if (node.hasConstructorInits()) {
        inits.add(node);
      }
      ;
      if (!node.isStatic() && restIndex != null) {
        node.set({restIndex});
      }
      ;
    }
    ;
    for (let i = 0, items = iter$7(this.body()), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node._decorators) {
        let target = node.option("static") ? THIS : PROTO;
        let desc = LIT("null");
        let op = this.util().decorate(new Arr(node._decorators), target, node.name(), desc);
        staticInits.add([op, BR]);
      }
      ;
    }
    ;
    if (!inits.isEmpty()) {
      this._inits = inits;
      this.instanceInit();
      inits.set({ctor: this.instanceInit()});
      if (!tsc) {
        this.instanceInit().inject(inits);
      }
      ;
      if (this.isTag()) {
        true;
      } else if (!this._superclass) {
        let initop = OP(".", THIS, this.initKey());
        if (!ctor) {
          ctor = this.addMethod("constructor", [], [], {});
          let param = ctor.params().at(0, true, "$$", LIT("null"));
          let callop = CALL(initop, [param]);
          if (!tsc) {
            ctor.body().add([callop, BR], 0);
          }
          ;
        } else {
          let sup2 = ctor.option("supr");
          if (sup2) {
            sup2.real.set({target: initop, args: []});
          } else {
            ctor.body().add([CALL(initop, []), BR], 0);
          }
          ;
        }
        ;
      } else if (!this._supernode || !this._supernode.isInitingFields()) {
        let op = OP("||", this.initPath(), CALL(OP(".", THIS, this.initKey()), []));
        if (!ctor) {
          ctor = this.addMethod("constructor", [], [new Super(), BR, op], {});
        } else {
          let after = ctor.option("injectInitAfter");
          ctor.inject(op, after ? {after} : 0);
        }
        ;
        true;
      }
      ;
    }
    ;
    if (tsc && ctor && this._autosuper) {
      ctor.body().add([LIT("super()"), BR], 0);
    }
    ;
    if (!staticInits.isEmpty()) {
      this.staticInit().inject(staticInits, 0);
    }
    ;
    return this;
  };
  ClassDeclaration.prototype.addMethod = function(name, params, mbody, options, cb) {
    if (typeof mbody == "string" || mbody instanceof String) {
      mbody = [LIT(mbody)];
    }
    ;
    if (typeof name == "string" || name instanceof String) {
      name = new Identifier(name);
    }
    ;
    let func = new MethodDeclaration(params, mbody || [], name, null, options || {});
    this.body().unshift(func, true);
    if (cb instanceof Function) {
      cb(func);
    }
    ;
    func.traverse();
    return func;
  };
  ClassDeclaration.prototype.js = function(o) {
    this.scope().virtualize();
    this.scope().context().setValue(this.name());
    this.scope().context().setReference(this.name());
    if (this.option("extension")) {
      this._body._delimiter = ",";
      this._body.set({braces: true});
      return this.util().extend(LIT(this.name().c()), this.body()).c();
    }
    ;
    var o = this._options || {};
    var cname = this.name() instanceof Access ? this.name().right() : this.name();
    var initor = null;
    var sup = this.superclass();
    if (typeof cname != "string" && cname) {
      cname = cname.c({mark: true});
    }
    ;
    this._cname = cname;
    let jsbody = this.body().c();
    let jshead = M2("class", this.keyword());
    if (this.name()) {
      jshead += " " + M2(cname, this.name());
    }
    ;
    if (sup) {
      jshead += " extends " + M2(sup);
    }
    ;
    if (this.name() instanceof Access) {
      jshead = "" + this.name().c() + " = " + jshead;
    }
    ;
    if (this.option("export") && !STACK.cjs()) {
      if (this.option("default")) {
        jshead = "" + M2("export", this.option("export")) + " " + M2("default", this.option("default")) + " " + jshead;
      } else {
        jshead = "" + M2("export", this.option("export")) + " " + jshead;
      }
      ;
    }
    ;
    let js = "" + jshead + " {" + jsbody + "}";
    if (this.option("export") && STACK.cjs()) {
      let exportName = this.option("default") ? "default" : cname;
      js = "" + js + ";\n" + M2("exports", o.export) + "." + exportName + " = " + cname;
    }
    ;
    if (this.option("global")) {
      js = "" + js + "; " + this.scope__().root().globalRef() + "." + this._cname + " = " + this._cname;
    }
    ;
    if (this._staticInit) {
      js = "" + js + "; " + cname + "[" + this.initKey().c() + "]();";
    }
    ;
    return js;
  };
  function TagDeclaration() {
    return ClassDeclaration.apply(this, arguments);
  }
  subclass$(TagDeclaration, ClassDeclaration);
  exports2.TagDeclaration = TagDeclaration;
  TagDeclaration.prototype.isTag = function() {
    return true;
  };
  TagDeclaration.prototype.isInitingFields = function() {
    return true;
  };
  TagDeclaration.prototype.namepath = function() {
    return "<" + this.name() + ">";
  };
  TagDeclaration.prototype.metadata = function() {
    return Object.assign(TagDeclaration.prototype.__super__.metadata.apply(this, arguments), {
      type: "tag"
    });
  };
  TagDeclaration.prototype.cssns = function() {
    return "" + this.sourceId() + this.oid();
  };
  TagDeclaration.prototype.cssref = function(scope2) {
    if (this.isNeverExtended() && !this.superclass()) {
      return this.option("hasScopedStyles") ? this.cssns() : null;
    }
    ;
    let s = scope2.closure();
    return s.memovar("_ns_", OP("||", OP(".", s.context(), "_ns_"), STR("")));
  };
  TagDeclaration.prototype.isNeverExtended = function() {
    if (this.name() && this.name().isClass()) {
      return !this.option("export") && !this.option("extended");
    } else {
      return false;
    }
    ;
  };
  TagDeclaration.prototype.visit = function() {
    this.scope__().imbaDependency("core");
    TagDeclaration.prototype.__super__.visit.apply(this, arguments);
    let sup = this.superclass();
    this._config = {};
    if (sup && !STACK.tsc()) {
      if (sup.isNative() || sup.isNativeSVG()) {
        let op = sup.nativeCreateNode();
        op = this.util().extendTag(op, THIS);
        this.addMethod("create$", [], [op]).set({static: true});
        this.set({extends: Obj.wrap({extends: sup.name()})});
        this._config.extends = sup.name();
      } else if (sup.isClass()) {
        sup.resolveVariable(this.scope__().parent());
        let up = sup._variable && sup._variable.value();
        if (up) {
          up.set({extended: this});
        }
        ;
      }
      ;
    }
    ;
    if (this._elementReferences) {
      for (let o = this._elementReferences, child, i = 0, keys = Object.keys(o), l = keys.length, ref; i < l; i++) {
        ref = keys[i];
        child = o[ref];
        if (STACK.tsc()) {
          let val = child.option("reference");
          let typ = child.type();
          let op = "" + M2(AST.sym(val), val);
          if (typ && typ.toClassName) {
            op += " = new " + typ.toClassName();
          }
          ;
          this.body().unshift(LIT(op + ";"), true);
        }
        ;
      }
      ;
    }
    ;
    return;
  };
  TagDeclaration.prototype.addElementReference = function(name, child) {
    let refs = this._elementReferences || (this._elementReferences = {});
    return refs[name] = child;
  };
  TagDeclaration.prototype.js = function(s) {
    this.scope().virtualize();
    this.scope().context().setValue(this.name());
    this.scope().context().setReference(this.name());
    let className = this.name().toClassName();
    let sup = this.superclass();
    if (sup && sup._variable) {
      sup = sup._variable;
    } else if (sup) {
      sup = CALL(this.runtime().getTagType, [sup, STR(sup.toClassName())]);
    } else {
      sup = this.runtime().ImbaElement;
    }
    ;
    if (STACK.tsc()) {
      sup = this.superclass() ? this.superclass().toClassName() : LIT("HTMLElement");
      if (this.option("extension")) {
        className = "Extended$" + className;
      }
      ;
    } else if (this.option("extension")) {
      this._body._delimiter = ",";
      this._body.set({braces: true});
      let cls = CALL(this.runtime().getTagType, [this.name(), STR(this.name().toClassName())]);
      if (className == "ImbaElement") {
        cls = this.runtime().ImbaElement;
      }
      ;
      let tagname = new TagTypeIdentifier(this.name());
      return this.util().extend(cls, this.body()).c();
    }
    ;
    let closure = this.scope__().parent();
    let jsbody = this.body().c();
    let jshead = "" + M2("class", this.keyword()) + " " + M2(className, this.name()) + " extends " + M2(sup, this.superclass());
    if (this.option("export") && !STACK.cjs()) {
      if (this.option("default")) {
        jshead = "" + M2("export", this.option("export")) + " " + M2("default", this.option("default")) + " " + jshead;
      } else {
        jshead = "" + M2("export", this.option("export")) + " " + jshead;
      }
      ;
    }
    ;
    let js = "" + jshead + " {" + jsbody + "}";
    if (this.option("export") && STACK.cjs()) {
      let exportName = this.option("default") ? "default" : className;
      js = "" + js + ";\n" + M2("exports", this.o().export) + "." + exportName + " = " + className;
    }
    ;
    if (this.option("hasScopedStyles")) {
      this._config.ns = this.cssns();
    }
    ;
    if (!STACK.tsc()) {
      if (this._staticInit) {
        js += "; " + className + "[" + this.initKey().c() + "]()";
      }
      ;
      let ext = Obj.wrap(this._config).c();
      js += "; " + this.runtime().defineTag + "(" + this.name().c() + "," + className + "," + ext + ")";
    } else {
      if (!this.option("extension")) {
        js += "; globalThis." + M2(className, this.name()) + " = " + className + ";";
      }
      ;
    }
    ;
    return js;
  };
  function Func(params, body, name, target, o) {
    this._options = o;
    var typ = this.scopetype();
    this._traversed = false;
    this._body = AST.blk(body);
    this._scope || (this._scope = o && o.scope || new typ(this));
    this._scope.setParams(this._params = new ParamList(params));
    this._name = name || "";
    this._target = target;
    this._type = "function";
    this._variable = null;
    this;
  }
  subclass$(Func, Code);
  exports2.Func = Func;
  Func.prototype.name = function(v) {
    return this._name;
  };
  Func.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  Func.prototype.params = function(v) {
    return this._params;
  };
  Func.prototype.setParams = function(v) {
    this._params = v;
    return this;
  };
  Func.prototype.target = function(v) {
    return this._target;
  };
  Func.prototype.setTarget = function(v) {
    this._target = v;
    return this;
  };
  Func.prototype.options = function(v) {
    return this._options;
  };
  Func.prototype.setOptions = function(v) {
    this._options = v;
    return this;
  };
  Func.prototype.type = function(v) {
    return this._type;
  };
  Func.prototype.setType = function(v) {
    this._type = v;
    return this;
  };
  Func.prototype.context = function(v) {
    return this._context;
  };
  Func.prototype.setContext = function(v) {
    this._context = v;
    return this;
  };
  Func.prototype.scopetype = function() {
    return FunctionScope;
  };
  Func.prototype.inject = function(line, o) {
    return this._body.add([line, BR], o);
  };
  Func.prototype.nonlocals = function() {
    return this._scope._nonlocals;
  };
  Func.prototype.visit = function(stack, o) {
    this.scope().visit();
    this._context = this.scope().parent();
    this._params.traverse({declaring: "arg"});
    return this._body.traverse();
  };
  Func.prototype.funcKeyword = function() {
    let str = "function";
    if (this.option("async")) {
      str = "async " + str;
    }
    ;
    return str;
  };
  Func.prototype.js = function(s, o) {
    if (!this.option("noreturn")) {
      this.body().consume(new ImplicitReturn());
    }
    ;
    var ind = this.body()._indentation;
    if (ind && ind.isGenerated()) {
      this.body()._indentation = null;
    }
    ;
    var code = this.scope().c({indent: !ind || !ind.isGenerated(), braces: true});
    var name = typeof this._name == "string" ? this._name : this._name.c();
    name = name ? " " + name.replace(/\./g, "_") : "";
    var keyword = o && o.keyword != void 0 ? o.keyword : this.funcKeyword();
    var out = "" + M2(keyword, this.option("def") || this.option("keyword")) + name + "(" + this.params().c() + ") " + code;
    if (this.option("eval")) {
      out = "(" + out + ")()";
    }
    ;
    return out;
  };
  Func.prototype.shouldParenthesize = function(par) {
    if (par === void 0)
      par = this.up();
    return par instanceof Call && par.callee() == this;
  };
  function IsolatedFunc() {
    return Func.apply(this, arguments);
  }
  subclass$(IsolatedFunc, Func);
  exports2.IsolatedFunc = IsolatedFunc;
  IsolatedFunc.prototype.leaks = function(v) {
    return this._leaks;
  };
  IsolatedFunc.prototype.setLeaks = function(v) {
    this._leaks = v;
    return this;
  };
  IsolatedFunc.prototype.scopetype = function() {
    return IsolatedFunctionScope;
  };
  IsolatedFunc.prototype.isStatic = function() {
    return true;
  };
  IsolatedFunc.prototype.isPrimitive = function() {
    return true;
  };
  IsolatedFunc.prototype.visit = function(stack) {
    var self3 = this, leaks;
    IsolatedFunc.prototype.__super__.visit.apply(self3, arguments);
    if (stack.tsc()) {
      return;
    }
    ;
    if (leaks = self3._scope._leaks) {
      self3._leaks = [];
      leaks.forEach(function(shadow, source) {
        shadow._proxy = self3._params.at(self3._params.count(), true);
        return self3._leaks.push(source);
      });
    }
    ;
    return self3;
  };
  function Lambda() {
    return Func.apply(this, arguments);
  }
  subclass$(Lambda, Func);
  exports2.Lambda = Lambda;
  Lambda.prototype.scopetype = function() {
    var k = this.option("keyword");
    return k && k._value == "\u0192" ? MethodScope : LambdaScope;
  };
  function ClosedFunc() {
    return Func.apply(this, arguments);
  }
  subclass$(ClosedFunc, Func);
  exports2.ClosedFunc = ClosedFunc;
  ClosedFunc.prototype.scopetype = function() {
    return MethodScope;
  };
  function TagFragmentFunc() {
    return Func.apply(this, arguments);
  }
  subclass$(TagFragmentFunc, Func);
  exports2.TagFragmentFunc = TagFragmentFunc;
  TagFragmentFunc.prototype.scopetype = function() {
    return this.option("closed") ? MethodScope : LambdaScope;
  };
  function MethodDeclaration() {
    return Func.apply(this, arguments);
  }
  subclass$(MethodDeclaration, Func);
  exports2.MethodDeclaration = MethodDeclaration;
  MethodDeclaration.prototype.variable = function(v) {
    return this._variable;
  };
  MethodDeclaration.prototype.setVariable = function(v) {
    this._variable = v;
    return this;
  };
  MethodDeclaration.prototype.decorators = function(v) {
    return this._decorators;
  };
  MethodDeclaration.prototype.setDecorators = function(v) {
    this._decorators = v;
    return this;
  };
  MethodDeclaration.prototype.scopetype = function() {
    return MethodScope;
  };
  MethodDeclaration.prototype.consume = function(node) {
    if (node instanceof Return) {
      this.option("return", true);
      return this;
    }
    ;
    return MethodDeclaration.prototype.__super__.consume.apply(this, arguments);
  };
  MethodDeclaration.prototype.identifier = function() {
    return this._name;
  };
  MethodDeclaration.prototype.metadata = function() {
    return {
      type: "method",
      name: "" + this.name(),
      namepath: this.namepath(),
      params: this._params.metadata(),
      desc: this._desc,
      scopenr: this.scope()._nr,
      loc: this.loc()
    };
  };
  MethodDeclaration.prototype.loc = function() {
    var d;
    if (d = this.option("def")) {
      let end = this.body().option("end") || this.body().loc()[1];
      return [d._loc, end];
    } else {
      return [0, 0];
    }
    ;
  };
  MethodDeclaration.prototype.isGetter = function() {
    return this._type == "get";
  };
  MethodDeclaration.prototype.isSetter = function() {
    return this._type == "set";
  };
  MethodDeclaration.prototype.isConstructor = function() {
    return String(this.name()) == "constructor";
  };
  MethodDeclaration.prototype.toJSON = function() {
    return this.metadata();
  };
  MethodDeclaration.prototype.namepath = function() {
    if (this._namepath) {
      return this._namepath;
    }
    ;
    var name = String(this.name().c());
    var sep = this.option("static") ? "." : "#";
    if (this.target()) {
      let ctx = this.target();
      if (ctx.namepath() == "ValueNode") {
        ctx = this._context.node();
      }
      ;
      return this._namepath = ctx.namepath() + sep + name;
    } else {
      return this._namepath = "&" + name;
    }
    ;
  };
  MethodDeclaration.prototype.visit = function() {
    var $1, up_, variable;
    this._type = this.option("type") || (($1 = this.option("def")) && $1._value || "def");
    this._decorators = (up_ = this.up()) && up_.collectDecorators && up_.collectDecorators();
    var o = this._options;
    this.scope().visit();
    if (this.option("inObject")) {
      this._params.traverse();
      this._body.traverse();
      return this;
    }
    ;
    var closure = this._context = this.scope().parent().closure();
    if (closure instanceof RootScope && !this.target()) {
      this.scope()._context = closure.context();
    } else if (closure instanceof MethodScope && !this.target()) {
      this.scope()._selfless = true;
    }
    ;
    this._params.traverse();
    if (this.target() instanceof Identifier) {
      if (variable = this.scope().lookup(this.target().toString())) {
        this.setTarget(variable);
      }
      ;
    }
    ;
    if (String(this.name()) == "initialize" && closure instanceof ClassScope && !(closure instanceof TagScope)) {
      this.setType("constructor");
    }
    ;
    if (String(this.name()) == "constructor" || this.isConstructor()) {
      this.up().set({ctor: this});
      this.set({noreturn: true});
    }
    ;
    if (closure instanceof ClassScope && !this.target()) {
      this._target = closure.prototype();
      this.set({
        prototype: this._target,
        inClassBody: true,
        inExtension: closure.node().option("extension")
      });
      closure.annotate(this);
    }
    ;
    if (this.target() instanceof Self) {
      this._target = closure.context();
      closure.annotate(this);
      this.set({static: true});
    } else if (o.variable) {
      this._variable = this.scope().parent().register(this.name(), this, {type: String(o.variable)});
      if (this.target()) {
        this.warn("" + String(o.variable) + " def cannot have a target");
      }
      ;
    } else if (!this.target()) {
      this._variable = this.scope().parent().register(this.name(), this, {type: "const"});
      true;
    }
    ;
    if (o.export && !(closure instanceof RootScope)) {
      this.warn("cannot export non-root method", {loc: o.export.loc()});
    }
    ;
    ROOT.entities().add(this.namepath(), this);
    this._body.traverse();
    if (this.isConstructor() && this.option("supr")) {
      let ref = this.scope__().context()._reference;
      let supr = this.option("supr");
      let node = supr.node;
      let block = supr.block;
      if (ref) {
        ref.declarator()._defaults = null;
        let op = OP("=", ref, new This());
        block.replace(node, [node, op]);
      }
      ;
    }
    ;
    return this;
  };
  MethodDeclaration.prototype.supername = function() {
    return this.type() == "constructor" ? this.type() : this.name();
  };
  MethodDeclaration.prototype.js = function(o) {
    var o = this._options;
    if (!(this.type() == "constructor" || this.option("noreturn") || this.isSetter())) {
      if (this.option("chainable")) {
        this.body().add(new ImplicitReturn(this.scope().context()));
      } else if (this.option("greedy")) {
        this.body().consume(new GreedyReturn());
      } else {
        this.body().consume(new ImplicitReturn());
      }
      ;
    }
    ;
    var code = this.scope().c({indent: true, braces: true});
    var name = typeof this._name == "string" ? this._name : this._name.c({as: "field"});
    var out = "";
    var fname = AST.sym(this.name());
    if (this.option("inClassBody") || this.option("inObject")) {
      let prefix = this.isGetter() ? "get " : this.isSetter() ? "set " : "";
      if (this.option("async")) {
        prefix = "async " + prefix;
      }
      ;
      if (this.option("static")) {
        prefix = "" + M2("static", this.option("static")) + " " + prefix;
      }
      ;
      out = "" + prefix + M2(name, this._name, {as: "field"}) + "(" + this.params().c() + ")" + code;
      out = this._params.jsdoc() + out;
      return out;
    }
    ;
    var func = "(" + this.params().c() + ")" + code;
    var ctx = this.context();
    if (this.target()) {
      if (fname[0] == "[") {
        fname = fname.slice(1, -1);
      } else {
        fname = "'" + fname + "'";
      }
      ;
      if (this.isGetter()) {
        out = "Object.defineProperty(" + this.target().c() + ",'" + fname + "',{get: " + this.funcKeyword() + func + ", configurable: true})";
      } else if (this.isSetter()) {
        out = "Object.defineProperty(" + this.target().c() + ",'" + fname + "',{set: " + this.funcKeyword() + func + ", configurable: true})";
      } else {
        let k = OP(".", this.target(), this._name);
        out = "" + k.c() + " = " + this.funcKeyword() + " " + func;
      }
      ;
      if (o.export) {
        out = "exports." + (o.default ? "default" : fname) + " = " + out;
      }
      ;
    } else {
      out = "" + M2(this.funcKeyword(), this.keyword()) + " " + M2(fname, this._name) + func;
      if (o.export) {
        if (STACK.cjs()) {
          let exportName = o.default ? "default" : fname;
          out = "" + out + ";\n" + M2("exports", o.export) + "." + exportName + " = " + fname;
        } else {
          out = "" + M2("export", o.export) + " " + (o.default ? M2("default ", o.default) : "") + out;
        }
        ;
      }
      ;
    }
    ;
    if (o.global) {
      out = "" + out + "; " + this.scope__().root().globalRef() + "." + fname + " = " + fname + ";";
    }
    ;
    if (this.option("return")) {
      out = "return " + out;
    }
    ;
    return out;
  };
  function Literal(v) {
    this._traversed = false;
    this._expression = true;
    this._cache = null;
    this._raw = null;
    this._value = this.load(v);
  }
  subclass$(Literal, ValueNode2);
  exports2.Literal = Literal;
  Literal.prototype.load = function(value) {
    return value;
  };
  Literal.prototype.toString = function() {
    return "" + this.value();
  };
  Literal.prototype.hasSideEffects = function() {
    return false;
  };
  Literal.prototype.shouldParenthesizeInTernary = function() {
    return false;
  };
  Literal.prototype.startLoc = function() {
    return this._startLoc || this._value && this._value.startLoc && this._value.startLoc();
  };
  Literal.prototype.endLoc = function() {
    return this._endLoc || this._value && this._value.endLoc && this._value.endLoc();
  };
  function RawScript() {
    return Literal.apply(this, arguments);
  }
  subclass$(RawScript, Literal);
  exports2.RawScript = RawScript;
  RawScript.prototype.c = function() {
    return this._value;
  };
  function Bool(v) {
    this._value = v;
    this._raw = String(v) == "true" ? true : false;
  }
  subclass$(Bool, Literal);
  exports2.Bool = Bool;
  Bool.prototype.cache = function() {
    return this;
  };
  Bool.prototype.isPrimitive = function() {
    return true;
  };
  Bool.prototype.truthy = function() {
    return String(this.value()) == "true";
  };
  Bool.prototype.js = function(o) {
    return String(this._value);
  };
  Bool.prototype.c = function() {
    STACK._counter += 1;
    return String(this._value);
  };
  Bool.prototype.toJSON = function() {
    return {type: "Bool", value: this._value};
  };
  Bool.prototype.loc = function() {
    return this._value.region ? this._value.region() : [0, 0];
  };
  function Undefined() {
    return Literal.apply(this, arguments);
  }
  subclass$(Undefined, Literal);
  exports2.Undefined = Undefined;
  Undefined.prototype.isPrimitive = function() {
    return true;
  };
  Undefined.prototype.isTruthy = function() {
    return false;
  };
  Undefined.prototype.cache = function() {
    return this;
  };
  Undefined.prototype.c = function() {
    return M2("undefined", this._value);
  };
  function Nil() {
    return Literal.apply(this, arguments);
  }
  subclass$(Nil, Literal);
  exports2.Nil = Nil;
  Nil.prototype.isPrimitive = function() {
    return true;
  };
  Nil.prototype.isTruthy = function() {
    return false;
  };
  Nil.prototype.cache = function() {
    return this;
  };
  Nil.prototype.c = function() {
    return M2("null", this._value);
  };
  function True() {
    return Bool.apply(this, arguments);
  }
  subclass$(True, Bool);
  exports2.True = True;
  True.prototype.raw = function() {
    return true;
  };
  True.prototype.isTruthy = function() {
    return true;
  };
  True.prototype.c = function() {
    return M2("true", this._value);
  };
  function False() {
    return Bool.apply(this, arguments);
  }
  subclass$(False, Bool);
  exports2.False = False;
  False.prototype.raw = function() {
    return false;
  };
  False.prototype.isTruthy = function() {
    return false;
  };
  False.prototype.c = function() {
    return M2("false", this._value);
  };
  function Num(v) {
    this._traversed = false;
    this._value = v;
  }
  subclass$(Num, Literal);
  exports2.Num = Num;
  Num.prototype.toString = function() {
    return String(this._value).replace(/\_/g, "");
  };
  Num.prototype.toNumber = function() {
    return this._number == null ? this._number = parseFloat(this.toString()) : this._number;
  };
  Num.prototype.isPrimitive = function(deep) {
    return true;
  };
  Num.prototype.isTruthy = function() {
    return this.toNumber() != 0;
  };
  Num.prototype.negate = function() {
    this._value = -this.toNumber();
    return this;
  };
  Num.prototype.shouldParenthesize = function(par) {
    if (par === void 0)
      par = this.up();
    return par instanceof Access && par.left() == this;
  };
  Num.prototype.js = function(o) {
    return this.toString();
  };
  Num.prototype.c = function(o) {
    if (this._cache) {
      return Num.prototype.__super__.c.call(this, o);
    }
    ;
    var out = M2(this.toString(), this._value);
    var par = STACK.current();
    var paren = par instanceof Access && par.left() == this;
    return paren ? "(" + out + ")" : out;
  };
  Num.prototype.cache = function(o) {
    if (!(o && (o.cache || o.pool))) {
      return this;
    }
    ;
    return Num.prototype.__super__.cache.call(this, o);
  };
  Num.prototype.raw = function() {
    return JSON.parse(this.toString());
  };
  Num.prototype.toJSON = function() {
    return {type: this.typeName(), value: this.raw()};
  };
  function NumWithUnit(v, unit) {
    this._traversed = false;
    this._value = v;
    this._unit = unit;
  }
  subclass$(NumWithUnit, Literal);
  exports2.NumWithUnit = NumWithUnit;
  NumWithUnit.prototype.negate = function() {
    this.set({negate: true});
    return this;
  };
  NumWithUnit.prototype.c = function(o) {
    let raw = "" + String(this._value) + String(this._unit);
    if (this.option("negate")) {
      raw = "-" + raw;
    }
    ;
    return o && o.css ? raw : "'" + raw + "'";
  };
  function ExpressionWithUnit(value, unit) {
    this._value = value;
    this._unit = unit;
  }
  subclass$(ExpressionWithUnit, ValueNode2);
  exports2.ExpressionWithUnit = ExpressionWithUnit;
  ExpressionWithUnit.prototype.js = function(o) {
    return "(" + this.value().c() + "+" + STR(this._unit).c() + ")";
  };
  function Str(v) {
    this._traversed = false;
    this._expression = true;
    this._cache = null;
    this._value = v;
  }
  subclass$(Str, Literal);
  exports2.Str = Str;
  Str.prototype.isString = function() {
    return true;
  };
  Str.prototype.isPrimitive = function(deep) {
    return true;
  };
  Str.prototype.raw = function() {
    return this._raw || (this._raw = String(this.value()).slice(1, -1));
  };
  Str.prototype.isValidIdentifier = function() {
    return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
  };
  Str.prototype.js = function(o) {
    return String(this._value);
  };
  Str.prototype.c = function(o) {
    return this._cache ? Str.prototype.__super__.c.call(this, o) : M2(this.js(), this._value, o);
  };
  function TemplateString() {
    return ListNode.apply(this, arguments);
  }
  subclass$(TemplateString, ListNode);
  exports2.TemplateString = TemplateString;
  TemplateString.prototype.js = function() {
    let parts = this._nodes.map(function(node) {
      return typeof node == "string" || node instanceof String ? node : node.c();
    });
    let out = "`" + parts.join("") + "`";
    return out;
  };
  function Interpolation() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Interpolation, ValueNode2);
  exports2.Interpolation = Interpolation;
  function InterpolatedString(nodes, o) {
    if (o === void 0)
      o = {};
    this._nodes = nodes;
    this._options = o;
    this;
  }
  subclass$(InterpolatedString, Node2);
  exports2.InterpolatedString = InterpolatedString;
  InterpolatedString.prototype.add = function(part) {
    if (part) {
      this._nodes.push(part);
    }
    ;
    return this;
  };
  InterpolatedString.prototype.visit = function() {
    for (let i = 0, items = iter$7(this._nodes), len = items.length; i < len; i++) {
      items[i].traverse();
    }
    ;
    return this;
  };
  InterpolatedString.prototype.isString = function() {
    return true;
  };
  InterpolatedString.prototype.escapeString = function(str) {
    return str = str.replace(/\n/g, "\\\n");
  };
  InterpolatedString.prototype.toArray = function() {
    let items = this._nodes.map(function(part, i) {
      if (part instanceof Token2 && part._type == "NEOSTRING") {
        return new Str('"' + part._value + '"');
      } else {
        return part;
      }
      ;
    });
    return items;
  };
  InterpolatedString.prototype.js = function(o) {
    var self3 = this;
    var kind = String(self3.option("open") || '"');
    if (kind.length == 3) {
      kind = kind[0];
    }
    ;
    var parts = [];
    var str = self3._noparen ? "" : "(";
    self3._nodes.map(function(part, i) {
      if (part instanceof Token2 && part._type == "NEOSTRING") {
        return parts.push(kind + self3.escapeString(part._value) + kind);
      } else if (part) {
        if (i == 0) {
          parts.push('""');
        }
        ;
        part._parens = true;
        return parts.push(part.c({expression: true}));
      }
      ;
    });
    str += parts.join(" + ");
    if (!self3._noparen) {
      str += ")";
    }
    ;
    return str;
  };
  function Symbol2() {
    return Literal.apply(this, arguments);
  }
  subclass$(Symbol2, Literal);
  exports2.Symbol = Symbol2;
  Symbol2.prototype.isValidIdentifier = function() {
    return this.raw().match(/^[a-zA-Z\$\_]+[\d\w\$\_]*$/) ? true : false;
  };
  Symbol2.prototype.isPrimitive = function(deep) {
    return true;
  };
  Symbol2.prototype.raw = function() {
    return this._raw || (this._raw = AST.sym(this.value().toString().replace(/^\:/, "")));
  };
  Symbol2.prototype.js = function(o) {
    return "'" + AST.sym(this.raw()) + "'";
  };
  function RegExp2() {
    return Literal.apply(this, arguments);
  }
  subclass$(RegExp2, Literal);
  exports2.RegExp = RegExp2;
  RegExp2.prototype.isPrimitive = function() {
    return true;
  };
  RegExp2.prototype.js = function() {
    var m;
    var v = RegExp2.prototype.__super__.js.apply(this, arguments);
    if (m = constants.HEREGEX.exec(v)) {
      var re = m[1].replace(constants.HEREGEX_OMIT, "").replace(/\//g, "\\/");
      return "/" + (re || "(?:)") + "/" + m[2];
    }
    ;
    return v == "//" ? "/(?:)/" : v;
  };
  function Arr() {
    return Literal.apply(this, arguments);
  }
  subclass$(Arr, Literal);
  exports2.Arr = Arr;
  Arr.prototype.load = function(value) {
    return value instanceof Array ? new ArgList(value) : value;
  };
  Arr.prototype.push = function(item) {
    this.value().push(item);
    return this;
  };
  Arr.prototype.count = function() {
    return this.value().length;
  };
  Arr.prototype.nodes = function() {
    var val = this.value();
    return val instanceof Array ? val : val.nodes();
  };
  Arr.prototype.splat = function() {
    return this.value().some(function(v) {
      return v instanceof Splat;
    });
  };
  Arr.prototype.visit = function() {
    if (this._value && this._value.traverse) {
      this._value.traverse();
    }
    ;
    return this;
  };
  Arr.prototype.isPrimitive = function(deep) {
    return !this.value().some(function(v) {
      return !v.isPrimitive(true);
    });
  };
  Arr.prototype.js = function(o) {
    var val = this._value;
    if (!val) {
      return "[]";
    }
    ;
    var nodes = val instanceof Array ? val : val.nodes();
    var out = val instanceof Array ? AST.cary(val) : val.c();
    return "[" + out + "]";
  };
  Arr.prototype.hasSideEffects = function() {
    return this.value().some(function(v) {
      return v.hasSideEffects();
    });
  };
  Arr.prototype.toString = function() {
    return "Arr";
  };
  Arr.prototype.indented = function(a, b) {
    this._value.indented(a, b);
    return this;
  };
  Arr.wrap = function(val) {
    return new Arr(val);
  };
  function Obj() {
    return Literal.apply(this, arguments);
  }
  subclass$(Obj, Literal);
  exports2.Obj = Obj;
  Obj.prototype.load = function(value) {
    return value instanceof Array ? new AssignList(value) : value;
  };
  Obj.prototype.visit = function() {
    if (this._value) {
      this._value.traverse();
    }
    ;
    return this;
  };
  Obj.prototype.isPrimitive = function(deep) {
    return !this.value().some(function(v) {
      return !v.isPrimitive(true);
    });
  };
  Obj.prototype.js = function(o) {
    var dyn = this.value().filter(function(v) {
      return v instanceof ObjAttr && (v.key() instanceof Op || v.key() instanceof InterpolatedString);
    });
    if (dyn.length > 0) {
      var idx = this.value().indexOf(dyn[0]);
      var tmp = this.scope__().temporary(this);
      var first = this.value().slice(0, idx);
      var obj = new Obj(first);
      var ast2 = [OP("=", tmp, obj)];
      this.value().slice(idx).forEach(function(atr) {
        return ast2.push(OP("=", OP(".", tmp, atr.key()), atr.value()));
      });
      ast2.push(tmp);
      return new Parens(ast2).c();
    }
    ;
    return "{" + this.value().c() + "}";
  };
  Obj.prototype.add = function(k, v) {
    if (typeof k == "string" || k instanceof String || k instanceof Token2) {
      k = new Identifier(k);
    }
    ;
    var kv = new ObjAttr(k, v);
    this.value().push(kv);
    return kv;
  };
  Obj.prototype.remove = function(key) {
    for (let i = 0, items = iter$7(this.value()), len = items.length, k; i < len; i++) {
      k = items[i];
      if (k.key().symbol() == key) {
        this.value().remove(k);
      }
      ;
    }
    ;
    return this;
  };
  Obj.prototype.keys = function() {
    return Object.keys(this.hash());
  };
  Obj.prototype.hash = function() {
    var hash = {};
    for (let i = 0, items = iter$7(this.value()), len = items.length, k; i < len; i++) {
      k = items[i];
      if (k instanceof ObjAttr) {
        hash[k.key().symbol()] = k.value();
      }
      ;
    }
    ;
    return hash;
  };
  Obj.prototype.key = function(key) {
    for (let i = 0, items = iter$7(this.value()), len = items.length, k; i < len; i++) {
      k = items[i];
      if (k instanceof ObjAttr && k.key().symbol() == key) {
        return k;
      }
      ;
    }
    ;
    return null;
  };
  Obj.prototype.indented = function(a, b) {
    this._value.indented(a, b);
    return this;
  };
  Obj.prototype.hasSideEffects = function() {
    return this.value().some(function(v) {
      return v.hasSideEffects();
    });
  };
  Obj.wrap = function(obj) {
    var attrs = [];
    for (let v, i = 0, keys = Object.keys(obj), l = keys.length, k; i < l; i++) {
      k = keys[i];
      v = obj[k];
      if (v instanceof Array) {
        v = Arr.wrap(v);
      } else if (v.constructor == Object) {
        v = Obj.wrap(v);
      }
      ;
      v = NODIFY(v);
      if (typeof k == "string" || k instanceof String) {
        k = new Identifier(k);
      }
      ;
      attrs.push(new ObjAttr(k, v));
    }
    ;
    return new Obj(attrs);
  };
  Obj.prototype.toString = function() {
    return "Obj";
  };
  function ObjAttr(key, value, defaults) {
    this._traversed = false;
    this._key = key;
    this._value = value;
    this._dynamic = key instanceof Op;
    this._defaults = defaults;
    this;
  }
  subclass$(ObjAttr, Node2);
  exports2.ObjAttr = ObjAttr;
  ObjAttr.prototype.key = function(v) {
    return this._key;
  };
  ObjAttr.prototype.setKey = function(v) {
    this._key = v;
    return this;
  };
  ObjAttr.prototype.value = function(v) {
    return this._value;
  };
  ObjAttr.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  ObjAttr.prototype.options = function(v) {
    return this._options;
  };
  ObjAttr.prototype.setOptions = function(v) {
    this._options = v;
    return this;
  };
  ObjAttr.prototype.visit = function(stack, state) {
    this.key().traverse();
    if (this.value()) {
      this.value().traverse();
    }
    ;
    if (this._defaults) {
      this._defaults.traverse();
    }
    ;
    let decl = state && state.declaring;
    if (this.key() instanceof Ivar) {
      if (!this.value()) {
        this.setKey(new Identifier(this.key().value()));
        this.setValue(OP(".", this.scope__().context(), this.key()));
        if (this._defaults) {
          this.setValue(OP("=", this.value(), this._defaults));
          this._defaults = null;
        }
        ;
      }
      ;
    } else if (this.key() instanceof Private) {
      if (!this.value()) {
        this.setValue(OP(".", this.scope__().context(), this.key()));
        this.setKey(new Identifier(this.key().value()));
      }
      ;
    } else if (this.key() instanceof Identifier) {
      if (!this.value()) {
        if (decl) {
          this.setValue(this.scope__().register(this.key().symbol(), this.key(), {type: decl}));
          stack.registerSemanticToken(this.key(), this.value());
          if (this._defaults) {
            this.setValue(OP("=", this.value(), this._defaults));
            this._defaults = null;
          }
          ;
        } else {
          this.setValue(this.scope__().lookup(this.key().symbol()));
          if (!this.value()) {
            this.setValue(OP(".", this.scope__().context(), this.key()));
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    return this;
  };
  ObjAttr.prototype.js = function(o) {
    let key = this.key();
    let kjs;
    if (key instanceof IdentifierExpression || key instanceof SymbolIdentifier) {
      kjs = key.asObjectKey();
    } else if (key.isReserved()) {
      kjs = "'" + key.c() + "'";
    } else if (key instanceof Str && key.isValidIdentifier()) {
      kjs = key.raw();
    } else {
      kjs = key.c();
    }
    ;
    if (this._defaults) {
      return "" + kjs + " = " + this._defaults.c();
    } else if (this.value()) {
      return "" + kjs + ": " + this.value().c();
    } else {
      return "" + kjs;
    }
    ;
  };
  ObjAttr.prototype.hasSideEffects = function() {
    return true;
  };
  ObjAttr.prototype.isPrimitive = function(deep) {
    return !this._value || this._value.isPrimitive(deep);
  };
  function ObjRestAttr() {
    return ObjAttr.apply(this, arguments);
  }
  subclass$(ObjRestAttr, ObjAttr);
  exports2.ObjRestAttr = ObjRestAttr;
  function ArgsReference() {
    return Node2.apply(this, arguments);
  }
  subclass$(ArgsReference, Node2);
  exports2.ArgsReference = ArgsReference;
  ArgsReference.prototype.c = function() {
    return "arguments";
  };
  function Self(value) {
    this._value = value;
  }
  subclass$(Self, Literal);
  exports2.Self = Self;
  Self.prototype.cache = function() {
    return this;
  };
  Self.prototype.reference = function() {
    return this;
  };
  Self.prototype.visit = function() {
    this.scope__().context();
    return this;
  };
  Self.prototype.js = function() {
    var s = this.scope__();
    return s ? s.context().c() : "this";
  };
  Self.prototype.c = function() {
    let out = M2(this.js(), this._value);
    let typ = STACK.tsc() && this.option("datatype");
    if (typ) {
      out = "" + typ.c() + "(" + out + ")";
    }
    ;
    return out;
  };
  function This() {
    return Self.apply(this, arguments);
  }
  subclass$(This, Self);
  exports2.This = This;
  This.prototype.cache = function() {
    return this;
  };
  This.prototype.reference = function() {
    return this;
  };
  This.prototype.visit = function() {
    return this;
  };
  This.prototype.js = function() {
    return "this";
  };
  function Op(o, l, r) {
    this._expression = false;
    this._traversed = false;
    this._parens = false;
    this._cache = null;
    this._invert = false;
    this._opToken = o;
    this._op = o && o._value || o;
    if (this._op == "and") {
      this._op = "&&";
    } else if (this._op == "or") {
      this._op = "||";
    } else if (this._op == "is") {
      this._op = "===";
    } else if (this._op == "isnt") {
      this._op = "!==";
    } else if (this._op == "not") {
      this._op = "!";
    }
    ;
    this._left = l;
    this._right = r;
    return this;
  }
  subclass$(Op, Node2);
  exports2.Op = Op;
  Op.prototype.op = function(v) {
    return this._op;
  };
  Op.prototype.setOp = function(v) {
    this._op = v;
    return this;
  };
  Op.prototype.left = function(v) {
    return this._left;
  };
  Op.prototype.setLeft = function(v) {
    this._left = v;
    return this;
  };
  Op.prototype.right = function(v) {
    return this._right;
  };
  Op.prototype.setRight = function(v) {
    this._right = v;
    return this;
  };
  Op.prototype.visit = function() {
    if (this._right && this._right.traverse) {
      this._right.traverse();
    }
    ;
    if (this._left && this._left.traverse) {
      this._left.traverse();
    }
    ;
    return this;
  };
  Op.prototype.isExpressable = function() {
    return !this.right() || this.right().isExpressable();
  };
  Op.prototype.startLoc = function() {
    let l = this._left;
    return l && l.startLoc ? l.startLoc() : Op.prototype.__super__.startLoc.apply(this, arguments);
  };
  Op.prototype.js = function(o) {
    var out = null;
    var op = this._op;
    let opv = op;
    var l = this._left;
    var r = this._right;
    if (op == "!&") {
      return "(" + C(l) + " " + M2("&", this._opToken) + " " + C(r) + ")==0";
    } else if (op == "??") {
      let ast2 = IF(OP("!=", l.cache(), NULL), l, r, {type: "?"});
      ast2._scope._systemscope = this.stack().scope();
      return ast2.c({expression: true});
    } else if (op == "|=?") {
      return If.ternary(OP("!&", l, r.cache()), new Parens([OP("|=", l, r), TRUE]), FALSE).c();
    } else if (op == "~=?") {
      return If.ternary(OP("&", l, r.cache()), new Parens([OP("~=", l, r), TRUE]), FALSE).c();
    } else if (op == "^=?") {
      return OP("!!", OP("&", OP("^=", l, r.cache()), r)).c();
    } else if (op == "=?") {
      r.cache();
      return If.ternary(OP("!=", l, r), new Parens([OP("=", l, r), TRUE]), FALSE).c();
    }
    ;
    if (l instanceof Node2) {
      l = l.c();
    }
    ;
    if (r instanceof Node2) {
      r = r.c();
    }
    ;
    if (l && r) {
      out || (out = "" + l + " " + M2(op, this._opToken) + " " + r);
    } else if (l) {
      out || (out = "" + M2(op, this._opToken) + l);
    }
    ;
    return out;
  };
  Op.prototype.isString = function() {
    return this._op == "+" && this._left && this._left.isString();
  };
  Op.prototype.shouldParenthesize = function() {
    return this._parens;
  };
  Op.prototype.precedence = function() {
    return 10;
  };
  Op.prototype.consume = function(node) {
    if (this.isExpressable()) {
      return Op.prototype.__super__.consume.apply(this, arguments);
    }
    ;
    var tmpvar = this.scope__().declare("tmp", null, {system: true});
    var clone = OP(this.op(), this.left(), null);
    var ast2 = this.right().consume(clone);
    if (node) {
      ast2.consume(node);
    }
    ;
    return ast2;
  };
  function ComparisonOp() {
    return Op.apply(this, arguments);
  }
  subclass$(ComparisonOp, Op);
  exports2.ComparisonOp = ComparisonOp;
  ComparisonOp.prototype.invert = function() {
    var op = this._op;
    var pairs = ["==", "!=", "===", "!==", ">", "<=", "<", ">="];
    var idx = pairs.indexOf(op);
    idx += idx % 2 ? -1 : 1;
    this.setOp(pairs[idx]);
    this._invert = !this._invert;
    return this;
  };
  ComparisonOp.prototype.c = function() {
    if (this.left() instanceof ComparisonOp) {
      this.left().right().cache();
      return OP("&&", this.left(), OP(this.op(), this.left().right(), this.right())).c();
    } else {
      return ComparisonOp.prototype.__super__.c.apply(this, arguments);
    }
    ;
  };
  ComparisonOp.prototype.js = function(o) {
    var op = this._op;
    var l = this._left;
    var r = this._right;
    if (l instanceof Node2) {
      l = l.c();
    }
    ;
    if (r instanceof Node2) {
      r = r.c();
    }
    ;
    return "" + l + " " + M2(op, this._opToken) + " " + r;
  };
  function UnaryOp() {
    return Op.apply(this, arguments);
  }
  subclass$(UnaryOp, Op);
  exports2.UnaryOp = UnaryOp;
  UnaryOp.prototype.invert = function() {
    if (this.op() == "!") {
      return this.left();
    } else {
      return UnaryOp.prototype.__super__.invert.apply(this, arguments);
    }
    ;
  };
  UnaryOp.prototype.isTruthy = function() {
    var val = AST.truthy(this.left());
    return val !== void 0 ? !val : void 0;
  };
  UnaryOp.prototype.startLoc = function() {
    let l = this._left || this._op;
    return l && l.startLoc ? l.startLoc() : this._startLoc;
  };
  UnaryOp.prototype.js = function(o) {
    var l = this._left;
    var r = this._right;
    var op = this.op();
    if (op == "not") {
      op = "!";
    }
    ;
    if (op == "!" || op == "!!") {
      var str = l.c();
      var paren = l.shouldParenthesize(this);
      if (!((str.match(/^\!?([\w\.]+)$/) || l instanceof Parens || paren || l instanceof Access || l instanceof Call) && !str.match(/[\s\&\|]/))) {
        str = "(" + str + ")";
      }
      ;
      return "" + op + str;
    } else if (this.left()) {
      return "" + l.c() + op;
    } else {
      return "" + op + r.c();
    }
    ;
  };
  UnaryOp.prototype.normalize = function() {
    if (this.op() == "!") {
      return this;
    }
    ;
    var node = (this.left() || this.right()).node();
    return this;
  };
  UnaryOp.prototype.consume = function(node) {
    var norm = this.normalize();
    return norm == this ? UnaryOp.prototype.__super__.consume.apply(this, arguments) : norm.consume(node);
  };
  UnaryOp.prototype.c = function() {
    var norm = this.normalize();
    return norm == this ? UnaryOp.prototype.__super__.c.apply(this, arguments) : norm.c();
  };
  function InstanceOf() {
    return Op.apply(this, arguments);
  }
  subclass$(InstanceOf, Op);
  exports2.InstanceOf = InstanceOf;
  InstanceOf.prototype.js = function(o) {
    if (this.right() instanceof Identifier || this.right() instanceof VarOrAccess) {
      var name = AST.c(this.right().value());
      var obj = this.left().node();
      if (idx$(name, ["String", "Number", "Boolean"]) >= 0) {
        if (STACK.tsc()) {
          return "(typeof " + obj.c() + "=='" + name.toLowerCase() + "')";
        }
        ;
        if (!(obj instanceof LocalVarAccess)) {
          obj.cache();
        }
        ;
        return "(typeof " + obj.c() + "=='" + name.toLowerCase() + "'||" + obj.c() + " instanceof " + name + ")";
      }
      ;
    }
    ;
    var out = "" + this.left().c() + " instanceof " + this.right().c();
    if (o.parent() instanceof Op) {
      out = helpers2.parenthesize(out);
    }
    ;
    return out;
  };
  function TypeOf() {
    return Op.apply(this, arguments);
  }
  subclass$(TypeOf, Op);
  exports2.TypeOf = TypeOf;
  TypeOf.prototype.js = function(o) {
    return "typeof " + this.left().c();
  };
  function Delete() {
    return Op.apply(this, arguments);
  }
  subclass$(Delete, Op);
  exports2.Delete = Delete;
  Delete.prototype.js = function(o) {
    var l = this.left();
    var tmp = this.scope__().temporary(this, {pool: "val"});
    var o = OP("=", tmp, l);
    return "(" + o.c() + ",delete " + l.c() + ", " + tmp.c() + ")";
  };
  Delete.prototype.shouldParenthesize = function() {
    return true;
  };
  function In() {
    return Op.apply(this, arguments);
  }
  subclass$(In, Op);
  exports2.In = In;
  In.prototype.invert = function() {
    this._invert = !this._invert;
    return this;
  };
  In.prototype.js = function(o) {
    var out = this.util().contains(this.left(), this.right());
    return "" + (this._invert ? "!" : "") + out.c();
  };
  function Access(o, l, r) {
    this._expression = false;
    this._traversed = false;
    this._parens = false;
    this._cache = null;
    this._invert = false;
    this._op = o && o._value || o;
    this._left = l;
    this._right = r;
    return this;
  }
  subclass$(Access, Op);
  exports2.Access = Access;
  Access.prototype.startLoc = function() {
    return (this._left || this._right).startLoc();
  };
  Access.prototype.endLoc = function() {
    return this._right && this._right.endLoc();
  };
  Access.prototype.clone = function(left, right) {
    var ctor = this.constructor;
    return new ctor(this.op(), left, right);
  };
  Access.prototype.js = function(stack) {
    var r;
    var raw = null;
    var lft = this.left();
    var rgt = this.right();
    var rgtexpr = null;
    if (lft instanceof VarOrAccess && lft._variable instanceof ImportProxy) {
      return lft._variable.access(rgt).c();
    }
    ;
    if (rgt instanceof Token2) {
      rgt = new Identifier(rgt);
    }
    ;
    var ctx = lft || this.scope__().context();
    var pre = "";
    var mark = "";
    let safeop = this.safechain() ? "?" : "";
    if (!this._startLoc) {
      this._startLoc = (lft || rgt).startLoc();
    }
    ;
    if (lft instanceof Super && stack.method() && stack.method().option("inExtension")) {
      return CALL(OP(".", this.scope__().context(), "super$"), [rgt instanceof Identifier ? rgt.toStr() : rgt]).c();
    }
    ;
    if (rgt instanceof Num) {
      return ctx.c() + ("" + safeop + "[") + rgt.c() + "]";
    }
    ;
    if (rgt instanceof Index && (rgt.value() instanceof Str || rgt.value() instanceof Symbol2)) {
      rgt = rgt.value();
    }
    ;
    if (rgt instanceof Str && rgt.isValidIdentifier()) {
      raw = rgt.raw();
    } else if (rgt instanceof Symbol2 && rgt.isValidIdentifier()) {
      raw = rgt.raw();
    } else if (rgt instanceof InterpolatedIdentifier) {
      rgt = rgt.value();
    } else if (rgt instanceof SymbolIdentifier) {
      true;
    } else if (rgt instanceof Identifier && rgt.isValidIdentifier()) {
      raw = rgt.c();
    }
    ;
    var out = raw ? ctx ? "" + safeop + "." + raw : raw : (r = rgt instanceof Node2 ? rgt.c({expression: true, as: "value"}) : rgt, "" + safeop + "[" + r + "]");
    let up = stack.up();
    let typ = this.option("datatype");
    if (ctx) {
      if (this instanceof ImplicitAccess && typ && stack.tsc() && !(up instanceof Block) && false) {
        out = "/**@type{any}*/(" + ctx.c() + ")" + out;
      } else {
        out = ctx.c() + out;
      }
      ;
    }
    ;
    if (this instanceof ImplicitAccess) {
      out = M2(out, rgt._token || rgt._value);
    }
    ;
    if (typ && (!(up instanceof Assign) || up.right().node() == this)) {
      if (up instanceof Block && (this instanceof ImplicitAccess || lft instanceof Self)) {
        out = typ.c() + " " + out;
      } else {
        out = typ.c() + "(" + out + ")";
      }
      ;
    }
    ;
    out = pre + out;
    if (pre) {
      out = "(" + out + ")";
    }
    ;
    return out;
  };
  Access.prototype.visit = function() {
    if (this.left()) {
      this.left().traverse();
    }
    ;
    if (this.right()) {
      this.right().traverse();
    }
    ;
    this._left || (this._left = this.scope__().context());
    return;
  };
  Access.prototype.isExpressable = function() {
    return true;
  };
  Access.prototype.alias = function() {
    return this.right() instanceof Identifier ? this.right().alias() : Access.prototype.__super__.alias.call(this);
  };
  Access.prototype.safechain = function() {
    return String(this._op) == "?.";
  };
  Access.prototype.cache = function(o) {
    return this.right() instanceof Ivar && !this.left() ? this : Access.prototype.__super__.cache.call(this, o);
  };
  Access.prototype.shouldParenthesizeInTernary = function() {
    return this._parens || this._cache;
  };
  function ImplicitAccess() {
    return Access.apply(this, arguments);
  }
  subclass$(ImplicitAccess, Access);
  exports2.ImplicitAccess = ImplicitAccess;
  ImplicitAccess.prototype.datatype = function() {
    return ImplicitAccess.prototype.__super__.datatype.apply(this, arguments) || this._right.datatype();
  };
  function LocalVarAccess() {
    return Access.apply(this, arguments);
  }
  subclass$(LocalVarAccess, Access);
  exports2.LocalVarAccess = LocalVarAccess;
  LocalVarAccess.prototype.safechain = function(v) {
    return this._safechain;
  };
  LocalVarAccess.prototype.setSafechain = function(v) {
    this._safechain = v;
    return this;
  };
  LocalVarAccess.prototype.js = function(o) {
    if (this.right() instanceof Variable && this.right().type() == "meth") {
      if (!(this.up() instanceof Call)) {
        return "" + this.right().c() + "()";
      }
      ;
    }
    ;
    return this.right().c();
  };
  LocalVarAccess.prototype.variable = function() {
    return this.right();
  };
  LocalVarAccess.prototype.cache = function(o) {
    if (o === void 0)
      o = {};
    if (o.force) {
      LocalVarAccess.prototype.__super__.cache.call(this, o);
    }
    ;
    return this;
  };
  LocalVarAccess.prototype.alias = function() {
    return this.variable()._alias || LocalVarAccess.prototype.__super__.alias.call(this);
  };
  function PropertyAccess(o, l, r) {
    this._traversed = false;
    this._invert = false;
    this._parens = false;
    this._expression = false;
    this._cache = null;
    this._op = o;
    this._left = l;
    this._right = r;
    return this;
  }
  subclass$(PropertyAccess, Access);
  exports2.PropertyAccess = PropertyAccess;
  PropertyAccess.prototype.visit = function() {
    if (this._right) {
      this._right.traverse();
    }
    ;
    if (this._left) {
      this._left.traverse();
    }
    ;
    return this;
  };
  PropertyAccess.prototype.js = function(o) {
    var up = this.up();
    var js = "" + PropertyAccess.prototype.__super__.js.call(this, o);
    return js;
  };
  PropertyAccess.prototype.receiver = function() {
    if (this.left() instanceof Super) {
      return SELF;
    } else {
      return null;
    }
    ;
  };
  function IvarAccess() {
    return Access.apply(this, arguments);
  }
  subclass$(IvarAccess, Access);
  exports2.IvarAccess = IvarAccess;
  IvarAccess.prototype.visit = function() {
    if (this._right) {
      this._right.traverse();
    }
    ;
    this._left ? this._left.traverse() : this.scope__().context();
    return this;
  };
  IvarAccess.prototype.cache = function() {
    return this;
  };
  function IndexAccess() {
    return Access.apply(this, arguments);
  }
  subclass$(IndexAccess, Access);
  exports2.IndexAccess = IndexAccess;
  IndexAccess.prototype.cache = function(o) {
    if (o === void 0)
      o = {};
    if (o.force) {
      return IndexAccess.prototype.__super__.cache.apply(this, arguments);
    }
    ;
    this.right().cache();
    return this;
  };
  function VarOrAccess(value) {
    this._traversed = false;
    this._parens = false;
    this._value = value;
    this._identifier = value;
    this._token = value._value;
    this._variable = null;
    this;
  }
  subclass$(VarOrAccess, ValueNode2);
  exports2.VarOrAccess = VarOrAccess;
  VarOrAccess.prototype.startLoc = function() {
    return this._token.startLoc();
  };
  VarOrAccess.prototype.endLoc = function() {
    return this._token.endLoc();
  };
  VarOrAccess.prototype.visit = function(stack, state) {
    var variable;
    var scope2 = this.scope__();
    if (state && state.declaring) {
      variable = scope2.register(this.value(), this, {type: state.declaring});
    }
    ;
    variable || (variable = scope2.lookup(this.value().symbol()));
    if (variable && variable instanceof GlobalReference) {
      let name = variable.name();
      if (variable instanceof ZonedVariable) {
        this._value = variable.forScope(scope2);
      } else if (stack.tsc()) {
        this._value = LIT(name);
      } else if (stack.isNode()) {
        this._value = LIT(scope2.imba().c());
        if (name != "imba") {
          this._value = LIT("" + scope2.imba().c() + "." + name);
        }
        ;
      } else {
        this._value = LIT(name);
      }
      ;
    } else if (variable && variable.declarator()) {
      let vscope = variable.scope();
      if (vscope == scope2 && !variable._initialized) {
        let outerVar = scope2.parent().lookup(this.value());
        if (outerVar) {
          variable._virtual = true;
          variable._shadowing = outerVar;
          variable = outerVar;
        }
        ;
      }
      ;
      if (variable && variable._initialized || scope2.closure() != vscope.closure()) {
        this._variable = variable;
        variable.addReference(this);
        this._value = variable;
        this._token._variable = variable;
        stack.registerSemanticToken(this._token, variable);
        return this;
      }
      ;
    } else if (!this._identifier.isCapitalized()) {
      let ctx = scope2.context();
      if (ctx instanceof RootScopeContext || ctx.isGlobalContext()) {
        true;
        this._includeType = true;
      } else {
        this._value = new ImplicitAccess(".", ctx, this._value).set({datatype: this.datatype()});
        stack.registerSemanticToken(this._token, "accessor");
      }
      ;
    }
    ;
    return this;
  };
  VarOrAccess.prototype.js = function(o) {
    let val = this._variable || this._value;
    if (this._variable) {
      let typ = this.datatype();
      if (typ) {
        return typ.c() + "(" + this._variable.c() + ")";
      }
      ;
    }
    ;
    return (this._variable || this._value).c();
  };
  VarOrAccess.prototype.node = function() {
    return this._variable ? this : this.value();
  };
  VarOrAccess.prototype.datatype = function() {
    return VarOrAccess.prototype.__super__.datatype.apply(this, arguments) || this._identifier.datatype();
  };
  VarOrAccess.prototype.symbol = function() {
    return this._identifier.symbol();
  };
  VarOrAccess.prototype.cache = function(o) {
    if (o === void 0)
      o = {};
    return this._variable ? o.force ? VarOrAccess.prototype.__super__.cache.call(this, o) : this : this.value().cache(o);
  };
  VarOrAccess.prototype.decache = function() {
    this._variable ? VarOrAccess.prototype.__super__.decache.call(this) : this.value().decache();
    return this;
  };
  VarOrAccess.prototype.dom = function() {
    return this.value().dom();
  };
  VarOrAccess.prototype.safechain = function() {
    return this._identifier.safechain();
  };
  VarOrAccess.prototype.dump = function() {
    return {loc: this.loc()};
  };
  VarOrAccess.prototype.loc = function() {
    var loc = this._identifier.region();
    return loc || [0, 0];
  };
  VarOrAccess.prototype.region = function() {
    return this._identifier.region();
  };
  VarOrAccess.prototype.shouldParenthesizeInTernary = function() {
    return this._cache || this._value && this._value._cache || this._parens;
  };
  VarOrAccess.prototype.toString = function() {
    return "VarOrAccess(" + this.value() + ")";
  };
  VarOrAccess.prototype.toJSON = function() {
    return {type: this.typeName(), value: this._identifier.toString()};
  };
  function VarReference(value, type) {
    if (value instanceof VarOrAccess) {
      value = value.value();
      this._variable = null;
    } else if (value instanceof Variable) {
      this._variable = value;
      value = "";
    }
    ;
    VarReference.prototype.__super__.constructor.call(this, value);
    this._export = false;
    this._type = type && String(type);
    this._declared = true;
  }
  subclass$(VarReference, ValueNode2);
  exports2.VarReference = VarReference;
  VarReference.prototype.variable = function(v) {
    return this._variable;
  };
  VarReference.prototype.setVariable = function(v) {
    this._variable = v;
    return this;
  };
  VarReference.prototype.declared = function(v) {
    return this._declared;
  };
  VarReference.prototype.setDeclared = function(v) {
    this._declared = v;
    return this;
  };
  VarReference.prototype.type = function(v) {
    return this._type;
  };
  VarReference.prototype.setType = function(v) {
    this._type = v;
    return this;
  };
  VarReference.prototype.datatype = function() {
    return VarReference.prototype.__super__.datatype.apply(this, arguments) || (this._value.datatype ? this._value.datatype() : null);
  };
  VarReference.prototype.loc = function() {
    return this._value.region();
  };
  VarReference.prototype.declare = function() {
    return this;
  };
  VarReference.prototype.consume = function(node) {
    this.forceExpression();
    return this;
  };
  VarReference.prototype.forceExpression = function() {
    if (this._expression != true) {
      this._expression = true;
      for (let i = 0, items = iter$7(this._variables), len = items.length, variable; i < len; i++) {
        variable = items[i];
        variable._type = "let";
        variable._virtual = true;
        variable.autodeclare();
      }
      ;
    }
    ;
    return this;
  };
  VarReference.prototype.visit = function(stack, state) {
    var vars = [];
    var virtualize = stack;
    let scope2 = this.scope__();
    this._value.traverse({declaring: this._type, variables: vars});
    if (this._value instanceof Identifier) {
      this._value._variable || (this._value._variable = scope2.register(this._value.symbol(), this, {type: this._type, datatype: this.datatype()}));
      vars.push(this._value._variable);
      stack.registerSemanticToken(this._value, this._variable);
    }
    ;
    this._variables = vars;
    return this;
  };
  VarReference.prototype.js = function(stack, params) {
    var typ;
    let out = this._value.c();
    if (!this._expression) {
      out = "" + this._type + " " + out;
      if (typ = STACK.tsc() && this.datatype()) {
        out = typ.c() + " " + out;
      }
      ;
    }
    ;
    return out;
  };
  function Assign(o, l, r) {
    this._expression = false;
    this._traversed = false;
    this._parens = false;
    this._cache = null;
    this._invert = false;
    this._opToken = o;
    this._op = o && o._value || o;
    this._left = l;
    this._right = r;
    return this;
  }
  subclass$(Assign, Op);
  exports2.Assign = Assign;
  Assign.prototype.isExpressable = function() {
    return !this.right() || this.right().isExpressable();
  };
  Assign.prototype.isUsed = function() {
    if (this.up() instanceof Block) {
      return false;
    }
    ;
    return true;
  };
  Assign.prototype.visit = function() {
    var l = this._left;
    var r = this._right;
    if (l instanceof VarOrAccess && r instanceof VarOrAccess && l._identifier.symbol() == r._identifier.symbol()) {
      this._left = l = new Access(".", this.scope__().context(), l._value);
    }
    ;
    if (r) {
      r.traverse({assignment: true});
    }
    ;
    if (l) {
      l.traverse();
    }
    ;
    if (l instanceof VarReference && !(STACK.up() instanceof Block) && !(STACK.up() instanceof Export)) {
      l.forceExpression();
    }
    ;
    return this;
  };
  Assign.prototype.c = function(o) {
    if (!this.right().isExpressable()) {
      if (this.left() instanceof VarReference && (!(this.right() instanceof Loop) || this._expression)) {
        this.left().forceExpression();
      }
      ;
      return this.right().consume(this).c(o);
    }
    ;
    return Assign.prototype.__super__.c.call(this, o);
  };
  Assign.prototype.js = function(o) {
    var m, typ;
    if (!this.right().isExpressable()) {
      this.p("Assign#js right is not expressable ");
      if (this.left() instanceof VarReference) {
        this.left().forceExpression();
      }
      ;
      return this.right().consume(this).c();
    }
    ;
    if (this._expression) {
      this.left().forceExpression();
    }
    ;
    var l = this.left().node();
    var r = this.right();
    if (l instanceof Access && l.left() instanceof Super) {
      if (m = STACK.method()) {
        if (m.option("inExtension")) {
          let key = l.right();
          if (key instanceof Identifier) {
            key = key.toStr();
          }
          ;
          let op = CALL(OP(".", this.scope__().context(), "super$set"), [key, this.right()]);
          return op.c({expression: true});
        }
        ;
      }
      ;
    }
    ;
    if (l instanceof Self) {
      var ctx = this.scope__().context();
      l = ctx.reference();
    }
    ;
    var lc = l.c();
    var out = "" + lc + " " + this.op() + " " + this.right().c({expression: true});
    if (typ = this.datatype() || l && !(l instanceof VarReference) && l.datatype()) {
      out = typ.c() + " " + out;
    }
    ;
    if (l instanceof Obj) {
      out = "(" + out + ")";
    }
    ;
    return out;
  };
  Assign.prototype.shouldParenthesize = function(par) {
    if (par === void 0)
      par = this.up();
    return this._parens || par instanceof Op && par.op() != "=";
  };
  Assign.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      if (this.right() instanceof TagLike) {
        this.right().set({assign: this.left()});
        return this.right().consume(node);
      } else {
        return this;
      }
      ;
    }
    ;
    if (node instanceof Return && this.left() instanceof VarReference) {
      this.left().forceExpression();
    }
    ;
    if (this.isExpressable()) {
      this.forceExpression();
      return Assign.prototype.__super__.consume.call(this, node);
    }
    ;
    var ast2 = this.right().consume(this);
    return ast2.consume(node);
  };
  function PushAssign() {
    return Assign.apply(this, arguments);
  }
  subclass$(PushAssign, Assign);
  exports2.PushAssign = PushAssign;
  PushAssign.prototype.consumed = function(v) {
    return this._consumed;
  };
  PushAssign.prototype.setConsumed = function(v) {
    this._consumed = v;
    return this;
  };
  PushAssign.prototype.register = function(node) {
    this._consumed || (this._consumed = []);
    this._consumed.push(node);
    return this;
  };
  PushAssign.prototype.js = function(o) {
    return "" + this.left().c() + ".push(" + this.right().c() + ")";
  };
  PushAssign.prototype.consume = function(node) {
    return this;
  };
  function TagPushAssign() {
    return PushAssign.apply(this, arguments);
  }
  subclass$(TagPushAssign, PushAssign);
  exports2.TagPushAssign = TagPushAssign;
  TagPushAssign.prototype.js = function(o) {
    return "" + this.left().c() + ".push(" + this.right().c() + ")";
  };
  TagPushAssign.prototype.consume = function(node) {
    return this;
  };
  function ConditionalAssign() {
    return Assign.apply(this, arguments);
  }
  subclass$(ConditionalAssign, Assign);
  exports2.ConditionalAssign = ConditionalAssign;
  ConditionalAssign.prototype.consume = function(node) {
    return this.normalize().consume(node);
  };
  ConditionalAssign.prototype.normalize = function() {
    var l = this.left().node();
    var ls = l;
    if (l instanceof Access) {
      if (l.left()) {
        l.left().cache();
      }
      ;
      ls = l.clone(l.left(), l.right());
      if (l instanceof PropertyAccess) {
        l.cache();
      }
      ;
      if (l instanceof IndexAccess || l.right() instanceof IdentifierExpression) {
        l.right().cache();
      }
      ;
    }
    ;
    var expr = this.right().isExpressable();
    var ast2 = null;
    if (expr && this.op() == "||=") {
      ast2 = OP("||", l, OP("=", ls, this.right()));
    } else if (expr && this.op() == "&&=") {
      ast2 = OP("&&", l, OP("=", ls, this.right()));
    } else {
      ast2 = IF(this.condition(), OP("=", ls, this.right()), l);
      ast2.setScope(null);
    }
    ;
    if (ast2.isExpressable()) {
      ast2.toExpression();
    }
    ;
    return ast2;
  };
  ConditionalAssign.prototype.c = function() {
    return this.normalize().c();
  };
  ConditionalAssign.prototype.condition = function() {
    if (this.op() == "?=" || this.op() == "??=") {
      return OP("==", this.left(), NULL);
    } else if (this.op() == "||=") {
      return OP("!", this.left());
    } else if (this.op() == "&&=") {
      return this.left();
    } else if (this.op() == "!?=") {
      return OP("!=", this.left(), NULL);
    } else {
      return this.left();
    }
    ;
  };
  ConditionalAssign.prototype.js = function(o) {
    var ast2 = IF(this.condition(), OP("=", this.left(), this.right()), this.left());
    ast2.setScope(null);
    if (ast2.isExpressable()) {
      ast2.toExpression();
    }
    ;
    return ast2.c();
  };
  function CompoundAssign() {
    return Assign.apply(this, arguments);
  }
  subclass$(CompoundAssign, Assign);
  exports2.CompoundAssign = CompoundAssign;
  CompoundAssign.prototype.consume = function(node) {
    if (this.isExpressable()) {
      return CompoundAssign.prototype.__super__.consume.apply(this, arguments);
    }
    ;
    var ast2 = this.normalize();
    if (ast2 != this) {
      return ast2.consume(node);
    }
    ;
    ast2 = this.right().consume(this);
    return ast2.consume(node);
  };
  CompoundAssign.prototype.normalize = function() {
    var ln = this.left().node();
    if (!(ln instanceof PropertyAccess)) {
      return this;
    }
    ;
    if (ln.left()) {
      ln.left().cache();
    }
    ;
    var ast2 = OP("=", this.left(), OP(this.op()[0], this.left(), this.right()));
    if (ast2.isExpressable()) {
      ast2.toExpression();
    }
    ;
    return ast2;
  };
  CompoundAssign.prototype.c = function() {
    var ast2 = this.normalize();
    if (ast2 == this) {
      return CompoundAssign.prototype.__super__.c.apply(this, arguments);
    }
    ;
    var up = STACK.current();
    if (up instanceof Block) {
      up.replace(this, ast2);
    }
    ;
    return ast2.c();
  };
  function TypeAnnotation(value) {
    this._value = value;
    this;
  }
  subclass$(TypeAnnotation, Node2);
  exports2.TypeAnnotation = TypeAnnotation;
  TypeAnnotation.prototype.add = function(item) {
    return this._parts.push(item);
  };
  TypeAnnotation.prototype.startLoc = function() {
    return this._value.startLoc() + 1;
  };
  TypeAnnotation.prototype.endLoc = function() {
    return this._value.endLoc();
  };
  TypeAnnotation.prototype.asParam = function(name) {
    return "@param {" + M2(String(this._value).slice(1), this) + "} " + name;
  };
  TypeAnnotation.prototype.c = function() {
    return "/**@type {" + M2(String(this._value).slice(1), this) + "}*/";
  };
  function Identifier(value) {
    if (value instanceof Token2) {
      this._startLoc = value.startLoc();
    }
    ;
    this._value = this.load(value);
    this._symbol = null;
    if (("" + value).indexOf("?") >= 0) {
      this._safechain = true;
    }
    ;
    this;
  }
  subclass$(Identifier, Node2);
  exports2.Identifier = Identifier;
  Identifier.prototype.safechain = function(v) {
    return this._safechain;
  };
  Identifier.prototype.setSafechain = function(v) {
    this._safechain = v;
    return this;
  };
  Identifier.prototype.value = function(v) {
    return this._value;
  };
  Identifier.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  Identifier.prototype.variable = function(v) {
    return this._variable;
  };
  Identifier.prototype.setVariable = function(v) {
    this._variable = v;
    return this;
  };
  Identifier.prototype.isStatic = function() {
    return true;
  };
  Identifier.prototype.toRaw = function() {
    return this._value._value || this._value;
  };
  Identifier.prototype.add = function(part) {
    return new IdentifierExpression(this).add(part);
  };
  Identifier.prototype.references = function(variable) {
    if (this._value) {
      this._value._variable = variable;
    }
    ;
    if (this._value) {
      STACK.registerSemanticToken(this._value, variable);
    }
    ;
    return this;
  };
  Identifier.prototype.load = function(v) {
    return v instanceof Identifier ? v.value() : v;
  };
  Identifier.prototype.traverse = function() {
    return this;
  };
  Identifier.prototype.visit = function() {
    if (this._value instanceof Node2) {
      this._value.traverse();
    }
    ;
    return this;
  };
  Identifier.prototype.region = function() {
    return [this._value._loc, this._value._loc + this._value._len];
  };
  Identifier.prototype.startLoc = function() {
    return this._value && this._value.startLoc ? this._value.startLoc() : null;
  };
  Identifier.prototype.endLoc = function() {
    return this._value && this._value.endLoc ? this._value.endLoc() : null;
  };
  Identifier.prototype.loc = function() {
    return [this.startLoc(), this.endLoc()];
  };
  Identifier.prototype.isValidIdentifier = function() {
    return true;
  };
  Identifier.prototype.isReserved = function() {
    return this._value.reserved || RESERVED_TEST.test(String(this._value));
  };
  Identifier.prototype.isPredicate = function() {
    return /\?$/.test(String(this._value));
  };
  Identifier.prototype.isDangerous = function() {
    return /\!$/.test(String(this._value));
  };
  Identifier.prototype.isCapitalized = function() {
    return /^[A-Z]/.test(String(this._value));
  };
  Identifier.prototype.isInternal = function() {
    return /^\$/.test(String(this._value));
  };
  Identifier.prototype.symbol = function() {
    return this._symbol || (this._symbol = AST.sym(this.value()));
  };
  Identifier.prototype.toString = function() {
    return String(this._value);
  };
  Identifier.prototype.toStr = function() {
    return new Str("'" + this.symbol() + "'");
  };
  Identifier.prototype.toAttrString = function() {
    return new Str("'" + String(this._value) + "'");
  };
  Identifier.prototype.toJSON = function() {
    return this.toString();
  };
  Identifier.prototype.alias = function() {
    return AST.sym(this._value);
  };
  Identifier.prototype.js = function(o) {
    return this._variable ? this._variable.c() : this.symbol();
  };
  Identifier.prototype.c = function(o) {
    let up = STACK.current();
    if (up instanceof Util && !(up instanceof Util.Iterable)) {
      return this.toStr().c();
    }
    ;
    let out = this.js();
    if (OPTS.sourceMap && (!o || o.mark !== false)) {
      out = M2(out, this._token || this._value);
    }
    ;
    return out;
  };
  Identifier.prototype.dump = function() {
    return {loc: this.region()};
  };
  Identifier.prototype.namepath = function() {
    return this.toString();
  };
  Identifier.prototype.shouldParenthesizeInTernary = function() {
    return this._parens || this._cache;
  };
  Identifier.prototype.registerVariable = function(type, scope2) {
    if (scope2 === void 0)
      scope2 = this.scope__();
    this._variable = scope2.register(this.symbol(), this, {type});
    this.stack().registerSemanticToken(this._value, this._variable);
    return this;
  };
  Identifier.prototype.resolveVariable = function(scope2) {
    if (scope2 === void 0)
      scope2 = this.scope__();
    let variable = scope2.lookup(this.symbol());
    this._variable = variable;
    this.stack().registerSemanticToken(this._value, this._variable);
    return this;
  };
  function DecoratorIdentifier() {
    return Identifier.apply(this, arguments);
  }
  subclass$(DecoratorIdentifier, Identifier);
  exports2.DecoratorIdentifier = DecoratorIdentifier;
  DecoratorIdentifier.prototype.symbol = function() {
    return "decorator$" + this._value.slice(1);
  };
  DecoratorIdentifier.prototype.toString = function() {
    return this.symbol();
  };
  function SymbolIdentifier() {
    return Identifier.apply(this, arguments);
  }
  subclass$(SymbolIdentifier, Identifier);
  exports2.SymbolIdentifier = SymbolIdentifier;
  SymbolIdentifier.prototype.c = function(o) {
    if (o === void 0)
      o = {};
    let out = this.variable().c();
    if (o.as == "field") {
      return "[" + out + "]";
    } else {
      return out;
    }
    ;
  };
  SymbolIdentifier.prototype.variable = function() {
    return this._variable || (this._variable = this.scope__().root().symbolRef(this._value.slice(0)));
  };
  SymbolIdentifier.prototype.asObjectKey = function() {
    return "[" + this.c() + "]";
  };
  SymbolIdentifier.prototype.toString = function() {
    return this.c();
  };
  SymbolIdentifier.prototype.resolveVariable = function() {
    return this;
  };
  SymbolIdentifier.prototype.registerVariable = function() {
    return this;
  };
  function MixinIdentifier() {
    return Identifier.apply(this, arguments);
  }
  subclass$(MixinIdentifier, Identifier);
  exports2.MixinIdentifier = MixinIdentifier;
  MixinIdentifier.prototype.symbol = function() {
    return "mixin$" + this._value.slice(1);
  };
  MixinIdentifier.prototype.traverse = function(o) {
    if (this._traversed) {
      return this;
    }
    ;
    if (!this._variable) {
      this.resolveVariable();
    }
    ;
    return this._traversed = true;
  };
  MixinIdentifier.prototype.c = function(o) {
    if (o && (o.as == "string" || o.as == "substr")) {
      let flags = this.toFlags().map(function(f) {
        return f instanceof Variable ? "${" + f.c() + "}" : f.raw();
      });
      let out2 = flags.join(" ");
      return o.as == "string" ? "`" + out2 + "`" : out2;
    }
    ;
    let up = STACK.current();
    if (up instanceof Util && !(up instanceof Util.Iterable)) {
      return this.toStr().c();
    }
    ;
    let out = this.js();
    if (OPTS.sourceMap && (!o || o.mark !== false)) {
      out = M2(out, this._token || this._value);
    }
    ;
    return out;
  };
  MixinIdentifier.prototype.toString = function() {
    return this.symbol();
  };
  MixinIdentifier.prototype.toFlagName = function() {
    return this.symbol();
  };
  MixinIdentifier.prototype.toFlags = function() {
    if (this._parts) {
      return this._parts;
    }
    ;
    this.traverse();
    let v = this._variable;
    let parts = [];
    let part = v;
    while (part) {
      if (part._declarator instanceof StyleRuleSet) {
        parts.push(STR(part._declarator._name));
      } else {
        parts.push(part);
      }
      ;
      part = part._parent;
    }
    ;
    return this._parts = parts;
    if (v && v._declarator instanceof StyleRuleSet) {
      return v._declarator._name;
    }
    ;
    return null;
  };
  function Private() {
    return Identifier.apply(this, arguments);
  }
  subclass$(Private, Identifier);
  exports2.Private = Private;
  Private.prototype.symbol = function() {
    return this._symbol || (this._symbol = AST.sym("__" + this.value()));
  };
  Private.prototype.add = function(part) {
    return new IdentifierExpression(this.value()).add(part).set({prefix: "__", private: true});
  };
  function TagIdRef(v) {
    this._value = v instanceof Identifier ? v.value() : v;
    this;
  }
  subclass$(TagIdRef, ValueNode2);
  exports2.TagIdRef = TagIdRef;
  TagIdRef.prototype.js = function() {
    return "" + this.scope__().imba().c() + ".getElementById('" + this.value().c() + "')";
  };
  function Ivar(v) {
    this._value = v instanceof Identifier ? v.value() : v;
    this;
  }
  subclass$(Ivar, Identifier);
  exports2.Ivar = Ivar;
  Ivar.prototype.name = function() {
    return helpers2.dashToCamelCase(this._value).replace(/^[\#]/, "");
  };
  Ivar.prototype.alias = function() {
    return this.name();
  };
  Ivar.prototype.js = function(o) {
    return this.symbol();
  };
  function Decorator() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Decorator, ValueNode2);
  exports2.Decorator = Decorator;
  Decorator.prototype.name = function() {
    return this._name || (this._name = this._value.js());
  };
  Decorator.prototype.visit = function() {
    var block;
    this._variable = this.scope__().lookup(this.name());
    this._value._variable || (this._value._variable = this._variable);
    if (this._call) {
      this._call.traverse();
    }
    ;
    if (this.option("params")) {
      this._params = this.option("params");
      this._params.traverse();
    }
    ;
    if (block = this.up()) {
      block._decorators || (block._decorators = []);
      return block._decorators.push(this);
    }
    ;
  };
  Decorator.prototype.c = function() {
    if (STACK.current() instanceof ClassBody) {
      return;
    }
    ;
    let out = this._value.c();
    if (this._params) {
      out += ".bind([" + this._params.c({expression: true}) + "])";
    } else {
      out += ".bind([])";
    }
    ;
    return out;
  };
  function Const() {
    return Identifier.apply(this, arguments);
  }
  subclass$(Const, Identifier);
  exports2.Const = Const;
  Const.prototype.symbol = function() {
    return this._symbol || (this._symbol = AST.sym(this.value()));
  };
  Const.prototype.js = function(o) {
    return this._variable ? this._variable.c() : this.symbol();
  };
  Const.prototype.traverse = function() {
    if (this._traversed) {
      return this;
    }
    ;
    this._traversed = true;
    var curr = STACK.current();
    if (!(curr instanceof Access) || curr.left() == this) {
      if (this.symbol() == "Imba") {
        this._variable = this.scope__().imba();
      } else {
        this._variable = this.scope__().lookup(this.value());
      }
      ;
    }
    ;
    return this;
  };
  Const.prototype.c = function() {
    if (this.option("export")) {
      return "exports." + this._value + " = " + this.js();
    } else {
      return Const.prototype.__super__.c.apply(this, arguments);
    }
    ;
  };
  function TagTypeIdentifier(value) {
    this._token = value;
    this._value = this.load(value);
    this;
  }
  subclass$(TagTypeIdentifier, Identifier);
  exports2.TagTypeIdentifier = TagTypeIdentifier;
  TagTypeIdentifier.prototype.name = function(v) {
    return this._name;
  };
  TagTypeIdentifier.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  TagTypeIdentifier.prototype.ns = function(v) {
    return this._ns;
  };
  TagTypeIdentifier.prototype.setNs = function(v) {
    this._ns = v;
    return this;
  };
  TagTypeIdentifier.prototype.startLoc = function() {
    return this._token && this._token.startLoc && this._token.startLoc();
  };
  TagTypeIdentifier.prototype.endLoc = function() {
    return this._token && this._token.endLoc && this._token.endLoc();
  };
  TagTypeIdentifier.prototype.load = function(val) {
    this._str = "" + val;
    var parts = this._str.split(":");
    this._raw = val;
    this._name = parts.pop();
    this._ns = parts.shift();
    return this._str;
  };
  TagTypeIdentifier.prototype.traverse = function(o) {
    if (this._traversed) {
      return this;
    }
    ;
    this._traversed = true;
    if (this.isClass()) {
      if (o && o.declaring) {
        this.registerVariable("const", o.declscope || STACK.scope());
        if (this._variable) {
          this._variable.setValue(o.declaring);
        }
        ;
      } else {
        this.resolveVariable();
      }
      ;
    }
    ;
    return this;
  };
  TagTypeIdentifier.prototype.js = function(o) {
    return "'" + this.toNodeName() + "'";
  };
  TagTypeIdentifier.prototype.c = function() {
    return this.js();
  };
  TagTypeIdentifier.prototype.func = function() {
    var name = this._name.replace(/-/g, "_").replace(/\#/, "");
    if (this._ns) {
      name += "$" + this._ns.toLowerCase();
    }
    ;
    return name;
  };
  TagTypeIdentifier.prototype.nativeCreateNode = function() {
    let doc = this.scope__().root().document().c();
    if (this.isSVG()) {
      return CALL(LIT("" + doc + ".createElementNS"), [STR("http://www.w3.org/2000/svg"), STR(this.name())]);
    } else {
      return CALL(LIT("" + doc + ".createElement"), [STR(this.name())]);
    }
    ;
  };
  TagTypeIdentifier.prototype.isClass = function() {
    return !!this._str.match(/^[A-Z]/);
  };
  TagTypeIdentifier.prototype.isNative = function() {
    return !this._ns && TAG_TYPES.HTML.indexOf(this._str) >= 0;
  };
  TagTypeIdentifier.prototype.isNativeSVG = function() {
    return this._ns == "svg" && TAG_TYPES.SVG.indexOf(this._str) >= 0;
  };
  TagTypeIdentifier.prototype.isSVG = function() {
    return this._ns == "svg" || !this.isNative() && !this._ns && TAG_NAMES["svg_" + this._str] || this.isAsset();
  };
  TagTypeIdentifier.prototype.isAsset = function() {
    return this._ns == "assets";
  };
  TagTypeIdentifier.prototype.toAssetName = function() {
    return this.isAsset() ? this._str : null;
  };
  TagTypeIdentifier.prototype.toAssetReference = function() {
    let asset = STACK.root().lookupAsset(this.toAssetName(), "svg");
    return asset.ref;
    return OP(".", asset.ref, STR(this._name));
  };
  TagTypeIdentifier.prototype.symbol = function() {
    return this._str;
  };
  TagTypeIdentifier.prototype.isCustom = function() {
    return !this.isNative() && !this.isNativeSVG();
  };
  TagTypeIdentifier.prototype.isComponent = function() {
    return !this.isNative() && !this.isNativeSVG();
  };
  TagTypeIdentifier.prototype.isSimpleNative = function() {
    return this.isNative() && !/input|textarea|select|form|iframe/.test(this._str);
  };
  TagTypeIdentifier.prototype.toFunctionalType = function() {
    return LIT(this._str);
  };
  TagTypeIdentifier.prototype.toSelector = function() {
    return this.toNodeName();
  };
  TagTypeIdentifier.prototype.resolveVariable = function(scope2) {
    if (scope2 === void 0)
      scope2 = this.scope__();
    let variable = this.scope__().lookup(this._str);
    if (this._variable = variable) {
      this.stack().registerSemanticToken(this._value, this._variable);
    }
    ;
    return this;
  };
  TagTypeIdentifier.prototype.toVarPrefix = function() {
    let str = this._str;
    return str.replace(/[\:\-]/g, "");
  };
  TagTypeIdentifier.prototype.toClassName = function() {
    let str = this._str;
    if (str == "element") {
      return "Element";
    } else if (str == "component") {
      return "ImbaElement";
    } else if (str == "svg:element") {
      return "SVGElement";
    } else if (str == "htmlelement") {
      return "HTMLElement";
    } else if (str == "fragment") {
      return "DocumentFragment";
    }
    ;
    let match = TAG_NAMES[this.isSVG() ? "svg_" + this._name : this._name];
    if (match) {
      return match.name;
    }
    ;
    if (this._str == "fragment") {
      return "DocumentFragment";
    } else if (this.isClass()) {
      return this._str;
    } else {
      return helpers2.pascalCase(this._str + "-component");
    }
    ;
  };
  TagTypeIdentifier.prototype.toNodeName = function() {
    if (this.isClass()) {
      return this._nodeName || (this._nodeName = helpers2.dasherize(this._str + "-" + this.sourceId()));
    } else {
      return this._str;
    }
    ;
  };
  TagTypeIdentifier.prototype.toTypeArgument = function() {
    if (this._variable) {
      return this._variable.c();
    } else {
      return this.name();
    }
    ;
  };
  TagTypeIdentifier.prototype.id = function() {
    var m = this._str.match(/\#([\w\-\d\_]+)\b/);
    return m ? m[1] : null;
  };
  TagTypeIdentifier.prototype.flag = function() {
    return "_" + this.name().replace(/--/g, "_").toLowerCase();
  };
  TagTypeIdentifier.prototype.sel = function() {
    return "." + this.flag();
  };
  TagTypeIdentifier.prototype.string = function() {
    return this.value();
  };
  TagTypeIdentifier.prototype.toString = function() {
    return this.value();
  };
  function InterpolatedIdentifier() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(InterpolatedIdentifier, ValueNode2);
  exports2.InterpolatedIdentifier = InterpolatedIdentifier;
  InterpolatedIdentifier.prototype.js = function() {
    return "[" + this.value().c() + "]";
  };
  function Argvar() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Argvar, ValueNode2);
  exports2.Argvar = Argvar;
  Argvar.prototype.c = function() {
    var v = parseInt(String(this.value()));
    if (v == 0) {
      return "arguments";
    }
    ;
    var s = this.scope__();
    var par = s.params().at(v - 1, true);
    return "" + AST.c(par.name());
  };
  function DoPlaceholder() {
    return Node2.apply(this, arguments);
  }
  subclass$(DoPlaceholder, Node2);
  exports2.DoPlaceholder = DoPlaceholder;
  function Call(callee, args, opexists) {
    this._traversed = false;
    this._expression = false;
    this._parens = false;
    this._cache = null;
    this._receiver = null;
    this._opexists = opexists;
    if (callee instanceof BangCall) {
      callee = callee._callee;
    }
    ;
    if (callee instanceof Super) {
      callee.setArgs(this instanceof BangCall ? [] : args);
      return callee;
    }
    ;
    if (callee instanceof VarOrAccess) {
      var str = callee.value().symbol();
      if (str == "new") {
        console.log("calling");
      }
      ;
      if (str == "extern") {
        callee.value().value()._type = "EXTERN";
        return new ExternDeclaration(args);
      }
      ;
      if (str == "require") {
        console.log("calling require");
      }
      ;
      if (str == "tag") {
        return new TagWrapper(args && args.index ? args.index(0) : args[0]);
      }
      ;
      if (str == "export") {
        return new Export(args);
      }
      ;
    }
    ;
    this._callee = callee;
    this._args = args || new ArgList([]);
    if (args instanceof Array) {
      this._args = new ArgList(args);
    }
    ;
    if (callee instanceof Decorator) {
      callee._call = this;
      return callee;
    }
    ;
    return this;
  }
  subclass$(Call, Node2);
  exports2.Call = Call;
  Call.prototype.callee = function(v) {
    return this._callee;
  };
  Call.prototype.setCallee = function(v) {
    this._callee = v;
    return this;
  };
  Call.prototype.receiver = function(v) {
    return this._receiver;
  };
  Call.prototype.setReceiver = function(v) {
    this._receiver = v;
    return this;
  };
  Call.prototype.args = function(v) {
    return this._args;
  };
  Call.prototype.setArgs = function(v) {
    this._args = v;
    return this;
  };
  Call.prototype.block = function(v) {
    return this._block;
  };
  Call.prototype.setBlock = function(v) {
    this._block = v;
    return this;
  };
  Call.prototype.loc = function() {
    return this._callee.loc();
  };
  Call.prototype.visit = function() {
    this.args().traverse();
    this.callee().traverse();
    return this._block && this._block.traverse();
  };
  Call.prototype.addBlock = function(block) {
    var pos = this._args.filter(function(n, i) {
      return n instanceof DoPlaceholder;
    })[0];
    pos ? this.args().replace(pos, block) : this.args().push(block);
    return this;
  };
  Call.prototype.receiver = function() {
    return this._receiver || (this._receiver = this.callee() instanceof Access && this.callee().left() || NULL);
  };
  Call.prototype.safechain = function() {
    return this.callee().safechain();
  };
  Call.prototype.shouldParenthesizeInTernary = function() {
    return this._parens || this.safechain() || this._cache;
  };
  Call.prototype.startLoc = function() {
    return this._startLoc || this._callee && this._callee.startLoc ? this._callee.startLoc() : 0;
  };
  Call.prototype.endLoc = function() {
    return this._endLoc || this._args && this._args.endLoc() || this._callee.endLoc();
  };
  Call.prototype.js = function(o) {
    var m;
    var opt = {expression: true};
    var rec = null;
    var args = this.args();
    var splat = args.some(function(v) {
      return v instanceof Splat;
    });
    var out = null;
    var lft = null;
    var rgt = null;
    var wrap = null;
    var callee = this._callee = this._callee.node();
    if (callee instanceof Access) {
      lft = callee.left();
      rgt = callee.right();
    }
    ;
    if (callee instanceof Super) {
      if (m = STACK.method()) {
        if (m.option("inExtension")) {
          callee = OP(".", callee, m.name());
          this._receiver = this.scope__().context();
        }
        ;
      }
      ;
      this;
    }
    ;
    if (callee instanceof PropertyAccess) {
      this._receiver = callee.receiver();
      callee = this._callee = new Access(callee.op(), callee.left(), callee.right());
    }
    ;
    if (rgt instanceof Identifier && rgt.value() == "assert" && !splat && false) {
      let arg = args.first();
      arg.option("assertion", true);
      args._nodes[0] = new AssertionNode(arg);
    }
    ;
    let safeop = "";
    if (callee instanceof Access && callee.op() == "?.") {
      safeop = "?.";
    }
    ;
    if (this._receiver) {
      if (!(this._receiver instanceof ScopeContext)) {
        this._receiver.cache();
      }
      ;
      args.unshift(this.receiver());
      out = "" + callee.c({expression: true}) + ".call(" + args.c({expression: true, mark: false}) + ")";
    } else {
      out = "" + callee.c({expression: true}) + safeop + "(" + args.c({expression: true, mark: false}) + ")";
    }
    ;
    if (wrap) {
      if (this._cache) {
        this._cache.manual = true;
        out = "(" + this.cachevar().c() + "=" + out + ")";
      }
      ;
      out = [wrap[0], out, wrap[1]].join("");
    }
    ;
    return out;
  };
  function BangCall() {
    return Call.apply(this, arguments);
  }
  subclass$(BangCall, Call);
  exports2.BangCall = BangCall;
  function Instantiation() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Instantiation, ValueNode2);
  exports2.Instantiation = Instantiation;
  Instantiation.prototype.js = function(o) {
    return "" + M2("new", this.keyword()) + " " + this.value().c();
  };
  function New() {
    return Call.apply(this, arguments);
  }
  subclass$(New, Call);
  exports2.New = New;
  New.prototype.visit = function() {
    this.keyword().warn("Value.new is deprecated - use new Value");
    return New.prototype.__super__.visit.apply(this, arguments);
  };
  New.prototype.endLoc = function() {
    return this.keyword() && this.keyword().endLoc() || New.prototype.__super__.endLoc.apply(this, arguments);
  };
  New.prototype.startLoc = function() {
    return null;
  };
  New.prototype.js = function(o) {
    var target = this.callee();
    while (target instanceof Access) {
      let left = target.left();
      if (left instanceof PropertyAccess || left instanceof VarOrAccess) {
        this.callee()._parens = true;
        break;
      }
      ;
      target = left;
    }
    ;
    var out = "" + M2("new", this.keyword()) + " " + M2(this.callee().c(), this.callee());
    if (!(o.parent() instanceof Call || o.parent() instanceof BangCall)) {
      out += "()";
    }
    ;
    return out;
  };
  function ExternDeclaration() {
    return ListNode.apply(this, arguments);
  }
  subclass$(ExternDeclaration, ListNode);
  exports2.ExternDeclaration = ExternDeclaration;
  ExternDeclaration.prototype.visit = function() {
    this.setNodes(this.map(function(item) {
      return item.node();
    }));
    var root = this.scope__();
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, item; i < len; i++) {
      item = items[i];
      var variable = root.register(item.symbol(), item, {type: "global"});
      variable.addReference(item);
    }
    ;
    return this;
  };
  ExternDeclaration.prototype.c = function() {
    return "// externs";
  };
  function ControlFlow() {
    return Node2.apply(this, arguments);
  }
  subclass$(ControlFlow, Node2);
  exports2.ControlFlow = ControlFlow;
  ControlFlow.prototype.loc = function() {
    return this._body ? this._body.loc() : [0, 0];
  };
  function ControlFlowStatement() {
    return ControlFlow.apply(this, arguments);
  }
  subclass$(ControlFlowStatement, ControlFlow);
  exports2.ControlFlowStatement = ControlFlowStatement;
  ControlFlowStatement.prototype.isExpressable = function() {
    return false;
  };
  function If(cond, body, o) {
    if (o === void 0)
      o = {};
    this.setup();
    this._test = cond;
    this._body = body;
    this._alt = null;
    this._type = o.type;
    if (this._type == "unless")
      this.invert();
    this._scope = new IfScope(this);
    this;
  }
  subclass$(If, ControlFlow);
  exports2.If = If;
  If.prototype.test = function(v) {
    return this._test;
  };
  If.prototype.setTest = function(v) {
    this._test = v;
    return this;
  };
  If.prototype.body = function(v) {
    return this._body;
  };
  If.prototype.setBody = function(v) {
    this._body = v;
    return this;
  };
  If.prototype.alt = function(v) {
    return this._alt;
  };
  If.prototype.setAlt = function(v) {
    this._alt = v;
    return this;
  };
  If.prototype.scope = function(v) {
    return this._scope;
  };
  If.prototype.setScope = function(v) {
    this._scope = v;
    return this;
  };
  If.prototype.prevIf = function(v) {
    return this._prevIf;
  };
  If.prototype.setPrevIf = function(v) {
    this._prevIf = v;
    return this;
  };
  If.ternary = function(cond, body, alt) {
    var obj = new If(cond, new Block([body]), {type: "?"});
    obj.addElse(new Block([alt]));
    return obj;
  };
  If.prototype.addElse = function(add) {
    if (this.alt() && this.alt() instanceof If) {
      this.alt().addElse(add);
    } else {
      this.setAlt(add);
      if (add instanceof If) {
        add.setPrevIf(this);
      }
      ;
    }
    ;
    return this;
  };
  If.prototype.loc = function() {
    return this._loc || (this._loc = [this._type ? this._type._loc : 0, this.body().loc()[1]]);
  };
  If.prototype.invert = function() {
    if (this._test instanceof ComparisonOp) {
      return this._test = this._test.invert();
    } else {
      return this._test = new UnaryOp("!", this._test, null);
    }
    ;
  };
  If.prototype.visit = function(stack) {
    var alt = this.alt();
    var scop = this._scope;
    if (scop) {
      scop.visit();
    }
    ;
    if (this.test()) {
      this._scope = null;
      this.test().traverse();
      this._scope = scop;
    }
    ;
    this._tag = stack._tag;
    for (let o = this._scope.varmap(), variable, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++) {
      name = keys[i];
      variable = o[name];
      if (variable.type() == "let") {
        variable._virtual = true;
        variable.autodeclare();
      }
      ;
    }
    ;
    if (!stack.isAnalyzing() && !stack.tsc()) {
      this._pretest = AST.truthy(this.test());
      if (this._pretest === true) {
        alt = this._alt = null;
        if (this.test() instanceof EnvFlag) {
          this._preunwrap = true;
        }
        ;
      } else if (this._pretest === false) {
        this.loc();
        this.setBody(null);
      }
      ;
    }
    ;
    if (this.body()) {
      this.body().traverse();
    }
    ;
    if (alt) {
      STACK.pop(this);
      alt._scope || (alt._scope = new BlockScope(alt));
      alt.traverse();
      STACK.push(this);
    }
    ;
    if (this._type == "?" && this.isExpressable())
      this.toExpression();
    return this;
  };
  If.prototype.js = function(o) {
    var v_, test_;
    var body = this.body();
    var brace = {braces: true, indent: true};
    if (this._pretest === true && this._preunwrap) {
      let js = body ? body.c({braces: !!this.prevIf()}) : "true";
      if (!this.prevIf()) {
        js = helpers2.normalizeIndentation(js);
      }
      ;
      if (o.isExpression()) {
        js = "(" + js + ")";
      }
      ;
      return js;
    } else if (this._pretest === false && false) {
      if (this.alt() instanceof If) {
        this.alt().setPrevIf(v_ = this.prevIf()), v_;
      }
      ;
      let js = this.alt() ? this.alt().c({braces: !!this.prevIf()}) : "";
      if (!this.prevIf()) {
        js = helpers2.normalizeIndentation(js);
      }
      ;
      return js;
    }
    ;
    if (o.isExpression()) {
      if ((test_ = this.test()) && test_.shouldParenthesizeInTernary && test_.shouldParenthesizeInTernary()) {
        this.test()._parens = true;
      }
      ;
      var cond = this.test().c({expression: true});
      var code = body ? body.c() : "true";
      if (body && body.shouldParenthesizeInTernary()) {
        code = "(" + code + ")";
      }
      ;
      if (this.alt()) {
        var altbody = this.alt().c();
        if (this.alt().shouldParenthesizeInTernary()) {
          altbody = "(" + altbody + ")";
        }
        ;
        return "" + cond + " ? " + code + " : " + altbody;
      } else {
        if (this._tag) {
          return "" + cond + " ? " + code + " : void(0)";
        } else {
          return "" + cond + " && " + code;
        }
        ;
      }
      ;
    } else {
      code = null;
      cond = this.test().c({expression: true});
      if (body instanceof Block && body.count() == 1 && !(body.first() instanceof LoopFlowStatement)) {
        body = body.first();
      }
      ;
      code = body ? body.c({braces: true}) : "{}";
      var out = "" + M2("if", this._type) + " (" + cond + ") " + code;
      if (this.alt()) {
        out += " else " + this.alt().c(this.alt() instanceof If ? {} : brace);
      }
      ;
      return out;
    }
    ;
  };
  If.prototype.shouldParenthesize = function() {
    return !!this._parens;
  };
  If.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      node.flag(F.TAG_HAS_BRANCHES);
      if (node.body() == this) {
        let branches = this._body ? [this._body] : [];
        let alt = this._alt;
        while (alt instanceof If) {
          if (alt._body) {
            branches.push(alt._body);
          }
          ;
          alt = alt._alt;
        }
        ;
        if (alt) {
          branches.push(alt);
        }
        ;
        for (let i = 0, items = iter$7(branches), len = items.length; i < len; i++) {
          node._branches.push([]);
          items[i].consume(node);
        }
        ;
        return this;
      }
      ;
      if (node instanceof TagLoopFragment) {
        if (this._body) {
          this._body = this._body.consume(node);
        }
        ;
        if (this._alt) {
          this._alt = this._alt.consume(node);
        }
        ;
        return this;
      } else {
        return node.register(this);
      }
      ;
      return this;
    }
    ;
    if (node instanceof TagPushAssign || node instanceof TagFragment) {
      node.register(this);
      if (this._body) {
        this._body = this._body.consume(node);
      }
      ;
      if (this._alt) {
        this._alt = this._alt.consume(node);
      }
      ;
      return this;
    }
    ;
    var isRet = node instanceof Return;
    if (this._expression || (!isRet || this._type == "?") && this.isExpressable()) {
      this.toExpression();
      return If.prototype.__super__.consume.call(this, node);
    } else {
      if (this._body) {
        this._body = this._body.consume(node);
      }
      ;
      if (this._alt) {
        this._alt = this._alt.consume(node);
      }
      ;
    }
    ;
    return this;
  };
  If.prototype.isExpressable = function() {
    var exp = (!this.body() || this.body().isExpressable()) && (!this.alt() || this.alt().isExpressable());
    return exp;
  };
  function Loop(options) {
    if (options === void 0)
      options = {};
    this._traversed = false;
    this._options = options;
    this._body = null;
    this;
  }
  subclass$(Loop, Statement);
  exports2.Loop = Loop;
  Loop.prototype.scope = function(v) {
    return this._scope;
  };
  Loop.prototype.setScope = function(v) {
    this._scope = v;
    return this;
  };
  Loop.prototype.options = function(v) {
    return this._options;
  };
  Loop.prototype.setOptions = function(v) {
    this._options = v;
    return this;
  };
  Loop.prototype.body = function(v) {
    return this._body;
  };
  Loop.prototype.setBody = function(v) {
    this._body = v;
    return this;
  };
  Loop.prototype.catcher = function(v) {
    return this._catcher;
  };
  Loop.prototype.setCatcher = function(v) {
    this._catcher = v;
    return this;
  };
  Loop.prototype.elseBody = function(v) {
    return this._elseBody;
  };
  Loop.prototype.setElseBody = function(v) {
    this._elseBody = v;
    return this;
  };
  Loop.prototype.loc = function() {
    var a = this._options.keyword;
    var b = this._body;
    if (a && b) {
      return [a._loc, b.loc()[1]];
    } else {
      return [0, 0];
    }
    ;
  };
  Loop.prototype.set = function(obj) {
    this._options || (this._options = {});
    var keys = Object.keys(obj);
    for (let i = 0, items = iter$7(keys), len = items.length, k; i < len; i++) {
      k = items[i];
      this._options[k] = obj[k];
    }
    ;
    return this;
  };
  Loop.prototype.addBody = function(body) {
    this.setBody(AST.blk(body));
    return this;
  };
  Loop.prototype.addElse = function(block) {
    this.setElseBody(block);
    return this;
  };
  Loop.prototype.isReactive = function() {
    return this._tag && this._tag.fragment().isReactive();
  };
  Loop.prototype.c = function(o) {
    var s = this.stack();
    var curr = s.current();
    if (this.stack().isExpression() || this.isExpression()) {
      this.scope().closeScope();
      var ast2 = CALL(FN([], [this]), []);
      return ast2.c(o);
    } else if (this.stack().current() instanceof Block || s.up() instanceof Block && s.current()._consumer == this) {
      return Loop.prototype.__super__.c.call(this, o);
    } else if (this._tag) {
      return Loop.prototype.__super__.c.call(this, 0);
    } else {
      this.scope().closeScope();
      ast2 = CALL(FN([], [this]), []);
      return ast2.c(o);
    }
    ;
  };
  function While(test, opts) {
    this._traversed = false;
    this._test = test;
    this._options = opts || {};
    this._scope = new WhileScope(this);
    if (this.option("invert")) {
      this._test = test.invert();
    }
    ;
  }
  subclass$(While, Loop);
  exports2.While = While;
  While.prototype.test = function(v) {
    return this._test;
  };
  While.prototype.setTest = function(v) {
    this._test = v;
    return this;
  };
  While.prototype.visit = function() {
    this.scope().visit();
    if (this.test()) {
      this.test().traverse();
    }
    ;
    if (this.body()) {
      return this.body().traverse();
    }
    ;
  };
  While.prototype.loc = function() {
    var o = this._options;
    return helpers2.unionOfLocations(o.keyword, this._body, o.guard, this._test);
  };
  While.prototype.consume = function(node) {
    if (this.isExpressable()) {
      return While.prototype.__super__.consume.apply(this, arguments);
    }
    ;
    var reuse = false;
    var resvar = this.scope().declare("res", new Arr([]), {system: true});
    this._catcher = new PushAssign("push", resvar, null);
    this.body().consume(this._catcher);
    var ast2 = new Block([this, resvar.accessor()]);
    return ast2.consume(node);
  };
  While.prototype.js = function(o) {
    var out = "while (" + this.test().c({expression: true}) + ")" + this.body().c({braces: true, indent: true});
    if (this.scope().vars().count() > 0) {
      out = this.scope().vars().c() + ";" + out;
    }
    ;
    return out;
  };
  function For(o) {
    if (o === void 0)
      o = {};
    this._traversed = false;
    this._options = o;
    this._scope = new ForScope(this);
    this._catcher = null;
  }
  subclass$(For, Loop);
  exports2.For = For;
  For.prototype.loc = function() {
    var o = this._options;
    return helpers2.unionOfLocations(o.keyword, this._body, o.guard, o.step, o.source);
  };
  For.prototype.ref = function() {
    return this._ref || "" + this._tag.fragment().cvar() + "." + this.oid();
  };
  For.prototype.visit = function(stack) {
    this.scope().visit();
    var parent = stack._tag;
    this.options().source.traverse();
    if (this.options().guard) {
      var op = IF(this.options().guard.invert(), Block.wrap([new ContinueStatement("continue")]));
      this.body().unshift(op, BR);
    }
    ;
    this.declare();
    if (parent) {
      this._tag = parent;
      stack._tag = this;
      this._level = (this._tag && this._tag._level || 0) + 1;
    }
    ;
    this.body().traverse();
    stack._tag = parent;
    return this;
  };
  For.prototype.isBare = function(src) {
    return src && src._variable && src._variable._isArray;
  };
  For.prototype.declare = function() {
    var o = this.options();
    var scope2 = this.scope();
    var src = o.source;
    var vars = o.vars = {};
    var oi = o.index;
    var bare = this.isBare(src);
    if (src instanceof Range2) {
      let from = src.left();
      let to = src.right();
      let dynamic = !(from instanceof Num) || !(to instanceof Num);
      if (to instanceof Num) {
        vars.len = to;
      } else {
        vars.len = scope2.declare("len", to, {type: "let"});
      }
      ;
      vars.value = scope2.declare(o.name, from, {type: "let"});
      if (o.name) {
        vars.value.addReference(o.name);
      }
      ;
      if (o.index) {
        vars.index = scope2.declare(o.index, 0, {type: "let"});
        vars.index.addReference(o.index);
      } else {
        vars.index = vars.value;
      }
      ;
      if (dynamic) {
        vars.diff = scope2.declare("rd", OP("-", vars.len, vars.value), {type: "let"});
      }
      ;
    } else {
      if (oi) {
        vars.index = scope2.declare(oi, 0, {type: "let"});
      } else {
        vars.index = scope2.declare("i", new Num(0), {system: true, type: "let", pool: "counter"});
      }
      ;
      vars.source = bare ? src : scope2.declare("items", this.util().iterable(src), {system: true, type: "let", pool: "iter"});
      vars.len = scope2.declare("len", this.util().len(vars.source), {type: "let", pool: "len", system: true});
      if (o.name) {
        this.body().unshift(new VarDeclaration(o.name, OP(".", vars.source, vars.index), "let"), BR);
      }
      ;
      if (oi) {
        vars.index.addReference(oi);
      }
      ;
    }
    ;
    return this;
  };
  For.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      return node.register(this);
    }
    ;
    if (this.isExpressable()) {
      return For.prototype.__super__.consume.apply(this, arguments);
    }
    ;
    if (this._resvar) {
      var ast2 = new Block([this, BR, this._resvar.accessor()]);
      ast2.consume(node);
      return ast2;
    }
    ;
    var resvar = null;
    var reuseable = false;
    var assignee = null;
    resvar = this._resvar || (this._resvar = this.scope().register("res", null, {system: true, type: "var"}));
    this._catcher = new PushAssign("push", resvar, null);
    let resval = new Arr([]);
    this.body().consume(this._catcher);
    resvar.autodeclare();
    if (node instanceof VarDeclaration || node instanceof Assign) {
      node.setRight(resvar.accessor());
      return new Block([
        OP("=", resvar, resval),
        BR,
        this,
        BR,
        node
      ]);
    } else if (node) {
      let block = [OP("=", resvar, resval), BR, this, BR, resvar.accessor().consume(node)];
      return new Block(block);
    }
    ;
    return this;
  };
  For.prototype.js = function(o) {
    var vars = this.options().vars;
    var idx = vars.index;
    var val = vars.value;
    var src = this.options().source;
    var cond;
    var final;
    if (src instanceof Range2) {
      let a = src.left();
      let b = src.right();
      let inc = src.inclusive();
      cond = OP(inc ? "<=" : "<", val, vars.len);
      final = OP("++", val);
      if (vars.diff) {
        cond = If.ternary(OP(">", vars.diff, new Num(0)), cond, OP(inc ? ">=" : ">", val, vars.len));
        final = If.ternary(OP(">", vars.diff, new Num(0)), OP("++", val), OP("--", val));
      }
      ;
      if (idx && idx != val) {
        final = new ExpressionBlock([final, OP("++", idx)]);
      }
      ;
    } else {
      cond = OP("<", idx, vars.len);
      if (this.options().step) {
        final = OP("=", idx, OP("+", idx, this.options().step));
      } else {
        final = OP("++", idx);
      }
      ;
    }
    ;
    var before = "";
    var after = "";
    var code = this.body().c({braces: true, indent: true});
    var head = "" + M2("for", this.keyword()) + " (" + this.scope().vars().c() + "; " + cond.c({expression: true}) + "; " + final.c({expression: true}) + ") ";
    return before + head + code + after;
  };
  function ForIn() {
    return For.apply(this, arguments);
  }
  subclass$(ForIn, For);
  exports2.ForIn = ForIn;
  function ForOf() {
    return For.apply(this, arguments);
  }
  subclass$(ForOf, For);
  exports2.ForOf = ForOf;
  ForOf.prototype.source = function(v) {
    return this._source;
  };
  ForOf.prototype.setSource = function(v) {
    this._source = v;
    return this;
  };
  ForOf.prototype.declare = function() {
    var value_;
    var o = this.options();
    var vars = o.vars = {};
    var k;
    var v;
    if (o.own) {
      vars.source = o.source._variable || this.scope().declare("o", o.source, {system: true, type: "let"});
      o.value = o.index;
      var i = vars.index = this.scope().declare("i", new Num(0), {system: true, type: "let", pool: "counter"});
      var keys = vars.keys = this.scope().declare("keys", Util.keys(vars.source.accessor()), {system: true, type: "let"});
      var l = vars.len = this.scope().declare("l", Util.len(keys.accessor()), {system: true, type: "let"});
      k = vars.key = this.scope().declare(o.name, null, {type: "let"});
      if (o.value instanceof Obj || o.value instanceof Arr) {
        this.body().unshift(new VarDeclaration(o.value, OP(".", vars.source, k), "let"), BR);
        vars.value = null;
      } else if (o.value) {
        v = vars.value = this.scope().declare(o.value, null, {let: true, type: "let"});
      }
      ;
    } else {
      this.setSource(vars.source = STACK.tsc() ? o.source : this.util().iterable(o.source));
      vars.value = o.value = o.name;
      o.value.traverse({declaring: "let"});
      if (o.value instanceof Identifier) {
        (value_ = o.value)._variable || (value_._variable = this.scope__().register(o.value.symbol(), o.value, {type: "let"}));
        STACK.registerSemanticToken(o.value);
      }
      ;
      if (o.index) {
        vars.counter = this.scope().parent().temporary(null, {}, "" + o.index + "$");
        this.body().unshift(new VarDeclaration(o.index, OP("++", vars.counter), "let"), BR);
        this;
      }
      ;
    }
    ;
    if (v && o.index) {
      v.addReference(o.index);
    }
    ;
    if (k && o.name) {
      k.addReference(o.name);
    }
    ;
    return this;
  };
  ForOf.prototype.js = function(o) {
    var vars = this.options().vars;
    var osrc = this.options().source;
    var src = vars.source;
    var k = vars.key;
    var v = vars.value;
    var i = vars.index;
    var code;
    if (this.options().own) {
      if (v && v.refcount() > 0) {
        this.body().unshift(OP("=", v, OP(".", src, k)));
      }
      ;
      this.body().unshift(OP("=", k, OP(".", vars.keys, i)));
      code = this.body().c({indent: true, braces: true});
      var head = "" + M2("for", this.keyword()) + " (" + this.scope().vars().c() + "; " + OP("<", i, vars.len).c() + "; " + OP("++", i).c() + ")";
      return head + code;
    } else {
      code = this.scope().c({braces: true, indent: true});
      let js = "" + M2("for", this.keyword()) + " (let " + v.c() + " of " + src.c({expression: true}) + ")" + code;
      if (vars.counter) {
        js = "" + vars.counter + " = 0; " + js;
      }
      ;
      return js;
    }
    ;
  };
  ForOf.prototype.head = function() {
    var v = this.options().vars;
    return [
      OP("=", v.key, OP(".", v.keys, v.index)),
      v.value && OP("=", v.value, OP(".", v.source, v.key))
    ];
  };
  function Begin(body) {
    this._nodes = AST.blk(body).nodes();
  }
  subclass$(Begin, Block);
  exports2.Begin = Begin;
  Begin.prototype.shouldParenthesize = function() {
    return this.isExpression();
  };
  function Switch(a, b, c) {
    this._traversed = false;
    this._source = a;
    this._cases = b;
    this._fallback = c;
  }
  subclass$(Switch, ControlFlowStatement);
  exports2.Switch = Switch;
  Switch.prototype.source = function(v) {
    return this._source;
  };
  Switch.prototype.setSource = function(v) {
    this._source = v;
    return this;
  };
  Switch.prototype.cases = function(v) {
    return this._cases;
  };
  Switch.prototype.setCases = function(v) {
    this._cases = v;
    return this;
  };
  Switch.prototype.fallback = function(v) {
    return this._fallback;
  };
  Switch.prototype.setFallback = function(v) {
    this._fallback = v;
    return this;
  };
  Switch.prototype.visit = function() {
    for (let i = 0, items = iter$7(this.cases()), len = items.length; i < len; i++) {
      items[i].traverse();
    }
    ;
    if (this.fallback()) {
      this.fallback().traverse();
    }
    ;
    if (this.source()) {
      this.source().traverse();
    }
    ;
    return;
  };
  Switch.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      if (node.body() == this) {
        let branches = this._cases.slice(0).concat([this._fallback]);
        for (let i = 0, items = iter$7(branches), len = items.length, block; i < len; i++) {
          block = items[i];
          if (!block) {
            continue;
          }
          ;
          node._branches.push([]);
          block.consume(node);
        }
        ;
        return this;
      }
      ;
      return node.register(this);
    }
    ;
    this._cases = this._cases.map(function(item) {
      return item.consume(node);
    });
    if (this._fallback) {
      this._fallback = this._fallback.consume(node);
    }
    ;
    return this;
  };
  Switch.prototype.c = function(o) {
    if (this.stack().isExpression() || this.isExpression()) {
      var ast2 = CALL(FN([], [this]), []);
      return ast2.c(o);
    }
    ;
    return Switch.prototype.__super__.c.call(this, o);
  };
  Switch.prototype.js = function(o) {
    var body = [];
    for (let i = 0, items = iter$7(this.cases()), len = items.length, part; i < len; i++) {
      part = items[i];
      part.autobreak();
      body.push(part);
    }
    ;
    if (this.fallback()) {
      body.push("default:\n" + this.fallback().c({indent: true}));
    }
    ;
    return "switch (" + this.source().c() + ") " + helpers2.bracketize(AST.cary(body).join("\n"), true);
  };
  function SwitchCase(test, body) {
    this._traversed = false;
    this._test = test;
    this._body = AST.blk(body);
    this._scope = new BlockScope(this);
  }
  subclass$(SwitchCase, ControlFlowStatement);
  exports2.SwitchCase = SwitchCase;
  SwitchCase.prototype.test = function(v) {
    return this._test;
  };
  SwitchCase.prototype.setTest = function(v) {
    this._test = v;
    return this;
  };
  SwitchCase.prototype.body = function(v) {
    return this._body;
  };
  SwitchCase.prototype.setBody = function(v) {
    this._body = v;
    return this;
  };
  SwitchCase.prototype.visit = function() {
    this.scope__().visit();
    return this.body().traverse();
  };
  SwitchCase.prototype.consume = function(node) {
    this.body().consume(node);
    return this;
  };
  SwitchCase.prototype.autobreak = function() {
    if (!(this.body().last() instanceof BreakStatement)) {
      this.body().push(new BreakStatement());
    }
    ;
    return this;
  };
  SwitchCase.prototype.js = function(o) {
    if (!(this._test instanceof Array)) {
      this._test = [this._test];
    }
    ;
    var cases = this._test.map(function(item) {
      return "case " + item.c() + ": ";
    });
    return cases.join("\n") + this.body().c({indent: true, braces: true});
  };
  function Try(body, c, f) {
    this._traversed = false;
    this._body = AST.blk(body);
    this._catch = c;
    this._finally = f;
  }
  subclass$(Try, ControlFlowStatement);
  exports2.Try = Try;
  Try.prototype.body = function(v) {
    return this._body;
  };
  Try.prototype.setBody = function(v) {
    this._body = v;
    return this;
  };
  Try.prototype.consume = function(node) {
    this._body = this._body.consume(node);
    if (this._catch) {
      this._catch = this._catch.consume(node);
    }
    ;
    if (this._finally) {
      this._finally = this._finally.consume(node);
    }
    ;
    return this;
  };
  Try.prototype.visit = function() {
    this._body.traverse();
    if (this._catch) {
      this._catch.traverse();
    }
    ;
    if (this._finally) {
      return this._finally.traverse();
    }
    ;
  };
  Try.prototype.js = function(o) {
    var out = "try " + this.body().c({braces: true, indent: true});
    if (this._catch) {
      out += " " + this._catch.c();
    }
    ;
    if (this._finally) {
      out += " " + this._finally.c();
    }
    ;
    if (!(this._catch || this._finally)) {
      out += " catch (e) { }";
    }
    ;
    out += ";";
    return out;
  };
  function Catch(body, varname) {
    this._traversed = false;
    this._body = AST.blk(body || []);
    this._scope = new CatchScope(this);
    this._varname = varname;
    this;
  }
  subclass$(Catch, ControlFlowStatement);
  exports2.Catch = Catch;
  Catch.prototype.body = function(v) {
    return this._body;
  };
  Catch.prototype.setBody = function(v) {
    this._body = v;
    return this;
  };
  Catch.prototype.consume = function(node) {
    this._body = this._body.consume(node);
    return this;
  };
  Catch.prototype.visit = function() {
    this._scope.visit();
    this._variable = this._scope.register(this._varname, this, {type: "let", pool: "catchvar"});
    return this._body.traverse();
  };
  Catch.prototype.js = function(o) {
    return "catch (" + this._variable.c() + ") " + this._body.c({braces: true, indent: true});
  };
  function Finally(body) {
    this._traversed = false;
    this._body = AST.blk(body || []);
  }
  subclass$(Finally, ControlFlowStatement);
  exports2.Finally = Finally;
  Finally.prototype.visit = function() {
    return this._body.traverse();
  };
  Finally.prototype.consume = function(node) {
    return this;
  };
  Finally.prototype.js = function(o) {
    return "finally " + this._body.c({braces: true, indent: true});
  };
  function Range2() {
    return Op.apply(this, arguments);
  }
  subclass$(Range2, Op);
  exports2.Range = Range2;
  Range2.prototype.inclusive = function() {
    return this.op() == "..";
  };
  Range2.prototype.c = function() {
    return "range";
  };
  function Splat() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Splat, ValueNode2);
  exports2.Splat = Splat;
  Splat.prototype.js = function(o) {
    return "..." + this.value().c();
    var par = this.stack().parent();
    if (par instanceof ArgList || par instanceof Arr) {
      return "Array.from(" + this.value().c() + ")";
    } else {
      this.p("what is the parent? " + par);
      return "SPLAT";
    }
    ;
  };
  Splat.prototype.node = function() {
    return this.value();
  };
  function IdentifierExpression(value) {
    IdentifierExpression.prototype.__super__.constructor.apply(this, arguments);
    this._static = true;
    this._nodes = [this._single = value];
  }
  subclass$(IdentifierExpression, Node2);
  exports2.IdentifierExpression = IdentifierExpression;
  IdentifierExpression.prototype.single = function(v) {
    return this._single;
  };
  IdentifierExpression.prototype.setSingle = function(v) {
    this._single = v;
    return this;
  };
  IdentifierExpression.wrap = function(node) {
    return node;
    return node instanceof this ? node : new this(node);
  };
  IdentifierExpression.prototype.add = function(part) {
    this._nodes.push(part);
    this._single = null;
    return this;
  };
  IdentifierExpression.prototype.isPrimitive = function() {
    return this._single && this._single instanceof Token2;
  };
  IdentifierExpression.prototype.isStatic = function() {
    return this.isPrimitive();
  };
  IdentifierExpression.prototype.visit = function() {
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (!(node instanceof Node2)) {
        continue;
      }
      ;
      node.traverse();
    }
    ;
    return this;
  };
  IdentifierExpression.prototype.asObjectKey = function() {
    if (this.isPrimitive()) {
      return "" + this._single.c();
    } else if (this._single) {
      return "[" + this._single.c() + "]";
    } else {
      return "[" + this.asString() + "]";
    }
    ;
  };
  IdentifierExpression.prototype.startLoc = function() {
    var $1;
    let n = this._nodes[0];
    return ($1 = n) && $1.startLoc && $1.startLoc();
  };
  IdentifierExpression.prototype.endLoc = function() {
    var $1;
    let n = this._nodes[this._nodes.length - 1];
    return ($1 = n) && $1.endLoc && $1.endLoc();
  };
  IdentifierExpression.prototype.asIdentifier = function() {
    return this._single ? "[" + this._single.c() + "]" : "[" + this.asString() + "]";
  };
  IdentifierExpression.prototype.asString = function() {
    let s = "`";
    if (this.option("prefix")) {
      s += this.option("prefix");
    }
    ;
    for (let i = 0, items = iter$7(this._nodes), len = items.length, node; i < len; i++) {
      node = items[i];
      if (node instanceof Token2) {
        s += node.value();
      } else {
        s += "${";
        s += node.c();
        s += "}";
      }
      ;
    }
    ;
    s += "`";
    return s;
  };
  IdentifierExpression.prototype.toRaw = function() {
    return this._single ? this._single.c() : "";
  };
  IdentifierExpression.prototype.toString = function() {
    return this.toRaw();
  };
  IdentifierExpression.prototype.js = function(s, o) {
    if (o === void 0)
      o = {};
    if (o.as == "string" || s.parent() instanceof Util) {
      return this.asString();
    } else if (o.as == "key") {
      return this.asObjectKey();
    } else if (o.as == "access") {
      return true;
    } else if (this._single && this._single instanceof Node2) {
      return this._single.c(o);
    } else {
      return this.asString();
    }
    ;
  };
  function TagPart(value, owner) {
    this._name = this.load(value);
    this._tag = owner;
    this._chain = [];
    this._special = false;
    this._params = null;
    this;
  }
  subclass$(TagPart, Node2);
  exports2.TagPart = TagPart;
  TagPart.prototype.name = function(v) {
    return this._name;
  };
  TagPart.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  TagPart.prototype.value = function(v) {
    return this._value;
  };
  TagPart.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  TagPart.prototype.params = function(v) {
    return this._params;
  };
  TagPart.prototype.setParams = function(v) {
    this._params = v;
    return this;
  };
  TagPart.prototype.load = function(value) {
    return value;
  };
  TagPart.prototype.isSpecial = function() {
    return this._special;
  };
  TagPart.prototype.visit = function() {
    this._chain.map(function(v) {
      return v.traverse();
    });
    if (this._value) {
      this._value.traverse();
    }
    ;
    if (this._name.traverse) {
      this._name.traverse();
    }
    ;
    return this;
  };
  TagPart.prototype.quoted = function() {
    return this._quoted || (this._quoted = this._name instanceof IdentifierExpression ? this._name.asString() : helpers2.singlequote(this._name));
  };
  TagPart.prototype.valueIsStatic = function() {
    return !this.value() || this.value().isPrimitive() || this.value() instanceof Func && !this.value().nonlocals();
  };
  TagPart.prototype.isStatic = function() {
    return this.valueIsStatic();
  };
  TagPart.prototype.isProxy = function() {
    return false;
  };
  TagPart.prototype.add = function(item, type) {
    if (type == TagArgList) {
      (this._last || this).setParams(item || new ListNode([]));
    } else {
      this._chain.push(this._last = new TagModifier(item));
    }
    ;
    return this;
  };
  TagPart.prototype.modifiers = function() {
    return this._modifiers || (this._modifiers = new TagModifiers(this._chain).traverse());
  };
  TagPart.prototype.js = function() {
    return "";
  };
  TagPart.prototype.ref = function() {
    return "c$." + this.oid();
  };
  function TagId() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagId, TagPart);
  exports2.TagId = TagId;
  TagId.prototype.js = function() {
    return "id=" + this.quoted();
  };
  function TagFlag() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagFlag, TagPart);
  exports2.TagFlag = TagFlag;
  TagFlag.prototype.condition = function(v) {
    return this._condition;
  };
  TagFlag.prototype.setCondition = function(v) {
    this._condition = v;
    return this;
  };
  TagFlag.prototype.rawClassName = function() {
    return this.name().toRaw();
  };
  TagFlag.prototype.value = function() {
    return this._name;
  };
  TagFlag.prototype.visit = function() {
    this._chain.map(function(v) {
      return v.traverse();
    });
    if (this._condition) {
      this._condition.traverse();
    }
    ;
    if (this._name.traverse) {
      return this._name.traverse();
    }
    ;
  };
  TagFlag.prototype.isStatic = function() {
    return !this.isConditional() && (this._name instanceof Token2 || this._name.isStatic() || this._name instanceof MixinIdentifier);
  };
  TagFlag.prototype.isConditional = function() {
    return !!this.condition();
  };
  TagFlag.prototype.js = function() {
    let val = this.value().c({as: "string"});
    return this.condition() ? "flags.toggle(" + val + "," + this.condition().c() + ")" : "classList.add(" + val + ")";
  };
  function TagSep() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagSep, TagPart);
  exports2.TagSep = TagSep;
  function TagArgList() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagArgList, TagPart);
  exports2.TagArgList = TagArgList;
  function TagAttr() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagAttr, TagPart);
  exports2.TagAttr = TagAttr;
  TagAttr.prototype.isSpecial = function() {
    return String(this._name) == "value";
  };
  TagAttr.prototype.startLoc = function() {
    return this._name && this._name.startLoc && this._name.startLoc();
  };
  TagAttr.prototype.endLoc = function() {
    return this._value && this._value.endLoc && this._value.endLoc();
  };
  TagAttr.prototype.isStatic = function() {
    return TagAttr.prototype.__super__.isStatic.apply(this, arguments) && this._chain.every(function(item) {
      let val = item instanceof Parens ? item.value() : item;
      return val instanceof Func ? !val.nonlocals() : val.isPrimitive();
    });
  };
  TagAttr.prototype.visit = function() {
    this._chain.map(function(v) {
      return v.traverse();
    });
    if (this._value) {
      this._value.traverse();
    }
    ;
    if (this._name.traverse) {
      this._name.traverse();
    }
    ;
    let key = this._key = String(this._name);
    let i = key.indexOf(":");
    if (i >= 0) {
      this._ns = key.slice(0, i);
      this._key = key.slice(i + 1);
    }
    ;
    if (!this._value) {
      this._autovalue = true;
      this._value = STR(key);
    }
    ;
    if (this._chain.length) {
      this._mods = {};
      for (let j = 0, items = iter$7(this._chain), len = items.length; j < len; j++) {
        this._mods[items[j].name()] = 1;
      }
      ;
    }
    ;
    if (this._ns == "bind") {
      STACK.use("use_dom_bind");
    }
    ;
    return this;
  };
  TagAttr.prototype.ns = function() {
    return this._ns;
  };
  TagAttr.prototype.key = function() {
    return this._key;
  };
  TagAttr.prototype.mods = function() {
    return this._mods;
  };
  TagAttr.prototype.nameIdentifier = function() {
    return this._nameIdentifier || (this._nameIdentifier = new Identifier(helpers2.dashToCamelCase(this.key())));
  };
  TagAttr.prototype.modsIdentifier = function() {
    return this._modsIdentifier || (this._modsIdentifier = new Identifier(helpers2.dashToCamelCase(this.key()) + "__"));
  };
  TagAttr.prototype.js = function(o) {
    let val = this.value().c(o);
    let bval = val;
    let op = M2("=", this.option("op"));
    let isAttr = this.key().match(/^(aria-|data-)/) || this._tag && this._tag.isSVG();
    if (this.key() == "asset") {
      if (this.value() instanceof Str) {
        this._asset = STACK.root().registerAsset(this.value().raw(), this._tag._tagName || "asset");
        val = CALL(this.runtime().assetReference, [this._asset.ref]).c();
      } else {
        val = MP(val, "path.asset." + this._tag._tagName);
      }
      ;
    }
    ;
    if (isAttr) {
      if (STACK.tsc()) {
        return "" + this._tag.tvar() + ".setAttribute('" + this.key() + "',String(" + val + "))";
      }
      ;
      if (STACK.isNode() && !this._asset) {
        STACK.meta().universal = false;
        return "setAttribute('" + this.key() + "'," + val + ")";
      }
      ;
    }
    ;
    if (STACK.tsc()) {
      let path = this.nameIdentifier();
      let access = "" + this._tag.tvar() + "." + M2(path, this._name);
      return "" + M2(access, this._name) + op + (this._autovalue ? M2("true", this._value) : val);
    }
    ;
    let key = this.key();
    if (key == "value" && idx$(this._tag._tagName, ["input", "textarea", "select", "option", "button"]) >= 0 && !STACK.isNode()) {
      key = "richValue";
    }
    ;
    if (this.ns() == "css") {
      return "css$('" + key + "'," + val + ")";
    } else if (this.ns() == "bind") {
      let path = PATHIFY(this.value());
      if (path instanceof Variable) {
        let getter = "function(){ return " + val + " }";
        let setter = "function(v$){ " + val + " = v$ }";
        bval = "{get:" + getter + ",set:" + setter + "}";
      } else if (path instanceof Array) {
        bval = "[" + val[0].c(o) + "," + val[1].c(o) + "]";
      }
      ;
      return "bind$('" + key + "'," + bval + ")";
    } else if (key.indexOf("--") == 0) {
      let pars = ["'" + key + "'", val];
      let u = this.option("unit");
      let k = StyleTheme.propAbbr(this.option("propname"));
      if (u || k) {
        pars.push(u ? STR(u) : NULL);
        if (k) {
          pars.push(STR(k));
        }
        ;
      }
      ;
      STACK.use("styles");
      return "css$var(" + AST.cary(pars).join(",") + ")";
    } else if (key.indexOf("aria-") == 0 || this._tag && this._tag.isSVG() || key == "for") {
      if (this.ns()) {
        return "setns$('" + this.ns() + "','" + key + "'," + val + ")";
      } else {
        return "set$('" + key + "'," + val + ")";
      }
      ;
    } else if (key.indexOf("data-") == 0) {
      return "setAttribute('" + key + "'," + val + ")";
    } else {
      return "" + M2(helpers2.dashToCamelCase(key), this._name) + op + val;
    }
    ;
  };
  function TagAttrValue() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagAttrValue, TagPart);
  exports2.TagAttrValue = TagAttrValue;
  TagAttrValue.prototype.isPrimitive = function() {
    return this.value().isPrimitive();
  };
  TagAttrValue.prototype.value = function() {
    return this.name();
  };
  TagAttrValue.prototype.js = function() {
    return this.value().c();
  };
  TagAttrValue.prototype.toRaw = function() {
    if (this.value() instanceof Str) {
      return this.value().raw();
    }
    ;
    return null;
  };
  function TagHandlerSpecialArg() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(TagHandlerSpecialArg, ValueNode2);
  exports2.TagHandlerSpecialArg = TagHandlerSpecialArg;
  TagHandlerSpecialArg.prototype.isPrimitive = function() {
    return true;
  };
  TagHandlerSpecialArg.prototype.c = function() {
    return "'~$" + this.value() + "'";
  };
  function TagModifiers() {
    return ListNode.apply(this, arguments);
  }
  subclass$(TagModifiers, ListNode);
  exports2.TagModifiers = TagModifiers;
  TagModifiers.prototype.isStatic = function() {
    return this._nodes.every(function(item) {
      let val = item instanceof Parens ? item.value() : item;
      return val instanceof Func ? !val.nonlocals() : val.isPrimitive();
    });
  };
  TagModifiers.prototype.visit = function() {
    var keys = {FUNC: 0};
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, node; i < len; i++) {
      node = items[i];
      let key = String(node.name());
      if (keys[key]) {
        node.setName(key + "~" + keys[key]++);
      } else {
        keys[key] = 1;
      }
      ;
    }
    ;
    return this;
  };
  TagModifiers.prototype.extractDynamics = function() {
    if (this._dynamics) {
      return this._dynamics;
    }
    ;
    this._dynamics = [];
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, part; i < len; i++) {
      part = items[i];
      if (!(part instanceof TagModifier)) {
        continue;
      }
      ;
      for (let k = 0, ary = iter$7(part.params()), len2 = ary.length, param; k < len2; k++) {
        param = ary[k];
        if (!param.isPrimitive()) {
          let ref = new TagDynamicArg(param).set({
            key: KEY(part.name()),
            index: k
          });
          part.params().swap(param, LIT("null"));
          this._dynamics.push(ref);
        }
        ;
      }
      ;
    }
    ;
    return this._dynamics;
  };
  TagModifiers.prototype.c = function() {
    if (STACK.tsc()) {
      return "[" + this.nodes().map(function(_0) {
        return _0.c();
      }).join(",") + "]";
    }
    ;
    let obj = new Obj([]);
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, part; i < len; i++) {
      part = items[i];
      let val = part.params() ? new Arr(part.params()) : LIT("true");
      obj.add(KEY(part.name()), val);
    }
    ;
    return obj.c();
  };
  function TagModifier() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagModifier, TagPart);
  exports2.TagModifier = TagModifier;
  TagModifier.prototype.params = function(v) {
    return this._params;
  };
  TagModifier.prototype.setParams = function(v) {
    this._params = v;
    return this;
  };
  TagModifier.prototype.load = function(value) {
    if (value instanceof IdentifierExpression) {
      return value._single;
    }
    ;
    return value;
  };
  TagModifier.prototype.isPrimitive = function() {
    return !this.params() || this.params().every(function(param) {
      return param.isPrimitive();
    });
  };
  TagModifier.prototype.visit = function() {
    if (this._name instanceof TagHandlerCallback) {
      this._name.traverse();
      this._name = this._name.value();
    }
    ;
    if (this._name instanceof IsolatedFunc) {
      let evparam = this._name.params().at(0, true, "e");
      let stateparam = this._name.params().at(1, true, "$");
      this._name.traverse();
      this._value = this._name;
      this._name = STR("$_");
      this._params = new ListNode([this._value].concat(this._value.leaks() || []));
    }
    ;
    if (this._params) {
      this._params.traverse();
    }
    ;
    return this;
    for (let i = 0, items = iter$7(this._params), len = items.length, param; i < len; i++) {
      param = items[i];
      if (param instanceof VarOrAccess) {
        let sym = param._token.value();
        if (sym && sym[0] == "$") {
          let special = new TagHandlerSpecialArg(sym.slice(1));
          this._params.swap(param, special);
        }
        ;
      } else if (param instanceof PropertyAccess) {
        let out = helpers2.clearLocationMarkers(param.js());
        if (out[0] == "$") {
          this._params.swap(param, new TagHandlerSpecialArg(out.slice(1)));
        }
        ;
      }
      ;
    }
    ;
    return this;
  };
  TagModifier.prototype.js = function() {
    if (STACK.tsc()) {
      return this.params() ? this.params().c() : this.quoted();
    }
    ;
    if (this.params() && this.params().count() > 0) {
      return "[" + this.quoted() + "," + this.params().c() + "]";
    } else if (this.params()) {
      return "[" + this.quoted() + "]";
    } else {
      return this.quoted();
    }
    ;
  };
  function TagData() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagData, TagPart);
  exports2.TagData = TagData;
  TagData.prototype.value = function() {
    return this.name();
  };
  TagData.prototype.isStatic = function() {
    return !this.value() || this.value().isPrimitive();
  };
  TagData.prototype.isSpecial = function() {
    return true;
  };
  TagData.prototype.isProxy = function() {
    return this.proxyParts() instanceof Array;
  };
  TagData.prototype.proxyParts = function() {
    var val = this.value();
    if (val instanceof ArgList) {
      val = val.values()[0];
    }
    ;
    if (val instanceof Parens) {
      val = val.value();
    }
    ;
    if (val instanceof VarOrAccess) {
      val = val._variable || val.value();
    }
    ;
    if (val instanceof Access) {
      let left = val.left();
      let right = val.right() instanceof Index ? val.right().value() : val.right();
      if (val instanceof IvarAccess) {
        left || (left = val.scope__().context());
      }
      ;
      return [left, right];
    }
    ;
    return val;
  };
  TagData.prototype.js = function() {
    var val = this.value();
    if (val instanceof ArgList) {
      val = val.values()[0];
    }
    ;
    if (val instanceof Parens) {
      val = val.value();
    }
    ;
    if (val instanceof VarOrAccess) {
      val = val._variable || val.value();
    }
    ;
    if (val instanceof Access) {
      let left = val.left();
      let right = val.right() instanceof Index ? val.right().value() : val.right();
      if (val instanceof IvarAccess) {
        left || (left = val.scope__().context());
      }
      ;
      let pars = [left.c(), right.c()];
      if (right instanceof Identifier) {
        pars[1] = "'" + pars[1] + "'";
      }
      ;
      return "bind$('data',[" + pars.join(",") + "])";
    } else {
      return "data=(" + val.c() + ")";
    }
    ;
  };
  function TagDynamicArg() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(TagDynamicArg, ValueNode2);
  exports2.TagDynamicArg = TagDynamicArg;
  TagDynamicArg.prototype.c = function() {
    return this.value().c();
  };
  function TagHandler() {
    return TagPart.apply(this, arguments);
  }
  subclass$(TagHandler, TagPart);
  exports2.TagHandler = TagHandler;
  TagHandler.prototype.__params = {watch: "paramsDidSet", name: "params"};
  TagHandler.prototype.params = function(v) {
    return this._params;
  };
  TagHandler.prototype.setParams = function(v) {
    var a = this.params();
    if (v != a) {
      this._params = v;
    }
    if (v != a) {
      this.paramsDidSet && this.paramsDidSet(v, a, this.__params);
    }
    return this;
  };
  TagHandler.prototype.paramsDidSet = function(params) {
    this._chain.push(this._last = new TagModifier("options"));
    return this._last.setParams(params), params;
  };
  TagHandler.prototype.visit = function() {
    TagHandler.prototype.__super__.visit.apply(this, arguments);
    STACK.use("events");
    if (this._name && CUSTOM_EVENTS[String(this._name)]) {
      return STACK.use(CUSTOM_EVENTS[String(this._name)]);
    }
    ;
  };
  TagHandler.prototype.isStatic = function() {
    let valStatic = !this.value() || this.value().isPrimitive() || this.value() instanceof Func && !this.value().nonlocals();
    return valStatic && this._chain.every(function(item) {
      let val = item instanceof Parens ? item.value() : item;
      return val instanceof Func ? !val.nonlocals() : val.isPrimitive();
    });
  };
  TagHandler.prototype.modsIdentifier = function() {
    return null;
  };
  TagHandler.prototype.js = function(o) {
    if (STACK.tsc()) {
      return "[" + this.quoted() + "," + this.modifiers().c() + "]";
    }
    ;
    return "on$(" + this.quoted() + "," + this.modifiers().c() + "," + this.scope__().context().c() + ")";
  };
  function TagHandlerCallback() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(TagHandlerCallback, ValueNode2);
  TagHandlerCallback.prototype.visit = function() {
    let val = this.value();
    if (val instanceof Parens) {
      val = val.value();
    }
    ;
    if (val instanceof Func) {
      val = val.body();
    }
    ;
    if (val instanceof Access || val instanceof VarOrAccess) {
      val = CALL(val, [LIT("e")]);
    }
    ;
    this.setValue(new (STACK.tsc() ? Func : IsolatedFunc)([], [val], null, {}));
    if (this.value() instanceof IsolatedFunc) {
      let evparam = this.value().params().at(0, true, "e");
      let stateparam = this.value().params().at(1, true, "$");
    }
    ;
    this.value().traverse();
    return;
  };
  function TagBody() {
    return ListNode.apply(this, arguments);
  }
  subclass$(TagBody, ListNode);
  exports2.TagBody = TagBody;
  TagBody.prototype.add = function(item, o) {
    if (item instanceof InterpolatedString) {
      item = item.toArray();
      if (item.length == 1) {
        item = new TagTextContent(item[0]);
      }
      ;
    }
    ;
    return TagBody.prototype.__super__.add.call(this, item, o);
  };
  TagBody.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      this._nodes = this._nodes.map(function(child) {
        if (!(child instanceof Meta)) {
          return child.consume(node);
        } else {
          return child;
        }
        ;
      });
      return this;
    }
    ;
    return TagBody.prototype.__super__.consume.apply(this, arguments);
  };
  function TagLike(o) {
    if (o === void 0)
      o = {};
    this._options = o;
    this._flags = 0;
    this._tagvars = {};
    this.setup(o);
    this;
  }
  subclass$(TagLike, Node2);
  TagLike.prototype.sourceId = function() {
    return this._sourceId || (this._sourceId = STACK.sourceId() + "-" + this.oid());
  };
  TagLike.prototype.body = function() {
    return this._body || this._options.body;
  };
  TagLike.prototype.value = function() {
    return this._options.value;
  };
  TagLike.prototype.isReactive = function() {
    return true;
  };
  TagLike.prototype.isDetached = function() {
    return this.option("detached");
  };
  TagLike.prototype.isSVG = function() {
    return this._isSVG == null ? this._isSVG = this._parent ? this._parent.isSVG() : false : this._isSVG;
  };
  TagLike.prototype.parentTag = function() {
    let el = this._parent;
    while (el && !(el instanceof Tag)) {
      el = el._parent;
    }
    ;
    return el;
  };
  TagLike.prototype.setup = function() {
    this._traversed = false;
    this._consumed = [];
    return this;
  };
  TagLike.prototype.root = function() {
    return this._parent ? this._parent.root() : this;
  };
  TagLike.prototype.register = function(node) {
    if (node instanceof If || node instanceof Switch) {
      this.flag(F.TAG_HAS_BRANCHES);
      node = new TagSwitchFragment({body: node});
    } else if (node instanceof Loop) {
      this.flag(F.TAG_HAS_LOOPS);
      node = new TagLoopFragment({body: node.body(), value: node});
    } else if (node instanceof Tag) {
      if (node.isSlot()) {
        this.flag(F.TAG_HAS_DYNAMIC_CHILDREN);
      }
      ;
    } else {
      if (!(node instanceof Str)) {
        this.flag(F.TAG_HAS_DYNAMIC_CHILDREN);
      }
      ;
      node = new TagContent({value: node});
    }
    ;
    this._consumed.push(node);
    node._parent = this;
    return node;
  };
  TagLike.prototype.flag = function(key) {
    return this._flags |= key;
  };
  TagLike.prototype.type = function() {
    return "frag";
  };
  TagLike.prototype.unflag = function(key) {
    return this._flags = this._flags & ~key;
  };
  TagLike.prototype.hasFlag = function(key) {
    return this._flags & key;
  };
  TagLike.prototype.isAbstract = function() {
    return true;
  };
  TagLike.prototype.isOnlyChild = function() {
    return this.isFirstChild() && this.isLastChild();
  };
  TagLike.prototype.isFirstChild = function() {
    return this.hasFlag(F.TAG_FIRST_CHILD);
  };
  TagLike.prototype.isLastChild = function() {
    return this.hasFlag(F.TAG_LAST_CHILD);
  };
  TagLike.prototype.isIndexed = function() {
    return this.option("indexed");
  };
  TagLike.prototype.isComponent = function() {
    return this._kind == "component";
  };
  TagLike.prototype.isSelf = function() {
    return this.type() instanceof Self || this.type() instanceof This;
  };
  TagLike.prototype.isShadowRoot = function() {
    return this._tagName && this._tagName == "shadow-root";
  };
  TagLike.prototype.isSlot = function() {
    return this._kind == "slot";
  };
  TagLike.prototype.isFragment = function() {
    return this._kind == "fragment";
  };
  TagLike.prototype.hasLoops = function() {
    return this.hasFlag(F.TAG_HAS_LOOPS);
  };
  TagLike.prototype.hasBranches = function() {
    return this.hasFlag(F.TAG_HAS_BRANCHES);
  };
  TagLike.prototype.hasDynamicChildren = function() {
    return this.hasFlag(F.TAG_HAS_DYNAMIC_CHILDREN);
  };
  TagLike.prototype.hasDynamicFlags = function() {
    return this.hasFlag(F.TAG_HAS_DYNAMIC_FLAGS);
  };
  TagLike.prototype.hasNonTagChildren = function() {
    return this.hasLoops() || this.hasBranches() || this.hasDynamicChildren();
  };
  TagLike.prototype.hasChildren = function() {
    return this._consumed.length > 0;
  };
  TagLike.prototype.tagvar = function(name) {
    return this._tagvars[name] || (this._tagvars[name] = this.scope__().closure().temporary(null, {reuse: false, alias: "" + this.tagvarprefix() + name}, "" + this.tagvarprefix() + name));
  };
  TagLike.prototype.tagvarprefix = function() {
    return "" + (this.level() + 1);
  };
  TagLike.prototype.level = function() {
    return this._level;
  };
  TagLike.prototype.parent = function() {
    return this._parent || (this._parent = this.option("parent"));
  };
  TagLike.prototype.fragment = function() {
    return this._fragment || this.parent();
  };
  TagLike.prototype.tvar = function() {
    return this._tvar || this.tagvar("T");
  };
  TagLike.prototype.bvar = function() {
    return this._bvar || (this._parent ? this._parent.bvar() : this.tagvar("B"));
  };
  TagLike.prototype.cvar = function() {
    return this._cvar || (this._parent ? this._parent.cvar() : this.tagvar("C"));
  };
  TagLike.prototype.vvar = function() {
    return this.tagvar("V");
  };
  TagLike.prototype.kvar = function() {
    return this.tagvar("K");
  };
  TagLike.prototype.dvar = function() {
    return this.tagvar("D");
  };
  TagLike.prototype.ref = function() {
    return this._ref || (this._cachedRef = "" + (this.parent() ? this.parent().cvar() : "") + "[" + this.osym() + "]");
  };
  TagLike.prototype.visit = function(stack) {
    var o = this._options;
    var scope2 = this._tagScope = this.scope__();
    let prevTag = this._parent = stack._tag;
    this._level = (this._parent && this._parent._level || 0) + 1;
    stack._tag = null;
    for (let i = 0, items = iter$7(this._attributes), len = items.length; i < len; i++) {
      items[i].traverse();
    }
    ;
    stack._tag = this;
    if (o.key) {
      o.key.traverse();
    }
    ;
    this.visitBeforeBody(stack);
    if (this.body()) {
      this.body().traverse();
    }
    ;
    this.visitAfterBody(stack);
    stack._tag = this._parent;
    if (!this._parent) {
      this._level = 0;
      this.consumeChildren();
      this.visitAfterConsumed();
    }
    ;
    return this;
  };
  TagLike.prototype.visitBeforeBody = function() {
    return this;
  };
  TagLike.prototype.visitAfterBody = function() {
    return this;
  };
  TagLike.prototype.consumeChildren = function() {
    if (this._consumed.length) {
      return;
    }
    ;
    this.body() && this.body().consume(this);
    let first = this._consumed[0];
    let last = this._consumed[this._consumed.length - 1];
    if (!this.isAbstract()) {
      if (first instanceof TagLike) {
        first.flag(F.TAG_FIRST_CHILD);
      }
      ;
      if (last instanceof TagLike) {
        last.flag(F.TAG_LAST_CHILD);
      }
      ;
    }
    ;
    for (let i = 0, items = iter$7(this._consumed), len = items.length, item; i < len; i++) {
      item = items[i];
      if (!(item instanceof TagLike)) {
        continue;
      }
      ;
      item._parent = this;
      item._level = this._level + 1;
      item.visitAfterConsumed();
      item.consumeChildren();
    }
    ;
    this.visitAfterConsumedChildren();
    return this;
  };
  TagLike.prototype.visitAfterConsumedChildren = function() {
    return this;
  };
  TagLike.prototype.visitAfterConsumed = function() {
    return this;
  };
  TagLike.prototype.consume = function(node) {
    if (node instanceof TagLike) {
      return node.register(this);
    }
    ;
    if (node instanceof Variable) {
      this.option("assignToVar", node);
      return this;
    }
    ;
    if (node instanceof Assign) {
      return OP(node.op(), node.left(), this);
    } else if (node instanceof VarDeclaration) {
      return OP("=", node.left(), this);
    } else if (node instanceof Op) {
      return OP(node.op(), node.left(), this);
    } else if (node instanceof Return) {
      this.option("return", true);
      return this;
    }
    ;
    return this;
  };
  function TagTextContent() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(TagTextContent, ValueNode2);
  exports2.TagTextContent = TagTextContent;
  function TagContent() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagContent, TagLike);
  exports2.TagContent = TagContent;
  TagContent.prototype.vvar = function() {
    return this.parent().vvar();
  };
  TagContent.prototype.bvar = function() {
    return this.parent().bvar();
  };
  TagContent.prototype.ref = function() {
    return this.fragment().tvar();
  };
  TagContent.prototype.key = function() {
    return this._key || (this._key = "" + this.parent().cvar() + "[" + this.osym() + "]");
  };
  TagContent.prototype.isStatic = function() {
    return this.value() instanceof Str || this.value() instanceof Num;
  };
  TagContent.prototype.js = function() {
    let value = this.value();
    let parts = [];
    let isText = value instanceof Str || value instanceof Num || value instanceof TagTextContent;
    let isStatic = this.isStatic();
    if (STACK.tsc()) {
      return value.c(this.o());
    }
    ;
    if (this.parent() instanceof TagSwitchFragment || this._tvar && this.parent() instanceof Tag && (this.parent().isSlot() || this.isDetached())) {
      parts.push("" + this._tvar + "=" + value.c(this.o()));
      if (value instanceof Call || value instanceof BangCall) {
        let k = "" + this.parent().cvar() + "[" + this.osym("$") + "]";
        parts.unshift("" + this.runtime().renderContext + ".context=(" + k + " || (" + k + "={_:" + this.fragment().tvar() + "}))");
        parts.push("" + this.runtime().renderContext + ".context=null");
      }
      ;
    } else if (this.isOnlyChild() && (value instanceof Str || value instanceof Num)) {
      return "" + this.bvar() + " || " + this.ref() + ".text$(" + value.c(this.o()) + ")";
    } else if (isStatic) {
      return "" + this.bvar() + " || " + this.ref() + ".insert$(" + value.c(this.o()) + ")";
    } else if (value instanceof TagTextContent && this.isOnlyChild() && !(this.parent() instanceof TagSwitchFragment)) {
      return "(" + this.vvar() + "=" + value.c(this.o()) + "," + this.vvar() + "===" + this.key() + " || " + this.ref() + ".text$(String(" + this.key() + "=" + this.vvar() + ")))";
    } else {
      parts.push("" + this.vvar() + "=" + value.c(this.o()));
      let inskey = "" + this.parent().cvar() + "[" + this.osym("i") + "]";
      if (value instanceof Call || value instanceof BangCall) {
        let k = "" + this.parent().cvar() + "[" + this.osym("$") + "]";
        parts.unshift("" + this.runtime().renderContext + ".context=(" + k + " || (" + k + "={_:" + this.fragment().tvar() + "}))");
        parts.push("" + this.runtime().renderContext + ".context=null");
      }
      ;
      if (value instanceof TagTextContent) {
        parts.push("(" + this.vvar() + "===" + this.key() + "&&" + this.bvar() + ") || (" + inskey + " = " + this.ref() + ".insert$(String(" + this.key() + "=" + this.vvar() + ")," + this._flags + "," + inskey + "))");
      } else {
        parts.push("(" + this.vvar() + "===" + this.key() + "&&" + this.bvar() + ") || (" + inskey + " = " + this.ref() + ".insert$(" + this.key() + "=" + this.vvar() + "," + this._flags + "," + inskey + "))");
      }
      ;
    }
    ;
    return "(" + parts.join(",") + ")";
  };
  function TagFragment() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagFragment, TagLike);
  exports2.TagFragment = TagFragment;
  function TagSwitchFragment() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagSwitchFragment, TagLike);
  exports2.TagSwitchFragment = TagSwitchFragment;
  TagSwitchFragment.prototype.setup = function() {
    TagSwitchFragment.prototype.__super__.setup.apply(this, arguments);
    this._branches = [];
    return this._inserts = [];
  };
  TagSwitchFragment.prototype.getInsertVar = function(index) {
    return this._inserts[index] || (this._inserts[index] = this.tagvar(this.oid() + "$" + index));
  };
  TagSwitchFragment.prototype.tvar = function() {
    return this.fragment().tvar();
  };
  TagSwitchFragment.prototype.register = function(node) {
    let res = TagSwitchFragment.prototype.__super__.register.apply(this, arguments);
    if (this._branches) {
      let curr = this._branches[this._branches.length - 1];
      curr && curr.push(res);
    }
    ;
    return res;
  };
  TagSwitchFragment.prototype.visitAfterConsumedChildren = function() {
    if (!(this._parent instanceof TagSwitchFragment)) {
      let max = this.assignChildIndices(0, this);
    }
    ;
    return this;
  };
  TagSwitchFragment.prototype.assignChildIndices = function(start, root) {
    let nr = start;
    let max = start;
    for (let i = 0, items = iter$7(this._branches), len = items.length, branch; i < len; i++) {
      branch = items[i];
      nr = start;
      for (let j = 0, ary = iter$7(branch), len2 = ary.length, item; j < len2; j++) {
        item = ary[j];
        if (item instanceof TagSwitchFragment) {
          nr = item.assignChildIndices(nr, root);
        } else {
          item._tvar = root.getInsertVar(nr);
          item.set({detached: true});
          nr++;
        }
        ;
      }
      ;
      if (nr > max) {
        max = nr;
      }
      ;
    }
    ;
    return max;
  };
  TagSwitchFragment.prototype.js = function(o) {
    var parts = [];
    var top = "";
    if (len$(this._inserts)) {
      top = this._inserts.join(" = ") + " = null";
    }
    ;
    var out = this.body().c(o);
    if (STACK.tsc()) {
      return out;
    }
    ;
    parts.push(top);
    parts.push(out);
    for (let i = 0, items = iter$7(this._inserts), len = items.length; i < len; i++) {
      let key = "" + this.cvar() + "[" + this.osym(i) + "]";
      parts.push("(" + key + " = " + this.tvar() + ".insert$(" + items[i] + ",0," + key + "))");
    }
    ;
    if (o.inline) {
      return parts.join(",");
    } else {
      return parts.join(";\n");
    }
    ;
  };
  function TagLoopFragment() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagLoopFragment, TagLike);
  exports2.TagLoopFragment = TagLoopFragment;
  TagLoopFragment.prototype.isKeyed = function() {
    return this.option("keyed") || this.hasFlag(F.TAG_HAS_BRANCHES);
  };
  TagLoopFragment.prototype.consumeChildren = function() {
    TagLoopFragment.prototype.__super__.consumeChildren.apply(this, arguments);
    if (this._consumed.every(function(_0) {
      return _0 instanceof Tag && !_0.option("key") && !_0.isDynamicType();
    }) && !this.hasFlag(F.TAG_HAS_BRANCHES)) {
      return this.set({indexed: true});
    } else {
      return this.set({keyed: true});
    }
    ;
  };
  TagLoopFragment.prototype.cvar = function() {
    return this._cvar || this.tagvar("C");
  };
  TagLoopFragment.prototype.js = function(o) {
    if (this.stack().isExpression()) {
      let fn = CALL(FN([], [this], this.stack().scope()), []);
      return fn.c();
    }
    ;
    if (STACK.tsc()) {
      return "" + this.tvar() + " = new DocumentFragment;\n" + this.value().c(o);
    }
    ;
    let iref = this.option("indexed") ? this.runtime().createIndexedFragment : this.runtime().createKeyedFragment;
    let cache = this.parent().cvar();
    let parentRef = this.parent() instanceof TagSwitchFragment ? LIT("null") : this.fragment().tvar();
    let out = "";
    out += "(" + this.tvar() + " = " + cache + "[" + this.osym() + "]) || (" + cache + "[" + this.osym() + "]=" + this.tvar() + "=" + iref + "(" + this._flags + "," + parentRef + "));\n";
    this._ref = "" + this.tvar();
    out += "" + this.kvar() + " = 0;\n";
    out += "" + this.cvar() + "=" + this.tvar() + ".$;\n";
    out += this.value().c(o);
    out += ";" + this.tvar() + ".end$(" + this.kvar() + ")";
    return out;
  };
  function TagIndexedFragment() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagIndexedFragment, TagLike);
  exports2.TagIndexedFragment = TagIndexedFragment;
  function TagKeyedFragment() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagKeyedFragment, TagLike);
  exports2.TagKeyedFragment = TagKeyedFragment;
  function TagSlotProxy() {
    return TagLike.apply(this, arguments);
  }
  subclass$(TagSlotProxy, TagLike);
  exports2.TagSlotProxy = TagSlotProxy;
  TagSlotProxy.prototype.ref = function() {
    return this.tvar();
  };
  TagSlotProxy.prototype.tagvarprefix = function() {
    return this.oid() + "S";
  };
  function Tag() {
    return TagLike.apply(this, arguments);
  }
  subclass$(Tag, TagLike);
  exports2.Tag = Tag;
  Tag.prototype.attrmap = function(v) {
    return this._attrmap;
  };
  Tag.prototype.setAttrmap = function(v) {
    this._attrmap = v;
    return this;
  };
  Tag.prototype.setup = function() {
    Tag.prototype.__super__.setup.apply(this, arguments);
    this._attributes = this._options.attributes || [];
    this._attrmap = {};
    this._classNames = [];
    return this._className = null;
  };
  Tag.prototype.isAbstract = function() {
    return this.isSlot() || this.isFragment();
  };
  Tag.prototype.attrs = function() {
    return this._attributes;
  };
  Tag.prototype.cssflag = function() {
    return this._cssflag || (this._cssflag = "" + this.sourceId());
  };
  Tag.prototype.tagvarprefix = function() {
    return this._tagvarprefix || (this._tagvarprefix = this.type() && this.type().toVarPrefix ? this.type().toVarPrefix() : this.isSelf() ? "cmp" : "tag");
  };
  Tag.prototype.traverse = function() {
    if (this._traversed) {
      return this;
    }
    ;
    this._tid = STACK.generateId("tag");
    this.scope__().imbaDependency("core");
    this._tagDeclaration = STACK.up(TagDeclaration);
    let close = this._options.close;
    let body = this._options.body || [];
    let returns = this;
    if (close && close._value == "/>" && len$(body)) {
      returns = [this].concat(body._nodes);
      this._options.body = new ArgList([]);
    }
    ;
    Tag.prototype.__super__.traverse.apply(this, arguments);
    return returns;
  };
  Tag.prototype.visitBeforeBody = function(stack) {
    var self3 = this;
    self3.oid();
    let type = self3._options.type;
    type && type.traverse();
    if (self3.isSelf() || self3.tagName().indexOf("-") >= 0 || self3.isDynamicType() || type && type.isComponent()) {
      self3._options.custom = true;
      self3._kind = "component";
    } else {
      self3._kind = "element";
    }
    ;
    if (type instanceof TagTypeIdentifier) {
      if (type.isAsset()) {
        self3._assetName = type.toAssetName();
        self3._asset = self3.scope__().root().lookupAsset(self3._assetName, "svg");
        self3._assetRef = type.toAssetReference();
        self3._isAsset = true;
        self3._isSVG = true;
      }
      ;
    }
    ;
    if (self3.attrs().length == 0 && !self3._options.type) {
      self3._options.type = "fragment";
    }
    ;
    let tagName = self3.tagName();
    if (tagName == "slot") {
      self3._kind = "slot";
    } else if (tagName == "fragment") {
      self3._kind = "fragment";
    }
    ;
    if (tagName == "shadow-root") {
      self3._kind = "shadow-root";
    }
    ;
    if (self3.isSelf()) {
      let decl = stack.up(TagDeclaration);
      if (decl) {
        decl.set({self: self3, sourceId: self3.sourceId()});
      }
      ;
    }
    ;
    self3._tagName = tagName;
    self3._dynamics = [];
    let i = 0;
    while (i < self3._attributes.length) {
      let item = self3._attributes[i++];
      if (item instanceof TagFlag && item.name() instanceof StyleRuleSet) {
        if (item.name().placeholders().length) {
          for (let j = 0, items = iter$7(item.name().placeholders()), len = items.length, ph; j < len; j++) {
            ph = items[j];
            let setter = new TagAttr(ph.name());
            setter._tag = self3;
            setter.setValue(ph.value());
            setter.set({
              propname: ph._propname,
              unit: ph.option("unit")
            });
            self3._attributes.splice(i++, 0, setter);
            setter.traverse();
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    self3._attributes = self3._attributes.filter(function(item) {
      if (item instanceof TagFlag && item.isStatic()) {
        self3._classNames.push(item);
        return false;
      }
      ;
      if (item == self3._attrmap.$key) {
        self3.set({key: item.value()});
        return false;
      }
      ;
      if (!item.isStatic()) {
        self3._dynamics.push(item);
      }
      ;
      return true;
    });
    if (self3.isSlot()) {
      let name = self3._attrmap.name ? self3._attrmap.name.value() : "__";
      if (name instanceof Str) {
        name = name.raw();
      }
      ;
      self3.set({name});
      self3._attributes = [];
    }
    ;
    if (self3._options.reference) {
      let tagdef = stack.up(TagDeclaration);
      if (tagdef) {
        tagdef.addElementReference(self3._options.reference, self3);
      }
      ;
    }
    ;
    return Tag.prototype.__super__.visitBeforeBody.apply(self3, arguments);
  };
  Tag.prototype.register = function(node) {
    node = Tag.prototype.__super__.register.call(this, node);
    if (node instanceof TagLike && (this.isComponent() && !this.isSelf())) {
      let slotKey = node instanceof Tag ? node._attrmap.slot : null;
      let name = "__";
      if (slotKey) {
        if (slotKey.value() instanceof Str) {
          name = slotKey.value().raw();
        }
        ;
      }
      ;
      let slot = this.getSlot(name);
      node._fragment = slot;
    }
    ;
    return node;
  };
  Tag.prototype.visitAfterBody = function(stack) {
    return this;
  };
  Tag.prototype.visitAfterConsumed = function() {
    if (this.isSVG()) {
      this._kind = "svg";
    }
    ;
    if (this._parent instanceof TagLoopFragment && this.isDynamicType()) {
      if (this.option("key")) {
        this.set({key: OP("+", this.option("key"), OP("+", STR(" "), this.vvar()))});
      }
      ;
    }
    ;
    return this;
  };
  Tag.prototype.visitAfterConsumedChildren = function() {
    if (this.isSlot() && this._consumed.length > 1) {
      this.set({markWhenBuilt: true, reactive: true});
    }
    ;
    return;
  };
  Tag.prototype.getSlot = function(name) {
    this._slots || (this._slots = {});
    return this._slots[name] || (this._slots[name] = new TagSlotProxy({parent: this, name}));
  };
  Tag.prototype.addPart = function(part, type, tok) {
    let attrs = this._attributes;
    let curr = attrs.CURRENT;
    let next = curr;
    if (type == TagId) {
      this.set({id: part});
    }
    ;
    if (type == TagArgList) {
      if (attrs.length == 0) {
        this.set({args: part});
        return this;
      }
      ;
    }
    ;
    if (type == TagSep) {
      next = null;
    } else if (type == TagAttrValue) {
      if (part instanceof Parens) {
        part = part.value();
      }
      ;
      if (curr instanceof TagFlag) {
        curr.setCondition(part);
        this.flag(F.TAG_HAS_DYNAMIC_FLAGS);
        curr.set({op: tok});
      } else if (curr instanceof TagHandler) {
        if (part) {
          curr.add(new TagHandlerCallback(part), type);
        }
        ;
      } else if (curr) {
        curr.setValue(part);
        curr.set({op: tok});
      }
      ;
    } else if (curr instanceof TagHandler) {
      if (part instanceof IdentifierExpression && part.single() && !part.isPrimitive()) {
        part = new (STACK.tsc() ? Func : IsolatedFunc)([], [part.single()], null, {});
      }
      ;
      curr.add(part, type);
    } else if (curr instanceof TagAttr) {
      curr.add(part, type);
    } else if (type == TagData) {
      let bind = idx$(String(this.type()), ["input", "textarea", "select", "button", "option"]) >= 0;
      bind = true;
      curr = new TagAttr(bind ? "bind:data" : "data", this);
      curr.setValue(part.first());
      attrs.push(curr);
      next = null;
    } else {
      if (type == TagFlag && part instanceof IdentifierExpression && !part.isPrimitive()) {
        this.flag(F.TAG_HAS_DYNAMIC_FLAGS);
      }
      ;
      if (part instanceof type) {
        part._tag = this;
      } else {
        part = new type(part, this);
      }
      ;
      attrs.push(next = part);
      if (next instanceof TagAttr && next.name().isPrimitive()) {
        let name = String(next.name().toRaw());
        if (name == "bind") {
          (next._name._single || next._name)._value = "bind:data";
          name = "bind:data";
        }
        ;
        this._attrmap[name] = next;
      }
      ;
    }
    ;
    if (next != curr) {
      attrs.CURRENT = next;
    }
    ;
    return this;
  };
  Tag.prototype.type = function() {
    return this._options.type || (this._attributes.length == 0 ? "fragment" : "div");
  };
  Tag.prototype.tagName = function() {
    return this._tagName || String(this._options.type);
  };
  Tag.prototype.isDynamicType = function() {
    return this.type() instanceof ExpressionNode;
  };
  Tag.prototype.isSVG = function() {
    return this._isSVG == null ? this._isSVG = this.type() instanceof TagTypeIdentifier && this.type().isSVG() || this._parent && this._parent.isSVG() : this._isSVG;
  };
  Tag.prototype.isAsset = function() {
    return this._isAsset || false;
  };
  Tag.prototype.create_ = function() {
    if (this.isFragment() || this.isSlot()) {
      return this.runtime().createLiveFragment;
    } else if (this.isAsset()) {
      return this.runtime().createAssetElement;
    } else if (this.isSVG()) {
      return this.runtime().createSVGElement;
    } else if (this.isComponent()) {
      return this.runtime().createComponent;
    } else {
      return this.runtime().createElement;
    }
    ;
  };
  Tag.prototype.isReactive = function() {
    return this.option("reactive") || (this._parent ? this._parent.isReactive() : !(this.scope__() instanceof RootScope));
  };
  Tag.prototype.isDetached = function() {
    return this.option("detached");
  };
  Tag.prototype.js = function(o) {
    var cname;
    var stack = STACK;
    var isExpression = stack.isExpression();
    var head = [];
    var out = [];
    var foot = [];
    var add = function(val) {
      if (val instanceof Variable) {
        val = val.toString();
      }
      ;
      return out.push(val);
    };
    var parent = this.parent();
    var fragment = this.fragment();
    var component = this._tagDeclaration;
    let oscope = this._tagDeclaration ? this._tagDeclaration.scope() : null;
    let typ = this.isSelf() ? "self" : this.isFragment() ? "'fragment'" : this.type().isClass && this.type().isClass() ? this.type().toTypeArgument() : "'" + this.type()._value + "'";
    var wasInline = o.inline;
    var isSVG = this.isSVG();
    var isReactive = this.isReactive();
    var canInline = false;
    var useRoutes = this._attrmap.route || this._attrmap.routeTo || this._attrmap["route-to"];
    var shouldEnd = this.isComponent() || useRoutes;
    if (useRoutes) {
      stack.use("use_router");
    }
    ;
    var dynamicKey = null;
    var ownCache = false;
    if (this._asset) {
      typ = this._assetRef.c();
    }
    ;
    var slotPath = this.isSlot() ? OP(".", LIT("" + fragment.root().tvar() + ".__slots"), STR(this.option("name"))).c() : "";
    if (stack.tsc()) {
      if (this.type() instanceof TagTypeIdentifier && !this.isSelf()) {
        if (this.type().isAsset()) {
          add("" + this.tvar() + " = new " + M2("SVGSVGElement", this.type()));
        } else {
          add("" + this.tvar() + " = new " + M2(this.type().toClassName(), this.type()));
        }
        ;
      } else if (this.isSelf()) {
        add("" + this.tvar() + " = " + this.type().c());
      } else {
        add("" + this.tvar() + " = new " + M2("HTMLElement", this.type()));
        add("" + this.type().c());
      }
      ;
      for (let i = 0, items = iter$7(this._attributes), len = items.length, item; i < len; i++) {
        item = items[i];
        if (item instanceof TagAttr || item instanceof TagHandler) {
          add(item.c(o));
        }
        ;
        this;
      }
      ;
      let nodes2 = this.body() ? this.body().values() : [];
      for (let i = 0, items = iter$7(nodes2), len = items.length; i < len; i++) {
        add(items[i].c());
      }
      ;
      if (o.inline || isExpression) {
        let js = "(" + out.join(",\n") + ")";
        return js;
      } else {
        let js = out.join(";\n");
        return js;
      }
      ;
    }
    ;
    var markWhenBuilt = shouldEnd || this.hasDynamicFlags() || this.attrs().length || this.option("markWhenBuilt") || this.isDetached();
    var inCondition = parent && parent.option("condition");
    if (this.type() instanceof ExpressionNode) {
      add("" + this.vvar() + "=" + this.type().c());
      if (!(this.option("key") || parent instanceof TagLoopFragment)) {
        add("" + this.kvar() + "='" + this.oid() + "_'+" + this.vvar());
      }
      ;
      typ = this.vvar();
      dynamicKey = this.kvar();
    }
    ;
    if (this._cssflag || STACK.hmr()) {
      this._classNames.unshift(this.cssflag());
    }
    ;
    if (stack.option("hasScopedStyles")) {
      this._classNames.unshift(stack.sourceId());
    }
    ;
    if (component && !this.isSelf()) {
      if (cname = component.cssref(this.scope__())) {
        this._classNames.push(cname);
      }
      ;
    }
    ;
    if (this.option("reference")) {
      if (oscope) {
        let name = String(this.option("reference")).slice(1);
        this._classNames.push(name);
        if (component) {
          this._classNames.push("ref--" + name);
        }
        ;
      }
      ;
    }
    ;
    if (this.option("key")) {
      this.set({detached: true});
    }
    ;
    if (this._classNames.length) {
      let names = [];
      let dynamic = false;
      for (let i = 0, items = iter$7(this._classNames), len = items.length, cls; i < len; i++) {
        cls = items[i];
        if (cls instanceof TagFlag) {
          if (cls.name() instanceof MixinIdentifier) {
            names.push(cls.name().c({as: "substr"}));
            dynamic = true;
          } else {
            names.push(cls.rawClassName());
          }
          ;
        } else if (cls instanceof Node2) {
          dynamic = true;
          names.push("${" + cls.c() + "}");
        } else {
          names.push(cls);
        }
        ;
      }
      ;
      names = names.filter(function(item, i) {
        return names.indexOf(item) == i;
      });
      let q = dynamic ? "`" : "'";
      this._className = q + names.join(" ") + q;
    }
    ;
    var params = [
      typ,
      fragment && !this.option("detached") ? fragment.tvar() : "null",
      this._className || "null",
      "null"
    ];
    var nodes = this.body() ? this.body().values() : [];
    if (nodes.length == 1 && nodes[0] instanceof TagContent && nodes[0].isStatic() && !this.isSelf() && !this.isSlot()) {
      params[3] = nodes[0].value().c();
      nodes = [];
    }
    ;
    if (this._dynamics.length == 0 && !this.hasDynamicFlags() && !dynamicKey) {
      if (nodes.every(function(v) {
        return v instanceof Str || v instanceof Tag && !v.isDynamicType();
      })) {
        if (!shouldEnd && !this.hasNonTagChildren() && parent instanceof Tag && !this.isSlot() && !this.option("dynamic")) {
          canInline = true;
        }
        ;
      }
      ;
    }
    ;
    if (this.isFragment() || this.isSlot()) {
      params = [this._flags].concat(params.slice(1, 2));
    }
    ;
    if (this.isSlot()) {
      params[1] = "null";
    }
    ;
    var ctor = M2("" + this.create_() + "(" + params.join(",") + ")", this.type());
    if (this.option("reference")) {
      ctor = OP("=", OP(".", this.scope__().context(), this.option("reference")), LIT(ctor)).c();
    }
    ;
    ctor = "" + this.tvar() + "=" + ctor;
    if (this.option("assign")) {
      ctor = OP("=", this.option("assign"), LIT(ctor)).c();
    }
    ;
    if (!parent) {
      this._ref = "" + this.tvar();
      this._cvar = this.tvar();
      if (this.isSelf()) {
        add("" + this.tvar() + "=this");
        add("" + this.tvar() + ".open$()");
        add("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "[" + this.osym() + "] === 1) || (" + this.bvar() + "=" + this.dvar() + "=0," + this.tvar() + "[" + this.osym() + "]=1)");
      } else if (isReactive) {
        let scop = this.scope__().closure();
        let k = "" + scop.tagCache() + "[" + this.osym() + "]";
        add("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + k + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + k + "=" + ctor + ")");
        add("" + this.bvar() + " || (" + this.tvar() + "[" + this.gsym("##up") + "]=" + scop.tagCache() + "._)");
        this._ref = this.tvar();
        if (isExpression) {
          o.inline = true;
        }
        ;
      } else {
        add("(" + ctor + ")");
        this.option("inline", canInline = true);
        o.inline = true;
      }
      ;
    } else {
      if (this.isShadowRoot()) {
        let key = "" + this.cvar() + "[" + this.osym() + "]";
        add("" + this.tvar() + "=" + key + " || (" + key + "=" + fragment.tvar() + ".attachShadow({mode:'open'}))");
      } else if (this.isSlot() && !this.hasChildren()) {
        let key = "" + this.cvar() + "[" + this.osym() + "]";
        add("" + this.tvar() + "=" + slotPath);
        add("(" + key + " = " + fragment.tvar() + ".insert$(" + this.tvar() + "," + this._flags + "," + key + "))");
      } else if (this.isSlot() && this._consumed.length == 1) {
        this._consumed[0].set({dynamic: true, detached: true});
        this._consumed[0]._tvar = this.tvar();
        this._consumed[0]._parent = parent;
      } else if (this.option("args")) {
        let key = "" + this.cvar() + "[" + this.osym() + "]";
        let ckey = "" + this.cvar() + "[" + this.osym("$") + "]";
        let inskey = "" + this.cvar() + "[" + this.osym("ins") + "]";
        add("" + this.runtime().renderContext + ".context=(" + ckey + " || (" + ckey + "={}))");
        let call = CALL(this.option("type").toFunctionalType(), this.option("args"));
        add("" + this.tvar() + "=" + call.c(o));
        add("" + this.runtime().renderContext + ".context=null");
        add("" + this.tvar() + "===" + this.ref() + " || (" + inskey + " = " + fragment.tvar() + ".insert$(" + this.ref() + "=" + this.tvar() + "," + this._flags + "," + inskey + "))");
      } else if (parent instanceof TagLoopFragment) {
        if (parent.isKeyed() && !this.option("key")) {
          this.option("key", OP("+", LIT("'" + this.oid() + "$'"), parent.kvar()));
          if (this.isDynamicType()) {
            this.set({key: OP("+", this.option("key"), this.vvar())});
          }
          ;
        }
        ;
        if (this.option("key")) {
          add("" + this.kvar() + "=" + this.option("key").c());
          this._ref = "" + parent.cvar() + "[" + this.kvar() + "]";
        } else if (parent.isIndexed()) {
          this._ref = "" + parent.cvar() + "[" + parent.kvar() + "]";
        }
        ;
        this._bvar = this.tagvar("B");
        add("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + this.ref() + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + this.ref() + "=" + ctor + ")");
        this._ref = "" + this.tvar();
        if (this.isDetached() || true) {
          add("" + this.bvar() + "||(" + this.tvar() + "[" + this.gsym("##up") + "]=" + fragment.tvar() + ")");
        }
        ;
        if (this._dynamics.length || this._consumed.length && nodes.length) {
          ownCache = true;
        }
        ;
      } else if (!isReactive) {
        add("(" + ctor + ")");
      } else if (canInline) {
        this._ref = this.tvar();
        this._bvar = parent.bvar();
        add("" + parent.bvar() + " || (" + ctor + ")");
      } else {
        let cref = this._cref = "" + this.cvar() + "[" + this.osym() + "]";
        let ref = dynamicKey ? "" + this.cvar() + "[" + dynamicKey + "]" : cref;
        if (this.option("key")) {
          let dref = this._dref = "" + this.cvar() + ".$" + this.oid();
          add("" + dref + " || (" + dref + "={})");
          dynamicKey = this.option("key").c();
          ref = "" + dref + "[" + dynamicKey + "]";
        }
        ;
        if (markWhenBuilt) {
          this._bvar = this.tagvar("B");
          add("(" + this.bvar() + "=" + this.dvar() + "=1," + this.tvar() + "=" + ref + ") || (" + this.bvar() + "=" + this.dvar() + "=0," + ref + "=" + ctor + ")");
        } else {
          add("(" + this.tvar() + " = " + ref + ") || (" + ref + "=" + ctor + ")");
        }
        ;
        if (this.isDetached()) {
          add("" + this.bvar() + "||(" + this.tvar() + "[" + this.gsym("##up") + "]=" + fragment.tvar() + ")");
        }
        ;
        this._ref = this.tvar();
        if (dynamicKey) {
          ownCache = true;
        }
        ;
        if (parent instanceof TagSwitchFragment) {
          ownCache = true;
        }
        ;
      }
      ;
      if (ownCache) {
        this._cvar = this.tvar();
      }
      ;
    }
    ;
    if (this._slots) {
      for (let o1 = this._slots, slot, i = 0, keys = Object.keys(o1), l = keys.length, name; i < l; i++) {
        name = keys[i];
        slot = o1[name];
        add("" + slot.tvar() + " = " + this.tvar() + ".slot$('" + name + "'," + this.cvar() + ")");
      }
      ;
    }
    ;
    let flagsToConcat = [];
    for (let i = 0, items = iter$7(this._attributes), len = items.length, item; i < len; i++) {
      item = items[i];
      if (item._chain && item._chain.length && !(item instanceof TagHandler)) {
        let mods = item.modifiers();
        let dyn = !mods.isStatic();
        let specials = mods.extractDynamics();
        let modid = item.modsIdentifier();
        let modpath = modid ? OP(".", this.tvar(), modid).c() : "" + this.cvar() + "[" + mods.osym() + "]";
        if (dyn) {
          add("" + this.vvar() + " = " + modpath + " || (" + mods.c(o) + ")");
          for (let j = 0, ary = iter$7(specials), len2 = ary.length, special; j < len2; j++) {
            special = ary[j];
            let k = special.option("key");
            let i2 = special.option("index");
            add("" + OP(".", this.vvar(), k).c() + "[" + i2 + "]=" + special.c(o));
          }
          ;
          add("" + this.bvar() + " || (" + modpath + "=" + this.vvar() + ")");
        } else {
          add("" + this.bvar() + " || (" + modpath + "=" + mods.c(o) + ")");
        }
        ;
      }
      ;
      if (!isReactive) {
        add("" + this.tvar() + "." + item.c(o));
      } else if (item.isStatic()) {
        add("" + this.bvar() + " || (" + this.tvar() + "." + item.c(o) + ")");
      } else {
        let iref = "" + this.cvar() + "[" + item.osym() + "]";
        if (item instanceof TagFlag) {
          let cond = item.condition();
          let val = item.name();
          let cref;
          let vref;
          if (cond && !cond.isPrimitive()) {
            cref = "" + this.cvar() + "[" + cond.osym() + "]";
            add("(" + this.vvar() + "=(" + cond.c(o) + "||undefined)," + this.vvar() + "===" + cref + "||(" + this.dvar() + "|=" + F.DIFF_FLAGS + "," + cref + "=" + this.vvar() + "))");
          }
          ;
          if (val && !(val instanceof Token2) && !val.isPrimitive() && !(val instanceof MixinIdentifier) && !(val instanceof StyleRuleSet)) {
            vref = "" + this.cvar() + "[" + val.osym() + "]";
            add("(" + this.vvar() + "=" + val.c(o) + "," + this.vvar() + "===" + vref + "||(" + this.dvar() + "|=" + F.DIFF_FLAGS + "," + vref + "=" + this.vvar() + "))");
          }
          ;
          if (cref && vref) {
            flagsToConcat.push("(" + cref + " ? (" + vref + "||'') : '')");
          } else if (cref) {
            flagsToConcat.push("(" + cref + " ? " + val.c({as: "string"}) + " : '')");
          } else if (vref) {
            flagsToConcat.push("(" + vref + "||'')");
          } else if (val instanceof MixinIdentifier) {
            flagsToConcat.push(val.c({as: "string"}));
          } else {
            flagsToConcat.push("'" + val.c({as: "substring"}) + "'");
          }
          ;
        } else if (item instanceof TagHandler) {
          let mods = item.modifiers();
          let specials = mods.extractDynamics();
          add("" + this.vvar() + " = " + iref + " || (" + iref + "=" + mods.c(o) + ")");
          for (let j = 0, ary = iter$7(specials), len2 = ary.length, special; j < len2; j++) {
            special = ary[j];
            let k = special.option("key");
            let i2 = special.option("index");
            add("" + OP(".", this.vvar(), k).c() + "[" + i2 + "]=" + special.c(o));
          }
          ;
          mods = this.vvar();
          add("" + this.bvar() + " || " + this.ref() + ".on$(" + item.quoted() + "," + mods.c() + "," + this.scope__().context().c() + ")");
        } else if (item instanceof TagAttr && item.ns() == "bind") {
          let rawVal = item.value();
          let val = PATHIFY(rawVal);
          shouldEnd = true;
          if (val instanceof Array) {
            let target = val[0];
            let key = val[1];
            let bval = "[]";
            if (target instanceof Literal && key instanceof Literal) {
              bval = "[" + target.c(o) + "," + key.c(o) + "]";
            } else if (key instanceof Literal) {
              bval = "[null," + key.c(o) + "]";
            }
            ;
            add("" + this.vvar() + "=" + iref + " || (" + iref + "=" + this.ref() + ".bind$('" + item.key() + "'," + bval + "))");
            for (let i2 = 0, ary = iter$7(val), len2 = ary.length, part; i2 < len2; i2++) {
              part = ary[i2];
              if (!(part instanceof Literal)) {
                add("" + this.vvar() + "[" + i2 + "]=" + part.c(o));
              }
              ;
            }
            ;
          } else if (val instanceof Variable) {
            let getter = "function(){ return " + val.c(o) + " }";
            let setter = "function(v$){ " + val.c(o) + " = v$ }";
            let bval = "{get:" + getter + ",set:" + setter + "}";
            add("" + this.bvar() + " || " + this.ref() + ".bind$('" + item.key() + "'," + bval + ")");
          }
          ;
        } else {
          if (isSVG) {
            item.option({svg: true});
          }
          ;
          let val = item.value();
          if (item.valueIsStatic()) {
            add("" + this.bvar() + " || (" + this.ref() + "." + M2(item.js(o), item) + ")");
          } else if (val instanceof Func) {
            add("(" + this.ref() + "." + item.js(o) + ")");
          } else if (val._variable) {
            let vc = val.c(o);
            item.setValue(LIT("" + iref + "=" + vc));
            add("(" + vc + "===" + iref + " || (" + this.ref() + "." + M2(item.js(o), item) + "))");
          } else {
            item.setValue(LIT("" + iref + "=" + this.vvar()));
            add("(" + this.vvar() + "=" + val.c(o) + "," + this.vvar() + "===" + iref + " || (" + this.ref() + "." + M2(item.js(o), item) + "))");
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if (flagsToConcat.length || this.isSelf() && this._className) {
      if (this._className) {
        flagsToConcat.unshift(this._className);
      }
      ;
      let meth = this.isSelf() ? "flagSelf$" : "flag$";
      let cond = "" + this.dvar() + "&" + F.DIFF_FLAGS;
      if (this.isSelf()) {
        cond = "(!" + this.bvar() + "||" + cond + ")";
      }
      ;
      add("(" + cond + " && " + this.tvar() + "." + meth + "(" + flagsToConcat.join("+' '+") + "))");
    }
    ;
    let count = nodes.length;
    for (let i = 0, len = nodes.length, item; i < len; i++) {
      item = nodes[i];
      if (item instanceof Str) {
        if (isReactive) {
          add("" + this.bvar() + " || " + this.tvar() + ".insert$(" + item.c(o) + ")");
        } else {
          add("" + this.tvar() + ".insert$(" + item.c(o) + ")");
        }
        ;
      } else {
        add(item.c(o));
      }
      ;
    }
    ;
    if (shouldEnd) {
      if (!this.isSelf()) {
        foot.push("" + this.bvar() + " || !" + this.tvar() + ".setup || " + this.tvar() + ".setup(" + this.dvar() + ")");
      }
      ;
      foot.push(this.isSelf() ? "" + this.tvar() + ".close$(" + this.dvar() + ")" : "" + this.tvar() + ".end$(" + this.dvar() + ")");
    }
    ;
    if (parent instanceof TagLoopFragment) {
      if (parent.isKeyed()) {
        foot.push("" + parent.ref() + ".push(" + this.tvar() + "," + parent.kvar() + "++," + this.kvar() + ")");
      } else if (parent.isIndexed()) {
        foot.push("" + parent.kvar() + "++");
      }
      ;
    } else if (this.isFragment() && parent && !(parent instanceof TagSwitchFragment)) {
      foot.push("" + fragment.ref() + ".insert$(" + this.tvar() + "," + this._flags + ")");
    } else if (parent && !(parent instanceof TagSwitchFragment) && (this.isComponent() || dynamicKey)) {
      let pref = fragment.ref();
      let cref = this._cref;
      if (dynamicKey) {
        foot.push("(" + this.tvar() + "==" + cref + ") || (!" + cref + " && (" + cref + "=" + this.tvar() + ").insertInto$(" + pref + ")) || " + cref + ".replaceWith$(" + cref + "=" + this.tvar() + ")");
      } else if (!this.isDetached()) {
        foot.push("" + this.bvar() + " || " + this.tvar() + ".insertInto$(" + pref + ")");
      }
      ;
    }
    ;
    if (this.option("fragmented")) {
      add("" + this.runtime().renderContext + ".context=null");
    }
    ;
    if (!parent) {
      if (this.option("return")) {
        foot.push("return " + this.tvar());
      } else if (!isReactive || o.inline) {
        foot.push("" + this.tvar());
      }
      ;
    }
    ;
    out = out.concat(foot);
    if (o.inline) {
      o.inline = wasInline;
      let js = "(" + out.join(",\n") + ")";
      if (this.isSlot() && this.hasChildren()) {
        let key = "" + this.cvar() + "[" + this.osym() + "]";
        let key_ = "" + this.cvar() + "[" + this.osym("_") + "]";
        let key__ = "" + this.cvar() + "[" + this.osym("__") + "]";
        let post = "" + this.tvar() + "===" + key__ + " || (" + key_ + " = " + fragment.tvar() + ".insert$(" + key__ + "=" + this.tvar() + "," + this._flags + "," + key_ + "))";
        js = "(" + this.tvar() + "=" + slotPath + "),(!" + this.tvar() + " || " + this.tvar() + ".isEmpty$() && " + js + "),(" + post + ")";
      }
      ;
      return js;
    } else {
      o.inline = wasInline;
      let js = out.join(";\n");
      if (this.isSlot() && this.hasChildren()) {
        let key = "" + this.cvar() + "[" + this.osym() + "]";
        let key_ = "" + this.cvar() + "[" + this.osym("_") + "]";
        let key__ = "" + this.cvar() + "[" + this.osym("__") + "]";
        let post = "" + this.tvar() + "===" + key__ + " || (" + key_ + " = " + fragment.tvar() + ".insert$(" + key__ + "=" + this.tvar() + "," + this._flags + "," + key_ + "))";
        js = "" + this.tvar() + "=" + slotPath + ";\nif(!" + this.tvar() + " || " + this.tvar() + ".isEmpty$()){\n" + js + "\n}\n" + post;
      }
      ;
      return js;
    }
    ;
  };
  function TagWrapper() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(TagWrapper, ValueNode2);
  exports2.TagWrapper = TagWrapper;
  TagWrapper.prototype.visit = function() {
    if (this.value() instanceof Array) {
      this.value().map(function(v) {
        return v.traverse();
      });
    } else {
      this.value().traverse();
    }
    ;
    return this;
  };
  TagWrapper.prototype.c = function() {
    return "" + this.scope__().imba().c() + ".getTagForDom(" + this.value().c({expression: true}) + ")";
  };
  function Selector(list, options) {
    this._nodes = list || [];
    this._options = options;
  }
  subclass$(Selector, ListNode);
  exports2.Selector = Selector;
  Selector.prototype.add = function(part, typ) {
    this.push(part);
    return this;
  };
  Selector.prototype.isExpressable = function() {
    return true;
  };
  Selector.prototype.visit = function() {
    let res = [];
    for (let i = 0, items = iter$7(this._nodes), len = items.length, item; i < len; i++) {
      item = items[i];
      res.push(!(item instanceof Token2) && item.traverse());
    }
    ;
    return res;
  };
  Selector.prototype.query = function() {
    var str = "";
    var ary = [];
    for (let i = 0, items = iter$7(this.nodes()), len = items.length, item; i < len; i++) {
      item = items[i];
      var val = item.c();
      if (item instanceof Token2) {
        ary.push("'" + val.replace(/\'/g, '"') + "'");
      } else {
        ary.push(val);
      }
      ;
    }
    ;
    return ary.join(" + ");
  };
  Selector.prototype.toString = function() {
    return AST.cary(this.nodes()).join("");
  };
  Selector.prototype.js = function(o) {
    var typ = this.option("type");
    var q = AST.c(this.query());
    var imba = this.scope__().imba().c();
    if (typ == "%") {
      return "" + imba + ".q$(" + q + "," + o.scope().context().c({explicit: true}) + ")";
    } else if (typ == "%%") {
      return "" + imba + ".q$$(" + q + "," + o.scope().context().c({explicit: true}) + ")";
    } else {
      return "" + imba + ".q" + typ + "(" + q + ")";
    }
    ;
  };
  function SelectorPart() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(SelectorPart, ValueNode2);
  exports2.SelectorPart = SelectorPart;
  function Await() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Await, ValueNode2);
  exports2.Await = Await;
  Await.prototype.func = function(v) {
    return this._func;
  };
  Await.prototype.setFunc = function(v) {
    this._func = v;
    return this;
  };
  Await.prototype.js = function(o) {
    if (this.option("native")) {
      return "await " + this.value().c();
    }
    ;
    return CALL(OP(".", new Util.Promisify([this.value()]), "then"), [this.func()]).c();
  };
  Await.prototype.visit = function(o) {
    this.value().traverse();
    var fnscope = o.up(Func);
    if (fnscope) {
      this.set({native: true});
      fnscope.set({async: true});
      return this;
    }
    ;
    this.warn("toplevel await not allowed");
    var block = o.up(Block);
    var outer = o.relative(block, 1);
    var par = o.relative(this, -1);
    this.setFunc(new AsyncFunc([], []));
    this.func().body().setNodes(block.defers(outer, this));
    this.func().scope().visit();
    if (par instanceof Assign) {
      par.left().traverse();
      var lft = par.left().node();
      if (lft instanceof VarReference) {
        this.func().params().at(0, true, lft.variable().name());
      } else {
        par.setRight(this.func().params().at(0, true));
        this.func().body().unshift(par);
        this.func().scope().context();
      }
      ;
    }
    ;
    this.func().traverse();
    return this;
  };
  function AsyncFunc(params, body, name, target, options) {
    AsyncFunc.prototype.__super__.constructor.call(this, params, body, name, target, options);
  }
  subclass$(AsyncFunc, Func);
  exports2.AsyncFunc = AsyncFunc;
  AsyncFunc.prototype.scopetype = function() {
    return LambdaScope;
  };
  function ESMSpecifier(name, alias) {
    this._name = name;
    this._alias = alias;
  }
  subclass$(ESMSpecifier, Node2);
  exports2.ESMSpecifier = ESMSpecifier;
  ESMSpecifier.prototype.alias = function(v) {
    return this._alias;
  };
  ESMSpecifier.prototype.setAlias = function(v) {
    this._alias = v;
    return this;
  };
  ESMSpecifier.prototype.name = function(v) {
    return this._name;
  };
  ESMSpecifier.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  ESMSpecifier.prototype.visit = function(stack) {
    this._declaration = stack.up(ESMDeclaration);
    if (this._declaration instanceof ImportDeclaration) {
      this._importer = this._declaration;
    } else {
      this._exporter = this._declaration;
    }
    ;
    this._cname = helpers2.clearLocationMarkers(this._name.c());
    this._key = this._alias ? helpers2.clearLocationMarkers(this._alias.c()) : this._cname;
    if (this._exporter) {
      if (!this._exporter.source()) {
        this._variable = this.scope__().root().lookup(this._cname);
      }
      ;
    } else {
      this._variable = this.scope__().root().register(this._key, this, {type: "imported"});
      stack.registerSemanticToken(this._alias || this._name, this._variable);
    }
    ;
    return this;
  };
  ESMSpecifier.prototype.js = function() {
    if (this._alias) {
      return "" + this._name.c() + " as " + this._alias.c();
    } else {
      return "" + this._name.c();
    }
    ;
  };
  function ImportSpecifier() {
    return ESMSpecifier.apply(this, arguments);
  }
  subclass$(ImportSpecifier, ESMSpecifier);
  exports2.ImportSpecifier = ImportSpecifier;
  ImportSpecifier.prototype.visit = function() {
    ImportSpecifier.prototype.__super__.visit.apply(this, arguments);
    if (this._importer && STACK.cjs()) {
      return this._variable._c = OP(".", this._importer.variable(), this._name).c();
    }
    ;
  };
  function ImportNamespaceSpecifier() {
    return ESMSpecifier.apply(this, arguments);
  }
  subclass$(ImportNamespaceSpecifier, ESMSpecifier);
  exports2.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
  ImportNamespaceSpecifier.prototype.visit = function() {
    ImportNamespaceSpecifier.prototype.__super__.visit.apply(this, arguments);
    if (this._importer && STACK.cjs()) {
      return this._variable._c = this._importer.variable().c();
    }
    ;
  };
  function ExportSpecifier() {
    return ESMSpecifier.apply(this, arguments);
  }
  subclass$(ExportSpecifier, ESMSpecifier);
  exports2.ExportSpecifier = ExportSpecifier;
  function ExportAllSpecifier() {
    return ESMSpecifier.apply(this, arguments);
  }
  subclass$(ExportAllSpecifier, ESMSpecifier);
  exports2.ExportAllSpecifier = ExportAllSpecifier;
  function ImportDefaultSpecifier() {
    return ESMSpecifier.apply(this, arguments);
  }
  subclass$(ImportDefaultSpecifier, ESMSpecifier);
  exports2.ImportDefaultSpecifier = ImportDefaultSpecifier;
  ImportDefaultSpecifier.prototype.visit = function() {
    ImportDefaultSpecifier.prototype.__super__.visit.apply(this, arguments);
    if (STACK.cjs()) {
      if (this._importer) {
        return this._variable._c = "" + this._importer.variable().c() + ".default";
      }
      ;
    }
    ;
  };
  function ESMSpecifierList() {
    return ListNode.apply(this, arguments);
  }
  subclass$(ESMSpecifierList, ListNode);
  exports2.ESMSpecifierList = ESMSpecifierList;
  ESMSpecifierList.prototype.js = function() {
    return "{" + ESMSpecifierList.prototype.__super__.js.apply(this, arguments) + "}";
  };
  function ESMDeclaration(keyword, specifiers, source) {
    this.setup();
    this._keyword = keyword;
    this._specifiers = specifiers;
    this._source = source;
    this._defaults = specifiers && specifiers.find(function(_0) {
      return _0 instanceof ImportDefaultSpecifier;
    });
  }
  subclass$(ESMDeclaration, Statement);
  exports2.ESMDeclaration = ESMDeclaration;
  ESMDeclaration.prototype.variable = function(v) {
    return this._variable;
  };
  ESMDeclaration.prototype.setVariable = function(v) {
    this._variable = v;
    return this;
  };
  ESMDeclaration.prototype.source = function(v) {
    return this._source;
  };
  ESMDeclaration.prototype.setSource = function(v) {
    this._source = v;
    return this;
  };
  ESMDeclaration.prototype.isExport = function() {
    return String(this.keyword()) == "export";
  };
  ESMDeclaration.prototype.js = function() {
    let kw = M2(this.keyword().c(), this.keyword());
    if (this._specifiers && this._source) {
      return "" + kw + " " + AST.cary(this._specifiers).join(",") + " from " + this._source.c();
    } else if (this._specifiers) {
      return "" + kw + " " + AST.cary(this._specifiers).join(",");
    } else if (this._source) {
      return "" + kw + " " + this._source.c();
    }
    ;
  };
  function ImportDeclaration() {
    return ESMDeclaration.apply(this, arguments);
  }
  subclass$(ImportDeclaration, ESMDeclaration);
  exports2.ImportDeclaration = ImportDeclaration;
  ImportDeclaration.prototype.js = function() {
    var src = this._source && this._source.c({locRef: "path"});
    if (STACK.cjs()) {
      let reqjs = "require(" + src + ")";
      if (!this._specifiers) {
        return reqjs;
      }
      ;
      if (this._defaults && this._specifiers.length == 1) {
        return "var " + this._variable.c() + " = " + this.util().requireDefault(LIT(reqjs)).c();
      } else {
        return "var " + this._variable.c() + " = " + reqjs;
      }
      ;
    }
    ;
    if (this._specifiers && this._source) {
      return "" + M2(this.keyword().c(), this.keyword()) + " " + AST.cary(this._specifiers).join(",") + " from " + src;
    } else {
      return "" + M2(this.keyword().c(), this.keyword()) + " " + src;
    }
    ;
  };
  ImportDeclaration.prototype.visit = function() {
    var $1;
    if (STACK.cjs() && this._specifiers) {
      var src = this._source.c();
      var m = helpers2.clearLocationMarkers(src).match(/([\w\_\-]+)(\.js|imba)?[\"\']$/);
      this._alias = m ? "_$" + m[1].replace(/[\/\-]/g, "_") : "mod$";
      this._variable = this.scope__().register(this._alias, null, {system: true});
    }
    ;
    for (let i = 0, items = iter$7(this._specifiers), len = items.length; i < len; i++) {
      ($1 = items[i]) && $1.traverse && $1.traverse();
    }
    ;
    return;
  };
  function ImportTypeDeclaration() {
    return ESMDeclaration.apply(this, arguments);
  }
  subclass$(ImportTypeDeclaration, ESMDeclaration);
  exports2.ImportTypeDeclaration = ImportTypeDeclaration;
  ImportTypeDeclaration.prototype.js = function() {
    if (!STACK.tsc()) {
      return "";
    }
    ;
    let src = this._source.c();
    if (this._defaults) {
      let tpl = "/** @typedef {import(SOURCE)} NAME */true";
      tpl = tpl.replace("SOURCE", src).replace("NAME", this._defaults.c());
      return tpl;
    } else {
      let parts = [];
      for (let i = 0, items = iter$7(this._specifiers[0].nodes()), len = items.length, item; i < len; i++) {
        item = items[i];
        let name = item._name.c();
        let alias = item._alias ? item._alias.c() : name;
        let part = "/** @typedef {import(" + src + ")." + name + "} " + alias + " */true";
        parts.push(part);
      }
      ;
      return parts.join(";\n");
    }
    ;
  };
  function ExportDeclaration() {
    return ESMDeclaration.apply(this, arguments);
  }
  subclass$(ExportDeclaration, ESMDeclaration);
  exports2.ExportDeclaration = ExportDeclaration;
  ExportDeclaration.prototype.visit = function() {
    var $1;
    this.scope__().root().activateExports();
    for (let i = 0, items = iter$7(this._specifiers), len = items.length; i < len; i++) {
      ($1 = items[i]) && $1.traverse && $1.traverse();
    }
    ;
    return this;
  };
  ExportDeclaration.prototype.js = function() {
    let kw = M2(this.keyword().c(), this.keyword());
    let cjs = STACK.cjs();
    if (cjs) {
      let out = [];
      if (this._source) {
        this._variable || (this._variable = this.scope__().register(null, null, {system: true}));
        let decl = "var " + this._variable.c() + " = require(" + this._source.c() + ")";
        out.push(decl);
        let tpl = "Object.defineProperty(exports, $name$, {\n	enumerable: true, get: function get() { return $path$; }\n});";
        for (let i = 0, items = iter$7(this._specifiers[0]), len = items.length, item; i < len; i++) {
          item = items[i];
          let js = tpl.replace("$name$", (item.alias() || item.name()).toStr().c());
          js = js.replace("$path$", OP(".", this._variable, item.name()).c());
          out.push(js);
        }
        ;
      } else {
        for (let i = 0, items = iter$7(this._specifiers[0]), len = items.length, item; i < len; i++) {
          item = items[i];
          let op = OP("=", OP(".", LIT("exports"), item.alias() || item.name()), item._variable);
          out.push(op.c());
        }
        ;
      }
      ;
      return out.join(";\n");
    }
    ;
    if (this._specifiers && this._source) {
      return "" + kw + " " + AST.cary(this._specifiers).join(",") + " from " + this._source.c();
    } else if (this._specifiers) {
      return "" + kw + " " + AST.cary(this._specifiers).join(",");
    } else if (this._source) {
      return "" + kw + " " + this._source.c();
    }
    ;
  };
  function ExportAllDeclaration() {
    return ExportDeclaration.apply(this, arguments);
  }
  subclass$(ExportAllDeclaration, ExportDeclaration);
  exports2.ExportAllDeclaration = ExportAllDeclaration;
  function ExportNamedDeclaration() {
    return ExportDeclaration.apply(this, arguments);
  }
  subclass$(ExportNamedDeclaration, ExportDeclaration);
  exports2.ExportNamedDeclaration = ExportNamedDeclaration;
  function Export() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Export, ValueNode2);
  exports2.Export = Export;
  Export.prototype.loc = function() {
    let kw = this.option("keyword");
    return kw && kw.region ? kw.region() : Export.prototype.__super__.loc.apply(this, arguments);
  };
  Export.prototype.consume = function(node) {
    if (node instanceof Return) {
      this.option("return", true);
      return this;
    }
    ;
    return Export.prototype.__super__.consume.apply(this, arguments);
  };
  Export.prototype.visit = function() {
    this.scope__().root().activateExports();
    this.value().set({
      export: this.option("keyword") || this,
      return: this.option("return"),
      default: this.option("default")
    });
    return Export.prototype.__super__.visit.apply(this, arguments);
  };
  Export.prototype.js = function(o) {
    var self3 = this;
    let isDefault = self3.option("default");
    if (self3.value() instanceof ListNode) {
      self3.value().map(function(item) {
        return item.set({export: self3});
      });
    }
    ;
    if (self3.value() instanceof MethodDeclaration || self3.value() instanceof ClassDeclaration) {
      return self3.value().c();
    }
    ;
    if (self3.value() instanceof Assign && self3.value().left() instanceof VarReference) {
      if (!STACK.cjs()) {
        return isDefault ? "export default " + self3.value().c() : "export " + self3.value().c();
      } else {
        let val = self3.value().left().value();
        let sym = isDefault ? "default" : self3.value().left().value().symbol();
        self3.value().setRight(OP("=", LIT("exports." + sym), self3.value().right()));
        return self3.value().c();
      }
      ;
    }
    ;
    if (isDefault) {
      let out = self3.value().c();
      return STACK.cjs() ? "exports.default = " + out : "export default " + out;
    }
    ;
    return self3.value().c();
  };
  function Require() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(Require, ValueNode2);
  exports2.Require = Require;
  Require.prototype.js = function(o) {
    var val = this.value() instanceof Parens ? this.value().value() : this.value();
    var out = val.c({locRef: "path"});
    return out == "require" ? "require" : "require(" + out + ")";
  };
  function EnvFlag() {
    EnvFlag.prototype.__super__.constructor.apply(this, arguments);
    this._key = String(this._value).slice(1, -1);
  }
  subclass$(EnvFlag, ValueNode2);
  exports2.EnvFlag = EnvFlag;
  EnvFlag.prototype.raw = function() {
    return this._raw == null ? this._raw = STACK.env("" + this._key) : this._raw;
  };
  EnvFlag.prototype.isTruthy = function() {
    var val = this.raw();
    if (val !== void 0) {
      return !!val;
    }
    ;
    return void 0;
  };
  EnvFlag.prototype.loc = function() {
    return [0, 0];
  };
  EnvFlag.prototype.c = function() {
    var val = this.raw();
    var out = val;
    if (val !== void 0) {
      if (typeof val == "string" || val instanceof String) {
        if (val.match(/^\d+(\.\d+)?$/)) {
          out = String(parseFloat(val));
        } else {
          out = "'" + val + "'";
        }
        ;
      } else {
        out = "" + val;
      }
      ;
    } else {
      out = "ENV_" + this._key;
    }
    ;
    return M2(out, this._value);
  };
  function StyleNode2() {
    return Node2.apply(this, arguments);
  }
  subclass$(StyleNode2, Node2);
  exports2.StyleNode = StyleNode2;
  function StyleSelector() {
    return StyleNode2.apply(this, arguments);
  }
  subclass$(StyleSelector, StyleNode2);
  exports2.StyleSelector = StyleSelector;
  function StyleRuleSet(selectors, body) {
    this._placeholders = [];
    this._selectors = selectors;
    this._body = body;
  }
  subclass$(StyleRuleSet, StyleNode2);
  exports2.StyleRuleSet = StyleRuleSet;
  StyleRuleSet.prototype.isStatic = function() {
    return true;
  };
  StyleRuleSet.prototype.isGlobal = function() {
    return !!this.option("global");
  };
  StyleRuleSet.prototype.addPlaceholder = function(item) {
    this._placeholders.push(item);
    return this;
  };
  StyleRuleSet.prototype.placeholders = function() {
    return this._placeholders;
  };
  StyleRuleSet.prototype.visit = function(stack, o) {
    var self3 = this, STACK_;
    let cmp = self3._tagDeclaration = stack.up(TagDeclaration);
    self3._flag = stack.up(TagFlag);
    self3._tag = self3._flag && self3._flag._tag;
    let sel = String(self3._selectors).trim();
    if (sel.match(/^\%[\w\-]+$/)) {
      self3.set({mixin: sel.slice(1)});
      self3._identifier = new MixinIdentifier(sel);
      self3._name = sel.slice(1) + "-" + self3.sourceId() + self3.oid();
      self3._sel = sel;
      self3._variable = self3.scope__().register(self3._identifier.symbol(), self3, {type: "const", lookup: true});
    }
    ;
    if (stack.parent() instanceof ClassBody) {
      let owner = stack.up(2);
      if (owner instanceof TagDeclaration) {
        if (!self3._variable) {
          self3._sel = String(self3._selectors).trim() || "&";
          if (self3._sel.match(/^\>{1,3}/)) {
            self3._sel = "& " + self3._sel;
          } else if (self3._sel.match(/^\@/) && !self3._sel.match(/&/)) {
            self3._sel = "&" + self3._sel;
          }
          ;
          self3._sel = self3._sel.replace("&", "." + cmp.cssns() + "_");
        }
        ;
        self3.set({inClassBody: true});
        self3._rulescope = owner.scope__();
        if (cmp) {
          cmp.set({hasScopedStyles: true});
        }
        ;
      } else {
        true;
      }
      ;
    } else if (self3.option("toplevel")) {
      self3._sel || (self3._sel = String(self3._selectors).trim());
    } else if (o.rule) {
      self3._sel || (self3._sel = self3._selectors && self3._selectors.toString && self3._selectors.toString().trim());
      if (self3._sel.indexOf("&") == -1) {
        self3._sel = "& " + self3._sel;
      }
      ;
    } else if (!self3._name && self3._tag && self3._flag && !self3._flag._condition) {
      self3._name = self3._tag.cssflag();
      self3._sel = "." + self3._name;
    } else if (!self3._name) {
      self3._name = cmp ? cmp.cssns() + self3.oid() : self3.sourceId() + self3.oid();
      self3._sel = "." + self3._name;
    }
    ;
    self3._selectors && self3._selectors.traverse && self3._selectors.traverse();
    self3._styles = {};
    self3._body && self3._body.traverse && self3._body.traverse({rule: self3, styles: self3._styles, rootRule: o.rule || self3});
    if (o.rule && o.styles) {
      if (o.styles[self3._sel]) {
        Object.assign(o.styles[self3._sel], self3._styles);
      } else {
        o.styles[self3._sel] = self3._styles;
      }
      ;
    } else {
      let pri = !!self3._flag ? self3._tag && self3._tag.isSelf() ? 2 : 2 : 0;
      if (pri < 1 && self3.option("inClassBody")) {
        pri = 1;
      }
      ;
      let component = self3._tagDeclaration;
      let opts = {
        selectors: [],
        component: cmp,
        ns: cmp ? cmp.cssns() : self3.sourceId(),
        priority: pri,
        forceLocal: !self3._flag && (cmp || !self3.isGlobal()),
        inline: !!self3._flag,
        global: !!self3.isGlobal(),
        mixins: {}
      };
      opts.resolver = function(name) {
        var resolved;
        let varname = "mixin$" + name;
        if (resolved = self3.scope__().lookup("mixin$" + name)) {
          if (resolved._declarator instanceof StyleRuleSet) {
            return resolved._declarator._sel;
          } else {
            return resolved;
          }
          ;
        }
        ;
        return null;
      };
      self3._css = new StyleRule(null, self3._sel, self3._styles, opts).toString();
      if (opts.hasScopedStyles) {
        (cmp || stack).set({hasScopedStyles: true});
      }
      ;
      self3._css = self3._css.replace(/\.mixin___([\w\-]+)/g, function(m, name) {
        var resolved;
        let varname = "mixin$" + name;
        if (resolved = self3.scope__().lookup(varname)) {
          if (resolved._declarator instanceof StyleRuleSet) {
            return "." + resolved._declarator._name;
          } else {
            return m;
          }
          ;
        }
        ;
      });
      STACK.setCss(STACK.css() + self3._css + "\n\n");
    }
    ;
    return self3;
  };
  StyleRuleSet.prototype.toRaw = function() {
    return "" + this._name;
  };
  StyleRuleSet.prototype.c = function() {
    if (this.option("toplevel") && this.option("export")) {
      if (STACK.cjs()) {
        return "exports." + this._identifier.c() + " = '" + this._name + "'";
      } else {
        return M2("export", this.option("export")) + (" const " + this._identifier.c() + " = '" + this._name + "'");
      }
      ;
    }
    ;
    if (this.option("inClassBody") || this.option("toplevel")) {
      return "";
    }
    ;
    let out = "'" + this._name + "'";
    return out;
  };
  function StyleBody() {
    return ListNode.apply(this, arguments);
  }
  subclass$(StyleBody, ListNode);
  exports2.StyleBody = StyleBody;
  StyleBody.prototype.visit = function() {
    let items = this._nodes;
    let i = 0;
    let prevname;
    for (let j = 0, ary = iter$7(items), len = ary.length, item; j < len; j++) {
      item = ary[j];
      if (!(item instanceof StyleDeclaration)) {
        continue;
      }
      ;
      if (!item._property._name) {
        item._property.setName(prevname);
      }
      ;
      prevname = item._property._name;
    }
    ;
    while (i < items.length) {
      let item = items[i];
      let res = item.traverse();
      if (res != item) {
        if (res instanceof Array) {
          items.splice.apply(items, [].concat([i, 1], Array.from(res)));
          continue;
        }
        ;
      }
      ;
      if (item == items[i]) {
        i++;
      }
      ;
    }
    ;
    return this;
  };
  StyleBody.prototype.toJSON = function() {
    return this.values();
  };
  function StyleDeclaration(property, expr) {
    this._property = property;
    this._expr = expr instanceof StyleExpressions ? expr : new StyleExpressions(expr);
    this;
  }
  subclass$(StyleDeclaration, StyleNode2);
  exports2.StyleDeclaration = StyleDeclaration;
  StyleDeclaration.prototype.clone = function(name, params) {
    if (!params) {
      params = this._expr.clone();
    }
    ;
    if (typeof params == "string" || typeof params == "number") {
      params = [params];
    }
    ;
    if (!(params instanceof Array) && !(params instanceof ListNode)) {
      params = [params];
    }
    ;
    return new StyleDeclaration(this._property.clone(name), params);
  };
  StyleDeclaration.prototype.visit = function(stack, o) {
    var self3 = this;
    let theme2 = stack.theme();
    let list = stack.parent();
    let name = String(self3._property.name());
    let alias = theme2.expandProperty(name);
    if (self3._expr) {
      self3._expr.traverse({
        rule: o.rule,
        rootRule: o.rootRule,
        decl: self3,
        property: self3._property
      });
    }
    ;
    if (alias instanceof Array) {
      list.replace(self3, alias.map(function(_0) {
        return self3.clone(_0);
      }));
      return;
    } else if (alias && alias != name) {
      self3._property = self3._property.clone(alias);
    }
    ;
    let method = helpers2.symbolize(alias || name);
    if (self3._expr) {
      self3._expr.traverse({decl: self3, property: self3._property});
    }
    ;
    if (theme2[method] && !self3.option("plain")) {
      let res = theme2[method].apply(theme2, self3._expr.toArray());
      let expanded = [];
      if (res instanceof Array) {
        self3._expr = new StyleExpressions(res);
      } else if (res instanceof Object) {
        for (let v, i = 0, keys = Object.keys(res), l = keys.length, k; i < l; i++) {
          k = keys[i];
          v = res[k];
          if (k.indexOf("&") >= 0) {
            let body = new StyleBody([]);
            let rule = new StyleRuleSet(LIT(k), body);
            expanded.push(rule);
            for (let v2, j = 0, keys1 = Object.keys(v), l2 = keys1.length, k2; j < l2; j++) {
              k2 = keys1[j];
              v2 = v[k2];
              body.add(self3.clone(k2, v2));
            }
            ;
          } else {
            expanded.push(self3.clone(k, v).set({plain: k == name}));
          }
          ;
        }
        ;
        list.replace(self3, expanded);
        return;
      }
      ;
    }
    ;
    if (self3._expr) {
      self3._expr.traverse({decl: self3, property: self3._property});
    }
    ;
    if (o.styles) {
      let key = self3._property.toKey();
      let val = self3._expr;
      if (o.selector) {
        key = JSON.stringify([o.selector, key]);
      }
      ;
      if (self3._property.isUnit()) {
        if (self3._property.number() != 1) {
          val = LIT("calc(" + val.c() + " / " + self3._property.number() + ")");
        }
        ;
      }
      ;
      o.styles[key] = val.c({property: self3._property});
    }
    ;
    return self3;
  };
  StyleDeclaration.prototype.toCSS = function() {
    return "" + this._property.c() + ": " + AST.cary(this._expr).join(" ");
  };
  StyleDeclaration.prototype.toJSON = function() {
    return this.toCSS();
  };
  function StyleProperty(token3) {
    var m;
    this._token = token3;
    this._parts = String(this._token).replace(/(^|\b)\$/g, "--").split(/\b(?=[\.\@])/g);
    for (let i = 0, items = iter$7(this._parts), len = items.length; i < len; i++) {
      this._parts[i] = items[i].replace(/^\./, "@.");
    }
    ;
    this._name = String(this._parts[0]);
    if (m = this._name.match(/^(\d+)([a-zA-Z]+)$/)) {
      this._number = parseInt(m[1]);
      this._unit = m[2];
    }
    ;
    if (!this._name.match(/^[\w\-]/)) {
      this._parts.unshift(this._name = null);
    }
    ;
    this;
  }
  subclass$(StyleProperty, StyleNode2);
  exports2.StyleProperty = StyleProperty;
  StyleProperty.prototype.name = function(v) {
    return this._name;
  };
  StyleProperty.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  StyleProperty.prototype.number = function(v) {
    return this._number;
  };
  StyleProperty.prototype.setNumber = function(v) {
    this._number = v;
    return this;
  };
  StyleProperty.prototype.unit = function(v) {
    return this._unit;
  };
  StyleProperty.prototype.setUnit = function(v) {
    this._unit = v;
    return this;
  };
  StyleProperty.prototype.setName = function(value) {
    var m;
    if (m = value.match(/^(\d+)([a-zA-Z]+)$/)) {
      this._number = parseInt(m[1]);
      this._unit = m[2];
    } else {
      this._number = this._unit = null;
    }
    ;
    this._name = value;
    return this;
  };
  StyleProperty.prototype.name = function() {
    return this._name || (this._name = String(this._parts[0]));
  };
  StyleProperty.prototype.clone = function(newname) {
    return new StyleProperty([newname || this.name()].concat(this.modifiers()).join(""));
  };
  StyleProperty.prototype.addModifier = function(modifier) {
    this._parts.push(modifier);
    return this;
  };
  StyleProperty.prototype.isUnit = function() {
    return this._unit;
  };
  StyleProperty.prototype.modifiers = function() {
    return this._parts.slice(1);
  };
  StyleProperty.prototype.toJSON = function() {
    return this.name() + this.modifiers().join("\xA7");
  };
  StyleProperty.prototype.toString = function() {
    return this.name() + this.modifiers().join("\xA7");
  };
  StyleProperty.prototype.toKey = function() {
    let name = this.isUnit() ? "--u_" + this._unit : this.name();
    return [name].concat(this.modifiers()).join("\xA7");
  };
  StyleProperty.prototype.c = function() {
    return this.toString();
  };
  function StylePropertyIdentifier(name) {
    this._name = name;
    if (String(name)[0] == "$") {
      this._name = "--" + String(name).slice(1);
    }
    ;
  }
  subclass$(StylePropertyIdentifier, StyleNode2);
  exports2.StylePropertyIdentifier = StylePropertyIdentifier;
  StylePropertyIdentifier.prototype.toJSON = function() {
    return String(this._name);
  };
  StylePropertyIdentifier.prototype.toString = function() {
    return String(this._name);
  };
  function StylePropertyModifier(name) {
    this._name = name;
  }
  subclass$(StylePropertyModifier, StyleNode2);
  exports2.StylePropertyModifier = StylePropertyModifier;
  StylePropertyModifier.prototype.toJSON = function() {
    return String(this._name);
  };
  StylePropertyModifier.prototype.toString = function() {
    return String(this._name);
  };
  function StyleExpressions() {
    return ListNode.apply(this, arguments);
  }
  subclass$(StyleExpressions, ListNode);
  exports2.StyleExpressions = StyleExpressions;
  StyleExpressions.prototype.load = function(list) {
    if (list instanceof Array) {
      list = list.map(function(_0) {
        return _0 instanceof StyleExpression ? _0 : new StyleExpression(_0);
      });
    }
    ;
    return [].concat(list);
  };
  StyleExpressions.prototype.c = function() {
    return AST.cary(this._nodes).join(", ");
  };
  StyleExpressions.prototype.clone = function() {
    return new StyleExpressions(this._nodes.slice(0));
  };
  StyleExpressions.prototype.toArray = function() {
    return this._nodes.filter(function(_0) {
      return _0 instanceof StyleExpression;
    }).map(function(_0) {
      return _0.toArray();
    });
  };
  function StyleExpression() {
    return ListNode.apply(this, arguments);
  }
  subclass$(StyleExpression, ListNode);
  exports2.StyleExpression = StyleExpression;
  StyleExpression.prototype.load = function(list) {
    return [].concat(list);
  };
  StyleExpression.prototype.toString = function() {
    return AST.cary(this._nodes).join(" ");
  };
  StyleExpression.prototype.toArray = function() {
    return this._nodes.slice(0);
  };
  StyleExpression.prototype.clone = function() {
    return new StyleExpression(this._nodes.slice(0));
  };
  StyleExpression.prototype.c = function() {
    return this.toString();
  };
  StyleExpression.prototype.toJSON = function() {
    return this.toString();
  };
  StyleExpression.prototype.toArray = function() {
    return this._nodes;
  };
  StyleExpression.prototype.toIterable = function() {
    return this._nodes;
  };
  StyleExpression.prototype.addParam = function(param, op) {
    param._op = op;
    this.last().addParam(param);
    return this;
  };
  StyleExpression.prototype.reclaimParams = function() {
    let items = this.filter(function(_0) {
      return _0.param;
    });
    for (let i = 0, ary = iter$7(items), len = ary.length, item; i < len; i++) {
      item = ary[i];
      let param = item.param;
      let op = param._op;
      this.add([op, param], {after: item});
      item._params = [];
    }
    ;
    return;
  };
  StyleExpression.prototype.visit = function(stack, o) {
    if (o && o.property) {
      let name = o.property._name;
      if (name == "gt" || name == "grid-template") {
        this.reclaimParams();
      }
      ;
    }
    ;
    return StyleExpression.prototype.__super__.visit.apply(this, arguments);
  };
  StyleExpression.prototype.visit2 = function() {
    let items = this._nodes;
    let i = 0;
    while (i < items.length) {
      let item = items[i];
      let next = items[i + 1];
      let res = item.traverse();
      if (res != item) {
        if (res instanceof Array) {
          items.splice.apply(items, [].concat([i, 1], Array.from(res)));
          continue;
        }
        ;
      }
      ;
      if (item == items[i]) {
        i++;
      }
      ;
    }
    ;
    return this;
  };
  function StyleTerm() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(StyleTerm, ValueNode2);
  exports2.StyleTerm = StyleTerm;
  StyleTerm.prototype.valueOf = function() {
    return String(this._value);
  };
  StyleTerm.prototype.toString = function() {
    return String(this._value);
  };
  StyleTerm.prototype.toRaw = function() {
    return this.valueOf();
  };
  StyleTerm.prototype.toAlpha = function() {
    return this.toString();
  };
  StyleTerm.prototype.visit = function(stack, o) {
    this._token = this._value;
    this._property = o.property;
    this._propname = o.property && o.property._name;
    this.alone = stack.up().values().length == 1;
    let resolved = stack.theme().$value(this, 0, this._propname);
    if (!stack.up(StyleFunction)) {
      this._resolvedValue = resolved;
    }
    ;
    return this;
  };
  Object.defineProperty(StyleTerm.prototype, "param", {get: function() {
    return this._params && this._params[0];
  }, configurable: true});
  StyleTerm.prototype.kind = function() {
    return this._kind;
  };
  StyleTerm.prototype.addParam = function(param) {
    this._params || (this._params = []);
    this._params.push(param);
    return this;
  };
  StyleTerm.prototype.c = function() {
    let out = this._resolvedValue && !(this._resolvedValue instanceof Node2) ? C(this._resolvedValue) : this.valueOf();
    return out;
  };
  function StyleInterpolationExpression() {
    return StyleTerm.apply(this, arguments);
  }
  subclass$(StyleInterpolationExpression, StyleTerm);
  exports2.StyleInterpolationExpression = StyleInterpolationExpression;
  StyleInterpolationExpression.prototype.name = function(v) {
    return this._name;
  };
  StyleInterpolationExpression.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  StyleInterpolationExpression.prototype.visit = function(stack, o) {
    StyleInterpolationExpression.prototype.__super__.visit.apply(this, arguments);
    if (o.rootRule) {
      o.rootRule.addPlaceholder(this);
    }
    ;
    this._id = "" + this.sourceId() + "_" + this.oid();
    return this._name = "--" + this._id;
  };
  StyleInterpolationExpression.prototype.c = function() {
    return "var(--" + this._id + ")";
  };
  function StyleFunction(value, params) {
    this._name = value;
    this._params = params;
  }
  subclass$(StyleFunction, Node2);
  exports2.StyleFunction = StyleFunction;
  StyleFunction.prototype.kind = function() {
    return "function";
  };
  StyleFunction.prototype.visit = function(stack, o) {
    if (this._params && this._params.traverse) {
      this._params.traverse();
    }
    ;
    return this;
  };
  StyleFunction.prototype.toString = function() {
    return this.c();
  };
  StyleFunction.prototype.c = function() {
    let name = String(this._name);
    let pars = this._params.c();
    if (name == "url") {
      return MP("" + name + "(" + SourceMapper.strip(pars) + ")", "path");
    }
    ;
    return "" + name + "(" + pars + ")";
  };
  function StyleURL() {
    return ValueNode2.apply(this, arguments);
  }
  subclass$(StyleURL, ValueNode2);
  exports2.StyleURL = StyleURL;
  StyleURL.prototype.c = function() {
    let out = String(this._value);
    return MP(SourceMapper.strip(out), "path");
  };
  function StyleIdentifier() {
    return StyleTerm.apply(this, arguments);
  }
  subclass$(StyleIdentifier, StyleTerm);
  exports2.StyleIdentifier = StyleIdentifier;
  StyleIdentifier.prototype.color = function(v) {
    return this._color;
  };
  StyleIdentifier.prototype.setColor = function(v) {
    this._color = v;
    return this;
  };
  StyleIdentifier.prototype.visit = function(stack) {
    var c;
    if (c = stack.theme().$color(this.toString())) {
      this.setColor(this.param ? c.alpha(this.param.toAlpha()) : c);
    }
    ;
    return StyleIdentifier.prototype.__super__.visit.apply(this, arguments);
  };
  StyleIdentifier.prototype.c = function() {
    if (this.color()) {
      return this.color().toString();
    }
    ;
    let val = this.toString();
    return val[0] == "$" ? "var(--" + val.slice(1) + ")" : StyleIdentifier.prototype.__super__.c.apply(this, arguments);
  };
  function StyleString() {
    return StyleTerm.apply(this, arguments);
  }
  subclass$(StyleString, StyleTerm);
  exports2.StyleString = StyleString;
  function StyleColor() {
    return StyleTerm.apply(this, arguments);
  }
  subclass$(StyleColor, StyleTerm);
  exports2.StyleColor = StyleColor;
  function StyleVar() {
    return StyleTerm.apply(this, arguments);
  }
  subclass$(StyleVar, StyleTerm);
  exports2.StyleVar = StyleVar;
  StyleVar.prototype.c = function() {
    return this.toString();
  };
  var VALID_CSS_UNITS = "cm mm Q in pc pt px em ex ch rem vw vh vmin vmax % s ms fr deg rad grad turn Hz kHz".split(" ");
  function StyleDimension(value) {
    this._value = value;
    let m = String(value).match(/^([\-\+]?[\d\.]*)([a-zA-Z]+|%)?$/);
    this._number = parseFloat(m[1]);
    this._unit = m[2] || null;
  }
  subclass$(StyleDimension, StyleTerm);
  exports2.StyleDimension = StyleDimension;
  StyleDimension.prototype.unit = function(v) {
    return this._unit;
  };
  StyleDimension.prototype.setUnit = function(v) {
    this._unit = v;
    return this;
  };
  StyleDimension.prototype.number = function(v) {
    return this._number;
  };
  StyleDimension.prototype.setNumber = function(v) {
    this._number = v;
    return this;
  };
  StyleDimension.prototype.clone = function(num, unit) {
    if (num === void 0)
      num = this._number;
    if (unit === void 0)
      unit = this._unit;
    let cloned = new StyleDimension(this.value());
    cloned._unit = unit;
    cloned._number = num;
    return cloned;
  };
  StyleDimension.prototype.toString = function() {
    return "" + this._number + (this._unit || "");
  };
  StyleDimension.prototype.toRaw = function() {
    return this._unit ? this.toString() : this._number;
  };
  StyleDimension.prototype.valueOf = function() {
    if (this.unit() == "u") {
      return this.number() * 4 + "px";
    } else if (this.unit() == null) {
      return this.number();
    } else if (idx$(this.unit(), VALID_CSS_UNITS) >= 0) {
      return String(this._value);
    } else {
      return "calc(var(--u_" + this.unit() + "," + String(this._value) + ") * " + this._number + ")";
    }
    ;
  };
  StyleDimension.prototype.toAlpha = function() {
    if (!this.unit()) {
      return this.number() + "%";
    } else {
      return this.valueOf();
    }
    ;
  };
  function StyleNumber() {
    return StyleDimension.apply(this, arguments);
  }
  subclass$(StyleNumber, StyleDimension);
  exports2.StyleNumber = StyleNumber;
  function Util(args) {
    this._args = args;
  }
  subclass$(Util, Node2);
  exports2.Util = Util;
  Util.prototype.args = function(v) {
    return this._args;
  };
  Util.prototype.setArgs = function(v) {
    this._args = v;
    return this;
  };
  Util.extend = function(a, b) {
    return new Util.Extend([a, b]);
  };
  Util.callImba = function(scope2, meth, args) {
    return CALL(OP(".", scope2.imba(), new Identifier(meth)), args);
  };
  Util.repeat = function(str, times) {
    var res = "";
    while (times > 0) {
      if (times % 2 == 1) {
        res += str;
      }
      ;
      str += str;
      times >>= 1;
    }
    ;
    return res;
  };
  Util.keys = function(obj) {
    var l = new Const("Object");
    var r = new Identifier("keys");
    return CALL(OP(".", l, r), [obj]);
  };
  Util.len = function(obj, cache) {
    var r = new Identifier("length");
    var node = OP(".", obj, r);
    if (cache) {
      node.cache({force: true, pool: "len"});
    }
    ;
    return node;
  };
  Util.indexOf = function(lft, rgt) {
    var node = new Util.IndexOf([lft, rgt]);
    return node;
  };
  Util.slice = function(obj, a, b) {
    var slice = new Identifier("slice");
    console.log("slice " + a + " " + b);
    return CALL(OP(".", obj, slice), AST.compact([a, b]));
  };
  Util.iterable = function(obj, cache) {
    if (STACK.tsc()) {
      return obj;
    }
    ;
    var node = new Util.Iterable([obj]);
    if (cache) {
      node.cache({force: true, pool: "iter"});
    }
    ;
    return node;
  };
  Util.counter = function(start, cache) {
    var node = new Num(start);
    if (cache) {
      node.cache({force: true, pool: "counter"});
    }
    ;
    return node;
  };
  Util.array = function(size, cache) {
    var node = new Util.Array([size]);
    if (cache) {
      node.cache({force: true, pool: "list"});
    }
    ;
    return node;
  };
  Util.prototype.name = function() {
    return "requireDefault$";
  };
  Util.prototype.js = function() {
    this.scope__().root().helper(this, this.helper());
    return "" + this.name() + "(" + this._args.map(function(v) {
      return v.c();
    }).join(",") + ")";
  };
  var HELPERS = {
    setField: "(target,key,value,o){\n	Object.defineProperty(target,key,{value:value});\n};",
    unit: "(value,unit){\n	return value + unit;\n};",
    extendTag: "(el,cls){\n	Object.defineProperties(el,Object.getOwnPropertyDescriptors(cls.prototype));\n	return el;\n};",
    initField: "(target,key,o){\n	Object.defineProperty(target,key,o);\n};",
    watcher: "(k,w){\n	return { enumerable:true,\n		set(v){var o=this[k]; (v===o)||(this[k]=v,this[w]({value:v,oldValue:o}));},\n		get(){ return this[k] }\n	};\n};",
    decorate: '(decorators,target,key,desc){\n	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n	if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);\n	else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n	return c > 3 && r && Object.defineProperty(target, key, r), r;\n};',
    contains: "(a,b){\n	var res = (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n	return res >= 0;\n};",
    requireDefault: "(obj){\n	return obj && obj.__esModule ? obj : { default: obj };\n};"
  };
  Util.Helper = function Helper() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.Helper, Util);
  Util.Helper.prototype.name = function() {
    return this.option("name");
  };
  Util.Helper.prototype.helper = function() {
    return this.option("helper");
  };
  for (let v, i = 0, keys = Object.keys(HELPERS), l = keys.length, k; i < l; i++) {
    k = keys[i];
    v = HELPERS[k];
    Util[k] = function() {
      var $0 = arguments, j = $0.length;
      var args = new Array(j > 0 ? j : 0);
      while (j > 0)
        args[j - 1] = $0[--j];
      let helper = "function " + k + "$" + v;
      return new Util.Helper(args).set({name: k + "$", helper});
    };
  }
  Util.Extend = function Extend() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.Extend, Util);
  Util.Extend.prototype.helper = function() {
    return "function extend$(target,ext){\n	// @ts-ignore\n	var descriptors = Object.getOwnPropertyDescriptors(ext);\n	// @ts-ignore\n	Object.defineProperties(target.prototype,descriptors);\n	return target;\n};";
  };
  Util.Extend.prototype.js = function(o) {
    this.scope__().root().helper(this, this.helper());
    return "extend$(" + AST.compact(AST.cary(this.args())).join(",") + ")";
  };
  Util.IndexOf = function IndexOf() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.IndexOf, Util);
  Util.IndexOf.prototype.helper = function() {
    return "function idx$(a,b){\n	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);\n};";
  };
  Util.IndexOf.prototype.js = function(o) {
    this.scope__().root().helper(this, this.helper());
    return "idx$(" + this.args().map(function(v) {
      return v.c();
    }).join(",") + ")";
  };
  Util.Promisify = function Promisify() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.Promisify, Util);
  Util.Promisify.prototype.helper = function() {
    return 'function promise$(a){\n	if(a instanceof Array){\n		console.warn("await (Array) is deprecated - use await Promise.all(Array)");\n		return Promise.all(a);\n	} else {\n		return (a && a.then ? a : Promise.resolve(a));\n	}\n}';
  };
  Util.Promisify.prototype.js = function(o) {
    this.scope__().root().helper(this, this.helper());
    return "promise$(" + this.args().map(function(v) {
      return v.c();
    }).join(",") + ")";
  };
  Util.Iterable = function Iterable() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.Iterable, Util);
  Util.Iterable.prototype.helper = function() {
    return "function iter$(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; };";
  };
  Util.Iterable.prototype.js = function(o) {
    if (this.args()[0] instanceof Arr) {
      return this.args()[0].c();
    }
    ;
    this.scope__().root().helper(this, this.helper());
    return "iter$(" + this.args()[0].c() + ")";
  };
  Util.IsFunction = function IsFunction() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.IsFunction, Util);
  Util.IsFunction.prototype.js = function(o) {
    return "" + this.args()[0].c();
  };
  Util.Array = function Array2() {
    return Util.apply(this, arguments);
  };
  subclass$(Util.Array, Util);
  Util.Array.prototype.js = function(o) {
    return "new Array(" + this.args().map(function(v) {
      return v.c();
    }) + ")";
  };
  function Entities(root) {
    this._root = root;
    this._map = [];
    return this;
  }
  Entities.prototype.add = function(path, object) {
    this._map[path] = object;
    if (this._map.indexOf(object) < 0) {
      this._map.push(object);
    }
    ;
    return this;
  };
  Entities.prototype.lookup = function(path) {
    return this._map[path];
  };
  Entities.prototype.plain = function() {
    return JSON.parse(JSON.stringify(this._map));
  };
  Entities.prototype.toJSON = function() {
    return this._map;
  };
  function RootEntities(root) {
    this._root = root;
    this._map = {};
    return this;
  }
  RootEntities.prototype.add = function(path, object) {
    this._map[path] = object;
    return this;
  };
  RootEntities.prototype.register = function(entity) {
    var path = entity.namepath();
    this._map[path] || (this._map[path] = entity);
    return this;
  };
  RootEntities.prototype.plain = function() {
    return JSON.parse(JSON.stringify(this._map));
  };
  RootEntities.prototype.toJSON = function() {
    return this._map;
  };
  function Scope2(node, parent) {
    this._nr = STACK.incr("scopes");
    this._head = [];
    this._node = node;
    this._parent = parent;
    this._vars = new ScopeVariables([]);
    this._entities = new Entities(this);
    this._meta = {};
    this._annotations = [];
    this._closure = this;
    this._virtual = false;
    this._counter = 0;
    this._varmap = {};
    this._counters = {};
    this._varpool = [];
    this._refcounter = 0;
    this._level = (parent ? parent._level : -1) + 1;
    this.setup();
  }
  exports2.Scope = Scope2;
  Scope2.prototype.level = function(v) {
    return this._level;
  };
  Scope2.prototype.setLevel = function(v) {
    this._level = v;
    return this;
  };
  Scope2.prototype.context = function(v) {
    return this._context;
  };
  Scope2.prototype.setContext = function(v) {
    this._context = v;
    return this;
  };
  Scope2.prototype.node = function(v) {
    return this._node;
  };
  Scope2.prototype.setNode = function(v) {
    this._node = v;
    return this;
  };
  Scope2.prototype.parent = function(v) {
    return this._parent;
  };
  Scope2.prototype.setParent = function(v) {
    this._parent = v;
    return this;
  };
  Scope2.prototype.varmap = function(v) {
    return this._varmap;
  };
  Scope2.prototype.setVarmap = function(v) {
    this._varmap = v;
    return this;
  };
  Scope2.prototype.varpool = function(v) {
    return this._varpool;
  };
  Scope2.prototype.setVarpool = function(v) {
    this._varpool = v;
    return this;
  };
  Scope2.prototype.params = function(v) {
    return this._params;
  };
  Scope2.prototype.setParams = function(v) {
    this._params = v;
    return this;
  };
  Scope2.prototype.head = function(v) {
    return this._head;
  };
  Scope2.prototype.setHead = function(v) {
    this._head = v;
    return this;
  };
  Scope2.prototype.vars = function(v) {
    return this._vars;
  };
  Scope2.prototype.setVars = function(v) {
    this._vars = v;
    return this;
  };
  Scope2.prototype.counter = function(v) {
    return this._counter;
  };
  Scope2.prototype.setCounter = function(v) {
    this._counter = v;
    return this;
  };
  Scope2.prototype.entities = function(v) {
    return this._entities;
  };
  Scope2.prototype.setEntities = function(v) {
    this._entities = v;
    return this;
  };
  Scope2.prototype.p = function() {
    if (STACK.loglevel() > 0) {
      console.log.apply(console, arguments);
    }
    ;
    return this;
  };
  Scope2.prototype.oid = function() {
    return this._oid || (this._oid = STACK.generateId(""));
  };
  Scope2.prototype.stack = function() {
    return STACK;
  };
  Scope2.prototype.kind = function() {
    return this._kind || (this._kind = this.constructor.name.replace("Scope", "").toLowerCase());
  };
  Scope2.prototype.runtime = function() {
    return this.root().runtime();
  };
  Scope2.prototype.setup = function() {
    return this._selfless = true;
  };
  Scope2.prototype.incr = function(name) {
    if (name === void 0)
      name = "i";
    var val = this._counters[name] || (this._counters[name] = 0);
    this._counters[name]++;
    return val;
  };
  Scope2.prototype.nextShortRef = function() {
    return AST.counterToShortRef(this._refcounter++);
  };
  Scope2.prototype.memovar = function(name, init) {
    this._memovars || (this._memovars = {});
    let item = this._memovars[name];
    if (!item) {
      item = this._memovars[name] = this.declare(item, init);
    }
    ;
    return item;
  };
  Scope2.prototype.meta = function(key, value) {
    if (value != void 0) {
      this._meta[key] = value;
      return this;
    }
    ;
    return this._meta[key];
  };
  Scope2.prototype.namepath = function() {
    return "?";
  };
  Scope2.prototype.tagCache = function() {
    return this._tagCache || (this._tagCache = this.declare("c$$", LIT("(" + this.runtime().renderContext + ".context||{})"), {
      system: true,
      temporary: true
    }));
  };
  Scope2.prototype.context = function() {
    if (!this._context) {
      if (this.selfless()) {
        this._context = this.parent().context().fromScope(this);
      } else {
        this._context = new ScopeContext(this);
      }
      ;
    }
    ;
    return this._context;
  };
  Scope2.prototype.traverse = function() {
    return this;
  };
  Scope2.prototype.visit = function() {
    if (this._parent) {
      return this;
    }
    ;
    this._parent = STACK.scope(1);
    this._level = STACK.scopes().length - 1;
    STACK.addScope(this);
    this.root().scopes().push(this);
    return this;
  };
  Scope2.prototype.wrap = function(scope2) {
    this._parent = scope2._parent;
    scope2._parent = this;
    return this;
  };
  Scope2.prototype.virtualize = function() {
    return this;
  };
  Scope2.prototype.root = function() {
    return STACK.ROOT;
    var scope2 = this;
    while (scope2) {
      if (scope2 instanceof RootScope) {
        return scope2;
      }
      ;
      scope2 = scope2.parent();
    }
    ;
    return null;
  };
  Scope2.prototype.register = function(name, decl, o) {
    if (decl === void 0)
      decl = null;
    if (o === void 0)
      o = {};
    if (!name) {
      o.system = true;
    }
    ;
    if (o.system) {
      return new (o.varclass || SystemVariable)(this, name, decl, o);
    }
    ;
    name = helpers2.symbolize(name);
    var existing = this._varmap.hasOwnProperty(name) && this._varmap[name];
    if (existing) {
      if (decl && existing.type() != "global") {
        decl.error("Cannot redeclare variable");
      }
      ;
    }
    ;
    if (existing && !o.unique && existing.type() != "global") {
      return existing;
    }
    ;
    let par = o.lookup && this.parent() && this.parent().lookup(name);
    var item = new (o.varclass || Variable)(this, name, decl, o);
    if (par) {
      item._parent = par;
    }
    ;
    if (!o.system && (!existing || existing.type() == "global")) {
      this._varmap[name] = item;
    }
    ;
    if (STACK.state() && STACK.state().variables instanceof Array) {
      STACK.state().variables.push(item);
    }
    ;
    return item;
  };
  Scope2.prototype.annotate = function(obj) {
    this._annotations.push(obj);
    return this;
  };
  Scope2.prototype.declare = function(name, init, o) {
    var declarator_;
    if (init === void 0)
      init = null;
    if (o === void 0)
      o = {};
    var variable = name instanceof Variable ? name : this.register(name, null, o);
    var dec = this._vars.add(variable, init);
    (declarator_ = variable.declarator()) || (variable.setDeclarator(dec), dec);
    return variable;
  };
  Scope2.prototype.reusevar = function(name) {
    return this.temporary(null, {reuse: true}, name);
  };
  Scope2.prototype.temporary = function(decl, o, name) {
    if (o === void 0)
      o = {};
    if (name === void 0)
      name = null;
    if (this._systemscope && this._systemscope != this) {
      return this._systemscope.temporary(decl, o, name);
    }
    ;
    name || (name = o.name);
    o.temporary = true;
    if (name && o.reuse && this._vars["_temp_" + name]) {
      return this._vars["_temp_" + name];
    }
    ;
    if (o.pool) {
      for (let i = 0, items = iter$7(this._varpool), len = items.length, v; i < len; i++) {
        v = items[i];
        if (v.pool() == o.pool && v.declarator() == null) {
          return v.reuse(decl);
        }
        ;
      }
      ;
    }
    ;
    var item = new SystemVariable(this, name, decl, o);
    this._varpool.push(item);
    this._vars.push(item);
    if (name && o.reuse) {
      this._vars["_temp_" + name] = item;
    }
    ;
    return item;
  };
  Scope2.prototype.lookup = function(name) {
    this._lookups || (this._lookups = {});
    var ret = null;
    name = helpers2.symbolize(name);
    if (this._varmap.hasOwnProperty(name)) {
      ret = this._varmap[name];
    } else {
      ret = this.parent() && this.parent().lookup(name);
      if (ret) {
        this._nonlocals || (this._nonlocals = {});
        this._nonlocals[name] = ret;
      }
      ;
    }
    ;
    return ret;
  };
  Scope2.prototype.requires = function(path, name) {
    if (name === void 0)
      name = "";
    return this.root().requires(path, name);
  };
  Scope2.prototype.imba = function() {
    if (!this._imba) {
      this.imbaDependency("core");
    }
    ;
    STACK.meta().universal = false;
    return this._imba || (this._imba = STACK.isNode() ? LIT("(this && this[" + this.root().symbolRef("#imba").c() + "] || globalThis[" + this.root().symbolRef("#imba").c() + "])") : LIT("imba"));
  };
  Scope2.prototype.imbaDependency = function() {
    var root_;
    var $0 = arguments, i = $0.length;
    var params = new Array(i > 0 ? i : 0);
    while (i > 0)
      params[i - 1] = $0[--i];
    return (root_ = this.root()).imbaDependency.apply(root_, params);
  };
  Scope2.prototype.autodeclare = function(variable) {
    return this.vars().add(variable);
  };
  Scope2.prototype.free = function(variable) {
    variable.free();
    return this;
  };
  Scope2.prototype.selfless = function() {
    return !!this._selfless;
  };
  Scope2.prototype.closure = function() {
    return this._closure;
  };
  Scope2.prototype.finalize = function() {
    return this;
  };
  Scope2.prototype.klass = function() {
    var scope2 = this;
    while (scope2) {
      scope2 = scope2.parent();
      if (scope2 instanceof ClassScope) {
        return scope2;
      }
      ;
    }
    ;
    return null;
  };
  Scope2.prototype.head = function() {
    return [this._vars, this._params];
  };
  Scope2.prototype.c = function(o) {
    var body;
    if (o === void 0)
      o = {};
    o.expression = false;
    this.node().body().setHead(this.head());
    return body = this.node().body().c(o);
  };
  Scope2.prototype.region = function() {
    return this.node().body().region();
  };
  Scope2.prototype.loc = function() {
    return this.node().loc();
  };
  Scope2.prototype.dump = function() {
    var self3 = this;
    var vars = Object.keys(self3._varmap).map(function(k) {
      var v = self3._varmap[k];
      return v.references().length ? AST.dump(v) : null;
    });
    var desc = {
      nr: self3._nr,
      type: self3.constructor.name,
      level: self3.level() || 0,
      vars: AST.compact(vars),
      loc: self3.loc()
    };
    return desc;
  };
  Scope2.prototype.toJSON = function() {
    return this.dump();
  };
  Scope2.prototype.toString = function() {
    return "" + this.constructor.name;
  };
  Scope2.prototype.closeScope = function() {
    return this;
  };
  function RootScope() {
    RootScope.prototype.__super__.constructor.apply(this, arguments);
    this.register("global", this, {type: "global"})._c = "globalThis";
    this.register("require", this, {type: "global"});
    this.register("import", this, {type: "global"});
    this.register("module", this, {type: "global"});
    this.register("window", this, {type: "global", varclass: WindowReference});
    this.setDocument(this.register("document", this, {type: "global", varclass: DocumentReference}));
    this.register("exports", this, {type: "global"});
    this.register("console", this, {type: "global"});
    this.register("process", this, {type: "global"});
    this.register("parseInt", this, {type: "global"});
    this.register("parseFloat", this, {type: "global"});
    this.register("setTimeout", this, {type: "global"});
    this.register("setInterval", this, {type: "global"});
    this.register("setImmediate", this, {type: "global"});
    this.register("clearTimeout", this, {type: "global"});
    this.register("clearInterval", this, {type: "global"});
    this.register("clearImmediate", this, {type: "global"});
    this.register("globalThis", this, {type: "global"});
    this.register("isNaN", this, {type: "global"});
    this.register("isFinite", this, {type: "global"});
    this.register("__dirname", this, {type: "global"});
    this.register("__filename", this, {type: "global"});
    this.register("__pure__", this, {type: "global", varclass: PureReference})._c = "/* @__PURE__ */";
    this.register("_", this, {type: "global"});
    this._requires = {};
    this._warnings = [];
    this._scopes = [];
    this._helpers = [];
    this._assets = {};
    this._selfless = true;
    this._implicitAccessors = [];
    this._entities = new RootEntities(this);
    this._object = Obj.wrap({});
    this._head = [this._vars];
    this._dependencies = {};
    this._symbolRefs = {};
    this._importProxies = {};
    this._vars.setSplit(true);
    this._imba = this.register("imba", this, {type: "global", varclass: ImbaRuntime, path: "imba"});
    this._runtime = this._imba.proxy();
    this;
  }
  subclass$(RootScope, Scope2);
  exports2.RootScope = RootScope;
  RootScope.prototype.warnings = function(v) {
    return this._warnings;
  };
  RootScope.prototype.setWarnings = function(v) {
    this._warnings = v;
    return this;
  };
  RootScope.prototype.scopes = function(v) {
    return this._scopes;
  };
  RootScope.prototype.setScopes = function(v) {
    this._scopes = v;
    return this;
  };
  RootScope.prototype.entities = function(v) {
    return this._entities;
  };
  RootScope.prototype.setEntities = function(v) {
    this._entities = v;
    return this;
  };
  RootScope.prototype.object = function(v) {
    return this._object;
  };
  RootScope.prototype.setObject = function(v) {
    this._object = v;
    return this;
  };
  RootScope.prototype.options = function(v) {
    return this._options;
  };
  RootScope.prototype.setOptions = function(v) {
    this._options = v;
    return this;
  };
  RootScope.prototype.assets = function(v) {
    return this._assets;
  };
  RootScope.prototype.setAssets = function(v) {
    this._assets = v;
    return this;
  };
  RootScope.prototype.document = function(v) {
    return this._document;
  };
  RootScope.prototype.setDocument = function(v) {
    this._document = v;
    return this;
  };
  RootScope.prototype.importProxy = function(name, path) {
    return this._importProxies[name] || (this._importProxies[name] = this.register("$" + name + "$", this, {type: "global", varclass: ImportProxy, path: path || name}));
  };
  RootScope.prototype.runtime = function() {
    return this._runtime;
  };
  RootScope.prototype.use = function(item) {
    return this._imba.touch(item);
  };
  RootScope.prototype.sourceId = function() {
    return this._sourceId || (this._sourceId = STACK.sourceId());
  };
  RootScope.prototype.sfco = function() {
    return this._sfco || (this._sfco = this.declare("sfc$", LIT("{/*$sfc$*/}")));
  };
  RootScope.prototype.context = function() {
    return this._context || (this._context = new RootScopeContext(this));
  };
  RootScope.prototype.globalRef = function() {
    return this._globalRef || (this._globalRef = LIT("globalThis"));
  };
  RootScope.prototype.activateExports = function() {
    if (STACK.cjs() && !this._hasExports) {
      this._hasExports = true;
      return this._head.push(LIT('Object.defineProperty(exports, "__esModule", {value: true});'));
    }
    ;
  };
  RootScope.prototype.lookupAsset = function(name, kind) {
    if (kind === void 0)
      kind = "asset";
    return this.registerAsset(name, kind);
  };
  RootScope.prototype.registerAsset = function(path, kind, asset) {
    let key = path + kind;
    if (this._assets[key]) {
      return this._assets[key];
    }
    ;
    return this._assets[key] = asset || {
      path,
      kind,
      external: true,
      ref: this.register("asset", null, {system: true})
    };
  };
  RootScope.prototype.lookup = function(name) {
    name = helpers2.symbolize(name);
    if (this._varmap.hasOwnProperty(name)) {
      return this._varmap[name];
    }
    ;
  };
  RootScope.prototype.visit = function() {
    STACK.addScope(this);
    return this;
  };
  RootScope.prototype.helper = function(typ, value) {
    if (this._helpers.indexOf(value) == -1) {
      this._helpers.push(value);
    }
    ;
    return this;
  };
  RootScope.prototype.head = function() {
    return this._head;
  };
  RootScope.prototype.dump = function() {
    var obj = {
      autoself: this._implicitAccessors.map(function(s) {
        return s.dump();
      })
    };
    if (OPTS.analysis.scopes) {
      var scopes = this._scopes.map(function(s) {
        return s.dump();
      });
      scopes.unshift(RootScope.prototype.__super__.dump.call(this));
      obj.scopes = scopes;
    }
    ;
    if (OPTS.analysis.entities) {
      obj.entities = this._entities;
    }
    ;
    return obj;
  };
  RootScope.prototype.requires = function(path, name) {
    var variable, declarator_;
    if (variable = this.lookup(name)) {
      return variable;
    }
    ;
    if (variable = this._requires[name]) {
      if (variable._requirePath != path) {
        throw new Error("" + name + " is already defined as require('" + variable._requirePath + "')");
      }
      ;
      return variable;
    }
    ;
    var req = new Require(new Str("'" + path + "'"));
    variable = new Variable(this, name, null, {system: true});
    var dec = this._vars.add(variable, req);
    (declarator_ = variable.declarator()) || (variable.setDeclarator(dec), dec);
    variable._requirePath = path;
    this._requires[name] = variable;
    return variable;
  };
  RootScope.prototype.imba = function() {
    return this._imba;
  };
  RootScope.prototype.imbaDependency = function(path) {
    return;
  };
  RootScope.prototype.symbolRef = function(name) {
    let map = this._symbolRefs;
    return map[name] || (map[name] = this.declare("" + String(name).replace(/[\@\#]/g, "_") + "$", LIT("Symbol.for('" + name + "')"), {type: "const", system: true}));
  };
  RootScope.prototype.c = function(o) {
    if (o === void 0)
      o = {};
    o.expression = false;
    let body = this.node().body().c(o);
    let assetCount = Object.keys(this.assets()).length;
    if (assetCount) {
      this.head().push(LIT("// ASSETS-START"));
    }
    ;
    for (let o1 = this.assets(), asset, i = 0, keys = Object.keys(o1), l = keys.length, name; i < l; i++) {
      name = keys[i];
      asset = o1[name];
      try {
        if (asset.external) {
          let ref = asset.ref.c();
          let path = asset.path;
          this.head().push(LIT("import " + ref + " from " + MP("'" + path + "?" + (asset.kind || "asset") + "'")));
        } else {
          let parsed = parseAsset(asset, name);
          let body2 = JSON.stringify(parsed);
          let out2 = "imba.registerAsset('" + name + "'," + body2 + ")";
          this.head().push(LIT(out2));
        }
        ;
      } catch (e) {
      }
      ;
    }
    ;
    if (assetCount) {
      this.head().push(LIT("// ASSETS-END"));
    }
    ;
    let pre = new Block([]);
    pre.setHead(this.head());
    let out = pre.c(o) + "\n" + body;
    if (len$(this._helpers)) {
      out = AST.cary(this._helpers).join(";\n") + "\n" + out;
    }
    ;
    return out;
  };
  function ModuleScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(ModuleScope, Scope2);
  exports2.ModuleScope = ModuleScope;
  ModuleScope.prototype.setup = function() {
    return this._selfless = false;
  };
  ModuleScope.prototype.namepath = function() {
    return this._node.namepath();
  };
  function ClassScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(ClassScope, Scope2);
  exports2.ClassScope = ClassScope;
  ClassScope.prototype.setup = function() {
    return this._selfless = false;
  };
  ClassScope.prototype.namepath = function() {
    return this._node.namepath();
  };
  ClassScope.prototype.virtualize = function() {
    var up = this.parent();
    for (let o = this._varmap, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++) {
      k = keys[i];
      v = o[k];
      v.resolve(up, true);
    }
    ;
    return this;
  };
  ClassScope.prototype.prototype = function() {
    return this._prototype || (this._prototype = new ValueNode2(OP(".", this.context(), "prototype")));
  };
  function TagScope() {
    return ClassScope.apply(this, arguments);
  }
  subclass$(TagScope, ClassScope);
  exports2.TagScope = TagScope;
  function ClosureScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(ClosureScope, Scope2);
  exports2.ClosureScope = ClosureScope;
  function FunctionScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(FunctionScope, Scope2);
  exports2.FunctionScope = FunctionScope;
  function IsolatedFunctionScope() {
    return FunctionScope.apply(this, arguments);
  }
  subclass$(IsolatedFunctionScope, FunctionScope);
  exports2.IsolatedFunctionScope = IsolatedFunctionScope;
  IsolatedFunctionScope.prototype.lookup = function(name) {
    this._lookups || (this._lookups = {});
    var ret = null;
    name = helpers2.symbolize(name);
    if (this._varmap.hasOwnProperty(name)) {
      ret = this._varmap[name];
    } else {
      ret = this.parent() && this.parent().lookup(name);
      if (ret && ret.closure() == this.parent().closure()) {
        this._leaks || (this._leaks = new Map());
        this._nonlocals || (this._nonlocals = {});
        this._nonlocals[name] = ret;
        let shadow = this._leaks.get(ret);
        if (!shadow) {
          this._leaks.set(ret, shadow = new ShadowedVariable(this, name, ret));
        }
        ;
        ret = shadow;
      }
      ;
    }
    ;
    return ret;
  };
  function MethodScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(MethodScope, Scope2);
  exports2.MethodScope = MethodScope;
  MethodScope.prototype.setup = function() {
    return this._selfless = false;
  };
  function FieldScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(FieldScope, Scope2);
  exports2.FieldScope = FieldScope;
  FieldScope.prototype.setup = function() {
    return this._selfless = false;
  };
  FieldScope.prototype.mergeScopeInto = function(other) {
    for (let o = this._varmap, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++) {
      k = keys[i];
      v = o[k];
      if (k == "self") {
        continue;
      }
      ;
      v.resolve(other, true);
      other.declare(v);
    }
    ;
    if (this._context && this._context._reference) {
      this._context._reference = other.context().reference();
    }
    ;
    return true;
  };
  function LambdaScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(LambdaScope, Scope2);
  exports2.LambdaScope = LambdaScope;
  LambdaScope.prototype.context = function() {
    if (!this._context) {
      this._context = this.parent().context().fromScope(this);
    }
    ;
    return this._context;
  };
  function FlowScope() {
    return Scope2.apply(this, arguments);
  }
  subclass$(FlowScope, Scope2);
  exports2.FlowScope = FlowScope;
  FlowScope.prototype.params = function() {
    if (this._parent) {
      return this._parent.params();
    }
    ;
  };
  FlowScope.prototype.register = function(name, decl, o) {
    var found;
    if (decl === void 0)
      decl = null;
    if (o === void 0)
      o = {};
    if (o.type != "let" && o.type != "const" && this.closure() != this) {
      if (found = this.lookup(name)) {
        if (found.type() == "let") {
          if (decl) {
            decl.warn("Variable already exists in block");
          }
          ;
        }
        ;
      }
      ;
      return this.closure().register(name, decl, o);
    } else {
      return FlowScope.prototype.__super__.register.call(this, name, decl, o);
    }
    ;
  };
  FlowScope.prototype.autodeclare = function(variable) {
    return this.parent().autodeclare(variable);
  };
  FlowScope.prototype.closure = function() {
    return this._parent.closure();
  };
  FlowScope.prototype.context = function() {
    return this._context || (this._context = this.parent().context());
  };
  FlowScope.prototype.closeScope = function() {
    if (this._context) {
      this._context.reference();
    }
    ;
    return this;
  };
  FlowScope.prototype.temporary = function(refnode, o, name) {
    if (o === void 0)
      o = {};
    if (name === void 0)
      name = null;
    return (this._systemscope || this.parent()).temporary(refnode, o, name);
  };
  function CatchScope() {
    return FlowScope.apply(this, arguments);
  }
  subclass$(CatchScope, FlowScope);
  exports2.CatchScope = CatchScope;
  function WhileScope() {
    return FlowScope.apply(this, arguments);
  }
  subclass$(WhileScope, FlowScope);
  exports2.WhileScope = WhileScope;
  WhileScope.prototype.autodeclare = function(variable) {
    return this.vars().add(variable);
  };
  function ForScope() {
    return FlowScope.apply(this, arguments);
  }
  subclass$(ForScope, FlowScope);
  exports2.ForScope = ForScope;
  ForScope.prototype.autodeclare = function(variable) {
    return this.vars().add(variable);
  };
  function IfScope() {
    return FlowScope.apply(this, arguments);
  }
  subclass$(IfScope, FlowScope);
  exports2.IfScope = IfScope;
  function BlockScope() {
    return FlowScope.apply(this, arguments);
  }
  subclass$(BlockScope, FlowScope);
  exports2.BlockScope = BlockScope;
  BlockScope.prototype.region = function() {
    return this.node().region();
  };
  function Variable(scope2, name, decl, o) {
    this._ref = STACK._counter++;
    this._c = null;
    this._scope = scope2;
    this._name = name;
    this._alias = null;
    this._initialized = true;
    this._declarator = decl;
    this._autodeclare = false;
    this._declared = o && o.declared || false;
    this._datatype = o && o.datatype;
    this._resolved = false;
    this._options = o || {};
    this._type = o && o.type || "var";
    this._export = false;
    this._references = [];
    this._assignments = [];
    this;
  }
  subclass$(Variable, Node2);
  exports2.Variable = Variable;
  Variable.prototype.scope = function(v) {
    return this._scope;
  };
  Variable.prototype.setScope = function(v) {
    this._scope = v;
    return this;
  };
  Variable.prototype.name = function(v) {
    return this._name;
  };
  Variable.prototype.setName = function(v) {
    this._name = v;
    return this;
  };
  Variable.prototype.alias = function(v) {
    return this._alias;
  };
  Variable.prototype.setAlias = function(v) {
    this._alias = v;
    return this;
  };
  Variable.prototype.type = function(v) {
    return this._type;
  };
  Variable.prototype.setType = function(v) {
    this._type = v;
    return this;
  };
  Variable.prototype.options = function(v) {
    return this._options;
  };
  Variable.prototype.setOptions = function(v) {
    this._options = v;
    return this;
  };
  Variable.prototype.initialized = function(v) {
    return this._initialized;
  };
  Variable.prototype.setInitialized = function(v) {
    this._initialized = v;
    return this;
  };
  Variable.prototype.declared = function(v) {
    return this._declared;
  };
  Variable.prototype.setDeclared = function(v) {
    this._declared = v;
    return this;
  };
  Variable.prototype.declarator = function(v) {
    return this._declarator;
  };
  Variable.prototype.setDeclarator = function(v) {
    this._declarator = v;
    return this;
  };
  Variable.prototype.autodeclare = function(v) {
    return this._autodeclare;
  };
  Variable.prototype.setAutodeclare = function(v) {
    this._autodeclare = v;
    return this;
  };
  Variable.prototype.references = function(v) {
    return this._references;
  };
  Variable.prototype.setReferences = function(v) {
    this._references = v;
    return this;
  };
  Variable.prototype.export = function(v) {
    return this._export;
  };
  Variable.prototype.setExport = function(v) {
    this._export = v;
    return this;
  };
  Variable.prototype.value = function(v) {
    return this._value;
  };
  Variable.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  Variable.prototype.datatype = function(v) {
    return this._datatype;
  };
  Variable.prototype.setDatatype = function(v) {
    this._datatype = v;
    return this;
  };
  Variable.prototype.pool = function() {
    return null;
  };
  Variable.prototype.closure = function() {
    return this._scope.closure();
  };
  Variable.prototype.assignments = function() {
    return this._assignments;
  };
  Variable.prototype.assigned = function(val, source) {
    this._assignments.push(val);
    if (val instanceof Arr) {
      this._isArray = true;
    } else {
      this._isArray = false;
    }
    ;
    return this;
  };
  Variable.prototype.parents = function() {
    let parents = [];
    let scope2 = this.closure().parent();
    let res = this;
    while (scope2 && res && parents.length < 5) {
      console.log("get parents!!!");
      if (res = scope2.lookup(this._name)) {
        parents.unshift(res);
        let newscope = res.scope().parent();
        if (scope2 == newscope) {
          break;
        }
        ;
        scope2 = newscope;
      }
      ;
    }
    ;
    return parents;
  };
  Variable.prototype.resolve = function(scope2, force) {
    if (scope2 === void 0)
      scope2 = this.scope();
    if (force === void 0)
      force = false;
    if (this._resolved && !force) {
      return this;
    }
    ;
    this._resolved = true;
    var closure = this._scope.closure();
    var item = this._shadowing || scope2.lookup(this._name);
    if (this._scope != closure && this._type == "let" && this._virtual) {
      item = closure.lookup(this._name);
      scope2 = closure;
    }
    ;
    if (item == this) {
      scope2.varmap()[this._name] = this;
      return this;
    } else if (item) {
      if (item.scope() != scope2 && (this.options().let || this._type == "let")) {
        scope2.varmap()[this._name] = this;
        if (!this._virtual && !this._shadowing) {
          return this;
        }
        ;
      }
      ;
      if (this._options.proxy) {
        true;
      } else {
        var i = 0;
        var orig = this._name;
        while (scope2.lookup(this._name)) {
          this._name = "" + orig + (i += 1);
        }
        ;
      }
      ;
    }
    ;
    scope2.varmap()[this._name] = this;
    closure.varmap()[this._name] = this;
    return this;
  };
  Variable.prototype.reference = function() {
    return this;
  };
  Variable.prototype.node = function() {
    return this;
  };
  Variable.prototype.cache = function() {
    return this;
  };
  Variable.prototype.traverse = function() {
    return this;
  };
  Variable.prototype.free = function(ref) {
    this._declarator = null;
    return this;
  };
  Variable.prototype.reuse = function(ref) {
    this._declarator = ref;
    return this;
  };
  Variable.prototype.proxy = function(par, index) {
    this._proxy = [par, index];
    return this;
  };
  Variable.prototype.refcount = function() {
    return this._references.length;
  };
  Variable.prototype.c = function(params) {
    if (params && params.as == "field") {
      return "[" + this.c({}) + "]";
    }
    ;
    if (this._c) {
      return this._c;
    }
    ;
    if (this._proxy) {
      if (this._proxy instanceof Node2) {
        this._c = this._proxy.c();
      } else {
        this._c = this._proxy[0].c();
        if (this._proxy[1]) {
          this._c += "[" + this._proxy[1].c() + "]";
        }
        ;
      }
      ;
    } else {
      if (!this._resolved)
        this.resolve();
      var v = this.alias() || this.name();
      this._c = typeof v == "string" ? v : v.c();
      if (RESERVED_REGEX.test(this._c)) {
        this._c = "" + this.c() + "$";
      }
      ;
    }
    ;
    return this._c;
  };
  Variable.prototype.js = function() {
    return this.c();
  };
  Variable.prototype.consume = function(node) {
    return this;
  };
  Variable.prototype.accessor = function(ref) {
    var node = new LocalVarAccess(".", null, this);
    return node;
  };
  Variable.prototype.assignment = function(val) {
    return new Assign("=", this, val);
  };
  Variable.prototype.addReference = function(ref) {
    if (ref instanceof Identifier) {
      ref.references(this);
    }
    ;
    if (ref.region && ref.region()) {
      this._references.push(ref);
      if (ref.scope__() != this._scope) {
        this._noproxy = true;
      }
      ;
    }
    ;
    return this;
  };
  Variable.prototype.autodeclare = function() {
    if (this._declared) {
      return this;
    }
    ;
    this._autodeclare = true;
    this.scope().autodeclare(this);
    this._declared = true;
    return this;
  };
  Variable.prototype.predeclared = function() {
    this._declared = true;
    return this;
  };
  Variable.prototype.toString = function() {
    return String(this.name());
  };
  Variable.prototype.dump = function(typ) {
    var name = this.name();
    if (name[0].match(/[A-Z]/)) {
      return null;
    }
    ;
    return {
      type: this.type(),
      name,
      refs: AST.dump(this._references, typ)
    };
  };
  function SystemVariable() {
    return Variable.apply(this, arguments);
  }
  subclass$(SystemVariable, Variable);
  exports2.SystemVariable = SystemVariable;
  SystemVariable.prototype.pool = function() {
    return this._options.pool;
  };
  SystemVariable.prototype.predeclared = function() {
    this.scope().vars().remove(this);
    return this;
  };
  SystemVariable.prototype.resolve = function() {
    var nodealias;
    if (this._resolved) {
      return this;
    }
    ;
    this._resolved = true;
    let o = this._options;
    var alias = o.alias || this._name;
    var typ = o.pool;
    var names = [].concat(o.names);
    var alt = null;
    var node = null;
    this._name = null;
    var scope2 = this.scope();
    if (o.temporary && !o.alias) {
      let i = 0;
      this._name = "$" + i;
      while (scope2.lookup(this._name)) {
        this._name = "$" + (i += 1);
      }
      ;
    }
    ;
    if (!o.alias || true) {
      let name = this._name || o.alias || "sys";
      if (/\d/.test(name[0])) {
        name = "_" + name;
      }
      ;
      let nr = STACK.incr(name);
      this._name = "" + name + "$" + nr;
      return this;
    }
    ;
    if (typ == "tag") {
      let i = 0;
      while (!this._name) {
        alt = "t" + i++;
        if (!scope2.lookup(alt)) {
          this._name = alt;
        }
        ;
      }
      ;
    } else if (typ == "iter") {
      names = ["ary__", "ary_", "coll", "array", "items", "ary"];
    } else if (typ == "val") {
      names = ["v_"];
    } else if (typ == "arguments") {
      names = ["$_", "$0"];
    } else if (typ == "counter") {
      names = ["i__", "i_", "k", "j", "i"];
    } else if (typ == "len") {
      names = ["len__", "len_", "len"];
    } else if (typ == "list") {
      names = ["tmplist_", "tmplist", "tmp"];
    }
    ;
    if (alias) {
      names.push(alias);
    }
    ;
    while (!this._name && (alt = names.pop())) {
      let foundAlt = scope2.lookup("$" + alt);
      if (!foundAlt) {
        this._name = "$" + alt;
      }
      ;
    }
    ;
    if (!this._name && this._declarator) {
      if (node = this.declarator().node()) {
        if (nodealias = node.alias()) {
          names.push(nodealias);
        }
        ;
      }
      ;
    }
    ;
    while (!this._name && (alt = names.pop())) {
      if (!scope2.lookup("$" + alt)) {
        this._name = "$" + alt;
      }
      ;
    }
    ;
    if (!this._name) {
      let i = 0;
      this._name = "$" + (alias || "") + i;
      while (scope2.lookup(this._name)) {
        this._name = "$" + (alias || "") + (i += 1);
      }
      ;
    }
    ;
    scope2.varmap()[this._name] = this;
    if (this.type() != "let" || this._virtual) {
      this.closure().varmap()[this._name] = this;
    }
    ;
    return this;
  };
  SystemVariable.prototype.name = function() {
    this.resolve();
    return this._name;
  };
  function ShadowedVariable() {
    return Variable.apply(this, arguments);
  }
  subclass$(ShadowedVariable, Variable);
  exports2.ShadowedVariable = ShadowedVariable;
  function GlobalReference() {
    return Variable.apply(this, arguments);
  }
  subclass$(GlobalReference, Variable);
  exports2.GlobalReference = GlobalReference;
  function PureReference() {
    return Variable.apply(this, arguments);
  }
  subclass$(PureReference, Variable);
  exports2.PureReference = PureReference;
  function ZonedVariable() {
    return GlobalReference.apply(this, arguments);
  }
  subclass$(ZonedVariable, GlobalReference);
  exports2.ZonedVariable = ZonedVariable;
  ZonedVariable.prototype.forScope = function(scope2) {
    return new ZonedVariableAccess(this, scope2);
  };
  ZonedVariable.prototype.c = function() {
    return "" + this._name;
  };
  function DocumentReference() {
    return ZonedVariable.apply(this, arguments);
  }
  subclass$(DocumentReference, ZonedVariable);
  exports2.DocumentReference = DocumentReference;
  DocumentReference.prototype.forScope = function(scope2) {
    return this;
  };
  DocumentReference.prototype.c = function() {
    if (STACK.isNode()) {
      return "" + this.runtime().get_document + "()";
    } else {
      return "globalThis.document";
    }
    ;
  };
  function WindowReference() {
    return GlobalReference.apply(this, arguments);
  }
  subclass$(WindowReference, GlobalReference);
  exports2.WindowReference = WindowReference;
  WindowReference.prototype.c = function() {
    if (STACK.isNode()) {
      return "" + this.runtime().get_window + "()";
    } else {
      return "window";
    }
    ;
  };
  function ZonedVariableAccess(variable, scope2) {
    this._variable = variable;
    this._scope = scope2;
  }
  subclass$(ZonedVariableAccess, Node2);
  exports2.ZonedVariableAccess = ZonedVariableAccess;
  ZonedVariableAccess.prototype.c = function() {
    let name = this._variable._name;
    if (STACK.isNode()) {
      STACK.use("use_" + name);
      return "" + this.runtime().zone + ".get('" + name + "'," + this._scope.context().c() + ")";
    } else {
      return "" + name;
    }
    ;
  };
  function ImportProxy() {
    var self3 = this;
    ImportProxy.prototype.__super__.constructor.apply(self3, arguments);
    self3._path = self3._options.path;
    self3._exports = {};
    self3._touched = {};
    self3._head = LIT("import ");
    self3._head.c = self3.head.bind(self3);
    self3.scope()._head.push(self3._head);
    var getter = function(t, p, r) {
      return self3.access(p);
    };
    self3._proxy = new Proxy(self3, {get: getter});
  }
  subclass$(ImportProxy, Variable);
  exports2.ImportProxy = ImportProxy;
  ImportProxy.prototype.proxy = function(v) {
    return this._proxy;
  };
  ImportProxy.prototype.setProxy = function(v) {
    this._proxy = v;
    return this;
  };
  ImportProxy.prototype.path = function(v) {
    return this._path;
  };
  ImportProxy.prototype.setPath = function(v) {
    this._path = v;
    return this;
  };
  ImportProxy.prototype.touch = function(key) {
    if (!this._touched[key]) {
      this._touched[key] = this.access(key);
    }
    ;
    return this;
  };
  ImportProxy.prototype.head = function() {
    var self3 = this;
    let keys = Object.keys(self3._exports);
    let touches = Object.values(self3._touched);
    let js = [];
    let cjs = STACK.cjs();
    let path = self3.path();
    if (path == "imba") {
      path = STACK.imbaPath() || "imba";
    }
    ;
    let pathjs = MP("'" + path + "'");
    if (self3._importAll) {
      if (cjs) {
        js.push("const " + self3._name + " = require(" + pathjs + ");");
      } else {
        js.push("import * as " + self3._name + " from " + pathjs + ";");
      }
      ;
    }
    ;
    if (keys.length > 0) {
      if (cjs) {
        let out = keys.map(function(a) {
          return "" + a + ": " + self3._exports[a];
        }).join(", ");
        js.push("const {" + out + "} = require(" + pathjs + ");");
      } else {
        let out = keys.map(function(a) {
          return "" + a + " as " + self3._exports[a];
        }).join(", ");
        js.push("import {" + out + "} from " + pathjs + ";");
      }
      ;
    }
    ;
    if (touches.length) {
      js.push("(" + touches.map(function(_0) {
        return _0.c();
      }).join(",") + ");");
    }
    ;
    return js.length ? js.join("\n") : "";
  };
  ImportProxy.prototype.access = function(key) {
    let raw = C(key, {mark: false});
    if (this._globalName) {
      return LIT("" + this._globalName + "." + raw);
    }
    ;
    return this._exports[raw] || (this._exports[raw] = LIT("" + this._name + "_" + raw));
  };
  function ImbaRuntime() {
    return ImportProxy.apply(this, arguments);
  }
  subclass$(ImbaRuntime, ImportProxy);
  exports2.ImbaRuntime = ImbaRuntime;
  ImbaRuntime.prototype.configure = function(options) {
    if (options.runtime == "global") {
      this._globalName = "imba";
    } else if (options.runtime) {
      this.setPath(options.runtime);
    }
    ;
    return this;
  };
  ImbaRuntime.prototype.c = function() {
    if (!this._importAll) {
      this._importAll = true;
      STACK.current().warn("Referencing imba directly disables efficient tree-shaking");
    }
    ;
    return this._c = "imba";
  };
  function ScopeContext(scope2, value) {
    this._scope = scope2;
    this._value = value;
    this._reference = null;
    this;
  }
  subclass$(ScopeContext, Node2);
  exports2.ScopeContext = ScopeContext;
  ScopeContext.prototype.scope = function(v) {
    return this._scope;
  };
  ScopeContext.prototype.setScope = function(v) {
    this._scope = v;
    return this;
  };
  ScopeContext.prototype.value = function(v) {
    return this._value;
  };
  ScopeContext.prototype.setValue = function(v) {
    this._value = v;
    return this;
  };
  ScopeContext.prototype.reference = function(v) {
    return this._reference;
  };
  ScopeContext.prototype.setReference = function(v) {
    this._reference = v;
    return this;
  };
  ScopeContext.prototype.namepath = function() {
    return this._scope.namepath();
  };
  ScopeContext.prototype.reference = function() {
    return this._reference || (this._reference = this.scope().declare("self", new This()));
  };
  ScopeContext.prototype.fromScope = function(other) {
    return new IndirectScopeContext(other, this);
  };
  ScopeContext.prototype.c = function() {
    var val = this._value;
    return val ? val.c() : "this";
  };
  ScopeContext.prototype.cache = function() {
    return this;
  };
  ScopeContext.prototype.proto = function() {
    return "" + this.c() + ".prototype";
  };
  ScopeContext.prototype.isGlobalContext = function() {
    return false;
  };
  function IndirectScopeContext(scope2, parent) {
    this._scope = scope2;
    this._parent = parent;
    this._reference = parent.reference();
  }
  subclass$(IndirectScopeContext, ScopeContext);
  exports2.IndirectScopeContext = IndirectScopeContext;
  IndirectScopeContext.prototype.reference = function() {
    return this._reference;
  };
  IndirectScopeContext.prototype.c = function() {
    return this.reference().c();
  };
  IndirectScopeContext.prototype.isGlobalContext = function() {
    return this._parent.isGlobalContext();
  };
  function RootScopeContext() {
    return ScopeContext.apply(this, arguments);
  }
  subclass$(RootScopeContext, ScopeContext);
  exports2.RootScopeContext = RootScopeContext;
  RootScopeContext.prototype.reference = function() {
    return this._reference || (this._reference = this.scope().lookup("global"));
  };
  RootScopeContext.prototype.c = function(o) {
    return "globalThis";
    var val = this.reference();
    return val && val != this ? val.c() : "this";
  };
  RootScopeContext.prototype.isGlobalContext = function() {
    return true;
  };
  function Super(keyword, member) {
    this._keyword = keyword;
    this._member = member;
    Super.prototype.__super__.constructor.apply(this, arguments);
  }
  subclass$(Super, Node2);
  exports2.Super = Super;
  Super.prototype.member = function(v) {
    return this._member;
  };
  Super.prototype.setMember = function(v) {
    this._member = v;
    return this;
  };
  Super.prototype.args = function(v) {
    return this._args;
  };
  Super.prototype.setArgs = function(v) {
    this._args = v;
    return this;
  };
  Super.prototype.visit = function() {
    var m;
    this._method = STACK.method();
    this._up = STACK.parent();
    if (m = STACK.method()) {
      m.set({supr: {node: STACK.blockpart(), block: STACK.block(), real: this}});
      m.set({injectInitAfter: STACK.blockpart()});
    }
    ;
    return this;
  };
  Super.prototype.replaceWithInitor = function() {
    if (this.up() instanceof Call) {
      return true;
    }
    ;
  };
  Super.prototype.startLoc = function() {
    return this._keyword && this._keyword.startLoc();
  };
  Super.prototype.endLoc = function() {
    return this._keyword && this._keyword.endLoc();
  };
  Super.callOp = function(name) {
    let op = OP(".", LIT("super"), name);
    return CALL(op, [LIT("arguments[0]")]);
  };
  Super.prototype.c = function() {
    let m = this._method;
    let up = this._up;
    let sup = LIT("super");
    let op;
    let top = this.option("top");
    let virtual = m && m.option("inExtension");
    let args = this.args();
    if (!(up instanceof Access || up instanceof Call)) {
      if (m && m.isConstructor() && !this.member()) {
        let target = this.option("target") || LIT("super");
        let fallbackArgs = this.option("args") || [LIT("...arguments")];
        return CALL(target, args || fallbackArgs).c();
        op = LIT("super(...arguments)");
      } else if (m && virtual) {
        op = CALL(OP(".", this.slf(), "super$"), [m.name().toStr()]);
        if (m.isSetter()) {
          op = CALL(OP(".", this.slf(), "super$set"), [m.name().toStr(), m.params().at(0)]);
        } else if (!m.isGetter()) {
          op = CALL(OP(".", op, "apply"), [this.slf(), LIT("arguments")]);
        }
        ;
      } else if (this.member()) {
        op = OP(".", sup, this.member());
      } else if (m) {
        op = OP(".", sup, m.name());
        if (m.isSetter()) {
          op = OP("=", op, m.params().at(0));
        } else if (!m.isGetter()) {
          args || (args = [LIT("...arguments")]);
        }
        ;
      }
      ;
      if (args) {
        op = CALL(op, args);
      }
      ;
      return op ? M2(op.c({mark: false}), this) : "/**/";
    }
    ;
    if (up instanceof Call && m && !m.isConstructor()) {
      return OP(".", sup, m.name()).c();
    }
    ;
    return "super";
  };
  var BR0 = exports2.BR0 = new Newline("\n");
  var BR = exports2.BR = new Newline("\n");
  var BR2 = exports2.BR2 = new Newline("\n\n");
  var SELF = exports2.SELF = new Self();
  var THIS = exports2.THIS = LIT("this");
  var PROTO = exports2.PROTO = LIT("this.prototype");
  var TRUE = exports2.TRUE = new True("true");
  var FALSE = exports2.FALSE = new False("false");
  var UNDEFINED = exports2.UNDEFINED = new Undefined();
  var NIL = exports2.NIL = new Nil();
  var ARGUMENTS = exports2.ARGUMENTS = new ArgsReference("arguments");
  var EMPTY = exports2.EMPTY = "";
  var NULL = exports2.NULL = "null";
  var RESERVED = exports2.RESERVED = ["default", "native", "enum", "with"];
  var RESERVED_REGEX = exports2.RESERVED_REGEX = /^(default|native|enum|with|new|char)$/;
});

// src/compiler/imbaconfig.imba
var require_imbaconfig = __commonJS((exports2) => {
  __export(exports2, {
    resolveConfigFile: () => resolveConfigFile2
  });
  function iter$7(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var cached = {};
  function resolvePaths(obj, cwd) {
    var $0$1;
    if (obj instanceof Array) {
      for (let i = 0, sys$14 = iter$7(obj), sys$22 = sys$14.length; i < sys$22; i++) {
        let item = sys$14[i];
        obj[i] = resolvePaths(item, cwd);
      }
      ;
    } else if (typeof obj == "string") {
      return obj.replace(/^\.\//, cwd + "/");
    } else if (typeof obj == "object") {
      for (let sys$32 = 0, sys$4 = Object.keys(obj), sys$5 = sys$4.length, k, v; sys$32 < sys$5; sys$32++) {
        k = sys$4[sys$32];
        v = obj[k];
        let alt = k.replace(/^\.\//, cwd + "/");
        obj[alt] = resolvePaths(v, cwd);
        if (alt != k) {
          $0$1 = obj[k], delete obj[k], $0$1;
        }
        ;
      }
      ;
    }
    ;
    return obj;
  }
  function resolveConfigFile2(dir, {path, fs}) {
    if (!path || !fs || !dir || dir == path.dirname(dir)) {
      return null;
    }
    ;
    let src = path.resolve(dir, "package.json");
    if (cached[src]) {
      return cached[src];
    }
    ;
    if (cached[src] !== null && fs.existsSync(src)) {
      let resolver = function(key, value) {
        if (typeof value == "string" && value.match(/^\.\//)) {
          return path.resolve(dir, value);
        }
        ;
        return value;
      };
      let package2 = JSON.parse(fs.readFileSync(src, "utf8"));
      let config = package2.imba || (package2.imba = {});
      resolvePaths(config, dir);
      config.package = package2;
      config.cwd || (config.cwd = dir);
      let assetsDir = path.resolve(dir, "assets");
      let assets = config.assets || (config.assets = {});
      if (fs.existsSync(assetsDir)) {
        const entries = fs.readdirSync(assetsDir);
        for (let sys$6 = 0, sys$7 = iter$7(entries), sys$8 = sys$7.length; sys$6 < sys$8; sys$6++) {
          let entry = sys$7[sys$6];
          if (!entry.match(/\.svg/)) {
            continue;
          }
          ;
          let src2 = path.resolve(assetsDir, entry);
          let name = path.basename(src2, ".svg");
          let body = fs.readFileSync(src2, "utf8");
          assets[name] = {body};
        }
        ;
      }
      ;
      return cached[src] = config;
    } else {
      cached[src] = null;
    }
    ;
    return resolveConfigFile2(path.dirname(dir), {path, fs});
  }
});

// src/compiler/compiler.imba1
var self = {};
var T = require_token();
var util3 = require_helpers();

// src/program/structures.imba
var sys$1 = Symbol.for("#init");
var sys$2 = Symbol.for("#source");
var sys$3 = Symbol.for("#lineText");
var DOCMAP = new WeakMap();
var Position = class {
  [sys$1]($$ = null) {
    this.line = $$ ? $$.line : void 0;
    this.character = $$ ? $$.character : void 0;
    this.offset = $$ ? $$.offset : void 0;
  }
  constructor(l, c, o) {
    this[sys$1]();
    this.line = l;
    this.character = c;
    this.offset = o;
  }
};
var Range = class {
  [sys$1]($$ = null) {
    this.start = $$ ? $$.start : void 0;
    this.end = $$ ? $$.end : void 0;
  }
  constructor(start, end) {
    this[sys$1]();
    this.start = start;
    this.end = end;
  }
  get offset() {
    return this.start.offset;
  }
  get length() {
    return this.end.offset - this.start.offset;
  }
};
var DiagnosticSeverity = {
  Error: 1,
  Warning: 2,
  Information: 3,
  Hint: 4,
  error: 1,
  warning: 2,
  warn: 2,
  info: 3,
  hint: 4
};
var Diagnostic = class {
  constructor(data, doc = null) {
    this.range = data.range;
    this.severity = DiagnosticSeverity[data.severity] || data.severity;
    this.code = data.code;
    this.source = data.source;
    this.message = data.message;
    DOCMAP.set(this, doc);
  }
  get [sys$2]() {
    return DOCMAP.get(this);
  }
  get [sys$3]() {
    return this[sys$2].doc.getLineText(this.range.start.line);
  }
  toSnippet() {
    let start = this.range.start;
    let end = this.range.end;
    let msg = "" + this[sys$2].sourcePath + ":" + (start.line + 1) + ":" + (start.character + 1) + ": " + this.message;
    let line = this[sys$2].doc.getLineText(start.line);
    let stack = [msg, line];
    stack.push(line.replace(/[^\t]/g, " ").slice(0, start.character) + "^".repeat(end.character - start.character));
    return stack.join("\n").replace(/\t/g, "    ") + "\n";
  }
  toError() {
    let start = this.range.start;
    let end = this.range.end;
    let msg = "" + this[sys$2].sourcePath + ":" + (start.line + 1) + ":" + (start.character + 1) + ": " + this.message;
    let err = new SyntaxError(msg);
    let line = this[sys$2].doc.getLineText(start.line);
    let stack = [msg, line];
    stack.push(line.replace(/[^\t]/g, " ").slice(0, start.character) + "^".repeat(end.character - start.character));
    err.stack = "\n" + stack.join("\n").replace(/\t/g, "    ") + "\n";
    return err;
  }
  raise() {
    throw this.toError();
  }
};

// src/program/utils.imba
function iter$(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
function prevToken(start, pattern, max = 1e5) {
  let tok = start;
  while (tok && max > 0) {
    if (tok.match(pattern)) {
      return tok;
    }
    ;
    max--;
    tok = tok.prev;
  }
  ;
  return null;
}
function pascalCase(str) {
  return str.replace(/(^|[\-\_\s])(\w)/g, function(_0, _1, _2) {
    return _2.toUpperCase();
  });
}
function computeLineOffsets(text, isAtLineStart, textOffset) {
  if (textOffset === void 0) {
    textOffset = 0;
  }
  ;
  var result = isAtLineStart ? [textOffset] : [];
  var i = 0;
  while (i < text.length) {
    var ch = text.charCodeAt(i);
    if (ch === 13 || ch === 10) {
      if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
        i++;
      }
      ;
      result.push(textOffset + i + 1);
    }
    ;
    i++;
  }
  ;
  return result;
}
function getWellformedRange(range) {
  var start = range.start;
  var end = range.end;
  if (start.line > end.line || start.line === end.line && start.character > end.character) {
    return new Range(end, start);
  }
  ;
  return range instanceof Range ? range : new Range(start, end);
}
function editIsFull(e) {
  return e !== void 0 && e !== null && typeof e.text === "string" && e.range === void 0;
}
function fastExtractSymbols(text) {
  let lines = text.split(/\n/);
  let symbols = [];
  let scope2 = {indent: -1, children: []};
  let root = scope2;
  let m;
  let t0 = Date.now();
  for (let i = 0, sys$4 = iter$(lines), sys$5 = sys$4.length; i < sys$5; i++) {
    let line = sys$4[i];
    if (line.match(/^\s*$/)) {
      continue;
    }
    ;
    let indent = line.match(/^\t*/)[0].length;
    while (scope2.indent >= indent) {
      scope2 = scope2.parent || root;
    }
    ;
    m = line.match(/^(\t*((?:export )?(?:static )?(?:extend )?)(class|tag|def|get|set|prop|attr) )(\@?[\w\-\$\:]+(?:\.[\w\-\$]+)?)/);
    if (m) {
      let kind = m[3];
      let name = m[4];
      let ns = scope2.name ? scope2.name + "." : "";
      let mods = m[2].trim().split(/\s+/);
      let md = "";
      let span = {
        start: {line: i, character: m[1].length},
        end: {line: i, character: m[0].length}
      };
      let symbol3 = {
        kind,
        ownName: name,
        name: ns + name,
        span,
        indent,
        modifiers: mods,
        children: [],
        parent: scope2 == root ? null : scope2,
        type: kind,
        data: {},
        static: mods.indexOf("static") >= 0,
        extends: mods.indexOf("extend") >= 0
      };
      if (symbol3.static) {
        symbol3.containerName = "static";
      }
      ;
      symbol3.containerName = m[2] + m[3];
      if (kind == "tag" && (m = line.match(/\<\s+([\w\-\$\:]+(?:\.[\w\-\$]+)?)/))) {
        symbol3.superclass = m[1];
      }
      ;
      if (scope2.type == "tag") {
        md = "```html\n<" + scope2.name + " " + name + ">\n```\n";
        symbol3.description = {kind: "markdown", value: md};
      }
      ;
      scope2.children.push(symbol3);
      scope2 = symbol3;
      symbols.push(symbol3);
    }
    ;
  }
  ;
  root.all = symbols;
  console.log("fast outline", text.length, Date.now() - t0);
  return root;
}

// src/program/grammar.imba
function iter$2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var eolpop = [/^/, {token: "@rematch", next: "@pop"}];
var repop = {token: "@rematch", next: "@pop"};
var toodeep = {token: "white.indent", next: "@>illegal_indent"};
function regexify(array, pattern = "#") {
  if (typeof array == "string") {
    array = array.split(" ");
  }
  ;
  let items = array.slice().sort(function(_0, _1) {
    return _1.length - _0.length;
  });
  items = items.map(function(item) {
    let escaped = item.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
    return pattern.replace("#", escaped);
  });
  return new RegExp("(?:" + items.join("|") + ")");
}
function denter(indent, outdent, stay, o = {}) {
  var $0$1;
  if (indent == null) {
    indent = toodeep;
  } else if (indent == 1) {
    indent = {next: "@>"};
  } else if (indent == 2) {
    indent = {next: "@>_indent&-_indent"};
  } else if (typeof indent == "string") {
    indent = {next: indent};
  }
  ;
  if (outdent == -1) {
    outdent = repop;
  }
  ;
  if (stay == -1) {
    stay = repop;
  } else if (stay == 0) {
    o.comment == null ? o.comment = true : o.comment;
    stay = {};
  }
  ;
  indent = Object.assign({token: "white.tabs"}, indent || {});
  stay = Object.assign({token: "white.tabs"}, stay || {});
  outdent = Object.assign({token: "@rematch", next: "@pop"}, outdent || {});
  let cases = {
    "$1==$S2	": indent,
    "$1==$S2": {
      cases: {"$1==$S6": stay, "@default": {token: "@rematch", switchTo: "@*$1"}}
    },
    "@default": outdent
  };
  $0$1 = 0;
  for (let k of ["next", "switchTo"]) {
    let v = $0$1++;
    if (indent[k] && indent[k].indexOf("*") == -1) {
      indent[k] += "*$1";
    }
    ;
  }
  ;
  let rule = [/^(\t*)(?=[^\t\n])/, {cases}];
  if (o.comment) {
    let clones = {};
    for (let sys$14 = 0, sys$22 = Object.keys(cases), sys$32 = sys$22.length, k, v; sys$14 < sys$32; sys$14++) {
      k = sys$22[sys$14];
      v = cases[k];
      let clone = Object.assign({}, v);
      if (!clone.next && !clone.switchTo) {
        clone.next = "@>_comment";
      }
      ;
      clones[k] = clone;
    }
    ;
    return [[/^(\t*)(?=#\s|#$)/, {cases: clones}], rule];
  }
  ;
  return rule;
}
var states = {
  root: [
    [/^@comment/, "comment", "@>_comment"],
    [/^(\t+)(?=[^\t\n])/, {cases: {
      "$1==$S2	": {token: "white.indent", next: "@>_indent*$1"},
      "@default": "white.indent"
    }}],
    "block_"
  ],
  _comment: [
    [/^([\t\s\n]*)$/, "comment"],
    [/^(\t*)([\S\s]*)/, {cases: {
      "$1~$S2	*": {token: "comment"},
      "@default": {token: "@rematch", next: "@pop"}
    }}],
    [/[\S\s]+/, "comment"]
  ],
  illegal_indent: [
    denter()
  ],
  identifier_: [
    [/\$\w+\$/, "identifier.env"],
    [/\$\d+/, "identifier.special"],
    [/\#+@id/, "identifier.symbol"],
    [/\¶@id/, "ivar"],
    [/@id\!?/, {cases: {
      this: "this",
      self: "self",
      "@keywords": "keyword.$#",
      "$0~[A-Z].*": "identifier.uppercase.$F",
      "@default": "identifier.$F"
    }}]
  ],
  block_: [
    [/^(\t+)(?=[\r\n]|$)/, "white.tabs"],
    "class_",
    "tagclass_",
    "var_",
    "func_",
    "import_",
    "export_",
    "flow_",
    "for_",
    "try_",
    "catch_",
    "while_",
    "css_",
    "tag_",
    "do_",
    "block_comment_",
    "expr_",
    "common_"
  ],
  _indent: [
    denter(2, -1, 0),
    "block_"
  ],
  block: [
    denter("@>", -1, 0),
    "block_"
  ],
  bool_: [
    [/(true|false|yes|no|undefined|null)(?![\:\-\w\.\_])/, "boolean"]
  ],
  op_: [
    [/\s+\:\s+/, "operator.ternary"],
    [/(@unspaced_ops)/, {cases: {
      "@access": "operator.access",
      "@default": "operator"
    }}],
    [/\&(?=[,\)])/, "operator.special.blockparam"],
    [/(\s*)(@symbols)(\s*)/, {cases: {
      "$2@operators": "operator",
      "$2@math": "operator.math",
      "$2@logic": "operator.logic",
      "$2@access": "operator.access",
      "@default": "delimiter"
    }}],
    [/\&\b/, "operator"]
  ],
  keyword_: [
    [/new@B/, "keyword.new"],
    [/isa@B/, "keyword.isa"],
    [/is@B/, "keyword.is"],
    [/(switch|when|throw|continue|break|then|await|typeof|by)@B/, "keyword.$1"],
    [/delete@B/, "keyword.delete"],
    [/and@B|or@B/, "operator.flow"]
  ],
  return_: [
    [/return@B/, "keyword.new"]
  ],
  primitive_: [
    "string_",
    "number_",
    "regexp_",
    "bool_"
  ],
  value_: [
    "primitive_",
    "keyword_",
    "implicit_call_",
    "parens_",
    "key_",
    "access_",
    "identifier_",
    "array_",
    "object_"
  ],
  expr_: [
    "comment_",
    "inline_var_",
    "return_",
    "value_",
    "tag_",
    "op_",
    "type_",
    "spread_"
  ],
  attr_expr_: [
    "primitive_",
    "parens_",
    "access_",
    "identifier_",
    "array_",
    "object_",
    "tag_",
    "op_"
  ],
  access_: [
    [/(\.\.?)(@propid\!?)/, {cases: {
      "$2~[A-Z].*": ["operator.access", "accessor.uppercase"],
      "$2~#.*": ["operator.access", "accessor.symbol"],
      "@default": ["operator.access", "accessor"]
    }}]
  ],
  call_: [
    [/\(/, "(", "@call_body"]
  ],
  key_: [
    [/(\#+@id)(\:\s*)/, ["key.symbol", "operator.assign.key-value"]],
    [/(@propid)(\:\s*)/, {cases: {
      "@default": ["key", "operator.assign.key-value"]
    }}]
  ],
  implicit_call_: [
    [/(\.\.?)(@propid)@implicitCall/, {cases: {
      "$2~[A-Z].*": ["operator.access", "accessor.uppercase", "@implicit_call_body"],
      "@default": ["operator.access", "accessor", "@implicit_call_body"]
    }}],
    [/(@propid)@implicitCall/, {cases: {
      "$2~[A-Z].*": ["identifier.uppercase", "@implicit_call_body"],
      "@default": ["identifier", "@implicit_call_body"]
    }}]
  ],
  implicit_call_body: [
    eolpop,
    [/\)|\}|\]|\>/, "@rematch", "@pop"],
    "arglist_"
  ],
  arglist_: [
    "do_",
    "expr_",
    [/\s*\,\s*/, "delimiter.comma"]
  ],
  params_: [
    [/\[/, "[", "@array_var_body=decl-param"],
    [/\{/, "{", "@object_body=decl-param"],
    [/(@variable)/, "identifier.decl-param"],
    "spread_",
    "type_",
    [/\s*\=\s*/, "operator", "@var_value="],
    [/\s*\,\s*/, "separator"]
  ],
  object_: [
    [/\{/, "{", "@object_body"]
  ],
  parens_: [
    [/\(/, "(", "@parens_body"]
  ],
  parens_body: [
    [/\)/, ")", "@pop"],
    "arglist_"
  ],
  array_: [
    [/\[/, "[", "@array_body"]
  ],
  array_body: [
    [/\]@implicitCall/, {token: "]", switchTo: "@implicit_call_body="}],
    [/\]/, "]", "@pop"],
    "expr_",
    [",", "delimiter"]
  ],
  object_body: [
    [/\}/, "}", "@pop"],
    [/(@id)(\s*:\s*)/, ["key", "operator.assign.key-value", "@object_value"]],
    [/(@id)/, "identifier.$F"],
    [/\[/, "[", "@object_dynamic_key="],
    [/\s*=\s*/, "operator.assign", "@object_value="],
    [/:/, "operator.assign.key-value", "@object_value="],
    [/\,/, "delimiter.comma"],
    "expr_"
  ],
  object_value: [
    eolpop,
    [/,|\}|\]|\)/, "@rematch", "@pop"],
    "expr_"
  ],
  object_dynamic_key: [
    ["]", "]", "@pop"],
    "expr_"
  ],
  comment_: [
    [/#(\s.*)?(\n|$)/, "comment"]
  ],
  block_comment_: [
    [/###/, "comment.start", "@_block_comment"]
  ],
  _block_comment: [
    [/###/, "comment.end", "@pop"],
    [/[^#]+/, "comment"],
    [/#(?!##)/, "comment"]
  ],
  try_: [
    [/try@B/, "keyword.try", "@>_try&try"]
  ],
  catch_: [
    [/(catch\s+)(?=@id(\s|$))/, "keyword.catch", "@catch_start&catch"],
    [/catch@B/, "keyword.catch", "@catch_start&catch"]
  ],
  catch_start: [
    [/@id/, "identifier.decl-const", {switchTo: "@>_catch"}],
    [/.?/, "@rematch", {switchTo: "@>_catch"}]
  ],
  _catch: [
    denter("@>block", -1, 0),
    "block_"
  ],
  _try: [
    denter("@>block", -1, 0),
    "block_"
  ],
  do_: [
    [/do(?=\()/, "keyword.do", "@>do_start&do"],
    [/do@B/, "keyword.do", "@>_do&do"]
  ],
  do_start: [
    denter(null, -1, -1),
    [/\(/, "(", {switchTo: "@_do_params"}],
    [/./, "@rematch", {switchTo: "@_do"}]
  ],
  _do_params: [
    [/\)/, ")", {switchTo: "@_do"}],
    "params_"
  ],
  _do: [
    denter(2, -1, 0),
    [/(\}|\)|\])/, "@rematch", "@pop"],
    "block_"
  ],
  class_: [
    [/(extend)(?=\s+class )/, "keyword.$1"],
    [/(global)(?=\s+class )/, "keyword.$1"],
    [/(class)(\s)(@id)/, ["keyword.$1", "white.$1name", "entity.name.class.decl-const", "@class_start="]]
  ],
  class_start: [
    [/(\s+\<\s+)(@id)/, ["keyword.extends", "identifier.superclass"]],
    [/@comment/, "comment"],
    [/^/, "@rematch", {switchTo: "@>_class&class="}]
  ],
  tagclass_: [
    [/(extend)(?=\s+tag )/, "keyword.$1"],
    [/(global)(?=\s+tag )/, "keyword.$1"],
    [/(tag)(\s)(@constant)/, ["keyword.tag", "white.tagname", "entity.name.component.local", "@tagclass_start="]],
    [/(tag)(\s)(@id)/, ["keyword.tag", "white.tagname", "entity.name.component.global", "@tagclass_start="]]
  ],
  tagclass_start: [
    [/(\s+\<\s+)(@id)/, ["keyword.extends", "identifier.superclass"]],
    [/@comment/, "comment"],
    [/^/, "@rematch", {switchTo: "@>_tagclass&component="}]
  ],
  import_: [
    [/(import)(?=\s+['"])/, "keyword.import", "@>import_source"],
    [/(import)(\s+type)(?=\s[\w\$\@\{])/, ["keyword.import", "keyword.import", "@>import_body=decl-import/part"]],
    [/(import)@B/, "keyword.import", "@>import_body=decl-import/part"]
  ],
  export_: [
    [/(export)( +)(default)@B/, ["keyword.export", "white", "keyword.default"]],
    [/(export)(?= +(let|const|var|class|tag)@B)/, "keyword.export"],
    [/(export)( +)(global)@B/, ["keyword.export", "white", "keyword.global"]],
    [/(export)(\s+\*\s+)(from)@B/, ["keyword.export", "operator.star", "keyword.from", "@>import_source"]],
    [/(export)@B/, "keyword.export", "@>export_body"]
  ],
  export_body: [
    denter(null, -1, 0),
    [/(\*)(\s+as\s+)(@esmIdentifier)/, ["keyword.star", "keyword.as", "identifier.const.export"]],
    [/(@esmIdentifier)(\s+as\s+)(default)/, ["alias", "keyword.as", "alias.default"]],
    [/(@esmIdentifier)(\s+as\s+)(@esmIdentifier)/, ["alias", "keyword.as", "identifier.const.export"]],
    [/from/, "keyword.from", {switchTo: "@import_source"}],
    [/\{/, "{", "@esm_specifiers=export/part"],
    [/(@esmIdentifier)/, "identifier.const.export"],
    [/\*/, "operator.star"],
    "comma_",
    "common_"
  ],
  import_body: [
    denter(null, -1, 0),
    [/(@esmIdentifier)( +from)/, ["identifier.$F", "keyword.from", {switchTo: "@import_source"}]],
    [/(\*)(\s+as\s+)(@esmIdentifier)(\s+from)/, ["keyword.star", "keyword.as", "identifier.$F", "keyword.from", {switchTo: "@import_source"}]],
    [/(@esmIdentifier)(\s*,\s*)(\*)(\s+as\s+)(@esmIdentifier)(from)/, ["identifier.const.import", "delimiter", "keyword.star", "keyword.as", "identifier.$F", "keyword.from", {switchTo: "@import_source"}]],
    [/from/, "keyword.from", {switchTo: "@import_source"}],
    [/\{/, "{", "@esm_specifiers/part"],
    [/(@esmIdentifier)/, "identifier.$F", {switchTo: "@/delim"}],
    [/\s*\,\s*/, "delimiter.comma", {switchTo: "@/part"}],
    "comma_",
    "common_"
  ],
  import_part: [
    [/\{/, "{", "@esm_specifiers/part"],
    [/(\*)(\s+as\s+)(@esmIdentifier)/, ["keyword.star", "keyword.as", "identifier.$F", {switchTo: "@import_delim"}]],
    [/(@esmIdentifier)(\s+as\s+)(@esmIdentifier)/, ["alias", "keyword.as", "identifier.$F", {switchTo: "@import_delim"}]],
    [/(@esmIdentifier)/, "identifier.$F", {switchTo: "@import_delim"}]
  ],
  import_delim: [
    [/\}/, "}", "@pop"],
    [/\s*\,\s*/, "delimiter.comma", {switchTo: "@import_part"}],
    "common_",
    [/from/, "keyword.from", {switchTo: "@import_source"}]
  ],
  esm_specifiers: [
    [/\}/, "}", "@pop"],
    [/(@esmIdentifier)(\s+as\s+)(@esmIdentifier)/, ["alias", "keyword.as", "identifier.const.$F", {switchTo: "@/delim"}]],
    [/@esmIdentifier/, {cases: {
      "$/==part": {token: "identifier.const.$S4", switchTo: "@/delim"},
      "@default": {token: "invalid"}
    }}],
    [/\s*\,\s*/, "delimiter.comma", {switchTo: "@/part"}],
    "whitespace"
  ],
  import_source: [
    denter(null, -1, 0),
    [/["']/, "path.open", "@_path=$#"]
  ],
  _path: [
    [/[^"'\`\{\\]+/, "path"],
    [/@escapes/, "path.escape"],
    [/\./, "path.escape.invalid"],
    [/\{/, "invalid"],
    [/["'`]/, {cases: {"$#==$F": {token: "path.close", next: "@pop"}, "@default": "path"}}]
  ],
  member_: [
    [/(constructor)@B/, "entity.name.constructor", "@>def_params&$1/$1"],
    [/(def|get|set)(\s)(@defid)/, ["keyword.$1", "white.entity", "entity.name.$1", "@>def_params&$1/$1"]],
    [/(def|get|set)(\s)(\[)/, ["keyword.$1", "white.entity", "$$", "@>def_dynamic_name/$1"]]
  ],
  func_: [
    [/export(?=\s+(get|set|def|global) )/, "keyword.export"],
    [/global(?=\s+(get|set|def) )/, "keyword.global"],
    [/(def)(\s)(@id)(\.)(@defid)/, [
      "keyword.$1",
      "white.entity",
      "identifier.target",
      "operator",
      "entity.name.def",
      "@>def_params&$1/$1"
    ]],
    [/(def)(\s)(@defid)/, ["keyword.$1", "white.entity", "entity.name.function.decl-const-func", "@>def_params&$1/$1"]]
  ],
  flow_: [
    [/(if|else|elif|unless)(?=\s|$)/, ["keyword.$1", "@flow_start=$1"]]
  ],
  flow_start: [
    denter({switchTo: "@>_flow&$F"}, -1, -1),
    "expr_"
  ],
  for_: [
    [/for(?: own)?@B/, "keyword.$#", "@for_start&flow=decl-let"]
  ],
  while_: [
    [/(while|until)@B/, "keyword.$#", "@>while_body"]
  ],
  while_body: [
    denter(2, -1, 0),
    "block_"
  ],
  for_start: [
    denter({switchTo: "@>for_body"}, -1, -1),
    [/\[/, "[", "@array_var_body"],
    [/\{/, "{", "@object_body"],
    [/(@variable)/, "identifier.$F"],
    [/(\s*\,\s*)/, "separator"],
    [/\s(in|of)@B/, "keyword.$1", {switchTo: "@>for_source="}],
    [/[ \t]+/, "white"],
    "type_"
  ],
  for_source: [
    denter({switchTo: "@>for_body"}, -1, {switchTo: "@for_body"}),
    "expr_",
    [/[ \t]+/, "white"]
  ],
  for_body: [
    denter(2, -1, 0),
    "block_"
  ],
  decorator_: [
    [/(@decid)(\()/, ["decorator", "$2", "@_decorator_params"]],
    [/(@decid)/, "decorator"]
  ],
  _decorator_params: [
    [/\)/, ")", "@pop"],
    "params_"
  ],
  field_: [
    [/((?:lazy )?)((?:static )?)(const|let|attr)(?=\s|$)/, ["keyword.lazy", "keyword.static", "keyword.$1", "@_vardecl=field-$3"]],
    [/static(?=\s+@id)/, "keyword.static"],
    [/(@id)(?=$)/, "field"],
    [/(@id)/, ["field", "@_field_1"]]
  ],
  _field_1: [
    denter(null, -1, -1),
    "type_",
    [/(\s*=\s*)/, ["operator", "@>_field_value"]],
    [/(\s*(?:\@)set\s*)/, ["keyword.spy", "@>_def&spy"]]
  ],
  _field_value: [
    denter(2, -1, 0),
    "block_",
    [/(\s*(?:\@)set\s*)/, ["@rematch", "@pop"]]
  ],
  var_: [
    [/((?:export )?)(const|let)(?=\s[\[\{\$a-zA-Z]|$)/, ["keyword.export", "keyword.$1", "@_vardecl=decl-$2"]],
    [/((?:export )?)(const|let)(?=\s|$)/, ["keyword.export", "keyword.$1"]]
  ],
  inline_var_: [
    [/(const|let)(?=\s[\[\{\$a-zA-Z]|$)/, ["keyword.$1", "@inline_var_body=decl-$1"]]
  ],
  string_: [
    [/"""/, "string", '@_herestring="""'],
    [/'''/, "string", "@_herestring='''"],
    [/["'`]/, "string.open", "@_string=$#"]
  ],
  number_: [
    [/0[xX][0-9a-fA-F_]+/, "number.hex"],
    [/0[b][01_]+/, "number.binary"],
    [/0[o][0-9_]+/, "number.octal"],
    [/(\d+)([a-z]+|\%)/, ["number", "unit"]],
    [/(\d*\.\d+(?:[eE][\-+]?\d+)?)([a-z]+|\%)/, ["number.float", "unit"]],
    [/\d+[eE]([\-+]?\d+)?/, "number.float"],
    [/\d[\d_]*\.\d[\d_]*([eE][\-+]?\d+)?/, "number.float"],
    [/\d[\d_]*/, "number.integer"],
    [/0[0-7]+(?!\d)/, "number.octal"],
    [/\d+/, "number"]
  ],
  _string: [
    [/[^"'\`\{\\]+/, "string"],
    [/@escapes/, "string.escape"],
    [/\./, "string.escape.invalid"],
    [/\{/, {cases: {
      "$F=='": "string",
      "@default": {token: "string.bracket.open", next: "@interpolation_body"}
    }}],
    [/["'`]/, {cases: {"$#==$F": {token: "string.close", next: "@pop"}, "@default": "string"}}],
    [/#/, "string"]
  ],
  _herestring: [
    [/("""|''')/, {cases: {"$1==$F": {token: "string", next: "@pop"}, "@default": "string"}}],
    [/[^#\\'"\{]+/, "string"],
    [/['"]+/, "string"],
    [/@escapes/, "string.escape"],
    [/\./, "string.escape.invalid"],
    [/\{/, {cases: {'$F=="""': {token: "string", next: "@interpolation_body"}, "@default": "string"}}],
    [/#/, "string"]
  ],
  interpolation_body: [
    [/\}/, "string.bracket.close", "@pop"],
    "expr_"
  ],
  _class: [
    denter(toodeep, -1, 0),
    "css_",
    "member_",
    "comment_",
    "decorator_",
    [/(get|set|def|static|prop|attr)@B/, "keyword.$0"],
    "field_",
    "common_"
  ],
  _tagclass: [
    "_class",
    [/(?=\<self)/, "entity.name.def.render", "@_render&def"]
  ],
  def_params: [
    [/\(/, "(", "@def_parens"],
    [/^/, "@rematch", {switchTo: "@_def"}],
    [/do@B/, "keyword.do", {switchTo: "@_def"}],
    "params_",
    [/@comment/, "comment"]
  ],
  def_parens: [
    [/\)/, ")", "@pop"],
    "params_"
  ],
  def_dynamic_name: [
    ["]", {token: "square.close", switchTo: "@def_params&$/"}],
    "expr_"
  ],
  _render: [
    denter(2, -1, -1),
    "block_"
  ],
  _def: [
    denter(2, -1, 0),
    "block_"
  ],
  _flow: [
    denter(2, -1, 0),
    "block_"
  ],
  _varblock: [
    denter(1, -1, -1),
    [/\[/, "[", "@array_var_body"],
    [/\{/, "{", "@object_body"],
    [/(@variable)/, "identifier.$F"],
    [/\s*\,\s*/, "separator"],
    [/(\s*\=\s*)(?=(for|while|until|if|unless|try)\s)/, "operator", "@pop"],
    [/(\s*\=\s*)/, "operator", "@var_value="],
    "type_",
    [/#(\s.*)?\n?$/, "comment"]
  ],
  _vardecl: [
    denter(null, -1, -1),
    [/\[/, "[", "@array_var_body"],
    [/\{/, "{", "@object_body"],
    [/(@variable)(?=\n|,|$)/, "identifier.$F", "@pop"],
    [/(@variable)/, "identifier.$F"],
    [/(\s*\=\s*)/, "operator.declval", {switchTo: "@var_value&value="}],
    "type_"
  ],
  array_var_body: [
    [/\]/, "]", "@pop"],
    [/\{/, "{", "@object_body"],
    [/\[/, "[", "@array_var_body"],
    "spread_",
    [/(@variable)/, "identifier.$F"],
    [/(\s*\=\s*)/, "operator.assign", "@array_var_body_value="],
    [",", "delimiter"]
  ],
  array_var_body_value: [
    [/(?=,|\)|]|})/, "delimiter", "@pop"],
    "expr_"
  ],
  inline_var_body: [
    [/\[/, "[", "@array_var_body"],
    [/\{/, "{", "@object_body"],
    [/(@variable)/, "identifier.$F"],
    [/(\s*\=\s*)/, "operator", "@pop"],
    "type_"
  ],
  var_value: [
    [/(?=,|\)|]|})/, "delimiter", "@pop"],
    denter({switchTo: "@>block"}, -1, -1),
    "block_"
  ],
  common_: [
    [/^(\t+)(?=\n|$)/, "white.tabs"],
    "@whitespace"
  ],
  comma_: [
    [/\s*,\s*/, "delimiter.comma"]
  ],
  spread_: [
    [/\.\.\./, "operator.spread"]
  ],
  type_: [
    [/\\/, "@rematch", "@_type&-_type/0"]
  ],
  _type: [
    denter(-1, -1, -1),
    [/\\/, "delimiter.type.prefix"],
    [/\[/, "delimiter.type", "@/]"],
    [/\(/, "delimiter.type", "@/)"],
    [/\{/, "delimiter.type", "@/}"],
    [/\</, "delimiter.type", "@/>"],
    [/\|/, "delimiter.type.union"],
    [/\,|\s|\=|\./, {
      cases: {
        "$/==0": {token: "@rematch", next: "@pop"},
        "@default": "type"
      }
    }],
    [/[\]\}\)\>]/, {
      cases: {
        "$#==$/": {token: "delimiter.type", next: "@pop"},
        "@default": {token: "@rematch", next: "@pop"}
      }
    }],
    [/[\w\-\$]+/, "type"]
  ],
  css_: [
    [/global(?=\s+css@B)/, "keyword.$#"],
    [/css(?:\s+)?/, "keyword.css", "@>css_selector&rule-_sel"]
  ],
  sel_: [
    [/(\%)((?:@id)?)/, ["style.selector.mixin.prefix", "style.selector.mixin"]],
    [/(\@)(\.{0,2}[\w\-\<\>\!]*\+?)/, ["style.selector.modifier.prefix", "style.selector.modifier"]],
    [/(\@)(\.{0,2}[\w\-\<\>\!]*)/, ["style.selector.modifier.prefix", "style.selector.modifier"]],
    [/\.([\w\-]+)/, "style.selector.class-name"],
    [/\#([\w\-]+)/, "style.selector.id"],
    [/([\w\-]+)/, "style.selector.element"],
    [/(>+|~|\+)/, "style.selector.operator"],
    [/(\*+)/, "style.selector.element.any"],
    [/(\$)((?:@id)?)/, ["style.selector.reference.prefix", "style.selector.reference"]],
    [/\&/, "style.selector.context"],
    [/\(/, "delimiter.selector.parens.open", "@css_selector_parens"],
    [/\[/, "delimiter.selector.attr.open", "@css_selector_attr"],
    [/\s+/, "white"],
    [/,/, "style.selector.delimiter"],
    [/#(\s.*)?\n?$/, "comment"]
  ],
  css_props: [
    denter(null, -1, 0),
    [/(?=@cssPropertyKey2)/, "", "@css_property&-_styleprop-_stylepropkey"],
    [/#(\s.*)?\n?$/, "comment"],
    [/(?=[\%\*\w\&\$\>\.\[\@\!]|\#[\w\-])/, "", "@>css_selector&rule-_sel"],
    [/\s+/, "white"]
  ],
  css_selector: [
    denter({switchTo: "@css_props"}, -1, {token: "@rematch", switchTo: "@css_props&_props"}),
    [/(\}|\)|\])/, "@rematch", "@pop"],
    [/(?=\s*@cssPropertyKey2)/, "", {switchTo: "@css_props&_props"}],
    [/\s*#\s/, "@rematch", {switchTo: "@css_props&_props"}],
    "sel_"
  ],
  css_inline: [
    [/\]/, "style.close", "@pop"],
    [/(?=@cssPropertyKey2)/, "", "@css_property&-_styleprop-_stylepropkey"],
    [/(?=@cssPropertyPath\])/, "", "@css_property&-_styleprop-_stylepropkey"]
  ],
  css_selector_parens: [
    [/\)/, "delimiter.selector.parens.close", "@pop"],
    "sel_"
  ],
  css_selector_attr: [
    [/\]/, "delimiter.selector.parens.close", "@pop"],
    "sel_"
  ],
  css_property: [
    denter(null, -1, -1),
    [/\]/, "@rematch", "@pop"],
    [/(\d+)(@id)/, ["style.property.unit.number", "style.property.unit.name"]],
    [/((--|\$)@id)/, "style.property.var"],
    [/(-*@id)/, "style.property.name"],
    [/@cssModifier/, "style.property.modifier"],
    [/(\@+|\.+)(@id\-?)/, ["style.property.modifier.start", "style.property.modifier"]],
    [/\+(@id)/, "style.property.scope"],
    [/\s*([\:]\s*)(?=@br|$)/, "style.property.operator", {switchTo: "@>css_multiline_value&_stylevalue"}],
    [/\s*([\:]\s*)/, "style.property.operator", {switchTo: "@>css_value&_stylevalue"}]
  ],
  css_value_: [
    [/(x?xs|sm\-?|md\-?|lg\-?|xx*l|\dxl|hg|x+h)\b/, "style.value.size"],
    [/\#[0-9a-fA-F]+/, "style.value.color.hex"],
    [/((--|\$)@id)/, "style.value.var"],
    [/(@optid)(\@+|\.+)(@optid)/, ["style.property.name", "style.property.modifier.prefix", "style.property.modifier"]],
    "op_",
    "string_",
    "number_",
    "comment_",
    [/\s+/, "style.value.white"],
    [/\(/, "delimiter.style.parens.open", "@css_expressions"],
    [/\{/, "delimiter.style.curly.open", "@css_interpolation"],
    [/(@id)/, "style.value"]
  ],
  css_value: [
    denter({switchTo: "@>css_multiline_value"}, -1, -1),
    [/@cssPropertyKey2/, "@rematch", "@pop"],
    [/;/, "style.delimiter", "@pop"],
    [/(\}|\)|\])/, "@rematch", "@pop"],
    "css_value_"
  ],
  css_multiline_value: [
    denter(null, -1, 0),
    [/@cssPropertyKey2/, "invalid"],
    "css_value_"
  ],
  css_expressions: [
    [/\)/, "delimiter.style.parens.close", "@pop"],
    [/\(/, "delimiter.style.parens.open", "@css_expressions"],
    "css_value"
  ],
  css_interpolation: [
    [/\}/, "delimiter.style.curly.close", "@pop"],
    "expr_"
  ],
  expressions: [
    [/\,/, "delimiter.comma"]
  ],
  whitespace: [
    [/[\r\n]+/, "br"],
    [/[ \t\r\n]+/, "white"]
  ],
  tag_: [
    [/(\s*)(<)(?=\.)/, ["white", "tag.open", "@_tag/flag"]],
    [/(\s*)(<)(?=\w|\{|\[|\%|\#|>)/, ["white", "tag.open", "@_tag/name"]]
  ],
  tag_content: [
    denter(2, -1, 0),
    [/\)|\}\]/, "@rematch", "@pop"],
    "common_",
    "flow_",
    "var_",
    "for_",
    "expr_"
  ],
  tag_children: [],
  _tag: [
    [/\/>/, "tag.close", "@pop"],
    [/>/, "tag.close", "@pop"],
    [/(\-?@tagIdentifier)(\:@id)?/, "tag.$/"],
    [/(\-?\d+)/, "tag.$S3"],
    [/(\%)(@id)/, ["tag.mixin.prefix", "tag.mixin"]],
    [/\#@id/, "tag.id"],
    [/\./, {cases: {
      "$/==event": {token: "tag.event-modifier.start", switchTo: "@/event-modifier"},
      "$/==event-modifier": {token: "tag.event-modifier.start", switchTo: "@/event-modifier"},
      "$/==modifier": {token: "tag.modifier.start", switchTo: "@/modifier"},
      "$/==rule": {token: "tag.rule-modifier.start", switchTo: "@/rule-modifier"},
      "$/==rule-modifier": {token: "tag.rule-modifier.start", switchTo: "@/rule-modifier"},
      "@default": {token: "tag.flag.start", switchTo: "@/flag"}
    }}],
    [/(\$?@id)/, {cases: {
      "$/==name": "tag.reference",
      "@default": "tag.$/"
    }}],
    [/\{/, "tag.$/.braces.open", "@_tag_interpolation"],
    [/\[/, "style.open", "@css_inline"],
    [/(\s*\=\s*)/, "operator.equals.tagop.tag-$/", "@_tag_value&-value"],
    [/\:/, {token: "tag.event.start", switchTo: "@/event"}],
    "tag_event_",
    [/\{/, {token: "tag.$/.braces.open", next: "@_tag_interpolation/0"}],
    [/\(/, {token: "tag.parens.open.$/", next: "@_tag_parens/0"}],
    [/\s+/, {token: "tag.white", switchTo: "@/attr"}],
    "comment_"
  ],
  tag_event_: [
    [/(\@)(@optid)/, ["tag.event.start", "tag.event.name", "@_tag_event/$2"]]
  ],
  _tag_part: [
    [/\)|\}|\]|\>/, "@rematch", "@pop"]
  ],
  _tag_event: [
    "_tag_part",
    [/\.(@optid)/, "tag.event-modifier"],
    [/\(/, {token: "tag.parens.open.$/", next: "@_tag_parens/0"}],
    [/(\s*\=\s*)/, "operator.equals.tagop.tag-$/", "@_tag_value&handler"],
    [/\s+/, "@rematch", "@pop"]
  ],
  _tag_interpolation: [
    [/\}/, "tag.$/.braces.close", "@pop"],
    "expr_",
    [/\)|\]/, "invalid"]
  ],
  _tag_parens: [
    [/\)/, "tag.parens.close.$/", "@pop"],
    "arglist_",
    [/\]|\}/, "invalid"]
  ],
  _tag_value: [
    [/(?=(\/?\>|\s))/, "", "@pop"],
    "attr_expr_"
  ],
  regexp_: [
    [/\/(?!\ )(?=([^\\\/]|\\.)+\/)/, {token: "regexp.slash.open", bracket: "@open", next: "@_regexp"}],
    [/\/\/\//, {token: "regexp.slash.open", bracket: "@open", next: "@_hereregexp"}]
  ],
  _regexp: [
    [/(\{)(\d+(?:,\d*)?)(\})/, ["regexp.escape.control", "regexp.escape.control", "regexp.escape.control"]],
    [/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ["regexp.escape.control", {token: "regexp.escape.control", next: "@_regexrange"}]],
    [/(\()(\?:|\?=|\?!)/, ["regexp.escape.control", "regexp.escape.control"]],
    [/[()]/, "regexp.escape.control"],
    [/@regexpctl/, "regexp.escape.control"],
    [/[^\\\/]/, "regexp"],
    [/@regexpesc/, "regexp.escape"],
    [/\\:/, "regexp.escape"],
    [/\\\./, "regexp.invalid"],
    [/(\/)(\w+)/, [{token: "regexp.slash.close"}, {token: "regexp.flags", next: "@pop"}]],
    ["/", {token: "regexp.slash.close", next: "@pop"}],
    [/./, "regexp.invalid"]
  ],
  _regexrange: [
    [/-/, "regexp.escape.control"],
    [/\^/, "regexp.invalid"],
    [/@regexpesc/, "regexp.escape"],
    [/[^\]]/, "regexp"],
    [/\]/, "regexp.escape.control", "@pop"]
  ],
  _hereregexp: [
    [/[^\\\/#]/, "regexp"],
    [/\\./, "regexp"],
    [/#.*$/, "comment"],
    ["///[igm]*", "regexp", "@pop"],
    [/\//, "regexp"],
    "comment_"
  ]
};
function rewriteState(raw) {
  let state = ["$S1", "$S2", "$S3", "$S4", "$S5", "$S6"];
  if (raw.match(/\@(pop|push|popall)/)) {
    return raw;
  }
  ;
  if (raw[0] == "@") {
    raw = raw.slice(1);
  }
  ;
  if (raw.indexOf(".") >= 0) {
    return raw;
  }
  ;
  raw = rewriteToken(raw);
  if (raw[0] == ">") {
    state[1] = "$S6	";
    raw = raw.slice(1);
  }
  ;
  for (let sys$4 = 0, sys$5 = iter$2(raw.split(/(?=[\/\&\=\*])/)), sys$6 = sys$5.length; sys$4 < sys$6; sys$4++) {
    let part = sys$5[sys$4];
    if (part[0] == "&") {
      if (part[1] == "-" || part[1] == "_") {
        state[2] = "$S3" + part.slice(1);
      } else {
        state[2] = "$S3-" + part.slice(1);
      }
      ;
    } else if (part[0] == "+") {
      state[3] = "$S4-" + part.slice(1);
    } else if (part[0] == "=") {
      state[3] = part.slice(1);
    } else if (part[0] == "/") {
      state[4] = part.slice(1);
    } else if (part[0] == "*") {
      state[5] = part.slice(1);
    } else {
      state[0] = part;
    }
    ;
  }
  ;
  return state.join(".");
}
function rewriteToken(raw) {
  let orig = raw;
  raw = raw.replace("$/", "$S5");
  raw = raw.replace("$F", "$S4");
  raw = raw.replace("$&", "$S3");
  raw = raw.replace("$I", "$S2");
  raw = raw.replace("$T", "$S2");
  return raw;
}
function rewriteActions(actions, add) {
  if (typeof actions == "string") {
    actions = {token: actions};
  }
  ;
  if (actions && actions.token != void 0) {
    actions.token = rewriteToken(actions.token);
    if (typeof add == "string") {
      actions.next = add;
    } else if (add) {
      Object.assign(actions, add);
    }
    ;
    if (actions.next) {
      actions.next = rewriteState(actions.next);
    }
    ;
    if (actions.switchTo) {
      actions.switchTo = rewriteState(actions.switchTo);
    }
    ;
  } else if (actions && actions.cases) {
    let cases = {};
    for (let sys$9 = actions.cases, sys$7 = 0, sys$8 = Object.keys(sys$9), sys$10 = sys$8.length, k, v; sys$7 < sys$10; sys$7++) {
      k = sys$8[sys$7];
      v = sys$9[k];
      let newkey = rewriteToken(k);
      cases[newkey] = rewriteActions(v);
    }
    ;
    actions.cases = cases;
  } else if (actions instanceof Array) {
    let result = [];
    let curr = null;
    for (let i = 0, sys$11 = iter$2(actions), sys$122 = sys$11.length; i < sys$122; i++) {
      let action = sys$11[i];
      if (action[0] == "@" && i == actions.length - 1 && curr) {
        action = {next: action};
      }
      ;
      if (typeof action == "object") {
        if (action.token != void 0 || action.cases) {
          result.push(curr = Object.assign({}, action));
        } else {
          Object.assign(curr, action);
        }
        ;
      } else if (typeof action == "string") {
        result.push(curr = {token: rewriteToken(action)});
      }
      ;
    }
    ;
    actions = result;
  }
  ;
  if (actions instanceof Array) {
    for (let i = 0, sys$132 = iter$2(actions), sys$14 = sys$132.length; i < sys$14; i++) {
      let action = sys$132[i];
      if (action.token && action.token.indexOf("$$") >= 0) {
        action.token = action.token.replace("$$", "$" + (i + 1));
      }
      ;
      if (action.next) {
        action.next = rewriteState(action.next);
      }
      ;
      if (action.switchTo) {
        action.switchTo = rewriteState(action.switchTo);
      }
      ;
    }
    ;
  }
  ;
  return actions;
}
for (let sys$15 = 0, sys$16 = Object.keys(states), sys$17 = sys$16.length, key, rules; sys$15 < sys$17; sys$15++) {
  key = sys$16[sys$15];
  rules = states[key];
  let i = 0;
  while (i < rules.length) {
    let rule = rules[i];
    if (rule[0] instanceof Array) {
      rules.splice(i, 1, ...rule);
      continue;
    } else if (typeof rule == "string") {
      rules[i] = {include: rule};
    } else if (rule[1] instanceof Array) {
      rule[1] = rewriteActions(rule[1]);
    } else if (rule instanceof Array) {
      rule.splice(1, 2, rewriteActions(rule[1], rule[2]));
    }
    ;
    i++;
  }
  ;
}
var grammar = {
  defaultToken: "invalid",
  ignoreCase: false,
  tokenPostfix: "",
  brackets: [
    {open: "{", close: "}", token: "bracket.curly"},
    {open: "[", close: "]", token: "bracket.square"},
    {open: "(", close: ")", token: "bracket.parenthesis"}
  ],
  keywords: [
    "def",
    "and",
    "or",
    "is",
    "isnt",
    "not",
    "on",
    "yes",
    "@",
    "no",
    "off",
    "true",
    "false",
    "null",
    "this",
    "self",
    "as",
    "new",
    "delete",
    "typeof",
    "in",
    "instanceof",
    "return",
    "throw",
    "break",
    "continue",
    "debugger",
    "if",
    "elif",
    "else",
    "switch",
    "for",
    "while",
    "do",
    "try",
    "catch",
    "finally",
    "class",
    "extends",
    "super",
    "undefined",
    "then",
    "unless",
    "until",
    "loop",
    "of",
    "by",
    "when",
    "tag",
    "prop",
    "attr",
    "export",
    "import",
    "extend",
    "var",
    "let",
    "const",
    "require",
    "isa",
    "await"
  ],
  boolean: ["true", "false", "yes", "no", "undefined", "null"],
  operators: [
    "=",
    "!",
    "~",
    "?",
    ":",
    "!!",
    "??",
    "&",
    "|",
    "^",
    "%",
    "<<",
    "!&",
    ">>",
    ">>>",
    "+=",
    "-=",
    "*=",
    "/=",
    "&=",
    "|=",
    "?=",
    "??=",
    "^=",
    "%=",
    "~=",
    "<<=",
    ">>=",
    ">>>=",
    "..",
    "...",
    "||=",
    `&&=`,
    "**=",
    "**",
    "|=?",
    "~=?",
    "^=?",
    "=?",
    "and",
    "or"
  ],
  logic: [
    ">",
    "<",
    "==",
    "<=",
    ">=",
    "!=",
    "&&",
    "||",
    "===",
    "!=="
  ],
  ranges: ["..", "..."],
  dot: ["."],
  access: [".", ".."],
  math: ["+", "-", "*", "/", "++", "--"],
  unspaced_ops: regexify(". .. + * / ++ --"),
  comment: /#(\s.*)?(\n|$)/,
  symbols: /[=><!~?&%|+\-*\/\^,]+/,
  escapes: /\\(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  postaccess: /(:(?=\w))?/,
  ivar: /\@[a-zA-Z_]\w*/,
  B: /(?=\s|$)/,
  br: /[\r\n]+/,
  constant: /[A-Z][\w\$]*@subIdentifer/,
  className: /[A-Z][A-Za-z\d\-\_]*|[A-Za-z\d\-\_]+/,
  methodName: /[A-Za-z\_][A-Za-z\d\-\_]*\=?/,
  subIdentifer: /(?:\-*[\w\$]+)*/,
  identifier: /[a-z_]@subIdentifer/,
  mixinIdentifier: /\%[a-z_]@subIdentifer/,
  id: /[A-Za-z_\$][\w\$]*(?:\-+[\w\$]+)*\??/,
  plainid: /[A-Za-z_\$][\w\$]*(?:\-+[\w\$]+)*\??/,
  propid: /[\@\#]*@plainid/,
  defid: /[\@\#]*@plainid/,
  decid: /\@@plainid/,
  symid: /\#+@plainid/,
  symref: /\#\#@plainid/,
  optid: /(?:@id)?/,
  esmIdentifier: /[\@\%]?[A-Za-z_\$]@subIdentifer/,
  propertyPath: /(?:[A-Za-z_\$][A-Za-z\d\-\_\$]*\.)?(?:[A-Za-z_\$][A-Za-z\d\-\_\$]*)/,
  tagNameIdentifier: /(?:[\w\-]+\:)?\w+(?:\-\w+)*/,
  variable: /[\w\$]+(?:-[\w\$]*)*\??/,
  varKeyword: /var|let|const/,
  tagIdentifier: /-*[a-zA-Z][\w\-]*/,
  implicitCall: /(?!\s(?:and|or|is|isa)\s)(?=\s[\w\'\"\/\[\{])/,
  cssModifier: /(?:\@+[\<\>\!]?[\w\-]+\+?|\.+@id\-?)/,
  cssPropertyPath: /[\@\.]*[\w\-\$]+(?:[\@\.]+[\w\-\$]+)*/,
  cssPropertyKey: /[\@\.]*[\w\-\$]+(?:[\@\.]+[\w\-\$]+)*(?:\s*\:)/,
  cssVariable: /(?:--|\$)[\w\-\$]+/,
  cssPropertyName: /[\w\-\$]+/,
  cssPropertyKey2: /(?:@cssPropertyName(?:@cssModifier)*|@cssModifier+)(?:\s*\:)/,
  cssUpModifier: /\.\.[\w\-\$]+/,
  cssIsModifier: /\.[\w\-\$]+/,
  regEx: /\/(?!\/\/)(?:[^\/\\]|\\.)*\/[igm]*/,
  regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
  regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
  tokenizer: states
};

// src/program/monarch/common.ts
var MonarchBracket;
(function(MonarchBracket2) {
  MonarchBracket2[MonarchBracket2["None"] = 0] = "None";
  MonarchBracket2[MonarchBracket2["Open"] = 1] = "Open";
  MonarchBracket2[MonarchBracket2["Close"] = -1] = "Close";
})(MonarchBracket || (MonarchBracket = {}));
function isFuzzyActionArr(what) {
  return Array.isArray(what);
}
function isFuzzyAction(what) {
  return !isFuzzyActionArr(what);
}
function isString(what) {
  return typeof what === "string";
}
function isIAction(what) {
  return !isString(what);
}
function empty(s) {
  return s ? false : true;
}
function fixCase(lexer6, str) {
  return lexer6.ignoreCase && str ? str.toLowerCase() : str;
}
function sanitize(s) {
  return s.replace(/[&<>'"_]/g, "-");
}
function log(lexer6, msg) {
  console.log(`${lexer6.languageId}: ${msg}`);
}
function createError(lexer6, msg) {
  return new Error(`${lexer6.languageId}: ${msg}`);
}
var substitutionCache = {};
function compileSubstitution(str) {
  const parts = [];
  let i = 0;
  let l = str.length;
  let part = "";
  let sub = 0;
  while (i < l) {
    let chr = str[i++];
    if (chr == "$") {
      let next = str[i++];
      if (next == "$") {
        part += "$";
        continue;
      }
      if (part)
        parts.push(part);
      part = "";
      if (next == "#") {
        parts.push(0);
      } else if (next == "S") {
        parts.push(parseInt(str[i++]) + 100);
      } else {
        parts.push(parseInt(next) + 1);
      }
    } else {
      part += chr;
    }
  }
  if (part)
    parts.push(part);
  substitutionCache[str] = parts;
  return parts;
}
function substituteMatches(lexer6, str, id, matches, state) {
  let stateMatches = null;
  let parts = substitutionCache[str] || compileSubstitution(str);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (typeof part == "string") {
      out += part;
    } else if (part > 100) {
      if (stateMatches === null)
        stateMatches = state.split(".");
      out += stateMatches[part - 101] || "";
    } else if (part === 100) {
      out += state;
    } else if (part === 0) {
      out += id;
    } else if (part > 0) {
      out += matches[part - 1];
    }
  }
  return out;
}
var FIND_RULES_MAP = {};
function findRules(lexer6, inState) {
  let state = inState;
  if (FIND_RULES_MAP[state]) {
    return lexer6.tokenizer[FIND_RULES_MAP[state]];
  }
  while (state && state.length > 0) {
    const rules = lexer6.tokenizer[state];
    if (rules) {
      FIND_RULES_MAP[inState] = state;
      return rules;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return null;
}
function stateExists(lexer6, inState) {
  let state = inState;
  while (state && state.length > 0) {
    const exist = lexer6.stateNames[state];
    if (exist) {
      return true;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return false;
}

// src/program/monarch/compile.ts
function isArrayOf(elemType, obj) {
  if (!obj) {
    return false;
  }
  if (!Array.isArray(obj)) {
    return false;
  }
  for (const el of obj) {
    if (!elemType(el)) {
      return false;
    }
  }
  return true;
}
function bool(prop, defValue) {
  if (typeof prop === "boolean") {
    return prop;
  }
  return defValue;
}
function string(prop, defValue) {
  if (typeof prop === "string") {
    return prop;
  }
  return defValue;
}
function arrayToHash(array) {
  const result = {};
  for (const e of array) {
    result[e] = true;
  }
  return result;
}
function createKeywordMatcher(arr, caseInsensitive = false) {
  if (caseInsensitive) {
    arr = arr.map(function(x) {
      return x.toLowerCase();
    });
  }
  const hash = arrayToHash(arr);
  if (caseInsensitive) {
    return function(word) {
      return hash[word.toLowerCase()] !== void 0 && hash.hasOwnProperty(word.toLowerCase());
    };
  } else {
    return function(word) {
      return hash[word] !== void 0 && hash.hasOwnProperty(word);
    };
  }
}
function compileRegExp(lexer6, str) {
  let n = 0;
  while (str.indexOf("@") >= 0 && n < 5) {
    n++;
    str = str.replace(/@(\w+)/g, function(s, attr) {
      let sub = "";
      if (typeof lexer6[attr] === "string") {
        sub = lexer6[attr];
      } else if (lexer6[attr] && lexer6[attr] instanceof RegExp) {
        sub = lexer6[attr].source;
      } else {
        if (lexer6[attr] === void 0) {
          throw createError(lexer6, "language definition does not contain attribute '" + attr + "', used at: " + str);
        } else {
          throw createError(lexer6, "attribute reference '" + attr + "' must be a string, used at: " + str);
        }
      }
      return empty(sub) ? "" : "(?:" + sub + ")";
    });
  }
  return new RegExp(str, lexer6.ignoreCase ? "i" : "");
}
function selectScrutinee(id, matches, state, num) {
  if (num < 0) {
    return id;
  }
  if (num < matches.length) {
    return matches[num];
  }
  if (num >= 100) {
    num = num - 100;
    let parts = state.split(".");
    parts.unshift(state);
    if (num < parts.length) {
      return parts[num];
    }
  }
  return null;
}
function createGuard(lexer6, ruleName, tkey, val) {
  let scrut = -1;
  let oppat = tkey;
  let matches = tkey.match(/^\$(([sS]?)(\d\d?)|#)(.*)$/);
  if (matches) {
    if (matches[3]) {
      scrut = parseInt(matches[3]);
      if (matches[2]) {
        scrut = scrut + 100;
      }
    }
    oppat = matches[4];
  }
  let op = "~";
  let pat = oppat;
  if (!oppat || oppat.length === 0) {
    op = "!=";
    pat = "";
  } else if (/^\w*$/.test(pat)) {
    op = "==";
  } else {
    matches = oppat.match(/^(@|!@|~|!~|==|!=)(.*)$/);
    if (matches) {
      op = matches[1];
      pat = matches[2];
    }
  }
  let tester;
  if ((op === "~" || op === "!~") && /^(\w|\|)*$/.test(pat)) {
    let inWords = createKeywordMatcher(pat.split("|"), lexer6.ignoreCase);
    tester = function(s) {
      return op === "~" ? inWords(s) : !inWords(s);
    };
  } else if (op === "@" || op === "!@") {
    let words = lexer6[pat];
    if (!words) {
      throw createError(lexer6, "the @ match target '" + pat + "' is not defined, in rule: " + ruleName);
    }
    if (!isArrayOf(function(elem) {
      return typeof elem === "string";
    }, words)) {
      throw createError(lexer6, "the @ match target '" + pat + "' must be an array of strings, in rule: " + ruleName);
    }
    let inWords = createKeywordMatcher(words, lexer6.ignoreCase);
    tester = function(s) {
      return op === "@" ? inWords(s) : !inWords(s);
    };
  } else if (op === "~" || op === "!~") {
    if (pat.indexOf("$") < 0) {
      let re = compileRegExp(lexer6, "^" + pat + "$");
      tester = function(s) {
        return op === "~" ? re.test(s) : !re.test(s);
      };
    } else {
      tester = function(s, id, matches2, state) {
        let re = compileRegExp(lexer6, "^" + substituteMatches(lexer6, pat, id, matches2, state) + "$");
        return re.test(s);
      };
    }
  } else {
    if (pat.indexOf("$") < 0) {
      let patx = fixCase(lexer6, pat);
      tester = function(s) {
        return op === "==" ? s === patx : s !== patx;
      };
    } else {
      let patx = fixCase(lexer6, pat);
      tester = function(s, id, matches2, state, eos) {
        let patexp = substituteMatches(lexer6, patx, id, matches2, state);
        return op === "==" ? s === patexp : s !== patexp;
      };
    }
  }
  if (scrut === -1) {
    return {
      name: tkey,
      value: val,
      test: function(id, matches2, state, eos) {
        return tester(id, id, matches2, state, eos);
      }
    };
  } else {
    return {
      name: tkey,
      value: val,
      test: function(id, matches2, state, eos) {
        let scrutinee = selectScrutinee(id, matches2, state, scrut);
        return tester(!scrutinee ? "" : scrutinee, id, matches2, state, eos);
      }
    };
  }
}
function compileAction(lexer6, ruleName, action) {
  if (!action) {
    return {token: ""};
  } else if (typeof action === "string") {
    return action;
  } else if (action.token || action.token === "") {
    if (typeof action.token !== "string") {
      throw createError(lexer6, "a 'token' attribute must be of type string, in rule: " + ruleName);
    } else {
      let newAction = {token: action.token};
      if (action.token.indexOf("$") >= 0) {
        newAction.tokenSubst = true;
      }
      if (typeof action.bracket === "string") {
        if (action.bracket === "@open") {
          newAction.bracket = MonarchBracket.Open;
        } else if (action.bracket === "@close") {
          newAction.bracket = MonarchBracket.Close;
        } else {
          throw createError(lexer6, "a 'bracket' attribute must be either '@open' or '@close', in rule: " + ruleName);
        }
      }
      if (action.next) {
        if (typeof action.next !== "string") {
          throw createError(lexer6, "the next state must be a string value in rule: " + ruleName);
        } else {
          let next = action.next;
          if (!/^(@pop|@push|@popall)$/.test(next)) {
            if (next[0] === "@") {
              next = next.substr(1);
            }
            if (next.indexOf("$") < 0) {
              if (!stateExists(lexer6, substituteMatches(lexer6, next, "", [], ""))) {
                throw createError(lexer6, "the next state '" + action.next + "' is not defined in rule: " + ruleName);
              }
            }
          }
          newAction.next = next;
        }
      }
      if (typeof action.goBack === "number") {
        newAction.goBack = action.goBack;
      }
      if (typeof action.switchTo === "string") {
        newAction.switchTo = action.switchTo;
      }
      if (typeof action.log === "string") {
        newAction.log = action.log;
      }
      if (typeof action._push === "string") {
        newAction._push = action._push;
      }
      if (typeof action._pop === "string") {
        newAction._pop = action._pop;
      }
      if (typeof action.mark === "string") {
        newAction.mark = action.mark;
      }
      if (typeof action.fn === "string") {
        newAction.fn = action.fn;
      }
      if (typeof action.nextEmbedded === "string") {
        newAction.nextEmbedded = action.nextEmbedded;
        lexer6.usesEmbedded = true;
      }
      return newAction;
    }
  } else if (Array.isArray(action)) {
    let results = [];
    for (let i = 0, len = action.length; i < len; i++) {
      results[i] = compileAction(lexer6, ruleName, action[i]);
    }
    return {group: results};
  } else if (action.cases) {
    let cases = [];
    for (let tkey in action.cases) {
      if (action.cases.hasOwnProperty(tkey)) {
        const val = compileAction(lexer6, ruleName, action.cases[tkey]);
        if (tkey === "@default" || tkey === "@" || tkey === "") {
          cases.push({test: void 0, value: val, name: tkey});
        } else if (tkey === "@eos") {
          cases.push({test: function(id, matches, state, eos) {
            return eos;
          }, value: val, name: tkey});
        } else {
          cases.push(createGuard(lexer6, ruleName, tkey, val));
        }
      }
    }
    const def = lexer6.defaultToken;
    return {
      test: function(id, matches, state, eos) {
        for (const _case of cases) {
          const didmatch = !_case.test || _case.test(id, matches, state, eos);
          if (didmatch) {
            return _case.value;
          }
        }
        return def;
      }
    };
  } else {
    throw createError(lexer6, "an action must be a string, an object with a 'token' or 'cases' attribute, or an array of actions; in rule: " + ruleName);
  }
}
var Rule = class {
  constructor(name) {
    this.regex = new RegExp("");
    this.action = {token: ""};
    this.matchOnlyAtLineStart = false;
    this.name = "";
    this.name = name;
    this.stats = {time: 0, count: 0, hits: 0};
  }
  setRegex(lexer6, re) {
    let sregex;
    if (typeof re === "string") {
      sregex = re;
    } else if (re instanceof RegExp) {
      sregex = re.source;
    } else {
      throw createError(lexer6, "rules must start with a match string or regular expression: " + this.name);
    }
    if (sregex.length == 2 && sregex[0] == "\\" && /[\{\}\(\)\[\]]/.test(sregex[1])) {
      this.string = sregex[1];
    }
    this.matchOnlyAtLineStart = sregex.length > 0 && sregex[0] === "^";
    this.name = this.name + ": " + sregex;
    this.regex = compileRegExp(lexer6, "^(?:" + (this.matchOnlyAtLineStart ? sregex.substr(1) : sregex) + ")");
  }
  setAction(lexer6, act) {
    this.action = compileAction(lexer6, this.name, act);
  }
};
function compile(languageId, json) {
  if (!json || typeof json !== "object") {
    throw new Error("Monarch: expecting a language definition object");
  }
  let lexer6 = {};
  lexer6.languageId = languageId;
  lexer6.noThrow = false;
  lexer6.maxStack = 100;
  lexer6.start = typeof json.start === "string" ? json.start : null;
  lexer6.ignoreCase = bool(json.ignoreCase, false);
  lexer6.tokenPostfix = string(json.tokenPostfix, "." + lexer6.languageId);
  lexer6.defaultToken = string(json.defaultToken, "source");
  lexer6.usesEmbedded = false;
  let lexerMin = json;
  lexerMin.languageId = languageId;
  lexerMin.ignoreCase = lexer6.ignoreCase;
  lexerMin.noThrow = lexer6.noThrow;
  lexerMin.usesEmbedded = lexer6.usesEmbedded;
  lexerMin.stateNames = json.tokenizer;
  lexerMin.defaultToken = lexer6.defaultToken;
  function addRules(state, newrules, rules) {
    for (const rule of rules) {
      let include = rule.include;
      if (include) {
        if (typeof include !== "string") {
          throw createError(lexer6, "an 'include' attribute must be a string at: " + state);
        }
        if (include[0] === "@") {
          include = include.substr(1);
        }
        if (!json.tokenizer[include]) {
          throw createError(lexer6, "include target '" + include + "' is not defined at: " + state);
        }
        addRules(state + "." + include, newrules, json.tokenizer[include]);
      } else {
        const newrule = new Rule(state);
        if (Array.isArray(rule) && rule.length >= 1 && rule.length <= 3) {
          newrule.setRegex(lexerMin, rule[0]);
          if (rule.length >= 3) {
            if (typeof rule[1] === "string") {
              newrule.setAction(lexerMin, {token: rule[1], next: rule[2]});
            } else if (typeof rule[1] === "object") {
              const rule1 = rule[1];
              rule1.next = rule[2];
              newrule.setAction(lexerMin, rule1);
            } else {
              throw createError(lexer6, "a next state as the last element of a rule can only be given if the action is either an object or a string, at: " + state);
            }
          } else {
            newrule.setAction(lexerMin, rule[1]);
          }
        } else {
          if (!rule.regex) {
            throw createError(lexer6, "a rule must either be an array, or an object with a 'regex' or 'include' field at: " + state);
          }
          if (rule.name) {
            if (typeof rule.name === "string") {
              newrule.name = rule.name;
            }
          }
          if (rule.matchOnlyAtStart) {
            newrule.matchOnlyAtLineStart = bool(rule.matchOnlyAtLineStart, false);
          }
          newrule.setRegex(lexerMin, rule.regex);
          newrule.setAction(lexerMin, rule.action);
        }
        newrules.push(newrule);
      }
    }
  }
  if (!json.tokenizer || typeof json.tokenizer !== "object") {
    throw createError(lexer6, "a language definition must define the 'tokenizer' attribute as an object");
  }
  lexer6.tokenizer = [];
  for (let key in json.tokenizer) {
    if (json.tokenizer.hasOwnProperty(key)) {
      if (!lexer6.start) {
        lexer6.start = key;
      }
      const rules = json.tokenizer[key];
      lexer6.tokenizer[key] = new Array();
      addRules("tokenizer." + key, lexer6.tokenizer[key], rules);
    }
  }
  lexer6.usesEmbedded = lexerMin.usesEmbedded;
  if (json.brackets) {
    if (!Array.isArray(json.brackets)) {
      throw createError(lexer6, "the 'brackets' attribute must be defined as an array");
    }
  } else {
    json.brackets = [
      {open: "{", close: "}", token: "delimiter.curly"},
      {open: "[", close: "]", token: "delimiter.square"},
      {open: "(", close: ")", token: "delimiter.parenthesis"},
      {open: "<", close: ">", token: "delimiter.angle"}
    ];
  }
  let brackets = [];
  for (let el of json.brackets) {
    let desc = el;
    if (desc && Array.isArray(desc) && desc.length === 3) {
      desc = {token: desc[2], open: desc[0], close: desc[1]};
    }
    if (desc.open === desc.close) {
      throw createError(lexer6, "open and close brackets in a 'brackets' attribute must be different: " + desc.open + "\n hint: use the 'bracket' attribute if matching on equal brackets is required.");
    }
    if (typeof desc.open === "string" && typeof desc.token === "string" && typeof desc.close === "string") {
      brackets.push({
        token: desc.token + lexer6.tokenPostfix,
        open: fixCase(lexer6, desc.open),
        close: fixCase(lexer6, desc.close)
      });
    } else {
      throw createError(lexer6, "every element in the 'brackets' array must be a '{open,close,token}' object or array");
    }
  }
  lexer6.brackets = brackets;
  lexer6.noThrow = true;
  return lexer6;
}

// src/program/monarch/token.ts
var Token = class {
  constructor(offset, type, language) {
    this.offset = offset | 0;
    this.type = type;
    this.language = language;
    this.kind = 0;
    this.mods = 0;
    this.value = null;
    this.stack = null;
  }
  toString() {
    return this.value || "";
  }
  get span() {
    return {offset: this.offset, length: this.value ? this.value.length : 0};
  }
  get indent() {
    return 0;
  }
  match(val) {
    if (typeof val == "string") {
      if (val.indexOf(" ") > 0) {
        val = val.split(" ");
      } else {
        let idx = this.type.indexOf(val);
        return val[0] == "." ? idx >= 0 : idx == 0;
      }
    }
    if (val instanceof Array) {
      for (let item of val) {
        let idx = this.type.indexOf(item);
        let hit = item[0] == "." ? idx >= 0 : idx == 0;
        if (hit)
          return true;
      }
    }
    if (val instanceof RegExp) {
      return val.test(this.type);
    }
    return false;
  }
};
var TokenizationResult = class {
  constructor(tokens, endState) {
    this.tokens = tokens;
    this.endState = endState;
  }
};

// src/program/monarch/lexer.ts
var CACHE_STACK_DEPTH = 10;
function statePart(state, index) {
  return state.split(".")[index];
}
var MonarchStackElementFactory2 = class {
  static create(parent, state) {
    return this._INSTANCE.create(parent, state);
  }
  constructor(maxCacheDepth) {
    this._maxCacheDepth = maxCacheDepth;
    this._entries = Object.create(null);
  }
  create(parent, state) {
    if (parent !== null && parent.depth >= this._maxCacheDepth) {
      return new MonarchStackElement(parent, state);
    }
    let stackElementId = MonarchStackElement.getStackElementId(parent);
    if (stackElementId.length > 0) {
      stackElementId += "|";
    }
    stackElementId += state;
    let result = this._entries[stackElementId];
    if (result) {
      return result;
    }
    result = new MonarchStackElement(parent, state);
    this._entries[stackElementId] = result;
    return result;
  }
};
var MonarchStackElementFactory = MonarchStackElementFactory2;
MonarchStackElementFactory._INSTANCE = new MonarchStackElementFactory2(CACHE_STACK_DEPTH);
var MonarchStackElement = class {
  constructor(parent, state) {
    this.parent = parent;
    this.state = state;
    this.depth = (this.parent ? this.parent.depth : 0) + 1;
  }
  static getStackElementId(element) {
    let result = "";
    while (element !== null) {
      if (result.length > 0) {
        result += "|";
      }
      result += element.state;
      element = element.parent;
    }
    return result;
  }
  static _equals(a, b) {
    while (a !== null && b !== null) {
      if (a === b) {
        return true;
      }
      if (a.state !== b.state) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    }
    if (a === null && b === null) {
      return true;
    }
    return false;
  }
  get indent() {
    return this.state.lastIndexOf("	") - this.state.indexOf("	");
  }
  get scope() {
    return this.part(2);
  }
  get detail() {
    return this.part(2);
  }
  part(index) {
    return this.state.split(".")[index];
  }
  equals(other) {
    return MonarchStackElement._equals(this, other);
  }
  push(state) {
    return MonarchStackElementFactory.create(this, state);
  }
  pop() {
    return this.parent;
  }
  popall() {
    let result = this;
    while (result.parent) {
      result = result.parent;
    }
    return result;
  }
  switchTo(state) {
    return MonarchStackElementFactory.create(this.parent, state);
  }
};
var MonarchLineStateFactory2 = class {
  static create(stack) {
    return this._INSTANCE.create(stack);
  }
  constructor(maxCacheDepth) {
    this._maxCacheDepth = maxCacheDepth;
    this._entries = Object.create(null);
  }
  create(stack) {
    if (stack !== null && stack.depth >= this._maxCacheDepth) {
      return new MonarchLineState(stack);
    }
    let stackElementId = MonarchStackElement.getStackElementId(stack);
    let result = this._entries[stackElementId];
    if (result) {
      return result;
    }
    result = new MonarchLineState(stack);
    this._entries[stackElementId] = result;
    return result;
  }
};
var MonarchLineStateFactory = MonarchLineStateFactory2;
MonarchLineStateFactory._INSTANCE = new MonarchLineStateFactory2(CACHE_STACK_DEPTH);
var MonarchLineState = class {
  constructor(stack) {
    this.stack = stack;
  }
  clone() {
    return MonarchLineStateFactory.create(this.stack);
  }
  equals(other) {
    if (!(other instanceof MonarchLineState)) {
      return false;
    }
    if (!this.stack.equals(other.stack)) {
      return false;
    }
    return true;
  }
};
var MonarchClassicTokensCollector = class {
  constructor() {
    this._tokens = [];
    this._language = null;
    this._lastToken = new Token(0, "start", "imba");
    this._lastTokenType = null;
  }
  enterMode(startOffset, modeId) {
    this._language = modeId;
  }
  emit(startOffset, type, stack) {
    if (this._lastTokenType === type && false) {
      console.log("add to last token", type);
      return this._lastToken;
    }
    let token3 = new Token(startOffset, type, this._language);
    this._lastTokenType = type;
    this._lastToken = token3;
    this._tokens.push(token3);
    return token3;
  }
  finalize(endState) {
    return new TokenizationResult(this._tokens, endState);
  }
};
var MonarchTokenizer = class {
  constructor(modeId, lexer6) {
    this._modeId = modeId;
    this._lexer = lexer6;
    this._profile = false;
  }
  dispose() {
  }
  getLoadStatus() {
    return {loaded: true};
  }
  getInitialState() {
    let rootState = MonarchStackElementFactory.create(null, this._lexer.start);
    return MonarchLineStateFactory.create(rootState);
  }
  tokenize(line, lineState, offsetDelta) {
    let tokensCollector = new MonarchClassicTokensCollector();
    let endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
    return tokensCollector.finalize(endLineState);
  }
  _tokenize(line, lineState, offsetDelta, collector) {
    return this._myTokenize(line, lineState, offsetDelta, collector);
  }
  _safeRuleName(rule) {
    if (rule) {
      return rule.name;
    }
    return "(unknown)";
  }
  _rescope(from, to, tokens, toState) {
    let a = (from || "").split("-");
    let b = (to || "").split("-");
    if (from == to)
      return;
    let diff = 1;
    while (a[diff] && a[diff] == b[diff]) {
      diff++;
    }
    let level = a.length;
    while (level > diff) {
      tokens.push("pop." + a[--level] + "." + level);
    }
    while (b.length > diff) {
      let id = "push." + b[diff++] + "." + (diff - 1);
      if (toState) {
        let indent = statePart(toState, 1);
        id += "." + indent;
      }
      tokens.push(id);
    }
  }
  _myTokenize(line, lineState, offsetDelta, tokensCollector) {
    tokensCollector.enterMode(offsetDelta, this._modeId);
    const lineLength = line.length;
    let stack = lineState.stack;
    let lastToken = null;
    let pos = 0;
    let profile = this._profile;
    let groupMatching = null;
    let forceEvaluation = true;
    let append = [];
    let tries = 0;
    let rules = [];
    let rulesState = null;
    while (forceEvaluation || pos < lineLength) {
      tries++;
      if (tries > 1e3) {
        console.log("infinite recursion");
        throw "infinite recursion in tokenizer?";
      }
      const pos0 = pos;
      const stackLen0 = stack.depth;
      const groupLen0 = groupMatching ? groupMatching.groups.length : 0;
      const state = stack.state;
      let matches = null;
      let matched = null;
      let action = null;
      let rule = null;
      if (groupMatching) {
        matches = groupMatching.matches;
        const groupEntry = groupMatching.groups.shift();
        matched = groupEntry.matched;
        action = groupEntry.action;
        rule = groupMatching.rule;
        if (groupMatching.groups.length === 0) {
          groupMatching = null;
        }
      } else {
        if (!forceEvaluation && pos >= lineLength) {
          break;
        }
        forceEvaluation = false;
        rules = this._lexer.tokenizer[state];
        if (!rules) {
          rules = findRules(this._lexer, state);
          if (!rules) {
            throw createError(this._lexer, "tokenizer state is not defined: " + state);
          }
        }
        let restOfLine = line.substr(pos);
        for (const rule2 of rules) {
          if (rule2.string !== void 0) {
            if (restOfLine[0] === rule2.string) {
              matches = [rule2.string];
              matched = rule2.string;
              action = rule2.action;
              break;
            }
          } else if (pos === 0 || !rule2.matchOnlyAtLineStart) {
            if (profile) {
              rule2.stats.count++;
              let now = performance.now();
              matches = restOfLine.match(rule2.regex);
              rule2.stats.time += performance.now() - now;
              if (matches) {
                rule2.stats.hits++;
              }
            } else {
              matches = restOfLine.match(rule2.regex);
            }
            if (matches) {
              matched = matches[0];
              action = rule2.action;
              break;
            }
          }
        }
      }
      if (!matches) {
        matches = [""];
        matched = "";
      }
      if (!action) {
        if (pos < lineLength) {
          matches = [line.charAt(pos)];
          matched = matches[0];
        }
        action = this._lexer.defaultToken;
      }
      if (matched === null) {
        break;
      }
      pos += matched.length;
      while (isFuzzyAction(action) && isIAction(action) && action.test) {
        action = action.test(matched, matches, state, pos === lineLength);
      }
      let result = null;
      if (typeof action === "string" || Array.isArray(action)) {
        result = action;
      } else if (action.group) {
        result = action.group;
      } else if (action.token !== null && action.token !== void 0) {
        if (action.tokenSubst) {
          result = substituteMatches(this._lexer, action.token, matched, matches, state);
        } else {
          result = action.token;
        }
        if (action.goBack) {
          pos = Math.max(0, pos - action.goBack);
        }
        if (action.switchTo && typeof action.switchTo === "string") {
          let nextState = substituteMatches(this._lexer, action.switchTo, matched, matches, state);
          if (nextState[0] === "@") {
            nextState = nextState.substr(1);
          }
          if (!findRules(this._lexer, nextState)) {
            throw createError(this._lexer, "trying to switch to a state '" + nextState + "' that is undefined in rule: " + this._safeRuleName(rule));
          } else {
            let from = stack.scope;
            let to = statePart(nextState, 2);
            if (from !== to)
              this._rescope(from, to, append, nextState);
            stack = stack.switchTo(nextState);
          }
        } else if (action.transform && typeof action.transform === "function") {
          throw createError(this._lexer, "action.transform not supported");
        } else if (action.next) {
          if (action.next === "@push") {
            if (stack.depth >= this._lexer.maxStack) {
              throw createError(this._lexer, "maximum tokenizer stack size reached: [" + stack.state + "," + stack.parent.state + ",...]");
            } else {
              stack = stack.push(state);
            }
          } else if (action.next === "@pop") {
            if (stack.depth <= 1) {
              throw createError(this._lexer, "trying to pop an empty stack in rule: " + this._safeRuleName(rule));
            } else {
              let prev = stack;
              stack = stack.pop();
              let from = statePart(prev.state, 2);
              let to = statePart(stack.state, 2);
              if (from !== to)
                this._rescope(from, to, append, stack.state);
            }
          } else if (action.next === "@popall") {
            stack = stack.popall();
          } else {
            let nextState = substituteMatches(this._lexer, action.next, matched, matches, state);
            if (nextState[0] === "@") {
              nextState = nextState.substr(1);
            }
            let nextScope = statePart(nextState, 2);
            if (!findRules(this._lexer, nextState)) {
              throw createError(this._lexer, "trying to set a next state '" + nextState + "' that is undefined in rule: " + this._safeRuleName(rule));
            } else {
              if (nextScope != stack.scope)
                this._rescope(stack.scope || "", nextScope, append, nextState);
              stack = stack.push(nextState);
            }
          }
        }
        if (action.log && typeof action.log === "string") {
          log(this._lexer, this._lexer.languageId + ": " + substituteMatches(this._lexer, action.log, matched, matches, state));
        }
        if (action.mark) {
          tokensCollector.emit(pos0 + offsetDelta, action.mark, stack);
        }
      }
      if (result === null) {
        throw createError(this._lexer, "lexer rule has no well-defined action in rule: " + this._safeRuleName(rule));
      }
      if (Array.isArray(result)) {
        if (groupMatching && groupMatching.groups.length > 0) {
          throw createError(this._lexer, "groups cannot be nested: " + this._safeRuleName(rule));
        }
        if (matches.length !== result.length + 1) {
          throw createError(this._lexer, "matched number of groups does not match the number of actions in rule: " + this._safeRuleName(rule));
        }
        let totalLen = 0;
        for (let i = 1; i < matches.length; i++) {
          totalLen += matches[i].length;
        }
        if (totalLen !== matched.length) {
          throw createError(this._lexer, "with groups, all characters should be matched in consecutive groups in rule: " + this._safeRuleName(rule));
        }
        groupMatching = {
          rule,
          matches,
          groups: []
        };
        for (let i = 0; i < result.length; i++) {
          groupMatching.groups[i] = {
            action: result[i],
            matched: matches[i + 1]
          };
        }
        pos -= matched.length;
        continue;
      } else {
        if (result === "@rematch") {
          pos -= matched.length;
          matched = "";
          matches = null;
          result = "";
        }
        if (matched.length === 0) {
          if (lineLength === 0 || stackLen0 !== stack.depth || state !== stack.state || (!groupMatching ? 0 : groupMatching.groups.length) !== groupLen0) {
            if (typeof result == "string" && result)
              tokensCollector.emit(pos + offsetDelta, result, stack);
            while (append.length > 0) {
              tokensCollector.emit(pos + offsetDelta, append.shift(), stack);
            }
            continue;
          } else {
            throw createError(this._lexer, "no progress in tokenizer in rule: " + this._safeRuleName(rule));
          }
        }
        let tokenType = null;
        if (isString(result) && result.indexOf("@brackets") === 0) {
          let rest = result.substr("@brackets".length);
          let bracket = findBracket(this._lexer, matched);
          if (!bracket) {
            throw createError(this._lexer, "@brackets token returned but no bracket defined as: " + matched);
          }
          tokenType = sanitize(bracket.token + rest);
        } else {
          let token4 = result === "" ? "" : result + this._lexer.tokenPostfix;
          tokenType = sanitize(token4);
        }
        let token3 = tokensCollector.emit(pos0 + offsetDelta, tokenType, stack);
        token3.stack = stack;
        if (lastToken && lastToken != token3) {
          lastToken.value = line.slice(lastToken.offset - offsetDelta, pos0);
        }
        lastToken = token3;
        while (append.length > 0) {
          tokensCollector.emit(pos + offsetDelta, append.shift(), stack);
        }
      }
    }
    if (lastToken && !lastToken.value) {
      lastToken.value = line.slice(lastToken.offset - offsetDelta);
    }
    return MonarchLineStateFactory.create(stack);
  }
};
function findBracket(lexer6, matched) {
  if (!matched) {
    return null;
  }
  matched = fixCase(lexer6, matched);
  let brackets = lexer6.brackets;
  for (const bracket of brackets) {
    if (bracket.open === matched) {
      return {token: bracket.token, bracketType: MonarchBracket.Open};
    } else if (bracket.close === matched) {
      return {token: bracket.token, bracketType: MonarchBracket.Close};
    }
  }
  return null;
}

// src/program/lexer.imba
var compiled = compile("imba", grammar);
var lexer2 = new MonarchTokenizer("imba", compiled);

// src/program/types.imba
function iter$3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var SemanticTokenTypes = [
  "comment",
  "string",
  "keyword",
  "number",
  "regexp",
  "operator",
  "namespace",
  "type",
  "struct",
  "class",
  "interface",
  "enum",
  "typeParameter",
  "function",
  "member",
  "macro",
  "variable",
  "parameter",
  "property",
  "label"
];
for (let index = 0, sys$14 = iter$3(SemanticTokenTypes), sys$22 = sys$14.length; index < sys$22; index++) {
  let key = sys$14[index];
  SemanticTokenTypes[key] = index;
}
var M = {
  Declaration: 1 << 0,
  Import: 1 << 1,
  Export: 1 << 2,
  Global: 1 << 3,
  ReadOnly: 1 << 4,
  Static: 1 << 5,
  Modification: 1 << 6,
  Deprecated: 1 << 7,
  Access: 1 << 8,
  Root: 1 << 9,
  Special: 1 << 10,
  Class: 1 << 11,
  Member: 1 << 12,
  Function: 1 << 13,
  Def: 1 << 14,
  Var: 1 << 15,
  Let: 1 << 16,
  Const: 1 << 17,
  Get: 1 << 18,
  Set: 1 << 19
};
var SemanticTokenModifiers = Object.keys(M).map(function(_0) {
  return _0.toLowerCase();
});
for (let sys$32 = 0, sys$4 = iter$3(Object.keys(M)), sys$5 = sys$4.length; sys$32 < sys$5; sys$32++) {
  let k = sys$4[sys$32];
  M[k.toLowerCase()] = M[k];
}
var CompletionTypes = {
  Keyword: 1 << 0,
  Access: 1 << 1,
  Key: 1 << 2,
  TagName: 1 << 3,
  TagEvent: 1 << 4,
  TagFlag: 1 << 5,
  TagProp: 1 << 6,
  TagEventModifier: 1 << 7,
  Value: 1 << 8,
  Path: 1 << 9,
  StyleProp: 1 << 10,
  StyleValue: 1 << 11
};
var KeywordTypes = {
  Keyword: 1 << 0,
  Root: 1 << 1,
  Class: 1 << 2,
  Block: 1 << 3
};
var Keywords = {
  and: KeywordTypes.Block,
  await: KeywordTypes.Block,
  begin: KeywordTypes.Block,
  break: KeywordTypes.Block,
  by: KeywordTypes.Block,
  case: KeywordTypes.Block,
  catch: KeywordTypes.Block,
  class: KeywordTypes.Block,
  const: KeywordTypes.Block,
  continue: KeywordTypes.Block,
  css: KeywordTypes.Class | KeywordTypes.Root,
  debugger: KeywordTypes.Block,
  def: KeywordTypes.Class | KeywordTypes.Block,
  get: KeywordTypes.Class,
  set: KeywordTypes.Class,
  delete: KeywordTypes.Block,
  do: KeywordTypes.Block,
  elif: KeywordTypes.Block,
  else: KeywordTypes.Block,
  export: KeywordTypes.Root,
  extends: KeywordTypes.Block,
  false: KeywordTypes.Block,
  finally: KeywordTypes.Block,
  for: KeywordTypes.Block,
  if: KeywordTypes.Block,
  import: KeywordTypes.Root,
  in: KeywordTypes.Block,
  instanceof: KeywordTypes.Block,
  is: KeywordTypes.Block,
  isa: KeywordTypes.Block,
  isnt: KeywordTypes.Block,
  let: KeywordTypes.Block,
  loop: KeywordTypes.Block,
  module: KeywordTypes.Block,
  nil: KeywordTypes.Block,
  no: KeywordTypes.Block,
  not: KeywordTypes.Block,
  null: KeywordTypes.Block,
  of: KeywordTypes.Block,
  or: KeywordTypes.Block,
  require: KeywordTypes.Block,
  return: KeywordTypes.Block,
  self: KeywordTypes.Block,
  static: KeywordTypes.Block | KeywordTypes.Class,
  super: KeywordTypes.Block,
  switch: KeywordTypes.Block,
  tag: KeywordTypes.Root,
  then: KeywordTypes.Block,
  this: KeywordTypes.Block,
  throw: KeywordTypes.Block,
  true: KeywordTypes.Block,
  try: KeywordTypes.Block,
  typeof: KeywordTypes.Block,
  undefined: KeywordTypes.Block,
  unless: KeywordTypes.Block,
  until: KeywordTypes.Block,
  var: KeywordTypes.Block,
  when: KeywordTypes.Block,
  while: KeywordTypes.Block,
  yes: KeywordTypes.Block
};
var SymbolKind = {
  File: 1,
  Module: 2,
  Namespace: 3,
  Package: 4,
  Class: 5,
  Method: 6,
  Property: 7,
  Field: 8,
  Constructor: 9,
  Enum: 10,
  Interface: 11,
  Function: 12,
  Variable: 13,
  Constant: 14,
  String: 15,
  Number: 16,
  Boolean: 17,
  Array: 18,
  Object: 19,
  Key: 20,
  Null: 21,
  EnumMember: 22,
  Struct: 23,
  Event: 24,
  Operator: 25,
  TypeParameter: 26
};
for (let sys$6 = 0, sys$7 = Object.keys(SymbolKind), sys$8 = sys$7.length, k, v; sys$6 < sys$8; sys$6++) {
  k = sys$7[sys$6];
  v = SymbolKind[k];
  SymbolKind[v] = k;
}

// src/program/symbol.imba
function iter$4(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$12 = Symbol.for("#init");
var SymbolFlags = {
  None: 0,
  ConstVariable: 1 << 0,
  LetVariable: 1 << 1,
  Property: 1 << 2,
  EnumMember: 1 << 3,
  Function: 1 << 4,
  Class: 1 << 5,
  LocalComponent: 1 << 6,
  GlobalComponent: 1 << 7,
  RegularEnum: 1 << 8,
  ValueModule: 1 << 9,
  Parameter: 1 << 10,
  TypeLiteral: 1 << 11,
  ObjectLiteral: 1 << 12,
  Method: 1 << 13,
  Constructor: 1 << 14,
  GetAccessor: 1 << 15,
  SetAccessor: 1 << 16,
  Signature: 1 << 17,
  TypeParameter: 1 << 18,
  TypeAlias: 1 << 19,
  ExportValue: 1 << 20,
  Alias: 1 << 21,
  Prototype: 1 << 22,
  ExportStar: 1 << 23,
  Optional: 1 << 24,
  IsSpecial: 1 << 27,
  IsImport: 1 << 28,
  IsStatic: 1 << 29,
  IsGlobal: 1 << 30,
  IsRoot: 1 << 31
};
SymbolFlags.Component = SymbolFlags.LocalComponent | SymbolFlags.GlobalComponent;
SymbolFlags.Variable = SymbolFlags.LetVariable | SymbolFlags.ConstVariable | SymbolFlags.Parameter;
SymbolFlags.Accessor = SymbolFlags.GetAccessor | SymbolFlags.SetAccessor;
SymbolFlags.ClassMember = SymbolFlags.Method | SymbolFlags.Accessor | SymbolFlags.Property;
SymbolFlags.Scoped = SymbolFlags.Function | SymbolFlags.Variable | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.LocalComponent;
SymbolFlags.Type = SymbolFlags.Component | SymbolFlags.Class;
SymbolFlags.GlobalVar = SymbolFlags.ConstVariable | SymbolFlags.IsGlobal;
SymbolFlags.SpecialVar = SymbolFlags.ConstVariable | SymbolFlags.IsSpecial;
var Conversions = [
  ["entity.name.component.local", 0, SymbolFlags.LocalComponent],
  ["entity.name.component.global", 0, SymbolFlags.GlobalComponent],
  ["entity.name.function", 0, SymbolFlags.Function],
  ["entity.name.class", 0, SymbolFlags.Class],
  ["entity.name.def", 0, SymbolFlags.Method],
  ["entity.name.get", 0, SymbolFlags.GetAccessor],
  ["entity.name.set", 0, SymbolFlags.SetAccessor],
  ["field", 0, SymbolFlags.Property],
  ["decl-let", 0, SymbolFlags.LetVariable],
  ["decl-var", 0, SymbolFlags.LetVariable],
  ["decl-param", 0, SymbolFlags.Parameter],
  ["decl-const", 0, SymbolFlags.ConstVariable],
  ["decl-import", 0, SymbolFlags.ConstVariable | SymbolFlags.IsImport]
];
var ConversionCache = {};
var Sym = class {
  [sys$12]($$ = null) {
    var $0$1;
    this.value = $$ ? $$.value : void 0;
    this.body = $$ && ($0$1 = $$.body) !== void 0 ? $0$1 : null;
  }
  static idToFlags(type, mods = 0) {
    if (ConversionCache[type] != void 0) {
      return ConversionCache[type];
    }
    ;
    for (let sys$22 = 0, sys$32 = iter$4(Conversions), sys$4 = sys$32.length; sys$22 < sys$4; sys$22++) {
      let [strtest, modtest, flags] = sys$32[sys$22];
      if (type.indexOf(strtest) >= 0) {
        return ConversionCache[type] = flags;
      }
      ;
    }
    ;
    return 0;
  }
  constructor(flags, name, node) {
    this[sys$12]();
    this.flags = flags;
    this.name = name;
    this.node = node;
  }
  get isStatic() {
    return this.node && this.node.mods & M.Static;
  }
  get isVariable() {
    return this.flags & SymbolFlags.Variable;
  }
  get isParameter() {
    return this.flags & SymbolFlags.Parameter;
  }
  get isMember() {
    return this.flags & SymbolFlags.ClassMember;
  }
  get isScoped() {
    return this.flags & SymbolFlags.Scoped;
  }
  get isType() {
    return this.flags & SymbolFlags.Type;
  }
  get isGlobal() {
    return this.flags & SymbolFlags.IsGlobal;
  }
  get isComponent() {
    return this.flags & SymbolFlags.Component;
  }
  get escapedName() {
    return this.name;
  }
  addReference(node) {
    this.references || (this.references = []);
    this.references.push(node);
    node.symbol = this;
    return this;
  }
  dereference(tok) {
    let idx = this.references.indexOf(tok);
    if (idx >= 0) {
      tok.symbol = null;
      this.references.splice(idx, 1);
    }
    ;
    return this;
  }
  get kind() {
    if (this.isVariable) {
      return SymbolKind.Variable;
    } else if (this.flags & SymbolFlags.Class) {
      return SymbolKind.Class;
    } else if (this.flags & SymbolFlags.Component) {
      return SymbolKind.Class;
    } else if (this.flags & SymbolFlags.Property) {
      return SymbolKind.Field;
    } else if (this.flags & SymbolFlags.Method) {
      if (this.escapedName == "constructor") {
        return SymbolKind.Constructor;
      } else {
        return SymbolKind.Method;
      }
      ;
    } else if (this.flags & SymbolFlags.Function) {
      return SymbolKind.Function;
    } else {
      return SymbolKind.Method;
    }
    ;
  }
  get semanticKind() {
    if (this.flags & SymbolFlags.Parameter) {
      return "parameter";
    } else if (this.isVariable) {
      return "variable";
    } else if (this.isType) {
      return "type";
    } else if (this.flags & SymbolFlags.Function) {
      return "function";
    } else if (this.isMember) {
      return "member";
    } else if (this.isComponent) {
      return "component";
    } else {
      return "variable";
    }
    ;
  }
  get semanticFlags() {
    let mods = 0;
    if (this.flags & SymbolFlags.ConstVariable) {
      mods |= M.ReadOnly;
    }
    ;
    if (this.isStatic) {
      mods |= M.Static;
    }
    ;
    if (this.flags & SymbolFlags.IsImport) {
      mods |= M.Import;
    }
    ;
    if (this.flags & SymbolFlags.IsGlobal) {
      mods |= M.Global;
    }
    ;
    if (this.flags & SymbolFlags.IsRoot) {
      mods |= M.Root;
    }
    ;
    if (this.flags & SymbolFlags.IsSpecial) {
      mods |= M.Special;
    }
    ;
    return mods;
  }
};

// src/program/scope.imba
var sys$13 = Symbol.for("#init");
var Globals = {
  global: 1,
  imba: 1,
  module: 1,
  window: 1,
  document: 1,
  exports: 1,
  console: 1,
  process: 1,
  parseInt: 1,
  parseFloat: 1,
  setTimeout: 1,
  setInterval: 1,
  setImmediate: 1,
  clearTimeout: 1,
  clearInterval: 1,
  clearImmediate: 1,
  globalThis: 1,
  isNaN: 1,
  isFinite: 1,
  __dirname: 1,
  __filename: 1
};
var Node = class {
  [sys$13]($$ = null) {
    var $0$1;
    this.type = $$ && ($0$1 = $$.type) !== void 0 ? $0$1 : "";
    this.start = $$ ? $$.start : void 0;
    this.end = $$ ? $$.end : void 0;
    this.parent = $$ ? $$.parent : void 0;
  }
  constructor(doc, token3, parent, type) {
    this[sys$13]();
    this.doc = doc;
    this.start = token3;
    this.end = null;
    this.type = type;
    this.parent = parent;
    this.$name = null;
    token3.scope = this;
  }
  pop(end) {
    this.end = end;
    end.start = this.start;
    end.pops = this;
    this.start.end = end;
    this.visit();
    return this.parent;
  }
  find(pattern) {
    return this.findChildren(pattern)[0];
  }
  findChildren(pattern) {
    let found = [];
    let tok = this.start;
    while (tok) {
      if (tok.scope && tok.scope != this) {
        if (tok.scope.match(pattern)) {
          found.push(tok.scope);
        }
        ;
        tok = tok.scope.next;
        continue;
      }
      ;
      if (tok.match(pattern)) {
        found.push(tok);
      }
      ;
      if (tok == this.end) {
        break;
      }
      ;
      tok = tok.next;
    }
    ;
    return found;
  }
  closest(ref) {
    if (this.match(ref)) {
      return this;
    }
    ;
    return this.parent ? this.parent.closest(ref) : null;
  }
  visit() {
    return this;
  }
  get isMember() {
    return false;
  }
  get isTop() {
    return false;
  }
  get selfScope() {
    return this.isMember || this.isTop ? this : this.parent.selfScope;
  }
  get name() {
    return this.$name || "";
  }
  get value() {
    return this.doc.content.slice(this.start.offset, this.end ? this.end.offset : -1);
  }
  get next() {
    return this.end ? this.end.next : null;
  }
  match(query) {
    if (typeof query == "string") {
      return this.type.indexOf(query) >= 0;
    } else if (query instanceof RegExp) {
      return query.test(this.type);
    } else if (query instanceof Function) {
      return query(this);
    }
    ;
    return true;
  }
};
var Group = class extends Node {
  constructor(doc, token3, parent, type, parts = []) {
    super(doc, token3, parent, type);
  }
  get scope() {
    return this.parent.scope;
  }
  get varmap() {
    return this.parent.varmap;
  }
  register(symbol3) {
    return this.parent.register(symbol3);
  }
  lookup(...params) {
    return this.parent.lookup(...params);
  }
};
var TagNode = class extends Group {
  get name() {
    return this.findChildren("tag.name").join("");
  }
  get outline() {
    return this.findChildren(/tag\.(reference|name|id|white|flag|event(?!\-))/).join("");
  }
};
var ValueNode = class extends Group {
};
var StyleNode = class extends Group {
  get properties() {
    return this.findChildren("styleprop");
  }
};
var StyleRuleNode = class extends Group {
};
var Scope = class extends Node {
  constructor(doc, token3, parent, type, parts = []) {
    super(doc, token3, parent, type);
    this.children = [];
    this.entities = [];
    this.refs = [];
    this.varmap = Object.create(parent ? parent.varmap : {});
    if (this instanceof Root) {
      for (let sys$22 = 0, sys$32 = Object.keys(Globals), sys$4 = sys$32.length, key, val; sys$22 < sys$4; sys$22++) {
        key = sys$32[sys$22];
        val = Globals[key];
        let tok = {value: key, offset: -1, mods: 0};
        this.varmap[key] = new Sym(SymbolFlags.GlobalVar, key, tok);
      }
      ;
    }
    ;
    this.indent = parts[3] ? parts[3].length : 0;
    this.setup();
    return this;
  }
  closest(ref) {
    if (this.match(ref)) {
      return this;
    }
    ;
    return this.parent ? this.parent.closest(ref) : null;
  }
  match(query) {
    if (typeof query == "string") {
      return this.type.indexOf(query) >= 0;
    } else if (query instanceof RegExp) {
      return query.test(this.type);
    } else if (query instanceof Function) {
      return query(this);
    }
    ;
    return true;
  }
  setup() {
    if (this.isHandler) {
      this.varmap.e = new Sym(SymbolFlags.SpecialVar, "e");
    }
    ;
    if (this.isClass || this.isProperty) {
      this.ident = this.token = prevToken(this.start, "entity.");
      if (this.ident) {
        this.ident.body = this;
      }
      ;
      if (this.ident && this.ident.type == "entity.name.def.render") {
        this.$name = "render";
        if (this.ident.symbol) {
          return this.ident.symbol.name = "render";
        }
        ;
      }
      ;
    }
    ;
  }
  get path() {
    let par = this.parent ? this.parent.path : "";
    if (this.isProperty) {
      let sep = this.isStatic ? "." : "#";
      return this.parent ? "" + this.parent.path + sep + this.name : this.name;
    }
    ;
    if (this.isComponent) {
      return pascalCase(this.name + "Component");
    }
    ;
    if (this.isClass) {
      return this.name;
    }
    ;
    return par;
  }
  get allowedKeywordTypes() {
    if (this.isClass) {
      return KeywordTypes.Class;
    } else if (this.isRoot) {
      return KeywordTypes.Root | KeywordTypes.Block;
    } else {
      return KeywordTypes.Block;
    }
    ;
  }
  get isComponent() {
    return !!this.type.match(/^component/);
  }
  get isRoot() {
    return this instanceof Root;
  }
  get isTop() {
    return this instanceof Root;
  }
  get isClass() {
    return !!this.type.match(/^class/) || this.isComponent;
  }
  get isDef() {
    return !!this.type.match(/def|get|set/);
  }
  get isStatic() {
    return this.ident && this.ident.mods & M.Static;
  }
  get isHandler() {
    return !!this.type.match(/handler|spy/);
  }
  get isMember() {
    return !!this.type.match(/def|get|set/);
  }
  get isProperty() {
    return !!this.type.match(/def|get|set/);
  }
  get isFlow() {
    return !!this.type.match(/if|else|elif|unless|for|while|until/);
  }
  get isClosure() {
    return !!this.type.match(/class|component|def|get|set|do/);
  }
  get scope() {
    return this;
  }
  get name() {
    return this.$name || (this.ident ? this.ident.value : "");
  }
  visit() {
    return this;
  }
  register(symbol3) {
    if (symbol3.isScoped) {
      this.varmap[symbol3.name] = symbol3;
      if (this.isRoot) {
        symbol3.flags |= SymbolFlags.IsRoot;
      }
      ;
    }
    ;
    return symbol3;
  }
  lookup(token3, kind = SymbolFlags.Scoped) {
    let variable;
    let name = token3.value;
    if (name[name.length - 1] == "!") {
      name = name.slice(0, -1);
    }
    ;
    if (variable = this.varmap[name]) {
      return variable;
    }
    ;
    return null;
  }
  toOutline() {
    return {
      kind: this.type,
      name: this.name,
      children: [],
      span: this.ident ? this.ident.span : this.start.span
    };
  }
};
var Root = class extends Scope {
};
var SelectorNode = class extends Group {
};
var StylePropKey = class extends Group {
  get propertyName() {
    var _a;
    if (this.start.next.match("style.property.name")) {
      return this.start.next.value;
    } else {
      return (_a = this.parent.prevProperty) == null ? void 0 : _a.propertyName;
    }
    ;
  }
  get styleValue() {
    return true;
  }
};
var StylePropValue = class extends Group {
};
var StylePropNode = class extends Group {
  get prevProperty() {
    if (this.start.prev.pops) {
      return this.start.prev.pops;
    }
    ;
    return null;
  }
  get propertyName() {
    let name = this.find("stylepropkey");
    return name ? name.propertyName : null;
  }
};
var PathNode = class extends Group {
};
var ScopeTypeMap = {
  style: StyleNode,
  tag: TagNode,
  stylerule: StyleRuleNode,
  sel: SelectorNode,
  path: PathNode,
  value: ValueNode,
  styleprop: StylePropNode,
  stylepropkey: StylePropKey,
  stylevalue: StylePropValue
};

// src/program/document.imba
function iter$5(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var ImbaDocument = class {
  static tmp(content) {
    return new this("file://temporary.imba", "imba", 0, content);
  }
  static from(uri, languageId, version, content) {
    return new this(uri, languageId, version, content);
  }
  constructor(uri, languageId, version, content) {
    this.uri = uri;
    this.languageId = languageId;
    this.version = version;
    this.content = content;
    this.connection = null;
    this.lineTokens = [];
    this.isLegacy = languageId == "imba1" || uri && uri.match(/\.imba1$/);
    this.head = this.seed = new Token(0, "eol", "imba");
    this.seed.stack = lexer2.getInitialState();
    this.history = [];
    this.tokens = [];
    this.versionToHistoryMap = {};
    this.versionToHistoryMap[version] = -1;
    if (content && content.match(/^\#[^\n]+imba1/m)) {
      this.isLegacy = true;
    }
    ;
  }
  log(...params) {
    return console.log(...params);
  }
  get lineCount() {
    return this.lineOffsets.length;
  }
  get lineOffsets() {
    return this._lineOffsets || (this._lineOffsets = computeLineOffsets(this.content, true));
  }
  getText(range = null) {
    if (range) {
      var start = this.offsetAt(range.start);
      var end = this.offsetAt(range.end);
      return this.content.substring(start, end);
    }
    ;
    return this.content;
  }
  getLineText(line) {
    let start = this.lineOffsets[line];
    let end = this.lineOffsets[line + 1];
    return this.content.substring(start, end).replace(/[\r\n]/g, "");
  }
  positionAt(offset) {
    if (offset instanceof Position) {
      return offset;
    }
    ;
    if (typeof offset == "object") {
      offset = offset.offset;
    }
    ;
    offset = Math.max(Math.min(offset, this.content.length), 0);
    let lineOffsets = this.lineOffsets;
    let low = 0;
    let high = lineOffsets.length;
    if (high === 0) {
      return new Position(0, offset, offset);
    }
    ;
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
      ;
    }
    ;
    var line = low - 1;
    return new Position(line, offset - lineOffsets[line], offset);
  }
  offsetAt(position) {
    if (position.offset) {
      return position.offset;
    }
    ;
    var lineOffsets = this.lineOffsets;
    if (position.line >= lineOffsets.length) {
      return this.content.length;
    } else if (position.line < 0) {
      return 0;
    }
    ;
    var lineOffset = lineOffsets[position.line];
    var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this.content.length;
    return position.offset = Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  }
  rangeAt(start, end) {
    return new Range(this.positionAt(start), this.positionAt(end));
  }
  overwrite(body, newVersion) {
    this.version = newVersion || this.version + 1;
    this.content = body;
    this._lineOffsets = null;
    this.invalidateFromLine(0);
    return this;
  }
  update(changes, version) {
    let edits = [];
    for (let i = 0, sys$14 = iter$5(changes), sys$4 = sys$14.length; i < sys$4; i++) {
      let change = sys$14[i];
      if (editIsFull(change)) {
        this.overwrite(change.text, version);
        edits.push([0, this.content.length, change.text]);
        continue;
      }
      ;
      var range = getWellformedRange(change.range);
      var startOffset = this.offsetAt(range.start);
      var endOffset = this.offsetAt(range.end);
      change.range = range;
      change.offset = startOffset;
      change.length = endOffset - startOffset;
      range.start.offset = startOffset;
      range.end.offset = endOffset;
      this.applyEdit(change, version, changes);
      edits.push([startOffset, endOffset - startOffset, change.text || ""]);
      var startLine = Math.max(range.start.line, 0);
      var endLine = Math.max(range.end.line, 0);
      var lineOffsets = this.lineOffsets;
      var addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
      if (endLine - startLine === addedLineOffsets.length) {
        for (let k = 0, sys$22 = iter$5(addedLineOffsets), sys$32 = sys$22.length; k < sys$32; k++) {
          let added = sys$22[k];
          lineOffsets[k + startLine + 1] = addedLineOffsets[i];
        }
        ;
      } else {
        if (addedLineOffsets.length < 1e4) {
          lineOffsets.splice.apply(lineOffsets, [startLine + 1, endLine - startLine].concat(addedLineOffsets));
        } else {
          this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
        }
        ;
      }
      ;
      var diff = change.text.length - (endOffset - startOffset);
      if (diff !== 0) {
        let k = startLine + 1 + addedLineOffsets.length;
        while (k < lineOffsets.length) {
          lineOffsets[k] = lineOffsets[k] + diff;
          k++;
        }
        ;
      }
      ;
    }
    ;
    this.history.push(edits);
    this.versionToHistoryMap[version] = this.history.length - 1;
    return this.updated(changes, version);
  }
  offsetAtVersion(fromOffset, fromVersion, toVersion = this.version) {
    let from = this.versionToHistoryMap[fromVersion];
    let to = this.versionToHistoryMap[toVersion];
    let offset = fromOffset;
    let modified = false;
    if (from < to) {
      while (from < to) {
        let edits = this.history[++from];
        for (let sys$5 = 0, sys$6 = iter$5(edits), sys$7 = sys$6.length; sys$5 < sys$7; sys$5++) {
          let [start, len, text] = sys$6[sys$5];
          if (start > offset) {
            continue;
          }
          ;
          if (offset > start && offset > start + len) {
            offset += text.length - len;
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    return offset;
  }
  applyEdit(change, version, changes) {
    this.content = this.content.substring(0, change.range.start.offset) + change.text + this.content.substring(change.range.end.offset, this.content.length);
    let line = change.range.start.line;
    let caret = change.range.start.character + 1;
    this.invalidateFromLine(line);
    if (changes.length == 1 && change.text == "<") {
      let text = this.getLineText(line);
      let matcher = text.slice(0, caret) + "\xA7" + text.slice(caret);
      if (matcher.match(/(^\t*|[\=\>]\s+)\<\§(?!\s*\>)/)) {
        if (this.connection) {
          this.connection.sendNotification("closeAngleBracket", {uri: this.uri});
        }
        ;
      }
      ;
    }
    ;
    return;
  }
  updated(changes, version) {
    this.version = version;
    return this;
  }
  invalidateFromLine(line) {
    this.head = this.seed;
    this.tokens = [];
    return this;
  }
  after(token3, match) {
    let idx = this.tokens.indexOf(token3);
    if (match) {
      while (idx < this.tokens.length) {
        let tok = this.tokens[++idx];
        if (tok && this.matchToken(tok, match)) {
          return tok;
        }
        ;
      }
      ;
      return null;
    }
    ;
    return this.tokens[idx + 1];
  }
  matchToken(token3, match) {
    if (match instanceof RegExp) {
      return token3.type.match(match);
    } else if (typeof match == "string") {
      return token3.type == match;
    }
    ;
    return false;
  }
  before(token3, match, offset = 0) {
    let idx = this.tokens.indexOf(token3) + offset;
    if (match) {
      while (idx > 0) {
        let tok = this.tokens[--idx];
        if (this.matchToken(tok, match)) {
          return tok;
        }
        ;
      }
      ;
      return null;
    }
    ;
    return this.tokens[idx - 1];
  }
  getTokenRange(token3) {
    return {start: this.positionAt(token3.offset), end: this.positionAt(token3.offset + token3.value.length)};
  }
  getTokensInScope(scope2) {
    let start = this.tokens.indexOf(scope2.token);
    let end = scope2.endIndex || this.tokens.length;
    let i = start;
    let parts = [];
    while (i < end) {
      let tok = this.tokens[i++];
      if (tok.scope && tok.scope != scope2) {
        parts.push(tok.scope);
        i = tok.scope.endIndex + 1;
      } else {
        parts.push(tok);
      }
      ;
    }
    ;
    return parts;
  }
  getTokenAtOffset(offset, forwardLooking = false) {
    return this.tokenAtOffset(offset);
    let pos = this.positionAt(offset);
    this.getTokens(pos);
    let line = this.lineTokens[pos.line];
    let idx = line.index;
    let token3;
    let prev;
    while (token3 = this.tokens[idx++]) {
      if (forwardLooking && token3.offset == offset) {
        return token3;
      }
      ;
      if (token3.offset >= offset) {
        break;
      }
      ;
      prev = token3;
    }
    ;
    return prev || token3;
  }
  getSemanticTokens(filter = SymbolFlags.Scoped) {
    let tokens = this.parse();
    let items = [];
    for (let i = 0, sys$8 = iter$5(tokens), sys$9 = sys$8.length; i < sys$9; i++) {
      let tok = sys$8[i];
      let sym = tok.symbol;
      if (!(sym && (!filter || sym.flags & filter))) {
        continue;
      }
      ;
      let typ = SemanticTokenTypes[sym.semanticKind];
      let mods = tok.mods | sym.semanticFlags;
      items.push([tok.offset, tok.value.length, typ, mods]);
    }
    ;
    return items;
  }
  getEncodedSemanticTokens() {
    let tokens = this.getSemanticTokens();
    let out = [];
    let l = 0;
    let c = 0;
    for (let sys$10 = 0, sys$11 = iter$5(tokens), sys$122 = sys$11.length; sys$10 < sys$122; sys$10++) {
      let item = sys$11[sys$10];
      let pos = this.positionAt(item[0]);
      let dl = pos.line - l;
      let chr = dl ? pos.character : pos.character - c;
      out.push(dl, chr, item[1], item[2], item[3]);
      l = pos.line;
      c = pos.character;
    }
    ;
    return out;
  }
  tokenAtOffset(offset) {
    let tok = this.tokens[0];
    while (tok) {
      let next = tok.next;
      if (tok.offset >= offset) {
        return tok.prev;
      }
      ;
      if (tok.end && tok.end.offset < offset) {
        tok = tok.end;
      } else if (next) {
        tok = next;
      } else {
        return tok;
      }
      ;
    }
    ;
    return tok;
  }
  patternAtOffset(offset, matcher = /[\w\-\.\%]/) {
    let from = offset;
    let to = offset;
    let str = this.content;
    while (from > 0 && matcher.test(this.content[from - 1])) {
      from--;
    }
    ;
    while (matcher.test(this.content[to + 1] || "")) {
      to++;
    }
    ;
    let value = str.slice(from, to + 1);
    return [value, from, to];
  }
  adjustmentAtOffset(offset, amount = 1) {
    let [word, start, end] = this.patternAtOffset(offset);
    let [pre, post] = word.split(/[\d\.]+/);
    let num = parseFloat(word.slice(pre.length).slice(0, post.length ? -post.length : 1e3));
    if (!Number.isNaN(num)) {
      num += amount;
      return [start + pre.length, word.length - pre.length - post.length, String(num)];
    }
    ;
    return null;
  }
  contextAtOffset(offset) {
    var sys$132;
    this.ensureParsed();
    let pos = this.positionAt(offset);
    let tok = this.tokenAtOffset(offset);
    let linePos = this.lineOffsets[pos.line];
    let tokPos = offset - tok.offset;
    let ctx = tok.context;
    let tabs = prevToken(tok, "white.tabs");
    let indent = tabs ? tabs.value.length : 0;
    let group = ctx;
    let scope2 = ctx.scope;
    let meta = {};
    const before = {
      character: this.content[offset - 1],
      line: this.content.slice(linePos, offset),
      token: tok.value.slice(0, tokPos)
    };
    const after = {
      character: this.content[offset],
      token: tok.value.slice(tokPos),
      line: this.content.slice(offset, this.lineOffsets[pos.line + 1]).replace(/[\r\n]+/, "")
    };
    if (group) {
      if (group.start) {
        before.group = this.content.slice(group.start.offset, offset);
      }
      ;
      if (group.end) {
        after.group = this.content.slice(offset, group.end.offset);
      }
      ;
    }
    ;
    let suggest = {
      keywords: []
    };
    let flags = 0;
    if (tok == tabs) {
      indent = tokPos;
    }
    ;
    while (scope2.indent > indent) {
      scope2 = scope2.parent;
    }
    ;
    if (group.type == "tag") {
      true;
    }
    ;
    if (tok.match("entity string regexp comment style.")) {
      flags = 0;
    }
    ;
    if (tok.match("operator.access")) {
      flags |= CompletionTypes.Access;
    }
    ;
    if (tok.match("identifier tag.operator.equals br white")) {
      flags |= CompletionTypes.Value;
    }
    ;
    if (tok.match("tag.name tag.open")) {
      flags |= CompletionTypes.TagName;
    } else if (tok.match("tag.attr tag.white")) {
      flags |= CompletionTypes.TagProp;
    } else if (tok.match("tag.flag")) {
      flags |= CompletionTypes.TagFlag;
    } else if (tok.match("tag.event.modifier")) {
      flags |= CompletionTypes.TagEventModifier;
    } else if (tok.match("tag.event")) {
      flags |= CompletionTypes.TagEvent;
    }
    ;
    if (tok.match("style.property.operator") || group.closest("stylevalue")) {
      flags |= CompletionTypes.StyleValue;
      try {
        suggest.styleProperty = group.closest("styleprop").propertyName;
      } catch (e) {
      }
      ;
    }
    ;
    if (tok.match("style.open style.property.name")) {
      flags |= CompletionTypes.StyleProp;
    }
    ;
    if (tok.match("style.value.white") || tok.prev && tok.prev.match("style.value.white")) {
      flags |= CompletionTypes.StyleProp;
    }
    ;
    if (tok.match("style.selector.element") && after.line.match(/^\s*$/)) {
      flags |= CompletionTypes.StyleProp;
    }
    ;
    let kfilter = scope2.allowedKeywordTypes;
    sys$132 = [];
    for (let sys$14 = 0, sys$15 = Object.keys(Keywords), sys$16 = sys$15.length, key, v; sys$14 < sys$16; sys$14++) {
      key = sys$15[sys$14];
      v = Keywords[key];
      if (!(v & kfilter)) {
        continue;
      }
      ;
      sys$132.push(key);
    }
    ;
    suggest.keywords = sys$132;
    suggest.flags = flags;
    let out = {
      token: tok,
      offset,
      position: pos,
      linePos,
      scope: scope2,
      indent,
      group: ctx,
      mode: "",
      path: scope2.path,
      suggest,
      before,
      after
    };
    return out;
  }
  textBefore(offset) {
    let before = this.content.slice(0, offset);
    let ln = before.lastIndexOf("\n");
    return before.slice(ln + 1);
  }
  varsAtOffset(offset, isGlobals = false) {
    let tok = this.tokenAtOffset(offset);
    let vars = [];
    let scope2 = tok.context.scope;
    let names = {};
    while (scope2) {
      for (let sys$17 = 0, sys$18 = iter$5(Object.values(scope2.varmap)), sys$19 = sys$18.length; sys$17 < sys$19; sys$17++) {
        let item = sys$18[sys$17];
        if (item.isGlobal && !isGlobals) {
          continue;
        }
        ;
        if (names[item.name]) {
          continue;
        }
        ;
        if (item.node.offset < offset) {
          vars.push(item);
          names[item.name] = item;
        }
        ;
      }
      ;
      scope2 = scope2.parent;
    }
    ;
    return vars;
  }
  getOutline(walker = null) {
    var $0$1, $0$2, $0$3, $0$4;
    if (this.isLegacy) {
      let symbols2 = fastExtractSymbols(this.content);
      for (let sys$20 = 0, sys$21 = iter$5(symbols2.all), sys$22 = sys$21.length; sys$20 < sys$22; sys$20++) {
        let item = sys$21[sys$20];
        $0$1 = item.parent, delete item.parent, $0$1;
        item.path = item.name;
        item.name = item.ownName;
        if (walker) {
          walker(item, symbols2.all);
        }
        ;
      }
      ;
      return symbols2;
    }
    ;
    this.ensureParsed();
    let t = Date.now();
    let all = [];
    let root = {children: []};
    let curr = root;
    let scop = null;
    let last = {};
    let symbols = new Set();
    let awaitScope = null;
    function add(item, tok) {
      if (item instanceof Sym) {
        symbols.add(item);
        item = {
          name: item.name,
          kind: item.kind
        };
      }
      ;
      last = item;
      item.token = tok;
      item.children || (item.children = []);
      item.span || (item.span = tok.span);
      item.name || (item.name = tok.value);
      all.push(item);
      return curr.children.push(item);
    }
    ;
    function push(end) {
      last.children || (last.children = []);
      last.parent || (last.parent = curr);
      curr = last;
      return curr.end = end;
    }
    ;
    function pop(tok) {
      return curr = curr.parent;
    }
    ;
    for (let i = 0, sys$23 = iter$5(this.tokens), sys$24 = sys$23.length; i < sys$24; i++) {
      let token3 = sys$23[i];
      let sym = token3.symbol;
      let scope2 = token3.scope;
      if (token3.type == "key") {
        add({kind: SymbolKind.Key}, token3);
      } else if (sym) {
        if (sym.isParameter) {
          continue;
        }
        ;
        if (!symbols.has(sym)) {
          add(sym, token3);
        }
        ;
        if (sym.body) {
          awaitScope = sym.body.start;
        }
        ;
      } else if (scope2 && scope2.type == "do") {
        let pre = this.textBefore(token3.offset - 3).replace(/^\s*(return\s*)?/, "");
        pre += " callback";
        add({kind: SymbolKind.Function, name: pre}, token3.prev);
        awaitScope = token3;
      } else if (scope2 && scope2.type == "tag") {
        add({kind: SymbolKind.Field, name: scope2.outline}, token3);
      }
      ;
      if (token3 == awaitScope) {
        push(token3.end);
      }
      ;
      if (token3 == curr.end) {
        pop();
      }
      ;
    }
    ;
    for (let sys$25 = 0, sys$26 = iter$5(all), sys$27 = sys$26.length; sys$25 < sys$27; sys$25++) {
      let item = sys$26[sys$25];
      if (item.span) {
        let len = item.span.length;
        item.span.start = this.positionAt(item.span.offset);
        item.span.end = len ? this.positionAt(item.span.offset + len) : item.span.start;
      }
      ;
      if (walker) {
        walker(item, all);
      }
      ;
      $0$2 = item.parent, delete item.parent, $0$2;
      $0$3 = item.end, delete item.end, $0$3;
      $0$4 = item.token, delete item.token, $0$4;
    }
    ;
    return root;
  }
  getContextAtOffset(offset, forwardLooking = false) {
    return this.contextAtOffset(offset);
  }
  ensureParsed() {
    if (this.head.offset == 0) {
      this.parse();
    }
    ;
    return this;
  }
  reparse() {
    this.invalidateFromLine(0);
    return this.parse();
  }
  parse() {
    let head = this.seed;
    if (head != this.head) {
      return this.tokens;
    }
    ;
    let t0 = Date.now();
    let raw = this.content;
    let lines = this.lineOffsets;
    let tokens = [];
    let prev = head;
    let entity = null;
    let scope2 = new Root(this, this.seed, null, "root");
    let log2 = console.log.bind(console);
    let lastDecl = null;
    let lastVarKeyword = null;
    let lastVarAssign = null;
    let legacy = this.isLegacy;
    if (this.isLegacy) {
      raw = raw.replace(/\@\w/g, function(m) {
        return "\xB6" + m.slice(1);
      });
      raw = raw.replace(/\w\:(?=\w)/g, function(m) {
        return m[0] + ".";
      });
      raw = raw.replace(/(do)(\s?)\|([^\|]*)\|/g, function(m, a, space, b) {
        return a + "(" + (space || "") + b + ")";
      });
    }
    ;
    log2 = function() {
      return true;
    };
    try {
      for (let i = 0, sys$28 = iter$5(lines), sys$31 = sys$28.length; i < sys$31; i++) {
        let line = sys$28[i];
        let entityFlags = 0;
        let next = lines[i + 1];
        let str = raw.slice(line, next || raw.length);
        let lexed = lexer2.tokenize(str, head.stack, line);
        for (let ti = 0, sys$29 = iter$5(lexed.tokens), sys$30 = sys$29.length; ti < sys$30; ti++) {
          let tok = sys$29[ti];
          let types4 = tok.type.split(".");
          let value = tok.value;
          let nextToken = lexed.tokens[ti + 1];
          let [typ, subtyp, sub2] = types4;
          let decl = 0;
          tokens.push(tok);
          if (typ == "ivar") {
            value = tok.value = "@" + value.slice(1);
          }
          ;
          if (prev) {
            prev.next = tok;
            tok.prev = prev;
            tok.context = scope2;
          }
          ;
          if (typ == "operator") {
            tok.op = tok.value.trim();
          }
          ;
          if (typ == "keyword") {
            if (M[subtyp]) {
              entityFlags |= M[subtyp];
            }
            ;
            if (value == "let" || value == "const") {
              lastVarKeyword = tok;
              lastVarAssign = null;
            }
            ;
          }
          ;
          if (typ == "entity") {
            tok.mods |= entityFlags;
            entityFlags = 0;
          }
          ;
          if (typ == "push") {
            let scopetype = subtyp;
            let idx = subtyp.lastIndexOf("_");
            let ctor = idx >= 0 ? Group : Scope;
            if (idx >= 0) {
              scopetype = scopetype.slice(idx + 1);
              ctor = ScopeTypeMap[scopetype] || Group;
            } else if (ScopeTypeMap[scopetype]) {
              ctor = ScopeTypeMap[scopetype];
            }
            ;
            scope2 = tok.scope = new ctor(this, tok, scope2, scopetype, types4);
            if (lastDecl) {
              lastDecl.body = scope2;
              scope2.symbol = lastDecl;
              lastDecl = null;
            }
            ;
            if (scope2 == scope2.scope) {
              lastVarKeyword = null;
              lastVarAssign = null;
            }
            ;
            ctor;
          } else if (typ == "pop") {
            if (subtyp == "value") {
              lastVarAssign = null;
            }
            ;
            scope2 = scope2.pop(tok);
          } else if (subtyp == "open" && ScopeTypeMap[typ]) {
            scope2 = tok.scope = new ScopeTypeMap[typ](this, tok, scope2, typ, types4);
          } else if (subtyp == "close" && ScopeTypeMap[typ]) {
            scope2 = scope2.pop(tok);
          }
          ;
          if (tok.match(/entity\.name|decl-|field/)) {
            let symFlags = Sym.idToFlags(tok.type, tok.mods);
            if (symFlags) {
              lastDecl = tok.symbol = new Sym(symFlags, tok.value, tok);
              tok.symbol.keyword = lastVarKeyword;
              scope2.register(tok.symbol);
            }
            ;
            tok.mods |= M.Declaration;
          }
          ;
          if (subtyp == "declval") {
            lastVarAssign = tok;
          }
          ;
          if (tok.match("identifier") && !tok.symbol) {
            let sym = scope2.lookup(tok, lastVarKeyword);
            if (sym && sym.isScoped) {
              if (lastVarAssign && sym.keyword == lastVarKeyword) {
                true;
              } else {
                sym.addReference(tok);
              }
              ;
            }
            ;
            if (prev && prev.op == "=" && sym) {
              let lft = prev.prev;
              if (lft && lft.symbol == sym) {
                if (lft.mods & M.Declaration) {
                  sym.dereference(tok);
                } else if (!nextToken || nextToken.match("br")) {
                  sym.dereference(lft);
                }
                ;
              }
              ;
            }
            ;
          }
          ;
          prev = tok;
        }
        ;
        head = new Token(next || this.content.length, "eol", "imba");
        head.stack = lexed.endState;
      }
      ;
    } catch (e) {
      console.log("parser crashed", e);
    }
    ;
    this.head = head;
    this.tokens = tokens;
    return tokens;
  }
  getTokens(range = null) {
    this.parse();
    return this.tokens;
  }
  migrateToImba2() {
    let source = this.content;
    source = source.replace(/\bdef self\./g, "static def ");
    source = source.replace(/\b(var|let|const) def /g, "def ");
    source = source.replace(/\?\./g, "..");
    source = source.replace(/def ([\w\-]+)\=/g, "set $1");
    source = source.replace(/do\s?\|([^\|]+)\|/g, "do($1)");
    source = source.replace(/(prop) ([\w\-]+) (.+)$/gm, function(m, typ, name, rest) {
      var $0$5, $0$6;
      let opts = {};
      rest.split(/,\s*/).map(function(_0) {
        return _0.split(/\:\s*/);
      }).map(function(_0) {
        return opts[_0[0]] = _0[1];
      });
      let out = "" + typ + " " + name;
      if (opts.watch && opts.watch[0].match(/[\'\"\:]/)) {
        out = "@watch(" + opts.watch + ") " + out;
      } else if (opts.watch) {
        out = "@watch " + out;
      }
      ;
      $0$5 = opts.watch, delete opts.watch, $0$5;
      if (opts.default) {
        out = "" + out + " = " + opts.default;
        $0$6 = opts.default, delete opts.default, $0$6;
      }
      ;
      if (Object.keys(opts).length) {
        console.log("more prop values", m, opts);
      }
      ;
      return out;
    });
    let doc = ImbaDocument.tmp(source);
    let tokens = doc.getTokens();
    let ivarPrefix = "";
    for (let i = 0, sys$32 = iter$5(tokens), sys$33 = sys$32.length; i < sys$33; i++) {
      let token3 = sys$32[i];
      let next = tokens[i + 1];
      let {value, type, offset} = token3;
      let end = offset + value.length;
      if (type == "operator.dot.legacy") {
        value = ".";
        if (next) {
          next.access = true;
        }
        ;
      }
      ;
      if (type == "operator.spread.legacy") {
        value = "...";
      }
      ;
      if (type == "identifier.tagname") {
        if (value.indexOf(":") >= 0) {
          value = value.replace(":", "-");
        }
        ;
      }
      ;
      if (type == "identifier.def.propname" && value == "initialize") {
        value = "constructor";
      }
      ;
      if (type == "decorator" && !source.slice(end).match(/^\s(prop|def|get|set)/)) {
        value = ivarPrefix + value.slice(1);
      }
      ;
      if (type == "property") {
        if (value[0] == "@") {
          value = value.replace(/^\@/, ivarPrefix);
          token3.access = true;
        } else if (value == "len") {
          value = "length";
        } else if (/^(\n|\s\:|\)|\,|\.)/.test(source.slice(end)) && !token3.access) {
          if (value[0] == value[0].toLowerCase()) {
            value = value + "!";
          }
          ;
        }
        ;
      }
      ;
      if (type == "identifier" && !token3.access && value[0] == value[0].toLowerCase() && value[0] != "_") {
        if (!token3.variable && /^(\n|\s\:|\)|\,|\.)/.test(source.slice(end)) && value != "new") {
          value = value + "!";
        }
        ;
      }
      ;
      token3.value = value;
    }
    ;
    return tokens.map(function(_0) {
      return _0.value;
    }).join("");
  }
};

// src/compiler/compiler.imba1
var lexer5 = require_lexer();
var rewriter = require_rewriter();
var parser2 = exports.parser = require_parser().parser;

// vendor/css-selector-parser.js
function CssSelectorParser() {
  this.pseudos = {};
  this.attrEqualityMods = {};
  this.ruleNestingOperators = {};
  this.substitutesEnabled = false;
}
CssSelectorParser.prototype.registerSelectorPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    this.pseudos[name] = "selector";
  }
  return this;
};
CssSelectorParser.prototype.unregisterSelectorPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    delete this.pseudos[name];
  }
  return this;
};
CssSelectorParser.prototype.registerNumericPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    this.pseudos[name] = "numeric";
  }
  return this;
};
CssSelectorParser.prototype.unregisterNumericPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    delete this.pseudos[name];
  }
  return this;
};
CssSelectorParser.prototype.registerNestingOperators = function(operator) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    operator = arguments[j];
    this.ruleNestingOperators[operator] = true;
  }
  return this;
};
CssSelectorParser.prototype.unregisterNestingOperators = function(operator) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    operator = arguments[j];
    delete this.ruleNestingOperators[operator];
  }
  return this;
};
CssSelectorParser.prototype.registerAttrEqualityMods = function(mod) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    mod = arguments[j];
    this.attrEqualityMods[mod] = true;
  }
  return this;
};
CssSelectorParser.prototype.unregisterAttrEqualityMods = function(mod) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    mod = arguments[j];
    delete this.attrEqualityMods[mod];
  }
  return this;
};
CssSelectorParser.prototype.enableSubstitutes = function() {
  this.substitutesEnabled = true;
  return this;
};
CssSelectorParser.prototype.disableSubstitutes = function() {
  this.substitutesEnabled = false;
  return this;
};
function isIdentStart(c) {
  return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "-" || c === "_";
}
function isIdent(c) {
  return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "-" || c === "_";
}
function isHex(c) {
  return c >= "a" && c <= "f" || c >= "A" && c <= "F" || c >= "0" && c <= "9";
}
var identSpecialChars = {
  "!": true,
  '"': true,
  "#": true,
  $: true,
  "%": true,
  "&": true,
  "'": true,
  "(": true,
  ")": true,
  "*": true,
  "+": true,
  ",": true,
  ".": true,
  "/": true,
  ";": true,
  "<": true,
  "=": true,
  ">": true,
  "?": true,
  "@": true,
  "[": true,
  "\\": true,
  "]": true,
  "^": true,
  "`": true,
  "{": true,
  "|": true,
  "}": true,
  "~": true
};
var strReplacementsRev = {
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\f": "\\f",
  "\v": "\\v"
};
var singleQuoteEscapeChars = {
  n: "\n",
  r: "\r",
  t: "	",
  f: "\f",
  "\\": "\\",
  "'": "'"
};
var doubleQuotesEscapeChars = {
  n: "\n",
  r: "\r",
  t: "	",
  f: "\f",
  "\\": "\\",
  '"': '"'
};
function ParseContext(str, pos, pseudos, attrEqualityMods, ruleNestingOperators, substitutesEnabled) {
  var chr, getIdent, getStr, l, skipWhitespace;
  l = str.length;
  chr = null;
  getStr = function(quote, escapeTable) {
    var esc, hex, result;
    result = "";
    pos++;
    chr = str.charAt(pos);
    while (pos < l) {
      if (chr === quote) {
        pos++;
        return result;
      } else if (chr === "\\") {
        pos++;
        chr = str.charAt(pos);
        if (chr === quote) {
          result += quote;
        } else if (esc = escapeTable[chr]) {
          result += esc;
        } else if (isHex(chr)) {
          hex = chr;
          pos++;
          chr = str.charAt(pos);
          while (isHex(chr)) {
            hex += chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (chr === " ") {
            pos++;
            chr = str.charAt(pos);
          }
          result += String.fromCharCode(parseInt(hex, 16));
          continue;
        } else {
          result += chr;
        }
      } else {
        result += chr;
      }
      pos++;
      chr = str.charAt(pos);
    }
    return result;
  };
  getIdent = function(specials) {
    var result = "";
    chr = str.charAt(pos);
    while (pos < l) {
      if (isIdent(chr) || specials && specials[chr]) {
        result += chr;
      } else if (chr === "\\") {
        pos++;
        if (pos >= l) {
          throw Error("Expected symbol but end of file reached.");
        }
        chr = str.charAt(pos);
        if (identSpecialChars[chr]) {
          result += chr;
        } else if (isHex(chr)) {
          var hex = chr;
          pos++;
          chr = str.charAt(pos);
          while (isHex(chr)) {
            hex += chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (chr === " ") {
            pos++;
            chr = str.charAt(pos);
          }
          result += String.fromCharCode(parseInt(hex, 16));
          continue;
        } else {
          result += chr;
        }
      } else {
        return result;
      }
      pos++;
      chr = str.charAt(pos);
    }
    return result;
  };
  skipWhitespace = function() {
    chr = str.charAt(pos);
    var result = false;
    while (chr === " " || chr === "	" || chr === "\n" || chr === "\r" || chr === "\f") {
      result = true;
      pos++;
      chr = str.charAt(pos);
    }
    return result;
  };
  this.parse = function() {
    var res = this.parseSelector();
    if (pos < l) {
      throw Error('Rule expected but "' + str.charAt(pos) + '" found.');
    }
    return res;
  };
  this.parseSelector = function() {
    var res;
    var selector = res = this.parseSingleSelector();
    chr = str.charAt(pos);
    while (chr === ",") {
      pos++;
      skipWhitespace();
      if (res.type !== "selectors") {
        res = {
          type: "selectors",
          selectors: [selector]
        };
      }
      selector = this.parseSingleSelector();
      if (!selector) {
        throw Error('Rule expected after ",".');
      }
      res.selectors.push(selector);
    }
    return res;
  };
  this.parseSingleSelector = function() {
    skipWhitespace();
    var selector = {
      type: "ruleSet"
    };
    var rule = this.parseRule();
    if (!rule) {
      return null;
    }
    var currentRule = selector;
    while (rule) {
      rule.type = "rule";
      currentRule.rule = rule;
      currentRule = rule;
      skipWhitespace();
      chr = str.charAt(pos);
      if (pos >= l || chr === "," || chr === ")") {
        break;
      }
      if (ruleNestingOperators[chr]) {
        var op = chr;
        if (op == ">" && str.charAt(pos + 1) == ">" && str.charAt(pos + 2) == ">") {
          op = ">>>";
          pos = pos + 3;
        } else if (op == ">" && str.charAt(pos + 1) == ">") {
          op = ">>";
          pos = pos + 2;
        } else {
          pos++;
        }
        skipWhitespace();
        rule = this.parseRule();
        if (!rule) {
          if (op == ">") {
            rule = {tagName: "*"};
          } else {
            throw Error('Rule expected after "' + op + '".');
          }
        }
        rule.nestingOperator = op;
      } else {
        rule = this.parseRule();
        if (rule) {
          rule.nestingOperator = null;
        }
      }
    }
    return selector;
  };
  this.parseRule = function() {
    var rule = null;
    while (pos < l) {
      chr = str.charAt(pos);
      if (chr === "*") {
        pos++;
        (rule = rule || {}).tagName = "*";
      } else if (isIdentStart(chr) || chr === "\\") {
        (rule = rule || {}).tagName = getIdent();
      } else if (chr === "$" || chr === "%") {
        pos++;
        rule = rule || {};
        (rule.classNames = rule.classNames || []).push(chr + getIdent());
      } else if (chr === ".") {
        pos++;
        rule = rule || {};
        (rule.classNames = rule.classNames || []).push(getIdent());
      } else if (chr === "#") {
        pos++;
        (rule = rule || {}).id = getIdent();
      } else if (chr === "[") {
        pos++;
        skipWhitespace();
        var attr = {
          name: getIdent()
        };
        skipWhitespace();
        if (chr === "]") {
          pos++;
        } else {
          var operator = "";
          if (attrEqualityMods[chr]) {
            operator = chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (pos >= l) {
            throw Error('Expected "=" but end of file reached.');
          }
          if (chr !== "=") {
            throw Error('Expected "=" but "' + chr + '" found.');
          }
          attr.operator = operator + "=";
          pos++;
          skipWhitespace();
          var attrValue = "";
          attr.valueType = "string";
          if (chr === '"') {
            attrValue = getStr('"', doubleQuotesEscapeChars);
          } else if (chr === "'") {
            attrValue = getStr("'", singleQuoteEscapeChars);
          } else if (substitutesEnabled && chr === "$") {
            pos++;
            attrValue = getIdent();
            attr.valueType = "substitute";
          } else {
            while (pos < l) {
              if (chr === "]") {
                break;
              }
              attrValue += chr;
              pos++;
              chr = str.charAt(pos);
            }
            attrValue = attrValue.trim();
          }
          skipWhitespace();
          if (pos >= l) {
            throw Error('Expected "]" but end of file reached.');
          }
          if (chr !== "]") {
            throw Error('Expected "]" but "' + chr + '" found.');
          }
          pos++;
          attr.value = attrValue;
        }
        rule = rule || {};
        (rule.attrs = rule.attrs || []).push(attr);
      } else if (chr === ":" || chr === "@") {
        let special = chr === "@";
        pos++;
        var pseudoName = getIdent({"~": true, "+": true, ".": true, ">": true, "<": true, "!": true});
        var pseudo = {
          special,
          name: pseudoName
        };
        if (chr === "(") {
          pos++;
          var value = "";
          skipWhitespace();
          if (pseudos[pseudoName] === "selector") {
            pseudo.valueType = "selector";
            value = this.parseSelector();
          } else {
            pseudo.valueType = pseudos[pseudoName] || "string";
            if (chr === '"') {
              value = getStr('"', doubleQuotesEscapeChars);
            } else if (chr === "'") {
              value = getStr("'", singleQuoteEscapeChars);
            } else if (substitutesEnabled && chr === "$") {
              pos++;
              value = getIdent();
              pseudo.valueType = "substitute";
            } else {
              while (pos < l) {
                if (chr === ")") {
                  break;
                }
                value += chr;
                pos++;
                chr = str.charAt(pos);
              }
              value = value.trim();
            }
            skipWhitespace();
          }
          if (pos >= l) {
            throw Error('Expected ")" but end of file reached.');
          }
          if (chr !== ")") {
            throw Error('Expected ")" but "' + chr + '" found.');
          }
          pos++;
          pseudo.value = value;
        }
        rule = rule || {};
        (rule.pseudos = rule.pseudos || []).push(pseudo);
      } else {
        break;
      }
    }
    return rule;
  };
  return this;
}
CssSelectorParser.prototype.parse = function(str) {
  var context = new ParseContext(str, 0, this.pseudos, this.attrEqualityMods, this.ruleNestingOperators, this.substitutesEnabled);
  return context.parse();
};
CssSelectorParser.prototype.escapeIdentifier = function(s) {
  var result = "";
  var i = 0;
  var len = s.length;
  while (i < len) {
    var chr = s.charAt(i);
    if (identSpecialChars[chr]) {
      result += "\\" + chr;
    } else {
      if (!(chr === "_" || chr === "-" || chr >= "A" && chr <= "Z" || chr >= "a" && chr <= "z" || i !== 0 && chr >= "0" && chr <= "9")) {
        var charCode = chr.charCodeAt(0);
        if ((charCode & 63488) === 55296) {
          var extraCharCode = s.charCodeAt(i++);
          if ((charCode & 64512) !== 55296 || (extraCharCode & 64512) !== 56320) {
            throw Error("UCS-2(decode): illegal sequence");
          }
          charCode = ((charCode & 1023) << 10) + (extraCharCode & 1023) + 65536;
        }
        result += "\\" + charCode.toString(16) + " ";
      } else {
        result += chr;
      }
    }
    i++;
  }
  return result;
};
CssSelectorParser.prototype.escapeStr = function(s) {
  var result = "";
  var i = 0;
  var len = s.length;
  var chr, replacement;
  while (i < len) {
    chr = s.charAt(i);
    if (chr === '"') {
      chr = '\\"';
    } else if (chr === "\\") {
      chr = "\\\\";
    } else if (replacement = strReplacementsRev[chr]) {
      chr = replacement;
    }
    result += chr;
    i++;
  }
  return '"' + result + '"';
};
CssSelectorParser.prototype.render = function(path) {
  return this._renderEntity(path).trim();
};
CssSelectorParser.prototype._renderEntity = function(entity) {
  var currentEntity, parts, res;
  res = "";
  switch (entity.type) {
    case "ruleSet":
      currentEntity = entity.rule;
      parts = [];
      while (currentEntity) {
        if (currentEntity.nestingOperator) {
          parts.push(currentEntity.nestingOperator);
        }
        parts.push(this._renderEntity(currentEntity));
        currentEntity = currentEntity.rule;
      }
      res = parts.join(" ");
      break;
    case "selectors":
      res = entity.selectors.map(this._renderEntity, this).join(", ");
      break;
    case "rule":
      if (entity.tagName) {
        if (entity.tagName === "*") {
          res = "*";
        } else {
          res = this.escapeIdentifier(entity.tagName);
        }
      }
      if (entity.id) {
        res += "#" + this.escapeIdentifier(entity.id);
      }
      if (entity.classNames) {
        res += entity.classNames.map(function(cn) {
          if (cn[0] == "!") {
            return ":not(." + this.escapeIdentifier(cn.slice(1)) + ")";
          } else {
            return "." + this.escapeIdentifier(cn);
          }
        }, this).join("");
      }
      if (entity.pri > 0) {
        let i = entity.pri;
        while (--i >= 0)
          res += ":not(#_)";
      }
      if (entity.attrs) {
        res += entity.attrs.map(function(attr) {
          if (attr.operator) {
            if (attr.valueType === "substitute") {
              return "[" + this.escapeIdentifier(attr.name) + attr.operator + "$" + attr.value + "]";
            } else {
              return "[" + this.escapeIdentifier(attr.name) + attr.operator + this.escapeStr(attr.value) + "]";
            }
          } else {
            return "[" + this.escapeIdentifier(attr.name) + "]";
          }
        }, this).join("");
      }
      if (entity.pseudos) {
        res += entity.pseudos.map(function(pseudo) {
          let pre = ":" + this.escapeIdentifier(pseudo.name);
          if (pseudo.valueType) {
            if (pseudo.valueType === "selector") {
              return pre + "(" + this._renderEntity(pseudo.value) + ")";
            } else if (pseudo.valueType === "substitute") {
              return pre + "($" + pseudo.value + ")";
            } else if (pseudo.valueType === "numeric") {
              return pre + "(" + pseudo.value + ")";
            } else if (pseudo.valueType === "raw") {
              return pre + "(" + pseudo.value + ")";
            } else {
              return pre + "(" + this.escapeIdentifier(pseudo.value) + ")";
            }
          } else if (pseudo.type == "el") {
            return ":" + pre;
          } else {
            return pre;
          }
        }, this).join("");
      }
      break;
    default:
      throw Error('Unknown entity type: "' + entity.type(+'".'));
  }
  return res;
};
var parser = new CssSelectorParser();
parser.registerSelectorPseudos("has", "not", "is", "matches", "any");
parser.registerNumericPseudos("nth-child");
parser.registerNestingOperators(">>>", ">>", ">", "+", "~");
parser.registerAttrEqualityMods("^", "$", "*", "~");
var parse = function(v) {
  return parser.parse(v);
};
var render = function(v) {
  return parser.render(v);
};

// src/compiler/theme.imba
var theme_exports = {};
__export(theme_exports, {
  colors: () => colors,
  fonts: () => fonts,
  modifiers: () => modifiers,
  variants: () => variants
});
var fonts = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
};
var modifiers = {
  odd: {name: "nth-child", valueType: "string", value: "odd"},
  even: {name: "nth-child", valueType: "string", value: "even"},
  first: {name: "first-child"},
  last: {name: "last-child"},
  only: {name: "only-child"},
  "not-first": {name: "not", valueType: "raw", value: ":first-child"},
  "not-last": {name: "not", valueType: "raw", value: ":last-child"},
  active: {},
  checked: {},
  default: {},
  defined: {},
  disabled: {},
  empty: {},
  enabled: {},
  "first-of-type": {},
  "first-page": {name: "first"},
  fullscreen: {},
  focus: {},
  focin: {name: "focus-within"},
  "focus-within": {},
  hover: {},
  indeterminate: {},
  "in-range": {},
  invalid: {},
  is: {type: "selector"},
  lang: {},
  "last-of-type": {},
  left: {},
  link: {},
  not: {type: "selector"},
  "nth-child": {},
  "nth-last-child": {},
  "nth-last-of-type": {},
  "nth-of-type": {},
  "only-child": {},
  "only-of-type": {},
  optional: {},
  "out-of-range": {},
  "placeholder-shown": {},
  "read-only": {},
  "read-write": {},
  required: {},
  right: {},
  scope: {},
  root: {},
  target: {},
  "target-within": {},
  valid: {},
  visited: {},
  where: {},
  after: {type: "el"},
  backdrop: {type: "el"},
  before: {type: "el"},
  cue: {type: "el"},
  "cue-region": {type: "el"},
  "first-letter": {type: "el"},
  "first-line": {type: "el"},
  marker: {type: "el"},
  placeholder: {type: "el"},
  selection: {type: "el"},
  force: {pri: 3},
  print: {media: "print"},
  screen: {media: "screen"},
  xs: {media: "(min-width: 480px)"},
  sm: {media: "(min-width: 640px)"},
  md: {media: "(min-width: 768px)"},
  lg: {media: "(min-width: 1024px)"},
  xl: {media: "(min-width: 1280px)"},
  "lt-xs": {media: "(max-width: 479px)"},
  "lt-sm": {media: "(max-width: 639px)"},
  "lt-md": {media: "(max-width: 767px)"},
  "lt-lg": {media: "(max-width: 1023px)"},
  "lt-xl": {media: "(max-width: 1279px)"},
  landscape: {media: "(orientation: landscape)"},
  portrait: {media: "(orientation: portrait)"},
  dark: {media: "(prefers-color-scheme: dark)"},
  light: {media: "(prefers-color-scheme: light)"},
  mac: {ua: "mac"},
  ios: {ua: "ios"},
  win: {ua: "win"},
  android: {ua: "android"},
  linux: {ua: "linux"},
  ie: {ua: "ie"},
  chrome: {ua: "chrome"},
  safari: {ua: "safari"},
  firefox: {ua: "firefox"},
  opera: {ua: "opera"},
  blink: {ua: "blink"},
  webkit: {ua: "webkit"},
  touch: {flag: "_touch_"},
  move: {flag: "_move_"},
  hold: {flag: "_hold_"},
  ssr: {flag: "_ssr_"}
};
var variants = {
  radius: {
    full: "9999px",
    xxs: "1px",
    xs: "2px",
    sm: "3px",
    md: "4px",
    lg: "6px",
    xl: "8px",
    NUMBER: "2px"
  },
  sizing: {
    NUMBER: "0.25rem"
  },
  letterSpacing: {
    NUMBER: "0.05em"
  },
  fontSize: {
    xxs: ["10px", 1.5],
    xs: ["12px", 1.5],
    "sm-": ["13px", 1.5],
    sm: ["14px", 1.5],
    "md-": ["15px", 1.5],
    md: ["16px", 1.5],
    lg: ["18px", 1.5],
    xl: ["20px", 1.5],
    "2xl": ["24px", 1.5],
    "3xl": ["30px", 1.5],
    "4xl": ["36px", 1.5],
    "5xl": ["48px", 1.5],
    "6xl": ["64px", 1.5],
    "1": ["10px", 1.5],
    "2": ["12px", 1.5],
    "3": ["13px", 1.5],
    "4": ["14px", 1.5],
    "5": ["15px", 1.5],
    "6": ["16px", 1.5],
    "7": ["17px", 1.5],
    "8": ["18px", 1.5],
    "9": ["19px", 1.5],
    "10": ["20px", 1.5],
    "11": ["24px", 1.4],
    "12": ["30px", 1.3],
    "13": ["36px", 1.3],
    "14": ["48px", 1.2],
    "15": ["64px", 1.2],
    "16": ["96px", 1.2]
  },
  "box-shadow": {
    xxs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    xxl: "0 25px 50px -6px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
    none: "none"
  },
  easings: {
    "sine-in": "cubic-bezier(0.47, 0, 0.745, 0.715)",
    "sine-out": "cubic-bezier(0.39, 0.575, 0.565, 1)",
    "sine-in-out": "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
    "quad-in": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
    "quad-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    "quad-in-out": "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
    "cubic-in": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    "cubic-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
    "cubic-in-out": "cubic-bezier(0.645, 0.045, 0.355, 1)",
    "quart-in": "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
    "quart-out": "cubic-bezier(0.165, 0.84, 0.44, 1)",
    "quart-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
    "quint-in": "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    "quint-out": "cubic-bezier(0.23, 1, 0.32, 1)",
    "quint-in-out": "cubic-bezier(0.86, 0, 0.07, 1)",
    "expo-in": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
    "expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
    "expo-in-out": "cubic-bezier(1, 0, 0, 1)",
    "circ-in": "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
    "circ-out": "cubic-bezier(0.075, 0.82, 0.165, 1)",
    "circ-in-out": "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
    "back-in": "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
    "back-out": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "back-in-out": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  }
};
var colors = {
  gray: {
    1: "#f7fafc",
    2: "#edf2f7",
    3: "#e2e8f0",
    4: "#cbd5e0",
    5: "#a0aec0",
    6: "#718096",
    7: "#4a5568",
    8: "#2d3748",
    9: "#1a202c"
  },
  grey: {
    1: "gray1",
    2: "gray2",
    3: "gray3",
    4: "gray4",
    5: "gray5",
    6: "gray6",
    7: "gray7",
    8: "gray8",
    9: "gray9"
  },
  red: {
    1: "#fff5f5",
    2: "#fed7d7",
    3: "#feb2b2",
    4: "#fc8181",
    5: "#f56565",
    6: "#e53e3e",
    7: "#c53030",
    8: "#9b2c2c",
    9: "#742a2a"
  },
  orange: {
    1: "#fffaf0",
    2: "#feebc8",
    3: "#fbd38d",
    4: "#f6ad55",
    5: "#ed8936",
    6: "#dd6b20",
    7: "#c05621",
    8: "#9c4221",
    9: "#7b341e"
  },
  yellow: {
    1: "#fffff0",
    2: "#fefcbf",
    3: "#faf089",
    4: "#f6e05e",
    5: "#ecc94b",
    6: "#d69e2e",
    7: "#b7791f",
    8: "#975a16",
    9: "#744210"
  },
  green: {
    1: "#f0fff4",
    2: "#c6f6d5",
    3: "#9ae6b4",
    4: "#68d391",
    5: "#48bb78",
    6: "#38a169",
    7: "#2f855a",
    8: "#276749",
    9: "#22543d"
  },
  teal: {
    1: "#e6fffa",
    2: "#b2f5ea",
    3: "#81e6d9",
    4: "#4fd1c5",
    5: "#38b2ac",
    6: "#319795",
    7: "#2c7a7b",
    8: "#285e61",
    9: "#234e52"
  },
  blue: {
    1: "#ebf8ff",
    2: "#bee3f8",
    3: "#90cdf4",
    4: "#63b3ed",
    5: "#4299e1",
    6: "#3182ce",
    7: "#2b6cb0",
    8: "#2c5282",
    9: "#2a4365"
  },
  indigo: {
    1: "#ebf4ff",
    2: "#c3dafe",
    3: "#a3bffa",
    4: "#7f9cf5",
    5: "#667eea",
    6: "#5a67d8",
    7: "#4c51bf",
    8: "#434190",
    9: "#3c366b"
  },
  purple: {
    1: "#faf5ff",
    2: "#e9d8fd",
    3: "#d6bcfa",
    4: "#b794f4",
    5: "#9f7aea",
    6: "#805ad5",
    7: "#6b46c1",
    8: "#553c9a",
    9: "#44337a"
  },
  pink: {
    1: "#fff5f7",
    2: "#fed7e2",
    3: "#fbb6ce",
    4: "#f687b3",
    5: "#ed64a6",
    6: "#d53f8c",
    7: "#b83280",
    8: "#97266d",
    9: "#702459"
  }
};

// src/compiler/selparse.imba
function iter$6(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
function addClass(rule, name) {
  rule.classNames || (rule.classNames = []);
  if (rule.classNames.indexOf(name) == -1) {
    rule.classNames.push(name);
  }
  ;
  return rule;
}
function addPseudo(rule, pseudo) {
  rule.pseudos || (rule.pseudos = []);
  if (typeof pseudo == "string") {
    pseudo = {name: pseudo};
  }
  ;
  rule.pseudos.push(pseudo);
  return rule;
}
function getRootRule(ruleset, force) {
  let rule = ruleset.rule;
  let root;
  if (!rule.isRoot) {
    rule = ruleset.rule = {type: "rule", rule, isRoot: true};
  }
  ;
  return rule;
}
function rewrite(rule, ctx, o = {}) {
  if (rule.type == "selectors") {
    for (let sys$14 = 0, sys$22 = iter$6(rule.selectors), sys$32 = sys$22.length; sys$14 < sys$32; sys$14++) {
      let sel = sys$22[sys$14];
      rewrite(sel, rule, o);
    }
    ;
  }
  ;
  if (rule.type != "ruleSet") {
    return rule;
  }
  ;
  let root = rule;
  let pri = 0;
  let specificity = 0;
  rule.meta = {};
  rule.media = [];
  let parts = [];
  let curr = rule.rule;
  while (curr) {
    parts.push(curr);
    curr = curr.rule;
  }
  ;
  let rev = parts.slice(0).reverse();
  for (let i = 0, sys$4 = iter$6(rev), sys$5 = sys$4.length; i < sys$5; i++) {
    let part = sys$4[i];
    let up = rev[i + 1];
    let flags = part.classNames;
    let mods = part.pseudos;
    let name = part.tagName;
    let op = part.nestingOperator;
    if (!flags && !name && !op && (mods && mods.every(function(_0) {
      return _0.special;
    }))) {
      if (up) {
        up.pseudos = (up.pseudos || []).concat(mods);
        up.rule = part.rule;
        parts.splice(parts.indexOf(part), 1);
      }
      ;
    }
    ;
  }
  ;
  let container = parts[0];
  let localpart = null;
  let deeppart = null;
  let forceLocal = o.forceLocal;
  let escaped = false;
  for (let i = 0, sys$6 = iter$6(parts), sys$122 = sys$6.length; i < sys$122; i++) {
    let part = sys$6[i];
    let prev = parts[i - 1];
    let next = parts[i + 1];
    let flags = part.classNames || (part.classNames = []);
    let mods = part.pseudos || [];
    let name = part.tagName;
    let op = part.nestingOperator;
    if (op == ">>") {
      localpart = prev;
      escaped = part;
      part.nestingOperator = ">";
    } else if (op == ">>>") {
      localpart = prev;
      escaped = part;
      part.nestingOperator = null;
    }
    ;
    if (name == "html") {
      part.isRoot = true;
    }
    ;
    if (mods.some(function(_0) {
      return _0.name == "root";
    })) {
      part.isRoot = true;
    }
    ;
    if (name == "self") {
      if (o.ns) {
        addClass(part, o.ns + "_");
        part.tagName = null;
      }
      ;
    }
    ;
    for (let i2 = 0, sys$7 = iter$6(flags), sys$8 = sys$7.length; i2 < sys$8; i2++) {
      let flag = sys$7[i2];
      if (flag[0] == "%") {
        flags[i2] = "mixin___" + flag.slice(1);
        if (pri < 1) {
          pri = 1;
        }
        ;
      } else if (flag[0] == "$") {
        flags[i2] = "ref--" + flag.slice(1);
        if (!escaped) {
          localpart = part;
        }
        ;
        if (pri < 1) {
          pri = 1;
        }
        ;
      }
      ;
    }
    ;
    if (part.tagName) {
      specificity++;
    }
    ;
    if (o.ns && (!next || next.nestingOperator == ">>>") && !localpart && !deeppart) {
      localpart = part;
    }
    ;
    specificity += part.classNames.length;
    let modTarget = part;
    for (let sys$9 = 0, sys$10 = iter$6(mods), sys$11 = sys$10.length, alias; sys$9 < sys$11; sys$9++) {
      let mod = sys$10[sys$9];
      if (!mod.special) {
        continue;
      }
      ;
      let [m, pre, name2, post] = mod.name.match(/^(\$|\.+)?([^\~\+]*)([\~\+]*)$/) || [];
      let hit;
      let media;
      let neg = mod.name[0] == "!";
      if (pre == ".") {
        addClass(modTarget, name2);
        mod.remove = true;
        specificity++;
      } else if (pre == "..") {
        prev || (prev = root.rule = {type: "rule", classNames: [], rule: root.rule});
        addClass(modTarget = prev, name2);
        mod.remove = true;
        specificity++;
      } else if (hit = mod.name.match(/^([a-z]*)(\d+)(\+|\-)?$/)) {
        if (!hit[1]) {
          if (hit[3] == "-") {
            media = "(max-width: " + hit[2] + "px)";
          } else {
            media = "(min-width: " + hit[2] + "px)";
          }
          ;
        }
        ;
      } else if (hit = mod.name.match(/^([a-z\-]*)([\>\<\!])(\d+)$/) || mod.name.match(/^(\.)?(gte|lte)\-(\d+)$/)) {
        let [all, key, op2, val] = hit;
        let num = parseInt(val);
        if (op2 == ">" || op2 == "gte") {
          if (key == "vh") {
            media = "(min-height: " + val + "px)";
          } else {
            media = "(min-width: " + val + "px)";
          }
          ;
        } else if (op2 == "<" || op2 == "lte" || op2 == "!") {
          if (key == "vh") {
            media = "(max-height: " + (num - 1) + "px)";
          } else {
            media = "(max-width: " + (num - 1) + "px)";
          }
          ;
        }
        ;
      }
      ;
      if (post == "~") {
        modTarget;
      }
      ;
      if (media) {
        rule.media.push(media);
        mod.remove = true;
      } else if (alias = modifiers[mod.name]) {
        if (alias.media) {
          rule.media.push(alias.media);
          mod.remove = true;
        }
        ;
        if (alias.ua) {
          addClass(getRootRule(rule), "ua-" + alias.ua);
          mod.remove = true;
          specificity++;
        }
        ;
        if (alias.flag) {
          addClass(modTarget, alias.flag);
          mod.remove = true;
          specificity++;
        }
        ;
        if (alias.pri) {
          pri = alias.pri;
          mod.remove = true;
        }
        ;
        if (!mod.remove) {
          Object.assign(mod, alias);
        }
        ;
      } else if (mod.name == "local") {
        mod.remove = true;
        o.hasScopedStyles = true;
        if (o.ns) {
          addClass(part, o.ns);
        }
        ;
        specificity++;
        forceLocal = false;
      } else if (mod.name == "deep") {
        mod.remove = true;
        deeppart = part;
        if (prev) {
          if (!prev.isRoot) {
            localpart = prev;
          } else {
            localpart = prev.rule = {type: "rule", rule: prev.rule};
          }
          ;
        } else {
          localpart = rule.rule = {type: "rule", rule: rule.rule};
        }
        ;
      } else if (!mod.remove) {
        let cls = neg ? "!mod-" + mod.name.slice(1) : "mod-" + mod.name;
        addClass(getRootRule(rule), cls);
        mod.remove = true;
        specificity++;
      }
      ;
      if (modTarget != part && !mod.remove) {
        addPseudo(modTarget, mod);
        mod.remove = true;
        specificity++;
      } else if (!mod.remove) {
        specificity++;
      }
      ;
    }
    ;
    part.pseudos = mods.filter(function(_0) {
      return !_0.remove;
    });
  }
  ;
  rule.specificity = specificity;
  if (forceLocal && localpart && o.ns) {
    o.hasScopedStyles = true;
    addClass(localpart, o.ns);
  }
  ;
  if (pri = Math.max(o.priority || 0, pri)) {
    parts[parts.length - 1].pri = pri;
  }
  ;
  return rule;
}
function render2(root, content, options = {}) {
  let group = [""];
  let groups = [group];
  let rules = root.selectors || [root];
  for (let sys$132 = 0, sys$14 = iter$6(rules), sys$15 = sys$14.length; sys$132 < sys$15; sys$132++) {
    let rule = sys$14[sys$132];
    let sel = render(rule);
    let media = rule.media.length ? "@media " + rule.media.join(" and ") : "";
    if (media != group[0]) {
      groups.push(group = [media]);
    }
    ;
    group.push(sel);
  }
  ;
  let out = [];
  for (let sys$16 = 0, sys$17 = iter$6(groups), sys$18 = sys$17.length; sys$16 < sys$18; sys$16++) {
    let group2 = sys$17[sys$16];
    if (!group2[1]) {
      continue;
    }
    ;
    let sel = group2.slice(1).join(",") + " {$CONTENT$}";
    if (group2[0]) {
      sel = group2[0] + "{\n" + sel + "\n}";
    }
    ;
    out.push(sel);
  }
  ;
  return out.join("\n").replace(/\$CONTENT\$/g, content);
}
function unwrap(parent, subsel) {
  let pars = parent.split(",");
  let subs = subsel.split(",");
  let sels = [];
  for (let sys$19 = 0, sys$20 = iter$6(subs), sys$24 = sys$20.length; sys$19 < sys$24; sys$19++) {
    let sub = sys$20[sys$19];
    for (let sys$21 = 0, sys$22 = iter$6(pars), sys$23 = sys$22.length; sys$21 < sys$23; sys$21++) {
      let par = sys$22[sys$21];
      let sel = sub;
      if (sel.indexOf("&") >= 0) {
        sel = sel.replace("&", par);
      } else {
        sel = par + " " + sel;
      }
      ;
      sels.push(sel);
    }
    ;
  }
  ;
  return sels.join(",");
}
function parse2(str, options) {
  let sel = parse(str);
  let out = sel && rewrite(sel, null, options);
  return out;
}

// src/program/grammars/xml.imba
var grammar3 = {
  defaultToken: "",
  tokenPostfix: ".xml",
  ignoreCase: true,
  qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,
  tokenizer: {
    root: [
      [/[^<&]+/, ""],
      {include: "@whitespace"},
      [/(<)(@qualifiedName)/, [
        {token: "delimiter"},
        {token: "tag", next: "@tag"}
      ]],
      [/(<\/)(@qualifiedName)(\s*)(>)/, [
        {token: "delimiter"},
        {token: "tag"},
        "",
        {token: "delimiter"}
      ]],
      [/(<\?)(@qualifiedName)/, [
        {token: "delimiter"},
        {token: "metatag", next: "@tag"}
      ]],
      [/(<\!)(@qualifiedName)/, [
        {token: "delimiter"},
        {token: "metatag", next: "@tag"}
      ]],
      [/<\!\[CDATA\[/, {token: "delimiter.cdata", next: "@cdata"}],
      [/&\w+;/, "string.escape"]
    ],
    cdata: [
      [/[^\]]+/, ""],
      [/\]\]>/, {token: "delimiter.cdata", next: "@pop"}],
      [/\]/, ""]
    ],
    tag: [
      [/[ \t\r\n]+/, ""],
      [/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ["attribute.name", "", "attribute.value"]],
      [/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/, ["attribute.name", "", "attribute.value"]],
      [/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ["attribute.name", "", "attribute.value"]],
      [/@qualifiedName/, "attribute.name"],
      [/\?>/, {token: "delimiter", next: "@pop"}],
      [/(\/)(>)/, [
        {token: "tag"},
        {token: "delimiter", next: "@pop"}
      ]],
      [/>/, {token: "delimiter", next: "@pop"}]
    ],
    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/<!--/, {token: "comment", next: "@comment"}]
    ],
    comment: [
      [/[^<\-]+/, "comment.content"],
      [/-->/, {token: "comment", next: "@pop"}],
      [/<!--/, "comment.content.invalid"],
      [/[<\-]/, "comment.content"]
    ]
  }
};

// src/program/monarch.imba
var tokenizers = {};
var Monarch = class {
  static getTokenizer(langId) {
    if (langId == "xml" && !tokenizers[langId]) {
      return this.createTokenizer("xml", grammar3);
    }
    ;
    return tokenizers[langId];
  }
  static createTokenizer(langId, grammar4) {
    let compiled2 = compile(langId, grammar4);
    return tokenizers[langId] = new MonarchTokenizer(langId, compiled2);
  }
};

// src/compiler/compiler.imba1
var ast = require_nodes();
var transformers = require_transformers();
var resolveConfigFile = require_imbaconfig().resolveConfigFile;
var ImbaParseError = require_errors().ImbaParseError;
var compilation$ = require_compilation();
var Diagnostic2 = compilation$.Diagnostic;
var Compilation = compilation$.Compilation;
var lex = exports.lex = new lexer5.Lexer();
var Rewriter = exports.Rewriter = rewriter.Rewriter;
var helpers = exports.helpers = util3;
rewriter = new Rewriter();
parser2.lexer = lex.jisonBridge();
parser2.yy = ast;
Compilation.prototype.lexer = lex;
Compilation.prototype.rewriter = rewriter;
Compilation.prototype.parser = parser2;
exports.resolveConfig = self.resolveConfig = function(o) {
  if (o === void 0)
    o = {};
  let path = o.sourcePath;
  o.config || (o.config = resolveConfigFile(path, o) || {});
  return o;
};
exports.deserialize = self.deserialize = function(data, options) {
  if (options === void 0)
    options = {};
  return Compilation.deserialize(data, options);
};
exports.tokenize = self.tokenize = function(code, options) {
  if (options === void 0)
    options = {};
  let script = new Compilation(code, options);
  return script.tokenize();
};
exports.rewrite = self.rewrite = function(tokens, o) {
  if (o === void 0)
    o = {};
  return rewriter.rewrite(tokens, o);
};
exports.parse = self.parse = function(code, o) {
  if (o === void 0)
    o = {};
  o = self.resolveConfig(o);
  var tokens = code instanceof Array ? code : self.tokenize(code, o);
  try {
    return parser2.parse(tokens);
  } catch (err) {
    err._code = code;
    if (o.sourcePath) {
      err._sourcePath = o.sourcePath;
    }
    ;
    throw err;
  }
  ;
};
exports.compile = self.compile = function(code, o) {
  if (o === void 0)
    o = {};
  let compilation = new Compilation(code, self.resolveConfig(o));
  return compilation.compile();
};
exports.resolve = self.resolve = function(code, o) {
  if (o === void 0)
    o = {};
  let compilation = new Compilation(code, self.resolveConfig(o));
  return compilation.compile();
};
exports.analyze = self.analyze = function(code, o) {
  if (o === void 0)
    o = {};
  var meta;
  try {
    var ast2 = self.parse(code, o);
    meta = ast2.analyze(o);
  } catch (e) {
    if (!(e instanceof ImbaParseError)) {
      if (e.lexer) {
        e = new ImbaParseError(e, {tokens: e.lexer.tokens, pos: e.lexer.pos});
      } else {
        throw e;
      }
      ;
    }
    ;
    meta = {warnings: [e]};
  }
  ;
  return meta;
};
