export function isFuzzyActionArr(what) {
    return (Array.isArray(what));
}
export function isFuzzyAction(what) {
    return !isFuzzyActionArr(what);
}
export function isString(what) {
    return (typeof what === 'string');
}
export function isIAction(what) {
    return !isString(what);
}
export function empty(s) {
    return (s ? false : true);
}
export function fixCase(lexer, str) {
    return (lexer.ignoreCase && str ? str.toLowerCase() : str);
}
export function sanitize(s) {
    return s.replace(/[&<>'"_]/g, '-');
}
export function log(lexer, msg) {
    console.log(lexer.languageId + ": " + msg);
}
export function createError(lexer, msg) {
    return new Error(lexer.languageId + ": " + msg);
}
var substitutionCache = {};
export function compileSubstitution(str) {
    var parts = [];
    var i = 0;
    var l = str.length;
    var part = '';
    var sub = 0;
    while (i < l) {
        var chr = str[i++];
        if (chr == '$') {
            var next = str[i++];
            if (next == '$') {
                part += '$';
                continue;
            }
            if (part)
                parts.push(part);
            part = '';
            if (next == '#') {
                parts.push(0);
            }
            else if (next == 'S') {
                parts.push(parseInt(str[i++]) + 100);
            }
            else {
                parts.push(parseInt(next) + 1);
            }
        }
        else {
            part += chr;
        }
    }
    if (part)
        parts.push(part);
    substitutionCache[str] = parts;
    return parts;
}
export function substituteMatches(lexer, str, id, matches, state) {
    var stateMatches = null;
    var parts = substitutionCache[str] || compileSubstitution(str);
    var out = "";
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (typeof part == 'string') {
            out += part;
        }
        else if (part > 100) {
            if (stateMatches === null)
                stateMatches = state.split('.');
            out += (stateMatches[part - 101] || '');
        }
        else if (part === 100) {
            out += state;
        }
        else if (part === 0) {
            out += id;
        }
        else if (part > 0) {
            out += matches[part - 1];
        }
    }
    return out;
}
export function substituteMatchesOld(lexer, str, id, matches, state) {
    var re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
    var stateMatches = null;
    return str.replace(re, function (full, sub, dollar, hash, n, s, attr, ofs, total) {
        if (!empty(dollar)) {
            return '$';
        }
        if (!empty(hash)) {
            return fixCase(lexer, id);
        }
        if (!empty(n) && n < matches.length) {
            return fixCase(lexer, matches[n]);
        }
        if (!empty(attr) && lexer && typeof (lexer[attr]) === 'string') {
            return lexer[attr];
        }
        if (stateMatches === null) {
            stateMatches = state.split('.');
            stateMatches.unshift(state);
        }
        if (!empty(s) && s < stateMatches.length) {
            return fixCase(lexer, stateMatches[s]);
        }
        return '';
    });
}
var FIND_RULES_MAP = {};
export function findRules(lexer, inState) {
    var state = inState;
    if (FIND_RULES_MAP[state]) {
        return lexer.tokenizer[FIND_RULES_MAP[state]];
    }
    while (state && state.length > 0) {
        var rules = lexer.tokenizer[state];
        if (rules) {
            FIND_RULES_MAP[inState] = state;
            return rules;
        }
        var idx = state.lastIndexOf('.');
        if (idx < 0) {
            state = null;
        }
        else {
            state = state.substr(0, idx);
        }
    }
    return null;
}
export function stateExists(lexer, inState) {
    var state = inState;
    while (state && state.length > 0) {
        var exist = lexer.stateNames[state];
        if (exist) {
            return true;
        }
        var idx = state.lastIndexOf('.');
        if (idx < 0) {
            state = null;
        }
        else {
            state = state.substr(0, idx);
        }
    }
    return false;
}
