const blue = .(bg:blue-200 color:blue-800 hover{color:blue-900 bg:blue-300})
const teal = .(bg:teal-200 color:teal-800 hover:teal-900 hover:bg-teal-300)


.(bgc:blue-200 fc:blue-800 hover{color:blue-900 bg:blue-300})
.(bgc:blue-200 fc:blue-800 hover{color:blue-900 bg:blue-300})

# 
.(bg-blue-200 text-blue-800 :hover{text-blue-900 bg-blue-300})

# current
.(bg-blue-200 text-blue-800 hover:text-blue-900 hover:bg-blue-300)

# proposed
.{bg:blue-200 text:blue-800 hover{text:blue-900 bg:blue-300})

.{bg:blue-200 text:blue-800 (.item:hover &){text:blue-900 bg:blue-300})

.{
	bg:blue-200
	text:blue-800
	.item:hover & {
		text:blue-900
		bg:blue-300
	}
}

.{
	bg:blue-200 text:blue-800
	border-top:1 solid blue-200
	.item:hover & {text:blue-900,bg:blue-300}
}

.{bg:blue-200,text:blue-800,hover{text:blue-900,bg:blue-300})
.{bg:blue-200;text:blue-800;hover{text:blue-900;bg:blue-300})

.{bg-blue-200 text-blue-800 hover:text-blue-900 hover:bg-blue-300})

.(bg-blue-200 text-blue-800 .item:hover{text-blue-900 bg-blue-300})
.(bg-blue-200 text-blue-800 hover-item{text-blue-900 bg-blue-300})
.(bg-blue-200,text-blue-800,hover-item{text-blue-900 bg-blue-300})

# use | to add scopes
# does not work well with multiple styles in subscope
.(bgc:blue-200/50 fc:blue-800 hover|md|color:blue-900 hover|bg:blue-300)

.(bgc:blue-200/50 fc:blue-800 :hover(color:blue-900 bg:blue-300))

.(bgc:blue-200/50 fc:blue-800 .item:hover(color:blue-900 bg:blue-300))
.(bgc:blue-200/50 fc:blue-800 .item:hover-item(color:blue-900 bg:blue-300))

.(bgc:blue-200/50 fc:blue-800 hover-item(color:blue-900))
.(bgc:blue-200/50 fc:blue-800 hover(color:blue-900))

# merged
.(bgc:blue-200/50 fc:blue-800 hover|(color:blue-900 bg:blue-300))

	<span.(text-xs hover-item:underline)> "subtitle"
	<span.{text:xs,hover-item { underline })> "subtitle"

### ideas
Use 
###

###

p  padding
px padding-left + padding-right
py padding-top + padding-bottom
pt padding-top
pb padding-bottom
pr padding-right
pl padding-left

m  margin
mx margin-left + margin-right
my margin-top + margin-bottom
mt margin-top
mb margin-bottom
mr margin-right
ml margin-left

b - width/style/color

BORDERS
bc - border color
bs - border style
bw - border width

bt border top
bb border bottom
bl border left
br border right
bx border left+right
by border top+bottom

b(tblrxy)(csw)

# BACKGROUNDS
bgc - background color
bgp - background pos
bgr - background repeat

# text
fs - font size
fc - font color
fi - font italicize
fw - font weight

td - text decoration

###