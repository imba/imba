export default {
	
	c: 'color',
	d: 'display',
	pos: 'position',
	
	// padding
	p: 'padding',
	pl: 'padding-left',
	pr: 'padding-right',
	pt: 'padding-top',
	pb: 'padding-bottom',
	px: 'padding-x',
	py: 'padding-y',
	
	// margins
	m: 'margin',
	ml: 'margin-left',
	mr: 'margin-right',
	mt: 'margin-top',
	mb: 'margin-bottom',
	mx: 'margin-x',
	my: 'margin-y',
	
	// add scroll snap shorthands?
	
	w: 'width',
	h: 'height',
	t: 'top',
	b: 'bottom',
	l: 'left',
	r: 'right',
	s: 'size',
	// size: ['width','height']
	
	// justify
	ji: 'justify-items',
	jc: 'justify-content',
	js: 'justify-self',
	j: ['justify-content','justify-items'],// Deprecate?
	
	// align
	ai: 'align-items',
	ac: 'align-content',
	as: 'align-self',
	a: ['align-content','align-items'],// Deprecate?
	
	// justify & align
	// To fit better with the spec - this ought to be
	jai: 'place-items',
	jac: 'place-content',
	jas: 'place-self',
	// ja: ['place-items','place-content']
	ja: 'justify-align',
	
	// consider using these instead
	// pi: 'place-items'
	// pc: 'place-content'
	// ps: 'place-self'
	// pa: 'place-all'
	
	// flex
	fl: 'flex',
	flf: 'flex-flow',
	fld: 'flex-direction',
	flb: 'flex-basis',
	flg: 'flex-grow',
	fls: 'flex-shrink',
	flw: 'flex-wrap',
	
	// fonts
	ff: 'font-family',
	fs: 'font-size',
	fw: 'font-weight',
	ts: 'text-shadow',// DEPCRATED - use for font-style instead?
	txs: 'text-shadow',
	
	// text-decoration
	td: 'text-decoration',
	tdl: 'text-decoration-line',
	tdc: 'text-decoration-color',
	tds: 'text-decoration-style',
	tdt: 'text-decoration-thickness',
	tdsi: 'text-decoration-skip-ink',
	
	// text-emphasis
	te: 'text-emphasis',
	tec: 'text-emphasis-color',
	tes: 'text-emphasis-style',
	tep: 'text-emphasis-position',
	tet: 'text-emphasis-thickness',
	
	// text
	tt: 'text-transform',
	ta: 'text-align',
	va: 'vertical-align',
	ls: 'letter-spacing',
	lh: 'line-height',
	
	// border
	bd: 'border',
	bdr: 'border-right',
	bdl: 'border-left',
	bdt: 'border-top',
	bdb: 'border-bottom',
	bdx: 'border-x',
	bdy: 'border-y',
	
	// border-style
	bs: 'border-style',
	bsr: 'border-right-style',
	bsl: 'border-left-style',
	bst: 'border-top-style',
	bsb: 'border-bottom-style',
	bsx: 'border-x-style',
	bsy: 'border-y-style',
	
	// border-width
	bw: 'border-width',
	bwr: 'border-right-width',
	bwl: 'border-left-width',
	bwt: 'border-top-width',
	bwb: 'border-bottom-width',
	bwx: 'border-x-width',
	bwy: 'border-y-width',
	
	// border-color
	bc: 'border-color',
	bcr: 'border-right-color',
	bcl: 'border-left-color',
	bct: 'border-top-color',
	bcb: 'border-bottom-color',
	bcx: 'border-x-color',
	bcy: 'border-y-color',
	
	// border-radius
	rd: 'border-radius',
	rdtl: 'border-top-left-radius',
	rdtr: 'border-top-right-radius',
	rdbl: 'border-bottom-left-radius',
	rdbr: 'border-bottom-right-radius',
	
	// TODO change these into a shared main one
	rdt: 'border-top-radius',
	rdb: 'border-bottom-radius',
	rdl: 'border-left-radius',
	rdr: 'border-right-radius',
	
	// background
	bg: 'background',
	bgp: 'background-position',
	bgc: 'background-color',
	bgr: 'background-repeat',
	bgi: 'background-image',
	bga: 'background-attachment',
	bgs: 'background-size',
	bgo: 'background-origin',
	bgclip: 'background-clip',
	
	// grid
	g: 'gap',
	rg: 'row-gap',
	cg: 'column-gap',
	gtr: 'grid-template-rows',
	gtc: 'grid-template-columns',
	gta: 'grid-template-areas',
	gar: 'grid-auto-rows',
	gac: 'grid-auto-columns',
	gaf: 'grid-auto-flow',
	gcg: 'grid-column-gap',
	grg: 'grid-row-gap',
	ga: 'grid-area',
	gr: 'grid-row',
	gc: 'grid-column',
	gt: 'grid-template',
	grs: 'grid-row-start',
	gcs: 'grid-column-start',
	gre: 'grid-row-end',
	gce: 'grid-column-end',
	
	// shadow
	shadow: 'box-shadow',// DEPRECATED
	bxs: 'box-shadow',
	
	// overflow
	of: 'overflow',
	ofx: 'overflow-x',
	ofy: 'overflow-y',
	ofa: 'overflow-anchor',
	
	// content
	prefix: 'content@before',
	suffix: 'content@after',
	
	// transforms
	x: 'x',
	y: 'y',
	z: 'z',
	rotate: 'rotate',
	scale: 'scale',
	'scale-x': 'scale-x',
	'scale-y': 'scale-y',
	'skew-x': 'skew-x',
	'skew-y': 'skew-y',
	origin: 'transform-origin',
	
	// others
	ws: 'white-space',
	zi: 'z-index',
	pe: 'pointer-events',
	us: 'user-select',
	o: 'opacity',
	tween: 'transition',
	
	// easing
	e: 'ease',// Deprecate
	
	ea: 'ease',
	ead: 'ease-all-duration',
	eaf: 'ease-all-function',
	eaw: 'ease-all-delay',
	
	eo: 'ease-opacity',
	eod: 'ease-opacity-duration',
	eof: 'ease-opacity-function',
	eow: 'ease-opacity-delay',
	
	ec: 'ease-colors',
	ecd: 'ease-colors-duration',
	ecf: 'ease-colors-function',
	ecw: 'ease-colors-delay',
	
	eb: 'ease-box',
	ebd: 'ease-box-duration',
	ebf: 'ease-box-function',
	ebw: 'ease-box-delay',
	
	et: 'ease-transform',
	etd: 'ease-transform-duration',
	etf: 'ease-transform-function',
	etw: 'ease-transform-delay',
	
	// outline
	ol: 'outline',
	olo: 'outline-offset',
	olc: 'outline-color',
	ols: 'outline-style',
	olw: 'outline-width'
};
