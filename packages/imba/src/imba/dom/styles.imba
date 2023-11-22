# imba$stdlib=1
# imba$imbaPath=global

import {Element} from './core'

const VALID_CSS_UNITS = {
	cm:1
	mm:1
	Q:1
	pc:1
	pt:1
	px:1
	em:1
	ex:1
	ch:1
	rem:1
	vw:1
	vh:1
	vmin:1
	vmax:1
	s:1
	ms:1
	fr:1
	'%':1
	'in':1
	turn:1
	grad:1
	rad:1
	deg:1
	Hz:1
	kHz:1
}

const CSS_DEFAULT_UNITS = {
	x:'px'
	y:'px'
	z:'px'
	rotate:'turn'
}

const CSS_STR_PROPS = {
	prefix:1
	suffix:1
	content:1
}

# hsl map of colors for runtime css coloring
const CSS_COLORS = {
	rose:      [[356,100,97],[356,100,95],[353,96,90],[353,96,82],[351,95,71],[350,89,60],[347,77,50],[345,83,41],[343,80,35],[342,75,30]]
	pink:      [[327,73,97],[326,78,95],[326,85,90],[327,87,82],[329,86,70],[330,81,60],[333,71,51],[335,78,42],[336,74,35],[336,69,30]]
	fuchsia:   [[289,100,98],[287,100,95],[288,96,91],[291,93,83],[292,91,73],[292,84,61],[293,69,49],[295,72,40],[295,70,33],[297,64,28]]
	purple:    [[270,100,98],[269,100,95],[269,100,92],[269,97,85],[270,95,75],[271,91,65],[271,81,56],[272,72,47],[273,67,39],[274,66,32]]
	violet:    [[250,100,98],[251,91,95],[251,95,92],[252,95,85],[255,92,76],[258,90,66],[262,83,58],[263,70,50],[263,69,42],[264,67,35]]
	indigo:    [[226,100,97],[226,100,94],[228,96,89],[230,94,82],[234,89,74],[239,84,67],[243,75,59],[245,58,51],[244,55,41],[242,47,34]]
	blue:      [[214,100,97],[214,95,93],[213,97,87],[212,96,78],[213,94,68],[217,91,60],[221,83,53],[224,76,48],[226,71,40],[224,64,33]]
	sky: [[204,100,97],[204,94,94],[201,94,86],[199,95,74],[198,93,60],[199,89,48],[200,98,39],[201,96,32],[201,90,27],[202,80,24]]
	cyan:      [[183,100,96],[185,96,90],[186,94,82],[187,92,69],[188,86,53],[189,94,43],[192,91,36],[193,82,31],[194,70,27],[196,64,24]]
	teal:      [[166,76,97],[167,85,89],[168,84,78],[171,77,64],[172,66,50],[173,80,40],[175,84,32],[175,77,26],[176,69,22],[176,61,19]]
	emerald:   [[152,81,96],[149,80,90],[152,76,80],[156,72,67],[158,64,52],[160,84,39],[161,94,30],[163,94,24],[163,88,20],[164,86,16]]
	green:     [[138,76,97],[141,84,93],[141,79,85],[142,77,73],[142,69,58],[142,71,45],[142,76,36],[142,72,29],[143,64,24],[144,61,20]]
	lime:      [[78,92,95],[80,89,89],[81,88,80],[82,85,67],[83,78,55],[84,81,44],[85,85,35],[86,78,27],[86,69,23],[88,61,20]]
	yellow:    [[55,92,95],[55,97,88],[53,98,77],[50,98,64],[48,96,53],[45,93,47],[41,96,40],[35,92,33],[32,81,29],[28,73,26]]
	amber:     [[48,100,96],[48,96,89],[48,97,77],[46,97,65],[43,96,56],[38,92,50],[32,95,44],[26,90,37],[23,83,31],[22,78,26]]
	orange:    [[33,100,96],[34,100,92],[32,98,83],[31,97,72],[27,96,61],[25,95,53],[21,90,48],[17,88,40],[15,79,34],[15,75,28]]
	red:       [[0,86,97],[0,93,94],[0,96,89],[0,94,82],[0,91,71],[0,84,60],[0,72,51],[0,74,42],[0,70,35],[0,63,31]]
	warmer:  [[60,9,98],[60,5,96],[20,6,90],[24,6,83],[24,5,64],[25,5,45],[33,5,32],[30,6,25],[12,6,15],[24,10,10]]
	warm:  [[0,0,98],[0,0,96],[0,0,90],[0,0,83],[0,0,64],[0,0,45],[0,0,32],[0,0,25],[0,0,15],[0,0,9]]
	gray:      [[0,0,98],[240,5,96],[240,6,90],[240,5,84],[240,5,65],[240,4,46],[240,5,34],[240,5,26],[240,4,16],[240,6,10]]
	cool:  [[210,20,98],[220,14,96],[220,13,91],[216,12,84],[218,11,65],[220,9,46],[215,14,34],[217,19,27],[215,28,17],[221,39,11]]
	cooler:  [[210,40,98],[210,40,96],[214,32,91],[213,27,84],[215,20,65],[215,16,47],[215,19,35],[215,25,27],[217,33,17],[222,47,11]]

}

