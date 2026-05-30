function iter$__(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : a; };;
function negIndex$__(value,index){ return value[value.length + index] };;
// @ts-ignore
function is$(a,b){ return a === b || b?.[$matcher$]?.(a) || false}
const $matcher$ = Symbol.for('#matcher'), $rules$ = Symbol.for('#rules'), $string$ = Symbol.for('#string'), $media$ = Symbol.for('#media'), $container$ = Symbol.for('#container');

/*body*/
// imba$stdlib=1
import * as selparser from '../../vendor/css-selector-parser.mjs';
import {modifiers} from './theme.mjs';

function addClass(rule,name){
	// TODO check for negs as well?
	rule.unshift({flag: name});
	// rule.classNames ||= []
	// if rule.classNames.indexOf(name) == -1
	// 	rule.classNames.push(name)
	return rule;
};

function addScopeClass(rule,name){
	addClass(rule,name);
	rule.metas ||= [];
	rule.metas.push(name);
	return rule;
};

function addPseudo(rule,pseudo){
	rule.pseudos ||= [];
	if (typeof pseudo == 'string') {
		pseudo = {name: pseudo};
	};
	
	rule.pseudos.push(pseudo);
	return rule;
};

function addIs(rule,raw){
	return addPseudo(rule,{name: 'is',valueType: 'raw',value: raw});
};

function addNot(rule,raw){
	return addPseudo(rule,{name: 'not',valueType: 'raw',value: raw});
};

function getRootRule(ruleset,force){
	let rule = ruleset.rule;
	let root;
	
	if (!rule.isRoot) {
		rule = ruleset.rule = Object.assign([],{type: 'rule',rule: rule,isRoot: true});
	};
	
	return rule;
};

function addRootClass(ruleset,name){
	addClass(getRootRule(ruleset),name);
	return ruleset;
};

function cloneRule(rule){
	return JSON.parse(JSON.stringify(rule));
};

