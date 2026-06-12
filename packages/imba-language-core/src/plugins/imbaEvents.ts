import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { toImbaString } from '../conversion';
import { ImbaVirtualCode } from '../virtualCode';

// parity: typescript-imba-plugin script.imba getInfoAt (tag.event.name /
// tag.event-modifier.name branches) + checker.imba getEventModifier —
// the monarch-token → global-declaration lookup Sindre described:
// event/modifier tokens never exist in the generated TS (they compile to
// addEventListener strings), so TS-via-mappings can't answer them. Instead
// we read the token context from monarch and resolve symbols against the
// injected global typings (interface ImbaEvents, modifiers as α-prefixed
// methods on the event interfaces) through the TS checker.

interface ResolvedSymbol {
	display: string;
	symbol: ts.Symbol;
	checker: ts.TypeChecker;
}

export function createImbaEventsPlugin(typescript: typeof ts): LanguageServicePlugin {
	return {
		name: 'imba-events',
		capabilities: {
			hoverProvider: true,
			definitionProvider: true,
		},
		create(context) {
			const imbaEventsSymbols = new WeakMap<ts.Program, ts.Symbol | null>();

			function getTsService(): ts.LanguageService | undefined {
				try {
					return context.inject('typescript/languageService') as ts.LanguageService;
				} catch {
					return undefined;
				}
			}

			function getImbaEventsSymbol(program: ts.Program, checker: ts.TypeChecker): ts.Symbol | undefined {
				if (imbaEventsSymbols.has(program)) {
					return imbaEventsSymbols.get(program) ?? undefined;
				}
				let found: ts.Symbol | null = null;
				for (const file of program.getSourceFiles()) {
					if (!file.fileName.endsWith('.d.ts')) {
						continue;
					}
					for (const statement of file.statements) {
						if (typescript.isInterfaceDeclaration(statement) && statement.name.text === 'ImbaEvents') {
							const symbol = checker.getSymbolAtLocation(statement.name);
							if (symbol) {
								found = symbol;
								break;
							}
						}
					}
					if (found) {
						break;
					}
				}
				imbaEventsSymbols.set(program, found);
				return found ?? undefined;
			}

			function resolveAt(document: TextDocument, offset: number): ResolvedSymbol | undefined {
				const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
				if (!decoded) {
					return undefined;
				}
				const root = context.language.scripts.get(decoded[0])?.generated?.root;
				if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
					return undefined;
				}
				const ctx = root.monarchDoc.getContextAtOffset(offset);
				let tok = ctx?.token;
				// parity: getInfoAt — at the boundary after '@' or '.' the
				// context token is the start sigil; hop to the name token
				if (tok?.match('tag.event.start tag.event-modifier.start')) {
					tok = tok.next ?? undefined;
				}
				if (!tok) {
					return undefined;
				}

				const isEventName = tok.match('tag.event.name');
				const isModifierName = tok.match('tag.event-modifier.name');
				if (!isEventName && !isModifierName) {
					return undefined;
				}

				const program = getTsService()?.getProgram();
				if (!program) {
					return undefined;
				}
				const checker = program.getTypeChecker();
				const imbaEvents = getImbaEventsSymbol(program, checker);
				if (!imbaEvents) {
					return undefined;
				}
				const imbaEventsType = checker.getDeclaredTypeOfSymbol(imbaEvents);

				if (isEventName) {
					const name = tok.value.replace(/^@/, '');
					const prop = imbaEventsType.getProperty(name);
					if (!prop) {
						return undefined;
					}
					const type = typeOf(checker, prop);
					return {
						symbol: prop,
						checker,
						display: `(property) ImbaEvents.${name}: ${checker.typeToString(type)}`,
					};
				}

				const eventName = ctx.eventName;
				if (!eventName) {
					return undefined;
				}
				const eventProp = imbaEventsType.getProperty(eventName);
				if (!eventProp) {
					return undefined;
				}
				const eventType = typeOf(checker, eventProp);
				const modifier = eventType.getProperty('α' + tok.value);
				if (!modifier) {
					return undefined;
				}
				const declaration = modifier.declarations?.[0];
				const owner =
					declaration && typescript.isInterfaceDeclaration(declaration.parent)
						? declaration.parent.name.text
						: checker.typeToString(eventType);
				return {
					symbol: modifier,
					checker,
					display: `(method) ${owner}.@${tok.value}: ${checker.typeToString(typeOf(checker, modifier))}`,
				};
			}

			function tokenRange(document: TextDocument, offset: number) {
				const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
				const root = decoded && context.language.scripts.get(decoded[0])?.generated?.root;
				const tok = root instanceof ImbaVirtualCode ? root.monarchDoc.getContextAtOffset(offset)?.token : undefined;
				if (!tok) {
					return undefined;
				}
				return {
					start: document.positionAt(tok.offset),
					end: document.positionAt(tok.endOffset),
				};
			}

			return {
				provideHover(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const offset = document.offsetAt(position);
					const resolved = resolveAt(document, offset);
					if (!resolved) {
						return;
					}
					const lines = [`\`\`\`typescript\n${toImbaString(resolved.display)}\n\`\`\``];
					const docs = resolved.symbol
						.getDocumentationComment(resolved.checker)
						.map(part => part.text)
						.join('');
					if (docs) {
						lines.push(toImbaString(docs));
					}
					for (const tag of resolved.symbol.getJsDocTags(resolved.checker)) {
						if (/^(detail|color|snippet)$/.test(tag.name)) {
							continue;
						}
						const text = (tag.text ?? []).map(part => part.text).join('');
						lines.push(toImbaString(`*@${tag.name}* — ${text}`));
					}
					return {
						contents: { kind: 'markdown' as const, value: lines.join('\n\n') },
						range: tokenRange(document, offset),
					};
				},
				provideDefinition(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const offset = document.offsetAt(position);
					const resolved = resolveAt(document, offset);
					const declaration = resolved?.symbol.declarations?.[0];
					if (!resolved || !declaration) {
						return;
					}
					const sourceFile = declaration.getSourceFile();
					const uriConverter = context.project.typescript?.uriConverter;
					if (!uriConverter) {
						return;
					}
					const toPosition = (pos: number) => {
						const lc = sourceFile.getLineAndCharacterOfPosition(pos);
						return { line: lc.line, character: lc.character };
					};
					const nameNode = (declaration as { name?: ts.Node }).name ?? declaration;
					return [
						{
							targetUri: uriConverter.asUri(sourceFile.fileName).toString(),
							targetRange: {
								start: toPosition(declaration.getStart(sourceFile)),
								end: toPosition(declaration.getEnd()),
							},
							targetSelectionRange: {
								start: toPosition(nameNode.getStart(sourceFile)),
								end: toPosition(nameNode.getEnd()),
							},
							originSelectionRange: tokenRange(document, offset),
						},
					];
				},
			};
		},
	};
}

function typeOf(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Type {
	const location = symbol.valueDeclaration ?? symbol.declarations?.[0];
	return location
		? checker.getTypeOfSymbolAtLocation(symbol, location)
		: checker.getDeclaredTypeOfSymbol(symbol);
}
