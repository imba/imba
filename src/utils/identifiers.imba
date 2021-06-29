
# To avoid collisions etc with symbols we are using
# greek characters to convert special imba identifiers
# to valid js identifiers.
export const ToJSMap = {
	'-': 'Ξ'
	'?': 'Φ'
	'#': 'Ψ'
}

const toJSregex = new RegExp("[\-\?\#]","gu")
const toJSreplacer = do(m) ToJSMap[m]

export def toJSIdentifier raw
	raw.replace(toJSregex,toJSreplacer)

export const ToImbaMap = {
	'Ξ': '-'
	'Φ': '?'
	'Ψ': '#'
}

const toImbaRegex = new RegExp("[ΞΦΨ]","gu")
const toImbaReplacer = do(m) ToImbaMap[m]

export def toImbaIdentifier raw
	raw.replace(toImbaRegex,toImbaReplacer)