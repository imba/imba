import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { URI } from 'vscode-uri';
import { IMBA_SEMANTIC_LEGEND } from '../src/index';
import { createFixtureLanguageService } from './harness';

// parity: F1 — script.imba getSemanticTokens via the encodedSemanticClassifications
// intercept, now standard LSP semantic tokens from monarch on the root document

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const appImba = path.join(fixtureDir, 'app.imba');

interface DecodedToken {
	line: number;
	character: number;
	length: number;
	type: string;
	text: string;
}

/** decode LSP relative semantic-token data back to absolute tokens */
function decode(data: number[], source: string): DecodedToken[] {
	const lines = source.split('\n');
	const out: DecodedToken[] = [];
	let line = 0;
	let character = 0;
	for (let i = 0; i < data.length; i += 5) {
		line += data[i];
		character = data[i] === 0 ? character + data[i + 1] : data[i + 1];
		const length = data[i + 2];
		out.push({
			line,
			character,
			length,
			type: IMBA_SEMANTIC_LEGEND.tokenTypes[data[i + 3]],
			text: lines[line]?.slice(character, character + length) ?? '',
		});
	}
	return out;
}

describe('M2/F1: semantic tokens from monarch', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('emits identifier tokens with sensible types over an imba component', async () => {
		const result = await ls.getSemanticTokens(URI.file(appImba), undefined, IMBA_SEMANTIC_LEGEND);
		expect(result?.data?.length ?? 0).toBeGreaterThan(0);

		const source = fs.readFileSync(appImba, 'utf8');
		const tokens = decode([...result!.data], source);

		// every token must cover real identifier-ish source text
		for (const tok of tokens) {
			expect(tok.text, `token at ${tok.line}:${tok.character}`).toMatch(/^[\w$@\-#?]+$/);
		}

		const byText = (text: string) => tokens.filter(t => t.text === text);

		// def bump → a method-ish token; count → recognized member usage;
		// greet → the imported function
		expect(byText('bump').length).toBeGreaterThan(0);
		expect(byText('count').length).toBeGreaterThan(0);
		expect(byText('greet').length).toBeGreaterThan(0);
		expect(byText('bump').some(t => t.type === 'method' || t.type === 'function')).toBe(true);
	});
});