export function rewrite(rule,ctx,o = {}){
	if (rule.type == 'selectors') {
		for (let $1 = 0, $2 = iter$__(rule.selectors), $3 = $2.length; $1 < $3; $1++) {
			let sel = $2[$1];
			rewrite(sel,rule,o);
		};
	};
	
	if (rule.type != 'ruleSet') {
		return rule;
	};
	
	let root = rule;
	let pri = 0;
	
	let s0 = 0;
	let s1 = 0;
	let s2 = 0;
	
	rule.meta = {};
	rule.scopeTo = null;
	rule.media = [];
	rule.container = [];
	// just has a bunch of rules
	
	let parts = [];
	
	let curr = rule.rule;
	
	while (curr){
		parts.push(curr);
		curr = curr.rule;
	};
	
	let rev = parts.slice(0).reverse();
	
	for (let i = 0, $4 = iter$__(rev), $7 = $4.length; i < $7; i++) {
		let part = $4[i];
		let next = rev[i + 1];
		for (let pi = 0, $5 = iter$__(part), $6 = $5.length; pi < $6; pi++) {
			let item = $5[pi];
			if (item.up > 0 && next) {
				item.up -= 1;
				next.push(item);
				part[pi] = {};
			};
		};
	};
	
	let container = parts[0];
	let localpart = null;
	let deeppart = null;
	let escaped = false;
	let seenDeepOperator = !!o.global;
	let hasOffStates = false;
	let importance = 0;
	
	// only if we are scoped in somewhere
	if (parts[0]?.tagName == '*') { // and o.scope
		parts[0].nestingOperator = '>>>';
		let base = parts[0];
		
		if (parts[0].length == 0 && parts[1]) {
			base = parts[1];
			base.nestingOperator = '>>>';
		};
		
		parts.unshift(rule.rule = Object.assign([],{type: 'rule',rule: base,isScope: true,nestingOperator: '>>>'}));
	};
	
	// for part
	
	for (let i = 0, $8 = iter$__(parts), $14 = $8.length; i < $14; i++) {
		let part = $8[i];
		let prev = parts[i - 1];
		let next = parts[i + 1];
		let name = part.tagName;
		let items = part.slice(0);
		
		
		let op = part.op = part.nestingOperator;
		
		if (name == '*') {
			// Should only happen if we are scoped inside
			if (items.length == 0 && next && prev && !seenDeepOperator) {
				prev.rule = next;
				next.op = next.nestingOperator = '>>>';
			};
			
			localpart ||= prev;
			escaped ||= part;
			seenDeepOperator = true;
			part.op = '>>>';
		};
		
		if (i == 0 && !name && !op && (part[0]?.pseudo || part[0]?.implicitScope)) {
			part.implicitScope = true;
		};
		
		if (op == '>>') {
			localpart = prev;
			escaped = part;
			part.nestingOperator = '>';
			seenDeepOperator = true;
		} else if (op == '>>>') {
			localpart = prev;
			escaped = part;
			part.nestingOperator = null;
			seenDeepOperator = true;
		};
		
		if (!seenDeepOperator) {
			part.isScoped = true;
		};
		
		if (name == 'html') {
			part.isRoot = true;
		};
		
		// TODO fix this
		if (items.some(function(_0) { return _0.pseudo == 'root'; })) {
			part.isRoot = true;
		};
		
		if (name == 'self' || part.isScope) {
			for (let $9 = 0, $10 = iter$__(parts.slice(0,i)), $11 = $10.length; $9 < $11; $9++) {
				let prev = $10[$9];
				prev.isScoped = false;
			};
			
			part.isScope = true;
			part.isScoped = false;
			part.tagName = null;
		};
		
		if (name == 'body' || name == 'html') {
			part.isScoped = false;
		};
		
		// or non-local?
		if (o.ns && (!next || next.nestingOperator == '>>>') && !localpart && !deeppart) {
			if (part.isScope || true) {
				localpart = part;
			};
		};
		
		for (let mi = 0, $12 = iter$__(items), $13 = $12.length, m, cls; mi < $13; mi++) {
			let mod = $12[mi];
			let name = mod.pseudo;
			let meta = modifiers[mod.pseudo];
			let mqcheck = /^(\!)?(\d+)([a-z]+)?$/;
			
			
			if (m = name?.match?.(mqcheck)) {
				// let [m,neg,num,typ] = name.match(mqcheck)
				let num = parseInt(m[2]);
				if (m[1] == '!') { mod.not = !mod.not };
				let kind = {
					w: 'width',
					h: 'height',
					'': 'width'
				}[m[3] || ''];
				
				
				let cond = mod.not ? (("(max-" + kind + ": " + (num - 1) + "px)")) : (("(min-" + kind + ": " + num + "px)"));
				if (mod.closest) {
					mod.container = cond;
				} else {
					mod.media = cond;
				};
			};
			
			if (name == 'scoped') {
				try {
					cls = o.scope.cssid();
				} catch (e) { };
				
				mod.pseudo = null;
				let rest = [];
				while (negIndex$__(part,-1) != mod){
					rest.unshift(part.pop());
				};
				
				rule.scopeFrom = parts.slice(0,i + 1);
				rule.scopeTo = (`.` + cls);
				seenDeepOperator = true;
				rule.rule = [{pseudo: 'scope'}].concat(rest);
				rule.rule.type = 'rule';
				rule.rule.rule = next;
			};
			
			if (name == 'scope-to') {
				mod.scopeTo = mod.value;
				mod.pseudo = null;
				let rest = [];
				while (negIndex$__(part,-1) != mod){
					rest.unshift(part.pop());
				};
				
				rule.scopeFrom = parts.slice(0,i + 1);
				rule.scopeTo = mod.value;
				rule.rule = [{pseudo: 'scope'}].concat(rest);
				rule.rule.type = 'rule';
				rule.rule.rule = next;
			};
			
			
			
			if (name == 'important' || name == 'force') {
				mod.pseudo = null;
				mod.important = true;
				importance += 1;
				true;
			};
			
			if (meta?.scrollstate) {
				mod.container = meta.scrollstate;
			};
			
			if (meta?.media) {
				if (mod.not) {
					if (meta.medianeg) {
						mod.media = meta.medianeg;
					};
				} else {
					mod.media = meta.media;
				};
			};
			
			if (meta?.container) {
				if (mod.not) {
					if (meta.containerneg) {
						mod.container = meta.containerneg;
					};
				} else {
					mod.container = meta.media;
				};
			};
			
			if (mod.pseudo == 'media') {
				mod.media = ("(" + (mod.value) + ")");
			};
			
			if (name == 'local') {
				mod.remove = true;
				o.hasScopedStyles = true;
				if (o.ns) { addClass(part,o.ns) };
			} else if (name == 'off' || name == 'out' || name == 'in') {
				hasOffStates = true;
				(ctx || rule).hasTransitionStyles = true;
				(ctx || rule)[("_" + name + "_")] = true;
			} else if (mod.name == 'enter' || mod.name == 'leave') {
				(ctx || rule)[("_" + name + "_")] = true;
			};
			
			if (mod.media) {
				rule.media.push(mod.media);
			};
			
			if (mod.container) {
				rule.container.push(mod.container);
			};
			
			if ((is$(name,'odd')) || (is$(name,'even'))) {
				Object.assign(mod,meta);
			};
		};
	};
	
	// Now inject scope class names etc
	let last = parts[parts.length - 1];
	let scope = parts.find(function(_0) { return _0.isScope; });
	
	if (!scope && (o.id || parts[0].nestingOperator || parts[0].tagName == '*')) {
		let idx = parts.findIndex(function(_0) { return _0.isScoped; });
		let parent = (0 >= idx) ? rule : parts[idx - 1];
		scope = parent.rule = Object.assign([],{isScope: true,rule: parts[idx],type: 'rule'});
	};
	
	if (!scope && parts[0].implicitScope) {
		parts[0].isScope = true;
		scope = parts[0];
		scope.isScoped = false;
	};
	
	for (let $15 = 0, $16 = iter$__(parts), $17 = $16.length; $15 < $17; $15++) {
		let part = $16[$15];
		if (part.isScoped && o.scope) {
			let ns = o.scope.cssns();
			addScopeClass(part,ns);
		};
	};
	
	if (scope && o.scope) {
		if (!scope.length && scope != last && scope == parts[0] && !o.id && (!scope.rule || !scope.rule.op)) {
			true;// no need to scope this?
		} else {
			let id = o.id || (o.scope.cssid ? o.scope.cssid() : o.scope.cssns());
			addScopeClass(scope,id);
		};
	};
	
	// Calculate what specificity to add
	// Because we need to work around
	
	let s4 = 0;
	
	for (let $18 = 0, $19 = iter$__(parts), $20 = $19.length; $18 < $20; $18++) {
		let part = $19[$18];
		if (part.isScope) { continue; };
		let mlen = part.metas?.length || 0;
		if (!mlen && (part.length)) { s4 += 1 };
	};
	
	if (s4 > 1) {
		s4 = 1;
	};
	
	s2 = s4;
	
	if (o.inline) {
		s1 = 3;
		s2 = 0;
	};
	
	if (o.type == 'component') {
		s1 = last.isScope ? 0 : 1;
	};
	
	if (o.type == 'scoped') {
		s1 = last.isScope ? 2 : 1;
	};
	
	// styles for the @off/@out/@in conditions should always take precedence
	if (hasOffStates) {
		s1 = 4;
	};
	
	s1 += importance;
	
	if (true && o.respecify !== false) {
		last.s1 = Math.max(s0,s1);
		last.s2 = s2;
	};
	
	if (o.respecify === false) {
		last.s1 = last.s2 = 0;
	};
	
	return rule;
};

