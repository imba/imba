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


# some things should definitely move out of theme
export const variants =
	radius:
		full: '9999px'
		NUMBER: '2px'
	
	sizing:
		NUMBER: '0.25rem'
		
	letter-spacing:
		NUMBER: '0.05em'

	font-size:
		'xxs': ['10px',1.5]
		'xs':  ['12px',1.5]
		's-':  ['13px',1.5]
		'sm':  ['14px',1.5]
		'm-':  ['15px',1.5]
		'md':  ['16px',1.5]
		'l-':  ['17px',1.5]
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
		xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
		sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
		inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
		outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
		none: 'none'

	easings:
		"sine-in": "cubic-bezier(0.47, 0, 0.745, 0.715)",
		"sine-out": "cubic-bezier(0.39, 0.575, 0.565, 1)",
		"sine-out-in": "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
		"quad-in": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
		"quad-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
		"quad": "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		"cubic-in": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
		"cubic-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
		"cubic": "cubic-bezier(0.645, 0.045, 0.355, 1)",
		"quart-in": "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
		"quart-out": "cubic-bezier(0.165, 0.84, 0.44, 1)",
		"quart": "cubic-bezier(0.77, 0, 0.175, 1)",
		"quint-in": "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
		"quint-out": "cubic-bezier(0.23, 1, 0.32, 1)",
		"quint": "cubic-bezier(0.86, 0, 0.07, 1)",
		"expo-in": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
		"expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
		"expo": "cubic-bezier(1, 0, 0, 1)",
		"circ-in": "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
		"circ-out": "cubic-bezier(0.075, 0.82, 0.165, 1)",
		"circ": "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
		"back-in": "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
		"back-out": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
		"back": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"

export const colors = {
	gray: {
		100: '#f7fafc',
		200: '#edf2f7',
		300: '#e2e8f0',
		400: '#cbd5e0',
		500: '#a0aec0',
		600: '#718096',
		700: '#4a5568',
		800: '#2d3748',
		900: '#1a202c',
	},
	grey: {
		100: 'gray100',
		200: 'gray200',
		300: 'gray300',
		400: 'gray400',
		500: 'gray500',
		600: 'gray600',
		700: 'gray700',
		800: 'gray800',
		900: 'gray900',
	}
	red: {
		100: '#fff5f5',
		200: '#fed7d7',
		300: '#feb2b2',
		400: '#fc8181',
		500: '#f56565',
		600: '#e53e3e',
		700: '#c53030',
		800: '#9b2c2c',
		900: '#742a2a',
	},
	orange: {
		100: '#fffaf0',
		200: '#feebc8',
		300: '#fbd38d',
		400: '#f6ad55',
		500: '#ed8936',
		600: '#dd6b20',
		700: '#c05621',
		800: '#9c4221',
		900: '#7b341e',
	},
	yellow: {
		100: '#fffff0',
		200: '#fefcbf',
		300: '#faf089',
		400: '#f6e05e',
		500: '#ecc94b',
		600: '#d69e2e',
		700: '#b7791f',
		800: '#975a16',
		900: '#744210',
	},
	green: {
		100: '#f0fff4',
		200: '#c6f6d5',
		300: '#9ae6b4',
		400: '#68d391',
		500: '#48bb78',
		600: '#38a169',
		700: '#2f855a',
		800: '#276749',
		900: '#22543d',
	},
	teal: {
		100: '#e6fffa',
		200: '#b2f5ea',
		300: '#81e6d9',
		400: '#4fd1c5',
		500: '#38b2ac',
		600: '#319795',
		700: '#2c7a7b',
		800: '#285e61',
		900: '#234e52',
	},
	blue: {
		100: '#ebf8ff',
		200: '#bee3f8',
		300: '#90cdf4',
		400: '#63b3ed',
		500: '#4299e1',
		600: '#3182ce',
		700: '#2b6cb0',
		800: '#2c5282',
		900: '#2a4365',
	},
	indigo: {
		100: '#ebf4ff',
		200: '#c3dafe',
		300: '#a3bffa',
		400: '#7f9cf5',
		500: '#667eea',
		600: '#5a67d8',
		700: '#4c51bf',
		800: '#434190',
		900: '#3c366b',
	},
	purple: {
		100: '#faf5ff',
		200: '#e9d8fd',
		300: '#d6bcfa',
		400: '#b794f4',
		500: '#9f7aea',
		600: '#805ad5',
		700: '#6b46c1',
		800: '#553c9a',
		900: '#44337a',
	},
	pink: {
		100: '#fff5f7',
		200: '#fed7e2',
		300: '#fbb6ce',
		400: '#f687b3',
		500: '#ed64a6',
		600: '#d53f8c',
		700: '#b83280',
		800: '#97266d',
		900: '#702459',
	},
}