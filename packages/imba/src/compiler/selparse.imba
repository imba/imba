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
	
	let container = parts[0]
	let localpart = null
	let deeppart = null
	let escaped = no
	let seenDeepOperator = !!o.global
	let hasOffStates = no

	for part,i in parts
		let prev = parts[i - 1]
		let next = parts[i + 1]

		let mods = part.pseudos or []
		let name = part.tagName
		let items = part.slice(0)
		
		let op = part.op = part.nestingOperator

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

		
		let modTarget = part
		let whereForIs = false

		for mod,mi in items
			let name = mod.pseudo
			let meta = modifiers[mod.pseudo]
			if mod.pseudo..match(/^\d+$/)
				let num = parseInt(mod.pseudo)
				mod.media = mod.not ? "(max-width: {num - 1}px)" : "(min-width: {num}px)"

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
				# mod.remove = yes
				# addClass(modTarget,"_{mod.name}_")
				hasOffStates = yes
				(ctx or rule).hasTransitionStyles = yes
				(ctx or rule)["_{name}_"] = yes

			elif mod.name == 'enter' or mod.name == 'leave'
				(ctx or rule)["_{name}_"] = yes
				
			elif name == 'deep'
				# we use >>> instead? Or ->
				mod.remove = yes

				deeppart = part
				if prev
					if !prev.isRoot
						localpart = prev
					else
						localpart = prev.rule = {type: 'rule',rule: prev.rule}
				else
					localpart = rule.rule = {type: 'rule',rule: rule.rule}

			if mod.media
				rule.media.push(mod.media)

	# Now inject scope class names etc
	let last = parts[parts.length - 1]
	let scope = parts.find(do $1.isScope)

	if !scope and (o.id or parts[0].nestingOperator)
		let idx = parts.findIndex(do $1.isScoped)
		let parent = idx == 0 ? rule : parts[idx - 1]
		scope = parent.rule = Object.assign([],{isScope: yes, rule: parts[idx], type: 'rule'})

	if !scope and parts[0].implicitScope
		parts[0].isScope = yes
		scope = parts[0]
		scope.isScoped = no

	# console.log "PARTS",parts,!!o.scope
	if true
		for part in parts
			if part.isScoped and o.scope
				addScopeClass(part,o.scope.cssns!)
	
	if scope and o.scope
		if !scope.classNames.length and !scope.pseudos..length and scope != last and scope == parts[0] and !o.id and (!scope.rule or !scope.rule.op)
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

	if true and o.respecify !== false 
		last.s1 = Math.max(s0,s1)
		last.s2 = s2

	

	return rule

export def render root, content, options = {}
	let group = ['']
	let groups = [group]
	let rules = root.selectors or [root]
	
	root.#rules = []

	for rule in rules
		let sel = selparser.render(rule)
		let [base,media] = sel.split(' @media ')
		rule.#string = base
		# can we really group them this way?
		# let media = rule.media.length ? "@media {rule.media.join(' and ')}" : ''
		if media
			rule.#media = media = '@media ' + media

		if media != group[0]
			groups.push(group = [media])
		
		group.push(sel)
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