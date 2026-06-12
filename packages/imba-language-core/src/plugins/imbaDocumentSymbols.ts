import type { LanguageServicePlugin } from '@volar/language-service';
import type { MonarchOutlineItem } from 'imba-monarch';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { ImbaVirtualCode } from '../virtualCode';

// parity: service.imba getNavigationTree intercept returning doc.getOutline!
// — now standard LSP DocumentSymbols from monarch on the root document.

/** monarch nav-kind strings (lowercased, space-separated) → LSP SymbolKind */
export const LSP_SYMBOL_KIND: Record<string, number> = {
	file: 1,
	module: 2,
	namespace: 3,
	package: 4,
	class: 5,
	method: 6,
	property: 7,
	field: 8,
	constructor: 9,
	enum: 10,
	interface: 11,
	function: 12,
	var: 13,
	variable: 13,
	constant: 14,
	string: 15,
	number: 16,
	boolean: 17,
	array: 18,
	object: 19,
	key: 20,
	null: 21,
	'enum member': 22,
	struct: 23,
	event: 24,
	operator: 25,
	'type parameter': 26,
	// imba-specific group/scope types
	tag: 5,
	component: 5,
	def: 6,
	get: 7,
	set: 7,
	prop: 7,
	attr: 7,
	mixin: 5,
};

interface DocumentSymbolLike {
	name: string;
	kind: number;
	range: { start: { line: number; character: number }; end: { line: number; character: number } };
	selectionRange: { start: { line: number; character: number }; end: { line: number; character: number } };
	children: DocumentSymbolLike[];
}

function convertItem(item: MonarchOutlineItem, document: TextDocument): DocumentSymbolLike | undefined {
	const name = item.text ?? item.name;
	const selectionSpan = item.nameSpan ?? item.spans?.[0];
	const fullSpan = item.spans?.[0] ?? item.nameSpan;
	if (!name || !selectionSpan || !fullSpan) {
		return undefined;
	}

	// LSP requires range to contain selectionRange
	const start = Math.min(fullSpan.start, selectionSpan.start);
	const end = Math.max(fullSpan.start + fullSpan.length, selectionSpan.start + selectionSpan.length);

	return {
		name,
		kind: LSP_SYMBOL_KIND[String(item.kind ?? '').toLowerCase()] ?? 13,
		range: { start: document.positionAt(start), end: document.positionAt(end) },
		selectionRange: {
			start: document.positionAt(selectionSpan.start),
			end: document.positionAt(selectionSpan.start + selectionSpan.length),
		},
		children: convertItems(item.childItems, document),
	};
}

function convertItems(items: MonarchOutlineItem[] | undefined, document: TextDocument): DocumentSymbolLike[] {
	const out: DocumentSymbolLike[] = [];
	for (const item of items ?? []) {
		const converted = convertItem(item, document);
		if (converted) {
			out.push(converted);
		}
	}
	return out;
}

export function createImbaDocumentSymbolsPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-document-symbols',
		capabilities: {
			documentSymbolProvider: true,
		},
		create(context) {
			return {
				provideDocumentSymbols(document) {
					if (document.languageId !== 'imba') {
						return;
					}
					const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
					if (!decoded) {
						return;
					}
					const root = context.language.scripts.get(decoded[0])?.generated?.root;
					if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
						return;
					}
					// the outline root is a synthetic module wrapper — return its children
					const outline = root.monarchDoc.getOutline();
					return convertItems(outline.childItems, document) as never;
				},
			};
		},
	};
}
