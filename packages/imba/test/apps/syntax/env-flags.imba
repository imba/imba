# Compile-time env flags ($web$, $node$, $dev$ ...). Test pages are compiled
# for the browser, so $web$ code must be kept and $node$ code stripped.
# Imports behind env flags live in ../modules/env-imports-lib.imba.

import * as imbac from 'imba/compiler'

def compile code, o = {}
	imbac.compile(code, Object.assign({sourcePath: 'snippet.imba', platform: 'browser'}, o)).js

class Runtime
	$node$ def where
		'node'
	$web$ def where
		'web'

	$node$ static def boot
		'node-boot'
	$web$ static def boot
		'web-boot'
	$worker$ static def boot
		'worker-boot'

	$web$ get size
		#size ?? 10
	$node$ get size
		20
	$web$ set size value
		#size = value * 2

	$web$ get kind\string
		'web-kind'

	$js$ get data
		#data
	$js$ set data value
		#data = value

	$node$ server-only = 1
	$web$ client-only = 2
	$tsc$ typed-only = 3
	shared = 4

	$node$ def server-method
		'server'
	$node$ static def server-static
		'server-static'
	$web$ $worker$ def web-or-worker
		'web-or-worker'
	$node$ $worker$ def node-or-worker
		'node-or-worker'

	run-on-server = $node$ and do 'ran-on-server'
	run-on-client = $web$ and do 'ran-on-client'
	label = $web$ ? 'web-label' : 'node-label'

extend class Runtime
	$web$ def extended
		'web-extended'
	$node$ def extended
		'node-extended'
	$node$ def extended-server-only
		'server-only'

tag env-flags-el
	$web$ def where
		'web-tag'
	$node$ def where
		'node-tag'

def platform-name
	if $node$
		'node'
	elif $web$
		'web'
	else
		'other'

def worker-or-other
	if $node$
		'node'
	elif $worker$
		'worker'
	else
		'other'

def early-return
	if $web$
		return 'early'
	'late'

def implicit-return
	if $web$
		'web-result'

describe 'env flag values' do

	test '$web$ and $browser$ are true' do
		eq $web$, yes
		eq $browser$, yes

	test 'other platform flags are false' do
		eq $node$, no
		eq $nodeish$, no
		eq $worker$, no
		eq $webworker$, no

	test '$js$ is true outside of tooling' do
		eq $js$, yes

	test '$tsc$ and $hmr$ are falsy' do
		assert !$tsc$
		assert !$hmr$

	test 'exactly one of $dev$ and $prod$ is true' do
		eq $dev$, !$prod$

	test 'unknown flags are falsy' do
		assert !$imba_test_unset_flag$

	test 'flags as values in literals and calls' do
		eq {web: $web$, node: $node$}, {web: yes, node: no}
		eq [$web$, $node$], [yes, no]
		eq String($web$), 'true'

describe 'env flags in conditions' do

	test 'if $web$ runs the body' do
		let hits = []
		if $web$
			hits.push 'web'
		if $node$
			hits.push 'node'
		eq hits, ['web']

	test 'if $node$ with else' do
		let hit = null
		if $node$
			hit = 'node'
		else
			hit = 'else'
		eq hit, 'else'

	test 'if $web$ with else' do
		let hit = null
		if $web$
			hit = 'web'
		else
			hit = 'else'
		eq hit, 'web'

	test 'unless $node$' do
		let hit = no
		unless $node$
			hit = yes
		eq hit, yes

	test 'elif chains' do
		eq platform-name!, 'web'
		eq worker-or-other!, 'other'

	test 'postfix conditions' do
		let hits = []
		hits.push 'web' if $web$
		hits.push 'node' if $node$
		hits.push 'not-node' unless $node$
		eq hits, ['web', 'not-node']

	test 'if $web$ as an expression' do
		let value = if $web$ then 'web' else 'other'
		eq value, 'web'
		let other = if $node$ then 'node' else 'other'
		eq other, 'other'

	test 'return inside if $web$' do
		eq early-return!, 'early'

	test 'implicit return from if $web$' do
		eq implicit-return!, 'web-result'

	test 'let declared inside if $web$' do
		let hits = []
		if $web$
			let inner = 'inner'
			hits.push inner
		eq hits, ['inner']

	test 'nested env conditions' do
		let hit = null
		if $web$
			if $node$
				hit = 'both'
			else
				hit = 'web-only'
		eq hit, 'web-only'

	test 'combined with other conditions' do
		let hits = []
		if $web$ and !$node$
			hits.push 'and-not'
		if $node$ or hits.length
			hits.push 'or'
		if $web$ and $dev$
			hits.push 'dev'
		if !$dev$
			hits.push 'not-dev'
		eq hits.slice(0, 2), ['and-not', 'or']
		eq hits.includes('dev'), $dev$
		eq hits.includes('not-dev'), !$dev$

	test 'env condition inside a loop' do
		let hits = []
		for item in [1, 2, 3]
			if $web$
				hits.push item
			if $node$
				hits.push -item
		eq hits, [1, 2, 3]

