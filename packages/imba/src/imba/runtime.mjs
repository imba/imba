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
	IsObjectExtension: 1 << 9
}

const mmap = new Map;

const state = globalThis[__imba__$] ||= {
	counter: 0,
	classes: mmap
};

function meta$(klass,defaults = {}){
	mmap.has(klass) || mmap.set(klass,{
		symbol: Symbol(),
		parent: Object.getPrototypeOf(klass.prototype)?.constructor,
		for:klass,
		uses:[],
		inits:[],
		id: state.counter++,
		...defaults
	});
	return mmap.get(klass)
}

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

export function extend$(target,ext,descs){
	const klass = target.constructor;
	descs ??= Object.getOwnPropertyDescriptors(ext);
	const originals = Object.getOwnPropertyDescriptors(target);
	delete descs.constructor;

	if (descs[__init__$]) {
		// console.warn(`Cannot define plain fields when extending class ${klass.name}`);
		delete descs[__init__$];
	};

	Object.defineProperties(target,descs);

	let meta = meta$(klass);
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
		}
	}

	return target;
}



export function augment$(klass,mixin){
	let meta = meta$(klass);
	let mix = meta$(mixin);
	
	if(mix.parent){
		if(!(klass.prototype instanceof mix.parent)){
			// For better error reports we could delay this message...
			throw new Error(`Mixin ${mix.name} has superclass not present in target class`);
		}
	}

	if(!mix.augments){
		mix.augments = new Set;
		const ref = mix.ref = Symbol();
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

	for(let v of mix.uses) augment$(klass,v,meta);

	mix.augments.add(klass);
	meta.uses.push(mixin);

	let descs = Object.getOwnPropertyDescriptors(mixin.prototype);
	delete descs.constructor

	if(descs[__init__$]){
		meta.inits.push(mixin.prototype[__init__$]);
		delete descs[__init__$];
	}

	Object.defineProperties(klass.prototype,descs);
	// TODO Should also run a method / trigger a hook
	try { meta.top.version++; } catch(e) { }
	return klass;
};

export function multi$(symbol,sup,...mixins){	
	let Mixins = sup ? (class extends sup {}) : (class {});
	let meta = meta$(Mixins,{symbol});

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
		apply: (_, key, ...params) => {
			return sup.target[key].apply(sup.self, params)
		},
		get: (_, key) => {
			return Reflect.get(sup.target, key, sup.self);
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
	if(flags & ClassFlags.HasMixins) {
		mmap.set(klass,mmap.get(proto.constructor))
		proto = Object.getPrototypeOf(proto)
	}

	if(into){
		let target = flags & ClassFlags.IsObjectExtension ? into : into.prototype;
		let meta = meta$(klass);

		if(meta.uses?.length){
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
	let meta = meta$(klass,{symbol})

	// Override name of class
	if(name && klass.name !== name){
		Object.defineProperty(klass,"name",{value: name,configurable: true})
	}
	meta.flags = flags;

	if(flags & ClassFlags.HasConstructor)
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
