
import {compile} from './monarch/compile'
import {MonarchTokenizer} from './monarch/lexer'

const tokenizers = {}

export class Monarch
	static def getTokenizer langId
		tokenizers[langId]

	static def createTokenizer langId, grammar
		let compiled = compile(langId,grammar)
		tokenizers[langId] = new MonarchTokenizer(langId,compiled)