# SKIP
import {LocalClass} from './definitions.imba'

extend class GlobalClass
	get ext
		1

extend class LocalClass
	get ext
		2

class GlobalClass.ExtMember
	static get dfn do 4
	get dfn do 4

class LocalClass.ExtMember
	static get dfn do 5
	get dfn do 5

extend class GlobalClass.Member
	get ext do 3

extend class LocalClass.Member
	get ext do 2
