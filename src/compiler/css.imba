var Stylis = require('../../vendor/stylis')
var selparser = require('../../vendor/css-selector-parser')
var cssparser = Stylis.new(compress: false,semicolons: false)

var context = null

var def rewriteSelector str
	var sel = selparser.parse(str)

	var rule = sel:rule
	while rule
		break if !rule:rule

		if rule:rule:nestingOperator == '>>>'
			rule:rule:nestingOperator = null
			break

		rule = rule:rule

	if rule
		rule:classNames = [].concat(rule:classNames or []).concat([context])

	return selparser.render(sel)

var def plugin context, content, selectors, parent, line, column, length

	if context == 2
		for selector,i in selectors
			selectors[i] = rewriteSelector(selector)
		return content
	return content

cssparser.use(plugin)


export def compile css, o = {}
	context = o:scope
	return cssparser('',css)
