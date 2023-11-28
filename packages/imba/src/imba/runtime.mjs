export const __init__ = Symbol.for('#__init__')
export const __initor__ = Symbol.for('#__initor__')
export const __inited__ = Symbol.for('#__inited__')
export const __hooks__ = Symbol.for('#__hooks__')
export const __patch__ = Symbol.for('#__patch__')
export const __has__ = Symbol.for('#has')
export const __meta__ = Symbol.for('#meta')
export const __imba__ = Symbol.for('imba')
export const __mixin__ = Symbol.for('#__mixin__')
export const matcher = Symbol.for('#matcher')
const state = globalThis[__imba__] ||= {counter: 0};
const statics = new WeakMap;

const L = function(){ }

export function is$(a,b){
	return a === b || b?.[matcher]?.(a);
};

export function isa$(a,b){
	return (typeof b === 'string') ? (typeof a === b) : b?.[Symbol.hasInstance]?.(a);
};

export function has$(a,b){	
	return ((b?.[__has__]?.(a) ?? b?.includes?.(a) ?? b?.has?.(a)) ?? false);
}

export function idx$(a,b){
	return b?.indexOf ? b.indexOf(a) : Array.prototype.indexOf.call(a,b);
}

export function statics$(scope){
	return statics.get(scope) || statics.set(scope,{}).get(scope);
}

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

export function register$(klass,symbol,name) {
	
	let supr = Object.getPrototypeOf(klass.prototype)?.constructor;
	let smeta = supr[__meta__];
	let meta = klass[__meta__] = (smeta?.symbol == symbol) ? smeta : Object.create(supr[__meta__] || null);

	// Override name of class
	if(klass.name !== name && name){
		Object.defineProperty(klass,"name",{value: name,configurable: true})
	}
	// What if this is an extension instead?
	meta.id = state.counter++;
	meta.name = klass.name;
	meta.symbol = symbol;
	let own = meta[symbol] ||= {};
	own.parent ??= supr;

	// Call inherited?
	if(supr?.inherited instanceof Function) supr.inherited(klass)
	return klass;
}

// Mixin support
export function extend$(target,ext){
	const klass = target.constructor;
	const descs = Object.getOwnPropertyDescriptors(ext);
	delete descs.constructor;

	if (descs[__init__]) {
		// Only with non descriptor fields
		// console.warn(`Cannot define plain fields when extending class ${klass.name}`);
		delete descs[__init__];
	};

	Object.defineProperties(target,descs);

	let meta = klass[__meta__];
	if(meta){
		let own = meta[meta.symbol];
		if(own.augments){
			for(let target of own.augments){
				Object.defineProperties(target.prototype,descs);
			}
		}
	}

	return target;
}

export function augment$(klass,mixin,meta){
	meta ||= klass[__meta__]
	let mixmeta = mixin[__meta__];
	let sym = mixmeta.symbol;
	let mixown = mixmeta[sym];

	let own = meta[meta.symbol] ||= {}
	own.uses ||= []
	own.inits ||= []

	if(mixown.parent){
		if(!(klass.prototype instanceof mixown.parent)){
			// For better error reports we could delay this message...
			throw new Error(`Mixin ${mixmeta.name} has superclass not present in target class`);
		}
	}

	if(!mixown.augments){
		// What if an inheritor of the mixin starts using this?
		mixown.augments = new Set;
		let ref = mixown.ref = Symbol();
		mixin.prototype[ref] = true;
		Object.defineProperty(mixin,Symbol.hasInstance,{
			value: function(rel) { return rel && !!rel[ref] }
		})
	}

	if(meta[mixmeta.symbol]){
		return klass;
	}

	// TODO Check the order of these
	for(var k in mixmeta){
		if(k.match(/^\d+$/)) augment$(klass,mixmeta[k],meta);
	}

	// Find the mixins for this klass as welll
	meta[sym] = meta[mixmeta.id] = mixin;
	mixown.augments.add(klass);
	own.uses.push(mixin);

	let descs = Object.getOwnPropertyDescriptors(mixin.prototype);
	delete descs.constructor
	delete descs.name

	if(descs[__init__]){
		own.inits.push(mixin.prototype[__init__]);
		delete descs[__init__];
	}
	
	Object.defineProperties(klass.prototype,descs);
	// TODO Should also run a method / trigger a hook
	return klass;
};

export function multi$(symbol,sup,...mixins){	
	let Mixins = sup ? (class extends sup {}) : (class {});

	let meta = Mixins[__meta__] = Object.create(sup && sup[__meta__] || null);
	let own = meta[symbol] ||= {};
	let last = null;

	meta.symbol = symbol;
	own.parent = sup || false;

	// When looping over the mixins - ensure that they are not also
	for(let mixin of mixins){
		if(last) Mixins = class extends last {}
		augment$(Mixins,mixin,meta);
		last = Mixins;
	}	

	Mixins.prototype[symbol] = function(o,deep,fields) {
		// Anything that is inherited through the superclass should not count?
		for(let init of own.inits){ init.call(this,o,false,fields) }
		return
	};
	
	return Mixins
};
export const mixes = multi$;