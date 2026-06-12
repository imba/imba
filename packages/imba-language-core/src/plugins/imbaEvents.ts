import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { toImbaString } from '../conversion';
import { ImbaVirtualCode } from '../virtualCode';
import { findGlobalInterface, getTypeScriptService } from './checkerUtils';

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
	symbol?: ts.Symbol;
	/** definition target when there is no symbol (index-signature members) */
	declaration?: ts.Declaration;
	note?: string;
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

				const program = getTypeScriptService(context)?.getProgram();
				if (!program) {
					return undefined;
				}
				const checker = program.getTypeChecker();
				const imbaEvents = findGlobalInterface(typescript, program, checker, 'ImbaEvents');
				if (!imbaEvents) {
					return undefined;
				}
				const imbaEventsType = checker.getDeclaredTypeOfSymbol(imbaEvents);

				// custom events resolve through the index signature
				// ([event: string]: CustomEvent) — parity: old checker.member()
				// fell back to getStringIndexType
				const stringIndex = checker
					.getIndexInfosOfType(imbaEventsType)
					.find(info => info.keyType.flags & typescript.TypeFlags.String);

				if (isEventName) {
					const name = tok.value.replace(/^@/, '');
					const prop = imbaEventsType.getProperty(name);
					if (prop) {
						const type = typeOf(checker, prop);
						return {
							symbol: prop,
							checker,
							display: `(property) ImbaEvents.${name}: ${checker.typeToString(type)}`,
						};
					}
					if (stringIndex) {
						return {
							declaration: stringIndex.declaration,
							checker,
							display: `(property) ImbaEvents.${name}: ${checker.typeToString(stringIndex.type)}`,
							note: 'custom event',
						};
					}
					return undefined;
				}

				const eventName = ctx.eventName;
				if (!eventName) {
					return undefined;
				}
				const eventProp = imbaEventsType.getProperty(eventName);
				const eventType = eventProp ? typeOf(checker, eventProp) : stringIndex?.type;
				if (!eventType) {
					return undefined;
				}
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
					if (resolved.note) {
						lines.push(`*${resolved.note}*`);
					}
					let docs =
						resolved.symbol
							?.getDocumentationComment(resolved.checker)
							.map(part => part.text)
							.join('') ?? '';
					const meta: string[] = [];
					for (const tag of resolved.symbol?.getJsDocTags(resolved.checker) ?? []) {
						const text = (tag.text ?? []).map(part => part.text).join('');
						if (/^(detail|color|snippet)$/.test(tag.name)) {
							continue;
						}
						if (/^(summary|custom|deprecated|see|example|param|returns)$/.test(tag.name)) {
							meta.push(toImbaString(`*@${tag.name}* — ${text}`));
						} else {
							// TS's jsdoc parser chops `@word` inside doc examples
							// (even in fenced code blocks) into bogus tags —
							// stitch them back into the doc text in order
							docs += `@${tag.name}${text}`;
						}
					}
					if (docs) {
						lines.push(toImbaString(docs));
					}
					lines.push(...meta);
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
					const declaration = resolved?.symbol?.declarations?.[0] ?? resolved?.declaration;
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
