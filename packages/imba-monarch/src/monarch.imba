
import {compile} from './monarch/compile'
import {MonarchTokenizer} from './monarch/lexer'

import {grammar as xmlGrammar} from './grammars/xml'

const tokenizers = {}

export class Monarch
	static def getTokenizer langId
		if langId == 'xml' && !tokenizers[langId]
			return createTokenizer('xml',xmlGrammar)
		tokenizers[langId]

	static def createTokenizer langId, grammar
		let compiled = compile(langId,grammar)
		tokenizers[langId] = new MonarchTokenizer(langId,compiled)