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
const L = Symbol.for('#L');

export const appendChild$	 = Symbol.for('#appendChild')
export const afterVisit$	 = Symbol.for('#afterVisit')
export const beforeReconcile$	 = Symbol.for('#beforeReconcile')
export const afterReconcile$	 = Symbol.for('#afterReconcile')
export const up$	 = Symbol.for('##up')

export const HAS = {
	SUPERCALLS: 1 << 3,
	CONSTRUCTOR: 1 << 4
}

export const ClassFlags = {
	IsExtension: 1 << 0,
	IsTag: 1 << 1,
	HasDescriptors: 1 << 2,
	HasSuperCalls: 1 << 3,
	HasConstructor: 1 << 4,
	HasFields: 1 << 5,
	HasMixins: 1 << 6,
	HasInitor: 1 << 7,
	HasDecorators: 1 << 8,
	IsObjectExtension: 1 << 9,
	IsMixin: 1 << 10
}

const mmap = new Map;

const state = globalThis[__imba__$] ||= {
	counter: 0,
	classes: mmap
};

function meta$(klass,defaults = {}){
	mmap.has(klass) || mmap.set(klass,{
		symbol: Symbol(klass.name),
		parent: Object.getPrototypeOf(klass.prototype)?.constructor,
		for:klass,
		uses:null,
		inits:null,
		id: state.counter++,
		...defaults
	});
	return mmap.get(klass)
}

const statics = new WeakMap;