const CSS_COLORS_REGEX = new RegExp("^({Object.keys(CSS_COLORS).join('|')})(\\d+(?:\\.\\d+)?)$")

const CSS_PX_PROPS = /^([xyz])$/
const CSS_DIM_PROPS = /^([tlbr]|size|[whtlbr]|[mps][tlbrxy]?|[rcxy]?[gs])$/

const resets = '''*,::before,::after {
	box-sizing: border-box;
	border-width: 0;
	border-style: solid;
	border-color: currentColor;
}'''

class Styles
	entries = {}

	def register id, styles
		let entry = entries[id]

		if !entry
			entry = entries[id] = {sourceId: id, css: styles}

			if !entries.resets
				register('resets',resets)

			if $web$
				entry.node = document.createElement('style')
				entry.node.setAttribute('data-id',id)
				entry.node.textContent = entry.css
				document.head.appendChild(entry.node)

		elif entry
			# if it was already registered - we update the content
			# and on the web – replace the actual styles
			entry.css = styles
			if entry.node
				entry.node.textContent = styles
		return

	def toString
		Object.values(entries).map(do $1.css).join('\n\n')

	def toValue value, unit, key, param = null
		if CSS_STR_PROPS[key]
			value = String(value)

		let typ = typeof value

		if typ == 'number'
			if !unit
				if CSS_PX_PROPS.test(key)
					unit = 'px'
				elif CSS_DIM_PROPS.test(key)
					unit = 'u'
				elif key == 'rotate'
					unit = 'turn'
					value = (value % 1).toFixed(4)

			if unit
				if VALID_CSS_UNITS[unit]
					# what if the unit is already set?
					return value + unit
				elif unit == 'u'
					return value * 4 + 'px'
				else
					return "calc(var(--u_{unit},1px) * {value})"
			else
				yes

		elif typ == 'string'
			if key and CSS_STR_PROPS[key] and value[0] != '"' and value[0] != "'"
				if value.indexOf('"') >= 0
					if value.indexOf("'") == -1
						value = "'" + value + "'"
					else
						no # do something here
				else
					value = '"' + value + '"'

			if let colormatch = value.match(CSS_COLORS_REGEX)
				let color = CSS_COLORS[colormatch[1]]
				let level = color[parseInt(colormatch[2])]
				let a = '100%'
				if typeof param == 'number'
					a = param + '%'
				elif typeof param == 'string'
					a = param
				if level
					return "hsla({level[0]},{level[1]}%,{level[2]}%,{a})"

		elif value and value.toStyleString isa Function
			return value.toStyleString!
		return value

	def parseDimension val
		if typeof val == 'string'
			let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/)
			return [parseFloat(num),unit]
		elif typeof val == 'number'
			return [val]

export const styles = new Styles
export const colors = Object.keys(CSS_COLORS)

export def use_styles
	global.imba.uses_styles = yes
	yes

extend class Element
	def css$ key, value, mods
		self.style[key] = value

	def css$var name, value, unit, key, param = null
		let cssval = styles.toValue(value,unit,key,param)
		self.style.setProperty(name,cssval)
		return
