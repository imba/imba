export class ManualGlobal
	static stuff = [1,2,3]

	get main
		self

	get state
		global.appState

# globalThis.ManualGlobal = ManualGlobal

export class ManualSub < ManualGlobal

export class StringExt

	get singular
		yes

# expp