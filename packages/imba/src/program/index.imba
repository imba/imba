# The language tooling (grammar, tokenizer, semantic analysis) lives in the
# imba-monarch package - the same source used by typescript-imba-plugin and
# vscode-imba. This module re-exports it to keep the `imba/program` and
# `compiler.program` apis working. Bundled at build time - the published
# package ships the prebuilt program.imba.js, so imba-monarch is only
# needed when building imba itself.

export { ImbaDocument } from 'imba-monarch/src/document.imba'
export { Monarch } from 'imba-monarch/src/monarch.imba'
export { lexer, Token } from 'imba-monarch/src/lexer.imba'
export { grammar } from 'imba-monarch/src/grammar.imba'
export { highlight } from 'imba-monarch/src/highlighter.imba'

export { SymbolKind, SemanticTokenTypes, SemanticTokenModifiers, Keywords, KeywordTypes, M, CompletionTypes } from 'imba-monarch/src/types.imba'
export { SymbolFlags, Sym } from 'imba-monarch/src/symbol.imba'
export { Node, Scope, Group } from 'imba-monarch/src/scope.imba'
export { Position, Range } from 'imba-monarch/src/structures.imba'
