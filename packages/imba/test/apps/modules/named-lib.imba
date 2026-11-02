# Helper module for imports.imba, exports.imba and dynamic-import.imba.
# Exports bindings in the shapes real apps use: declarations, export lists
# of local bindings, renamed exports and a default export.

export const alpha = 'alpha'
export const beta = 'beta'
export const gamma = 'gamma'
export const UPPER_CASE = 42
export let counter = 0

export def bump
	counter += 1

export def add a, b
	a + b

export def make-label name
	"label:{name}"

export class Point
	x = 0
	y = 0

	get sum
		x + y

const hidden = 'hidden'
const local-one = 1
let local-two = 2

def local-fn
	'local-fn'

class LocalThing
	kind = 'local'

export def set-local-two value
	local-two = value

export {local-one, local-two}
export {local-fn as renamed-fn, LocalThing}
export {hidden as revealed}

export default def main
	'default-main'
