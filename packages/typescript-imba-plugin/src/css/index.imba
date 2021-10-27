import * as data from './data.json'

import {aliases,StyleTheme} from 'imba/src/compiler/styler'

export const properties = {}

export class CSSProperty
	
	static def get key
		properties[key]

	name\string
	values\any[]

for entry in data.properties
	entry.fullName = entry.name
	properties[entry.name] = new CSSProperty(entry)
	properties[entry.name] = entry
	
	
	
	
for own k,v of aliases
	let defn = {
		name: k,
		shortName: k,
		custom: yes,
		expanded:v,
		alias:yes
	}
	unless v isa Array
		defn.fullName = v

		if let orig = properties[v]
			defn = Object.assign(alias: yes,expanded: orig.name,orig)
			defn.name = k
			orig.shortName = k
	else
		let origs = v.map do properties[$1]
		defn.expanded = origs.map(do $1.name).join(" & ")
	if defn
		properties[k] = defn

export const CSSProperties = []

for own k,v of properties
	let item = {
		label: {name: k}
		insertText: v.shortName or v.fullName
		kind: 'cssprop'
		commitCharacters: ['@',':']
		sortText: v.alias ? "-{k}" : k.replace(/^\-/,'Z')
		documentation: v.description
		filterText: v.fullName
	}
	CSSProperties.push(item)