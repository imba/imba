# TODO Functions like this should be inlineable and not depend on the runtime
import {emit,listen} from './utils'

export def accessor value, target, key, name, slot, context
	if value and value.$accessor isa Function
		value = value.$accessor(target, key, name, slot, context)
	else
		# cache this by default?
		# must implement custom .accessor method to bypass
		context[slot] = value

	# if accessor has no init method - forward to accessor.set
	if value and !value.$init
		value.$init = value.$set or do yes
	return value

export def descriptor context, value, args = []
	return new value(...args) if value.prototype 
	return value.apply(context,args)


export class Accessor
	
	# Store in localStorage - if target has unique `id`
	local = no

	# Store in sessionStorage - if target has unique `id`
	session = no

	# Store in separate weakmap
	weak = no

	def watch cb
		(#watchers ||= []).push(cb)

	def $get target, key
		target[key]

	def $set value, target, key, name
		if #watchers
			let prev = self.$get(target,key,name)
			if prev != value
				target[key] = value
				for watcher,i in #watchers
					let res = watcher.call(target,value,prev,self)
		else
			target[key] = value
		return

	# by default we are caching the @prop descriptor
	# so that it is only created once for all instances of a class
	def $accessor target, key, name, slot, context
		# finalize it now - or stay slow?
		context[slot] = self

export def @prop
	return new Accessor