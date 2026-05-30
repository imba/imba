const pairs = {
  "[": "]",
  "{": "}",
  "<": ">",
  "(": ")",
  '"': '"',
  "'": '"',
};

export function removeNestedPairs(str) {
  let stack = [];
  let i = 0;
  let out = "";

  while (i < str.length) {
    let chr = str.charAt(i);
    let end = stack[0];

    if (chr && chr == end) {
      stack.shift();
      chr = null;
    }

    if (chr && !end && !pairs[chr]) {
      out += chr;
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
    } else if (!end && chr == ">") {
      break;
    }

    i++;
  }

  return out;
}

export function extractGenericNames(str) {
  let out = removeNestedPairs(str.slice(1, -1))
    .split(/,\s*/g)
    .map((item) => item.split(/\W/)[0])
    .join(",");
  return "<" + out + ">";
}
