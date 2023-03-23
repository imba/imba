/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Create a syntax highighter with a fully declarative JSON style lexer description
 * using regular expressions.
 */

import { Token, TokenizationResult } from './token';
import { IState } from './types';
import * as monarchCommon from './common';

export interface ITokenizationSupport {

	getInitialState(): IState;

	// add offsetDelta to each of the returned indices
	tokenize(line: string, state: IState, offsetDelta: number): TokenizationResult;
}

const CACHE_STACK_DEPTH = 10;

function statePart(state: string, index: number): string {
	return state.split('.')[index];
}

/**
 * Reuse the same stack elements up to a certain depth.
 */
class MonarchStackElementFactory {

	private static readonly _INSTANCE = new MonarchStackElementFactory(CACHE_STACK_DEPTH);
	public static create(parent: MonarchStackElement | null, state: string): MonarchStackElement {
		return this._INSTANCE.create(parent, state);
	}

	private readonly _maxCacheDepth: number;
	private readonly _entries: { [stackElementId: string]: MonarchStackElement; };

	constructor(maxCacheDepth: number) {
		this._maxCacheDepth = maxCacheDepth;
		this._entries = Object.create(null);
	}

	public create(parent: MonarchStackElement | null, state: string): MonarchStackElement {
		if (parent !== null && parent.depth >= this._maxCacheDepth) {
			// no caching above a certain depth
			return new MonarchStackElement(parent, state);
		}
		let stackElementId = MonarchStackElement.getStackElementId(parent);
		if (stackElementId.length > 0) {
			stackElementId += '|';
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
}

class MonarchStackElement {

	public readonly parent: MonarchStackElement | null;
	public readonly state: string;
	public readonly depth: number;

	constructor(parent: MonarchStackElement | null, state: string) {
		this.parent = parent;
		this.state = state;
		this.depth = (this.parent ? this.parent.depth : 0) + 1;
	}

	public static getStackElementId(element: MonarchStackElement | null): string {
		let result = '';
		while (element !== null) {
			if (result.length > 0) {
				result += '|';
			}
			result += element.state;
			element = element.parent;
		}
		return result;
	}

	private static _equals(a: MonarchStackElement | null, b: MonarchStackElement | null): boolean {
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

	public get indent(): number {
		return this.state.lastIndexOf('\t') - this.state.indexOf('\t');
	}

	public get scope(): string {
		return this.part(2);
	}

	public get detail(): string {
		return this.part(2);
	}

	public part(index: number): string {
		return this.state.split('.')[index]
	}

	public equals(other: MonarchStackElement): boolean {
		return MonarchStackElement._equals(this, other);
	}

	public push(state: string): MonarchStackElement {
		return MonarchStackElementFactory.create(this, state);
	}

	public pop(): MonarchStackElement | null {
		return this.parent;
	}

	public popall(): MonarchStackElement {
		let result: MonarchStackElement = this;
		while (result.parent) {
			result = result.parent;
		}
		return result;
	}

	public switchTo(state: string): MonarchStackElement {
		return MonarchStackElementFactory.create(this.parent, state);
	}
}

/**
 * Reuse the same line states up to a certain depth.
 */
class MonarchLineStateFactory {

	private static readonly _INSTANCE = new MonarchLineStateFactory(CACHE_STACK_DEPTH);
	public static create(stack: MonarchStackElement): MonarchLineState {
		return this._INSTANCE.create(stack);
	}

	private readonly _maxCacheDepth: number;
	private readonly _entries: { [stackElementId: string]: MonarchLineState; };

	constructor(maxCacheDepth: number) {
		this._maxCacheDepth = maxCacheDepth;
		this._entries = Object.create(null);
	}

	public create(stack: MonarchStackElement): MonarchLineState {
		if (stack !== null && stack.depth >= this._maxCacheDepth) {
			// no caching above a certain depth
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
}

class MonarchLineState implements IState {

	public readonly stack: MonarchStackElement;

	constructor(
		stack: MonarchStackElement
	) {
		this.stack = stack;
	}

	public clone(): IState {
		return MonarchLineStateFactory.create(this.stack);
	}

	public equals(other: IState): boolean {
		if (!(other instanceof MonarchLineState)) {
			return false;
		}
		if (!this.stack.equals(other.stack)) {
			return false;
		}
		return true;
	}
}

interface IMonarchTokensCollector {
	enterMode(startOffset: number, modeId: string): void;
	emit(startOffset: number, type: string, stack?: MonarchStackElement): Token;
}

class MonarchClassicTokensCollector implements IMonarchTokensCollector {

	private _tokens: Token[];
	private _language: string | null;
	private _lastTokenType: string | null;
	private _lastToken: Token;

	constructor() {
		this._tokens = [];
		this._language = null;
		this._lastToken = new Token(0, 'start', 'imba');
		this._lastTokenType = null;
	}

	public enterMode(startOffset: number, modeId: string): void {
		this._language = modeId;
	}

	public emit(startOffset: number, type: string, stack?: MonarchStackElement): Token {
		if (this._lastTokenType === type && false) {
			console.log('add to last token', type);
			return this._lastToken;
		}

		let token = new Token(startOffset, type, this._language!);
		this._lastTokenType = type;
		this._lastToken = token;
		this._tokens.push(token);
		return token;
	}

	public finalize(endState: MonarchLineState): TokenizationResult {
		return new TokenizationResult(this._tokens, endState);
	}
}

export type ILoadStatus = { loaded: true; } | { loaded: false; promise: Promise<void>; };

export class MonarchTokenizer implements ITokenizationSupport {

	private readonly _modeId: string;
	private readonly _lexer: monarchCommon.ILexer;
	public _profile: boolean;

	constructor(modeId: string, lexer: monarchCommon.ILexer) {
		this._modeId = modeId;
		this._lexer = lexer;
		this._profile = false;
	}

	public dispose(): void {

	}

	public getLoadStatus(): ILoadStatus {
		return { loaded: true };
	}

	public getInitialState(): IState {
		let rootState = MonarchStackElementFactory.create(null, this._lexer.start!);
		return MonarchLineStateFactory.create(rootState);
	}

	public tokenize(line: string, lineState: IState, offsetDelta: number): TokenizationResult {
		let tokensCollector = new MonarchClassicTokensCollector();
		let endLineState = this._tokenize(line, <MonarchLineState>lineState, offsetDelta, tokensCollector);
		return tokensCollector.finalize(endLineState);
	}

	private _tokenize(line: string, lineState: MonarchLineState, offsetDelta: number, collector: IMonarchTokensCollector): MonarchLineState {
		return this._myTokenize(line, lineState, offsetDelta, collector);
	}

	private _safeRuleName(rule: monarchCommon.IRule | null): string {
		if (rule) {
			return rule.name;
		}
		return '(unknown)';
	}

	private _rescope(from: string, to: string, tokens: string[], toState: string): void {
		let a = (from || '').split('-'); // if-body
		let b = (to || '').split('-'); // if

		if (from == to) return;

		let diff = 1;
		// find out their common base
		while (a[diff] && a[diff] == b[diff]) {
			diff++
		}
		// console.log(`rescope ${from} -> ${to}`,a.length,b.length,diff);

		let level = a.length;

		while (level > diff) {
			// console.log('popping',a[a.length - 1]);
			tokens.push('pop.' + a[--level] + '.' + level);
		}
		while (b.length > diff) {
			// console.log('pushing',b[diff]);
			let id = 'push.' + b[diff++] + '.' + (diff - 1);
			if (toState) {
				let indent = statePart(toState, 1);
				id += '.' + indent;
			}
			tokens.push(id);
		}
	}

	private _myTokenize(line: string, lineState: MonarchLineState, offsetDelta: number, tokensCollector: IMonarchTokensCollector): MonarchLineState {
		tokensCollector.enterMode(offsetDelta, this._modeId);

		const lineLength = line.length;

		let stack = lineState.stack;
		let lastToken: any = null;
		let pos = 0;
		let profile = this._profile;

		// regular expression group matching
		// these never need cloning or equality since they are only used within a line match
		interface GroupMatching {
			matches: string[];
			rule: monarchCommon.IRule | null;
			groups: { action: monarchCommon.FuzzyAction; matched: string; }[];
		}
		let groupMatching: GroupMatching | null = null;

		// See https://github.com/Microsoft/monaco-editor/issues/1235:
		// Evaluate rules at least once for an empty line
		let forceEvaluation = true;
		let append: string[] = [];
		let tries = 0;
		let rules: monarchCommon.IRule[] | null = [];
		let rulesState = null;
		let hangPos = -1;

		while (forceEvaluation || pos < lineLength) {
			tries++;

			if (tries > 1000) {

				if (pos == hangPos) {
					console.log('infinite recursion', pos, lineLength, stack, tokensCollector);
					throw 'infinite recursion in tokenizer?';
				} else {
					hangPos = pos;
					tries = 0;
				}

			}

			const pos0 = pos;
			const stackLen0 = stack.depth;
			const groupLen0 = groupMatching ? groupMatching.groups.length : 0;
			const state = stack.state;

			let matches: string[] | null = null;
			let matched: string | null = null;
			let action: monarchCommon.FuzzyAction | monarchCommon.FuzzyAction[] | null = null;
			let rule: monarchCommon.IRule | null = null;

			// check if we need to process group matches first
			if (groupMatching) {
				matches = groupMatching.matches;
				const groupEntry = groupMatching.groups.shift()!;
				matched = groupEntry.matched;
				action = groupEntry.action;
				rule = groupMatching.rule;

				// cleanup if necessary
				if (groupMatching.groups.length === 0) {
					groupMatching = null;
				}
			} else {
				// otherwise we match on the token stream

				if (!forceEvaluation && pos >= lineLength) {
					// nothing to do
					break;
				}

				forceEvaluation = false;

				// if(state !== rulesState){
				// get the rules for this state
				rules = this._lexer.tokenizer[state];
				if (!rules) {
					rules = monarchCommon.findRules(this._lexer, state); // do parent matching
					if (!rules) {
						throw monarchCommon.createError(this._lexer, 'tokenizer state is not defined: ' + state);
					}
				}
				// }

				// try each rule until we match
				let restOfLine = line.substr(pos);
				for (const rule of rules) {
					if (rule.string !== undefined) {
						if (restOfLine[0] === rule.string) {
							matches = [rule.string];
							matched = rule.string;
							action = rule.action;
							break;
						}
					}
					else if (pos === 0 || !rule.matchOnlyAtLineStart) {
						if (profile) {
							rule.stats.count++;
							let now = performance.now();
							matches = restOfLine.match(rule.regex);
							rule.stats.time += (performance.now() - now);
							if (matches) {
								rule.stats.hits++;
							}
						} else {
							matches = restOfLine.match(rule.regex);
						}
						if (matches) {
							matched = matches[0];
							action = rule.action;
							break;
						}
					}
				}
			}

			// We matched 'rule' with 'matches' and 'action'
			if (!matches) {
				matches = [''];
				matched = '';
			}

			if (!action) {
				// bad: we didn't match anything, and there is no action to take
				// we need to advance the stream or we get progress trouble
				if (pos < lineLength) {
					matches = [line.charAt(pos)];
					matched = matches[0];
				}
				action = this._lexer.defaultToken;
			}

			if (matched === null) {
				// should never happen, needed for strict null checking
				break;
			}

			// advance stream
			pos += matched.length;

			// maybe call action function (used for 'cases')
			while (monarchCommon.isFuzzyAction(action) && monarchCommon.isIAction(action) && action.test) {
				action = action.test(matched, matches, state, pos === lineLength);
			}

			let result: monarchCommon.FuzzyAction | monarchCommon.FuzzyAction[] | null = null;
			// set the result: either a string or an array of actions
			if (typeof action === 'string' || Array.isArray(action)) {
				result = action;
			} else if (action.group) {
				result = action.group;
			} else if (action.token !== null && action.token !== undefined) {

				// do $n replacements?
				if (action.tokenSubst) {
					result = monarchCommon.substituteMatches(this._lexer, action.token, matched, matches, state);
				} else {
					result = action.token;
				}

				// state transformations
				if (action.goBack) { // back up the stream..
					pos = Math.max(0, pos - action.goBack);
				}

				if (action.switchTo && typeof action.switchTo === 'string') {
					// let indenting = action.switchTo.indexOf('\t') > 0;
					// if(indenting) tokensCollector.emit(pos0 + offsetDelta, 'push', stack);

					// can do a quick check just for the action?

					let nextState = monarchCommon.substituteMatches(this._lexer, action.switchTo, matched, matches, state);  // switch state without a push...
					if (nextState[0] === '@') {
						nextState = nextState.substr(1); // peel off starting '@'
					}

					if (!monarchCommon.findRules(this._lexer, nextState)) {
						throw monarchCommon.createError(this._lexer, 'trying to switch to a state \'' + nextState + '\' that is undefined in rule: ' + this._safeRuleName(rule));
					} else {
						let from = stack.scope;
						let to = statePart(nextState, 2);
						if (from !== to) this._rescope(from, to, append, nextState);
						stack = stack.switchTo(nextState);
					}
				} else if (action.transform && typeof action.transform === 'function') {
					throw monarchCommon.createError(this._lexer, 'action.transform not supported');
				} else if (action.next) {
					if (action.next === '@push') {
						if (stack.depth >= this._lexer.maxStack) {
							throw monarchCommon.createError(this._lexer, 'maximum tokenizer stack size reached: [' +
								stack.state + ',' + stack.parent!.state + ',...]');
						} else {
							stack = stack.push(state);
						}
					} else if (action.next === '@pop') {
						if (stack.depth <= 1) {
							throw monarchCommon.createError(this._lexer, 'trying to pop an empty stack in rule: ' + this._safeRuleName(rule));
						} else {
							let prev = stack;
							stack = stack.pop()!;
							let from = statePart(prev.state, 2)
							let to = statePart(stack.state, 2)
							if (from !== to) this._rescope(from, to, append, stack.state);
						}
					} else if (action.next === '@popall') {
						stack = stack.popall();
					} else {
						// let indenting = action.next.indexOf('\t') > 0;
						// if(indenting) tokensCollector.emit(pos0 + offsetDelta, 'push', stack);
						let nextState = monarchCommon.substituteMatches(this._lexer, action.next, matched, matches, state);

						if (nextState[0] === '@') {
							nextState = nextState.substr(1); // peel off starting '@'
						}

						let nextScope = statePart(nextState, 2);

						if (!monarchCommon.findRules(this._lexer, nextState)) {
							throw monarchCommon.createError(this._lexer, 'trying to set a next state \'' + nextState + '\' that is undefined in rule: ' + this._safeRuleName(rule));
						} else {

							if (nextScope != stack.scope) this._rescope(stack.scope || '', nextScope, append, nextState);
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

			// check result
			if (result === null) {
				throw monarchCommon.createError(this._lexer, 'lexer rule has no well-defined action in rule: ' + this._safeRuleName(rule));
			}

			// is the result a group match?
			if (Array.isArray(result)) {
				if (groupMatching && groupMatching.groups.length > 0) {
					throw monarchCommon.createError(this._lexer, 'groups cannot be nested: ' + this._safeRuleName(rule));
				}
				if (matches.length !== result.length + 1) {
					throw monarchCommon.createError(this._lexer, 'matched number of groups does not match the number of actions in rule: ' + this._safeRuleName(rule));
				}
				let totalLen = 0;
				for (let i = 1; i < matches.length; i++) {
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
				for (let i = 0; i < result.length; i++) {
					groupMatching.groups[i] = {
						action: result[i],
						matched: matches[i + 1]
					};
				}

				pos -= matched.length;
				// call recursively to initiate first result match
				continue;
			} else {
				// regular result

				// check for '@rematch'
				if (result === '@rematch') {
					pos -= matched.length;
					matched = '';  // better set the next state too..
					matches = null;
					result = '';
				}

				// check progress
				if (matched.length === 0) {
					if (lineLength === 0 || stackLen0 !== stack.depth || state !== stack.state || (!groupMatching ? 0 : groupMatching.groups.length) !== groupLen0) {
						if (typeof result == 'string' && result) tokensCollector.emit(pos + offsetDelta, result, stack);
						while (append.length > 0) { tokensCollector.emit(pos + offsetDelta, append.shift() as string, stack); }
						continue;
					} else {
						throw monarchCommon.createError(this._lexer, 'no progress in tokenizer in rule: ' + this._safeRuleName(rule));
					}
				}

				// return the result (and check for brace matching)
				// todo: for efficiency we could pre-sanitize tokenPostfix and substitutions
				let tokenType: string | null = null;
				if (monarchCommon.isString(result) && result.indexOf('@brackets') === 0) {
					let rest = result.substr('@brackets'.length);
					let bracket = findBracket(this._lexer, matched);
					if (!bracket) {
						throw monarchCommon.createError(this._lexer, '@brackets token returned but no bracket defined as: ' + matched);
					}
					tokenType = monarchCommon.sanitize(bracket.token + rest);
				} else {
					let token = (result === '' ? '' : result + this._lexer.tokenPostfix);
					tokenType = monarchCommon.sanitize(token);
				}

				let token = tokensCollector.emit(pos0 + offsetDelta, tokenType, stack);
				token.stack = stack;

				if (lastToken && lastToken != token) {
					lastToken.value = line.slice(lastToken.offset - offsetDelta, pos0);
				}
				lastToken = token;

				while (append.length > 0) { tokensCollector.emit(pos + offsetDelta, append.shift() as string, stack); }
			}
		}

		if (lastToken && !lastToken.value) {
			lastToken.value = line.slice(lastToken.offset - offsetDelta);
		}

		return MonarchLineStateFactory.create(stack);
	}
}

/**
 * Searches for a bracket in the 'brackets' attribute that matches the input.
 */
function findBracket(lexer: monarchCommon.ILexer, matched: string) {
	if (!matched) {
		return null;
	}
	matched = monarchCommon.fixCase(lexer, matched);

	let brackets = lexer.brackets;
	for (const bracket of brackets) {
		if (bracket.open === matched) {
			return { token: bracket.token, bracketType: monarchCommon.MonarchBracket.Open };
		}
		else if (bracket.close === matched) {
			return { token: bracket.token, bracketType: monarchCommon.MonarchBracket.Close };
		}
	}
	return null;
}

export function createTokenizationSupport(modeId: string, lexer: monarchCommon.ILexer): ITokenizationSupport {
	return new MonarchTokenizer(modeId, lexer);
}
