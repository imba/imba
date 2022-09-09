# SKIP

global class GlobalClass
	static get dfn do 1
	get dfn do 1

export class LocalClass < GlobalClass
	static get dfn do 2
	get dfn
		2

class LocalClass.Member
	static get dfn do 2
	get dfn do 2

class GlobalClass.Member
	static get dfn do 3
	get dfn do 3

class GlobalClass.Sub < GlobalClass.Member
	static get dfn do 4
	get dfn do 4

# export class Local