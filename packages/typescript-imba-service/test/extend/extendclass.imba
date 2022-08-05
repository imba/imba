import { AppState, AppState as AppStateAliased } from './def'

extend class Number

	get even
		Number(this) % 2 == 0

extend class AppState

	get extended
		self

extend class SomeClass

	get extended
		self

extend class AppStateAliased

	get aliased
		self