describe 'env flags as values' do

	test 'flag and value' do
		eq ($web$ and 'yes'), 'yes'
		eq ($node$ and 'yes'), no

	test 'flag or value' do
		eq ($node$ or 'fallback'), 'fallback'
		eq ($web$ or 'fallback'), yes

	test 'ternaries' do
		eq ($web$ ? 'web' : 'other'), 'web'
		eq ($node$ ? 'node' : 'other'), 'other'

	test 'negated flags' do
		eq !$node$, yes
		eq !$web$, no

	test 'flag and a function' do
		let server = $node$ and do 'server'
		let client = $web$ and do 'client'
		eq server, no
		eq client!, 'client'

	test 'flag and a call as a statement' do
		let calls = []
		$node$ and calls.push('node')
		$web$ and calls.push('web')
		eq calls, ['web']

describe 'env flags on class members' do

	test 'methods with the same name per platform' do
		eq (new Runtime).where!, 'web'

	test 'static methods per platform' do
		eq Runtime.boot!, 'web-boot'

	test 'stripped methods are not defined' do
		let obj = new Runtime
		eq obj.server-method, undefined
		eq Runtime.server-static, undefined

	test 'getters and setters' do
		let obj = new Runtime
		eq obj.size, 10
		obj.size = 3
		eq obj.size, 6

	test 'typed getter' do
		eq (new Runtime).kind, 'web-kind'

	test '$js$ accessors' do
		let obj = new Runtime
		obj.data = 5
		eq obj.data, 5

	test 'fields' do
		let obj = new Runtime
		eq obj.client-only, 2
		eq obj.shared, 4
		eq obj.server-only, undefined
		eq obj.typed-only, undefined

	test 'stripped fields ignore the init object' do
		let obj = new Runtime(server-only: 9, client-only: 8)
		eq obj.server-only, undefined
		eq obj.client-only, 8

	test 'several flags on one member' do
		let obj = new Runtime
		eq obj.web-or-worker!, 'web-or-worker'
		eq obj.node-or-worker, undefined

	test 'flags in field initializers' do
		let obj = new Runtime
		eq obj.run-on-server, no
		eq obj.run-on-client!, 'ran-on-client'
		eq obj.label, 'web-label'

	test 'extend class' do
		let obj = new Runtime
		eq obj.extended!, 'web-extended'
		eq obj.extended-server-only, undefined

	test 'tag methods' do
		let el = <env-flags-el>
		eq el.where!, 'web-tag'

