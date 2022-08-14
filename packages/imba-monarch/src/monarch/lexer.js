import { Token, TokenizationResult } from './token';
import * as monarchCommon from './common';
var CACHE_STACK_DEPTH = 10;
function statePart(state, index) {
    return state.split('.')[index];
}
var MonarchStackElementFactory = (function () {
    function MonarchStackElementFactory(maxCacheDepth) {
        this._maxCacheDepth = maxCacheDepth;
        this._entries = Object.create(null);
    }
    MonarchStackElementFactory.create = function (parent, state) {
        return this._INSTANCE.create(parent, state);
    };
    MonarchStackElementFactory.prototype.create = function (parent, state) {
        if (parent !== null && parent.depth >= this._maxCacheDepth) {
            return new MonarchStackElement(parent, state);
        }
        var stackElementId = MonarchStackElement.getStackElementId(parent);
        if (stackElementId.length > 0) {
            stackElementId += '|';
        }
        stackElementId += state;
        var result = this._entries[stackElementId];
        if (result) {
            return result;
        }
        result = new MonarchStackElement(parent, state);
        this._entries[stackElementId] = result;
        return result;
    };
    MonarchStackElementFactory._INSTANCE = new MonarchStackElementFactory(CACHE_STACK_DEPTH);
    return MonarchStackElementFactory;
}());
var MonarchStackElement = (function () {
    function MonarchStackElement(parent, state) {
        this.parent = parent;
        this.state = state;
        this.depth = (this.parent ? this.parent.depth : 0) + 1;
    }
    MonarchStackElement.getStackElementId = function (element) {
        var result = '';
        while (element !== null) {
            if (result.length > 0) {
                result += '|';
            }
            result += element.state;
            element = element.parent;
        }
        return result;
    };
    MonarchStackElement._equals = function (a, b) {
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
    };
    Object.defineProperty(MonarchStackElement.prototype, "indent", {
        get: function () {
            return this.state.lastIndexOf('\t') - this.state.indexOf('\t');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonarchStackElement.prototype, "scope", {
        get: function () {
            return this.part(2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonarchStackElement.prototype, "detail", {
        get: function () {
            return this.part(2);
        },
        enumerable: true,
        configurable: true
    });
    MonarchStackElement.prototype.part = function (index) {
        return this.state.split('.')[index];
    };
    MonarchStackElement.prototype.equals = function (other) {
        return MonarchStackElement._equals(this, other);
    };
    MonarchStackElement.prototype.push = function (state) {
        return MonarchStackElementFactory.create(this, state);
    };
    MonarchStackElement.prototype.pop = function () {
        return this.parent;
    };
    MonarchStackElement.prototype.popall = function () {
        var result = this;
        while (result.parent) {
            result = result.parent;
        }
        return result;
    };
    MonarchStackElement.prototype.switchTo = function (state) {
        return MonarchStackElementFactory.create(this.parent, state);
    };
    return MonarchStackElement;
}());
var MonarchLineStateFactory = (function () {
    function MonarchLineStateFactory(maxCacheDepth) {
        this._maxCacheDepth = maxCacheDepth;
        this._entries = Object.create(null);
    }
    MonarchLineStateFactory.create = function (stack) {
        return this._INSTANCE.create(stack);
    };
    MonarchLineStateFactory.prototype.create = function (stack) {
        if (stack !== null && stack.depth >= this._maxCacheDepth) {
            return new MonarchLineState(stack);
        }
        var stackElementId = MonarchStackElement.getStackElementId(stack);
        var result = this._entries[stackElementId];
        if (result) {
            return result;
        }
        result = new MonarchLineState(stack);
        this._entries[stackElementId] = result;
        return result;
    };
    MonarchLineStateFactory._INSTANCE = new MonarchLineStateFactory(CACHE_STACK_DEPTH);
    return MonarchLineStateFactory;
}());
var MonarchLineState = (function () {
    function MonarchLineState(stack) {
        this.stack = stack;
    }
    MonarchLineState.prototype.clone = function () {
        return MonarchLineStateFactory.create(this.stack);
    };
    MonarchLineState.prototype.equals = function (other) {
        if (!(other instanceof MonarchLineState)) {
            return false;
        }
        if (!this.stack.equals(other.stack)) {
            return false;
        }
        return true;
    };
    return MonarchLineState;
}());
var MonarchClassicTokensCollector = (function () {
    function MonarchClassicTokensCollector() {
        this._tokens = [];
        this._language = null;
        this._lastToken = new Token(0, 'start', 'imba');
        this._lastTokenType = null;
    }
    MonarchClassicTokensCollector.prototype.enterMode = function (startOffset, modeId) {
        this._language = modeId;
    };
    MonarchClassicTokensCollector.prototype.emit = function (startOffset, type, stack) {
        if (this._lastTokenType === type && false) {
            console.log('add to last token', type);
            return this._lastToken;
        }
        var token = new Token(startOffset, type, this._language);
        this._lastTokenType = type;
        this._lastToken = token;
        this._tokens.push(token);
        return token;
    };
    MonarchClassicTokensCollector.prototype.finalize = function (endState) {
        return new TokenizationResult(this._tokens, endState);
    };
    return MonarchClassicTokensCollector;
}());
var MonarchTokenizer = (function () {
    function MonarchTokenizer(modeId, lexer) {
        this._modeId = modeId;
        this._lexer = lexer;
        this._profile = false;
    }
    MonarchTokenizer.prototype.dispose = function () {
    };
    MonarchTokenizer.prototype.getLoadStatus = function () {
        return { loaded: true };
    };
    MonarchTokenizer.prototype.getInitialState = function () {
        var rootState = MonarchStackElementFactory.create(null, this._lexer.start);
        return MonarchLineStateFactory.create(rootState);
    };
    MonarchTokenizer.prototype.tokenize = function (line, lineState, offsetDelta) {
        var tokensCollector = new MonarchClassicTokensCollector();
        var endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
        return tokensCollector.finalize(endLineState);
    };
    MonarchTokenizer.prototype._tokenize = function (line, lineState, offsetDelta, collector) {
        return this._myTokenize(line, lineState, offsetDelta, collector);
    };
    MonarchTokenizer.prototype._safeRuleName = function (rule) {
        if (rule) {
            return rule.name;
        }
        return '(unknown)';
    };
    MonarchTokenizer.prototype._rescope = function (from, to, tokens, toState) {
        var a = (from || '').split('-');
        var b = (to || '').split('-');
        if (from == to)
            return;
        var diff = 1;
        while (a[diff] && a[diff] == b[diff]) {
            diff++;
        }
        var level = a.length;
        while (level > diff) {
            tokens.push('pop.' + a[--level] + '.' + level);
        }
        while (b.length > diff) {
            var id = 'push.' + b[diff++] + '.' + (diff - 1);
            if (toState) {
                var indent = statePart(toState, 1);
                id += '.' + indent;
            }
            tokens.push(id);
        }
    };
    MonarchTokenizer.prototype._myTokenize = function (line, lineState, offsetDelta, tokensCollector) {
        tokensCollector.enterMode(offsetDelta, this._modeId);
        var lineLength = line.length;
        var stack = lineState.stack;
        var lastToken = null;
        var pos = 0;
        var profile = this._profile;
        var groupMatching = null;
        var forceEvaluation = true;
        var append = [];
        var tries = 0;
        var rules = [];
        var rulesState = null;
        while (forceEvaluation || pos < lineLength) {
            tries++;
            if (tries > 1000) {
                console.log('infinite recursion');
                throw 'infinite recursion in tokenizer?';
            }
            var pos0 = pos;
            var stackLen0 = stack.depth;
            var groupLen0 = groupMatching ? groupMatching.groups.length : 0;
            var state = stack.state;
            var matches = null;
            var matched = null;
            var action = null;
            var rule = null;
            if (groupMatching) {
                matches = groupMatching.matches;
                var groupEntry = groupMatching.groups.shift();
                matched = groupEntry.matched;
                action = groupEntry.action;
                rule = groupMatching.rule;
                if (groupMatching.groups.length === 0) {
                    groupMatching = null;
                }
            }
            else {
                if (!forceEvaluation && pos >= lineLength) {
                    break;
                }
                forceEvaluation = false;
                rules = this._lexer.tokenizer[state];
                if (!rules) {
                    rules = monarchCommon.findRules(this._lexer, state);
                    if (!rules) {
                        throw monarchCommon.createError(this._lexer, 'tokenizer state is not defined: ' + state);
                    }
                }
                var restOfLine = line.substr(pos);
                for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                    var rule_1 = rules_1[_i];
                    if (rule_1.string !== undefined) {
                        if (restOfLine[0] === rule_1.string) {
                            matches = [rule_1.string];
                            matched = rule_1.string;
                            action = rule_1.action;
                            break;
                        }
                    }
                    else if (pos === 0 || !rule_1.matchOnlyAtLineStart) {
                        if (profile) {
                            rule_1.stats.count++;
                            var now = performance.now();
                            matches = restOfLine.match(rule_1.regex);
                            rule_1.stats.time += (performance.now() - now);
                            if (matches) {
                                rule_1.stats.hits++;
                            }
                        }
                        else {
                            matches = restOfLine.match(rule_1.regex);
                        }
                        if (matches) {
                            matched = matches[0];
                            action = rule_1.action;
                            break;
                        }
                    }
                }
            }
            if (!matches) {
                matches = [''];
                matched = '';
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
            while (monarchCommon.isFuzzyAction(action) && monarchCommon.isIAction(action) && action.test) {
                action = action.test(matched, matches, state, pos === lineLength);
            }
            var result = null;
            if (typeof action === 'string' || Array.isArray(action)) {
                result = action;
            }
            else if (action.group) {
                result = action.group;
            }
            else if (action.token !== null && action.token !== undefined) {
                if (action.tokenSubst) {
                    result = monarchCommon.substituteMatches(this._lexer, action.token, matched, matches, state);
                }
                else {
                    result = action.token;
                }
                if (action.goBack) {
                    pos = Math.max(0, pos - action.goBack);
                }
                if (action.switchTo && typeof action.switchTo === 'string') {
                    var nextState = monarchCommon.substituteMatches(this._lexer, action.switchTo, matched, matches, state);
                    if (nextState[0] === '@') {
                        nextState = nextState.substr(1);
                    }
                    if (!monarchCommon.findRules(this._lexer, nextState)) {
                        throw monarchCommon.createError(this._lexer, 'trying to switch to a state \'' + nextState + '\' that is undefined in rule: ' + this._safeRuleName(rule));
                    }
                    else {
                        var from = stack.scope;
                        var to = statePart(nextState, 2);
                        if (from !== to)
                            this._rescope(from, to, append, nextState);
                        stack = stack.switchTo(nextState);
                    }
                }
                else if (action.transform && typeof action.transform === 'function') {
                    throw monarchCommon.createError(this._lexer, 'action.transform not supported');
                }
                else if (action.next) {
                    if (action.next === '@push') {
                        if (stack.depth >= this._lexer.maxStack) {
                            throw monarchCommon.createError(this._lexer, 'maximum tokenizer stack size reached: [' +
                                stack.state + ',' + stack.parent.state + ',...]');
                        }
                        else {
                            stack = stack.push(state);
                        }
                    }
                    else if (action.next === '@pop') {
                        if (stack.depth <= 1) {
                            throw monarchCommon.createError(this._lexer, 'trying to pop an empty stack in rule: ' + this._safeRuleName(rule));
                        }
                        else {
                            var prev = stack;
                            stack = stack.pop();
                            var from = statePart(prev.state, 2);
                            var to = statePart(stack.state, 2);
                            if (from !== to)
                                this._rescope(from, to, append, stack.state);
                        }
                    }
                    else if (action.next === '@popall') {
                        stack = stack.popall();
                    }
                    else {
                        var nextState = monarchCommon.substituteMatches(this._lexer, action.next, matched, matches, state);
                        if (nextState[0] === '@') {
                            nextState = nextState.substr(1);
                        }
                        var nextScope = statePart(nextState, 2);
                        if (!monarchCommon.findRules(this._lexer, nextState)) {
                            throw monarchCommon.createError(this._lexer, 'trying to set a next state \'' + nextState + '\' that is undefined in rule: ' + this._safeRuleName(rule));
                        }
                        else {
                            if (nextScope != stack.scope)
                                this._rescope(stack.scope || '', nextScope, append, nextState);
                            stack = stack.push(nextState);
                        }
                    }
                }
                if (action.log && typeof (action.log) === 'string') {
                    monarchCommon.log(this._lexer, this._lexer.languageId + ': ' + monarchCommon.substituteMatches(this._lexer, action.log, matched, matches, state));
                }
                if (action.mark) {
                    tokensCollector.emit(pos0 + offsetDelta, action.mark, stack);
                }
            }
            if (result === null) {
                throw monarchCommon.createError(this._lexer, 'lexer rule has no well-defined action in rule: ' + this._safeRuleName(rule));
            }
            if (Array.isArray(result)) {
                if (groupMatching && groupMatching.groups.length > 0) {
                    throw monarchCommon.createError(this._lexer, 'groups cannot be nested: ' + this._safeRuleName(rule));
                }
                if (matches.length !== result.length + 1) {
                    throw monarchCommon.createError(this._lexer, 'matched number of groups does not match the number of actions in rule: ' + this._safeRuleName(rule));
                }
                var totalLen = 0;
                for (var i = 1; i < matches.length; i++) {
                    totalLen += matches[i].length;
                }
                if (totalLen !== matched.length) {
                    throw monarchCommon.createError(this._lexer, 'with groups, all characters should be matched in consecutive groups in rule: ' + this._safeRuleName(rule));
                }
                groupMatching = {
                    rule: rule,
                    matches: matches,
                    groups: []
                };
                for (var i = 0; i < result.length; i++) {
                    groupMatching.groups[i] = {
                        action: result[i],
                        matched: matches[i + 1]
                    };
                }
                pos -= matched.length;
                continue;
            }
            else {
                if (result === '@rematch') {
                    pos -= matched.length;
                    matched = '';
                    matches = null;
                    result = '';
                }
                if (matched.length === 0) {
                    if (lineLength === 0 || stackLen0 !== stack.depth || state !== stack.state || (!groupMatching ? 0 : groupMatching.groups.length) !== groupLen0) {
                        if (typeof result == 'string' && result)
                            tokensCollector.emit(pos + offsetDelta, result, stack);
                        while (append.length > 0) {
                            tokensCollector.emit(pos + offsetDelta, append.shift(), stack);
                        }
                        continue;
                    }
                    else {
                        throw monarchCommon.createError(this._lexer, 'no progress in tokenizer in rule: ' + this._safeRuleName(rule));
                    }
                }
                var tokenType = null;
                if (monarchCommon.isString(result) && result.indexOf('@brackets') === 0) {
                    var rest = result.substr('@brackets'.length);
                    var bracket = findBracket(this._lexer, matched);
                    if (!bracket) {
                        throw monarchCommon.createError(this._lexer, '@brackets token returned but no bracket defined as: ' + matched);
                    }
                    tokenType = monarchCommon.sanitize(bracket.token + rest);
                }
                else {
                    var token_1 = (result === '' ? '' : result + this._lexer.tokenPostfix);
                    tokenType = monarchCommon.sanitize(token_1);
                }
                var token = tokensCollector.emit(pos0 + offsetDelta, tokenType, stack);
                token.stack = stack;
                if (lastToken && lastToken != token) {
                    lastToken.value = line.slice(lastToken.offset - offsetDelta, pos0);
                }
                lastToken = token;
                while (append.length > 0) {
                    tokensCollector.emit(pos + offsetDelta, append.shift(), stack);
                }
            }
        }
        if (lastToken && !lastToken.value) {
            lastToken.value = line.slice(lastToken.offset - offsetDelta);
        }
        return MonarchLineStateFactory.create(stack);
    };
    return MonarchTokenizer;
}());
export { MonarchTokenizer };
function findBracket(lexer, matched) {
    if (!matched) {
        return null;
    }
    matched = monarchCommon.fixCase(lexer, matched);
    var brackets = lexer.brackets;
    for (var _i = 0, brackets_1 = brackets; _i < brackets_1.length; _i++) {
        var bracket = brackets_1[_i];
        if (bracket.open === matched) {
            return { token: bracket.token, bracketType: 1 };
        }
        else if (bracket.close === matched) {
            return { token: bracket.token, bracketType: -1 };
        }
    }
    return null;
}
export function createTokenizationSupport(modeId, lexer) {
    return new MonarchTokenizer(modeId, lexer);
}
