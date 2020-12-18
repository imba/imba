const descriptorCache = {}

import {SVGElement} from './dom'

def getDescriptor item,key,cache
	if !item
		return cache[key] = null

	if cache[key] !== undefined
		return cache[key]
	
	let desc = Object.getOwnPropertyDescriptor(item,key)

	if desc !== undefined or item == SVGElement
		return cache[key] = desc or null

	getDescriptor(Reflect.getPrototypeOf(item),key,cache)

extend class SVGElement
	
	def set$ key,value
		let cache = descriptorCache[nodeName] ||= {}
		let desc = getDescriptor(this,key,cache)

		if !desc or !desc.set
			setAttribute(key,value)
		else
			self[key] = value
		return

export def createSVGElement one, two, three
	self