var Token = (function () {
    function Token(offset, type, language) {
        this.offset = offset | 0;
        this.type = type;
        this.language = language;
        this.mods = 0;
        this.value = null;
        this.stack = null;
    }
    Token.prototype.toString = function () {
        return this.value || '';
    };
    Object.defineProperty(Token.prototype, "span", {
        get: function () {
            return { offset: this.offset, length: (this.value ? this.value.length : 0) };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "indent", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Token.prototype.match = function (val) {
        if (typeof val == 'string') {
            if (val.indexOf(' ') > 0) {
                val = val.split(' ');
            }
            else {
                var idx = this.type.indexOf(val);
                return (val[0] == '.') ? idx >= 0 : idx == 0;
            }
        }
        if (val instanceof Array) {
            for (var _i = 0, val_1 = val; _i < val_1.length; _i++) {
                var item = val_1[_i];
                var idx = this.type.indexOf(item);
                var hit = (item[0] == '.') ? idx >= 0 : idx == 0;
                if (hit)
                    return true;
            }
        }
        if (val instanceof RegExp) {
            return val.test(this.type);
        }
        return false;
    };
    return Token;
}());
export { Token };
var TokenizationResult = (function () {
    function TokenizationResult(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
    return TokenizationResult;
}());
export { TokenizationResult };
