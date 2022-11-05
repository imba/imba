let chroma = require('chroma-js')

export let colors = {
	gray100: "#f7fafc"
	gray200: "#edf2f7"
	gray300: "#e2e8f0"
	gray400: "#cbd5e0"
	gray500: "#a0aec0"
	gray600: "#718096"
	gray700: "#4a5568"
	gray800: "#2d3748"
	gray900: "#1a202c"
	red100: "#fff5f5"
	red200: "#fed7d7"
	red300: "#feb2b2"
	red400: "#fc8181"
	red500: "#f56565"
	red600: "#e53e3e"
	red700: "#c53030"
	red800: "#9b2c2c"
	red900: "#742a2a"
	orange100: "#fffaf0"
	orange200: "#feebc8"
	orange300: "#fbd38d"
	orange400: "#f6ad55"
	orange500: "#ed8936"
	orange600: "#dd6b20"
	orange700: "#c05621"
	orange800: "#9c4221"
	orange900: "#7b341e"
	yellow200: "#fefcbf"
	yellow300: "#faf089"
	yellow400: "#f6e05e"
	yellow500: "#ecc94b"
	yellow600: "#d69e2e"
	yellow700: "#b7791f"
	yellow800: "#975a16"
	yellow900: "#744210"
	green100: "#f0fff4"
	green200: "#c6f6d5"
	green300: "#9ae6b4"
	green400: "#68d391"
	green500: "#48bb78"
	green600: "#38a169"
	green700: "#2f855a"
	green800: "#276749"
	green900: "#22543d"
	teal100: "#e6fffa"
	teal200: "#b2f5ea"
	teal300: "#81e6d9"
	teal400: "#4fd1c5"
	teal500: "#38b2ac"
	teal600: "#319795"
	teal700: "#2c7a7b"
	teal800: "#285e61"
	teal900: "#234e52"
	blue100: "#ebf8ff"
	blue200: "#bee3f8"
	blue300: "#90cdf4"
	blue400: "#63b3ed"
	blue500: "#4299e1"
	blue600: "#3182ce"
	blue700: "#2b6cb0"
	blue800: "#2c5282"
	blue900: "#2a4365"
	indigo100: "#ebf4ff"
	indigo200: "#c3dafe"
	indigo300: "#a3bffa"
	indigo400: "#7f9cf5"
	indigo500: "#667eea"
	indigo600: "#5a67d8"
	indigo700: "#4c51bf"
	indigo800: "#434190"
	indigo900: "#3c366b"
	purple100: "#faf5ff"
	purple200: "#e9d8fd"
	purple300: "#d6bcfa"
	purple400: "#b794f4"
	purple500: "#9f7aea"
	purple600: "#805ad5"
	purple700: "#6b46c1"
	purple800: "#553c9a"
	purple900: "#44337a"
	pink100: "#fff5f7"
	pink200: "#fed7e2"
	pink300: "#fbb6ce"
	pink400: "#f687b3"
	pink500: "#ed64a6"
	pink600: "#d53f8c"
	pink700: "#b83280"
	pink800: "#97266d"
	pink900: "#702459"
}

def dim color, amount = 0.2
	chroma(color).saturate(-amount).hex()
	
def darken color, amount = 0.2
	chroma(color).darken(amount).hex()

def mix color, other, amount = 0.5
	chroma.mix(color,other,amount).hex()

colors.base = "#e3e3e3" # f2f2f2
colors.identifier = "#f0f0f0" # cbd0c3 #F8F8F8 #8bc3dc
colors.variable = "#e5ecc7" # cbd0c3 #F8F8F8
colors.comment = "#718096"
colors.prop = "#8ab9ff" # colors.blue300 # dim(colors.blue300,-0.1)
colors.keyword = "#e88376" # "#e88f76"
colors.parameter = colors.variable # "#cad7eb" # "#eae0ce"
colors.special = dim(colors.yellow300,0) # dim(colors.yellow300,0.5)
colors.private = dim(colors.yellow200,0.5) # dim(colors.yellow300,0.5)
colors.ivar = dim(colors.blue300,0.3)
colors.internal = colors.identifier #  dim(colors.blue300,0.5)
colors.private = "#e7a5a6" # dim(colors.yellow300,0.5)
colors.accessor = colors.gray100

colors.pascal = "#c5badc" # darken(colors.purple300,0.2)
colors.imports = colors.pascal # darken(colors.purple300,0.2)
colors.string = colors.green200
colors.symbol = colors.string # "#d9f7ba"
colors.regexp = colors.orange400

colors.event-modifier = "#f99d72"

colors.tag = "#e9e19b"
colors.type = colors.comment
colors.bgdark = '#21252b'
colors.background = '#111316' # '#282c34'
colors.chromebg = '#1d2227' # '#252930'
colors.darker = '#171a1e'

