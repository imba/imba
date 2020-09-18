var tags = "a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strike,strong,style,sub,summary,sup,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr".split(',')
var svgTags = "a,animate,animateMotion,animateTransform,audio,canvas,circle,clipPath,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,iframe,image,line,linearGradient,marker,mask,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,script,set,stop,style,svg,switch,symbol,text,textPath,title,tspan,unknown,use,video,view".split(',')
var html = {}
var code = {}
var types = []
var mapping = {}

def emit typ,el,svg
	if typ == Node
		return

	if html[typ.name]
		return html[typ.name]

	let supr = typ.prototype.__proto__.constructor
	let up = emit(supr,el,svg)
	let schema = html[typ.name] = {name: typ.name}

	if up
		schema.up = up.nr

	let nr = types.push(schema)
	schema.nr = nr - 1

	unless schema.idl
		let descriptors = Object.getOwnPropertyDescriptors(typ.prototype)
		let idl = schema.idl = {}
		for own name,desc of descriptors
			continue unless desc.enumerable && desc.configurable
			continue unless desc.get && (svg or desc.set)
			try
				if svg
					if el[name] and el[name].baseVal
						idl[name] = 1
				else
					el[name] = ""
					let attr = el.attributes[0]
					if attr
						idl[name] = attr.name == name ? 1 : attr.name
						el.removeAttribute(attr.name)
	return schema

for typ in tags
	let el = document.createElement(typ)
	let schema = emit(el.constructor,el) # html[name] ||= {tags: [], up: supr.name}
	mapping[typ] = schema.nr

for typ in svgTags
	let el = document.createElementNS("http://www.w3.org/2000/svg",typ)	
	let schema = emit(el.constructor,el,true) # html[name] ||= {tags: [], up: supr.name}
	# schema.tags.push(typ)
	mapping['svg_' + typ] = schema.nr

console.log types
console.log mapping

var code = ""

code += 'export const TYPES = {\n'
for part in types
	let name = part.name.replace('Element','') or '""'
	let idl = for own k,v of part.idl
		k + ': ' + (typeof v == 'string' ? "'{v}'" : v)
	code += "\t{name}: [{part.up || '-1'},\{{idl.join(',')}\}]" + '\n'
code += '}'

code += '\nexport const MAP = {\n'
for own name,ref of mapping
	# let idl = for own k,v of part.idl
	#	k + ': ' + (typeof v == 'string' ? "'{v}'" : v)
	if name == 'var'
		name = "'{name}'"
	code += "\t{name}:{ref}" + '\n'
code += '}\n'

code += '''
var keys = Object.keys(TYPES)
for typ,i in keys
	let item = TYPES[typ]
	item.up = TYPES[keys[item[0]]]

for own name,ref of MAP
	MAP[name] = TYPES[keys[ref]]

'''

console.log code
window.SCHEMA = code