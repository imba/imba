
# To avoid collisions etc with symbols we are using
# greek characters to convert special imba identifiers
# to valid js identifiers.


export const InternalPrefixes = {
	TAG: 'τ'
	FLIP: 'ω'
	VALUE: 'υ'
	CACHE: 'ϲ'
	KEY: 'κ'
	ANY: 'φ'
	SYM: 'ε'
	SEP: 'ι'
	PRIVATE: 'Ψ'
	B: 'ι'
	T: 'τ'
	C: 'ρ'
	V: 'υ'
	K: 'κ'
	D: 'Δ'
}

export const ReservedPrefixes = new Set(Object.values(InternalPrefixes))
export const ReservedIdentifierRegex = new RegExp("^[{Array.from(ReservedPrefixes).join('')}]",'u')
# .filter(do $3.indexOf($1) == $2).join("")

export const ToJSMap = {
	'-': 'Ξ'
	'?': 'Φ'
	'#': 'Ψ'
	'@': 'α'
}

const toJSregex = new RegExp("[\-\?\#\@]","gu")
const toJSreplacer = do(m) ToJSMap[m]

export def toJSIdentifier raw
	raw.replace(toJSregex,toJSreplacer)

export const ToImbaMap = {
	'Ξ': '-'
	'Φ': '?'
	'Ψ': '#'
	'α': '@'
}

const toImbaRegex = new RegExp("[ΞΦΨα]","gu")
const toImbaReplacer = do(m) ToImbaMap[m]

export def toImbaIdentifier raw
	raw.replace(toImbaRegex,toImbaReplacer)
	