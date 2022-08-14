import {hooks} from './hooks'
import {once,emit,listen} from './utils'
import {scheduler,commit} from './scheduler'
import {Node} from './dom/core'

const F = {
	TOUCHING: 1 << 1
	STALE: 1 << 2
	OBJECT: 1 << 3
	RUNNING: 1 << 4
	INVALIDATING: 1 << 5
	POSSIBLY_STALE: 1 << 6
	AUTORUN: 1 << 7
}

let TRACKING = 0
let ACTIVATED = no
let V = 0
let RUN_ID = 0
let NEXT_REF_ID = 1

const MAPS = {
	META: new Map
	VALUE: new Map
	REF: new Map
}
const OWNREF = Symbol.for("~")
const METAREF = Symbol.for("~~")

const SymbolForSymbol = do(sym,map)
	map.set(sym,Symbol!) unless map.has(sym)
	return map.get(sym) 
		
const VALUESYM = do(name)
	typeof name == 'symbol' ? SymbolForSymbol(name,MAPS.VALUE) : Symbol.for(name)

const METASYM = do(name)
	typeof name == 'symbol' ? SymbolForSymbol(name,MAPS.META) : Symbol.for("#{name}__")
	
const REFSYM = do(name)
	typeof name == 'symbol' ? SymbolForSymbol(name,MAPS.REF) : Symbol.for("~{name}")

const OBSERVED = do(item,res)
	CTX.add(item[OWNREF]) if TRACKING
	return res

const CHANGED = do(item,res)
	item[OWNREF].invalidated(0)
	return res

const REFERENCED = do(item,ref,extensions)
	let beacon = item[OWNREF]
	unless beacon
		beacon = item[OWNREF] = new Ref(F.OBJECT)
		Object.defineProperties(item,extensions)
	beacon.addSubscriber(ref) if ref
	return item

const DEREFERENCED = do(item,ref)
	let beacon = item[OWNREF]
	if beacon
		beacon.removeSubscriber(ref)
	return item


class ArrayPatcher
	def constructor array
		changes = new Map
		cleanup!
		reset(array) if array

	def reset array = []
		array = array
		initialLength = array.length

	def cleanup
		idx = 0
		array = null	
		changes.clear!
		dirty = no

	def push item
		if initialLength == 0
			unless array.indexOf(item) >= 0
				changes.set(item,1)
				array.push(item)
				idx++
			return

		let toReplace = array[idx]

		# this only works if things are supposed to go in an array once
		if toReplace === item
			++idx
		else
			let prevIndex = array.indexOf(item)
			let changed = changes.get(item)

			if prevIndex === -1
				array.splice(idx,0,item)
				changes.set(item,1)
				idx++

			elif prevIndex === idx + 1
				# if the last one is simply removed
				if toReplace
					changes.set(toReplace,-1)
				array.splice(idx,1)
				++idx
			elif prevIndex < idx
				return
			else
				if prevIndex > idx
					array.splice(prevIndex,1)
				array.splice(idx,0,item)

			if changed == -1
				changes.delete(item)

	def end
		if array.length >= idx
			while array.length > idx
				changes.set(array.pop!,-1)
		return array

	def patch
		end!

def getExtensions obj
	let descriptors = Object.getOwnPropertyDescriptors(obj.prototype)
	delete descriptors.name
	delete descriptors.constructor
	return descriptors

def activateHooks
	return unless ACTIVATED =? yes

	hooks.on('inited') do(instance)
		let meta = instance[METAREF]
		if meta
			let istag = instance isa Node
			let obj = instance[OWNREF] ||= {}
			for own k,v of meta
				let reaction = obj[k] = new Reaction(instance[k],instance,v)
				reaction.call! unless istag

			if istag
				listen(instance,'mount') do
					for item in Object.values(obj)
						item.activate! if item isa Reaction

				listen(instance,'unmount') do
					for item in Object.values(obj)
						item.deactivate! if item isa Reaction
		return

def getSchema target, typ = METAREF
	if !target.hasOwnProperty(typ)
		target[typ] = Object.assign({},target[typ] or {})
	return target[typ]

