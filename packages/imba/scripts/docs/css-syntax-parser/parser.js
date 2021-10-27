/*****************************************************************/
/***************	CSSFormalSyntaxParser.js	******************/
/**
 * Framework Dynamique.js
 * Docs/licence: https://www.dynamiquejs.org
 * Source: https://github.com/gauthier-scano/
 * Version: 1.0
 * Licence: MIT
 * Copyright: © Gauthier SCANO - 2020
 * 
 * Created according to W3C specification : https://www.w3.org/TR/css-values-4/
 * 
 * 							-- MIT License --
 * Copyright (c) 2020 Gauthier SCANO - https://github.com/gauthier-scano/
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

export default function CSSFormalSyntaxParser(syntax, commonProp = true, property = false) {
    if (property) {
        this.setProperty(property);
    }

    return this.setSyntax(syntax, commonProp);
};


CSSFormalSyntaxParser.setProperty = function (property) {
    CSSFormalSyntaxParser.prototype.property = property;

    return this;
};
CSSFormalSyntaxParser.addProperty = function (name, rule) {
    CSSFormalSyntaxParser.prototype.property[name] = rule;

    return this;
};
CSSFormalSyntaxParser.deleteProperty = function (name) {
    delete CSSFormalSyntaxParser.prototype.property[name];

    return this;
};

CSSFormalSyntaxParser.setBasicDataType = function (dataType) {
    CSSFormalSyntaxParser.prototype.basicDataType = dataType;

    return this;
};
CSSFormalSyntaxParser.addBasicDataType = function (name, rule) {
    CSSFormalSyntaxParser.prototype.basicDataType[name] = rule;

    return this;
};
CSSFormalSyntaxParser.deleteBasicDataType = function (name) {
    delete CSSFormalSyntaxParser.prototype.basicDataType[name];

    return this;
};


CSSFormalSyntaxParser.generateRegExpType = function (regexp, defaultValue) {
    return {
        regexp: regexp,
        defaultValue: defaultValue
    };
};

CSSFormalSyntaxParser.generateRegExpListType = function (regexp, regexpProposal, defaultValue, unitList) {
    return {
        regexp: regexp,
        defaultValue: defaultValue,

        proposal: function (value, proposal, stringObjt) {
            if (!stringObjt.endWithSpace) {
                const match = value.match(regexpProposal);

                if (match) {
                    if (match[1]) {
                        const unit = match[1],
                            unitLength = unit.length,
                            proposalLength = proposal.length;

                        for (let i = 0, length = unitList.length; i < length; i++) {
                            if (unitList[i] != unit && unitList[i].slice(0, unitLength) == unit) {
                                proposal[proposal.length] = unitList[i].slice(unitLength);
                            }
                        }

                        return proposal.length != proposalLength;
                    }
                    else {
                        proposal.push.apply(proposal, unitList);
                    }
                }
            }

            return false;
        }
    };
};


CSSFormalSyntaxParser.prototype = {
    action: null,
    syntax: "",
    setSyntax: function (syntax = "", addCommon = true) {
        if (addCommon) {
            syntax += this.propertyCommon;
        }

        this.syntax = syntax;
        this.action = this.parseSyntax(syntax);

        return this;
    },
    removeSyntax: function () {
        this.syntax = "";
        this.action = null;

        return this;
    },

    test: function (str, proposalEnable = true) {
        if (!this.action) {
            throw new Error("No syntax was parsed before testing value. Please use method 'setSyntax'.");
        }

        const stringObjt = {
            string: str.trim(),	// String is "ASCII case-insensitively (i.e., [a-z] and [A-Z] are equivalent)." BUT <custom-ident> is case sensitive
            endWithSpace: this.spaceChar.test(str[str.length - 1]),
            list: [],			// Contain all the css string values as: { value : {String} value n of the property, trigger : {String} the trigger that stop the value extraction, if = null the extraction was stop due to the end of the string }
            index: 0,			// {Integer}, the cursor position in the list array, if = -1 no value was extracted
            proposal: [],
            value: {}
        },
            userObject = {
                string: stringObjt.string,
                value: null,		// Contain all the css values split according of the value type
                proposal: [],			// Contain all the proposal value for the last value
                //	overflow 	 : false,		// True if too many values were found in tested string according to the syntax
                //	missingValue : false,		// True if value(s) is/are missing in tested string
                valid: false		// If str or css syntax was not defined, the test will not be performed. Equal true if no error was founded
                //	system	 	 : stringObjt
            };

        userObject.valid = !!this.action.process(stringObjt, this.action, this, proposalEnable);
        userObject.value = stringObjt.value;

        for (let i = 0, y = 0, length = stringObjt.proposal.length; i < length; i++) {
            if (stringObjt.proposal[i] && userObject.proposal.indexOf(stringObjt.proposal[i]) == -1) {
                userObject.proposal[y++] = stringObjt.proposal[i];
            }
        }

        if (stringObjt.list.length && !stringObjt.list[stringObjt.list.length - 1].trigger) {
            if (stringObjt.index < stringObjt.list.length) {
                userObject.valid = false;
                //	userObject.missingValue = true;
            }
            else if (stringObjt.index > stringObjt.list.length) {
                userObject.valid = false;
                //	userObject.overflow = true;
            }
        }
        else {
            userObject.valid = false;
        }

        return userObject;
    },

    parseSyntax: function (syntax) {
        const syntaxObjt = {
            syntax: syntax,// Initial syntax to parse
            cursor: 0,		// Cursor position in syntax string
            list: [],		// List of the combinator found in syntax
            index: -1		// Index position in the combinator array "list"
        };

        let parentAction;
        for (let buffer, targetAction, targetBuffer; (buffer = this.parseSyntaxBuffer(syntaxObjt));) {
            if (!buffer.combinator) {											// If no combinator was found in syntax string
                if (targetBuffer) {												// If a combinator was already used
                    buffer.combinator = targetBuffer.combinator;				// Processing buffer as a member of this combinator
                }
                else {
                    buffer.combinator = this.combinator[this.combinatorDefault];// Else default combinator is used
                }
            }

            let parentCreated = false;
            if (!parentAction) {															// If no combinator exist at the top level
                parentAction = targetAction = this.createAction(buffer.combinator);		// Creating main parent action
                targetBuffer = buffer;
                parentCreated = true;
            }

            if (buffer.group && this.combinator[buffer.group].prepare) {									// If combinator is a "group" (delimiter has its own way to parse content)
                buffer.groupAction = this.createAction(this.combinator[buffer.group]);					// Creating dedicate action

                this.combinator[buffer.group].prepare(syntaxObjt, buffer, buffer.groupAction, this);	// Preparing action
            }

            if (buffer.combinator.name == targetBuffer.combinator.name) {	// If the syntax component has no delemiter (last component of the string) or if it has the same combinator
                if (buffer.value) {
                    targetAction.as[targetAction.as.length] = buffer.groupAction || this.createComponentChecker(buffer.value, buffer.quantity, buffer.name);	// Storing the component in the current action as a component to verify during process
                }
            }
            else {														// Else a combinator is defined and different than the actual one
                const action = this.createAction(buffer.combinator);	// Creation of a new action that will work with the actual buffer, the new action is automatically added to the parent in property "as"

                if (buffer.combinator.priority > targetBuffer.combinator.priority) {		// If the priority of the founded combinator is > than actual, the value has to be associated with the new combinator
                    if (buffer.value) {
                        action.as[action.as.length] = buffer.groupAction || this.createComponentChecker(buffer.value, buffer.quantity, buffer.name);
                    }

                    targetAction.as[targetAction.as.length] = action;	// The new action is automatically added to the 
                    targetAction = action;
                    targetBuffer = buffer;
                }
                else { 					// The value will be associated with the actual combinator
                    if (buffer.value) {	// If a value is available, it's stored with the parent action
                        targetAction.as[targetAction.as.length] = buffer.groupAction || this.createComponentChecker(buffer.value, buffer.quantity, buffer.name);
                    }

                    if (buffer.combinator.priority) {				// If combinator has priority (!= null or > 0), it takes the place of "master" in the tree
                        action.as[action.as.length] = parentAction;	// Adding to prepared object the global object
                        parentAction = targetAction = action;
                        targetBuffer = buffer;
                    }
                }
            }
        }

        return parentAction;
    },

    parseSyntaxBuffer: function (syntaxObjt) {
        const index = syntaxObjt.index + 1;

        if (!syntaxObjt.list[index]) {	// If value wanted is not defined
            const buffer = this.parseSyntaxTo(syntaxObjt); // Extracting the next value

            if (buffer.combinator || buffer.value) {	// If a combinator or a value was found, storing the founded value in the dedicated array
                syntaxObjt.list[++syntaxObjt.index] = buffer;
            }
        }
        else {
            syntaxObjt.index = index;	// If value is defined the cursor is set to the wanted position
        }

        return syntaxObjt.list[index] || null;	// If finally a value was not found at the index given, null is returned
    },

    // Extrait la chaine de la position actuelle jusqu'au prochain combinateur/multiplicateur ou la fin de la chaine
    parseSyntaxTo: function (syntaxObjt) {
        const syntaxStringObjt = {
            name: "",
            value: "",
            multiplier: "",
            quantity: this.quantityDefault,
            combinator: null
        };
        let combinatorFound = false,
            multiplierFound = false,
            spaceSpecial = false;

        for (; this.spaceChar.test(syntaxObjt.syntax[syntaxObjt.cursor]); syntaxObjt.cursor++);	// Deleting useless space char

        B: for (const length = syntaxObjt.syntax.length; syntaxObjt.cursor < length; syntaxObjt.cursor++) {	// While the end of the string is not reached
            const actChar = syntaxObjt.syntax[syntaxObjt.cursor];

            if (!spaceSpecial && this.spaceChar.test(actChar)) {						// If actual char is a space
                while (this.spaceChar.test(syntaxObjt.syntax[++syntaxObjt.cursor]));	// Ignoring all others spaces

                const act = syntaxObjt.syntax[syntaxObjt.cursor--];

                if (!this.multiplier[act] && !this.combinatorFirst[act] && !this.trigger[act]) {
                    spaceSpecial = true;
                    syntaxObjt.cursor--;
                }
            }
            else if (this.multiplier[actChar]) {	// Si charactère multiplicateur détecté (déclencheur sur 1 caractère d'après le standard)
                if (syntaxStringObjt.value) {
                    syntaxStringObjt.multiplier = actChar;

                    this.multiplier[actChar](syntaxObjt, syntaxStringObjt, this);
                    multiplierFound = true;
                    spaceSpecial = false;
                }
                else {
                    throw new Error("Operator '" + actChar + "' found without string before.");
                }
            }
            else if (actChar == this.escapeChar) {
                syntaxStringObjt.value += syntaxObjt.syntax[++syntaxObjt.cursor];
            }
            else if (this.combinatorFirst[actChar]) {	// Si combinateur
                for (let combLength = this.combinatorLength; combLength; combLength--) {
                    let combStr = actChar;
                    for (let i = 1; i < combLength; i++) {
                        combStr += syntaxObjt.syntax[syntaxObjt.cursor + i];
                    }

                    if (this.combinator[combStr]) {
                        if (this.combinator[combStr].parseSyntax) {
                            if (syntaxStringObjt.value) {	// Case "a [b c]" => trigger = "[" but should be " "
                                syntaxStringObjt.combinator = this.combinator[this.combinatorDefault];
                                break B;
                            }
                            else if (combinatorFound) {
                                break B;
                            }
                            else {
                                syntaxStringObjt.group = combStr;
                                this.combinator[combStr].parseSyntax(syntaxObjt, syntaxStringObjt);

                                combinatorFound = true;
                                continue B;
                            }
                        }
                        else {
                            syntaxObjt.cursor += combStr.length;
                            syntaxStringObjt.combinator = this.combinator[combStr];

                            break B;
                        }
                    }
                }

                syntaxStringObjt.value += actChar;	// Dans tous les autres cas, si la chaine vaut par exemple "a & b", & n'étant pas un déclencheur malgrès qu'un déclencheur ait ce charactère, bufferisation
            }
            else if (this.trigger[actChar] && !multiplierFound && !combinatorFound && !syntaxStringObjt.group) {	// a#, => creates 2 component "a#" and ","
                if (!syntaxStringObjt.value) {
                    syntaxObjt.cursor++;
                    syntaxStringObjt.value = actChar;
                    combinatorFound = true;
                }

                if (!syntaxStringObjt.combinator) {
                    syntaxStringObjt.combinator = this.combinator[this.combinatorDefault];
                }

                break;
            }
            else if (multiplierFound || combinatorFound) {
                break;
            }
            else {
                syntaxStringObjt.value += actChar;
            }
        }

        syntaxStringObjt.name = syntaxStringObjt.value + syntaxStringObjt.multiplier;

        return syntaxStringObjt;
    },

    createAction: function (combinator) {
        return {
            name: combinator.name,
            process: combinator.process,
            as: []
        };
    },

    createComponentChecker: function (value, quantity, name, test = str => str.toLowerCase() == value, proposalFct = null) {
        if (typeof value == "string") {
            value = value.toLowerCase();
        }

        return {
            process: function (stringObjt, action, parentClass, proposalEnable) {
                const min = action.quantity[0],
                    max = action.quantity[1],
                    token = action.quantity[2],
                    path = [];
                let count = 0,
                    valueFound = null,
                    tokenNeedValue = false;

                if (!min) {
                    path[0] = stringObjt.index;
                }

                for (let cssValue; count < max && (cssValue = parentClass.parseValue(stringObjt)); stringObjt.index++) {
                    if (test(cssValue.value)) {
                        count++;

                        if (!valueFound) {
                            valueFound = [];
                        }

                        valueFound[valueFound.length] = cssValue.value;

                        if (count >= min) {
                            path[path.length] = stringObjt.index + 1;
                        }

                        if (cssValue.trigger) {
                            if ((!token || cssValue.trigger != token) && cssValue.trigger != cssValue.value && !parentClass.spaceChar.test(cssValue.trigger)) {
                                cssValue.cursor--;	// Trigger will have to be tested as a value next time
                            }

                            if (token) {
                                if (cssValue.trigger != token) {
                                    break;
                                }
                                else if (count == max && stringObjt.list[stringObjt.index]) {
                                    stringObjt.list[stringObjt.index].cursor--;
                                    break;
                                }
                                else {
                                    tokenNeedValue = true;
                                }
                            }
                        }
                    }
                    else {
                        if (tokenNeedValue && stringObjt.list[stringObjt.index - 1]) {
                            stringObjt.list = stringObjt.list.slice(0, stringObjt.index);
                        }

                        if (proposalEnable && !stringObjt.endWithSpace) {
                            const proposal = this.proposal(cssValue.value, stringObjt.proposal, stringObjt);

                            if (proposal) {
                                if (stringObjt.proposal.valueFound) {
                                    stringObjt.proposal.length = 0;
                                    stringObjt.proposal.valueFound = false;
                                }

                                if (!proposalFct) {
                                    stringObjt.proposal[stringObjt.proposal.length] = proposal;
                                }

                                stringObjt.proposal.segmentFound = true;
                            }
                        }

                        break;
                    }
                }

                if (tokenNeedValue) {
                    stringObjt.list[stringObjt.index - 1].cursor--;
                }

                if (proposalEnable && count < max && !stringObjt.proposal.segmentFound) {
                    if (tokenNeedValue) {
                        stringObjt.proposal[stringObjt.proposal.length] = value;
                        stringObjt.proposal.valueFound = true;
                    }
                    else if (token && count && count + 1 < max) {
                        stringObjt.proposal[stringObjt.proposal.length] = token;
                    }
                    else if (stringObjt.index >= stringObjt.list.length) {
                        stringObjt.proposal[stringObjt.proposal.length] = value;
                        stringObjt.proposal.valueFound = true;
                    }
                }

                if (valueFound) {
                    stringObjt.value[name] = max == 1 ? valueFound[0] : valueFound;
                }

                if (count >= min) {
                    if (path.length) {
                        stringObjt.index = path[path.length - 1];
                    }

                    return path;
                }
                else {
                    return false;
                }
            },
            proposal: proposalFct || function (str) {
                return (typeof value == "string" && str != value && value.slice(0, str.length) == str) ? value.slice(str.length) : false;
            },
            quantity: quantity,
            value: value
        };
    },

    parseValue: function (stringObjt) {
        const cursor = stringObjt.list[stringObjt.index - 1] ? stringObjt.list[stringObjt.index - 1].cursor : 0,
            buffer = this.parseValueTo(stringObjt.string, cursor);

        if (buffer.value) {
            return stringObjt.list[stringObjt.index] = buffer;	// (null)++ = 0, storing extracted value in array list
        }
        else {
            return null;
        }
    },

    parseValueTo: function (str, begin) {	// Delimiter = { "(" : true }
        let buffer = "",
            trigger = null,
            spaceSpecial = false;
        const length = str.length;

        for (; this.spaceChar.test(str[begin]); begin++);	// Ignoring space char

        B: for (let actChar; (actChar = str[begin]); begin++) {
            if (this.stringify[actChar]) {
                const close = this.stringify[actChar];

                for (buffer += str[begin++]; begin < length; begin++) {
                    buffer += str[begin];

                    if (str[begin] == close) {
                        if (str[begin - 1] != this.escapeChar) {
                            break;
                        }
                    }
                }

                continue;
            }
            else if (this.ignoreFirst[actChar]) {
                I: for (let ignoreLength = this.ignoreLength; ignoreLength; ignoreLength--) {
                    let ignoreStr = actChar,
                        i = 1;

                    for (; i < ignoreLength; i++) {
                        ignoreStr += str[begin + i];
                    }

                    if (this.ignore[ignoreStr]) {
                        IgnoreEnd: for (begin += i; begin < length; begin++) {
                            if (this.ignoreEndFirst[str[begin]]) {
                                for (let ignoreEndLength = this.ignoreEndLength; ignoreEndLength; ignoreEndLength--) {
                                    let ignoreEndStr = str[begin],
                                        y = 1;

                                    for (; y < ignoreEndLength; y++) {
                                        ignoreEndStr += str[begin + y];
                                    }

                                    if (ignoreEndStr == this.ignore[ignoreStr]) {
                                        begin += y;

                                        break IgnoreEnd;
                                    }
                                }
                            }
                        }

                        if (buffer) {
                            trigger = this.combinatorDefault;	// Ignore string are considered as space trigger
                            break B;
                        }

                        continue B;
                    }
                }
            }

            if (!spaceSpecial && this.spaceChar.test(actChar)) {
                while (this.spaceChar.test(str[++begin]));

                if (!this.trigger[str[begin--]]) {
                    spaceSpecial = true;
                    begin--;
                }

                continue;
            }
            else if (this.trigger[actChar]) {
                if (!buffer) {
                    buffer = actChar;

                    if (begin + 1 < length) {
                        trigger = actChar;
                    }
                }
                else {
                    trigger = actChar;
                }

                begin++;

                break;
            }

            buffer += actChar;
            spaceSpecial = false;
        }

        return {
            value: buffer,
            trigger: trigger && begin == length && this.spaceChar.test(trigger) ? null : trigger,	// Returning null if last trigger found in string is a space char or if end of string found (trigger default value = null)
            cursor: begin
        };
    },

    spaceChar: /\s/,	// Space char can be space, tab or new line
    escapeChar: "\\",
    trigger: {
        "(": true,
        ")": true,
        ",": true,
        "/": true,
        " ": true,
        "	": true,
        "\n": true
    },
    stringify: {
        "'": "'",
        '"': '"'
    },
    ignore: {	// Ignored strings are considered as spaceChar
        "/*": "*/"
    },
    ignoreFirst: {
        "/": true
    },
    ignoreEndFirst: {
        "*": true
    },
    ignoreLength: 2,
    ignoreEndLength: 2,

    copyStringObjt: function (stringObjt, index = null) {
        return {
            string: stringObjt.string,
            endWithSpace: stringObjt.endWithSpace,
            list: [].concat(stringObjt.list),
            index: index !== null ? index : stringObjt.index,
            proposal: stringObjt.proposal,
            value: {}
        };
    },

    combinator: {
        // " " => Juxtaposing components means that all of them must occur, in the given order
        " ": {
            name: " ",
            priority: 4,
            process: function (stringObjt, action, parentClass, proposalEnable, i = 0) {
                let finalPath = false;

                for (let as = action.as, asLength = as.length; i < asLength; i++) {
                    const stringObjtProcess = parentClass.copyStringObjt(stringObjt),
                        path = as[i].process(stringObjtProcess, as[i], parentClass, proposalEnable);

                    stringObjt.value = Object.assign({}, stringObjtProcess.value, stringObjt.value);

                    if (path !== false) {
                        if (path.length > 0) {
                            finalPath = path;

                            if (proposalEnable && stringObjtProcess.list[stringObjtProcess.list.length - 1] && stringObjtProcess.list[stringObjtProcess.list.length - 1].trigger) {
                                stringObjt.proposal.length = 0;
                            }

                            if (i + 1 < asLength) {
                                for (let y = 0, pathLength = path.length; y < pathLength; y++) {
                                    const stringObjtSub = parentClass.copyStringObjt(stringObjtProcess, path[y]),
                                        process = parentClass.combinator[" "].process(stringObjtSub, action, parentClass, proposalEnable, i + 1);

                                    if (process && stringObjtSub.index == stringObjtSub.list.length && stringObjtSub.list.length && !stringObjtSub.list[stringObjtSub.list.length - 1].trigger) {
                                        stringObjt.index = stringObjtSub.index;
                                        stringObjt.list = stringObjtSub.list;
                                        stringObjt.value = Object.assign({}, stringObjtSub.value, stringObjt.value);

                                        return process;
                                    }
                                }
                            }

                            stringObjt.index = stringObjtProcess.index;
                            stringObjt.list = stringObjtProcess.list;
                        }
                    }
                    else {
                        if (!finalPath && !stringObjt.segmentFound && !stringObjt.proposal.length && stringObjtProcess.index >= stringObjtProcess.list.length) {
                            stringObjt.proposal[stringObjt.proposal.length] = as[i].value;
                        }

                        return false;
                    }
                }

                return finalPath;
            }
        },

        // && => Separates two or more components, all of which must occur, in any order
        "&&": {
            name: "&&",
            priority: 3,
            process: function (stringObjt, action, parentClass, proposalEnable, ignore = null, cantFound = {}) {
                let finalPath = null;

                for (let i = 0, as = action.as, asLength = as.length; i < asLength; i++) {
                    if (!cantFound[i]) {
                        const stringObjtProcess = parentClass.copyStringObjt(stringObjt),
                            path = as[i].process(stringObjtProcess, as[i], parentClass, proposalEnable);

                        if (path !== false) {
                            if (path.length > 0) {
                                const cantFoundRec = Object.assign({ [i]: path }, cantFound);

                                if (Object.keys(cantFoundRec).length < asLength) {
                                    for (let y = 0, pathLength = path.length; y < pathLength; y++) {
                                        if (path[y] != stringObjt.index) {
                                            const stringObjtSub = parentClass.copyStringObjt(stringObjtProcess, path[y]),
                                                process = parentClass.combinator["&&"].process(stringObjtSub, action, parentClass, proposalEnable, null, cantFoundRec);

                                            if (process && (!finalPath || stringObjtSub.list.length > finalPath.list.length || stringObjtSub.index > finalPath.index)) {
                                                stringObjt.value = Object.assign({}, stringObjtProcess.value, stringObjtSub.value);

                                                finalPath = stringObjtSub;
                                                finalPath.path = process;
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (!finalPath || stringObjtProcess.list.length > finalPath.list.length || stringObjtProcess.index > finalPath.index) {
                                        stringObjt.value = Object.assign({}, stringObjt.value, stringObjtProcess.value);

                                        finalPath = stringObjtProcess;
                                        finalPath.path = path;
                                    }
                                }
                            }
                        }
                        else if (!finalPath && !stringObjtProcess.segmentFound && stringObjtProcess.index >= stringObjtProcess.list.length) {
                            stringObjt.proposal[stringObjt.proposal.length] = as[i].value;
                        }
                    }
                }

                if (finalPath && finalPath.list.length) {
                    stringObjt.index = finalPath.index;
                    stringObjt.list = finalPath.list;

                    return finalPath.path;
                }
                else {
                    return false;
                }
            }
        },

        // || => Separates two or more options: one or more of them must occur, in any order
        "||": {
            name: "||",
            priority: 2,
            process: function (stringObjt, action, parentClass, proposalEnable, ignore = null, cantFound = {}) {
                let finalPath = null;

                for (let i = 0, as = action.as, asLength = as.length; i < asLength; i++) {
                    if (!cantFound[i]) {
                        const stringObjtProcess = parentClass.copyStringObjt(stringObjt),
                            path = as[i].process(stringObjtProcess, as[i], parentClass, proposalEnable);

                        if (path !== false) {
                            if (path.length > 0) {
                                if (!finalPath || stringObjtProcess.list.length > finalPath.list.length || stringObjtProcess.index > finalPath.index) {
                                    stringObjt.value = Object.assign({}, stringObjt.value, stringObjtProcess.value);

                                    finalPath = stringObjtProcess;
                                    finalPath.path = path;
                                }

                                const cantFoundRec = Object.assign({ [i]: path }, cantFound);

                                if (Object.keys(cantFoundRec).length < asLength) {
                                    for (let y = 0, pathLength = path.length; y < pathLength; y++) {
                                        if (path[y] != stringObjt.index) {
                                            const stringObjtSub = parentClass.copyStringObjt(stringObjtProcess, path[y]),
                                                process = parentClass.combinator["||"].process(stringObjtSub, action, parentClass, proposalEnable, null, cantFoundRec);

                                            if (process && (!finalPath || stringObjtSub.list.length > finalPath.list.length || stringObjtSub.index > finalPath.index)) {
                                                stringObjt.value = Object.assign({}, stringObjtProcess.value, stringObjtSub.value);

                                                finalPath = stringObjtSub;
                                                finalPath.path = process;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (!finalPath && !stringObjtProcess.segmentFound && stringObjtProcess.index >= stringObjtProcess.list.length) {
                            stringObjt.proposal[stringObjt.proposal.length] = as[i].value;
                        }
                    }
                }

                if (finalPath && finalPath.list.length) {
                    stringObjt.index = finalPath.index;
                    stringObjt.list = finalPath.list;

                    return finalPath.path;
                }
                else {
                    return false;
                }
            }
        },

        // "|" => Separates two or more alternatives: exactly one of them must occur
        "|": {
            name: "|",
            priority: 1,
            process: function (stringObjt, action, parentClass, proposalEnable) {
                let finalPath = false;
                for (let i = 0, as = action.as, asLength = as.length; i < asLength; i++) {
                    const stringObjtProcess = parentClass.copyStringObjt(stringObjt, null),
                        process = as[i].process(stringObjtProcess, as[i], parentClass, !finalPath);

                    if (process && (!finalPath || stringObjtProcess.list.length > finalPath.list.length || stringObjtProcess.index > finalPath.index)) {
                        //	stringObjt.value = Object.assign({}, stringObjtProcess.value, stringObjt.value);
                        stringObjt.value = stringObjtProcess.value;

                        finalPath = stringObjtProcess;
                        finalPath.path = process;
                    }
                    else if (!finalPath && !stringObjtProcess.segmentFound && stringObjtProcess.index >= stringObjtProcess.list.length) {
                        stringObjt.proposal[stringObjt.proposal.length] = as[i].value;
                    }
                }

                if (finalPath) {
                    stringObjt.index = finalPath.index;
                    stringObjt.list = finalPath.list;

                    return finalPath.path;
                }
                else {
                    return false;
                }
            }
        },

        "[": {
            name: "[",
            priority: 0,
            parseSyntax: function (syntaxObjt, syntaxStringObjt) {
                syntaxObjt.cursor++;

                for (let count = 1, length = syntaxObjt.syntax.length, actChar; (actChar = syntaxObjt.syntax[syntaxObjt.cursor]); syntaxObjt.cursor++) {
                    if (actChar == "]") {
                        count--;

                        if (!count) {
                            if (syntaxObjt.syntax[syntaxObjt.cursor + 1] == "!") {
                                // If "!", in all case, group has to return true minimum 1 time (as default quantity => [1, 1])
                                syntaxObjt.cursor++;
                                syntaxStringObjt.isRequired = true;
                            }

                            return;
                        }
                    }
                    else if (actChar == "[") {
                        count++;	// Count is used to count how many subgroup is found in current group: "[a [b c [d]]]"
                    }

                    syntaxStringObjt.value += actChar;
                }

                throw new Error("Malformed syntax. Missing closing group char.");
            },
            prepare: function (syntaxObjt, buffer, action, parentClass) {
                action.as[0] = parentClass.parseSyntax(buffer.value);
                action.returnNoVal = this.lookForQuantity(action.as);
                action.isRequired = buffer.isRequired && action.returnNoVal;
                action.quantity = buffer.quantity;
            },
            lookForQuantity: function (as) {
                for (let i = 0, length = as.length; i < length; i++) {
                    if ((typeof as[i].quantity != "undefined" && as[i].quantity[0] > 0) || (as[i].as && !this.lookForQuantity(as[i].as))) {
                        return false;
                    }
                }

                return true;
            },
            process: function (stringObjt, action, parentClass, proposalEnable) {
                const min = action.quantity[0],
                    max = action.quantity[1],
                    token = action.quantity[2],
                    valueSave = stringObjt.value,
                    indexSave = stringObjt.index,
                    valueFound = [];
                let finalPath = [],
                    count = 0,
                    tokenNeedValue = false;

                while (count < max) {
                    stringObjt.value = {};

                    const process = action.as[0].process(stringObjt, action.as[0], parentClass, proposalEnable);

                    if (process) {
                        valueFound[valueFound.length] = stringObjt.value;
                        tokenNeedValue = false;

                        const lastValue = stringObjt.list[stringObjt.list.length - 1];

                        if (token && lastValue.trigger && lastValue.trigger == token) {
                            lastValue.cursor += 2;
                            tokenNeedValue = true;
                        }

                        count++;

                        if (!tokenNeedValue && count >= min) {
                            finalPath = process;
                        }

                        if (token && lastValue.trigger && lastValue.trigger != token) {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }

                if ((count >= min || action.returnNoVal) && (!action.isRequired || stringObjt.index > indexSave)) {
                    if (finalPath.length) {
                        stringObjt.index = finalPath[finalPath.length - 1];
                    }

                    if (valueFound.length) {
                        let i = 0;
                        for (; valueSave["group" + i]; i++);

                        valueSave["group" + i] = max == 1 ? valueFound[0] : valueFound;
                    }

                    stringObjt.value = valueSave;

                    return finalPath;
                }
                else {
                    return false;
                }
            }
        },

        "<": {
            name: "<",
            priority: 0,
            parseSyntax: function (syntaxObjt, syntaxStringObjt) {
                syntaxObjt.cursor++;

                for (const length = syntaxObjt.syntax.length; syntaxObjt.cursor < length && syntaxObjt.syntax[syntaxObjt.cursor] != ">"; syntaxObjt.cursor++) {
                    syntaxStringObjt.value += syntaxObjt.syntax[syntaxObjt.cursor];
                }

                if (syntaxStringObjt.value) {
                    const match = syntaxStringObjt.value.match(/^(?:(?:'([a-z0-9-\(\)]*)')|([a-z0-9-\(\)]*))(?:\[\s*([\+-]?(?:(?:[0-9]+|(?:[0-9]*\.[0-9]+))|∞))\s*,\s*([\+-]?(?:(?:[0-9]+|(?:[0-9]*\.[0-9]+))|∞))\s*\])?/i);

                    if (match[0] && match[0] == syntaxStringObjt.value) {
                        if (match[3]) {
                            syntaxStringObjt.range = [];

                            for (let i = 0, index = 3, rangeValue; i < 2 && (rangeValue = match[index]); i++, index++) {
                                if (!Number.isNaN(rangeValue * 1)) {
                                    syntaxStringObjt.range[i] = rangeValue * 1;
                                }
                                else if (rangeValue == "-∞") {
                                    syntaxStringObjt.range[i] = -Infinity;
                                }
                                else { // "∞" || "+∞"
                                    syntaxStringObjt.range[i] = Infinity;
                                }
                            }
                        }
                        else {
                            syntaxStringObjt.range = false;
                        }

                        if (match[1]) {
                            syntaxStringObjt.dataType = false;
                            syntaxStringObjt.value = match[1];
                        }
                        else {
                            syntaxStringObjt.dataType = true;
                            syntaxStringObjt.value = match[2];
                        }

                        return;
                    }
                }

                throw new Error('Malformed syntax: missing char ">" or malformed bracket range notation. Syntax: "' + syntaxObjt.syntax + '".');
            },
            prepare: function (syntaxObjt, buffer, action, parentClass) {
                let target = buffer.dataType ? parentClass.basicDataType[buffer.value] : parentClass.property[buffer.value]; // Looking for this value in basic data type or dictionnary

                if (target) {
                    action.quantity = buffer.quantity;
                    action.range = buffer.range;
                    action.name = buffer.name;

                    let result = false;

                    if (typeof target == "string") {
                        result = action.as[0] = parentClass.parseSyntax(target);
                    }
                    else if (target instanceof RegExp) {
                        result = action.as[0] = parentClass.createComponentChecker(target, [1, 1], buffer.name, str => target.test(str));
                    }
                    else if (target.regexp) {
                        result = action.as[0] = parentClass.createComponentChecker(target.defaultValue, [1, 1], buffer.name, str => target.regexp.test(str), target.proposal);
                    }
                    else {
                        action.as[0] = target;
                    }

                    if (result) {
                        if (buffer.dataType) {
                            parentClass.basicDataType[buffer.value] = result;
                        }
                        else {
                            parentClass.property[buffer.value] = result;
                        }
                    }
                }
                else {
                    throw new Error("Undefined import '" + buffer.value + "'.");
                }
            },
            process: function (stringObjt, action, parentClass, proposalEnable) {
                const min = action.quantity[0],
                    max = action.quantity[1],
                    token = action.quantity[2],
                    valueSave = stringObjt.value,
                    valueFound = [],
                    path = [];
                let count = 0,
                    tokenNeedValue = false;

                while (count < max) {
                    stringObjt.value = {};

                    let process = action.as[0].process(stringObjt, action.as[0], parentClass, proposalEnable);

                    if (process && action.range) {
                        const convert = stringObjt.list[stringObjt.list.length - 1].value * 1;

                        process = convert >= action.range[0] && convert <= action.range[1];
                    }

                    if (process) {
                        valueFound[valueFound.length] = stringObjt.value;

                        const lastValue = stringObjt.list[stringObjt.list.length - 1];

                        tokenNeedValue = token && lastValue.trigger && lastValue.trigger == token;
                        count++;

                        if (count >= min) {
                            path[path.length] = stringObjt.index;
                        }

                        if (lastValue.trigger) {
                            if (token) {
                                if (lastValue.trigger != token) {
                                    break;
                                }
                                else if (count == max && stringObjt.list[stringObjt.index]) {
                                    stringObjt.list[stringObjt.index].cursor--;
                                    break;
                                }
                                else {
                                    lastValue.cursor++;
                                    tokenNeedValue = true;
                                }
                            }
                        }
                    }
                    else {
                        if (tokenNeedValue && stringObjt.list[stringObjt.index - 1]) {
                            stringObjt.list = stringObjt.list.slice(0, stringObjt.index);
                        }

                        break;
                    }
                }

                if (tokenNeedValue) {
                    stringObjt.list[stringObjt.index - 1].cursor--;
                }

                if (count >= min) {
                    if (path.length) {
                        stringObjt.index = path[path.length - 1];
                    }

                    if (valueFound.length) {
                        /*let i = 0;
                        for(; valueSave["property" + i]; i++);*/

                        //	valueSave["property" + i] = valueFound;
                        valueSave[action.name] = max == 1 ? valueFound[0] : valueFound;
                    }

                    stringObjt.value = valueSave;

                    return path;
                }
                else {
                    return false;
                }
            }
        }
    },

    combinatorDefault: " ",
    combinatorLength: 2,
    combinatorFirst: {
        " ": true,
        "&": true,
        "|": true,
        "[": true,
        "<": true
    },

    multiplier: {
        // "*", "+", "#" => "UAs must support at least 20 repetitions"
        "*": function (syntaxObjt, syntaxStringObjt) {
            syntaxStringObjt.quantity = [0, 20];
        },
        "+": function (syntaxObjt, syntaxStringObjt) {
            syntaxStringObjt.quantity = [1, 20];
        },
        "?": function (syntaxObjt, syntaxStringObjt) {
            syntaxStringObjt.quantity = [0, 1];
        },
        "{": function (syntaxObjt, syntaxStringObjt, parentClass) {
            syntaxObjt.cursor++;	// Ignore char "{"

            for (let buffer = "", actChar; (actChar = syntaxObjt.syntax[syntaxObjt.cursor]); syntaxObjt.cursor++) {
                if (actChar == "}") {
                    syntaxStringObjt.multiplier = "{" + buffer + "}";

                    const split = buffer.split(",");	// Add match support of ∞

                    return syntaxStringObjt.quantity = [
                        split[0] * 1,
                        split[1] ? split[1] * 1 : (split.length == 2 ? Infinity : split[0] * 1)
                    ];
                }
                else if (!parentClass.spaceChar.test(actChar)) {
                    buffer += actChar;
                }
            }

            throw new Error("Malformed multiplier {}.");
        },
        "#": function (syntaxObjt, syntaxStringObjt, parentClass) {	// a#{2,} is writtable, repetition with comma separated value
            const nextChar = syntaxObjt.syntax[syntaxObjt.cursor + 1];

            if (nextChar != "#" && parentClass.multiplier[nextChar]) {
                syntaxObjt.cursor++;
                parentClass.multiplier[nextChar](syntaxObjt, syntaxStringObjt, parentClass);

                syntaxStringObjt.multiplier = "#" + syntaxStringObjt.multiplier;
                syntaxStringObjt.quantity[2] = ",";
            }
            else {
                syntaxStringObjt.quantity = [1, 20, ","];
            }
        }
    },
    quantityDefault: [1, 1],

    basicDataType: null,
    setBasicDataType: function (dataType) {
        this.basicDataType = dataType;

        return this;
    },
    addBasicDataType: function (name, rule) {
        this.basicDataType[name] = rule;

        return this;
    },
    deleteBasicDataType: function (name) {
        delete this.basicDataType[name];

        return this;
    },

    property: null,
    propertyCommon: " | inherit | initial | unset",
    setProperty: function (property) {
        this.property = property;

        return this;
    },
    addProperty: function (name, rule) {
        this.property[name] = rule;

        return this;
    },
    deleteProperty: function (name) {
        delete this.property[name];

        return this;
    }
};