colors.root_ = "#c5badc"
colors.import_ = "#c5badc"

export let globals = {
	activeGuide: '#3b5567'
	background: '#1b1e22'
	caret: '#A7A7A7'
	foreground: colors.base
	guide: '#202e37'
	invisibles: '#CAE2FB2B'
	selection: '#2b383f'
	stackGuide: '#202e37'
}

export let vstheme = {
	"activityBar.foreground": "#d7dae0",
	"activityBarBadge.background": "#4d78cc",
	"activityBarBadge.foreground": "#f8fafd",
	"badge.background": colors.background,
	"button.background": "#404754",
	"debugToolBar.background": colors.bgdark,
	"diffEditor.insertedTextBackground": "#00809b33",
	"dropdown.background": colors.bgdark,
	"dropdown.border": colors.bgdark,
	"editor.background": colors.background,
	"editor.findMatchBackground": "#42557b",
	"editor.findMatchBorder": "#457dff",
	"editor.findMatchHighlightBackground": "#6199ff2f",
	"editor.foreground": "#abb2bf",
	"editor.lineHighlightBackground": "#232c3575",
	"editor.selectionBackground": "#67769660",
	"editor.selectionHighlightBackground": "#ffffff10",
	"editor.selectionHighlightBorder": "#dddddd",
	"editor.wordHighlightBackground": "#d2e0ff2f",
	"editor.wordHighlightBorder": "#7f848e",
	"editor.wordHighlightStrongBackground": "#abb2bf26",
	"editor.wordHighlightStrongBorder": "#7f848e",
	"editorActiveLineNumber.foreground": "#737984",
	"editorBracketMatch.background": "#515a6b",
	"editorBracketMatch.border": "#515a6b",
	"editorCursor.background": "#ffffffc9",
	"editorCursor.foreground": "#528bff",
	"editorError.foreground": "#c24038",
	"editorGroup.background": "#181a1f",
	"editorGroup.border": "#181a1f",
	"editorGroupHeader.tabsBackground": colors.bgdark,
	"editorHoverWidget.background": colors.bgdark,
	"editorHoverWidget.border": "#181a1f",
	"editorIndentGuide.activeBackground": "#ffffff22",
	"editorIndentGuide.background": "#ffffff06",
	"editorLineNumber.foreground": "#495162",
	"editorMarkerNavigation.background": colors.bgdark,
	"editorRuler.foreground": "#abb2bf26",
	"editorSuggestWidget.background": colors.bgdark,
	"editorSuggestWidget.border": "#181a1f",
	"editorSuggestWidget.selectedBackground": "#2c313a",
	"editorWarning.foreground": "#d19a66",
	"editorWhitespace.foreground": "#3b4048",
	"editorWidget.background": colors.bgdark,
	"focusBorder": "#464646",
	"input.background": "#1d1f23",
	"list.activeSelectionBackground": "#2c313a",
	"list.activeSelectionForeground": "#d7dae0",
	"list.focusBackground": "#383e4a",
	"list.highlightForeground": "#c5c5c5",
	"list.hoverBackground": "#292d35",
	"list.inactiveSelectionBackground": "#2c313a",
	"list.inactiveSelectionForeground": "#d7dae0",
	"list.warningForeground": "#d19a66",
	"menu.foreground": "#c8c8c8",
	"peekViewEditor.background": "#1b1d23",
	"peekViewEditor.matchHighlightBackground": "#29244b",
	"peekViewResult.background": "#22262b",
	"scrollbarSlider.activeBackground": "#747d9180",
	"scrollbarSlider.background": "#4e566660",
	"scrollbarSlider.hoverBackground": "#5a637580",
	"sideBarSectionHeader.background": colors.background,
	"statusBar.background": colors.bgdark,
	"statusBar.debuggingBackground": "#7e0097",
	"statusBar.debuggingBorder": "#66017a",
	"statusBar.debuggingForeground": "#ffffff",
	"statusBar.foreground": "#9da5b4",
	"statusBar.noFolderBackground": colors.bgdark,
	"statusBarItem.hoverBackground": "#2c313a",
	"statusBarItem.remoteBackground": "#4d78cc",
	"statusBarItem.remoteForeground": "#f8fafd",
	"tab.activeBackground": colors.background,
	"tab.activeForeground": "#dcdcdc",
	"tab.border": "#181a1f",
	"tab.hoverBackground": "#323842",
	"tab.inactiveBackground": colors.bgdark,
	"tab.unfocusedHoverBackground": "#323842",

	"textLink.foreground": "#61afef",
	"titleBar.activeBackground": colors.background,
	"titleBar.activeForeground": "#9da5b4",
	"titleBar.inactiveBackground": colors.bgdark,
	"titleBar.inactiveForeground": "#6b717d"
	
	# customizations
	"activityBar.background": colors.chromebg,
	"editor.rangeHighlightBorder": "#40577a",
	"editor.selectionHighlightBorder": "#21252b",
	"editor.symbolHighlightBorder": "#21252b",
	"editorBracketMatch.background": "#21252b",
	"editorBracketMatch.border": "#21252b",
	"editorError.foreground":"#ff8f8f",
	"editorGroupHeader.tabsBackground": colors.chromebg,
	"editorGroupHeader.tabsBorder": "#21252b",
	"editorLineNumber.activeForeground": "#9bb5dd",
	"editorOverviewRuler.errorForeground": "#f36161",
	"editorWhitespace.foreground": "#ffffff0e",
	"editorWidget.border": "#788296",
	"editorGroup.border": "#21252b",
	"tab.border": "#21252b",
	"tab.activeBorderTop": "#21252b",
	"focusBorder": "#ff000000",
	"gitDecoration.addedResourceForeground": "#8aa395",
	"gitDecoration.modifiedResourceForeground": "#9ea38a",
	"gitDecoration.untrackedResourceForeground": "#94a38a",
	"input.background": "#20242b",
	"input.placeholderForeground": "#4c5668",
	"list.activeSelectionForeground": "#ffffff",
	"menu.background": "#21252b",
	"panel.border": "#1d2227",
	"quickInput.background": "#282c34",
	"scrollbar.shadow": "#21252b",
	"sideBar.background": colors.chromebg,
	"sideBar.border": "#21252b",
	"sideBar.foreground": "#788296",
	"sideBarSectionHeader.background": "#ff000000",
	"tab.activeBackground": "#282c34",
	"tab.activeBorder": "#21252b",
	"tab.inactiveBackground": colors.chromebg,
	"tab.inactiveForeground": "#d0e0ff65",
	"titleBar.activeBackground": colors.chromebg,
	"titleBar.border": colors.chromebg,
	"tree.indentGuidesStroke": "#363d49cc",
	"widget.shadow": "#0000007c",
	"statusBar.background": colors.chromebg,
	"statusBar.border": "#21252b",
	"panelTitle.inactiveForeground":"#788296",
	"panelTitle.activeBorder":"#ffffff",
	"panel.background": colors.chromebg,
	"terminal.ansiBlack": "#2d3139",
	"terminal.ansiBlue": "#6bbcff",
	"terminal.ansiBrightBlack": "#7f848e",
	"terminal.ansiBrightBlue": "#6a9bff",
	"terminal.ansiBrightCyan": "#70ccd8",
	"terminal.ansiBrightGreen": "#cbf8ab",
	"terminal.ansiBrightMagenta": "#d88ce7",
	"terminal.ansiBrightRed": "#f44747",
	"terminal.ansiBrightWhite": "#d7dae0",
	"terminal.ansiBrightYellow": "#ffe2ac",
	"terminal.ansiCyan": "#56b6c2",
	"terminal.ansiGreen": "#98c379",
	"terminal.ansiMagenta": "#c678dd",
	"terminal.ansiRed": "#e06c75",
	"terminal.ansiWhite": "#dbdfe7",
	"terminal.ansiYellow": "#e5c07b",
	"terminal.foreground": "#c8c8c8",
	"terminal.border": "#ffffff16",
	"panel.background": "#151a1f",
	"sideBarSectionHeader.foreground": "#ffffff",
	"sideBarSectionHeader.border": "#21252b"
}