class Context
	def constructor up, depth = 0
		depth = depth
		parent = up
		target = null
		patcher = new ArrayPatcher

	get active?
		CTX == self

	get root?
		self == ROOT

	def reset item
		tracking = yes
		target = item
		beacon = item.beacon
		patcher.reset(item.observing ||= []) # nah to the action
		return self

	def add beacon
		patcher.push(beacon) if tracking and beacon

	def react reaction
		ROOT.reactions.add(reaction)

	def push item
		CTX = child.reset(item)

	def pop
		let res = null
		if beacon
			res = patcher.end!
			let diff = patcher.changes
			let changes = diff.size
			
			if changes
				
				for [item,op] of diff
					if op === 1
						item.addSubscriber(beacon)
					else
						item.removeSubscriber(beacon)

		# should also clear patcher etc due to memory leaks?
		patcher.cleanup!
		target = beacon = null
		CTX = parent
		if CTX == ROOT
			ROOT.flush!
		return res

	get child
		#child ||= new Context(self,depth + 1)

	get reactions
		#reactions ||= new Set

	def flush
		return unless #reactions
		let items = #reactions
		#reactions = null
		for reaction of items
			reaction.call!
		return


class Root < Context

	def add
		yes

let CTX = new Root(null,0)
let ROOT = CTX

let REACT = do
	CTX.tracking = no

let GET = do(target,key,vsym,meta,bsym)
	let val = target[vsym]
	let beacon = target[bsym]

	unless beacon
		beacon = target[bsym] = new Ref(0,meta,val,key)

	CTX.add(beacon,target)
	return val

let SET = do(target,key,vsym,value,meta,bsym)
	let prev = target[vsym]

	if value != prev
		target[vsym] = value
		let beacon = target[bsym]
		beacon.changed(0,value,prev) if beacon

	return

class Ref

	def constructor kind, type, val, name
		id = NEXT_REF_ID++
		observer = null
		observers = null
		# name = name

		val.##referenced(self) if val and val.##referenced
		return self

	def changed level, newValue,oldValue
		RUN_ID++
		# mixing responsibilities with deep observers?
		oldValue.##dereferenced(self,newValue) if oldValue and oldValue.##dereferenced
		newValue.##referenced(self,oldValue) if newValue and newValue.##referenced

		# change is only called here?
		observer.invalidated(level + 1,this,newValue,oldValue) if observer

		if observers
			for observer in observers
				observer.invalidated(level + 1,this,newValue,oldValue)

		if CTX == ROOT
			CTX.flush!
		return

	def invalidated level, source
		observer.invalidated(level + 1,this) if observer

		if observers
			for observer in observers
				observer.invalidated(level + 1,this)
		
		if level == 0 and CTX == ROOT
			CTX.flush!
		yes

	def addSubscriber item
		unless observer
			observer = item
		else
			observers ||= []
			observers.push(item)
		return

	def removeSubscriber item
		if observer == item
			return observer = null

		let obs = observers
		let idx = obs.indexOf(item)
		if idx >= 0
			obs.splice(idx,1)
		return

	def reportChanged
		changed(0)

	def reportObserved
		CTX.add(this)

export def createAtom name
	new Ref(null,null,null,name)

###
Array
###
class ObservableArray < Array

	def push do CHANGED(this,super)
	def pop do CHANGED(this,super)
	def unshift do CHANGED(this,super)
	def shift do CHANGED(this,super)
	def splice do CHANGED(this,super)
	def at do OBSERVED(this,super)
	def map do OBSERVED(this,super)
	def flatMap do OBSERVED(this,super)
	def flat do OBSERVED(this,super)
	def filter do OBSERVED(this,super)
	def find do OBSERVED(this,super)
	def slice do OBSERVED(this,super)
	def sort do OBSERVED(this,super)
	
	get len do OBSERVED(this,length)

	set len value
		length = value
		CHANGED(this)

	def toIterable
		CTX.add(self[OWNREF]) if TRACKING
		return self

	def [Symbol.iterator]
		OBSERVED(this,super)

const ArrayExtensions = getExtensions(ObservableArray)

extend class Array

	get len
		length

	set len value
		length = value

	get ##reactive do REFERENCED(this,null,ArrayExtensions)
	def ##referenced ref do REFERENCED(this,ref,ArrayExtensions)
	def ##dereferenced ref do DEREFERENCED(this,ref)

###
Set
###
class ObservableSet < Set
	def has do OBSERVED(this,super)
	def keys do OBSERVED(this,super)
	def values do OBSERVED(this,super)
	def entries do OBSERVED(this,super)

	def add do CHANGED(this,super)
	def clear do CHANGED(this,super)
	def delete do CHANGED(this,super)

const SetExtensions = getExtensions(ObservableSet)