export function layerize(root,options = {}){
	let group = [[]];
	let groups = [group];
	let rules = root.selectors || [root];
	
	root[$rules$] = [];
	
	for (let $21 = 0, $22 = iter$__(rules), $25 = $22.length; $21 < $25; $21++) {
		let rule = $22[$21];
		let ctx = {
			media: '',
			scopeFrom: null,
			scopeTo: null,
			container: null
		};
		let sel = selparser.render(rule,ctx);
		rule[$string$] = sel;
		
		let nestings = [];
		
		if (ctx.scopeTo) {
			let str = (`@scope (` + (ctx.scopeFrom) + `) to (` + (ctx.scopeTo) + `)`);
			nestings.push(str);
		};
		
		if (ctx.media) {
			let str = '@media ' + ctx.media.join(' and ');
			nestings.push(rule[$media$] = str);
		};
		
		if (ctx.container) {
			let str = (`@container ` + ctx.container.join(' and '));
			rule[$container$] = str;
			nestings.push(str);
		};
		
		for (let i = 0, $23 = iter$__(nestings), $24 = $23.length; i < $24; i++) {
			let nesting = $23[i];
			if (group[0][i] != nesting) {
				groups.push(group = [nestings]);
				break;
			};
		};
		
		group.push(sel);
		root[$rules$].push(rule);
	};
	
	return groups;
};

export function render(root,content,options = {},stack = {}){
	let groups = layerize(root,options);
	
	let out = [];
	let indent = stack.indent || '';
	let ind = indent;
	for (let $26 = 0, $27 = iter$__(groups), $30 = $27.length; $26 < $30; $26++) {
		let [scopes,...sels] = $27[$26];
		if (sels.length == 0) { continue; };
		let sel = sels.join(',') + ' {$CONTENT$}';
		
		for (let i = 0, $28 = iter$__(scopes.toReversed()), $29 = $28.length; i < $29; i++) {
			let scope = $28[i];
			ind += '\t';
			// sel = ind + scope + '{\n' + sel + '\n' + ind + '}'
			sel = scope + '{ ' + sel + ' }';
		};
		
		out.push(sel);
	};
	
	return out.join('\n').replace(/\$CONTENT\$/g,content + indent);
};

export function unwrap(parent,subsel){
	let pars = parent.split(',');
	let subs = subsel.split(',');
	
	let sels = [];
	
	for (let $31 = 0, $32 = iter$__(subs), $36 = $32.length; $31 < $36; $31++) {
		let sub = $32[$31];
		for (let $33 = 0, $34 = iter$__(pars), $35 = $34.length; $33 < $35; $33++) {
			let par = $34[$33];
			let sel = sub;
			if (sel.indexOf('&') >= 0) {
				sel = sel.replace('&',par);
			} else {
				sel = par + ' ' + sel;
			};
			sels.push(sel);
		};
	};
	
	return sels.join(',');
};

export function parse(str,options){
	let sel = selparser.parse(str,options);
	let out = sel && rewrite(sel,null,options);
	return out;
};

export function test(str,log = false){
	let sel = selparser.parse(str);
	let options = {ns: 'dvs342'};
	let out = rewrite(sel,null,options);
	let style = render(out);
	console.log(style);
	if (log) {
		console.dir(sel,{depth: null});
	};
	return style;
};

// test '.one:hover .test:hocus.test > again'
// test '.test@in-base div.one @focus @in-active @in-other @md'
// test '$editor @focus'
// test 'div@odd @md,li@even @lg,li @md @not-lg'
// test '@media only screen and (max-width: 600px)',true
// test '.one .test@in-active'
// test '.one@focus,.two@in-disabled'
