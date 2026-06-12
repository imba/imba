import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { createTypeScriptChecker } from '@volar/kit';
import {
	createImbaDiagnosticsPlugin,
	createImbaLanguagePlugin,
	createTypeScriptServices,
} from '../src/index';

// parity: A6 (typings via the real imba.d.ts set + stdlib-source resolution
// of 'imba'), B3 (diagnostics.imba suppression rules), B4 (identifier
// presentation in messages)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');

describe('M1.3/M1.5: real typings + suppression rules', () => {
	const checker = createTypeScriptChecker(
		[createImbaLanguagePlugin()],
		[...createTypeScriptServices(ts), createImbaDiagnosticsPlugin()],
		tsconfigPath
	);

	it('a tag component using imba globals checks clean', async () => {
		// app.imba: tag with @click handler, imba.commit!, imba.mount, setTimeout.
		// Requires: typings loaded, 'imba' resolved to compiled stdlib source,
		// and the 2554 (event handler arity) + 6133 ($$) suppression rules.
		const diagnostics = await checker.check(path.join(fixtureDir, 'app.imba'));
		expect(diagnostics.map(d => `${d.code}: ${d.message}`)).toEqual([]);
	});

	it('type checking through the stdlib chain is actually live', async () => {
		const diagnostics = await checker.check(path.join(fixtureDir, 'app-bad.imba'));
		const errors = diagnostics.filter(d => d.severity === 1);
		expect(errors.length).toBe(1);
		expect(errors[0].code).toBe(2345); // number not assignable to string
	});
});
