import { Local } from './local'

global class APPCLS
	static get main
		self

	get main
		self

class APPNS.Main
	static get main
		self

	get main
		self

class APPNS.MainSub < APPNS.Main
	static get main
		self

	get sub
		self

class Local.Main
	static get main
		self

	get main
		self