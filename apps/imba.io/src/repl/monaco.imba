import * as imba-lang from './languages/imba'
import * as js-lang from './languages/javascript'
import * as css-lang from './languages/css'
import * as html-lang from './languages/html'
import {theme} from './theme'

global.loadMonaco and global.loadMonaco do
	global.monaco.editor.defineTheme('scrimba-dark',theme.toMonaco!)
	imba-lang.setup(global.monaco)
	imba.commit!

global css .monaco-editor
	.variable_ c:var(--code-variable)
	.parameter_ c:var(--code-variable)
	.variable_.global_ c:var(--code-special)