describe 'env-flagged imports' do

	test 'module with stripped imports loads' do
		# env-imports-lib imports node-only specifiers behind $node$ / $tsc$ / $worker$
		let mod = await import('../modules/env-imports-lib.imba')
		eq typeof mod.kept, 'function'

	test '$web$ imports are kept' do
		let mod = await import('../modules/env-imports-lib.imba')
		let kept = mod.kept!
		eq kept.alpha, 'alpha'
		eq kept.beta, 'beta'
		eq kept.gamma, 'gamma'
		eq kept.label, 'label:x'
		eq kept.star-default, 'star-default'
		eq kept.star-one, 1

	test 'stripped imports bind nothing' do
		let mod = await import('../modules/env-imports-lib.imba')
		eq mod.stripped!, ['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined']

	test 'same name imported per platform' do
		let mod = await import('../modules/env-imports-lib.imba')
		eq mod.kept!.platform-read(1, 2), 3

	test '$web$ side-effect import runs' do
		await import('../modules/env-imports-lib.imba')
		assert globalThis.IMBA_TEST_SIDE_EFFECTS.includes('side-effect-lib')

describe 'env flags per platform' do

	test 'class members are picked per platform' do
		let code = "class A\n\t$node$ def where\n\t\t'node-impl'\n\t$web$ def where\n\t\t'web-impl'\n\t$worker$ static def boot\n\t\t'worker-impl'"
		let web = compile(code)
		let node = compile(code, platform: 'node')
		let worker = compile(code, platform: 'worker')
		assert web.includes('web-impl') and !web.includes('node-impl') and !web.includes('worker-impl')
		assert node.includes('node-impl') and !node.includes('web-impl') and !node.includes('worker-impl')
		assert worker.includes('worker-impl') and !worker.includes('web-impl') and !worker.includes('node-impl')

	test 'imports are picked per platform' do
		let code = "$node$ import a from 'node-pkg'\n$web$ import b from 'web-pkg'\n$nodeish$ import c from 'nodeish-pkg'"
		let web = compile(code)
		let node = compile(code, platform: 'node')
		assert web.includes('web-pkg') and !web.includes('node-pkg') and !web.includes('nodeish-pkg')
		assert node.includes('node-pkg') and node.includes('nodeish-pkg') and !node.includes('web-pkg')

	test 'if $node$ is unwrapped in node builds' do
		let code = "if $node$\n\tconsole.log 'on-node'\nelse\n\tconsole.log 'elsewhere'"
		let node = compile(code, platform: 'node')
		assert node.includes('on-node')
		assert !node.includes('elsewhere')
		assert !node.includes('if (')
		let web = compile(code)
		assert web.includes('elsewhere')
		assert !web.includes('on-node')

	test '$webworker$ and $worker$ in a webworker build' do
		let js = compile("let v = [$webworker$, $worker$, $web$]", platform: 'webworker')
		assert js.includes('let v = [true,true,false]')

	test '$dev$ and $prod$ follow the mode' do
		let code = "let v = [$dev$, $prod$]"
		assert compile(code, mode: 'development').includes('let v = [true,false]')
		assert compile(code, mode: 'production').includes('let v = [false,true]')

	test '$hmr$ follows the hmr option' do
		assert compile("let v = $hmr$", hmr: yes).includes('let v = true')
		assert compile("let v = $hmr$").includes('let v = false')

	test 'custom flags from the env option' do
		let code = "let v = $feature$"
		assert compile(code, env: {FEATURE: yes}).includes('let v = true')
		assert compile(code, env: {FEATURE: no}).includes('let v = false')
		assert compile(code, env: {FEATURE: '3'}).includes('let v = 3')
		assert compile(code, env: {FEATURE: 'on'}).includes("let v = 'on'")

	test 'custom flags on class members' do
		let code = "class A\n\t$feature$ def gated\n\t\t'gated-impl'"
		assert compile(code, env: {FEATURE: yes}).includes('gated-impl')
		assert !compile(code, env: {FEATURE: no}).includes('gated-impl')

	test 'flags are kept for tooling except $js$' do
		let code = "$node$ import a from 'node-pkg'\n$js$ import b from 'js-pkg'\nclass A\n\t$web$ def web-member\n\t\t'web-impl'\n\t$js$ def js-member\n\t\t'js-impl'"
		let tsc = compile(code, platform: 'tsc')
		assert tsc.includes('node-pkg')
		assert tsc.includes('web-impl')
		assert !tsc.includes('js-pkg')
		assert !tsc.includes('js-impl')
