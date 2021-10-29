const fs = require 'fs'
const path = require 'path'
import {colors,scopes,globals,vstheme,semanticColors} from '../themes/ImbaDark.imba'

def exportTmTheme
	let scheme = {
		name: "Imba Color Scheme"
		globals: globals
		rules: []
	}
	for scope in scopes
		let item = {
			name: scope[0]
			scope: scope[0]
		}

		if scope[1]
			if scope[1].background
				item.background = scope[1].background
			else
				item.foreground = scope[1]

		if scope[2]
			item.font_style = scope[2]
		scheme.rules.push(item)
	
	let text = JSON.stringify(scheme,null,2)
	let dest = path.join(__dirname,'..','Imba2.sublime-color-scheme')
	fs.writeFileSync(dest,text)
	
def exportVSCodeTheme
	let scheme = {
		name: "Imba Dark"
		type: "dark"
		base: "vs-dark"
		inherit: false
		semanticHighlighting: true
		semanticTokenColors: semanticColors
		
		tokenColors: []
		colors: vstheme
	}
	let rules = scheme.tokenColors
	for scope in scopes
		let style = scope[1]
		let item = {
			name: scope[0]
			scope: scope[0]
			settings: {}
		}
	
		if typeof style == 'string'
			style = {foreground: style}

		item.settings = style

		if scope[2]
			item.settings.fontStyle = scope[2]

		rules.push(item)
	
	let text = JSON.stringify(scheme,null,2)
	let dest = path.resolve(__realname,'..','..','themes','ImbaDark.json')
	fs.writeFileSync(dest,text)

# exportTmTheme()
exportVSCodeTheme()