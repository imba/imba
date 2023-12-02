export const __init__$  = Symbol.for('#__init__')
export const __initor__$	 = Symbol.for('#__initor__')
export const __inited__$	 = Symbol.for('#__inited__')
export const __hooks__$	 = Symbol.for('#__hooks__')
export const __patch__$	 = Symbol.for('#__patch__')
export const __has__$	 = Symbol.for('#has')
export const __meta__$	 = Symbol.for('#meta')
export const __imba__$	 = Symbol.for('imba')
export const __mixin__$	 = Symbol.for('#__mixin__')

export const matcher = Symbol.for('#matcher')

export const HAS = {
	DECORATORS: 1 << 0,
	ACCESSORS: 1 << 2,
	FIELDS: 1 << 3,
	CONSTRUCTOR: 1 << 4
}

const state = globalThis[__imba__$] ||= {
	counter: 0,
	classes: {}
};
const statics = new WeakMap;

const L = function(){ }

export function is$(a,b){
	return a === b || b?.[matcher]?.(a);
};

export function isa$(a,b){
	return (typeof b === 'string') ? (typeof a === b) : b?.[Symbol.hasInstance]?.(a);
};

export function has$(a,b){	
	return ((b?.[__has__$]?.(a) ?? b?.includes?.(a) ?? b?.has?.(a)) ?? false);
}

export function idx$(a,b){
	return b?.indexOf ? b.indexOf(a) : Array.prototype.indexOf.call(a,b);
}

export function statics$(scope){
	return statics.get(scope) || statics.set(scope,{}).get(scope);
}


// $1 extends {$accessor: (...args: any[]) => infer X} ? X : $1
export function iterable$(a){
	return a?.toIterable?.() || a;
}

export function decorate$(decorators,target,key,desc){
	let c = arguments.length;
	let r = (c < 3) ? target : (((desc === null) ? (desc = Object.getOwnPropertyDescriptor(target,key)) : desc));
	let d;
	
	let i = decorators.length;
	while (i > 0){
		if (d = decorators[--i]) {
			r = (c < 3 ? d(r) : (c > 3 ? d(target,key,r) : d(target,key))) || r;
		};
	};
	c > 3 && r && Object.defineProperty(target,key,r);
	return r;
}

function isSameDesc(a,b){
	if(!a || !b) return false;
	if(a.get) return b.get === a.get;
	if(a.set) return b.set === a.set;
	if(a.value) return a.value === b.value;
}

// Mixin support
export function extend$(target,ext,descs){
	const klass = target.constructor;
	descs ??= Object.getOwnPropertyDescriptors(ext);
	const originals = Object.getOwnPropertyDescriptors(target);

	delete descs.constructor;

	if (descs[__init__$]) {
		// Only with non descriptor fields
		// console.warn(`Cannot define plain fields when extending class ${klass.name}`);
		delete descs[__init__$];
	};

	Object.defineProperties(target,descs);

	let meta = klass[__meta__$];
	if(meta && meta.augments){
		for(let target of meta.augments){
			let current = Object.getOwnPropertyDescriptors(target.prototype);
			let defines = {}
			for(let key of Object.keys(descs)){
				let prop = descs[key];
				if(current[key] && !isSameDesc(originals[key],current[key])) console.warn('wont extend',key);
				else defines[key] = prop;
			}

			if(Object.keys(defines).length) extend$(target.prototype,null,defines)
			// Object.defineProperties(target.prototype,defines);
		}
	}

	return target;
}

export function augment$(klass,mixin,meta){
	meta ||= klass[__meta__$]
	let mix = mixin[__meta__$];
	
	meta.uses ||= []
	meta.inits ||= []

	if(mix.parent){
		if(!(klass.prototype instanceof mix.parent)){
			// For better error reports we could delay this message...
			throw new Error(`Mixin ${mix.name} has superclass not present in target class`);
		}
	}

	if(!mix.augments){
		// What if an inheritor of the mixin starts using this?
		mix.augments = new Set;
		let ref = mix.ref = Symbol();
		mixin.prototype[ref] = true;
		Object.defineProperty(mixin,Symbol.hasInstance,{
			value: function(rel) { return rel && !!rel[ref] }
		})
	}
	
	// klass already contains mixin somewhere in the chain
	if(klass.prototype[mix.ref]){
		return klass;
	}

	for(let v of (mix.uses || [])) {
		augment$(klass,v,meta);
	}

	// for(var k in mix){
	//	if(k.match(/^\d+$/)) augment$(klass,mix[k],meta);
	// }

	// Find the mixins for this klass as welll
	// meta[sym] = meta[mixmeta.id] = mixin;
	mix.augments.add(klass);
	meta.uses.push(mixin);

	let descs = Object.getOwnPropertyDescriptors(mixin.prototype);
	delete descs.constructor
	delete descs.name

	if(descs[__init__$]){
		meta.inits.push(mixin.prototype[__init__$]);
		delete descs[__init__$];
	}
	
	Object.defineProperties(klass.prototype,descs);
	// TODO Should also run a method / trigger a hook
	meta.top.version++;
	return klass;
};

export function multi$(symbol,sup,...mixins){	
	let Mixins = sup ? (class extends sup {}) : (class {});
	let meta = Mixins[__meta__$] = meta$(sup,symbol);
	meta.parent = sup || false;

	// When looping over the mixins - ensure that they are not also
	for(let mixin of mixins){
		augment$(Mixins,mixin,meta);
	}	

	Mixins.prototype[symbol] = function(o,deep,fields) {
		// Anything that is inherited through the superclass should not count?
		if(meta.inits)
			for(let init of meta.inits){ init.call(this,o,false,fields) }
		return
	};
	
	return Mixins
};
export const mixes = multi$;

function meta$(up,symbol) {
	let mup = up && up[__meta__$] || null;
	if(mup?.symbol == symbol) return mup;
	// Store using weakprop?
	let meta = Object.create(mup)
	meta.top ||= {version: 0}
	meta.parent = null
	meta.own = {}
	meta.up = mup
	meta.symbol = symbol
	meta.augments = null
	meta.inits = null
	meta.uses = null
	meta.top[symbol] = meta
	return meta
}

export function register$(klass,symbol,name,flags) {
	// Look for the actual superclass excluding mixins
	let supr = Object.getPrototypeOf(klass.prototype)?.constructor;
	let meta = klass[__meta__$] = meta$(supr,symbol);
	// (smeta?.symbol == symbol) ? smeta : Object.create(supr[__meta__$] || null);

	if(meta.parent)
		supr = meta.parent

	// Override name of class
	if(klass.name !== name && name){
		Object.defineProperty(klass,"name",{value: name,configurable: true})
	}
	// What if this is an extension instead?
	meta.id = state.counter++;
	meta.parent = supr;
	meta.flags = flags;
	meta.name = klass.name;
	meta.symbol = symbol;
	let own = meta[symbol] ||= {};
	own.parent ??= supr;
	meta.top.version++;
	// Call inherited?

	if(flags & HAS.CONSTRUCTOR)
		klass.prototype[__initor__$] = symbol;

	if(supr?.inherited instanceof Function) supr.inherited(klass)
	return klass;
}

export function inited$(obj,symbol){
	if(obj[__initor__$]===symbol){
		// init potential hooks
		obj[__inited__$]?.();
		obj[__hooks__$]&&obj[__hooks__$].inited(obj);
	}
}
