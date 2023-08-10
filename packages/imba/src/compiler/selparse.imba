import * as selparser from '../../vendor/css-selector-parser'
import {modifiers} from './theme.imba'

def addClass rule, name
	# TODO check for negs as well?
	rule.push({flag: name})
	# rule.classNames ||= []
	#
	# if rule.classNames.indexOf(name) == -1
	# 	rule.classNames.push(name)
	return rule

def addScopeClass rule,name
	addClass(rule,name)
	rule.metas ||= []
	rule.metas.push(name)
	return rule

def addPseudo rule, pseudo
	rule.pseudos ||= []
	if typeof pseudo == 'string'
		pseudo = {name: pseudo}

	rule.pseudos.push(pseudo)
	return rule

def addIs rule, raw
	addPseudo(rule,{name: 'is', valueType: 'raw',value: raw})

def addNot rule, raw
	addPseudo(rule,{name: 'not', valueType: 'raw',value: raw})

def getRootRule ruleset, force
	let rule = ruleset.rule
	let root

	if !rule.isRoot
		rule = ruleset.rule = Object.assign([],{type: 'rule',rule: rule,isRoot:yes})

	return rule

def addRootClass ruleset, name
	addClass(getRootRule(ruleset),name)
	return ruleset

def cloneRule rule
	JSON.parse(JSON.stringify(rule))

export def rewrite rule,ctx,o = {}

	if rule.type == 'selectors'

		for sel in rule.selectors
			rewrite(sel,rule,o)

	unless rule.type == 'ruleSet'
		return rule

	let root = rule
	let pri = 0

	let s0 = 0
	let s1 = 0
	let s2 = 0

	rule.meta = {}
	rule.media = []

	let parts = []
	let curr = rule.rule

	while curr
		parts.push(curr)
		curr = curr.rule

	let rev = parts.slice(0).reverse!

	for part,i in rev
		let next = rev[i + 1]
		for item,pi in part
			if item.up > 0 and next
				item.up -= 1
				next.push(item)
				part[pi] = {}

	let container = parts[0]
	let localpart = null
	let deeppart = null
	let escaped = no
	let seenDeepOperator = !!o.global
	let hasOffStates = no
	let importance = 0

	# console.log 'separse',rule,o.type

	# only if we are scoped in somewhere
	if parts[0]..tagName == '*' # and o.scope
		parts[0].nestingOperator = '>>>'
		let base = parts[0]

		if parts[0].length == 0 and parts[1]
			base = parts[1]
			base.nestingOperator = '>>>'

		parts.unshift(rule.rule = Object.assign([],{type: 'rule',rule: base,isScope:yes, nestingOperator: '>>>'}))

	# for part

	for part,i in parts
		let prev = parts[i - 1]
		let next = parts[i + 1]
		let name = part.tagName
		let items = part.slice(0)

		let op = part.op = part.nestingOperator

		if name == '*'
			# Should only happen if we are scoped inside
			if items.length == 0 and next and prev and !seenDeepOperator
				prev.rule = next
				next.op = next.nestingOperator = '>>>'

			localpart ||= prev
			escaped ||= part
			seenDeepOperator = yes
			part.op = '>>>'

		if i == 0 and !name and !op and (part[0]..pseudo or part[0]..implicitScope)
			# console.log 'implicit scope?',part
			part.implicitScope = yes

		if op == '>>'
			localpart = prev
			escaped = part
			part.nestingOperator = '>'
			seenDeepOperator = yes

		elif op == '>>>'
			localpart = prev
			escaped = part
			part.nestingOperator = null
			seenDeepOperator = yes

		if !seenDeepOperator
			part.isScoped = yes

		if name == 'html'
			part.isRoot = yes

		# TODO fix this
		if items.some(do $1.pseudo == 'root')
			part.isRoot = yes

		if name == 'self' or part.isScope
			for prev in parts.slice(0,i)
				prev.isScoped = no

			part.isScope = yes
			part.isScoped = no
			part.tagName = null

		if name == 'body' or name == 'html'
			part.isScoped = no

		# or non-local?
		if o.ns and (!next or next.nestingOperator == '>>>') and !localpart and !deeppart
			if part.isScope or true
				localpart = part

		for mod,mi in items
			let name = mod.pseudo
			let meta = modifiers[mod.pseudo]

			if name..match(/^\!?\d+$/)
				let num = parseInt(name.replace(/\!/,''))
				mod.not = !mod.not if name[0] == '!'
				mod.media = mod.not ? "(max-width: {num - 1}px)" : "(min-width: {num}px)"

			if name == 'important' or name == 'force'
				mod.pseudo = null
				mod.important = yes
				importance += 1
				yes

			if meta..media
				if mod.not
					if meta.medianeg
						mod.media = meta.medianeg
				else
					mod.media = meta.media

			if mod.pseudo == 'media'
				mod.media = "({mod.value})"

			if name == 'local'
				mod.remove = yes
				o.hasScopedStyles = yes
				addClass(part,o.ns) if o.ns

			elif name == 'off' or name == 'out' or name == 'in'
				hasOffStates = yes
				(ctx or rule).hasTransitionStyles = yes
				(ctx or rule)["_{name}_"] = yes

			elif mod.name == 'enter' or mod.name == 'leave'
				(ctx or rule)["_{name}_"] = yes

			if mod.media
				rule.media.push(mod.media)

			if name is 'odd' or name is 'even'
				Object.assign(mod,meta)

	# Now inject scope class names etc
	# console.log "got here!!!",parts
	let last = parts[parts.length - 1]
	let scope = parts.find(do $1.isScope)

	if !scope and (o.id or parts[0].nestingOperator or parts[0].tagName == '*')
		let idx = parts.findIndex(do $1.isScoped)
		let parent = 0 >= idx ? rule : parts[idx - 1]
		scope = parent.rule = Object.assign([],{isScope: yes, rule: parts[idx], type: 'rule'})

	if !scope and parts[0].implicitScope
		parts[0].isScope = yes
		scope = parts[0]
		scope.isScoped = no

	for part in parts
		if part.isScoped and o.scope
			let ns = o.scope.cssns!
			addScopeClass(part,ns)

	if scope and o.scope
		# console.log 'checking the scope?!',scope
		if !scope.length and scope != last and scope == parts[0] and !o.id and (!scope.rule or !scope.rule.op)
			yes # no need to scope this?
		else
			let id = o.id || (o.scope.cssid ? o.scope.cssid! : o.scope.cssns!)
			addScopeClass(scope,id)

	# Calculate what specificity to add
	# Because we need to work around

	let s4 = 0

	for part in parts
		continue if part.isScope
		let mlen = part.metas..length or 0
		s4 += 1 if !mlen and (part.length)

	if s4 > 1
		s4 = 1

	s2 = s4

	if o.inline
		s1 = 3
		s2 = 0

	if o.type == 'component'
		s1 = last.isScope ? 0 : 1

	if o.type == 'scoped'
		s1 = last.isScope ? 2 : 1

	# styles for the @off/@out/@in conditions should always take precedence
	if hasOffStates
		s1 = 4

	s1 += importance

	if true and o.respecify !== false
		last.s1 = Math.max(s0,s1)
		last.s2 = s2

	if o.respecify === false
		last.s1 = last.s2 = 0

	return rule

