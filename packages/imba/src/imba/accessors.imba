# imba$stdlib=1
# TODO Functions like this should be inlineable and not depend on the runtime
import {emit,listen} from './utils'

# T extends {$accessor: (...args: any[]) => infer X} ? X : T
# T extends {$accessor: (...args: any[]) => infer X} ? X : T
# export def accessor value, target, key, name, slot, context


### @ts
type AccessorLike<T> = T extends { $accessor: (...args:any[]) => any } ? T : {$accessor(...args:any[]):T,$function(...args:any[]):T}
###

# type AccessorLike<T> = T extends { $accessor: (...args:any[]) => any } ? T : {$accessor(...args:any[]):T}
# ($1 extends {$accessor: (...args: any[]) => infer X} ? X : $1) value\any, target\any?, key\any?, name\any?, slot\any?, context\any?,callback\any?

export def accessor<T>\AccessorLike<T> value\T, target\any?, key\any?, name\any?, slot\any?, context\any?

	if value and value.$accessor isa Function
		value = value.$accessor(target, key, name, slot, context)
	else
		# cache this by default?
		# must implement custom .accessor method to bypass
		context[slot] = value

	# if accessor has no init method - forward to accessor.set
	if value and !value..$init
		value.$init = value.$set or do yes
	return value


### @ts
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
type Descriptor<T> = {[K in keyof T]: IsFunction<T[K]> extends true ? T[K] : (arg?: T[K]) => void};
###

export def descriptor\Descriptor<$1> value
	return value

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