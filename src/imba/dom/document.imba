import {Zone} from '../zone'

class Doc

extend class Zone
	get document
		console.log 'getting document from zone'
		#document ||= new Doc

export def use_document
	yes