import { WorkerManager, setupMode } from '../workers/imba/client'
# import {grammar} from 'imba/src/program/grammar.imba'
import {grammar} from 'imba/program'

export const id = 'imba'
export const extensions = ['.imba']
export const aliases = ['Imba', 'imba']
export const mimetypes = ['application/imba']

export const configuration = {
	wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#%\^\&\*\(\)\=\$\-\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
	comments: {
		blockComment: ['###', '###'],
		lineComment: '#'
	},
	brackets: [
		['{', '}','delimiter.curly'],
		['[', ']','delimiter.square'],
		['(', ')','delimiter.parenthesis'],
		['<', '>','delimiter.angle']
	],
	autoClosingPairs: [
		{ open: '"', close: '"', notIn: ['string', 'comment'] },
		{ open: '\'', close: '\'', notIn: ['string', 'comment'] },
		{ open: '{', close: '}', notIn: ['comment'] },
		{ open: '[', close: ']', notIn: ['string', 'comment'] },
		{ open: '(', close: ')', notIn: ['string', 'comment'] },
		{ open: '<', close: '>', notIn: ['string','comment','operators'] },
	],
	onEnterRules: [{
		beforeText: /^\s*(?:def|get \w|set \w|class|for|if|elif|else|while|try|with|finally|except|async).*?$/,
		action: { indentAction: 1 }
	},{
		beforeText: /\s*(?:do)\s*(\|.*\|\s*)?$/,
		action: { indentAction: 1 }
	}]
}

export const language = grammar

export def setup monaco
	monaco.languages.register({id,extensions,aliases})
	monaco.languages.onLanguage(id) do
		console.log 'monaco onLanguage',id,language
		monaco.languages.setMonarchTokensProvider(id, language)
		monaco.languages.setLanguageConfiguration(id, configuration)
		setupMode(id)