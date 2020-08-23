export const fonts =
	sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
	serif: 'Georgia, Cambria, "Times New Roman", Times, serif'
	mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

export const modifiers =
	
	odd: {name: 'nth-child', valueType: 'string',value: 'odd'}
	even: {name: 'nth-child', valueType: 'string',value: 'even'}
	first: {name: 'first-child'}
	last: {name: 'last-child'}
	only: {name: 'only-child'}
	'not-first': {name: 'not', valueType: 'raw',value: ':first-child'}
	'not-last': {name: 'not', valueType: 'raw',value: ':last-child'}
	
	active: {}
	checked: {}
	default: {}
	defined: {}
	disabled: {}
	empty: {}
	enabled: {}
	'first-of-type': {}
	'first-page': {name: 'first'}
	fullscreen: {}
	focus: {}
	focin: {name: 'focus-within'}
	'focus-within': {}
	hover: {}
	indeterminate: {}
	'in-range': {}
	invalid: {}
	is: {type: 'selector'}
	lang: {}
	'last-of-type': {}
	left: {}
	link: {}
	not: {type: 'selector'}
	'nth-child': {}
	'nth-last-child': {}
	'nth-last-of-type': {}
	'nth-of-type': {}
	'only-child': {}
	'only-of-type': {}
	optional: {}
	'out-of-range': {}
	'placeholder-shown': {}
	'read-only': {}
	'read-write': {}
	required: {}
	right: {}
	scope: {}
	root: {}
	# state: {}
	target: {}
	'target-within': {}
	valid: {}
	visited: {}
	where: {}
	
	after: {type:'el'}
	backdrop: {type:'el'}
	before: {type:'el'}
	cue: {type:'el'}
	'cue-region': {type:'el'}
	'first-letter': {type:'el'}
	'first-line': {type:'el'}
	marker: {type:'el'}
	placeholder: {type:'el'}
	selection: {type:'el'}
	
	
	# all the native pseudo classes
	force: {pri: 3}
	
	print: {media: 'print'}
	screen: {media: 'screen'}
	
	xs: {media: '(min-width: 480px)' }
	sm: {media: '(min-width: 640px)' }
	md: {media: '(min-width: 768px)' }
	lg: {media: '(min-width: 1024px)' }
	xl: {media: '(min-width: 1280px)' }
	'lt-xs': {media: '(max-width: 479px)' }
	'lt-sm': {media: '(max-width: 639px)' }
	'lt-md': {media: '(max-width: 767px)' }
	'lt-lg': {media: '(max-width: 1023px)' }
	'lt-xl': {media: '(max-width: 1279px)' }

	landscape: {media: '(orientation: landscape)'}
	portrait: {media: '(orientation: portrait)'}
	
	dark: {media: '(prefers-color-scheme: dark)'}
	light: {media: '(prefers-color-scheme: light)'}
	
	mac: {ua: 'mac'}
	ios: {ua: 'ios'}
	win: {ua: 'win'}
	android: {ua: 'android'}
	linux: {ua: 'linux'}
	
	ie: {ua: 'ie'}
	chrome: {ua: 'chrome'}
	safari: {ua: 'safari'}
	firefox: {ua: 'firefox'}
	opera: {ua: 'opera'}
	blink: {ua: 'blink'}
	webkit: {ua: 'webkit'}
	
	touch: {flag: '_touch_'}
	move: {flag: '_move_'}
	hold: {flag: '_hold_'}