export function is$(a,b){
	return a == b || b?.[matcher]?.(a);
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

export function devlog$(args,self,...rest){
	if(self && self[L] instanceof Function) args = self[L](args,self,...rest)
	else if(globalThis[L] instanceof Function) args = globalThis[L](args,self,...rest)
	// final / main rewriter here?
	return args;
}

export function statics$(scope){
	return statics.get(scope) || statics.set(scope,{}).get(scope);
}

// $1 extends {$accessor: (...args: any[]) => infer X} ? X : $1
export function iterable$(a){
	return a?.toIterable?.() || a;
}

export function decorate$(ds,t,k,desc){
	let d,c = arguments.length,i = ds.length;
	let r = (c < 3) ? t : (((desc === null) ? (desc = Object.getOwnPropertyDescriptor(t,k)) : desc));
	while (i > 0){
		if (d = ds[--i]) { r = (c < 3 ? d(r) : (c > 3 ? d(t,k,r) : d(t,k))) || r };
	};
	c > 3 && r && Object.defineProperty(t,k,r);
	return r;
}

function isSameDesc(a,b){
	if(!a || !b) return false;
	if(a.get) return b.get === a.get;
	if(a.set) return b.set === a.set;
	if(a.value) return a.value === b.value;
}

export function extend$(target,ext,descs,cache = {}){
	const klass = target.constructor;

	if(!descs && ext){
		descs = Object.getOwnPropertyDescriptors(ext);
		delete descs.constructor;

		if (descs[__init__$]) {
			console.warn(`Cannot define plain fields when extending class ${klass.name}`);
			delete descs[__init__$];
		};
	}

	let meta = meta$(klass);

	if(meta && meta.augments){
		// If the receiving class is mixed into other classes
		const map = new Map;

		for(let key of Object.keys(descs)){
			// Could use caching here
			let orig = Object.getOwnPropertyDescriptor(target,key);

			for(let augmented of meta.augments){
				let defines = map.get(augmented);
				defines || map.set(augmented,defines = {});
				// let current = Object.getOwnPropertyDescriptors(augmented.prototype);
				let augmentedKey = Object.getOwnPropertyDescriptor(augmented.prototype,key)
				// Check if the augmented klass still had the same descriptor
				// let original = Object.getOwnPropertyDescriptor(target,key);
				if(augmentedKey && !isSameDesc(orig,augmentedKey)) console.warn('wont extend',key,augmentedKey,orig);
				else defines[key] = descs[key];
			}
		}

		for(let [augmented,defines] of map){
			if(Object.keys(defines).length) extend$(augmented.prototype,null,defines);
		}
	}

	Object.defineProperties(target,descs);

	return target;
}



export function augment$(klass,mixin){
	let meta = meta$(klass);
	let mix = meta$(mixin);
	let par = mix.parent;
	
	while(par && meta$(par)?.flags & ClassFlags.IsMixin) {
		augment$(klass,par);
		par = null;
		break;
		// par = meta$(par).parent
	}
	
	if(par && !(klass.prototype instanceof par)){
		// For better error reports we could delay this message...
		// console.log(klass.prototype,mix.parent,klass.prototype.constructor,mix,meta)
		throw new Error(`Mixin ${mixin.name} has superclass not present in target class`);
	}

	if(!mix.augments){
		mix.augments = new Set;

		// Define hasInstance on mixin so you can do object isa MyMixin
		const ref = mix.ref = Symbol(mixin.name);
		const native = Object[Symbol.hasInstance];
		mixin.prototype[ref] = true;
		Object.defineProperty(mixin,Symbol.hasInstance,{
			value: function(rel) { return (this === mixin) ? (rel && !!rel[ref]) : native.call(this,rel) }
		})
	}
	
	// klass already contains mixin somewhere in the chain
	if(klass.prototype[mix.ref]){
		return klass;
	}

	// If the mixin itself has mixins, mix those in first
	if(mix.uses) {
		for(let v of mix.uses) augment$(klass,v);
	}

	mix.augments.add(klass);
	meta.uses ||= [];
	meta.uses.push(mixin);

	let descs = Object.getOwnPropertyDescriptors(mixin.prototype);
	delete descs.constructor

	if(descs[__init__$]){
		meta.inits ||= []
		meta.inits.push(mixin.prototype[__init__$]);
		delete descs[__init__$];
	}

	Object.defineProperties(klass.prototype,descs);
	// TODO Should also run a method / trigger a hook
	// try { meta.top.version++; } catch(e) { }

	if(mixin?.mixed instanceof Function) mixin.mixed(klass)
	
	return klass;
};

export function multi$(symbol,sup,...mixins){	
	// Creating a mixins class for this
	let Mixins = sup ? (class extends sup {}) : (class {});
	let meta = meta$(Mixins,{symbol});
	
	// Mixing in each mixin into the base class
	for(let mixin of mixins) augment$(Mixins,mixin);

	Mixins.prototype[symbol] = function(o,deep,fields) {
		if(meta.inits)
			for(let init of meta.inits){ init.call(this,o,false,fields) }
		return
	};
	
	return Mixins
};

let sup = {
	cache: {},
	self: null,
	target: null,
	proxy: new Proxy({},{
		apply: (_, thisArg, args) => {
			return Reflect.apply(sup.target, thisArg, args)
		},
		get: (_, key) => {
			let val = Reflect.get(sup.target, key, sup.self);
			if(val instanceof Function) return val.bind(sup.self);
			return val;
		},
		set: (_, key, value, receiver) => {
			return Reflect.set(sup.target, key, value, sup.self);
		}
	})
}

export function sup$(self,symbol) {
	sup.self = self;
	sup.target = sup.cache[symbol];
	return sup.proxy;
}

export function register$(klass,symbol,name,flags,into = null) {
	
	// Look for the actual superclass excluding mixins
	let proto = Object.getPrototypeOf(klass.prototype)
	let mixed = (flags & (ClassFlags.HasMixins | ClassFlags.IsExtension)) == ClassFlags.HasMixins;
	let meta
	if(mixed) {
		mmap.set(klass,mmap.get(proto.constructor))
		proto = Object.getPrototypeOf(proto)
	}

	if(into){
		let target = flags & ClassFlags.IsObjectExtension ? into : into.prototype;
		let meta = meta$(klass); // Does this make sense?
		
		if(meta.uses){
			if(into === target) console.warn("Cannot extend object with mixins");
			for(let mixin of meta.uses) augment$(into,mixin);
		}
		// Create fake super now
		if(flags & ClassFlags.HasSuperCalls){
			sup.cache[symbol] = Object.create(
				Object.getPrototypeOf(target),
				Object.getOwnPropertyDescriptors(target)
			)
		}

		extend$(target,klass.prototype);
		return into;
	}

	let supr = proto?.constructor;
	meta = meta$(klass,{symbol})

	// All classes defined in imba get the Class.meta getter to access metadata for class
	Object.defineProperty(klass,__meta__$,{value: meta, enumerable: false, configurable: true})

	// Override name of class
	if(name && klass.name !== name){
		Object.defineProperty(klass,"name",{value: name,configurable: true})
	}
	meta.flags = flags;

	if(flags & ClassFlags.HasConstructor)
		klass.prototype[__initor__$] = symbol;

	if(meta.uses) for(let mixin of meta.uses) mixin.mixes?.(klass)

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
