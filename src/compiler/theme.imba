export const fonts =
	sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
	serif: 'Georgia, Cambria, "Times New Roman", Times, serif'
	mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

# some things should definitely move out of theme
export const variants =
	radius:
		full: '9999px'
		step: '2px'
	
	sizing:
		step: '0.25rem'
		
	layout:
		# display
		'flex': {'display': 'flex'}
		'vflex': {'display': 'flex', 'flex-direction': 'column'}
		'hflex': {'display': 'flex', 'flex-direction': 'row'}
		'inline-flex': {'display': 'inline-flex'}
		'inline-vflex': {'display': 'inline-flex', 'flex-direction': 'column'}
		'inline-hflex': {'display': 'inline-flex', 'flex-direction': 'row'}
		'inline': {'display': 'inline'}
		'block': {'display': 'block'}
		'inline-block': {'display': 'inline-block'}
		'grid': {'display': 'grid'}
		'inline-grid': {'display': 'inline-grid'}
		'table': {display: 'table' }
		'table-caption': {display: 'table-caption' }
		'table-cell': {display: 'table-cell' }
		'table-column': {display: 'table-column' }
		'table-column-group': {display: 'table-column-group' }
		'table-footer-group': {display: 'table-footer-group' }
		'table-header-group': {display: 'table-header-group' }
		'table-row-group': {display: 'table-row-group' }
		'table-row': {display: 'table-row' }
		'contents': {'display': 'contents'}
		'hidden': {'display': 'none'}
		'none': {'display': 'none'}
		
		# Position
		'static': {position: 'static'}
		'relative': {position: 'relative'}
		'absolute': {position: 'absolute'}
		'rel': {position: 'relative'}
		'abs': {position: 'absolute'}
		'fixed': {position: 'fixed'}
		'sticky': {position: 'sticky'}
		'inset': {position: 'absolute',top:'0',bottom:'0',left:'0',right:'0'}
		
		# overflow
		'clip': {'overflow': 'hidden'}
		'noclip': {'overflow': 'visible'}
		'clip-x': {'overflow-x': 'hidden'}
		'clip-y': {'overflow-y': 'hidden'}
		'scroll-x': {'overflow-x': 'auto'}
		'scroll-y': {'overflow-y': 'auto'}
		'noclip-x': {'overflow-x': 'visible'}
		'noclip-y': {'overflow-y': 'visible'}
		'truncate': {'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap'}
		
		# box-sizing
		'border-box': {'box-sizing': 'border-box'}
		'content-box': {'box-sizing': 'content-box'}
		
		'wrap': {'flex-wrap': 'wrap'}
		'center': {'align-items': 'center','justify-content': 'center', 'align-content': 'center'}
		
		# visibility
		'invisible': {visibility: 'hidden'}
		'visible': {visibility: 'visible'}
		'unselectable': {'user-select': 'none'}
		'selectable': {'user-select': 'auto'}
		'unclickable': {'pointer-events': 'none'}
		'clickable': {'pointer-events': 'auto'}
		
		# text related
	
	fontSize:
		'xxs': ['10px',1.5]
		'xs':  ['12px',1.5]
		'sm':  ['14px',1.5]
		'md':  ['16px',1.5]
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
		
	units:
		u: '4px' # '0.125rem'
		
	helpers:
		# positioning
		'static': {position: 'static'}
		'relative': {position: 'relative'}
		'absolute': {position: 'absolute'}
		'rel': {position: 'relative'}
		'abs': {position: 'absolute'}
		'fixed': {position: 'fixed'}
		'sticky': {position: 'sticky'}
		'inset': {position: 'absolute',top:'0',bottom:'0',left:'0',right:'0'}
		
		# display
		'hidden': {'display': 'none'}
		'fragment': {'display': 'contents'}
		'inline': {'display': 'inline'}
		'block': {'display': 'block'}
		'flex': {'display': 'flex'}
		'hflex': {'display': 'flex','flex-direction':'row'}
		'vflex': {'display': 'flex','flex-direction':'column'}

		'cluster': {
			'display': 'flex',
			'flex-direction':'row',
			'justify-content': 'var(--flow-align,center)'
			'align-items': 'center'
			'align-content': 'center'
			'flex-wrap': 'wrap'
		}
		
		'flow': {
			'display': 'flex',
			'flex-direction':'column',
			'justify-content': 'center'
			'align-items': 'var(--flow-align,center)'
			'align-content': 'var(--flow-align,center)'
			'flex-wrap': 'no-wrap'
		}
		
		'bar': {
			'display': 'flex',
			'flex-direction':'row',
			'justify-content': 'var(--flow-align,center)'
			'align-items': 'center'
			'align-content': 'center'
			'align-self': 'stretch'
			'flex-wrap': 'no-wrap'
		}
		
		'left': {
			'text-align':'left'
			'--flow-align':'flex-start'
		}
		
		'right': {
			'text-align':'right'
			'--flow-align':'flex-end'
		}
		
		'center': {
			'text-align':'center'
			'--flow-align':'center'
		}
		
		'stack': {
			'display': 'flex',
			'flex-direction':'column',
			'justify-content': 'flex-start'
			'align-items': 'stretch'
		}
		
		# visibility
		'invisible': {visibility: 'hidden'}
		'visible': {visibility: 'visible'}
		
		# user-select
		'unselectable': {'user-select': 'none'}
		'selectable': {'user-select': 'auto'}
		
		# pointer-events
		'unclickable': {'pointer-events': 'none'}
		'clickable': {'pointer-events': 'auto'}
		
		# border-radius
		'round': {'border-radius': 'full'}
		'rounded': {'border-radius': '3px'}
		'rounded': {'border-radius': '3px'}
		
		# box-sizing
		'border-box': {'box-sizing': 'border-box'}
		'content-box': {'box-sizing': 'content-box'}
		
		# text-decoration
		'underlined': {'text-decoration': 'underline'}
		
		# text-transform
		'uppercase': {'text-transform': 'uppercase'}
		'lowercase': {'text-transform': 'lowercase'}
		'capitalize': {'text-transform': 'capitalize'}
		'normalcase': {'text-transform': 'none'}
		
		# font-style
		'italic': {'font-style': 'italic'}
		'non-italic': {'font-style': 'normal'}
		
		# font weight
		'medium': {'font-weight': '500'}
		'semibold': {'font-weight': '600'}
		'bold': {'font-weight': 'bold'}
		
		# font sizes
		# fs1, fs2, fs3, fs4 etc...
		
		# color
		# blue1, blue2 etc
		
		# background-color
		# bg-blue1 bg-blue2 etc
		
		# font smoothing
		'antialiased': {'-webkit-font-smoothing': 'antialiased', '-moz-osx-font-smoothing': 'grayscale'}
		'subpixel-antialiased': {'-webkit-font-smoothing': 'auto', '-moz-osx-font-smoothing': 'auto'}		
		
		# overflow
		'clip': {'overflow': 'hidden'}
		'noclip': {'overflow': 'visible'}
		'clip-x': {'overflow-x': 'hidden'}
		'clip-y': {'overflow-y': 'hidden'}
		'scroll-x': {'overflow-x': 'auto'}
		'scroll-y': {'overflow-y': 'auto'}
		'noclip-x': {'overflow-x': 'visible'}
		'noclip-y': {'overflow-y': 'visible'}
		'truncated': {'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap'}

	text:
		'italic': {'font-style': 'italic'}
		'non-italic': {'font-style': 'normal'}

		'underline': {'text-decoration': 'underline'}
		'overline': {'text-decoration': 'overline'}
		'no-underline': {'text-decoration': 'none'}
		'line-through': {'text-decoration': 'line-through'}
		'undecorated': {'text-decoration': 'none'}
		
		'uppercase': {'text-transform': 'uppercase'}
		'lowercase': {'text-transform': 'lowercase'}
		'capitalize': {'text-transform': 'capitalize'}
		'untransformed': {'text-transform': 'none'}
		
		'left': {'text-align': 'left'}
		'center': {'text-align': 'center'}
		'right': {'text-align': 'right'}
		'justify': {'text-align': 'justify'}
		
		'light': {'font-weight': '300'}
		'medium': {'font-weight': '500'}
		'semibold': {'font-weight': '600'}
		
		'normal': {'letter-spacing': '0em','font-weight':400,'font-style': 'normal'}
		
		'reset': {
			'letter-spacing': '0em',
			'font-weight': 400,
			'text-transform':'none',
			'text-decoration': 'none',
			'font-style': 'normal'
		}
		
		'tighter': {'letter-spacing': '-0.05em'}
		'tight': {'letter-spacing': '-0.025em'}
		'wide': {'letter-spacing': '0.025em'}
		'wider': {'letter-spacing': '0.05em'}
		'widest': {'letter-spacing': '0.1em'}
		
		'nowrap': {'white-space': 'nowrap'}
		'pre': {'white-space': 'pre'}
		'pre-wrap': {'white-space': 'pre-wrap'}
		'pre-line': {'white-space': 'pre-line'}
		'break-spaces': {'white-space': 'break-spaces'}
		'truncate': {'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap'}
		
		'antialiased': {'-webkit-font-smoothing': 'antialiased', '-moz-osx-font-smoothing': 'grayscale'}
		'subpixel-antialiased': {'-webkit-font-smoothing': 'auto', '-moz-osx-font-smoothing': 'auto'}		
		
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
		
