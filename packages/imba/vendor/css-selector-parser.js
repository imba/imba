import { off } from "process";
import { modifiers } from "../src/compiler/theme.imba";
import { TAG_NAMES } from '../src/compiler/constants.imba1';

/*
Copyright (c) 2013 Dulin Marat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
function CssSelectorParser() {
  this.pseudos = {};
  this.attrEqualityMods = {};
  this.ruleNestingOperators = {};
  this.substitutesEnabled = false;
}

function RULE(obj,base=[]){
  return Object.assign(base,obj);
}

CssSelectorParser.prototype.registerSelectorPseudos = function(name) {
  for (var j = 0, len = arguments.length; j < len; j++) {
    name = arguments[j];
    this.pseudos[name] = 'selector';
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
        this.pseudos[name] = 'numeric';
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
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c === '-') || (c === '_');
}

function isIdent(c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '-' || c === '_';
}

function isHex(c) {
  return (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F') || (c >= '0' && c <= '9');
}

function isDecimal(c) {
  return c >= '0' && c <= '9';
}

function isAttrMatchOperator(chr) {
  return chr === '=' || chr === '^' || chr === '$' || chr === '*' || chr === '~';
}

var identSpecialChars = {
  '!': true,
  '"': true,
  '#': true,
  '$': true,
  '%': true,
  '&': true,
  '\'': true,
  '(': true,
  ')': true,
  '*': true,
  '+': true,
  ',': true,
  '.': true,
  '/': true,
  ';': true,
  '<': true,
  '=': true,
  '>': true,
  '?': true,
  '@': true,
  '[': true,
  '\\': true,
  ']': true,
  '^': true,
  '`': true,
  '{': true,
  '|': true,
  '}': true,
  '~': true
};

var strReplacementsRev = {
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\f': '\\f',
  '\v': '\\v'
};

var singleQuoteEscapeChars = {
  n: '\n',
  r: '\r',
  t: '\t',
  f: '\f',
  '\\': '\\',
  '\'': '\''
};

var doubleQuotesEscapeChars = {
  n: '\n',
  r: '\r',
  t: '\t',
  f: '\f',
  '\\': '\\',
  '"': '"'
};

function ParseContext(str, pos, pseudos, attrEqualityMods, ruleNestingOperators, substitutesEnabled) {
  var chr, getIdent, getStr, l, skipWhitespace;
  l = str.length;
  chr = null;
  getStr = function(quote, escapeTable) {
    var esc, hex, result;
    result = '';
    pos++;
    chr = str.charAt(pos);
    while (pos < l) {
      if (chr === quote) {
        pos++;
        return result;
      } else if (chr === '\\') {
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
          if (chr === ' ') {
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
    var result = '';
    chr = str.charAt(pos);
    while (pos < l) {
      if (isIdent(chr) || (specials && specials[chr])) {
        result += chr;
      } else if (chr === '\\') {
        pos++;
        if (pos >= l) {
          throw Error('Expected symbol but end of file reached.');
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
          if (chr === ' ') {
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
    while (chr === ' ' || chr === "\t" || chr === "\n" || chr === "\r" || chr === "\f") {
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
    while (chr === ',') {
      pos++;
      skipWhitespace();
      if (res.type !== 'selectors') {
        res = {
          type: 'selectors',
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

    let opm = str.slice(pos,pos + 4).match(/^(\>{1,3}|\+|~)/);

    var selector = {
      type: 'ruleSet'
    };

    var rule = opm ? Object.assign([],{type: 'rule', isScope: true}) : this.parseRule();

    if (!rule) {
      return null;
    }
    var currentRule = selector;
    while (rule) {
      rule.type = 'rule';
      if(currentRule == rule){
        // console.log('still at the same rule!');
      } else {
        currentRule.rule = rule;
        currentRule = rule;
      }

      skipWhitespace();
      chr = str.charAt(pos);
      if (pos >= l || chr === ',' || chr === ')') {
        break;
      }
      if (ruleNestingOperators[chr]) {
        var op = chr;
        if(op == '>' && str.charAt(pos + 1) == '>' && str.charAt(pos + 2) == '>'){
          op = '>>>';
          pos = pos + 3;
        } else if(op == '>' && str.charAt(pos + 1) == '>'){
          op = '>>';
          pos = pos + 2;
        } else {
          pos++;
        }
        skipWhitespace();
        rule = this.parseRule(null);

        if (!rule) {
          if(op == '>' || op == '>>>' || op == '>>'){
            rule = RULE({tagName: '*'});
          } else {
            throw Error('Rule expected after "' + op + '".');
          }
        }
        rule.nestingOperator = op;
      } else {
        rule = this.parseRule(currentRule);
      }
    }
    return selector;
  };

  this.parseSubRule = function(type = 'is',simple = false,nest = false){
    let pseudo = {name: type, valueType: 'selector', up: true};
    // Should only go forward to the next whitehspace
    // console.log(this.parseSelector())

    if(simple){
      let value = this.parseRule();
      value.type = 'rule';
      pseudo.value = {type: 'ruleSet',rule: value};
      if(nest){
        pseudo.after = value.rule =  RULE({tagName: '*', nestingOperator: null, type: 'rule'});
      }
    } else {
      let value = this.parseSelector();
      pseudo.value = value;
    }

    return pseudo;
  }

  this.parseRule = function(currentRule) {
    var rule = null;
    var unimportant = false;
    var nextIsPseudo = false;
    var negate = false;
    var closest = false;
    // var up = false
    var part = {}

    // console.log('parseRule!',str.slice(pos),l);

    // simplest solution is to just remember
    var up = 0;

    while (pos < l) {
      chr = str.charAt(pos);
      // console.log('chr is now!!',chr);
      part = {}

      if (chr == '!') {
        negate = true;
        chr = str.charAt(++pos);
        rule = rule || currentRule;
        part.not = true;
      }

      // Legacy support for the @.flag stuff
      if(chr == '@' && str.charAt(pos + 1) == '.'){
        rule = rule || currentRule;
        part.implicitScope = true;
        pos++; chr = '.';
      } else if(chr == '@' && str.charAt(pos + 1) == '@'){
        part.closest = true;
        rule = rule || currentRule;
        pos++;
      } else if(chr == '.' && str.charAt(pos + 1) == '.'){
        closest = part;
        rule = rule || currentRule;
        part.implicitScope = true;
        pos++;
        // Now add a closestRule
        // rule.closest ||= []

        let next = str.charAt(pos + 1);
        if(next == '%' || next == '$' || next == '@'){
          chr = next;
          pos++;
        }
        // console.warn('.. !!!',chr,str.charAt(pos + 1));
      }

      while (chr == '^') {
        chr = str.charAt(++pos);
        rule = rule || currentRule;
        up++;
        // part.up = (part.up || 0) + 1;
      }

      part.up = up;
      // if(closest && part != closest){
      // }
      part.closest = closest;
      // part.closest = closest;

      if (chr === '&') {
        pos++;
        (rule = rule || []).isScope = true;

      } else if (chr === '^') {
        pos++;
        let pseudo = this.parseSubRule('is',true,true);
        (rule = rule || currentRule || []).push(pseudo);
      } else if (chr === '*') {
        pos++;
        // This has to be a new rule right?
        (rule = rule || []).tagName = '*';

      } else if (isIdentStart(chr) || chr === '\\') {
        (rule = rule || []).tagName = getIdent();
      } else if (chr === '$') {
        pos++;
        part.flag = '$' + getIdent();
        part.ref = true;
        (rule = rule || []).push(part);
      } else if (chr === '%') {
        pos++;
        part.flag = chr + getIdent();
        (rule = rule || []).push(part);
      } else if (chr === '.') {
        pos++;
        let flag = str.charAt(pos++);
        if(flag == '!'){
          part.not = true
          flag = ''
        }
        flag += getIdent({});
        part.flag = flag;
        (rule = rule || []).push(part);
      } else if (chr === '#') {
        pos++;
        (rule = rule || []).id = getIdent();
      } else if (chr === '[') {
        pos++;
        skipWhitespace();
        var attr = part.attr = {
          name: getIdent()
        };
        skipWhitespace();
        if (chr === ']') {
          pos++;
        } else {
          var operator = '';
          if (attrEqualityMods[chr]) {
            operator = chr;
            pos++;
            chr = str.charAt(pos);
          }
          if (pos >= l) {
            throw Error('Expected "=" but end of file reached.');
          }
          if (chr !== '=') {
            throw Error('Expected "=" but "' + chr + '" found.');
          }
          attr.operator = operator + '=';
          pos++;
          skipWhitespace();
          var attrValue = '';
          attr.valueType = 'string';
          if (chr === '"') {
            attrValue = getStr('"', doubleQuotesEscapeChars);
          } else if (chr === '\'') {
            attrValue = getStr('\'', singleQuoteEscapeChars);
          } else if (substitutesEnabled && chr === '$') {
            pos++;
            attrValue = getIdent();
            attr.valueType = 'substitute';
          } else {
            while (pos < l) {
              if (chr === ']') {
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
          if (chr !== ']') {
            throw Error('Expected "]" but "' + chr + '" found.');
          }
          pos++;
          attr.value = attrValue;
        }
        (rule = rule || []).push(part);
        // (rule.attrs = rule.attrs || []).push(attr);
      } else if (chr === ':' || chr === '@') {
        // This is the pseudo element
        if(chr == ':' && str.charAt(pos + 1) == ':'){
          (rule = rule || currentRule || []).pseudoElement = getIdent({':':true})
          continue;
        }

        pos++;
        part.name = chr;
        var pseudo = part;

        let pseudoName = str.charAt(pos++);

        if(pseudoName == '!'){
          part.not = true;
          pseudoName = '';
        }

        pseudoName += getIdent({'~':true,'+':true,'.':false,'>':true,'<':true});

        if(pseudoName == 'unimportant'){
          unimportant = true;
          part.type = 'unimportant';

          (rule = rule || currentRule || []).push(part);
          //let pseudo = this.parseSubRule('where');
          // (rule.pseudos = rule.pseudos || []).push(pseudo);
          continue;
        }

        part.name += pseudoName;
        part.pseudo = pseudoName;

        if (chr === '(') {
          pos++;
          var value = '';
          skipWhitespace();
          if (pseudos[pseudoName] === 'selector') {
            pseudo.valueType = 'selector';
            value = this.parseSelector();
          } else {
            pseudo.valueType = pseudos[pseudoName] || 'string';
            if (chr === '"') {
              value = getStr('"', doubleQuotesEscapeChars);
            } else if (chr === '\'') {
              value = getStr('\'', singleQuoteEscapeChars);
            } else if (substitutesEnabled && chr === '$') {
              pos++;
              value = getIdent();
              pseudo.valueType = 'substitute';
            } else {
              while (pos < l) {
                if (chr === ')') {
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
          if (chr !== ')') {
            throw Error('Expected ")" but "' + chr + '" found.');
          }
          pos++;
          pseudo.value = value;

        }
        (rule = rule || currentRule || []).push(part);
      } else {
        break;
      }
    }
    return rule;
  };
  return this;
}

CssSelectorParser.prototype.parse = function(str) {
  var context = new ParseContext(
      str,
      0,
      this.pseudos,
      this.attrEqualityMods,
      this.ruleNestingOperators,
      this.substitutesEnabled
  );
  return context.parse();
};

CssSelectorParser.prototype.escapeIdentifier = function(s) {
  var result = '';
  var i = 0;
  var len = s.length;
  while (i < len) {
    var chr = s.charAt(i);
    if (identSpecialChars[chr]) {
      result += '\\' + chr;
    } else {
      if (
          !(
              chr === '_' || chr === '-' ||
              (chr >= 'A' && chr <= 'Z') ||
              (chr >= 'a' && chr <= 'z') ||
              (i !== 0 && chr >= '0' && chr <= '9')
          )
      ) {
        var charCode = chr.charCodeAt(0);
        if ((charCode & 0xF800) === 0xD800) {
          var extraCharCode = s.charCodeAt(i++);
          if ((charCode & 0xFC00) !== 0xD800 || (extraCharCode & 0xFC00) !== 0xDC00) {
            throw Error('UCS-2(decode): illegal sequence');
          }
          charCode = ((charCode & 0x3FF) << 10) + (extraCharCode & 0x3FF) + 0x10000;
        }
        result += '\\' + charCode.toString(16) + ' ';
      } else {
        result += chr;
      }
    }
    i++;
  }
  return result;
};

CssSelectorParser.prototype.escapeStr = function(s) {
  var result = '';
  var i = 0;
  var len = s.length;
  var chr, replacement;
  while (i < len) {
    chr = s.charAt(i);
    if (chr === '"') {
      chr = '\\"';
    } else if (chr === '\\') {
      chr = '\\\\';
    } else if (replacement = strReplacementsRev[chr]) {
      chr = replacement;
    }
    result += chr;
    i++;
  }
  return "\"" + result + "\"";
};

CssSelectorParser.prototype.render = function(path) {
  return this._renderEntity(path).trim();
};

var rootSelector = null;
CssSelectorParser.prototype._renderEntity = function(entity,parent) {
  var currentEntity, parts, res;
  res = '';
  switch (entity.type) {
    case 'ruleSet':
      currentEntity = entity.rule;
      rootSelector = entity;
      parts = [];
      while (currentEntity) {
        if (currentEntity.nestingOperator) {
          parts.push(currentEntity.nestingOperator);
        }
        parts.push(this._renderEntity(currentEntity));
        currentEntity = currentEntity.rule;
      }
      let media = entity.media && entity.media.length ? ` @media ${entity.media.join(' and ')}` : ''
      res = parts.join(' ') + media;
      break;
    case 'selectors':
      res = entity.selectors.map(this._renderEntity, this).join(', ');
      break;
    case 'rule':
      let s0 = entity.s1;
      let s1 = entity.s2;
      let tagName = entity.tagName;

      if (tagName) {
        if (tagName === '*') {
          res = '*';
        } else {
          let native = TAG_NAMES[tagName] || tagName == 'svg' || tagName.indexOf('-') > 0;
          let escaped = this.escapeIdentifier(tagName);
          // || TAG_NAMES[`svg_${tagName}`]
          if(native){
            res = escaped;
          } else {
            res = `:is(${escaped},${escaped}-tag)`
          }
        }
      }
      if (entity.id) {
        res += "#" + this.escapeIdentifier(entity.id);
      }

      let idx = 0;
      let len = entity.length;

      while(idx < len){
        let shortest = null;
        let part = entity[idx++];
        let attr = part.attr;
        let flag = part.flag;
        let out = "";
        let neg = part.not;
        let pseudo = part.pseudo ? part : null;
        let desc = modifiers[part.pseudo];

        // Identify numeric media here?

        if(part.media || part.skip){
          // console.log('media',rootSelector);
          continue;
        }

        if(desc && desc.flag){
          flag = desc.flag;
          pseudo = null;
        }

        if(desc && desc.type == 'el'){
          pseudo = null;
          entity.pseudoElement ||= '::' + part.pseudo;
        }

        if(flag){
          out = '.' + this.escapeIdentifier(flag);
        }

        if(attr) {
          if (attr.operator) {
            if (attr.valueType === 'substitute') {
              out = "[" + this.escapeIdentifier(attr.name) + attr.operator + "$" + attr.value + "]";
            } else {
              out = "[" + this.escapeIdentifier(attr.name) + attr.operator + this.escapeStr(attr.value) + "]";
            }
          } else {
            out = "[" + this.escapeIdentifier(attr.name) + "]";
          }
        }

        if(pseudo){
          // check if it is a native one
          let name = (desc && desc.name) ?? pseudo.pseudo;
          let escaped = this.escapeIdentifier(name);

          if(desc && desc.valueType) {
            pseudo = desc;
          }

          // Check if it is a well known type
          let post = "";
          let value = pseudo.value || pseudo.name;
          // let neg = pseudo.not;
          let pre = ":" + escaped;
          // Hack doesnt work with @[] as selectors

          if (pseudo.valueType) {
            if (pseudo.valueType === 'selector') {
              out = pre + "(" + this._renderEntity(pseudo.value,parent) + ")" + post;
            } else if (pseudo.valueType === 'substitute') {
              out = pre + "($" + pseudo.value + ")" + post;
            } else if (pseudo.valueType === 'numeric') {
              out = pre + "(" + pseudo.value + ")" + post;
            } else if (pseudo.valueType === 'raw' || pseudo.valueType === 'string' ) {
              out = pre + "(" + pseudo.value + ")" + post;
            } else {
              out = pre + "(" + this.escapeIdentifier(pseudo.value) + ")" + post;
            }
          } else if(pseudo.type == 'el') {
            out = ':' + pre;
          } else if(!desc) {
            out = `.\\@${escaped}`
          } else if(desc.shim) {
            let pre = neg ? ':not' : ':is';
            out = `.\\@${escaped}`
            out = `${pre}(:${typeof desc.native == 'string' ? desc.native : escaped},${out})`;
            neg = false;
          } else if(desc.flag) {
            out = `.\\@${escaped}`
          } else {
            out = pre + post;
          }
        }

        if(part.closest) {
          // fetch all the other
          // out = `:${neg ? 'not' : 'is'}(${out},${out} *)`
          let parts = entity.filter(v=> v.closest == part);
          // console.log('found parts',parts.length);
          parts.map( v=> v.closest = null )
          part.not = false;
          let all = this._renderEntity(RULE({type: 'rule'},parts))
          parts.map( v=> v.skip = true )
          // console.log("rendered",all);
          // find better way?
          out = `:${neg ? 'not' : 'is'}(${all} *)`
          neg = false;

        } else if (part.up) {
          let rest = part.up > 5 ? ' *' : ' > *'.repeat(part.up);
          out = `:${neg ? 'not' : 'is'}(${out}${rest})`
          neg = false;
        }

        if(neg){
          out = `:not(${out})`
        }

        res += out;
      }

      if(s0 > 0){
          while (--s0 >= 0) res += ":not(#_)";
      }
      if(s1 > 0){
        while (--s1 >= 0) res += ":not(._0)";
      }

      if(entity.pseudoElement){
        res += entity.pseudoElement;
      }
      break;
    default:
      throw Error('Unknown entity type: "' + entity.type(+'".'));
  }
  return res;
};

var parser = new CssSelectorParser();
parser.registerSelectorPseudos('has','not','is','matches','any','where')
parser.registerNumericPseudos('nth-child')
parser.registerNestingOperators('>>>','>>','>', '+', '~')
parser.registerAttrEqualityMods('^', '$', '*', '~')
// parser.enableSubstitutes()

export const parse = function(v){
  // console.log('parsing',v);
  return parser.parse(v) }
export const render = function(v){ return parser.render(v) }
// exports.default = parser;