extend class Set
	get ##reactive do REFERENCED(this,null,SetExtensions)
	def ##referenced ref do REFERENCED(this,ref,SetExtensions)
	def ##dereferenced ref do DEREFERENCED(this,ref)

###
Map
###
class ObservableMap < Map
	def get do OBSERVED(this,super)
	def has do OBSERVED(this,super)
	def keys do OBSERVED(this,super)
	def values do OBSERVED(this,super)
	def entries do OBSERVED(this,super)

	def set do CHANGED(this,super)
	def clear do CHANGED(this,super)
	def delete do CHANGED(this,super)

const MapExtensions = getExtensions(ObservableMap)

extend class Map
	get ##reactive do REFERENCED(this,null,MapExtensions)
	def ##referenced ref do REFERENCED(this,ref,MapExtensions)
	def ##dereferenced ref do DEREFERENCED(this,ref)



class PropertyType
	def constructor name,options = {}
		self.name = name
		self.options = options
		const vkey = self.key = VALUESYM(name)
		const bkey = REFSYM(name)

		let descriptor = self.descriptor = {
			enumerable: options.enumerable ?? yes
			configurable: no
			get: do TRACKING ? GET(this,name,vkey,self,bkey) : this[vkey]
			set: do(value)
				(TRACKING or !!this[bkey]) ? SET(this,name,vkey,value,self,bkey) : (this[vkey] = value)
		}

		let lazy = self.lazyDescriptor = {
			enumerable: no
			configurable: yes
			get: do
				if TRACKING
					Object.defineProperty(this,name,descriptor)
					return this[name]
				# not if this is the prototype
				return this[vkey]

			set: do(value)
				this[vkey] = value
				this[bkey] = null
				Object.defineProperty(this,name,descriptor)
				# this[bkey] = (value and value.##referenced) ? new Ref(0,self,value) : null
		}

class RefIndex
	#map = new Map

	def for value
		let res = #map.get(value)
		#map.set(value,res=[]) unless res
		res

	def get value
		let res = self.for(value)
		let beacon = res[OWNREF]
		res.##reactive unless beacon
		OBSERVED(res) if TRACKING
		return res

	def add key, member
		self.for(key).push(member)
	
	def delete key, member
		let arr = self.for(key)
		let idx = arr.indexOf(member)
		arr.splice(idx,1)
		return

class RefType

	def constructor name,vkey
		self.name = name
		self.key = vkey
		self.index = new RefIndex

		const bkey = REFSYM(name)

		let descriptor = self.descriptor = {
			enumerable: yes
			configurable: no
			get: do TRACKING ? GET(this,name,vkey,self,bkey) : this[vkey]
			set: do(value)
				let prev = this[vkey]
				(TRACKING or !!this[bkey]) ? SET(this,name,vkey,value,self,bkey) : (this[vkey] = value)
				if prev != value
					index.delete(prev,this) if prev
					index.add(value,this) if value
		}

		let lazy = self.lazyDescriptor = {
			set: do(value)
				this[vkey] = value
				index.add(value,this) if value
				Object.defineProperty(this,name,descriptor)
				this[bkey] = null
				# (value and value.##referenced) ? new Ref(0,self,value) : null
		}

	def where value
		index.get(value)

# why not inherit from beacon?
class Memo
	def constructor target,func,vkey
		self.observing = null
		self.observers = null
		self.flags = 68
		self.target = target
		self.func = func
		self.vkey = vkey
		self.version = 0
		# global.ops.push(self)
		
	get beacon
		self

	def addSubscriber item
		unless observer
			observer = item
		else
			observers ||= []
			observers.push(item)
		return

	def removeSubscriber item
		if observer == item
			return observer = null

		let obs = observers
		let idx = obs.indexOf(self)
		if idx >= 0
			obs.splice(idx,1)
		return

	def invalidated stack, source
		flags |= F.STALE | F.POSSIBLY_STALE
		observer.invalidated(stack,this) if observer

		return unless observers
		for observer in observers
			# these are never - they are always computeds
			observer.invalidated(stack,this)
		self
	

	def value
		CTX.add(self) if TRACKING

		if flags !& F.POSSIBLY_STALE
			return target[vkey]

		TRACKING++
		flags |= F.RUNNING
		CTX.push(self)
		let res = func.call(target)
		CTX.pop(self)
		let prev = target[vkey]
		target[vkey] = res
		flags ~= (F.STALE | F.POSSIBLY_STALE | F.RUNNING)
		if res !== prev
			self.version++
		TRACKING--
		return res

