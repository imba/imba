import * as selparser from '../../vendor/css-selector-parser'
import {modifiers} from './theme.imba'

def addClass rule, name
	rule.classNames ||= []

	if rule.classNames.indexOf(name) == -1
		rule.classNames.push(name)
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
	let specify = o.specify
	
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

	let scope = parts.find(do $1.isScope)

	if o.scoping and !scope
		parts.unshift(root.rule = scope = {type: 'rule',rule: root.rule,classNames: [], isScope: yes})
		# console.log 'scoping!!',rule

	if scope
		scope.classNames ||= []
	
	# if no rule includes & and we have specified nesting
	# add a root rule 
	# console.log "rules!",parts
	
	let rev = parts.slice(0).reverse!
	
	# hack
	for part,i in rev
		let up = rev[i + 1]
		let flags = part.classNames
		let mods = part.pseudos
		let name = part.tagName
		let op = part.nestingOperator
		
		if !flags and !name and !op and (mods and mods.every(do $1.special))
			# console.log 'send up to the parent',part,up,part == up
			if up
				up.pseudos = (up.pseudos or []).concat(mods)
				up.rule = part.rule
				parts.splice(parts.indexOf(part),1)
			# else
			# 	console.log 'cannot send further up!!!'
	
	let container = parts[0]
	let localpart = null
	let deeppart = null
	let forceLocal = o.forceLocal
	let escaped = no

	for part,i in parts
		let prev = parts[i - 1]
		let next = parts[i + 1]
		let flags = part.classNames ||= []
		let mods = part.pseudos or []
		let name = part.tagName
		let op = part.nestingOperator

		# if part.isScope and o.scoping
		#	addClass(part,o.scoping)
		
		if op == '>>'
			localpart = prev
			escaped = part
			part.nestingOperator = '>'
		elif op == '>>>'
			localpart = prev
			escaped = part
			part.nestingOperator = null
		
		if name == 'html'
			part.isRoot = yes
		
		if mods.some(do $1.name == 'root')
			part.isRoot = yes
			
		if name == 'self'
			if o.ns
				addClass(part,o.ns + '_')
				part.tagName = null
			
		for flag,i in flags

			if flag[0] == '%'
				flags[i] = 'mixin___'+flag.slice(1)
				pri = 1 if pri < 1
			elif flag[0] == '$'
				# flags[i] = flag.slice(1) + '-' + o.ns
				flags[i] = 'ref--' + flag.slice(1)
				localpart = part unless escaped
				pri = 1 if pri < 1
		
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
			let neg = mod.name[0] == '!'

			if pre == '.'
				addClass(modTarget,name)
				mod.remove = yes
				specificity++
			
			elif pre == '..'
				prev ||= root.rule = {type: 'rule',classNames:[],rule:root.rule}
				addClass(modTarget = prev,name)
				mod.remove = yes
				specificity++

			elif hit = mod.name.match(/^([a-z]*)(\d+)(\+|\-)?$/)
				unless hit[1]
					if hit[3] == '-'
						media = "(max-width: {hit[2]}px)"
					else
						media = "(min-width: {hit[2]}px)"

			elif hit = (mod.name.match(/^([a-z\-]*)([\>\<\!])(\d+)$/) or mod.name.match(/^(\.)?(gte|lte)\-(\d+)$/))
				# TODO simplify to just @number for gte and @!number for lt
				let [all,key,op,val] = hit
				let num = parseInt(val)
				if op == '>' or op == 'gte'
					if key == 'vh'
						media = "(min-height: {val}px)"
					else
						media = "(min-width: {val}px)"
				elif op == '<' or op == 'lte' or op == '!'
					if key == 'vh'
						media = "(max-height: {num - 1}px)"
					else
						media = "(max-width: {num - 1}px)"


			if name == 'media'
				media = "({mod.value})"
				
			if post == '~'
				# NOT IMPLEMENTED sibling selector modifier
				modTarget

			if media
				rule.media.push(media)
				# s1++ # media modifiers should  mimic attr specificity
				mod.remove = yes

			elif let alias = modifiers[mod.name]
				if alias.media
					rule.media.push(alias.media)
					mod.remove = yes
				if alias.ua
					# get or force-create html element
					addClass(getRootRule(rule),"ua-{alias.ua}")
					mod.remove = yes
					specificity++
				if alias.flag
					addClass(modTarget,alias.flag)
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
				forceLocal = no
				
			elif mod.name == 'off' or mod.name == 'out' or mod.name == 'in'
				mod.remove = yes
				addClass(modTarget,"_{mod.name}_")
				(ctx or rule).hasTransitionStyles = yes
				(ctx or rule)["_{mod.name}_"] = yes
				
			elif mod.name == 'deep'
				# TODO remove this -- supported with deep nesting operators
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

	let last = parts[parts.length - 1]

	let lastHasClasses = last.classNames.length > 0
	# see if we have classes at all
	let anyClasses = parts.some do $1.classNames.length > 0
	
	if scope and o.scoping
		addClass(scope,o.scoping)
	
	if forceLocal and localpart and o.ns
		# console.log 'only if there is a selector group that does not contain the scoper/scoping',parts.length
		if !localpart.isScope
			o.hasScopedStyles = true
			# The style is not local 
			addClass(localpart,o.ns)
	
	if o.scopeType == 'inline'
		s1 = 3
	elif (!localpart or localpart.isScope) and o.scopeType == 'tag'
		# console.log "no priority!"
		s1 = anyClasses ? 2 : 0
	elif o.scopeType == 'tree'
		if (!localpart or localpart.isScope)
			s1 = anyClasses ? 2 : 0
		elif lastHasClasses
			s1 = 2
		else
			console.log "does tree have classes?",rule
			s1 = 1
	else
		# what if we are inline?
		# what if it is an id?
		console.log "does tree have classes?",rule
		s1 = lastHasClasses ? 2 : 1

	# if pri = Math.max(o.priority or 0,pri)
	#	last.pri = pri
		
	# if o.rootFlag and last.classNames..indexOf(o.rootFlag) >= 0
	#	last.pri = Math.max(last.s0 or 0,o.rootPriority)

	if s0
		s1 += s0
	if true
		last.s0 = s1

	# if false
	#	last.s1 = s1
	
	# last.specify = specify
	# console.log 'specificity',calcSpecificity(rule),selparser.render(rule) # ,parts
	# rule.specificity = calcSpecificity(rule)
	# console.log rule,"{o.priority}"

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