// M1.9 dogfood: run the Volar-based checker over a real imba project
// (read-only) and aggregate diagnostics for triage.
//
//   node test/dogfood.cjs [projectDir] [--errors-only] [--samples=N]
//
// Defaults to apps/imba.io in this monorepo. Run twice to see the G2 disk
// cache effect on total time.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { createTypeScriptInferredChecker } = require('@volar/kit');
const {
	createImbaDiagnosticsPlugin,
	createImbaLanguagePlugin,
	createTypeScriptServices,
} = require('../dist/index.js');

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = process.argv.slice(2).filter(a => a.startsWith('--'));
const projectDir = path.resolve(args[0] ?? path.join(__dirname, '../../../apps/imba.io'));
const errorsOnly = flags.includes('--errors-only');
const maxSamples = Number((flags.find(f => f.startsWith('--samples=')) ?? '--samples=3').split('=')[1]);

const TYPINGS = path.join(__dirname, '../../typescript-imba-plugin/typings/imba.d.ts');

function collectImbaFiles(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
			continue;
		}
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectImbaFiles(full, out);
		} else if (entry.name.endsWith('.imba')) {
			out.push(full);
		}
	}
	return out;
}

async function main() {
	const files = collectImbaFiles(projectDir);
	console.log(`dogfood: ${files.length} imba files in ${projectDir}`);

	const checker = createTypeScriptInferredChecker(
		[createImbaLanguagePlugin()],
		[...createTypeScriptServices(ts), createImbaDiagnosticsPlugin()],
		() => [...files, TYPINGS],
		{
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
			lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
			allowJs: true,
			checkJs: false,
			noEmit: true,
			skipLibCheck: true,
			strict: false,
			allowArbitraryExtensions: true,
			customConditions: ['imba'],
		}
	);

	const byCode = new Map();
	let totalDiags = 0;
	let filesWithIssues = 0;
	const t0 = Date.now();

	for (const file of files) {
		let diags = await checker.check(file);
		if (errorsOnly) {
			diags = diags.filter(d => d.severity === 1);
		}
		if (!diags.length) {
			continue;
		}
		filesWithIssues++;
		totalDiags += diags.length;
		for (const d of diags) {
			const key = `${d.source ?? 'ts'}/${d.code}`;
			const bucket = byCode.get(key) ?? { count: 0, samples: [] };
			bucket.count++;
			if (bucket.samples.length < maxSamples) {
				const msg = typeof d.message === 'string' ? d.message : d.message.value;
				bucket.samples.push(
					`${path.relative(projectDir, file)}:${d.range.start.line + 1}:${d.range.start.character + 1} ${msg.slice(0, 110).replace(/\n/g, ' ')}`
				);
			}
			byCode.set(key, bucket);
		}
	}

	const took = Date.now() - t0;
	console.log(`\nchecked ${files.length} files in ${(took / 1000).toFixed(1)}s — ${totalDiags} diagnostics in ${filesWithIssues} files\n`);

	const sorted = [...byCode.entries()].sort((a, b) => b[1].count - a[1].count);
	for (const [key, { count, samples }] of sorted) {
		console.log(`${String(count).padStart(5)}  ${key}`);
		for (const s of samples) {
			console.log(`         ${s}`);
		}
	}
}

main().then(
	() => process.exit(0),
	e => {
		console.error(e);
		process.exit(1);
	}
);
