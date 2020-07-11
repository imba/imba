# var selparser = require('../../vendor/css-selector-parser')
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
	let number = 0
	
export def rewrite rule,ctx,o = {}
	
	
	if rule.type == 'selectors'
		for sel in rule.selectors
			rewrite(sel,rule,o)
			
	unless rule.type == 'ruleSet'
		return rule
		
	
	let root = rule
	let pri = 0
	let specificity = 0
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

	for part,i in parts
		let prev = parts[i - 1]
		let next = parts[i + 1]
		let flags = part.classNames ||= []
		let mods = part.pseudos or []
		let name = part.tagName
		let op = part.nestingOperator
		
		if op == '>>'
			localpart = prev
			part.nestingOperator = '>'
		elif op == '>>>'
			localpart = prev
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
				localpart = part
				pri = 1 if pri < 1
		
		if part.tagName
			specificity++
		
		# or non-local?
		if o.ns and (!next or next.nestingOperator == '>>>') and !localpart and !deeppart
			localpart = part

		specificity += part.classNames.length
		
		let modTarget = part
		
		for mod in mods when mod.special
			
			let [m,pre,name,post] = (mod.name.match(/^(\$|\.+|is-|up-)?([^\~\+]*)([\~\+]*)$/) or [])

			if pre == '.' or pre == 'is-'
				# console.log 'class mod!!',mod
				addClass(modTarget,name)
				mod.remove = yes
				specificity++
			
			elif pre == '..' or pre == 'up-'
				prev ||= root.rule = {type: 'rule',classNames:[],rule:root.rule}
				addClass(modTarget = prev,name)
				mod.remove = yes
				specificity++
				
			if post == '~'
				modTarget

			if let alias = modifiers[mod.name]
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
					mod.remove = yes

				unless mod.remove
					Object.assign(mod,alias)

			elif mod.name == 'local'
				mod.remove = yes
				o.hasScopedStyles = yes
				addClass(part,o.ns) if o.ns
				specificity++
				forceLocal = no
				
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
			
			if modTarget != part and !mod.remove
				addPseudo(modTarget,mod)
				mod.remove = yes
				specificity++
			elif !mod.remove
				specificity++

		part.pseudos = mods.filter do !$1.remove
	
	rule.specificity = specificity
	
	if forceLocal and localpart and o.ns
		o.hasScopedStyles = true
		addClass(localpart,o.ns)


	if pri = Math.max(o.priority or 0,pri)
		# let last = parts[parts.length - 1]
		parts[parts.length - 1].pri = pri
	return rule

export def render root, content, options = {}
	let group = ['']
	let groups = [group]
	let rules = root.selectors or [root]

	for rule in rules
		let sel = selparser.render(rule)
		let media = rule.media.length ? "@media {rule.media.join(' and ')}" : ''
		if media != group[0]
			groups.push(group = [media])
		
		group.push(sel)
		
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
	var sel = selparser.parse(str)
	console.log 'parsed',str,sel
	var options = {ns: 'dvs342'}
	var out = rewrite(sel,null,options)
	let css = render(out)
	console.log css
	if log
		console.dir sel,{ depth: null }
	return css

# test '.one:hover .test:hocus.test > again'
# test '.test@in-base div.one @focus @in-active @in-other @md'
# test '$editor @focus'
# test 'div@odd @md,li@even @lg,li @md @not-lg'
# test '@media only screen and (max-width: 600px)',true
# test '.one .test@in-active'
# test '.one@focus,.two@in-disabled'