import fs from 'fs'

import { aliases as imba-to-css } from 'imba/compiler'

const css-to-imba = Object.fromEntries(Object.entries(imba-to-css).map(do([a,b]) [b,a]))

let input = fs.readFileSync(process.stdin.fd,'utf8')

const re-comments = /\/\*[\s\S]*?\*\//g

input = input.replaceAll(re-comments,'')
input = input.replaceAll(';','\n')

let lines = input.split '\n'
lines = lines.filter(do $1.trim!).map(do $1.trim!)

let styles = {}
for line in lines
	const re-colons = /\s*:\s*/
	let [key, val] = line.split(re-colons)
	styles[css-to-imba[key] or key] = val

if styles.d is 'flex' and styles.fld is 'row'
	delete styles.d
	delete styles.fld
	styles.d = 'hflex'

let ordering = '''

e us ws ol pe cursor zi pos

d fld ja jc ai fl

g
p px py pt pb pl pr
m mx my mt mb ml mr

w min-width max-width
h min-height max-height
s

c bg bgc

rd
bd

ff fw fs lh

'''

let out = ['css']
let temp

for line in ordering.split '\n\n'
	continue unless line.trim!
	let props = line.split /\s+/
	temp = []
	for prop in props
		if styles[prop]
			temp.push "{prop}:{styles[prop]}"
			delete styles[prop]
	if temp.length
		out.push temp.join(' ')

temp = []
for own key, val of styles
	temp.push "{key}:{val}"

out.push temp.join(' ')

console.log out.join("\n\t").trim!
