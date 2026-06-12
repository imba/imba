import { describe, expect, it } from 'vitest';
import { preferImbaDefinitions } from '../src/index';

// parity: E3 — service.imba definition filtering (prefer imba source over
// the shipped typings d.ts when both are present)

const imbaDef = { targetUri: 'file:///app/src/widget.imba' };
const typingsDef = { targetUri: 'file:///app/node_modules/imba/typings/imba.events.d.ts' };
const stylesTypingsDef = { targetUri: 'file:///app/node_modules/imba/typings/styles.generated.d.ts' };
const userDtsDef = { targetUri: 'file:///app/src/custom.d.ts' };
const libDef = { targetUri: 'file:///lib/lib.dom.d.ts' };

describe('E3: preferImbaDefinitions', () => {
	it('drops imba typings entries when imba-source definitions exist', () => {
		expect(preferImbaDefinitions([imbaDef, typingsDef, stylesTypingsDef])).toEqual([imbaDef]);
	});

	it('keeps typings entries when nothing imba-source is present', () => {
		expect(preferImbaDefinitions([typingsDef, libDef])).toEqual([typingsDef, libDef]);
	});

	it('never drops user d.ts or lib entries', () => {
		expect(preferImbaDefinitions([imbaDef, userDtsDef, libDef])).toEqual([imbaDef, userDtsDef, libDef]);
	});

	it('never returns an empty list', () => {
		expect(preferImbaDefinitions([typingsDef])).toEqual([typingsDef]);
	});
});
