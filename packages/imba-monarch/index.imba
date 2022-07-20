
import Script from './src/script'

export default Script

export { Monarch } from './src/monarch'
export { lexer, Token } from './src/lexer'
export { grammar } from './src/grammar'
export { highlight } from './src/highlighter'

export { SymbolKind,SemanticTokenTypes,SemanticTokenModifiers,Keywords,KeywordTypes,M,CompletionTypes} from './src/types'
export { SymbolFlags,Sym} from './src/symbol'
export { Node,Scope,Group } from './src/scope'
export { Position,Range } from './src/structures'
