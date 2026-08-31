# Regression: scoped-css ns stamping on dynamic-tag roots (elements returned
# from an expression, e.g. `<(render-thing!)>`) must survive production builds.
# The flags.reconcile call carrying the css ns used to be gated on the element
# having a className, which only hmr/dev builds guarantee (dev stamps identity
# classes on every element; prod drops them) — so prod builds silently lost
# scoped-css matching on these roots.
import * as compilerns from '../dist/compiler.cjs'
import assert from 'assert'

const compiler = compilerns.compile ? compilerns : compilerns.default

const src = '''
def render-thing
	<span.avatar> 'x'

tag repro-person
	css .avatar w:32px

	def render
		<self>
			<(render-thing!)>
'''

for hmr in [yes, no]
	const js = compiler.compile(src, {sourcePath: 'repro.imba', platform: 'browser', hmr: hmr}).js
	const m = js.match(/flags\.reconcile\(([^)]*)\)/)
	assert m, "flags.reconcile emitted with hmr={hmr}"
	const args = m[1].split(',')
	assert args.length == 3, "reconcile has 3 args with hmr={hmr}"
	assert args[2].trim! != 'null', "reconcile carries the css ns with hmr={hmr}"

console.log 'ok - dynamic-tag scope ns stamping survives non-hmr builds'
