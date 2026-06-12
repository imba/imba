import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Locate the imba global typings (imba.d.ts pulls the rest via /// references)
 * for a project — preferring the project's own imba install so types always
 * match the runtime, falling back to the imba package this tooling was built
 * against. parity: old plugin's IMBA_PATH/typings lib injection.
 */
export function resolveImbaTypings(projectDir?: string): string | undefined {
	const candidates: (string | undefined)[] = [
		projectDir && resolveImbaPackageDir([projectDir]),
		resolveImbaPackageDir(),
	];
	for (const pkgDir of candidates) {
		if (!pkgDir) {
			continue;
		}
		const typings = path.join(pkgDir, 'typings', 'imba.d.ts');
		if (fs.existsSync(typings)) {
			return typings;
		}
	}
	return undefined;
}

/** imba's exports map hides package.json — resolve the compiler entry and walk up */
export function resolveImbaPackageDir(paths?: string[]): string | undefined {
	try {
		let dir = path.dirname(require.resolve('imba/compiler', paths ? { paths } : undefined));
		for (let i = 0; i < 4; i++) {
			const pkgPath = path.join(dir, 'package.json');
			if (fs.existsSync(pkgPath)) {
				const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
				if (pkg.name === 'imba') {
					return dir;
				}
			}
			dir = path.dirname(dir);
		}
	} catch {
		// not resolvable from here
	}
	return undefined;
}