export let semanticColors = {
	# "*.declaration": {"fontStyle": "underline","foreground": "#e8e6cb"}
	# "*.access": {"foreground": "#e8e6cb"}
	"variable": {"foreground": "#e8e6cb"}
	"function.declaration": {"foreground": colors.prop}
	# "variable.declaration": {"fontStyle": "underline"}
	# "*.root": {"foreground": colors.pascal}
	"*.root": {"foreground": colors.root_}
	"*.import": {"foreground": colors.import_}
	# "function.root": {"foreground": colors.pascal}
	"variable.local": {"foreground": "#e8e6cb"}
	"variable.global": {"foreground": '#e9e19b'}
	"variable.defaultLibrary": {"foreground": colors.root_}
	"namespace": {"foreground": colors.import_} # just for imba(!)
	# "variable.declaration": {"fontStyle": "bold","foreground": "#00ff00"}
}

export let scopes = [
	# ['source.imba',colors.base]
	# ['source.imba1',colors.base]
	['comment',colors.gray600,'italic']
	['string',colors.string]
	['keyword',colors.keyword]
	['storage',colors.keyword]
	['constant.numeric',colors.blue400]
	['constant.language.boolean',colors.blue500]
	['constant.language.undefined',colors.blue500]
	['constant.language.null',colors.blue500]
	['constant.language.super',colors.keyword]
	['entity.name.type',colors.prop]
	['invalid.whitespace',background: colors.red400]
	
	['support.function',colors.accessor]
	['support.function.require',colors.keyword]
	['support.variable.property',colors.accessor]
	
	['variable.parameter',colors.parameter]
	['variable.special',colors.special]
	['variable.other',colors.ivar]
	['identifier.const',colors.imports]
	['variable.instance.imba1',colors.ivar]
	['identifier.basic.imba1',colors.base]
	# ['variable.other.object',colors.identifier]
	# ['variable.other.instance',colors.ivar]
	# ['variable.other.internal',colors.internal]
	['variable.other.private',colors.private]
	['variable.other.property',colors.accessor]
	['variable.other.class',colors.imports]
	['variable.other.constant',colors.imports]

	['variable.language.super',colors.keyword]
	['variable.language.this',colors.blue400]
	['variable.language.global',colors.imports]
	['meta.import variable.other',colors.imports]
	['meta.definition.variable variable.other.readwrite',colors.variable]
			
	['meta.embedded.line',colors.gray200]
	['entity.name.function',colors.prop]

	['meta.definition.function entity.name.function',colors.prop]
	['meta.definition entity.name.function',colors.prop]
	['meta.definition.property variable.object.property',colors.prop]
	
	['meta.object-literal.key',colors.identifier]
	
	['meta.tag',darken(colors.tag,1.5)]
	['meta.tag.attributes',darken(colors.tag,0)]
	['entity.name.tag',colors.tag]
	['entity.name.tag.special',`#ffc799`]

	['entity.other.event-name.imba',colors.tag,'italic']
	# ['entity.other.event-name.imba',colors.tag,'italic']

	['entity.other.tag-ref.imba',`#ffc799`]
	['entity.other.tag-mixin.imba',`#ffc799`]
	# ['entity.other.tag.class-name',colors.yellow200]
	# 
	# ['entity.other.tag.event-modifier',colors.event-modifier]
	
	['support.class',colors.pascal]
	['support.variable -support.variable.property',colors.pascal]
	# ['support.function',colors.pascal]
	['support.constant',colors.pascal]
	['support.type.property-name',colors.prop]
	
	['string.quoted',colors.string]
	['string.template',colors.string]
	['string.regexp',colors.regexp]
	['string.symbol',colors.symbol]
	
	['meta.type.annotation',colors.type]
	['meta.type.annotation variable',colors.type]
	['meta.type.annotation variable.other.readwrite',colors.type]
	['meta.type.annotation variable.other.class',colors.type]
	['meta.type.annotation support.class.builtin',colors.type]
	['meta.type.annotation keyword.operator',colors.type]
	['meta.type.annotation entity.name',colors.type]
	
	['meta.type.annotation entity.name.type',colors.type]

	['keyword.operator.type',colors.type]
	['keyword.operator.type.annotation',darken(colors.type,1.5)]
	['punctuation.accessor',colors.keyword]
	['punctuation.definition.parameters',colors.keyword]
	['punctuation.definition.comment',colors.gray600,'italic']

	# css
	['meta.selector','#e9e19b']
	['support.type.property-name.modifier','#f394eb']
	['support.type.property-name','#e0ade3']
	['support.constant.property-value','#a49feb']
	['punctuation.separator.key-value.css','#e0ade3'] # 6d829b
	['punctuation.separator.sel-properties.css','#6d829b'] # 6d829b
	
	['punctuation.separator.combinator.css','#eec487'] # 6d829b
	['meta.selector entity.other.attribute-name','#eec487'] # 6d829b
	['meta.selector entity.other.attribute-name.class','#e9e19b'] # 6d829b
	['meta.selector entity.other.attribute-name.mixin','#ffc799'] # 6d829b

	['constant.other.color','#a49feb'] # 6d829b
	
	['meta.style.imba support.constant.color','#a49feb'] # 6d829b
	['meta.style.imba support.constant.color','#a49feb'] # 6d829b
	['meta.style.imba style.property.operator','#b37bb6']
	['meta.style.imba punctuation.separator.key-value.css','#b37bb6']
	
	# markdown
	# ['entity.name.section.markdown','#ffffff']
	['markup.fenced_code.block.markdown','#77b3d1']

	['punctuation.definition.list_item','#6d829b']
	['markup.heading.markdown','#ffffff']
	['markup.heading.1.markdown','#ffffff']
	['markup.heading.2.markdown','#e0ade3']
	['markup.inline.raw.string.markdown','#77b3d1']
	['markup.underline.link',colors.blue200]
	['markup.quote.markdown',colors.gray400,'italic']
	
	
	
	# ['meta.tagtree string.quoted',colors.string]
	# ['meta.import punctuation.definition.block',colors.keyword]
	# ['meta.import punctuation.separator.comma',colors.keyword]
]