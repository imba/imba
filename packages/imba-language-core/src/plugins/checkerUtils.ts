import type { LanguageServiceContext } from '@volar/language-service';
import type * as ts from 'typescript';

// Shared checker plumbing for the imba service plugins: resolve a global
// interface (ImbaEvents, HTMLElementTagNameMap, ...) by walking program d.ts
// statements — public API only — cached per (program, name).

const cache = new WeakMap<ts.Program, Map<string, ts.Symbol | null>>();

export function getTypeScriptService(context: LanguageServiceContext): ts.LanguageService | undefined {
	try {
		return context.inject('typescript/languageService') as ts.LanguageService;
	} catch {
		return undefined;
	}
}

export function findGlobalInterface(
	typescript: typeof ts,
	program: ts.Program,
	checker: ts.TypeChecker,
	name: string
): ts.Symbol | undefined {
	let byName = cache.get(program);
	if (!byName) {
		byName = new Map();
		cache.set(program, byName);
	}
	if (byName.has(name)) {
		return byName.get(name) ?? undefined;
	}
	let found: ts.Symbol | null = null;
	outer: for (const file of program.getSourceFiles()) {
		if (!file.fileName.endsWith('.d.ts')) {
			continue;
		}
		for (const statement of file.statements) {
			if (typescript.isInterfaceDeclaration(statement) && statement.name.text === name) {
				const symbol = checker.getSymbolAtLocation(statement.name);
				if (symbol) {
					found = symbol;
					break outer;
				}
			}
		}
	}
	byName.set(name, found);
	return found ?? undefined;
}

/** resolve a global `declare namespace X` (e.g. imbacss) and return its exports */
export function findGlobalNamespaceExports(
	typescript: typeof ts,
	program: ts.Program,
	checker: ts.TypeChecker,
	name: string
): ts.Symbol[] {
	let byName = cache.get(program);
	if (!byName) {
		byName = new Map();
		cache.set(program, byName);
	}
	const key = 'ns:' + name;
	if (!byName.has(key)) {
		let found: ts.Symbol | null = null;
		outer: for (const file of program.getSourceFiles()) {
			if (!file.fileName.endsWith('.d.ts')) {
				continue;
			}
			for (const statement of file.statements) {
				if (
					typescript.isModuleDeclaration(statement) &&
					typescript.isIdentifier(statement.name) &&
					statement.name.text === name
				) {
					const symbol = checker.getSymbolAtLocation(statement.name);
					if (symbol) {
						found = symbol;
						break outer;
					}
				}
			}
		}
		byName.set(key, found);
	}
	const symbol = byName.get(key);
	return symbol ? checker.getExportsOfModule(symbol) : [];
}

/** exports of the module whose (virtual) source file path ends with `suffix` — e.g. the imba stdlib entry */
export function findModuleExportsByFileSuffix(
	program: ts.Program,
	checker: ts.TypeChecker,
	suffix: string
): ts.Symbol[] {
	let byName = cache.get(program);
	if (!byName) {
		byName = new Map();
		cache.set(program, byName);
	}
	const key = 'mod:' + suffix;
	if (!byName.has(key)) {
		const file = program.getSourceFiles().find(f => f.fileName.endsWith(suffix));
		const symbol = file ? checker.getSymbolAtLocation(file) : undefined;
		byName.set(key, symbol ?? null);
	}
	const symbol = byName.get(key);
	return symbol ? checker.getExportsOfModule(symbol) : [];
}

/** one-line summary from the @summary jsdoc tag, identifier-converted by the caller */
export function summaryOf(symbol: ts.Symbol, checker: ts.TypeChecker): string | undefined {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (tag.name === 'summary') {
			return (tag.text ?? []).map(part => part.text).join('');
		}
	}
	return undefined;
}

export function detailOf(symbol: ts.Symbol, checker: ts.TypeChecker): string | undefined {
	return tagText(symbol, checker, 'detail');
}

/** text of an arbitrary jsdoc tag (@proxy, @alias, @detail, …) */
export function tagText(symbol: ts.Symbol, checker: ts.TypeChecker, tagName: string): string | undefined {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (tag.name === tagName) {
			return (tag.text ?? []).map(part => part.text).join('');
		}
	}
	return undefined;
}
