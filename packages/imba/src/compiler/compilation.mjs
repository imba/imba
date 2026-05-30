import path from "path";
import {
  computeLineOffsets,
  Diagnostic,
  DiagnosticSeverity,
  Position,
  Range,
} from "./helpers.mjs";
import { SourceMapper } from "./sourcemapper.mjs";

const lineOffsetsSymbol = Symbol.for("#lineOffsets");

const STEPS = {
  TOKENIZE: 1,
  REWRITE: 2,
  PARSE: 4,
  TRAVERSE: 8,
  COMPILE: 16,
};

export class CompilationResult {}

export class Compilation {
  static current;

  static error(opts) {
    return this.current?.addDiagnostic?.("error", opts);
  }

  static warn(opts) {
    return this.current?.addDiagnostic?.("warning", opts);
  }

  static info(opts) {
    return this.current?.addDiagnostic?.("info", opts);
  }

  static deserialize(data, o = {}) {
    let item = new Compilation("", o);
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

  step(flag) {
    if ((this.flags & flag) == flag) {
      return false;
    }
    this.flags |= flag;
    return true;
  }

  deserialize(input) {
    let val;
    try {
      val = JSON.parse(input);
    } catch (e) {
      console.log("failed", input, this.options);
      throw e;
    }
    this.rawResult = val;
    this.deserialized = val;
    return this;
  }

  serialize() {
    if (this.rawResult) {
      return JSON.stringify(this.rawResult, null, 2);
    }
  }

  tokenize() {
    if (this.step(STEPS.TOKENIZE)) {
      try {
        Compilation.current = this;
        this.lexer.reset();
        this.tokens = this.lexer.tokenize(this.sourceCode, this.options, this);
        this.tokens = this.rewriter.rewrite(this.tokens, this.options, this);
      } catch (e) {}
    }
    return this.tokens;
  }

  parse() {
    this.tokenize();
    if (this.step(STEPS.PARSE)) {
      if (!this.errored) {
        Compilation.current = this;
        try {
          this.ast = this.parser.parse(this.tokens, this);
        } catch (e) {}
      }
    }
    return this;
  }

  compile() {
    this.parse();
    if (this.step(STEPS.COMPILE)) {
      if (!this.errored) {
        Compilation.current = this;
        this.result = this.ast.compile(this.options, this);
      }
      if (this.options.raiseErrors) {
        this.raiseErrors();
      }
    }
    return this;
  }

  recompile(o = {}) {
    if (this.deserialized) {
      let js = this.deserialized.js;
      let res = {};
      res.js = SourceMapper.run(js, o);
      res.css = SourceMapper.run(this.deserialized.css || "", o);

      if (o.styles == "import" && res.css.code) {
        res.js.code += "\nimport './" + path.basename(this.sourcePath) + ".css'";
      }
      return res;
    }

    return { js: this.js };
  }

  addDiagnostic(severity, params) {
    params.severity ||= severity;
    let item = new Diagnostic(params, this);
    this.diagnostics.push(item);
    return item;
  }

  get tsc() {
    return this.options.tsc || this.options.platform === "tsc";
  }

  get errored() {
    return this.errors.length > 0;
  }

  get errors() {
    return this.diagnostics.filter(
      (item) => item.severity == DiagnosticSeverity.Error,
    );
  }

  get warnings() {
    return this.diagnostics.filter(
      (item) => item.severity == DiagnosticSeverity.Warning,
    );
  }

  get info() {
    return this.diagnostics.filter(
      (item) => item.severity == DiagnosticSeverity.Information,
    );
  }

  get doc() {
    return this;
  }

  get lineOffsets() {
    return (this[lineOffsetsSymbol] ||= computeLineOffsets(
      this.sourceCode,
      true,
      0,
    ));
  }

  getLineText(line) {
    let start = this.lineOffsets[line];
    let end = this.lineOffsets[line + 1];
    return this.sourceCode.substring(start, end).replace(/[\r\n]/g, "");
  }

  positionAt(offset) {
    if (offset instanceof Position) {
      return offset;
    }

    if (typeof offset == "object") {
      offset = offset.offset;
    }

    offset = Math.max(Math.min(offset, this.sourceCode.length), 0);
    let offsets = this.lineOffsets;
    let low = 0;
    let high = offsets.length;
    if (high === 0) {
      return new Position(0, offset, offset);
    }
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (offsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    let line = low - 1;
    return new Position(line, offset - offsets[line], offset);
  }

  offsetAt(position) {
    if (position.offset !== undefined) {
      return position.offset;
    }

    let offsets = this.lineOffsets;
    if (position.line >= offsets.length) {
      return this.sourceCode.length;
    } else if (position.line < 0) {
      return 0;
    }

    let lineOffset = offsets[position.line];
    let nextLineOffset =
      position.line + 1 < offsets.length
        ? offsets[position.line + 1]
        : this.sourceCode.length;
    return (position.offset = Math.max(
      Math.min(lineOffset + position.character, nextLineOffset),
      lineOffset,
    ));
  }

  rangeAt(a, b) {
    return new Range(this.positionAt(a), this.positionAt(b));
  }

  toString() {
    return this.js;
  }

  raiseErrors() {
    if (this.errors.length) {
      throw this.errors[0].toError();
    }
    return this;
  }
}
