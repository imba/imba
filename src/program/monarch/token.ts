/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IState } from './types';

export class Token {
	_tokenBrand: void;

	public readonly offset: number;
	public readonly type: string;
	public readonly language: string;
	public value: string | null;
	public scope: any;
	public stack: any;
	public mods: number;

	constructor(offset: number, type: string, language: string) {
		this.offset = offset | 0;// @perf
		this.type = type;
		this.language = language;
		this.mods = 0;
		this.value = null;
		this.stack = null;
	}

	public toString(): string {
		return this.value || '';
	}

	public get span(): object {
		return {offset: this.offset, length: (this.value ? this.value.length : 0)}
	}

	public get indent(): number {
		return 0;
	}

	public match(val: any): boolean {
        if(typeof val == 'string'){
            if(val.indexOf(' ') > 0){
                val = val.split(' ');
            } else {
				let idx = this.type.indexOf(val);
				return (val[0] == '.') ? idx >= 0 : idx == 0;
            }
        }
        if(val instanceof Array){
            for(let item of val){
				let idx = this.type.indexOf(item);
				let hit = (item[0] == '.') ? idx >= 0 : idx == 0;
				if(hit) return true;
            }
        }
        if(val instanceof RegExp){
            return val.test(this.type);
        }
        return false;
    }
}

export class TokenizationResult {
	_tokenizationResultBrand: void;

	public readonly tokens: Token[];
	public readonly endState: IState;

	constructor(tokens: Token[], endState: IState) {
		this.tokens = tokens;
		this.endState = endState;
	}
}