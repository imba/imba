import * as path from 'node:path';
import { describe, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';
const fixtureDir = path.join(__dirname, 'fixture');
describe('probe', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));
	it('color values + unit position', async () => {
		const loc = locate(path.join(fixtureDir, 'style-units.imba'), 'c:bl', 4);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		const labels = (result?.items ?? []).map(i => String(i.label));
		console.log('[c:] count', labels.length, 'has blue4:', labels.includes('blue4'), 'has blue:', labels.includes('blue'), labels.filter(l => l.startsWith('bl')).slice(0,6));
		const loc2 = locate(path.join(fixtureDir, 'style-units.imba'), 'w:10', 4);
		const r2 = await ls.getCompletionItems(loc2.uri, loc2.position);
		console.log('[w:10] count', r2?.items.length, (r2?.items ?? []).map(i => String(i.label)).slice(0, 8));
	});
});
