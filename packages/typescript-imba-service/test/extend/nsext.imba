import { Local } from './local'

extend class APPNS.Main
	static get main
		self

	get ext
		self

# extend class Local.Main
# 	get that	
# 		self

extend class APPCLS
	get ext
		self

class APPCLS.Main
	static get main
		self

	get main
		self