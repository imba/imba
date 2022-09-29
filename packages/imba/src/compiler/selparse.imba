import * as selparser from '../../vendor/css-selector-parser'
import {modifiers} from './theme.imba'

def addClass rule, name
	rule.classNames ||= []

	if rule.classNames.indexOf(name) == -1
		rule.classNames.push(name)
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

def getRootRule ruleset, force
	let rule = ruleset.rule
	let root

	if !rule.isRoot
		rule = ruleset.rule = {type: 'rule',rule: rule,isRoot:yes}
	return rule
	

def addRootClass ruleset, name
	addClass(getRootRule(ruleset),name)
	return ruleset
	
def wrapRule rule, wrapper
	yes
	
def cloneRule rule
	JSON.parse(JSON.stringify(rule))

export def calcSpecificity rule
	# let number = 0
	# let spec = [0,0,0]
	let ids = 0
	let pri = 0
	let cls = 0
	let els = 0

	let curr = rule.rule
	while curr
		if curr.tagName
			els++
		if curr.classNames
			cls += curr.classNames.length
		if curr.pseudos
			els += curr.pseudos.length
		if curr.pri
			pri += curr.pri
		curr = curr.rule
	return [pri,ids,cls,els]
	
export def rewrite rule,ctx,o = {}

	if rule.type == 'selectors'
		
		for sel in rule.selectors
			rewrite(sel,rule,o)
	
	unless rule.type == 'ruleSet'
		return rule
	
	
	
	let root = rule
	let pri = 0
	let specificity = 0

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
	
	# hack
	for part,i in rev
		let up = rev[i + 1]
		let flags = part.classNames
		let mods = part.pseudos
		let name = part.tagName
		let op = part.nestingOperator
		
		if !flags and !name and !op and (mods and mods.every(do $1.special))
			if up
				up.pseudos = (up.pseudos or []).concat(mods)
				up.rule = part.rule
				parts.splice(parts.indexOf(part),1)
			else
				part.implicitScope = yes
	
	let container = parts[0]
	let localpart = null
	let deeppart = null
	let escaped = no
	let seenDeepOperator = !!o.global
	let hasOffStates = no

	for part,i in parts
		let prev = parts[i - 1]
		let next = parts[i + 1]
		let flags = part.classNames ||= []
		let mods = part.pseudos or []
		let name = part.tagName
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
		
		if mods.some(do $1.name == 'root')
			part.isRoot = yes
			
		if name == 'self' or part.isScope
			for prev in parts.slice(0,i)
				prev.isScoped = no
			part.isScope = yes
			part.isScoped = no
			part.tagName = null

		if name == 'body' or name == 'html'
			part.isScoped = no
			# Warn if this is the last one?!

		for flag,i in flags
			if flag[0] == '$'
				flags[i] = 'ref--' + flag.slice(1)
		
		if part.tagName
			specificity++
		
		# or non-local?
		if o.ns and (!next or next.nestingOperator == '>>>') and !localpart and !deeppart
			if part.isScope or true
				localpart = part

		specificity += part.classNames.length
		
		let modTarget = part

		for mod in mods when mod.special
			
			let [m,pre,name,post] = (mod.name.match(/^(\$|\.+)?([^\~\+]*)([\~\+]*)$/) or [])
			let hit
			let media
			let neg = mod.name[0] == '!' ? '!' : ''
			let modname = neg ? mod.name.slice(1) : mod.name

			if neg
				mod.neg = yes
				mod.name = mod.name.slice(1)

			if pre == '.'
				addClass(modTarget,name)
				mod.remove = yes
				specificity++
			
			elif pre == '..'
				prev ||= root.rule = {type: 'rule',classNames:[],rule:root.rule}
				addClass(modTarget = prev,name)
				mod.remove = yes
				specificity++
			
			elif modname.match(/^\d+$/)
				let num = parseInt(modname)
				if neg
					media = "(max-width: {num - 1}px)"
				else
					media = "(min-width: {num}px)"

			if name == 'media'
				media = "({mod.value})"
				
			if post == '~'
				# NOT IMPLEMENTED sibling selector modifier
				modTarget

			if media
				rule.media.push(media)
				# s1++ # media modifiers should  mimic attr specificity
				mod.remove = yes

			elif let alias = modifiers[modname]
				if alias.media
					let m = alias.media
					if neg and alias.medianeg
						m = alias.medianeg
					rule.media.push(m)
					mod.remove = yes
				if alias.ua
					# get or force-create html element
					addClass(getRootRule(rule),"{neg}ua-{alias.ua}")
					mod.remove = yes
					specificity++
				if alias.flag
					addClass(modTarget,"{neg}" + alias.flag)
					mod.remove = yes
					specificity++
				if alias.pri
					pri = alias.pri
					s0 += 4
					mod.remove = yes

				unless mod.remove
					Object.assign(mod,alias)

			elif mod.name == 'local'
				mod.remove = yes
				o.hasScopedStyles = yes
				addClass(part,o.ns) if o.ns
				specificity++
				
			elif mod.name == 'off' or mod.name == 'out' or mod.name == 'in'
				mod.remove = yes
				addClass(modTarget,"_{mod.name}_")
				hasOffStates = yes
				(ctx or rule).hasTransitionStyles = yes
				(ctx or rule)["_{mod.name}_"] = yes
			elif mod.name == 'enter' or mod.name == 'leave'
				addClass(modTarget,"_{mod.name}_")
				mod.remove = yes
				(ctx or rule)["_{mod.name}_"] = yes
				
			elif mod.name == 'deep'
				mod.remove = yes
				
				deeppart = part
				
				if prev
					if !prev.isRoot
						localpart = prev
					else
						localpart = prev.rule = {type: 'rule',rule: prev.rule}
				else
					localpart = rule.rule = {type: 'rule',rule: rule.rule}
			elif !mod.remove
				# TODO negative class modifiers like this don't work well now
				let cls = neg ? "!mod-{mod.name.slice(1)}" : "mod-{mod.name}"
				addClass(getRootRule(rule),cls)
				mod.remove = yes
				specificity++
			
			
			if modTarget != part and !mod.remove
				addPseudo(modTarget,mod)
				mod.remove = yes
				specificity++
			elif !mod.remove
				specificity++

		mods = mods.filter do !$1.remove
		part.pseudos = mods.filter(do $1.type != 'el').concat(mods.filter(do $1.type == 'el'))
	
	rule.specificity = specificity

	# Now inject scope class names etc
	let last = parts[parts.length - 1]
	let scope = parts.find(do $1.isScope)

	if !scope and (o.id or parts[0].nestingOperator)
		let idx = parts.findIndex(do $1.isScoped)
		let parent = idx == 0 ? rule : parts[idx - 1]
		scope = parent.rule = {isScope: yes, rule: parts[idx], classNames: [], type: 'rule'}

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
		s4 += 1 if !mlen and (part.classNames..length or part..pseudos..length)

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

	if true
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
		rule.#string = sel
		let media = rule.media.length ? "@media {rule.media.join(' and ')}" : ''
		rule.#media = media
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
	console.log 'parsed',str,sel
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