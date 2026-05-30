export class SourceMapper {
  static strip(input) {
    return input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
  }

  static run(input, o = {}) {
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