export def render root, content, options = {}
	let group = ['']
	let groups = [group]
	let rules = root.selectors or [root]

	root.#rules = []

	for rule in rules
		let sel = selparser.render(rule)
		let [base,media = ''] = sel.split(' @media ')
		rule.#string = base

		# can we really group them this way?
		# let media = rule.media.length ? "@media {rule.media.join(' and ')}" : ''
		if media
			rule.#media = media = '@media ' + media

		if media != group[0]
			groups.push(group = [media])

		group.push(base)
		root.#rules.push(rule)

	let out = []

	for group in groups when group[1]
		let sel = group.slice(1).join(',') + ' {$CONTENT$}'
		if group[0]
			sel = group[0] + '{\n' + sel + '\n}'
		out.push(sel)

	return out.join('\n').replace(/\$CONTENT\$/g,content)

	# console.log selparser.render(out)

export def unwrap parent, subsel
	let pars = parent.split(',')
	let subs = subsel.split(',')

	let sels = []

	for sub in subs
		for par in pars
			let sel = sub
			if sel.indexOf('&') >= 0
				# console.log "REPLACE & WITH",par
				sel = sel.replace('&',par)
			else
				sel = par + ' ' + sel
			sels.push(sel)

	return sels.join(',')

export def parse str, options
	let sel = selparser.parse(str)
	let out = sel and rewrite(sel,null,options)
	return out

export def test str, log = no
	let sel = selparser.parse(str)
	let options = {ns: 'dvs342'}
	let out = rewrite(sel,null,options)
	let style = render(out)
	console.log style
	if log
		console.dir sel,{ depth: null }
	return style

# test '.one:hover .test:hocus.test > again'
# test '.test@in-base div.one @focus @in-active @in-other @md'
# test '$editor @focus'
# test 'div@odd @md,li@even @lg,li @md @not-lg'
# test '@media only screen and (max-width: 600px)',true
# test '.one .test@in-active'
# test '.one@focus,.two@in-disabled'
