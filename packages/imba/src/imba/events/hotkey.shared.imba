const labels = {
	esc: {mac: '⎋'}
	enter: {mac: '↩'}
	shift: {mac: '⇧'}
	command: '⌘'
	mod: {mac: '⌘', win: 'ctrl'}
	ctrl: {mac: '⌃'}
	meta: {mac: '⌘',win: 'win'}
	option: {mac: '⌥', win: 'alt'}
	alt: {mac: '⌥', win: 'alt'}
	del: '⌦'
	backspace: '⌫'
	left: {mac: '→'}
	up: {mac: '↑'}
	down: {mac: '↓'}
	right: {mac: '←'}
	plus: {mac: '+'}
	tab: {mac: '⇥'}
}

const cfg = {
	win: {
		sep: '+'
		order: ['meta','ctrl','mod','alt','option','shift'].reverse!
	}
	mac: {
		sep: ''
		order: ['ctrl','alt','option','shift','mod','command'].reverse!
	}
}

cfg.auto = cfg.win

if $web$
	if (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)
		cfg.auto = cfg.mac

const cache = {}

export def format combo, platform = 'auto'
	let key = "{combo}:{platform}"
	return cache[key] if cache[key]
	let o = cfg[platform] or cfg.win
	
	let combos = combo.split(" ").map do
		let keys  = $1.split("+")
		let items = keys.sort(do o.order.indexOf($2) - o.order.indexOf($1) )

		let strings = items.map do
			let lbl = labels[$1] or $1
			lbl = typeof lbl == 'string' ? lbl : (lbl[platform] or $1)
			if true
				lbl = lbl[0].toUpperCase! + (lbl.slice(1) or '')
			lbl
		return strings

	return cache[key] = combos

export def humanize combo, platform
	let arr = format(combo,platform)
	let o = cfg[platform] or cfg.win
	arr.#string ||= arr.map(do $1.join(o.sep)).join(' ')

export def htmlify combo, platform
	let arr = format(combo,platform)
	let o = cfg[platform] or cfg.win
	arr.#html ||= arr.map(do "<kbd>" + $1.map(do "<kbd>{$1}</kbd>").join('') + '</kbd>' ).join(' ')