class ComputedType
	def constructor name,func
		self.name = name
		const bkey = REFSYM(name)
		const vkey = VALUESYM(name)

		# could use weakmap for a bit nicer structure I guess.
		const descriptor = self.descriptor = {
			enumerable: no
			configurable: no
			get: do this[bkey].value!
		}

		const lazy = self.lazyDescriptor = {
			enumerable: no
			get: do
				let wrapper = this[bkey] = new Memo(this,func,vkey)
				Object.defineProperty(this,name,descriptor)
				wrapper.value!
		}

class Reaction

	get beacon
		self

	def constructor cb, context, options = {}
		cb = cb
		context = context
		options = options
		flags = 0
		id = NEXT_REF_ID++
		cachedComputedVersions = new WeakMap
		checkComputedValues = new Set
		observing = []
		timeout = null

	get running?
		flags & F.RUNNING

	def invalidated stack,source
		if source isa Memo
			flags |= F.POSSIBLY_STALE
			checkComputedValues.add(source)
		else
			flags |= F.STALE

		CTX.react(self)

	def activate
		observing = []
		cachedComputedVersions = new WeakMap
		checkComputedValues = new Set
		call!
		self
	
	def deactivate
		clearTimeout(timeout) if timeout
		if observing
			for item in observing
				item.removeSubscriber(self)
		observing = checkComputedValues = cachedComputedVersions = null
		self

	def call
		if TRACKING
			# only do this to detect infinite loops somehow?
			console.warn 'should not call reaction inside an autorunning context?'
			# this shouldnt _always_ be the case though?
			# return

		if flags & F.POSSIBLY_STALE and flags !& F.STALE
			let stale = no
			for value of checkComputedValues
				let v0 = cachedComputedVersions.get(value)
				value.value!	
				let v1 = value.version
				if v0 != v1
					break stale = yes
				
			unless stale
				flags ~= F.POSSIBLY_STALE
				checkComputedValues.clear!
				return

		if options.delay
			clearTimeout(timeout)
			let num = options.delay
			num = 1000 if typeof num != 'number'
			timeout = setTimeout(&,num) do run!
			return

		return run!

	def run
		TRACKING++
		flags |= F.RUNNING
		let ctx = CTX.push(self)
		# let stop
		let res = cb.call(context,REACT)
		let beacons = CTX.pop(self)

		self.observing = beacons

		checkComputedValues.clear!
		for item in beacons when item isa Memo
			cachedComputedVersions.set(item,item.version)

		flags ~= (F.RUNNING | F.STALE | F.POSSIBLY_STALE)
		TRACKING--
		commit! if $web$ and !options.silent
		return res

	def dispose
		deactivate!
		cb = context = options = null
		self

class Action

	def constructor cb, context
		context = context
		cb = cb

	def run ctx = context, args = []
		CTX.push(self)
		let res = cb.apply(ctx,args)
		CTX.pop(self)
		return res

export def autorun cb, options = {}
	let reaction = new Reaction(cb,global,options)
	reaction.call!
	return reaction

export def observable object
	object.##reactive

export def run cb
	let action = new Action(cb,global)
	return action.run!


export def reportChanged item
	if item and item[OWNREF]
		item[OWNREF].invalidated(0)
	return item

export def reportObserved item
	if item and item[OWNREF]
		item[OWNREF].reportObserved()
	return item


export def @computed target, name, desc
	let sym = METASYM(name)
	let field = target[sym] = new ComputedType(name,desc.get)
	return field.lazyDescriptor

export def @observable target, key, desc
	let sym = METASYM(key)
	let vsym = VALUESYM(key)
	let opts = this[0] or {}
	let field = target[sym] = new PropertyType(key,opts)

	if desc
		Object.defineProperty(target,vsym,Object.assign({},desc))
		return field.lazyDescriptor

	Object.defineProperty(target,key,field.lazyDescriptor)
	return null

export def @ref target, name, desc
	let sym = METASYM(name)
	target.constructor[name]
	let field = target[sym] = new RefType(name,VALUESYM(name))
	return field.lazyDescriptor

export def @autorun target, key, desc
	let schema = getSchema(target)
	let options = this[0] or {}
	options.flags = F.AUTORUN
	activateHooks!
	schema[key] = options
	return desc

export def @action target, key, desc
	if desc.value
		let action = new Action(desc.value,null)
		desc.value = do action.run(this,arguments)
	return desc