# some things should definitely move out of theme
export const variants =
	radius:
		full: '9999px'
		xxs: '1px',
		xs: '2px',
		sm: '3px',
		md: '4px',
		lg: '6px',
		xl: '8px',
		NUMBER: '2px'
	
	sizing:
		NUMBER: '0.25rem'
		
	letter-spacing:
		NUMBER: '0.05em'

	font-size:
		'xxs': ['10px',1.5]
		'xs':  ['12px',1.5]
		'sm-':  ['13px',1.5]
		'sm':  ['14px',1.5]
		'md-':  ['15px',1.5]
		'md':  ['16px',1.5]
		# 'lg-':  ['17px',1.5]
		'lg':  ['18px',1.5]
		'xl':  ['20px',1.5]
		'2xl': ['24px',1.5]
		'3xl': ['30px',1.5]
		'4xl': ['36px',1.5]
		'5xl': ['48px',1.5]
		'6xl': ['64px',1.5]

		'1':  ['10px',1.5]
		'2':  ['12px',1.5]
		'3':  ['13px',1.5]
		'4':  ['14px',1.5]
		'5':  ['15px',1.5]
		'6':  ['16px',1.5]
		'7':  ['17px',1.5]
		'8':  ['18px',1.5]
		'9':  ['19px',1.5]
		'10': ['20px',1.5]
		'11': ['24px',1.4]
		'12': ['30px',1.3]
		'13': ['36px',1.3]
		'14': ['48px',1.2]
		'15': ['64px',1.2]
		'16': ['96px',1.2]

	'box-shadow':
		xxs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
		xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		'2xl': '0 25px 50px -6px rgba(0, 0, 0, 0.25)',
		inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
		outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
		none: 'none'

	easings:
		"sine-in": "cubic-bezier(0.47, 0, 0.745, 0.715)",
		"sine-out": "cubic-bezier(0.39, 0.575, 0.565, 1)",
		"sine-in-out": "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
		"quad-in": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
		"quad-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
		"quad-in-out": "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		"cubic-in": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
		"cubic-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
		"cubic-in-out": "cubic-bezier(0.645, 0.045, 0.355, 1)",
		"quart-in": "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
		"quart-out": "cubic-bezier(0.165, 0.84, 0.44, 1)",
		"quart-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
		"quint-in": "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
		"quint-out": "cubic-bezier(0.23, 1, 0.32, 1)",
		"quint-in-out": "cubic-bezier(0.86, 0, 0.07, 1)",
		"expo-in": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
		"expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
		"expo-in-out": "cubic-bezier(1, 0, 0, 1)",
		"circ-in": "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
		"circ-out": "cubic-bezier(0.075, 0.82, 0.165, 1)",
		"circ-in-out": "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
		"back-in": "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
		"back-out": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
		"back-in-out": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"

export const colors = {
	gray: {
		1: '#f7fafc',
		2: '#edf2f7',
		3: '#e2e8f0',
		4: '#cbd5e0',
		5: '#a0aec0',
		6: '#718096',
		7: '#4a5568',
		8: '#2d3748',
		9: '#1a202c',
	},
	grey: {
		1: 'gray1',
		2: 'gray2',
		3: 'gray3',
		4: 'gray4',
		5: 'gray5',
		6: 'gray6',
		7: 'gray7',
		8: 'gray8',
		9: 'gray9',
	}
	red: {
		1: '#fff5f5',
		2: '#fed7d7',
		3: '#feb2b2',
		4: '#fc8181',
		5: '#f56565',
		6: '#e53e3e',
		7: '#c53030',
		8: '#9b2c2c',
		9: '#742a2a',
	},
	orange: {
		1: '#fffaf0',
		2: '#feebc8',
		3: '#fbd38d',
		4: '#f6ad55',
		5: '#ed8936',
		6: '#dd6b20',
		7: '#c05621',
		8: '#9c4221',
		9: '#7b341e',
	},
	yellow: {
		1: '#fffff0',
		2: '#fefcbf',
		3: '#faf089',
		4: '#f6e05e',
		5: '#ecc94b',
		6: '#d69e2e',
		7: '#b7791f',
		8: '#975a16',
		9: '#744210',
	},
	green: {
		1: '#f0fff4',
		2: '#c6f6d5',
		3: '#9ae6b4',
		4: '#68d391',
		5: '#48bb78',
		6: '#38a169',
		7: '#2f855a',
		8: '#276749',
		9: '#22543d',
	},
	teal: {
		1: '#e6fffa',
		2: '#b2f5ea',
		3: '#81e6d9',
		4: '#4fd1c5',
		5: '#38b2ac',
		6: '#319795',
		7: '#2c7a7b',
		8: '#285e61',
		9: '#234e52',
	},
	blue: {
		1: '#ebf8ff',
		2: '#bee3f8',
		3: '#90cdf4',
		4: '#63b3ed',
		5: '#4299e1',
		6: '#3182ce',
		7: '#2b6cb0',
		8: '#2c5282',
		9: '#2a4365',
	},
	indigo: {
		1: '#ebf4ff',
		2: '#c3dafe',
		3: '#a3bffa',
		4: '#7f9cf5',
		5: '#667eea',
		6: '#5a67d8',
		7: '#4c51bf',
		8: '#434190',
		9: '#3c366b',
	},
	purple: {
		1: '#faf5ff',
		2: '#e9d8fd',
		3: '#d6bcfa',
		4: '#b794f4',
		5: '#9f7aea',
		6: '#805ad5',
		7: '#6b46c1',
		8: '#553c9a',
		9: '#44337a',
	},
	pink: {
		1: '#fff5f7',
		2: '#fed7e2',
		3: '#fbb6ce',
		4: '#f687b3',
		5: '#ed64a6',
		6: '#d53f8c',
		7: '#b83280',
		8: '#97266d',
		9: '#702459',
	},
}