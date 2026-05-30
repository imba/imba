export class SourceMapper {
  static strip(input) {
    if (input.indexOf("/*%") < 0) {
      return input;
    }
    return input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
  }

  static run(input, o = {}) {
    if (input.indexOf("/*%") < 0) {
      return {
        code: input,
        map: null,
        toString() {
          return this.code;
        },
      };
    }
    let output = input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
    return {
      code: output,
      map: null,
      toString() {
        return this.code;
      },
    };
  }
}