export const breakpoints =
	xs: '(min-width: 480px)'
	sm: '(min-width: 640px)'
	md: '(min-width: 768px)'
	lg: '(min-width: 1024px)'
	xl: '(min-width: 1280px)'
	
	'not-xs': '(max-width: 479px)'
	'not-sm': '(max-width: 639px)'
	'not-md': '(max-width: 767px)'
	'not-lg': '(max-width: 1023px)'
	'not-xl': '(max-width: 1279px)'

export const material-colors = 
	red: {
		50: "#ffebee",
		100: "#ffcdd2",
		200: "#ef9a9a",
		300: "#e57373",
		400: "#ef5350",
		500: "#f44336",
		600: "#e53935",
		700: "#d32f2f",
		800: "#c62828",
		900: "#b71c1c",
		a100: "#ff8a80",
		a200: "#ff5252",
		a400: "#ff1744",
		a700: "#d50000"
	},
	pink: {
		50: "#fce4ec",
		100: "#f8bbd0",
		200: "#f48fb1",
		300: "#f06292",
		400: "#ec407a",
		500: "#e91e63",
		600: "#d81b60",
		700: "#c2185b",
		800: "#ad1457",
		900: "#880e4f",
		a100: "#ff80ab",
		a200: "#ff4081",
		a400: "#f50057",
		a700: "#c51162"
	},
	purple: {
		50: "#f3e5f5",
		100: "#e1bee7",
		200: "#ce93d8",
		300: "#ba68c8",
		400: "#ab47bc",
		500: "#9c27b0",
		600: "#8e24aa",
		700: "#7b1fa2",
		800: "#6a1b9a",
		900: "#4a148c",
		a100: "#ea80fc",
		a200: "#e040fb",
		a400: "#d500f9",
		a700: "#aa00ff"
	},
	deeppurple: {
		50: "#ede7f6",
		100: "#d1c4e9",
		200: "#b39ddb",
		300: "#9575cd",
		400: "#7e57c2",
		500: "#673ab7",
		600: "#5e35b1",
		700: "#512da8",
		800: "#4527a0",
		900: "#311b92",
		a100: "#b388ff",
		a200: "#7c4dff",
		a400: "#651fff",
		a700: "#6200ea"
	},
	indigo: {
		50: "#e8eaf6",
		100: "#c5cae9",
		200: "#9fa8da",
		300: "#7986cb",
		400: "#5c6bc0",
		500: "#3f51b5",
		600: "#3949ab",
		700: "#303f9f",
		800: "#283593",
		900: "#1a237e",
		a100: "#8c9eff",
		a200: "#536dfe",
		a400: "#3d5afe",
		a700: "#304ffe"
	},
	blue: {
		50: "#e3f2fd",
		100: "#bbdefb",
		200: "#90caf9",
		300: "#64b5f6",
		400: "#42a5f5",
		500: "#2196f3",
		600: "#1e88e5",
		700: "#1976d2",
		800: "#1565c0",
		900: "#0d47a1",
		a100: "#82b1ff",
		a200: "#448aff",
		a400: "#2979ff",
		a700: "#2962ff"
	},
	lightblue: {
		50: "#e1f5fe",
		100: "#b3e5fc",
		200: "#81d4fa",
		300: "#4fc3f7",
		400: "#29b6f6",
		500: "#03a9f4",
		600: "#039be5",
		700: "#0288d1",
		800: "#0277bd",
		900: "#01579b",
		a100: "#80d8ff",
		a200: "#40c4ff",
		a400: "#00b0ff",
		a700: "#0091ea"
	},
	cyan: {
		50: "#e0f7fa",
		100: "#b2ebf2",
		200: "#80deea",
		300: "#4dd0e1",
		400: "#26c6da",
		500: "#00bcd4",
		600: "#00acc1",
		700: "#0097a7",
		800: "#00838f",
		900: "#006064",
		a100: "#84ffff",
		a200: "#18ffff",
		a400: "#00e5ff",
		a700: "#00b8d4"
	},
	teal: {
		50: "#e0f2f1",
		100: "#b2dfdb",
		200: "#80cbc4",
		300: "#4db6ac",
		400: "#26a69a",
		500: "#009688",
		600: "#00897b",
		700: "#00796b",
		800: "#00695c",
		900: "#004d40",
		a100: "#a7ffeb",
		a200: "#64ffda",
		a400: "#1de9b6",
		a700: "#00bfa5"
	},
	green: {
		50: "#e8f5e9",
		100: "#c8e6c9",
		200: "#a5d6a7",
		300: "#81c784",
		400: "#66bb6a",
		500: "#4caf50",
		600: "#43a047",
		700: "#388e3c",
		800: "#2e7d32",
		900: "#1b5e20",
		a100: "#b9f6ca",
		a200: "#69f0ae",
		a400: "#00e676",
		a700: "#00c853"
	},
	lightgreen: {
		50: "#f1f8e9",
		100: "#dcedc8",
		200: "#c5e1a5",
		300: "#aed581",
		400: "#9ccc65",
		500: "#8bc34a",
		600: "#7cb342",
		700: "#689f38",
		800: "#558b2f",
		900: "#33691e",
		a100: "#ccff90",
		a200: "#b2ff59",
		a400: "#76ff03",
		a700: "#64dd17"
	},
	lime: {
		50: "#f9fbe7",
		100: "#f0f4c3",
		200: "#e6ee9c",
		300: "#dce775",
		400: "#d4e157",
		500: "#cddc39",
		600: "#c0ca33",
		700: "#afb42b",
		800: "#9e9d24",
		900: "#827717",
		a100: "#f4ff81",
		a200: "#eeff41",
		a400: "#c6ff00",
		a700: "#aeea00"
	},
	yellow: {
		50: "#fffde7",
		100: "#fff9c4",
		200: "#fff59d",
		300: "#fff176",
		400: "#ffee58",
		500: "#ffeb3b",
		600: "#fdd835",
		700: "#fbc02d",
		800: "#f9a825",
		900: "#f57f17",
		a100: "#ffff8d",
		a200: "#ffff00",
		a400: "#ffea00",
		a700: "#ffd600"
	},
	amber: {
		50: "#fff8e1",
		100: "#ffecb3",
		200: "#ffe082",
		300: "#ffd54f",
		400: "#ffca28",
		500: "#ffc107",
		600: "#ffb300",
		700: "#ffa000",
		800: "#ff8f00",
		900: "#ff6f00",
		a100: "#ffe57f",
		a200: "#ffd740",
		a400: "#ffc400",
		a700: "#ffab00"
	},
	orange: {
		50: "#fff3e0",
		100: "#ffe0b2",
		200: "#ffcc80",
		300: "#ffb74d",
		400: "#ffa726",
		500: "#ff9800",
		600: "#fb8c00",
		700: "#f57c00",
		800: "#ef6c00",
		900: "#e65100",
		a100: "#ffd180",
		a200: "#ffab40",
		a400: "#ff9100",
		a700: "#ff6d00"
	},
	deeporange: {
		50: "#fbe9e7",
		100: "#ffccbc",
		200: "#ffab91",
		300: "#ff8a65",
		400: "#ff7043",
		500: "#ff5722",
		600: "#f4511e",
		700: "#e64a19",
		800: "#d84315",
		900: "#bf360c",
		a100: "#ff9e80",
		a200: "#ff6e40",
		a400: "#ff3d00",
		a700: "#dd2c00"
	},
	brown: {
		50: "#efebe9",
		100: "#d7ccc8",
		200: "#bcaaa4",
		300: "#a1887f",
		400: "#8d6e63",
		500: "#795548",
		600: "#6d4c41",
		700: "#5d4037",
		800: "#4e342e",
		900: "#3e2723"
	},
	grey: {
		50: "#fafafa",
		100: "#f5f5f5",
		200: "#eeeeee",
		300: "#e0e0e0",
		400: "#bdbdbd",
		500: "#9e9e9e",
		600: "#757575",
		700: "#616161",
		800: "#424242",
		900: "#212121"
	}
	bluegrey: {
		50: "#eceff1",
		100: "#cfd8dc",
		200: "#b0bec5",
		300: "#90a4ae",
		400: "#78909c",
		500: "#607d8b",
		600: "#546e7a",
		700: "#455a64",
		800: "#37474f",
		900: "#263238"
	}

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